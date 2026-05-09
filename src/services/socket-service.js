const tokenService = require("./token-service");

class SocketService {
  constructor() {
    // key: userId, value: { userId, email }
    this.onlineUsers = new Map();
  }

  addOnlineUser(userId, email) {
    this.onlineUsers.set(userId, { userId, email });
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
      return user;
    } catch (e) {
      console.log(`Socket ${socket.id} unauthorized: ${e.message}`);
      socket.disconnect();
      return null;
    }
  }
}

module.exports = new SocketService();
