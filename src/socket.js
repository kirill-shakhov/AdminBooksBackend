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

  socketService.init(io);

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    const user = socketService.handleConnection(socket);
    if (!user) return;

    const alreadyOnline = socketService.checkUserInList(user.id);
    socketService.addOnlineUser(user.id);
    if (!alreadyOnline) {
      io.emit(SOCKET_EVENTS.USER_ONLINE, { userId: user.id });
    }

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      socketService.handleDisconnect(socket, user.id);
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
