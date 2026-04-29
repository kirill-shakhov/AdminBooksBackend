const User = require("../models/User");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const Role = require("../models/Role");
const UserDto = require("../dtos/user-dto");
const tokenService = require("./token-service");
const twoFactorAuthService = require("./two-factor-auth-service");
const ApiError = require("../exceptions/api-error");
const s3Service = require("./s3Service");
const { OAuth2Client } = require("google-auth-library");
const config = require("../config/config");

const googleClient = new OAuth2Client(config.googleClientId);

class UserService {
  async registration(req) {
    const { username, password, firstName, lastName, email } = req.body;
    const candidate = await User.findOne({ username });

    if (candidate) {
      throw ApiError.BadRequest(`User ${username} already exists`);
    }

    const hashPassword = await bcrypt.hashSync(password, 7);
    const activationLink = uuid.v4();
    const userRole = await Role.findOne({ value: "USER" });
    let imageS3 = "";

    if (req.file) {
      const response = await s3Service.uploadFileToS3(req.file, "avatars");
      console.log(response);
      imageS3 = response.href;
    }

    const user = new User({
      username,
      password: hashPassword,
      email,
      image: imageS3,
      firstName,
      lastName,
      activationLink,
      roles: [userRole.value],
    });

    await user.save();

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

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

    if (user.twoFactorEnabled) {
      const tempToken = tokenService.generateTempToken({ userId: user._id, type: "2fa" });
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

  async updateUserByAdmin(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
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
    }

    if (user.twoFactorEnabled) {
      const tempToken = tokenService.generateTempToken({ userId: user._id, type: "2fa" });
      return { twoFactorRequired: true, tempToken };
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

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
    user.twoFactorSecret = twoFactorAuthService.encryptSecret(decryptedTempSecret);
    user.twoFactorTempSecret = null;
    await user.save();

    return {
      twoFactorEnabled: true,
    };
  }

  async disableTwoFactor(userId, token) {
  const user = await User.findById(userId).select("+twoFactorSecret");

  const decryptedSecret = twoFactorAuthService.decryptSecret(user.twoFactorSecret);

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

    if(!user.twoFactorEnabled) {
      throw ApiError.BadRequest("2FA is not enabled for this user");
    }

    if(!user.twoFactorSecret) {
      throw ApiError.InternalServerError("2FA secret is not configured for this user");
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

module.exports = new UserService();
