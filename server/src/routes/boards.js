const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const boardStore = require("../store/boardStore");

const router = Router();

router.get("/:boardId", requireAuth, async (req, res) => {
  const board = await boardStore.getBoard(req.params.boardId);
  res.json(board);
});

module.exports = router;
