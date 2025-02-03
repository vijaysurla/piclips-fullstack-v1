import express from 'express';
import searchRoutes from './routes/search';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import config from './config';
import userRoutes from './routes/users';
import videoRoutes from './routes/videos';
import videoTestRoutes from "./routes/videos-test"
import { User, UserDocument } from './models/schemas';
import path from 'path';

declare module 'express-session' {
  interface SessionData {
    user?: UserDocument;
    accessToken?: string;
  }
}

const app = express();

const allowedOrigins = [
  'https://pi-clips-frontend-651048061269.us-east1.run.app', //Cloud Run URL
  'http://localhost:3000', //Local frontend
  'https://piclips.com',   // Production frontend
  'https://testnet.piclips.com' // Testnet frontend
];

// Connect to MongoDB
mongoose.connect(config.mongodb.uri, {
  user: config.mongodb.username,
  pass: config.mongodb.password,
  dbName: 'piclips'
})
.then(() => {
  console.log('Connected to MongoDB');
  console.log('Database:', mongoose.connection.db?.databaseName || 'Unknown');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// CORS configuration
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('Incoming request origin:', origin);
  console.log('Allowed origins:', allowedOrigins);

  if (origin && allowedOrigins.includes(origin)) {
    console.log('Origin is allowed, setting CORS headers');
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    console.log('Origin is not allowed');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return res.status(200).end();
  }
  
  next();
});

// Body parser configuration with increased limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure session secret is set
if (!config.sessionSecret) {
  console.error('SESSION_SECRET is not set in the environment variables');
  process.exit(1);
}

// Session configuration
app.use(
  (session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
  }) as unknown) as express.RequestHandler
);

// Increase timeout for requests
app.use((req, res, next) => {
  res.setTimeout(300000, () => {
    console.log('Request has timed out.');
    res.status(408).send('Request has timed out.');
  });
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use("/api/videos-test", videoTestRoutes) // New test route
// Add the search route to your Express app
app.use('/api/search', searchRoutes);

// Add the test CORS route here
app.get('/api/test-cors', (req, res) => {
  res.json({ message: 'CORS is working' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const port = config.port;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

export default app;