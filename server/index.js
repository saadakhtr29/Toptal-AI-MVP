require("dotenv").config();
const express = require("express");
const cors = require("cors");
const prisma = require("./prisma");
const { errorHandler } = require("./middleware/errorHandler");
const authMiddleware = require("./middleware/authMiddleware");
const websocketService = require("./services/websocketService");
const http = require("http");
const sequelize = require("./config/database");

// Import routes
const callRoutes = require("./routes/callRoutes");
const voiceAgentRoutes = require("./routes/voiceAgentRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const userRoutes = require("./routes/userRoutes");
const subaccountRoutes = require("./routes/subaccountRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize WebSocket server
websocketService.initialize(server);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Webhook routes (no authentication)
app.use("/api/calls", callRoutes);

// Protected routes with authentication middleware
app.use("/api/voice-agent", authMiddleware.verifyToken, voiceAgentRoutes);
app.use("/api/interviews", authMiddleware.verifyToken, interviewRoutes);
app.use("/api/users", authMiddleware.verifyToken, userRoutes);
app.use("/api/subaccounts", authMiddleware.verifyToken, subaccountRoutes);
app.use("/api/analytics", authMiddleware.verifyToken, analyticsRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1); // Exit if we can't connect to the database
  }
});

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully...");

  // Close WebSocket connections
  websocketService.close();

  // Close HTTP server
  server.close(() => {
    console.log("HTTP server closed");
  });

  // Close Prisma connection
  await prisma.$disconnect();
  console.log("Prisma connection closed");

  process.exit(0);
});

module.exports = { app, server };
