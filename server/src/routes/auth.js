const { Router } = require("express");
const { randomUUID } = require("crypto");
const { signToken } = require("../middleware/auth");

const router = Router();

// Stub login: real Phase-3 version checks a users table + hashed password.
// For now, any name creates/reuses a stable-looking session token so the
// frontend can build the auth flow against a real contract.
router.post("/login", (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }

  const user = { id: randomUUID(), name: name.trim() };
  const token = signToken(user);
  res.json({ token, user });
});

module.exports = router;
