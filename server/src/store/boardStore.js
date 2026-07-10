const { randomUUID } = require("crypto");
const prisma = require("../prismaClient");

const columnInclude = {
  columns: {
    orderBy: { position: "asc" },
    include: { cards: { orderBy: { position: "asc" } } },
  },
};

// Reshapes Prisma's relational rows into the { id, columns, cards } shape
// the socket layer and frontend already expect.
function serializeBoard(board) {
  const cards = {};
  const columns = board.columns.map((column) => {
    column.cards.forEach((card) => {
      cards[card.id] = {
        id: card.id,
        title: card.title,
        createdAt: card.createdAt.getTime(),
      };
    });
    return {
      id: column.id,
      title: column.title,
      cardIds: column.cards.map((card) => card.id),
    };
  });

  return { id: board.id, columns, cards };
}

// Two concurrent first-visits to the same board can both reach here at
// once (e.g. React StrictMode double-invoking effects, or two users
// opening a fresh board link at the same time). Prisma's upsert isn't
// guaranteed atomic against that race, so on a unique-constraint hit we
// just read back the row the other request already created.
async function seedBoard(boardId) {
  try {
    return await prisma.board.upsert({
      where: { id: boardId },
      update: {},
      create: {
        id: boardId,
        columns: {
          create: [
            { title: "To Do", position: 0 },
            { title: "In Progress", position: 1 },
            { title: "Done", position: 2 },
          ],
        },
      },
      include: columnInclude,
    });
  } catch (err) {
    if (err.code === "P2002") {
      return prisma.board.findUniqueOrThrow({
        where: { id: boardId },
        include: columnInclude,
      });
    }
    throw err;
  }
}

async function getBoard(boardId) {
  const board =
    (await prisma.board.findUnique({
      where: { id: boardId },
      include: columnInclude,
    })) || (await seedBoard(boardId));

  return serializeBoard(board);
}

async function createCard(boardId, columnId, title) {
  const position = await prisma.card.count({ where: { columnId } });
  const card = await prisma.card.create({
    data: { id: randomUUID(), columnId, title, position },
  });
  return { id: card.id, title: card.title, createdAt: card.createdAt.getTime() };
}

// Re-numbers every card in the affected column(s) to match the dragged
// order, so position stays a clean 0..n-1 sequence regardless of history.
async function moveCard(boardId, cardId, fromColumnId, toColumnId, toIndex) {
  await prisma.$transaction(async (tx) => {
    const fromCards = await tx.card.findMany({
      where: { columnId: fromColumnId },
      orderBy: { position: "asc" },
    });

    const fromIds = fromCards.map((c) => c.id).filter((id) => id !== cardId);

    let toIds;
    if (fromColumnId === toColumnId) {
      toIds = fromIds;
    } else {
      const toCards = await tx.card.findMany({
        where: { columnId: toColumnId },
        orderBy: { position: "asc" },
      });
      toIds = toCards.map((c) => c.id);
    }

    const insertAt = Math.max(0, Math.min(toIndex, toIds.length));
    toIds.splice(insertAt, 0, cardId);

    const updates = [];
    if (fromColumnId !== toColumnId) {
      fromIds.forEach((id, index) =>
        updates.push(tx.card.update({ where: { id }, data: { position: index } }))
      );
    }
    toIds.forEach((id, index) => {
      const data = { position: index };
      if (id === cardId) data.columnId = toColumnId;
      updates.push(tx.card.update({ where: { id }, data }));
    });

    await Promise.all(updates);
  });
}

async function deleteCard(boardId, cardId) {
  await prisma.card.delete({ where: { id: cardId } });
}

module.exports = {
  getBoard,
  createCard,
  moveCard,
  deleteCard,
};
