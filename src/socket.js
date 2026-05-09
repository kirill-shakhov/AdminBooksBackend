const { Server } = require("socket.io");
const config = require("./config/config");
const socketService = require("./services/socket-service");
const { SOCKET_EVENTS } = require("./constants/socket-events.constants");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
    },
  });

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    const user = socketService.handleConnection(socket);
    if (!user) return;

    socketService.addOnlineUser(user.id, user.email);
    io.emit(SOCKET_EVENTS.USER_ONLINE, { userId: user.id, email: user.email });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`Socket disconnected: ${socket.id}`);
      socketService.removeOnlineUser(user.id);
      io.emit(SOCKET_EVENTS.USER_OFFLINE, {
        userId: user.id,
        email: user.email,
      });
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error(
      "Socket.IO is not initialized. Call initSocket(server) first.",
    );
  }

  return io;
}

module.exports = {
  initSocket,
  getIO,
};
