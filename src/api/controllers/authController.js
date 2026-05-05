// AdminBooksBackend > src > api > controllers > authController.js

const User = require("../../models/User");
const { validationResult } = require("express-validator");
const userService = require("../../services/user-service");
const ApiError = require("../../exceptions/api-error");
const { setRefreshTokenCookie } = require("../../utils/auth-cookie-utils");
const QRCode = require("qrcode");

class authController {
  async checkUserExists(req, res, next) {
    try {
      const { username } = req.body;

      const userByUsername = await User.findOne({ username });

      if (userByUsername) return res.status(200).json({ exists: true });

      return res.status(200).json({ exists: false });
    } catch (e) {
      next(e);
    }
  }

  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: "Registration validation failed", errors });
      }

      await userService.registration(req);
      return res.status(204).send();
    } catch (e) {
      next(e);
    }
  }

  async activate(req, res, next) {
    try {
      const token = (req.params && req.params.token) || (req.query && req.query.token);

      if (!token) {
        throw ApiError.BadRequest("Activation token is required");
      }

      const userData = await userService.activate(token);

      setRefreshTokenCookie(res, userData.refreshToken);

      return res.status(200).json({
        ...userData,
      });
    } catch (e) {
      next(e);
    }
  }

  async resendActivation(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        throw ApiError.BadRequest("Email is required");
      }

      await userService.resendActivation(email);
      return res.status(200).json({ message: "Activation email resent" });
    } catch (e) {
      next(e);
    }
    
  }

  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      const userData = await userService.login({ username, password });
      
      if (!userData.twoFactorRequired) {
        setRefreshTokenCookie(res, userData.refreshToken);
      }

      return res.status(200).json({
        ...userData,
      });
    } catch (e) {
      next(e);
    }
  }

  async getUsers(req, res) {
    try {
      const users = await User.find();
      res.json(users);
    } catch (e) {}
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie("refreshToken");
      return res.json(token);
    } catch (e) {
      next(e);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      const userData = await userService.refresh(refreshToken);

      setRefreshTokenCookie(res, userData.refreshToken);

      return res.json({ ...userData });
    } catch (e) {
      next(e);
    }
  }

  async loginWithGoogle(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: "Google token is required" });
      }

      const userData = await userService.loginWithGoogle(token);

      if (!userData.twoFactorRequired) {
        setRefreshTokenCookie(res, userData.refreshToken);
      }

      return res.status(200).json({ ...userData });
    } catch (e) {
      next(e);
    }
  }

  async setupTwoFactor(req, res, next) {
    try {
      const userId = req.user && req.user.id;

      if (!userId) {
        throw ApiError.UnauthorizedError();
      }

      const { appName } = req.body || {};
      const { otpauthUrl } = await userService.setupTwoFactor(userId, appName);

      // Generate QR code from otpauthUrl and convert to base64
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
      const qrCodeBase64 = qrCodeDataUrl.split(",")[1];

      return res.status(200).json({
        qrCodeBase64,
        twoFactorEnabled: false,
      });
    } catch (e) {
      next(e);
    }
  }

  async enableTwoFactor(req, res, next) {
    try {
      const userId = req.user && req.user.id;

      if (!userId) {
        throw ApiError.UnauthorizedError();
      }

      const body = req.body || {};
      const code = body.code;
      const result = await userService.enableTwoFactor(userId, code);

      return res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  async disableTwoFactor(req, res, next) {
    try {
      const userId = req.user && req.user.id;

      if (!userId) {
        throw ApiError.UnauthorizedError();
      }

      const body = req.body || {};
      const code = body.code;
      console.log("Received code for disabling 2FA:", code);
      const result = await userService.disableTwoFactor(userId, code);

      return res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  async verifyTwoFactorToken(req, res, next) {
    try {
      console.log("Verifying 2FA token with temp user:", req.tempUser);
      const userId = req.tempUser && req.tempUser.userId;

      if (!userId) {
        throw ApiError.UnauthorizedError();
      }

      const body = req.body || {};
      const code = body.code;
      const result = await userService.verifyTwoFactorToken(userId, code);

      setRefreshTokenCookie(res, result.refreshToken);

      return res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

}

module.exports = new authController();
