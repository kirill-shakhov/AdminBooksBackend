const ApiError = require("../exceptions/api-error");

//models
const User = require("../models/User");

//services
const socketService = require("./socket-service");
const userAuthService = require("./user-auth-service");
const userTwoFactorService = require("./user-two-factor-service");
const userRegistrationService = require("./user-registration-service");
const { getIO } = require("../socket");
const { SOCKET_EVENTS } = require("../constants/socket-events.constants");

class UserService {
  async getAllUsers() {
    try {
      const users = await User.find();
      const onlineUsers = socketService.getOnlineUsers();

      return users.map((user) => {
        if (onlineUsers.has(String(user._id))) {
          return { ...user.toObject(), isOnline: true };
        }

        return { ...user.toObject(), isOnline: false };
      });
    } catch (e) {
      throw ApiError.InternalServerError("Failed to retrieve users");
    }
  }

  async registration(req) {
    return userRegistrationService.registration(req);
  }

  async login({ username, password }) {
    return userAuthService.login({ username, password });
  }

  async activate(token) {
    return userRegistrationService.activate(token);
  }

  async resendActivation(email) {
    return userRegistrationService.resendActivation(email);
  }

  async logout(refreshToken) {
    return userAuthService.logout(refreshToken);
  }

  async refresh(refreshToken) {
    return userAuthService.refresh(refreshToken);
  }

  async updateUserByAdmin(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async deleteUserByAdmin(userId) {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw ApiError.NotFound("User not found");
    }

    socketService.removeOnlineUser(userId);
    getIO().emit(SOCKET_EVENTS.USER_DELETED, { userId: String(userId) });

    return deletedUser;
  }

  async loginWithGoogle(token) {
    return userAuthService.loginWithGoogle(token);
  }

  async setupTwoFactor(userId, appName) {
    return userTwoFactorService.setupTwoFactor(userId, appName);
  }

  async enableTwoFactor(userId, token) {
    return userTwoFactorService.enableTwoFactor(userId, token);
  }

  async disableTwoFactor(userId, token) {
    return userTwoFactorService.disableTwoFactor(userId, token);
  }

  async verifyTwoFactorToken(userId, token) {
    return userTwoFactorService.verifyTwoFactorToken(userId, token);
  }
}

module.exports = new UserService();
