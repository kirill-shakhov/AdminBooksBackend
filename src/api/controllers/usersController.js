const User = require('../../models/User');
const userService = require('../../services/user-service');

class UsersController {
    async getUsers(req, res) {
        try {
            const users = await User.find();
            res.json(users);
        } catch (e) {
            console.log(e);
        }
    }

    async updateUserByAdmin(req, res) {
        try {
            const userId = req.params.id;
            const updateData = req.body;
            const updatedUser = await userService.updateUserByAdmin(userId, updateData);
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new UsersController();