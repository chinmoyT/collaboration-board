const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const prisma = require("../prismaClient");
const boardStore = require("../store/boardStore");

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const organizations = await prisma.organization.findMany({
      orderBy: { name: "asc" },
    });
    res.json(organizations);
  })
);

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "name is required" });
    }
    const trimmedName = name.trim();

    try {
      const organization = await prisma.organization.create({
        data: { name: trimmedName },
      });
      res.status(201).json(organization);
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "An organization with that name already exists" });
      }
      throw err;
    }
  })
);

router.get(
  "/:orgId/boards",
  requireAuth,
  asyncHandler(async (req, res) => {
    const boards = await prisma.board.findMany({
      where: { organizationId: req.params.orgId },
      orderBy: { createdAt: "asc" },
    });
    res.json(boards);
  })
);

router.post(
  "/:orgId/boards",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "name is required" });
    }

    try {
      const board = await boardStore.createBoard(req.params.orgId, name.trim());
      res.status(201).json(board);
    } catch (err) {
      if (err.code === "P2003") {
        return res.status(404).json({ error: "Organization not found" });
      }
      throw err;
    }
  })
);

module.exports = router;
