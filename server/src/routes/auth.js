const { Router } = require("express");
const bcrypt = require("bcryptjs");
const { signToken } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const prisma = require("../prismaClient");

const router = Router();

function toPublicUser(user) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

// No self-signup — accounts are provisioned by the Admin (or, for the one
// Admin account itself, via the create-admin script). This just verifies
// credentials against an existing row.
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(toPublicUser(user));
    res.json({ token, user: toPublicUser(user) });
  })
);

module.exports = router;
