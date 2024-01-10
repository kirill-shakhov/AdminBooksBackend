// AdminBooksBackend > src > api > routes > authRouter.js

const Router = require('express');
const upload = require('../../config/multerConfig');

const router = new Router();
const controller = require('../controllers/bookController');
const authMiddleware = require('../../middleware/authMiddleware');
// const roleMiddleware = require('../../middleware/roleMiddleware');

router.get('/genres', authMiddleware, controller.getGenres);
router.post('/genres/add', authMiddleware, controller.addGenre);


module.exports = router;

