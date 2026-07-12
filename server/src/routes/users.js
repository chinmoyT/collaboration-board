const { Router } = require("express");
const bcrypt = require("bcryptjs");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const prisma = require("../prismaClient");

const router = Router();

router.use(requireAuth, requireAdmin);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
      where: { role: "END_USER" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        memberships: { select: { boardId: true } },
      },
    });

    res.json(
      users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt,
        boardIds: u.memberships.map((m) => m.boardId),
      }))
    );
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: "email, name, and password are required" });
    }

    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email: email.trim().toLowerCase(),
          name: name.trim(),
          password: passwordHash,
          role: "END_USER",
        },
      });
      res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "A user with that email already exists" });
      }
      throw err;
    }
  })
);

router.delete(
  "/:userId",
  asyncHandler(async (req, res) => {
    const target = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!target) return res.status(404).json({ error: "User not found" });
    if (target.role === "ADMIN") {
      return res.status(403).json({ error: "Cannot delete the admin account" });
    }

    await prisma.user.delete({ where: { id: req.params.userId } });
    res.status(204).end();
  })
);

router.post(
  "/:userId/boards/:boardId",
  asyncHandler(async (req, res) => {
    try {
      await prisma.boardMember.create({
        data: { userId: req.params.userId, boardId: req.params.boardId },
      });
      res.status(201).json({ ok: true });
    } catch (err) {
      if (err.code === "P2002") {
        return res.json({ ok: true }); // already assigned — idempotent
      }
      if (err.code === "P2003") {
        return res.status(404).json({ error: "User or board not found" });
      }
      throw err;
    }
  })
);

router.delete(
  "/:userId/boards/:boardId",
  asyncHandler(async (req, res) => {
    await prisma.boardMember.deleteMany({
      where: { userId: req.params.userId, boardId: req.params.boardId },
    });
    res.status(204).end();
  })
);

module.exports = router;
