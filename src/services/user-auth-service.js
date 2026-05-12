const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const uuid = require("uuid");

const UserDto = require("../dtos/user-dto");
const ApiError = require("../exceptions/api-error");
const config = require("../config/config");

const User = require("../models/User");
const Role = require("../models/Role");
const { getIO } = require("../socket");
const { SOCKET_EVENTS } = require("../constants/socket-events.constants");
const socketService = require("./socket-service");

const tokenService = require("./token-service");

const googleClient = new OAuth2Client(config.googleClientId);

class UserAuthService {
  async login({ username, password }) {
    const user = await User.findOne({ username });

    if (!user) {
      throw ApiError.BadRequest(`User ${username} was not found`, [
        { field: "username" },
      ]);
    }

    const validPassword = await bcrypt.compareSync(password, user.password);

    if (!validPassword) {
      throw ApiError.BadRequest("Invalid password", [{ field: "password" }]);
    }

    if (!user.isActivated) {
      throw ApiError.Forbidden("Account is not activated");
    }

    if (user.twoFactorEnabled) {
      const tempToken = tokenService.generateTempToken({
        userId: user._id,
        type: "2fa",
      });
      return { twoFactorRequired: true, tempToken };
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }

    const user = await User.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async loginWithGoogle(token) {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      const userRole = await Role.findOne({ value: "USER" });
      user = new User({
        username: email,
        password: uuid.v4(),
        email,
        firstName: given_name || "",
        lastName: family_name || "",
        image: picture || "",
        isActivated: true,
        roles: [userRole.value],
      });
      await user.save();

      const userPayload = {
        ...user.toObject(),
        isOnline: socketService.checkUserInList(user._id),
      };
      getIO().emit(SOCKET_EVENTS.NEW_USER, userPayload);
    }

    if (user.twoFactorEnabled) {
      const tempToken = tokenService.generateTempToken({
        userId: user._id,
        type: "2fa",
      });
      return { twoFactorRequired: true, tempToken };
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }
}

module.exports = new UserAuthService();
