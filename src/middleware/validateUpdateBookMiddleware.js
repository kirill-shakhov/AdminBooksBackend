const {body} = require('express-validator');

const validateUpdateBook = [
    body('title').optional().isLength({
        min: 3,
        max: 25
    }).withMessage('title не может быть меньше 3 символов и больше 25 символов'),
    body('genreName').optional().isLength({
        min: 3,
        max: 25
    }).withMessage('genreName не может быть меньше 3 символов и больше 25 символов'),
    body('authorName').optional().isLength({
        min: 3,
        max: 25
    }).withMessage('authorName не может быть меньше 3 символов и больше 25 символов'),
];

module.exports = validateUpdateBook;
