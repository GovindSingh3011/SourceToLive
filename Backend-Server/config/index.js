const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const parseList = (envVar) => {
  const v = process.env[envVar];
  if (!v) return [];
  return v.split(',').map((s) => s.trim()).filter(Boolean);
};

module.exports = {
  PORT: Number(process.env.PORT || 3000),
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  CLUSTER: process.env.CLUSTER || '',
  TASK: process.env.TASK || '',
  AWS_SUBNETS: parseList('AWS_SUBNETS'),
  AWS_SECURITY_GROUPS: parseList('AWS_SECURITY_GROUPS'),
  APP_DOMAIN: process.env.APP_DOMAIN || 'localhost:8000',
  S3_BUCKET: process.env.S3_BUCKET,
};
