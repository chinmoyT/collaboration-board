const { Server } = require("socket.io");
const { socketAuth } = require("../middleware/auth");
const { registerBoardHandlers } = require("./boardHandlers");

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`socket connected: ${socket.id} (user: ${socket.user?.name})`);
    registerBoardHandlers(io, socket);
  });

  return io;
}

module.exports = { initSocket };
