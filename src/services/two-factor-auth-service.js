const crypto = require("crypto");
const otplib = require("otplib");
const ApiError = require("../exceptions/api-error");

class TwoFactorAuthService {
  constructor() {
    this.algorithm = "aes-256-gcm";
    this.ivLength = 12;
    this.tokenLength = 6;
    this.step = 30; // 30 seconds
  }

  generateSecret() {
    return otplib.generateSecret();
  }

  getOtpAuthUrl({ email, secret, appName }) {
    if (!email) {
      throw ApiError.BadRequest("Email is required to generate the QR URL");
    }

    if (!secret) {
      throw ApiError.BadRequest("Secret is required to generate the QR URL");
    }

    const issuer = appName || process.env.TWO_FACTOR_APP_NAME || "CloudReads";
    
    return otplib.generateURI({
      label: email,
      issuer,
      secret,
      encoding: "ascii",
    });
  }

  generateSetupData({ email, appName }) {
    const secret = this.generateSecret();
    const otpauthUrl = this.getOtpAuthUrl({ email, secret, appName });
    return { secret, otpauthUrl };
  }

  getEncryptionKey() {
    const rawKey = process.env.TWO_FACTOR_ENCRYPTION_KEY;

    if (!rawKey) {
      throw ApiError.InternalServerError(
        "2FA encryption key is not configured",
      );
    }

    return crypto.createHash("sha256").update(rawKey).digest();
  }

  encryptSecret(secret) {
    if (!secret) {
      throw ApiError.BadRequest("Secret is required for encryption");
    }

    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(
      this.algorithm,
      this.getEncryptionKey(),
      iv,
    );

    const encrypted = Buffer.concat([
      cipher.update(secret, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
  }

  decryptSecret(encryptedSecret) {
    if (!encryptedSecret) {
      throw ApiError.BadRequest("2FA is not configured for this user");
    }

    const parts = String(encryptedSecret).split(":");

    // Backward compatibility for previously stored plaintext secrets.
    if (parts.length !== 3) {
      return String(encryptedSecret);
    }

    try {
      const [ivBase64, authTagBase64, encryptedBase64] = parts;
      const iv = Buffer.from(ivBase64, "base64");
      const authTag = Buffer.from(authTagBase64, "base64");
      const encrypted = Buffer.from(encryptedBase64, "base64");

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.getEncryptionKey(),
        iv,
      );
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString("utf8");
    } catch (error) {
      throw ApiError.InternalServerError("Failed to decrypt 2FA secret");
    }
  }

  verifyToken({ token, secret }) {
    if (!secret) {
      throw ApiError.BadRequest("2FA is not configured for this user");
    }

    const normalizedToken = String(token).trim();
    if (!normalizedToken) {
      throw ApiError.BadRequest("2FA code is required");
    }

    if (!/^\d{6}$/.test(normalizedToken)) {
      throw ApiError.BadRequest("2FA code must be a 6-digit number");
    }

    const isValid = otplib.verify({
      token: normalizedToken,
      secret,
      encoding: "ascii",
      step: this.step,
      digits: this.tokenLength,
      window: 1,
    });

    if (!isValid) {
      throw ApiError.BadRequest("Invalid 2FA code");
    }

    return true;
  }
}

module.exports = new TwoFactorAuthService();
