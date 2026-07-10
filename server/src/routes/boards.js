const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const boardStore = require("../store/boardStore");

const router = Router();

router.get(
  "/:boardId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const board = await boardStore.getBoard(req.params.boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });
    res.json(board);
  })
);

module.exports = router;
