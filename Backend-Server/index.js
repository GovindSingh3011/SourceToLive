const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config');
const projectRouter = require('./routes/project');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Log email configuration on startup
console.log('📧 Email Configuration:');
console.log('  Service:', config.EMAIL_SERVICE || 'Not configured');
console.log('  User:', config.EMAIL_USER ? config.EMAIL_USER.substring(0, 3) + '***@' + config.EMAIL_USER.split('@')[1] : 'Not configured');
console.log('  Password:', config.EMAIL_PASSWORD ? '***configured***' : 'Not configured');
console.log('  From:', config.EMAIL_FROM || 'Not configured');
console.log('  Environment:', config.NODE_ENV || 'development');

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Enable CORS
app.use(cors({
  origin: config.CORS_ORIGIN ? config.CORS_ORIGIN.split(',') : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/project', projectRouter);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Backend Server is running',
    endpoints: {
      auth: '/api/auth',
      project: '/api/project'
    }
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        verify: 'POST /api/auth/register/verify',
        login: 'POST /api/auth/login',
        googleAuth: 'POST /api/auth/google'
      },
      project: {
        create: 'POST /api/project',
        streamLogs: 'GET /api/project/:projectId/logs/stream',
        archiveLogs: 'GET /api/project/:projectId/logs/archive'
      }
    }
  });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = config.PORT || 3000;
app.listen(port, () => {
  console.log(`Server Running on http://localhost:${port}`);
});
