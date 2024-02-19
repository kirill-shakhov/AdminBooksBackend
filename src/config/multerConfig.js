// AdminBooksBackend > src > config > multerConfig

const multer = require('multer');
const path = require('path');

// Функция фильтрации
// В multerConfig.js
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.png', '.jpg', '.jpeg', '.webp'];
    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(extension)) {
        cb(null, true);
    } else {
        req.fileValidationError = 'Недопустимый тип файла';
        cb(null, false, new Error('Недопустимый тип файла'));
    }
};


const storage =  multer.memoryStorage(); // Файлы будут храниться в памяти

const upload = multer({storage: storage, fileFilter: fileFilter});

module.exports = upload;