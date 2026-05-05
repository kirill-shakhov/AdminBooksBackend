const isProduction = process.env.NODE_ENV === "production";

const clientUrl = isProduction
    ? process.env.CLIENT_URL_PROD 
    : process.env.CLIENT_URL_LOCAL
    
module.exports = {
    secret: "SECRET_KEY_RANDOM",
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    resendApiKey: process.env.RESEND_API_KEY || "",
    resendFrom: process.env.RESEND_FROM || "onboarding@resend.dev",
    clientUrl,
}