const multer = require('multer');
const path = require('path');
const fs = require('fs');

function ensureDirSync(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true});
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = '';

        if (file.fieldname === 'book') {
            // Относительный путь для сохранения PDF-файлов книг
            dir = 'uploads/books/';
        } else if (file.fieldname === 'image') {
            // Относительный путь для сохранения изображений
            dir = 'uploads/booksImages/';
        }

        // Создаем директорию, если она не существует
        ensureDirSync(path.join(__dirname, '../../', dir));

        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Расширяем проверку для разных форматов электронных книг
    if (file.fieldname === 'book') {
        const validBookTypes = [
            'application/epub+zip', // EPUB
            'application/x-mobipocket-ebook', // MOBI
            'application/vnd.amazon.ebook', // AZW
            'application/pdf', // PDF
            'application/x-fictionbook+xml', // FB2
            'text/plain', // TXT
            'text/html', // HTML
            'application/msword', // DOC
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
        ];

        if (validBookTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            req.fileValidationError = 'Недопустимый тип файла книги';
            cb(null, false);
        }
    } else if (file.fieldname === 'image' && ['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(file.originalname).toLowerCase())) {
        cb(null, true);
    } else {
        // cb(new Error('Недопустимый тип файла изображения'), false);
        req.imageValidationError = 'Недопустимый тип файла изображения';
        cb(null, false);
    }
};


const upload = multer({storage: storage, fileFilter: fileFilter}).fields([
    {name: 'book', maxCount: 1},
    {name: 'image', maxCount: 1}
]);

module.exports = upload;
