const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// small util
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

// Build explicit Gmail SMTP profiles (SSL 465, then STARTTLS 587)
function gmailProfiles() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;
    const common = {
        name: 'localhost',    // EHLO name
        family: 4,            // IPv4
        logger: true,         // enable internal logging
        debug: true           // SMTP traffic debug
    };
    return [
        {
            label: 'gmail-ssl-465',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            ...common,
            connectionTimeout: 12000,
            greetingTimeout: 10000,
            socketTimeout: 20000,
            auth: { user, pass },
            tls: { servername: 'smtp.gmail.com' }
        },
        {
            label: 'gmail-starttls-587',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            ...common,
            connectionTimeout: 12000,
            greetingTimeout: 10000,
            socketTimeout: 20000,
            auth: { user, pass },
            tls: { servername: 'smtp.gmail.com' }
        }
    ];
}

function buildTransporters() {
    const service = (process.env.EMAIL_SERVICE || 'gmail').toLowerCase();
    if (service === 'gmail') {
        const profiles = gmailProfiles();
        return profiles.map(p => ({ profile: p, transporter: nodemailer.createTransport(p) }));
    }
    // Generic fallback (single)
    return [{
        profile: { service: process.env.EMAIL_SERVICE, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD } },
        transporter: nodemailer.createTransport({ service: process.env.EMAIL_SERVICE, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }, logger: true, debug: true })
    }];
}

function hasResend() {
    return !!process.env.RESEND_API_KEY;
}

async function sendViaResend(mailOptions) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = mailOptions.from || process.env.EMAIL_FROM || `noreply@${(process.env.APP_DOMAIN || 'example.com').replace(/^https?:\/\//,'')}`;
    console.log('📨 Using Resend fallback to send email');
    const { data, error } = await resend.emails.send({
        from,
        to: Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to],
        subject: mailOptions.subject,
        text: mailOptions.text,
        html: mailOptions.html || `<pre>${(mailOptions.text || '').replace(/</g,'&lt;')}</pre>`
    });
    if (error) throw new Error(`Resend send failed: ${error.message || error}`);
    return { messageId: data?.id || `resend-${Date.now()}` };
}

// Create email transporter(s)
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  Email credentials not found. Using mock email service for development.');

    const mockEmails = [];
    const mockTransporter = {
        sendMail: async (mailOptions) => {
            console.log('\n📧 Mock Email Sent:');
            console.log('To:', mailOptions.to);
            console.log('Subject:', mailOptions.subject);
            console.log('Body:', mailOptions.text);
            const otpMatch = mailOptions.text.match(/OTP.*?(\d{6})/);
            const otp = otpMatch ? otpMatch[1] : null;
            mockEmails.push({ to: mailOptions.to, subject: mailOptions.subject, text: mailOptions.text, otp, timestamp: new Date() });
            return { messageId: 'mock-' + Date.now() };
        },
        isUsingMockService: () => true,
        getSentEmails: () => mockEmails,
        getLatestOTP: (email) => { const emailData = mockEmails.filter(e => e.to === email).pop(); return emailData ? emailData.otp : null; }
    };
    module.exports = mockTransporter;
} else {
    const transports = buildTransporters();

    // Verify each transporter in the background (non-blocking)
    (async () => {
        for (const t of transports) {
            try {
                await t.transporter.verify();
                console.log(`📮 Mail transporter verified: ${t.profile.label || 'default'}`);
            } catch (err) {
                console.error(`❗ Transport verify failed for ${t.profile.label || 'default'}:`, err && err.message);
            }
        }
    })();

    // sendMail with automatic failover and retry/backoff (+ Resend fallback)
    async function sendMailWithFailover(mailOptions) {
        let lastError;
        const transientCodes = new Set([421, 'EPROTOCOL', 'ETIMEDOUT']);
        for (const t of transports) {
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    console.log(`✉️  SMTP ${t.profile.label || 'default'} attempt ${attempt}/3`);
                    return await t.transporter.sendMail({
                        from: mailOptions.from || process.env.EMAIL_USER,
                        ...mailOptions,
                    });
                } catch (err) {
                    lastError = err;
                    const code = err && (err.responseCode || err.code);
                    const msg = err && err.message;
                    const isTransient = transientCodes.has(code) || /Try again later|GREETING|timeout/i.test(msg || '');
                    console.error(`❌ sendMail failed on ${t.profile.label || 'default'} (attempt ${attempt}):`, msg);
                    if (attempt < 3 && isTransient) {
                        const delay = attempt * 1500; // 1.5s, 3s
                        console.warn(`⏳ Transient SMTP error. Retrying in ${delay}ms...`);
                        await wait(delay);
                        continue;
                    }
                    break;
                }
            }
            console.warn('🔁 Switching to next SMTP profile...');
        }
        // If all SMTP attempts failed and we have Resend, use it
        if (hasResend()) {
            try {
                return await sendViaResend(mailOptions);
            } catch (resendErr) {
                lastError = resendErr;
            }
        }
        throw lastError;
    }

    module.exports = {
        sendMail: sendMailWithFailover,
        isUsingMockService: () => false
    };
}
