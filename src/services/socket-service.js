const tokenService = require("./token-service");
const { SOCKET_EVENTS } = require("../constants/socket-events.constants");

class SocketService {
  constructor() {
    // key: userId, value: { userId, timerId }
    this.onlineUsers = new Map();
    this.io = null;
  }

  init(io) {
    this.io = io;
  }

  addOnlineUser(userId) {
    const normalizedId = String(userId);
    if (!this.onlineUsers.has(normalizedId)) {
      this.onlineUsers.set(normalizedId, {
        userId: normalizedId,
        timerId: null,
      });
    }
  }

  checkUserInList(userId) {
    return this.onlineUsers.has(userId);
  }

  getOnlineUser(userId) {
    return this.onlineUsers.get(userId);
  }

  scheduleOffline(userId) {
    const normalizedId = String(userId);
    const user = this.onlineUsers.get(normalizedId);
    if (!user) return;

    user.timerId = setTimeout(() => {
      this.removeOnlineUser(normalizedId);
      this.io?.emit(SOCKET_EVENTS.USER_OFFLINE, { userId: normalizedId });
    }, 30000);
  }

  handleDisconnect(socket, userId) {
    console.log(`Socket disconnected: ${socket.id}`);
    this.scheduleOffline(userId);
  }

  removeOnlineUser(userId) {
    this.onlineUsers.delete(userId);
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

      // If user reconnects before scheduleOffline fires — cancel the timer
      const existing = this.onlineUsers.get(String(user.id));
      if (existing?.timerId) {
        clearTimeout(existing.timerId);
        existing.timerId = null;
      }

      return user;
    } catch (e) {
      console.log(`Socket ${socket.id} unauthorized: ${e.message}`);
      socket.disconnect();
      return null;
    }
  }
}

module.exports = new SocketService();
