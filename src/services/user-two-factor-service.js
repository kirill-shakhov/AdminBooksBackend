const UserDto = require("../dtos/user-dto");
const ApiError = require("../exceptions/api-error");

const User = require("../models/User");

const tokenService = require("./token-service");
const twoFactorAuthService = require("./two-factor-auth-service");

class UserTwoFactorService {
  async setupTwoFactor(userId, appName) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.NotFound("User not found");
    }

    const { secret, otpauthUrl } = twoFactorAuthService.generateSetupData({
      email: user.email,
      appName,
    });

    user.twoFactorTempSecret = twoFactorAuthService.encryptSecret(secret);

    await user.save();

    return {
      otpauthUrl,
    };
  }

  async enableTwoFactor(userId, token) {
    const user = await User.findById(userId).select("+twoFactorTempSecret");

    if (!user) {
      throw ApiError.NotFound("User not found");
    }

    if (user.twoFactorEnabled) {
      throw ApiError.Conflict("2FA is already enabled");
    }

    const decryptedTempSecret = twoFactorAuthService.decryptSecret(
      user.twoFactorTempSecret,
    );

    twoFactorAuthService.verifyToken({
      token,
      secret: decryptedTempSecret,
    });

    user.twoFactorEnabled = true;
    user.twoFactorSecret =
      twoFactorAuthService.encryptSecret(decryptedTempSecret);
    user.twoFactorTempSecret = null;
    await user.save();

    return {
      twoFactorEnabled: true,
    };
  }

  async disableTwoFactor(userId, token) {
    const user = await User.findById(userId).select("+twoFactorSecret");

    const decryptedSecret = twoFactorAuthService.decryptSecret(
      user.twoFactorSecret,
    );

    twoFactorAuthService.verifyToken({
      token,
      secret: decryptedSecret,
    });

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorTempSecret = null;

    await user.save();

    return {
      twoFactorEnabled: false,
    };
  }

  async verifyTwoFactorToken(userId, token) {
    const user = await User.findById(userId).select("+twoFactorSecret");

    if (!user) {
      throw ApiError.NotFound("User not found");
    }

    if (!user.twoFactorEnabled) {
      throw ApiError.BadRequest("2FA is not enabled for this user");
    }

    if (!user.twoFactorSecret) {
      throw ApiError.InternalServerError(
        "2FA secret is not configured for this user",
      );
    }

    twoFactorAuthService.verifyToken({
      token,
      secret: twoFactorAuthService.decryptSecret(user.twoFactorSecret),
    });

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }
}

module.exports = new UserTwoFactorService();
