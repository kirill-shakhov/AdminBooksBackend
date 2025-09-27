const User = require('../../models/User');

class UsersController {
    async getUsers(req, res) {
        try {
            const users = await User.find();
            res.json(users);
        } catch (e) {
            console.log(e);
        }
    }

}

module.exports = new UsersController();