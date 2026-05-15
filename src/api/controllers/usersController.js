const userService = require("../../services/user-service");

class UsersController {

  async getUserById(req, res) {
    try {
      const userId = req.params.id;
      const user = await userService.getUserById(userId);
      res.json(user);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async updateUserByAdmin(req, res) {
    try {
      const userId = req.params.id;
      const updateData = req.body;
      const updatedUser = await userService.updateUserByAdmin(
        userId,
        updateData,
      );
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteUserByAdmin(req, res) {
    try {
      const userId = req.params.id;
      const deletedUser = await userService.deleteUserByAdmin(userId);
      res.status(200).json(deletedUser);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }
}

module.exports = new UsersController();
