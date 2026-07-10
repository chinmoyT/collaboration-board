const boardStore = require("../store/boardStore");
const presenceStore = require("../store/presenceStore");

function boardRoom(boardId) {
  return `board:${boardId}`;
}

function registerBoardHandlers(io, socket) {
  socket.on("board:join", async (boardId, ack) => {
    try {
      socket.join(boardRoom(boardId));
      socket.data.boardId = boardId;

      const board = await boardStore.getBoard(boardId);
      const presence = presenceStore.join(boardId, socket.id, {
        id: socket.user.id,
        name: socket.user.name,
      });

      socket.to(boardRoom(boardId)).emit("presence:update", presence);
      if (typeof ack === "function") ack({ board, presence });
    } catch (err) {
      if (typeof ack === "function") ack({ error: err.message });
    }
  });

  socket.on("board:leave", (boardId) => {
    socket.leave(boardRoom(boardId));
    const presence = presenceStore.leave(boardId, socket.id);
    io.to(boardRoom(boardId)).emit("presence:update", presence);
  });

  socket.on("card:create", async ({ boardId, columnId, title }, ack) => {
    try {
      const card = await boardStore.createCard(boardId, columnId, title);
      io.to(boardRoom(boardId)).emit("card:created", { columnId, card });
      if (typeof ack === "function") ack({ ok: true, card });
    } catch (err) {
      if (typeof ack === "function") ack({ ok: false, error: err.message });
    }
  });

  socket.on(
    "card:move",
    async ({ boardId, cardId, fromColumnId, toColumnId, toIndex }, ack) => {
      try {
        await boardStore.moveCard(boardId, cardId, fromColumnId, toColumnId, toIndex);
        // Broadcast to everyone else — sender already applied it optimistically
        socket.to(boardRoom(boardId)).emit("card:moved", {
          cardId,
          fromColumnId,
          toColumnId,
          toIndex,
        });
        if (typeof ack === "function") ack({ ok: true });
      } catch (err) {
        if (typeof ack === "function") ack({ ok: false, error: err.message });
      }
    }
  );

  socket.on("card:delete", async ({ boardId, cardId }, ack) => {
    try {
      await boardStore.deleteCard(boardId, cardId);
      io.to(boardRoom(boardId)).emit("card:deleted", { cardId });
      if (typeof ack === "function") ack({ ok: true });
    } catch (err) {
      if (typeof ack === "function") ack({ ok: false, error: err.message });
    }
  });

  socket.on("disconnect", () => {
    const affectedBoards = presenceStore.leaveAll(socket.id);
    affectedBoards.forEach((boardId) => {
      io.to(boardRoom(boardId)).emit(
        "presence:update",
        presenceStore.getPresenceList(boardId)
      );
    });
  });
}

module.exports = { registerBoardHandlers };
