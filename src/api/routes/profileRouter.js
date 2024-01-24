// AdminBooksBackend > src > api > routes > profileRouter.js

const Router = require('express');

const router = new Router();
const controller = require('../controllers/profileController');
const authMiddleware = require('../../middleware/authMiddleware');
const upload = require("../../config/multerConfig");
const multerErrorHandlerMiddleware = require("../../middleware/multerErrorHandlerMiddleware");
const validateUpdateProfile = require("../../middleware/validateUpdateProfile");

router.get('/', authMiddleware, controller.getProfile)
router.patch('/update',
    authMiddleware,
    upload.single('image'),
    multerErrorHandlerMiddleware,
    validateUpdateProfile,
    controller.updateProfile)


module.exports = router;

