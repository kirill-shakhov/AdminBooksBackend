const fs = require("fs");
const path = require("path");

const Genre = require("../../models/Genre");
const Author = require("../../models/Author");
const Book = require("../../models/Book");
const ApiError = require("../../exceptions/api-error");
const { validationResult } = require("express-validator");
const User = require("../../models/User");
const s3Service = require("../../services/s3Service");
const ActivityService = require("../../services/activity-service");
const { ACTIVITY_TYPES } = require("../../constants/activity.constants");

class BookController {
  async getBooksByAuthor(req, res, next) {
    try {
      const authorName = req.params.authorId.toLowerCase(); 
      const author = await Author.findOne({
        name: authorName,
        user: req.user.id,
      }); 

      if (!author) {
        throw ApiError.NotFound("Автор не найден");
      }

      const booksByAuthor = await Book.find({
        author: author._id,
        user: req.user.id,
      })
        .populate("genre author", "name -_id")
        .select("-__v");
      res.status(200).json(booksByAuthor);
    } catch (e) {
      next(e);
    }
  }

  async getBooksByGenre(req, res, next) {
    try {
      const genreName = req.params.genreId.toLowerCase();
      const genre = await Genre.findOne({ name: genreName, user: req.user.id });

      if (!genre) {
        throw ApiError.NotFound("Жанр не найден");
      }

      const booksByGenre = await Book.find({
        genre: genre._id,
        user: req.user.id,
      })
        .populate("genre author", "name -_id")
        .select("-__v");

      res.status(200).json(booksByGenre);
    } catch (e) {
      next(e);
    }
  }

  async getBooks(req, res, next) {
    try {
      const userId = req.user.id;
      const userBooks = await Book.find({ user: userId })
        .populate("genre author", "name -_id")
        .select("-__v -user");

      return res.status(200).json({ books: userBooks });
    } catch (e) {
      next(e);
    }
  }

  async updateBook(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest(
          "Ошибка при обновлении книги",
          errors.array(),
        );
      }

      const bookId = req.params.bookId;
      const userId = req.user.id;
      const currentBook = await Book.findOne({ _id: bookId, user: userId });
      const updateData = {};

      if (req.body.title) updateData.title = req.body.title;

      if (req.files && req.files["image"]) {
        if (currentBook && currentBook.image) {
          const currentImagePath = path.join(currentBook.image);
          if (fs.existsSync(currentImagePath)) {
            fs.unlinkSync(currentImagePath);
          }
        }
        updateData.image = req.files["image"][0].path;
      }

      if (req.files && req.files["book"]) {

        if (currentBook && currentBook.book) {
          const currentBookPath = path.join(currentBook.book);
          if (fs.existsSync(currentBookPath)) {
            fs.unlinkSync(currentBookPath);
          }
        }
        updateData.book = req.files["book"][0].path;
      }

      if (req.body.genreName) {
        let genre = await Genre.findOne({
          name: req.body.genreName.toLowerCase(),
          user: userId,
        });
        if (!genre) {
          genre = new Genre({
            name: req.body.genreName.toLowerCase(),
            user: userId,
          });
          await genre.save();
        }
        updateData.genre = genre._id;
      }

      if (req.body.authorName) {
        let author = await Author.findOne({
          name: req.body.authorName.toLowerCase(),
          user: userId,
        });
        if (!author) {
          author = new Author({
            name: req.body.authorName.toLowerCase(),
            user: userId,
          });
          await author.save();
        }
        updateData.author = author._id;
      }

      const book = await Book.findOneAndUpdate(
        { _id: bookId, user: userId },
        updateData,
        { new: true },
      )
        .populate("genre author", "name -_id")
        .select("-__v -user");

      if (!book) {
        throw ApiError.NotFound(
          "Книга не найдена или у вас нет прав на ее редактирование",
        );
      }

      return res.status(200).json({ message: "Книга обновлена успешно", book });
    } catch (e) {
      next(e);
    }
  }

  async getBook(req, res, next) {
    try {
      const bookId = req.params.bookId;

      const book = await Book.findById(bookId)
        .populate("genre author", "name -_id")
        .select("-__v -user");

      if (!book) {
        throw ApiError.NotFound("Книга не найдена");
      }

      return res.status(200).json(book);
    } catch (e) {
      next(e);
    }
  }

  async deleteBook(req, res, next) {
    try {
      const bookId = req.params.bookId;
      const userId = req.user.id;

      const book = await Book.findOne({ _id: bookId, user: userId });
      if (!book) {
        throw ApiError.NotFound(
          "Книга не найдена или у вас нет прав на ее удаление",
        );
      }

      if (book.image) {
        const imagePath = path.join(book.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      if (book.book) {
        const bookFilePath = path.join(book.book);
        if (fs.existsSync(bookFilePath)) {
          fs.unlinkSync(bookFilePath);
        }
      }

      await Book.findOneAndDelete({ _id: bookId, user: userId });

      return res.status(200).json({ message: "Книга успешно удалена" });
    } catch (e) {
      next(e);
    }
  }

  async uploadBook(req, res, next) {
    try {
      const { title, genreName, authorName } = req.body;
      const userId = req.user.id;

      let imageUrl, bookUrl;

      if (req.files["image"]) {
        const image = req.files["image"][0];
        const imageUploadResult = await s3Service.uploadFileToS3(
          image,
          "books-previews",
        );
        imageUrl = imageUploadResult.href;
      }

      if (req.files["book"]) {
        const book = req.files["book"][0];
        const bookUploadResult = await s3Service.uploadFileToS3(book, "books");
        bookUrl = bookUploadResult.href;
      }

      let lowerCaseGenreName = genreName.toLowerCase();
      let lowerCaseAuthorName = authorName.toLowerCase();

      // Проверяем и создаем жанр, связанный с пользователем
      let genre = await Genre.findOne({
        name: lowerCaseGenreName,
        user: userId,
      });
      if (!genre) {
        genre = new Genre({ name: lowerCaseGenreName, user: userId });
        await genre.save();
      }

      // Проверяем и создаем автора, связанного с пользователем
      let author = await Author.findOne({
        name: lowerCaseAuthorName,
        user: userId,
      });
      if (!author) {
        author = new Author({ name: lowerCaseAuthorName, user: userId });
        await author.save();
      }

      // Создаем книгу с привязанными жанром, автором и пользователем
      const book = new Book({
        title,
        image: imageUrl,
        book: bookUrl,
        genre: genre._id,
        author: author._id,
        user: userId,
        // ... другие поля, например, изображение
      });

      await book.save();
      await ActivityService.createActivity(userId, ACTIVITY_TYPES.BOOK_UPLOADED);
      return res.status(200).json({ message: "Книга успешно добавлена", book });
    } catch (e) {
      next(e);
    }
  }

  async getAuthors(req, res, next) {
    try {
      const userId = req.user.id; // ID пользователя из JWT
      const userAuthors = await Author.find({ user: userId }).select(
        "-__v -user -_id",
      );

      return res.status(200).json({ authors: userAuthors });
    } catch (e) {
      next(e);
    }
  }

  async addAuthor(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest("Ошибка при добавлении автора", errors);
      }

      const { name } = req.body;
      const userId = req.user.id;

      const lowerCaseName = name.toLowerCase();

      const existingAuthor = await Author.findOne({
        name: lowerCaseName,
        user: userId,
      });
      if (existingAuthor) {
        throw ApiError.BadRequest("Автор уже существует");
      }

      const author = new Author({ name: lowerCaseName, user: userId });
      await author.save();

      return res
        .status(200)
        .json({ message: "Автор добавлен успешно", author });
    } catch (e) {
      next(e);
    }
  }

  async getGenres(req, res, next) {
    try {
      const userId = req.user.id; // ID пользователя из JWT
      const userGenres = await Genre.find({ user: userId }).select(
        "-__v -user -_id",
      ); // Добавляем -_id здесь, чтобы исключить из основных документов

      return res.status(200).json({ genres: userGenres });
    } catch (e) {
      next(e);
    }
  }

  async addGenre(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest("Ошибка при добавлении жанра", errors);
      }

      const genreName = req.body.name.toLowerCase(); // Преобразование к нижнему регистру
      const userId = req.user.id; // ID пользователя из JWT

      // Проверка, существует ли уже такой жанр у данного пользователя
      const existingGenre = await Genre.findOne({
        name: genreName,
        user: userId,
      });
      if (existingGenre) {
        throw ApiError.BadRequest("Жанр уже существует");
      }

      // Создание нового жанра
      const genre = new Genre({ name: genreName, user: userId });
      await genre.save();

      return res
        .status(200)
        .json({ message: "Жанр добавлен успешно", genreName });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new BookController();
