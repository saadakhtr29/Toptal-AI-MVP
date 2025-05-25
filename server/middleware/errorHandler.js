const { ValidationError } = require("sequelize");
const { logger } = require("../utils/logger");

class AppError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

const errorHandler = (err, req, res, next) => {
  logger.error("Error:", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      status: "error",
      message: "Validation Error",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Handle Twilio errors
  if (err.name === "TwilioError") {
    return res.status(400).json({
      status: "error",
      message: "Twilio API Error",
      details: err.message,
    });
  }

  // Handle Google Cloud errors
  if (err.name === "GoogleCloudError") {
    return res.status(500).json({
      status: "error",
      message: "Google Cloud API Error",
      details: err.message,
    });
  }

  // Default error
  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { AppError, errorHandler, notFoundHandler, asyncHandler };
