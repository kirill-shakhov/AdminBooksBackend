const uuid = require("uuid");
const crypto = require("crypto");

class EmailTokenService {
    hashToken(token) {
        return crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
    }

    generateToken() {
        const token = uuid.v4();
        const tokenHash = this.hashToken(token);
        return { token, tokenHash };
    }
}

module.exports = new EmailTokenService();