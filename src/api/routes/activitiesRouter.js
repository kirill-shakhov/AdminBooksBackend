const Router = require("express");

const router = new Router();
const controller = require("../controllers/activitiesController");
const roleMiddleware = require("../../middleware/roleMiddleware");
const authMiddleware = require("../../middleware/authMiddleware");
const ROLES = require("../../constants/roles.constants");

router.get("/:id", roleMiddleware([ROLES.ADMIN, ROLES.USER]), controller.getUserActivities);

module.exports = router;