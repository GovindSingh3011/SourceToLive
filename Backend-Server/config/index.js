const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const parseList = (envVar) => {
  const v = process.env[envVar];
  if (!v) return [];
  return v.split(',').map((s) => s.trim()).filter(Boolean);
};

module.exports = {
  // Server Configuration
  PORT: Number(process.env.PORT || 3000),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // MongoDB Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/sourcetolive',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-in-production',

  // Email Configuration
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@sourcetolive.app',

  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',

  // GitHub OAuth Configuration
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // AWS Configuration
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  CLUSTER: process.env.CLUSTER || '',
  TASK: process.env.TASK || '',
  AWS_SUBNETS: parseList('AWS_SUBNETS'),
  AWS_SECURITY_GROUPS: parseList('AWS_SECURITY_GROUPS'),
  APP_DOMAIN: process.env.APP_DOMAIN || 'localhost:8000',
  BASE_PATH: process.env.BASE_PATH || '',
  S3_BUCKET: process.env.S3_BUCKET,

  // CloudWatch Configuration
  CLOUDWATCH_LOG_GROUP: process.env.CLOUDWATCH_LOG_GROUP || '/aws/sourcetolive/app',
  CLOUDWATCH_LOG_STREAM: process.env.CLOUDWATCH_LOG_STREAM || 'backend-server',

  // API Configuration
  API_URL: process.env.API_URL,
};
