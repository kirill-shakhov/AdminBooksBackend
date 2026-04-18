// AdminBooksBackend > src > api > controllers > authController.js

const User = require('../../models/User');
const {validationResult} = require('express-validator');
const userService = require('../../services/user-service');
const { setRefreshTokenCookie } = require('../../utils/auth-cookie-utils');

class authController {
    async checkUserExists(req, res, next) {
        try {
            const {username} = req.body;

            const userByUsername = await User.findOne({username});

            if (userByUsername) return res.status(200).json({exists: true});

            return res.status(200).json({exists: false});

        } catch (e) {
            next(e);
        }
    }

    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка при регистрации', errors});
            }

            const userData = await userService.registration(req);

            setRefreshTokenCookie(res, userData.refreshToken);
            return res.status(200).json({
                ...userData
            });
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {username, password} = req.body;

            const userData = await userService.login({username, password});

            setRefreshTokenCookie(res, userData.refreshToken);

            return res.status(200).json({
                ...userData
            });


        } catch (e) {
            next(e);
        }

    }

    async getUsers(req, res) {
        try {
            const users = await User.find();
            res.json(users);
        } catch (e) {

        }
    }

    async logout(req, res, next) {

        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);

        } catch (e) {
            next(e);
        }
    }

    // async activate(req, res) {
    //
    //     try {
    //     } catch (e) {
    //
    //     }
    // }

    async refresh(req, res, next) {
        try {

            const {refreshToken} = req.cookies;


            const userData = await userService.refresh(refreshToken);

            setRefreshTokenCookie(res, userData.refreshToken);

            return res.json({...userData});

        } catch (e) {
            next(e);
        }
    }

    async loginWithGoogle(req, res, next) {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({ message: 'Google token is required' });
            }

            const userData = await userService.loginWithGoogle(token);

            setRefreshTokenCookie(res, userData.refreshToken);

            return res.status(200).json({ ...userData });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new authController();