const { Router } = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const boardStore = require("../store/boardStore");

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const boards = await boardStore.listBoardsForUser(req.user);
    res.json(boards);
  })
);

router.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "name is required" });
    }
    const board = await boardStore.createBoard(name.trim());
    res.status(201).json(board);
  })
);

router.get(
  "/:boardId",
  asyncHandler(async (req, res) => {
    if (req.user.role !== "ADMIN") {
      const isMember = await boardStore.isBoardMember(req.user.id, req.params.boardId);
      if (!isMember) return res.status(403).json({ error: "Not assigned to this board" });
    }

    const board = await boardStore.getBoard(req.params.boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });
    res.json(board);
  })
);

router.delete(
  "/:boardId",
  requireAdmin,
  asyncHandler(async (req, res) => {
    await boardStore.deleteBoard(req.params.boardId);
    res.status(204).end();
  })
);

module.exports = router;
