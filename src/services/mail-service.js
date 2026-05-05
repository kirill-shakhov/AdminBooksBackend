const { Resend } = require("resend");
const config = require("../config/config");
const buildActivationEmail = require("../utils/email-templates/activation-template");

const resend = new Resend(config.resendApiKey);

class MailService {
  async sendActivationMail(to, link) {
    try {
      const { html, text } = buildActivationEmail(link);

      const { data, error } = await resend.emails.send({
        from: config.resendFrom,
        to,
        subject: "Account activation",
        html,
        text,
      });

      if (error) {
        console.error("Resend error:", error);
        throw new Error("Failed to send activation email");
      }

      return data;
    } catch (err) {
      console.error("Unexpected email error:", err);
      throw err;
    }
  }
}

module.exports = new MailService();