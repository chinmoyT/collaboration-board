const { randomUUID } = require("crypto");

// In-memory board store. Swap for Postgres/Mongo in Phase 3 —
// keep this module's function signatures the same so callers don't change.
const boards = new Map();

function seedBoard(boardId) {
  const board = {
    id: boardId,
    columns: [
      { id: "todo", title: "To Do", cardIds: [] },
      { id: "in-progress", title: "In Progress", cardIds: [] },
      { id: "done", title: "Done", cardIds: [] },
    ],
    cards: {},
  };
  boards.set(boardId, board);
  return board;
}

function getBoard(boardId) {
  return boards.get(boardId) || seedBoard(boardId);
}

function createCard(boardId, columnId, title) {
  const board = getBoard(boardId);
  const card = { id: randomUUID(), title, createdAt: Date.now() };
  board.cards[card.id] = card;

  const column = board.columns.find((c) => c.id === columnId);
  if (!column) throw new Error(`Unknown column: ${columnId}`);
  column.cardIds.push(card.id);

  return card;
}

function moveCard(boardId, cardId, fromColumnId, toColumnId, toIndex) {
  const board = getBoard(boardId);
  const fromColumn = board.columns.find((c) => c.id === fromColumnId);
  const toColumn = board.columns.find((c) => c.id === toColumnId);
  if (!fromColumn || !toColumn) throw new Error("Unknown column");

  fromColumn.cardIds = fromColumn.cardIds.filter((id) => id !== cardId);
  const insertAt = Math.max(0, Math.min(toIndex, toColumn.cardIds.length));
  toColumn.cardIds.splice(insertAt, 0, cardId);

  return board;
}

function deleteCard(boardId, cardId) {
  const board = getBoard(boardId);
  delete board.cards[cardId];
  board.columns.forEach((col) => {
    col.cardIds = col.cardIds.filter((id) => id !== cardId);
  });
  return board;
}

module.exports = {
  getBoard,
  createCard,
  moveCard,
  deleteCard,
};
