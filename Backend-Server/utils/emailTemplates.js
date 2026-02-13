/**
 * Email Templates for SourceToLive
 * Centralized location for all email HTML templates
 */

const config = require('../config');

const generateOTPEmailHTML = (firstName, otp) => {
    const clientUrl = config.FRONTEND_URL || 'http://localhost:5173';
    return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <title>Verify Your Email - SourceToLive</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
            padding: 20px;
            margin: 0;
            width: 100% !important;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
        }
        .header {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            padding: 40px 30px 30px;
            text-align: center;
            border-bottom: 1px solid #e8eef7;
        }
        .logo {
            max-width: 180px;
            height: auto;
            margin: 0 auto 20px;
            display: block;
        }
        .header-title {
            font-size: 26px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 8px;
            letter-spacing: -0.6px;
        }
        .header-subtitle {
            font-size: 12px;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .content {
            padding: 50px 35px;
        }
        .greeting {
            font-size: 15px;
            color: #334155;
            margin-bottom: 20px;
            line-height: 1.7;
            font-weight: 500;
        }
        .greeting strong {
            color: #3B7DC3;
            font-weight: 700;
        }
        .description {
            font-size: 13.5px;
            color: #64748b;
            line-height: 1.8;
            margin-bottom: 40px;
            font-weight: 400;
        }
        .otp-container {
            background: #ffffff;
            border-radius: 10px;
            padding: 20px 30px;
            margin-bottom: 40px;
            text-align: center;
            border: 2px solid #e2e8f0;
            position: relative;
        }
        .otp-container::before {
            display: none;
        }
        .otp-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #64748b;
            margin-bottom: 14px;
            font-weight: 700;
            position: relative;
            z-index: 1;
        }
        .otp-code {
            font-size: 48px;
            font-weight: 800;
            color: #3B7DC3;
            letter-spacing: 12px;
            font-family: 'Courier New', monospace;
            padding: 18px;
            background: #f8fafc;
            border-radius: 8px;
            margin-bottom: 14px;
            border: 1px solid #e2e8f0;
            position: relative;
            z-index: 1;
            text-shadow: none;
            white-space: nowrap;
            overflow-x: auto;
        }
        .otp-timer {
            font-size: 12px;
            color: #64748b;
            font-weight: 600;
            position: relative;
            padding-top: 8px;
            z-index: 1;
        }
        .action-section {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 28px;
            border-radius: 10px;
            margin-bottom: 35px;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #4CAF50;
        }
        .action-title {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 14px;
            letter-spacing: -0.3px;
        }
        .action-steps {
            font-size: 13px;
            color: #475569;
            line-height: 1.9;
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .action-steps li {
            margin-bottom: 8px;
            font-weight: 500;
        }
        .security-box {
            background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
            padding: 18px;
            border-radius: 10px;
            margin-bottom: 25px;
            border: 1px solid #bfdbfe;
            border-left: 4px solid #3B7DC3;
        }
        .security-title {
            font-size: 11px;
            font-weight: 700;
            color: #3B7DC3;
            text-transform: uppercase;
            margin-bottom: 7px;
            letter-spacing: 0.8px;
        }
        .security-text {
            font-size: 13px;
            color: #334155;
            line-height: 1.7;
            font-weight: 500;
        }
        .footer {
            background: #f8fafc;
            padding: 28px 35px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-text {
            font-size: 12px;
            color: #64748b;
            line-height: 1.7;
            font-weight: 500;
        }
        .footer-link {
            color: #3B7DC3;
            text-decoration: none;
            font-weight: 600;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 30px 0;
        }
        
        /* Gmail and Mobile Responsive Styles */
        @media only screen and (max-width: 600px) {
            body {
                padding: 10px !important;
            }
            .container {
                width: 100% !important;
                max-width: 100% !important;
                border-radius: 8px !important;
            }
            .header {
                padding: 30px 20px 25px !important;
            }
            .logo {
                max-width: 140px !important;
                margin-bottom: 15px !important;
            }
            .header-title {
                font-size: 22px !important;
                letter-spacing: -0.4px !important;
            }
            .header-subtitle {
                font-size: 11px !important;
            }
            .content {
                padding: 35px 20px !important;
            }
            .greeting {
                font-size: 14px !important;
            }
            .description {
                font-size: 13px !important;
                margin-bottom: 30px !important;
            }
            .otp-container {
                padding: 18px 15px !important;
                margin-bottom: 30px !important;
            }
            .otp-code {
                font-size: 36px !important;
                letter-spacing: 8px !important;
                padding: 14px 10px !important;
            }
            .otp-label {
                font-size: 10px !important;
                margin-bottom: 12px !important;
            }
            .otp-timer {
                font-size: 11px !important;
            }
            .action-section {
                padding: 20px !important;
                margin-bottom: 25px !important;
            }
            .action-title {
                font-size: 13px !important;
                margin-bottom: 12px !important;
            }
            .action-steps {
                font-size: 12px !important;
            }
            .action-steps li {
                margin-bottom: 6px !important;
            }
            .security-box {
                padding: 15px !important;
                margin-bottom: 20px !important;
            }
            .security-title {
                font-size: 10px !important;
            }
            .security-text {
                font-size: 12px !important;
            }
            .footer {
                padding: 25px 20px !important;
            }
            .footer-text {
                font-size: 11px !important;
            }
            .divider {
                margin: 25px 0 !important;
            }
        }
        
        @media only screen and (max-width: 400px) {
            .otp-code {
                font-size: 32px !important;
                letter-spacing: 6px !important;
                padding: 12px 8px !important;
            }
        }
        
        /* Gmail App Specific Fixes */
        u + .body {
            width: 100% !important;
        }
    </style>
</head>
<body class="body" style="margin: 0; padding: 20px; width: 100%;">
    <div class="container">
        <!-- Header -->
        <div class="header">
            <img src="${clientUrl}/S2L.png" class="logo" style="max-width: 180px; height: auto; display: block; margin: 0 auto 20px; border: 0;">
            <h1 class="header-title">Verify Your Email</h1>
            <p class="header-subtitle">Secure Verification Code</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Hi <strong>${firstName}</strong>,
                <div style="margin-top: 10px;">Welcome to <strong>SourceToLive</strong> — let's deploy with confidence.</div>
            </div>

            <p class="description">
                To complete your account setup and unlock the full power of our platform, please verify your email address using the secure code below.
            </p>

            <!-- OTP Section -->
            <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div class="otp-timer">⏱ Expires in 3 minutes</div>
            </div>

            <!-- Next Steps -->
            <div class="action-section">
                <div class="action-title">Getting Started</div>
                <ul class="action-steps">
                    <li>✓ Copy the verification code above</li>
                    <li>✓ Return to the signup page</li>
                    <li>✓ Enter the code to verify your email</li>
                    <li>✓ Create your password and get started</li>
                </ul>
            </div>

            <!-- Security Notice -->
            <div class="security-box">
                <div class="security-title">� Security & Privacy</div>
                <div class="security-text">This code is for your eyes only. Never share it with anyone, and SourceToLive support will <strong>never</strong> ask you for it.</div>
            </div>

            <div class="divider"></div>

            <p class="description" style="margin-bottom: 15px; font-size: 13px;">
                Questions? Visit our <a href="https://sourcetolive.dev/docs" class="footer-link">documentation</a> or reach out to our support team at <a href="mailto:contact.sourcetolive@gmail.com" class="footer-link">contact.sourcetolive@gmail.com</a>
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                © 2026 SourceToLive. All rights reserved. | <a href="https://sourcetolive.dev" class="footer-link">Visit our website</a><br>
                <span style="display: block; margin-top: 10px; font-size: 11px; color: #94a3b8;">
                    This is an automated message from SourceToLive. Please don't reply to this email.
                </span>
            </p>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = {
    generateOTPEmailHTML,
};
