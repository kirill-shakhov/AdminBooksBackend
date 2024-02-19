const fs = require('fs');
const path = require('path');

const User = require('../../models/User');
const ApiError = require('../../exceptions/api-error');
const {validationResult} = require("express-validator");
const s3Service = require('../../services/s3Service');

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
                throw ApiError.BadRequest('Ошибка при обновлении профиля', errors.array());
            }

            const userId = req.user.id;
            const currentUser = await User.findById(userId);

            // Если есть файл для загрузки
            if (req.file) {
                // Если у пользователя уже есть изображение, удаляем его из S3
                if (currentUser.image) {
                    // Создаем объект URL для парсинга полного URL
                    const parsedUrl = new URL(currentUser.image);
                    // Извлекаем путь и удаляем ведущий слэш
                    const fileKey = parsedUrl.pathname.slice(1);
                    await s3Service.deleteFileFromS3(process.env.AWS_S3_BUCKET, fileKey);
                }

                // Загрузка нового изображения в S3 и обновление URL изображения в профиле пользователя
                const response = await s3Service.uploadFileToS3(req.file, 'avatars');

                console.log(response);

                // Предполагаем, что response.Location содержит полный URL к загруженному файлу
                currentUser.image = response.href;
            }

            // Обновляем другие данные пользователя, если они есть
            if (req.body.name) currentUser.name = req.body.name;
            // Добавьте другие поля, которые разрешено обновлять

            await currentUser.save();

            // Фильтрация чувствительных данных перед отправкой
            const userData = currentUser.toObject();
            delete userData.password; // Удаление пароля из объекта пользователя
            delete userData.activationLink;
            delete userData._id;
            delete userData.roles;

            return res.status(200).json({message: 'Профиль успешно обновлен', userData});

        } catch (e) {
            next(e);
        }
    }

}

module.exports = new Profile();
