require("dotenv").config();
const express = require("express");
const cors = require("cors");
const prisma = require("./prisma");
const { errorHandler } = require("./middleware/errorHandler");
const authMiddleware = require("./middleware/authMiddleware");
const websocketService = require("./services/websocketService");

// Import routes
const callRoutes = require("./routes/callRoutes");
const voiceAgentRoutes = require("./routes/voiceAgentRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const userRoutes = require("./routes/userRoutes");
const subaccountRoutes = require("./routes/subaccountRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Protected routes with authentication middleware
app.use("/api/calls", authMiddleware.verifyToken, callRoutes);
app.use("/api/voice-agent", authMiddleware.verifyToken, voiceAgentRoutes);
app.use("/api/interviews", authMiddleware.verifyToken, interviewRoutes);
app.use("/api/users", authMiddleware.verifyToken, userRoutes);
app.use("/api/subaccounts", authMiddleware.verifyToken, subaccountRoutes);
app.use("/api/analytics", authMiddleware.verifyToken, analyticsRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize WebSocket server
websocketService.initialize(server);

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
