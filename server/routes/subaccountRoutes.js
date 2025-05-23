const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const prisma = require("../prisma");

// Get all subaccounts
router.get("/", authMiddleware.verifyToken, async (req, res) => {
  try {
    const subaccounts = await prisma.subaccount.findMany({
      where: { userId: req.user.uid },
      include: {
        interactions: true,
      },
    });

    res.json({ success: true, data: subaccounts });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch subaccounts" });
  }
});

// Create subaccount
router.post("/", authMiddleware.verifyToken, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const subaccount = await prisma.subaccount.create({
      data: {
        name,
        email,
        phone,
        userId: req.user.uid,
      },
    });

    res.json({ success: true, data: subaccount });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to create subaccount" });
  }
});

// Update subaccount
router.put("/:id", authMiddleware.verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const subaccount = await prisma.subaccount.update({
      where: {
        id,
        userId: req.user.uid,
      },
      data: { name, email, phone },
    });

    res.json({ success: true, data: subaccount });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to update subaccount" });
  }
});

// Delete subaccount
router.delete("/:id", authMiddleware.verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.subaccount.delete({
      where: {
        id,
        userId: req.user.uid,
      },
    });

    res.json({ success: true, message: "Subaccount deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to delete subaccount" });
  }
});

module.exports = router;
