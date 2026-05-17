const Router = require("express");

const router = new Router();
const controller = require("../controllers/activitiesController");
const roleMiddleware = require("../../middleware/roleMiddleware");
const authMiddleware = require("../../middleware/authMiddleware");
const ROLES = require("../../constants/roles.constants");

router.get("/", authMiddleware, roleMiddleware([ROLES.USER, ROLES.ADMIN]), controller.getUserActivities);

module.exports = router;