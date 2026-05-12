import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import './config/index.js';

import configureCors from './utils/cors.js';
import errorHandler from './middleware/errorHandler.js';

import indexRouter from './routes/indexRoute.js';
import studentsRouter from './routes/studentsRoute.js';
import usersRouter from './routes/usersRoute.js';
import reportsRouter from './routes/reportsRoute.js';
import applicationsRouter from './routes/applicationsRoute.js';
import countriesRouter from './routes/countriesRoute.js';
import universitiesRouter from './routes/universitiesRoute.js';
import coursesRouter from './routes/coursesRoute.js';
import partnersRouter from './routes/partnersRoute.js';
import partnerPortalRouter from './routes/partnerPortalRoute.js';
import mcpRouter from './routes/mcpRoute.js';
import ocrRouter from './routes/ocrRoute.js';
import whatsappRouter from './routes/whatsappRoute.js';

const app = express();

const startServer = async () => {
  await connectDB(); // Ensure DB is connected before starting the server

  // Dev-only logging
  if (process.env.NODE_ENV === 'development') {
    const { default: morgan } = await import('morgan');
    app.use(morgan('dev'));
  }

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    console.log(`
    ========================================
    🚀 Server is running
    Port: ${PORT}
    URL: http://localhost:${PORT}
    API: http://localhost:${PORT}/api
    ========================================
    `);
  });
};

// Start the server
startServer();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(configureCors());

// Routes
app.use('/api', indexRouter);
app.use('/api/students', studentsRouter);
app.use('/api/users', usersRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/countries', countriesRouter);
app.use('/api/universities', universitiesRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/partners', partnersRouter);
app.use('/api/partner-portal', partnerPortalRouter);
app.use('/api/mcp', mcpRouter);
app.use('/api/ocr', ocrRouter);
app.use('/api/whatsapp', whatsappRouter);

// Error Handler Middleware (Keep at the End)
app.use(errorHandler);

export default app;
