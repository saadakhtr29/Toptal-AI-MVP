const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Import routes
const twilioRoutes = require("./routes/twilioRoutes");
const callRoutes = require("./routes/callRoutes");

// Use routes
app.use("/api/twilio", twilioRoutes);
app.use("/api/calls", callRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
