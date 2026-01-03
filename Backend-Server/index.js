const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
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
app.use(cors({
  origin: config.CORS_ORIGIN ? config.CORS_ORIGIN.split(',') : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Generic error handler
app.use((err, req, res, next) => {
  // Ignore JSON parse errors from empty bodies
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = config.PORT || 3000;
app.listen(port, () => {
  console.log(`Server Running on http://localhost:${port}`);
});
