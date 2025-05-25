const rateLimit = require("express-rate-limit");
const { logger } = require("../utils/logger");

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  handler: (req, res) => {
    logger.warn("Rate limit exceeded:", {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      status: "error",
      message: "Too many requests from this IP, please try again later.",
    });
  },
});

// Stricter limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many login attempts, please try again later.",
  handler: (req, res) => {
    logger.warn("Auth rate limit exceeded:", {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      status: "error",
      message: "Too many login attempts, please try again later.",
    });
  },
});

// Stricter limiter for Twilio webhooks
const twilioWebhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per windowMs
  message: "Too many webhook requests, please try again later.",
  handler: (req, res) => {
    logger.warn("Twilio webhook rate limit exceeded:", {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      status: "error",
      message: "Too many webhook requests, please try again later.",
    });
  },
});

module.exports = { apiLimiter, authLimiter, twilioWebhookLimiter };
