const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const boardStore = require("../store/boardStore");

const router = Router();

router.get("/:boardId", requireAuth, (req, res) => {
  const board = boardStore.getBoard(req.params.boardId);
  res.json(board);
});

module.exports = router;
