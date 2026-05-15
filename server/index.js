import express from 'express'; 
import { createServer } from 'http';
import { initSocket } from './utils/socket.js';
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
import studentPortalRouter from './routes/studentPortalRoute.js';
import notificationsRouter from './routes/notificationsRoute.js';

const app = express();
const server = createServer(app);
initSocket(server);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(configureCors());

// Serve uploaded documents
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    // Ensure browsers try to preview instead of forced download
    if (path.endsWith('.pdf') || path.endsWith('.jpg') || path.endsWith('.png') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// Routes
app.use('/api/students', studentsRouter); // Moved up to avoid conflict with /api
app.use('/api', indexRouter);
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
app.use('/api/student-portal', studentPortalRouter);
app.use('/api/notifications', notificationsRouter);

// Error Handler Middleware (Keep at the End)
app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 4000;

  server.listen(PORT, () => {
    console.log(`
    ========================================
    Real-Time Server is running
    Port: ${PORT}
    ========================================
    `);
  });
};

startServer();

export default app;
