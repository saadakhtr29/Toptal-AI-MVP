// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error
  let statusCode = 500;
  let message = "Internal Server Error";
  let errorCode = "INTERNAL_ERROR";

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
    errorCode = "VALIDATION_ERROR";
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized access";
    errorCode = "UNAUTHORIZED";
  } else if (err.name === "ForbiddenError") {
    statusCode = 403;
    message = "Forbidden access";
    errorCode = "FORBIDDEN";
  } else if (err.name === "NotFoundError") {
    statusCode = 404;
    message = err.message || "Resource not found";
    errorCode = "NOT_FOUND";
  } else if (err.name === "ConflictError") {
    statusCode = 409;
    message = err.message;
    errorCode = "CONFLICT";
  } else if (err.name === "RateLimitError") {
    statusCode = 429;
    message = "Too many requests";
    errorCode = "RATE_LIMIT";
  }

  // Handle Prisma errors
  if (err.code) {
    switch (err.code) {
      case "P2002":
        statusCode = 409;
        message = "Unique constraint violation";
        errorCode = "UNIQUE_CONSTRAINT";
        break;
      case "P2025":
        statusCode = 404;
        message = "Record not found";
        errorCode = "RECORD_NOT_FOUND";
        break;
      case "P2014":
        statusCode = 400;
        message = "Invalid ID";
        errorCode = "INVALID_ID";
        break;
      case "P2003":
        statusCode = 400;
        message = "Foreign key constraint violation";
        errorCode = "FOREIGN_KEY_CONSTRAINT";
        break;
    }
  }

  // Handle Twilio errors
  if (err.code && err.code.startsWith("TWILIO_")) {
    statusCode = 400;
    message = err.message;
    errorCode = err.code;
  }

  // Handle Google Cloud errors
  if (err.code && err.code.startsWith("GOOGLE_")) {
    statusCode = 400;
    message = err.message;
    errorCode = err.code;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack,
        details: err,
      }),
    },
  });
};

// Custom error classes
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = "ForbiddenError";
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictError";
  }
}

class RateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = "RateLimitError";
  }
}

module.exports = {
  errorHandler,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
};
