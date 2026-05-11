const tokenService = require("./token-service");
const { SOCKET_EVENTS } = require("../constants/socket-events.constants");

class SocketService {
  constructor() {
    this.onlineUsers = new Map();
    this.io = null;
  }

  init(io) {
    this.io = io;
  }

  addOnlineUser(userId, socketId) {
    const normalizedId = String(userId);
    
    if (!this.onlineUsers.has(normalizedId)) {
      this.onlineUsers.set(normalizedId, {
        userId: normalizedId,
        sockets: new Set(),
        timerId: null,
      });
    }

    const user = this.onlineUsers.get(normalizedId);
    if (user.timerId) {
      clearTimeout(user.timerId);
      user.timerId = null;
    }

    user.sockets.add(socketId);
  }

  checkUserInList(userId) {
    return this.onlineUsers.has(String(userId));
  }

  getOnlineUser(userId) {
    return this.onlineUsers.get(String(userId));
  }

  scheduleOffline(userId) {
    const normalizedId = String(userId);
    const user = this.onlineUsers.get(normalizedId);
    if (!user) return;
    if (user.timerId) return;

    user.timerId = setTimeout(() => {
      this.removeOnlineUser(normalizedId);
      this.io?.emit(SOCKET_EVENTS.USER_OFFLINE, { userId: normalizedId });
    }, 30000);
  }

  handleDisconnect(socket, userId) {
    console.log(`Socket disconnected: ${socket.id}`);
    const user = this.onlineUsers.get(String(userId));

    if (!user) return;
    if (!user.sockets.has(socket.id)) return;
    
    user.sockets.delete(socket.id);

    if (user.sockets.size === 0) {
      this.scheduleOffline(userId);
    }

  }

  removeOnlineUser(userId) {
    this.onlineUsers.delete(String(userId));
  }

  getOnlineUsers() {
    return this.onlineUsers;
  }

  verifyUser(token) {
    const userData = tokenService.validateAccessToken(token);
    if (!userData) {
      throw new Error("Unauthorized");
    }
    return userData;
  }

  handleConnection(socket) {
    const token = socket.handshake.auth.token;
    try {
      const user = this.verifyUser(token);
      console.log(`Socket connected: ${socket.id}`, user);

      return user;
    } catch (e) {
      console.log(`Socket ${socket.id} unauthorized: ${e.message}`);
      socket.disconnect();
      return null;
    }
  }
}

module.exports = new SocketService();
