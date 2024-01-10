const Genre = require('../../models/Genre');

class BookController {
    async getGenres(req, res, next) {
        try {
            const userId = req.user.id; // ID пользователя из JWT
            const userGenres = await Genre.find({ user: userId }); // Находим все жанры, добавленные пользователем

            return res.status(200).json({genres: userGenres});
        } catch (e) {
            next(e);
        }
    }

    async addGenre(req, res, next) {
        try {
            const genreName = req.body.name.toLowerCase(); // Преобразование к нижнему регистру

            const userId = req.user.id; // ID пользователя из JWT

            // Проверка, существует ли уже такой жанр у данного пользователя
            const existingGenre = await Genre.findOne({ name: genreName, user: userId });
            if (existingGenre) {
                return res.status(400).json({message: "Жанр уже существует"});
            }

            // Создание нового жанра
            const genre = new Genre({name, user: userId});
            await genre.save();

            return res.status(200).json({message: "Жанр добавлен успешно", genre});
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new BookController()