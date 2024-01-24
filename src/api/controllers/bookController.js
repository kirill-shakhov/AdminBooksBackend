const fs = require('fs');
const path = require('path');

const Genre = require('../../models/Genre');
const Author = require('../../models/Author');
const Book = require("../../models/Book");
const ApiError = require('../../exceptions/api-error');
const {validationResult} = require("express-validator");
const User = require("../../models/User");

class BookController {

    async getBooksByAuthor(req, res, next) {
        try {
            const authorName = req.params.authorId.toLowerCase(); // Получаем имя жанра из параметров запроса
            const author = await Author.findOne({name: authorName, user: req.user.id}); // Находим жанр по имени

            if (!author) {
                throw ApiError.NotFound('Автор не найден');
                // return res.status(404).json({message: "Автор не найден"});
            }

            const booksByAuthor = await Book.find({author: author._id, user: req.user.id})
                .populate('genre author', 'name -_id') // Добавление информации о жанре и авторе
                .select('-__v'); // Исключение поля __v
            res.status(200).json(booksByAuthor);
        } catch (e) {
            next(e);
        }
    }

    async getBooksByGenre(req, res, next) {
        try {
            const genreName = req.params.genreId.toLowerCase(); // Получаем имя жанра из параметров запроса
            const genre = await Genre.findOne({name: genreName, user: req.user.id}); // Находим жанр по имени

            if (!genre) {
                throw ApiError.NotFound('Жанр не найден');
                // return res.status(404).json({message: "Жанр не найден"});
            }

            const booksByGenre = await Book.find({genre: genre._id, user: req.user.id})
                .populate('genre author', 'name -_id') // Добавление информации об авторе
                .select('-__v'); // Исключение поля __v

            res.status(200).json(booksByGenre);
        } catch (e) {
            next(e);
        }
    }

    async getBooks(req, res, next) {
        try {
            const userId = req.user.id; // ID пользователя из JWT
            const userBooks = await Book.find({user: userId})
                .populate('genre author', 'name -_id') // Добавление информации о жанре и авторе
                .select('-__v -user'); // Исключение поля __v и user

            return res.status(200).json({books: userBooks});
        } catch (e) {
            next(e);
        }
    }

    async updateBook(req, res, next) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // Обработка ошибок валидации
                throw ApiError.BadRequest('Ошибка при обновлении книги', errors.array())
            }

            const bookId = req.params.bookId; // ID книги из параметров запроса
            const userId = req.user.id; // ID пользователя из JWT
            const currentBook = await Book.findOne({_id: bookId, user: userId});
            const updateData = {};

            // Добавляем поля в объект updateData, если они предоставлены в теле запроса
            if (req.body.title) updateData.title = req.body.title;

            if (req.files && req.files['image']) {
                // Удаление старого файла изображения, если загружается новое изображение
                if (currentBook && currentBook.image) {
                    const currentImagePath = path.join(currentBook.image);
                    if (fs.existsSync(currentImagePath)) {
                        fs.unlinkSync(currentImagePath);
                    }
                }
                updateData.image = req.files['image'][0].path; // Путь к новому изображению
            }

            if (req.files && req.files['book']) {
                // Удаление старого файла изображения, если загружается новое изображение
                if (currentBook && currentBook.book) {
                    const currentBookPath = path.join(currentBook.book);
                    if (fs.existsSync(currentBookPath)) {
                        fs.unlinkSync(currentBookPath);
                    }
                }
                updateData.book = req.files['book'][0].path; // Путь к новому изображению
            }

            // Обновляем жанр, если он предоставлен
            if (req.body.genreName) {
                let genre = await Genre.findOne({name: req.body.genreName.toLowerCase(), user: userId});
                if (!genre) {
                    genre = new Genre({name: req.body.genreName.toLowerCase(), user: userId});
                    await genre.save();
                }
                updateData.genre = genre._id;
            }

            // Обновляем автора, если он предоставлен
            if (req.body.authorName) {
                let author = await Author.findOne({name: req.body.authorName.toLowerCase(), user: userId});
                if (!author) {
                    author = new Author({name: req.body.authorName.toLowerCase(), user: userId});
                    await author.save();
                }
                updateData.author = author._id;
            }

            // Найти и обновить книгу
            const book = await Book.findOneAndUpdate(
                {_id: bookId, user: userId},
                updateData,
                {new: true}
            ).populate('genre author', 'name -_id')
                .select('-__v -user');

            if (!book) {
                // return res.status(404).json({message: "Книга не найдена или у вас нет прав на ее редактирование"});
                throw ApiError.NotFound('Книга не найдена или у вас нет прав на ее редактирование');
            }

            return res.status(200).json({message: "Книга обновлена успешно", book});
        } catch (e) {
            next(e);
        }
    }


    async getBook(req, res, next) {
        try {
            const bookId = req.params.bookId; // ID книги из параметров запроса

            // Найти книгу по ID
            const book = await Book.findById(bookId)
                .populate('genre author', 'name -_id')
                .select('-__v -user');

            if (!book) {
                throw ApiError.NotFound('Книга не найдена');
            }

            return res.status(200).json(book);
        } catch (e) {
            next(e);
        }
    }

    async deleteBook(req, res, next) {
        try {
            const bookId = req.params.bookId; // ID книги из параметров запроса
            const userId = req.user.id; // ID пользователя из JWT

            // Найти книгу
            const book = await Book.findOne({_id: bookId, user: userId});
            if (!book) {
                throw ApiError.NotFound('Книга не найдена или у вас нет прав на ее удаление');
            }

            // Удаление файлов (если они существуют)
            if (book.image) {
                const imagePath = path.join(book.image); // Путь к файлу изображения
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath); // Удаление файла изображения
                }
            }

            if (book.book) {
                const bookFilePath = path.join(book.book); // Путь к файлу книги
                if (fs.existsSync(bookFilePath)) {
                    fs.unlinkSync(bookFilePath); // Удаление файла книги
                }
            }

            // Удаление записи книги из базы данных
            await Book.findOneAndDelete({_id: bookId, user: userId});

            return res.status(200).json({message: "Книга успешно удалена"});
        } catch (e) {
            next(e);
        }
    }

    async uploadBook(req, res, next) {
        try {
            const {title, genreName, authorName} = req.body;
            const userId = req.user.id;

            const image = req.files['image'] ? req.files['image'][0].path : 'path-to-default-image';
            const bookFile = req.files['book'] ? req.files['book'][0].path : null;

            let lowerCaseGenreName = genreName.toLowerCase();
            let lowerCaseAuthorName = authorName.toLowerCase();

            // Проверяем и создаем жанр, связанный с пользователем
            let genre = await Genre.findOne({name: lowerCaseGenreName, user: userId});
            if (!genre) {
                genre = new Genre({name: lowerCaseGenreName, user: userId});
                await genre.save();
            }

            // Проверяем и создаем автора, связанного с пользователем
            let author = await Author.findOne({name: lowerCaseAuthorName, user: userId});
            if (!author) {
                author = new Author({name: lowerCaseAuthorName, user: userId});
                await author.save();
            }

            // Создаем книгу с привязанными жанром, автором и пользователем
            const book = new Book({
                title,
                image,
                book: bookFile,
                genre: genre._id,
                author: author._id,
                user: userId
                // ... другие поля, например, изображение
            });

            await book.save();
            return res.status(200).json({message: "Книга успешно добавлена", book});
        } catch (e) {
            next(e);
        }
    }

    async getAuthors(req, res, next) {
        try {
            const userId = req.user.id; // ID пользователя из JWT
            const userAuthors = await Author.find({user: userId});

            return res.status(200).json({authors: userAuthors});
        } catch (e) {
            next(e);
        }
    }

    async addAuthor(req, res, next) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw ApiError.BadRequest('Ошибка при добавлении автора', errors);
            }

            const {name} = req.body;
            const userId = req.user.id;

            const lowerCaseName = name.toLowerCase();

            const existingAuthor = await Author.findOne({name: lowerCaseName, user: userId});
            if (existingAuthor) {
                throw ApiError.BadRequest('Автор уже существует');
            }

            const author = new Author({name: lowerCaseName, user: userId});
            await author.save();

            return res.status(200).json({message: "Автор добавлен успешно", author});
        } catch (e) {
            next(e);
        }
    }

    async getGenres(req, res, next) {
        try {
            const userId = req.user.id; // ID пользователя из JWT
            const userGenres = await Genre.find({user: userId}); // Находим все жанры, добавленные пользователем

            return res.status(200).json({genres: userGenres});
        } catch (e) {
            next(e);
        }
    }

    async addGenre(req, res, next) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw ApiError.BadRequest('Ошибка при добавлении жанра', errors);
            }

            const genreName = req.body.name.toLowerCase(); // Преобразование к нижнему регистру
            const userId = req.user.id; // ID пользователя из JWT

            // Проверка, существует ли уже такой жанр у данного пользователя
            const existingGenre = await Genre.findOne({name: genreName, user: userId});
            if (existingGenre) {
                throw ApiError.BadRequest('Жанр уже существует');
            }

            // Создание нового жанра
            const genre = new Genre({name: genreName, user: userId});
            await genre.save();

            return res.status(200).json({message: "Жанр добавлен успешно", genreName});
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new BookController()