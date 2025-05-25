const winston = require("winston");
const { format } = winston;

const { combine, timestamp, printf, colorize } = format;

// Custom format for logs
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "toptal-ai-mvp" },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat
      ),
    }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Create a stream object for Morgan
const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Export a function to log API requests
const logApiRequest = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("API Request", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
  });
  next();
};

// Export a function to log errors
const logError = (error, req) => {
  logger.error("Error occurred", {
    error: error.message,
    stack: error.stack,
    ...(req && {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    }),
  });
};

module.exports = { logger, stream, logApiRequest, logError };
