function buildActivationEmail(link) {
  return {
    html: `
  <div style="margin:0; padding:40px 16px; background:#f9fafb; font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#111827;">
    <div style="max-width:384px; margin:0 auto; text-align:center;">
      <div style="margin-bottom:14px;">
        <span style="display:inline-block; width:70px; height:70px;">
          <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CloudReads logo">
            <rect x="1" y="1" width="68" height="68" rx="10" fill="#4f46e5"/>
            <path d="M21 40.5C21 35.5294 25.0294 31.5 30 31.5C30.3332 31.5 30.6622 31.5181 30.9858 31.5531C32.4303 27.8502 36.0274 25.25 40.25 25.25C45.7438 25.25 50.2 29.7062 50.2 35.2C50.2 35.3499 50.1967 35.4991 50.1902 35.6475C52.3872 36.6927 53.9 38.9314 53.9 41.5C53.9 45.0773 51.0098 47.9675 47.4325 47.9675H30.1C25.0742 47.9675 21 43.8933 21 38.8675V40.5Z" fill="#ffffff"/>
          </svg>
        </span>
      </div>

      <h1 style="margin:0; font-size:24px; line-height:1.25; font-weight:700; letter-spacing:-0.02em; color:#111827;">
        Welcome to CloudReads
      </h1>

      <div style="margin-top:24px; background:#ffffff; border:1px solid #e5e7eb; border-radius:16px; box-shadow:0 10px 30px rgba(17,24,39,0.08); text-align:left; overflow:hidden;">
        <div style="padding:24px;">
          <p style="margin:0 0 14px; font-size:14px; line-height:1.6; color:#111827;">
            Thanks for joining CloudReads. Confirm your email to activate your account and start managing your library.
          </p>

          <p style="margin:0 0 18px; font-size:14px; line-height:1.6; color:#4b5563;">
            For security, this activation link expires soon.
          </p>

          <div style="text-align:center; margin:0 0 20px;">
            <a href="${link}" style="display:inline-block; background:#4f46e5; color:#ffffff; text-decoration:none; border-radius:8px; padding:10px 18px; font-size:14px; font-weight:600; line-height:1.2;">
              Activate account
            </a>
          </div>

          <div style="background:#f0fdf4; border-radius:8px; padding:12px 14px; margin:0 0 18px;">
            <p style="margin:0; font-size:12px; line-height:1.5; color:#166534;">
              Your account will be available right after email confirmation.
            </p>
          </div>

          <div style="border-top:1px solid #e5e7eb; padding-top:14px;">
            <p style="margin:0 0 8px; font-size:12px; line-height:1.5; color:#6b7280;">
              If the button does not work, copy and paste this URL into your browser:
            </p>
            <p style="margin:0; font-size:12px; line-height:1.5; word-break:break-all;">
              <a href="${link}" style="color:#4f46e5; text-decoration:underline;">
                ${link}
              </a>
            </p>
          </div>
        </div>
      </div>

      <p style="margin:16px 0 0; font-size:12px; line-height:1.5; color:#6b7280;">
        If you did not create a CloudReads account, you can safely ignore this email.
      </p>
    </div>
  </div>
`,
    text: [
      "Welcome to CloudReads",
      "",
      "Thanks for joining CloudReads.",
      "Confirm your email to activate your account and start managing your library.",
      "",
      "For security, this activation link expires soon.",
      "",
      "Activation link:",
      link,
      "",
      "If you did not create a CloudReads account, you can safely ignore this email.",
    ].join("\n"),
  };
}

module.exports = buildActivationEmail;