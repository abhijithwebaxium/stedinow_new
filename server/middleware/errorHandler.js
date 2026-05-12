const errorHandler = (err, req, res, next) => {
  // Set default status code
  const statusCode = err.statusCode || 500;

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  } else {
    console.error('Error:', err.message);
  }

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
