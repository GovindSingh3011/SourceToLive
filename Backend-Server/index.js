const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const fs = require('fs/promises');
const mongoose = require('mongoose');
const os = require('os');
const config = require('./config');
const projectRouter = require('./routes/project');
const authRoutes = require('./routes/authRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Enable CORS
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = (config.CORS_ORIGIN ?? '').split(',').map(o => o.trim()).filter(Boolean);

    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return next();
  }
  next(err);
});

app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/project', projectRouter);
app.use('/api/webhook', webhookRoutes);

app.get('/api/api-documentation', async (req, res) => {
  try {
    const docPath = path.resolve(__dirname, '../Docs/API_DOCUMENTATION.md');
    const content = await fs.readFile(docPath, 'utf8');
    return res.status(200).json({ content });
  } catch (error) {
    console.error('API documentation route error:', error.message);
    return res.status(404).json({ message: 'API documentation not found' });
  }
});

app.get('/api/app-documentation', async (req, res) => {
  try {
    const docPath = path.resolve(__dirname, '../Docs/APP_DOCUMENTATION.md');
    const content = await fs.readFile(docPath, 'utf8');
    return res.status(200).json({ content });
  } catch (error) {
    console.error('App documentation route error:', error.message);
    return res.status(404).json({ message: 'App documentation not found' });
  }
});

// Generic error handler
app.use((err, req, res, next) => {
  // Ignore JSON parse errors from empty bodies
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Get local network IP address dynamically
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const port = config.PORT || 3000;
const networkIP = getLocalIP();

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server Running`);
  console.log(`   Local:   http://localhost:${port}`);
  console.log(`   Network: http://${networkIP}:${port}`);
});
