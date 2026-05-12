export const globalErrorHandler = (err, req, res, next) => {
  let { statusCode = 500, message } = err;
  
  if (process.env.NODE_ENV === 'production') {
    // Send minimal error info in production
    res.status(statusCode).json({
      status: 'error',
      message: err.isOperational ? message : 'Something went wrong'
    });
  } else {
    // Send detailed error in development
    res.status(statusCode).json({
      status: 'error',
      message,
      stack: err.stack
    });
  }
};