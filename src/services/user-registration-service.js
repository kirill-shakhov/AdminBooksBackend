const bcrypt = require("bcryptjs");
const uuid = require("uuid");

const UserDto = require("../dtos/user-dto");
const ApiError = require("../exceptions/api-error");

const User = require("../models/User");
const Role = require("../models/Role");
const EmailToken = require("../models/EmailToken");
const { getIO } = require("../socket");
const { SOCKET_EVENTS } = require("../constants/socket-events.constants");

const MailService = require("./mail-service");
const s3Service = require("./s3Service");
const EmailTokenService = require("./email-token-service");
const tokenService = require("./token-service");
const socketService = require("./socket-service");

const { EMAIL_TOKEN_TTL_MS } = require("../constants/email-token.constants");

const generateActivationLink = require("../utils/generateActivationLink");

class UserRegistrationService {
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

    let user;

    try {
      user = new User({
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
      await this.sendActivationEmail(user);

      const userPayload = {
        ...user.toObject(),
        isOnline: socketService.checkUserInList(user._id),
      };
      getIO().emit(SOCKET_EVENTS.NEW_USER, userPayload);
    } catch (error) {
      await Promise.allSettled([
        user ? this.deleteActivationTokens(user._id) : Promise.resolve(),
        user ? User.deleteOne({ _id: user._id }) : Promise.resolve(),
      ]);

      throw ApiError.InternalServerError(
        "Registration failed. Please try again.",
      );
    }
  }

  async activate(token) {
    const tokenHash = EmailTokenService.hashToken(token);

    const emailToken = await EmailToken.findOne({
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!emailToken) {
      throw ApiError.BadRequest("Activation link is invalid or expired");
    }

    const user = await User.findById(emailToken.userId);

    if (!user) {
      throw ApiError.NotFound("User not found");
    }

    user.isActivated = true;
    await user.save();

    await EmailToken.deleteOne({ _id: emailToken._id });

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async resendActivation(email) {
    const user = await User.findOne({ email });

    if (!user) {
      throw ApiError.NotFound("User not found");
    }

    if (user.isActivated) {
      throw ApiError.Conflict("User is already activated");
    }

    await this.deleteActivationTokens(user._id);
    await this.sendActivationEmail(user);
  }

  async deleteActivationTokens(userId) {
    await EmailToken.deleteMany({ userId });
  }

  async sendActivationEmail(user) {
    const emailVerificationTokens = EmailTokenService.generateToken();

    const emailToken = new EmailToken({
      userId: user._id,
      tokenHash: emailVerificationTokens.tokenHash,
      used: false,
      expiresAt: new Date(Date.now() + EMAIL_TOKEN_TTL_MS),
    });

    await emailToken.save();

    const activationUrl = generateActivationLink(emailVerificationTokens.token);
    await MailService.sendActivationMail(user.email, activationUrl);

    return emailToken;
  }
}

module.exports = new UserRegistrationService();
