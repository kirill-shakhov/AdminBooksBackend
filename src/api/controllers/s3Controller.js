const s3Service = require('../../services/s3Service');

class s3Controller {
    uploadFile = async (req, res) => {
        try {
            const file = req.file; // Получаем файл из запроса
            const response = await s3Service.uploadFileToS3(file, 'avatars');
            // Здесь можно также сформировать URL файла, если необходимо
            res.status(200).json({message: "Файл успешно загружен", response});
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    };

    deleteFile = async (req, res) => {
        try {
            const { key } = req.params; // Предполагается, что ключ файла передается через параметры запроса
            const response = await s3Service.deleteFileFromS3(process.env.AWS_S3_BUCKET, key);
            res.status(200).json({message: "Файл успешно удален", response});
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    };

}

module.exports = new s3Controller();
