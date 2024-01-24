const {body} = require('express-validator');

const validateUpdateProfile = [
    body('username').optional().isLength({min: 3, max: 25}).withMessage('username не может быть меньше 3 символов и больше 25 символов'),
    body('email').optional().isEmail().withMessage('Невалидный email'),
    body('firstName').optional().isString().isLength({
        min: 3,
        max: 25
    }).withMessage('firstName не может быть меньше 3 символов и больше 25 символов'),
    body('lastName').optional().isString().isLength({
        min: 3,
        max: 25
    }).withMessage('lastName не может быть меньше 3 символов и больше 25 символов'),
];

module.exports = validateUpdateProfile;
