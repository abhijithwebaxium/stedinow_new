import cors from 'cors';

const configureCors = () => {
  const allowedOrigins = [
    'https://stedinow-new.vercel.app',
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
  ].filter(Boolean);

  return cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
};

export default configureCors;
