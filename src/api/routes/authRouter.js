// AdminBooksBackend > src > api > routes > authRouter.js

const Router = require("express");
const upload = require("../../config/multerConfig");

const router = new Router();
const controller = require("../controllers/authController");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const multerErrorHandlerMiddleware = require("../../middleware/multerErrorHandlerMiddleware");
const validateRegistrationMiddleware = require("../../middleware/validateRegistrationMiddleware");
const verifyTempTokenMiddleware = require("../../middleware/verifyTempTokenMiddleware");

router.post(
  "/registration",
  upload.single("image"),
  multerErrorHandlerMiddleware,
  validateRegistrationMiddleware,
  controller.registration,
);

router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.get("/activate", controller.activate);
router.get("/activate/:token", controller.activate);
router.post("/resend-activation", controller.resendActivation);
router.get("/refresh", controller.refresh);

router.post("/check-user", controller.checkUserExists);

router.post("/google", controller.loginWithGoogle);

router.post("/2fa/setup", authMiddleware, controller.setupTwoFactor);
router.post("/2fa/enable", authMiddleware, controller.enableTwoFactor);
router.post("/2fa/disable", authMiddleware, controller.disableTwoFactor);
router.post("/2fa/verify", verifyTempTokenMiddleware, controller.verifyTwoFactorToken);

module.exports = router;
