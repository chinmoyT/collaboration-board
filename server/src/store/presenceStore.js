// Tracks which users are present on which board, per socket connection.
// In Phase 3 this moves to Redis so presence works across multiple server instances.
const boardPresence = new Map(); // boardId -> Map<socketId, userInfo>

function join(boardId, socketId, user) {
  if (!boardPresence.has(boardId)) boardPresence.set(boardId, new Map());
  boardPresence.get(boardId).set(socketId, user);
  return getPresenceList(boardId);
}

function leave(boardId, socketId) {
  if (!boardPresence.has(boardId)) return [];
  boardPresence.get(boardId).delete(socketId);
  if (boardPresence.get(boardId).size === 0) boardPresence.delete(boardId);
  return getPresenceList(boardId);
}

function leaveAll(socketId) {
  const affectedBoards = [];
  for (const [boardId, users] of boardPresence.entries()) {
    if (users.has(socketId)) {
      users.delete(socketId);
      affectedBoards.push(boardId);
      if (users.size === 0) boardPresence.delete(boardId);
    }
  }
  return affectedBoards;
}

function getPresenceList(boardId) {
  const users = boardPresence.get(boardId);
  return users ? Array.from(users.values()) : [];
}

module.exports = { join, leave, leaveAll, getPresenceList };
