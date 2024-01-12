const Router = require('express');
const router = new Router();

const upload = require('../../config/multerBookConfig');
const {check, validationResult} = require("express-validator");

const controller = require('../controllers/bookController');
const authMiddleware = require('../../middleware/authMiddleware');
const validateUploadBookMiddleware = require('../../middleware/validateUploadBookMiddleware');

router.get('/genres', authMiddleware, controller.getGenres);
router.post('/genres/add',
    authMiddleware,
    [check('name', 'Название жанра не может быть пустым').notEmpty()],
    controller.addGenre);
router.get('/genre/:genreId', authMiddleware, controller.getBooksByGenre);

router.get('/authors', authMiddleware, controller.getAuthors);
router.post('/authors/add',
    authMiddleware,
    [check('name', 'Название автора не может быть пустым').notEmpty()],
    controller.addAuthor);
router.get('/authors/:authorId', authMiddleware, controller.getBooksByAuthor);

router.post('/upload',
    authMiddleware,
    upload,
    validateUploadBookMiddleware,
    controller.uploadBook);
router.get('/', authMiddleware, controller.getBooks);
router.get('/:bookId', authMiddleware, controller.getBook);
router.patch('/:bookId', authMiddleware, controller.updateBook);
router.delete('/:bookId', authMiddleware, controller.deleteBook);


module.exports = router;


//     Если ваше приложение предполагает работу с большим количеством книг, рассмотрите внедрение пагинации и сортировки в методы, которые возвращают списки книг.