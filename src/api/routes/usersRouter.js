const Router = require("express");

const router = new Router();
const controller = require("../controllers/usersController");
const roleMiddleware = require("../../middleware/roleMiddleware");
const ROLES = require("../../constants/roles.constants");

router.get("/get-users", roleMiddleware([ROLES.ADMIN]), controller.getUsers);
router.get("/:id", roleMiddleware([ROLES.ADMIN, ROLES.USER]), controller.getUserById);
router.put("/:id", roleMiddleware([ROLES.ADMIN]), controller.updateUserByAdmin);
router.delete("/:id", roleMiddleware([ROLES.ADMIN]), controller.deleteUserByAdmin);

module.exports = router;
