const { Router } = require("express");
const { signToken } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const prisma = require("../prismaClient");

const router = Router();

// Logging in with a name that already exists reuses that user's id, so
// organization/board membership stays stable across sessions. No password —
// same lightweight feel as before, just persistent instead of per-login.
router.post("/login", asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  const trimmedName = name.trim();

  let user;
  try {
    user = await prisma.user.create({ data: { name: trimmedName } });
  } catch (err) {
    if (err.code === "P2002") {
      user = await prisma.user.findUniqueOrThrow({ where: { name: trimmedName } });
    } else {
      throw err;
    }
  }

  const token = signToken({ id: user.id, name: user.name });
  res.json({ token, user: { id: user.id, name: user.name } });
}));

module.exports = router;
