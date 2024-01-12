const {check, validationResult} = require("express-validator");
const ApiError = require('../exceptions/api-error');

module.exports = [
    check('title', 'Заголовок не может быть пустым')
        .notEmpty().bail()
        .isString().bail()
        .isLength({min: 3, max: 40}).withMessage('Название не может быть меньше 3 символов и больше 40'),
    check('genreName', 'Жанр не может быть пустым')
        .notEmpty().bail()
        .isString().bail()
        .isLength({min: 3, max: 40}).withMessage('Название не может быть меньше 3 символов и больше 40'),
    check('authorName', 'Автор не может быть пустым').bail().notEmpty().bail().isString().bail().isLength({
        min: 3,
        max: 40
    }),
    (req, res, next) => {
        const errors = validationResult(req);

        // Собираем ошибки из validationResult
        let allErrors = errors.array();

        // Добавляем ошибки загрузки файлов
        if (req.fileValidationError) {
            allErrors.push(
                {
                    msg: req.fileValidationError,
                    path: 'book'
                }
            );
        }

        if (req.imageValidationError) {
            allErrors.push(
                {
                    msg: req.imageValidationError,
                    path: 'image'
                }
            );
        }

        // Проверяем, загружен ли файл книги
        if (!req.files || !req.files.book) {
            allErrors.push(
                {
                    msg: 'Файл книги не загружен',
                    path: 'book'
                }
            );
        }

        // Если есть ошибки, выбрасываем исключение
        if (allErrors.length > 0) {
            throw ApiError.BadRequest('Ошибка при добавлении книги', allErrors);
        }

        next();
    }
];