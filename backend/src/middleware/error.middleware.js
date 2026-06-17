export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;

  if (err.name === "CastError" || err.name === "ValidationError") {
    statusCode = 400;
  }

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
