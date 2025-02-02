import dotenv from 'dotenv';

dotenv.config();

export default {
  sessionSecret: process.env.SESSION_SECRET || 'fallback_secret_key_for_development',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_for_development',
  piNetwork: {
    platformApiUrl: process.env.PLATFORM_API_URL || 'https://api.minepi.com',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost/piclips',
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  port: process.env.PORT || 5001,
};















