// AdminBooksBackend > src > api > routes > authRouter.js

const Router = require('express');
const upload = require('../../config/multerConfig');

const router = new Router();
const controller = require('../controllers/authController');
// const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const multerErrorHandlerMiddleware = require('../../middleware/multerErrorHandlerMiddleware');
const validateRegistrationMiddleware = require('../../middleware/validateRegistrationMiddleware');

router.post('/registration',
    upload.single('image'),
    multerErrorHandlerMiddleware,
    validateRegistrationMiddleware,
    controller.registration
);

router.post('/login', controller.login)
router.post('/logout', controller.logout)
// router.post('/activate/:link',)
router.get('/refresh',controller.refresh)
router.get('/users', roleMiddleware(["ADMIN"]), controller.getUsers)


module.exports = router;

