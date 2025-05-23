const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const prisma = require("../prisma");

// Get user profile
router.get("/profile", authMiddleware.verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.uid },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch user profile" });
  }
});

// Update user profile
router.put("/profile", authMiddleware.verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.uid },
      data: { name, email },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to update user profile" });
  }
});

module.exports = router;
