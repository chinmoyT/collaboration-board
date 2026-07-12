const boardStore = require("../store/boardStore");
const presenceStore = require("../store/presenceStore");

function boardRoom(boardId) {
  return `board:${boardId}`;
}

// Admins can act on any board; end users only on boards they're assigned
// to. Checked from socket.user (server-verified at handshake), never from
// client-supplied data, so a client can't just claim access to a board.
async function isAuthorized(socket, boardId) {
  if (socket.user.role === "ADMIN") return true;
  return boardStore.isBoardMember(socket.user.id, boardId);
}

function registerBoardHandlers(io, socket) {
  socket.on("board:join", async (boardId, ack) => {
    try {
      if (!(await isAuthorized(socket, boardId))) {
        if (typeof ack === "function") ack({ error: "Not assigned to this board" });
        return;
      }

      const board = await boardStore.getBoard(boardId);
      if (!board) {
        if (typeof ack === "function") ack({ error: "Board not found" });
        return;
      }

      socket.join(boardRoom(boardId));
      socket.data.boardId = boardId;

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
      if (!(await isAuthorized(socket, boardId))) {
        if (typeof ack === "function") ack({ ok: false, error: "Not assigned to this board" });
        return;
      }
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
        if (!(await isAuthorized(socket, boardId))) {
          if (typeof ack === "function") ack({ ok: false, error: "Not assigned to this board" });
          return;
        }
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
      if (!(await isAuthorized(socket, boardId))) {
        if (typeof ack === "function") ack({ ok: false, error: "Not assigned to this board" });
        return;
      }
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
