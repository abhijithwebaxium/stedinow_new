import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'ACCESS_TOKEN_SECRET', 'PORT'];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

console.log('✅ Environment variables loaded successfully');

export default {
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
  },
  server: {
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:5173',
  },
  aws: {
    bucketName: process.env.BUCKET_NAME,
    bucketRegion: process.env.BUCKET_REGION,
    accessKey: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  whatsapp: {
    token: process.env.WHATSAPP_TOKEN,
  },
  wati: {
    token: process.env.WATI_TOKEN,
    endpoint: process.env.WATI_API_ENDPOINT,
  },
  app: {
    url: process.env.URL || 'http://localhost:3000',
  },
};
