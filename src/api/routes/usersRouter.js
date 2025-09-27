
const Router = require('express');

const router = new Router();
const controller = require('../controllers/usersController');
const roleMiddleware = require('../../middleware/roleMiddleware');

router.get('/get-users', roleMiddleware(["ADMIN"]), controller.getUsers)


module.exports = router;

