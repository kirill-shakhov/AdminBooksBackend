// AdminBooksBackend > src > api > controllers > authController.js

const User = require('../../models/User');
const Role = require('../../models/Role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');
const {secret} = require('../../config/config');

const generateAccessToken = (id, roles) => {
    const payload = {
        id, roles
    }

    return jwt.sign(payload, secret, {expiresIn: "24h"});
}

class authController {
    async registration(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка при регистрации', errors});
            }

            const {username, password, firstName, lastName} = req.body;
            const candidate = await User.findOne({username});
            if (candidate) {
                return res.status(400).json({message: 'Пользователь с таким именем уже существует'});
            }

            const hashPassword = bcrypt.hashSync(password, 7);
            const userRole = await Role.findOne({value: "USER"});
            const user = new User({
                username,
                password: hashPassword,
                firstName,
                lastName,
                image: req.file ? req.file.path : null, // Получаем путь к загруженному файлу
                roles: [userRole.value]
            });
            await user.save(); // Сохранение пользователя

            return res.status(200).json({message: 'Пользователь успешно зарегистрирован'});
        } catch (e) {
            console.log(e);
            res.status(400).json({message: 'Registration error'});
        }
    }

    async login(req, res) {
        try {
            const {username, password} = req.body;
            const user = await User.findOne({username});

            if (!user) {
                return res.status(400).json({message: `Пользователь ${username} не найден`})
            }

            const validPassword = bcrypt.compareSync(password, user.password)

            if (!validPassword) {
                return res.status(400).json({message: 'Введен неверный пароль'})
            }

            const token = generateAccessToken(user._id, user.roles);
            return res.json({token});


        } catch (e) {
            console.log(e);
            res.status(400).json({message: 'Auth error'})

        }

    }

    async getUsers(req, res) {
        try {
            const users = await User.find();
            res.json(users);
        } catch (e) {

        }
    }
}

module.exports = new authController();