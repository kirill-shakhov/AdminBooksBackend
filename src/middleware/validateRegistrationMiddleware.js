const {check, validationResult} = require("express-validator");

module.exports = [
    check('username', 'Имя пользователя не может быть пустым').notEmpty(),
    check('password', 'Пароль должен быть от 4 до 10 символов').isLength({min: 4, max: 10}),
    check('firstName', 'Имя не может быть пустым').notEmpty(),
    check('lastName', 'Фамилия не может быть пустой').notEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({message: 'Ошибка при регистрации', errors: errors.array()});
        }
        next();
    }
];