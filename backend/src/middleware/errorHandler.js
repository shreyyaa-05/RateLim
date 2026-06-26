const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log the error stack in development/test or if it is a 500 error
  if (process.env.NODE_ENV !== 'production' || statusCode === 500) {
    console.error(`[Error Handler] ${statusCode} - ${message}`);
    if (err.stack) {
      console.error(err.stack);
    }
  }

  const responseBody = {
    status: 'error',
    statusCode,
    message,
  };

  // Expose stack trace only in development mode
  if (process.env.NODE_ENV === 'development') {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};

export default errorHandler;
