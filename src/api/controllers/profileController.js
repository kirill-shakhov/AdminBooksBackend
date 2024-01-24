const fs = require('fs');
const path = require('path');

const User = require('../../models/User');
const ApiError = require('../../exceptions/api-error');
const {validationResult} = require("express-validator");

class Profile {

    async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const profile = await User.findById(userId);
            if (!profile) {
                throw ApiError.NotFound('User not found');
            }
            // Фильтрация чувствительных данных перед отправкой
            const userData = profile.toObject();
            delete userData.password; // Удаление пароля из объекта пользователя
            // Возвращение профиля
            return res.status(200).json({...userData});

        } catch (e) {
            next(e);
        }
    }

    async updateProfile(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // Обработка ошибок валидации
                throw ApiError.BadRequest('Ошибка при обновлении профиля', errors.array())
            }
            
            const userId = req.user.id;

            // Получаем текущий профиль пользователя
            const currentUser = await User.findById(userId);

            if (currentUser && currentUser.image) {
                // Полный путь к текущему изображению
                const currentImagePath = path.join(currentUser.image);

                // Проверяем, существует ли файл, и удаляем его
                if (fs.existsSync(currentImagePath)) {
                    fs.unlinkSync(currentImagePath);
                }
            }

            // Обновляем данные пользователя
            const updateData = {...req.body};
            if (req.file) updateData.image = req.file.path;

            const updatedUser = await User.findOneAndUpdate({_id: userId}, updateData, {new: true});

            if (!updatedUser) {
                throw ApiError.NotFound('Пользователь не найден');
            }

            // Возвращаем обновленные данные пользователя
            const userData = updatedUser.toObject();
            delete userData.password;
            delete userData.activationLink;
            delete userData._id;
            delete userData.roles;

            return res.status(200).json({message: 'Данные пользователя успешно изменены', userData});

        } catch (e) {
            next(e);
        }
    }

}

module.exports = new Profile();
