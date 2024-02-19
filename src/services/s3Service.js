const {v4: uuidv4} = require('uuid');
const {s3Client} = require("./s3Client");
const {DeleteObjectCommand} = require("@aws-sdk/client-s3");
const {Upload} = require("@aws-sdk/lib-storage");
const fs = require('fs');
const uuid = require("uuid");

class s3Service {
    async uploadFileToS3(file, folder) {
        const { originalname, mimetype, buffer } = file; // Используйте buffer
        const extension = originalname.split('.').pop();
        const filename = `${uuidv4()}.${extension}`; // Генерация уникального имени файла
        const key = `${folder}/${filename}`;

        try {
            const upload = new Upload({
                client: s3Client,
                params: {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: key,
                    Body: buffer, // Используйте buffer напрямую
                    ContentType: mimetype,
                },
            });

            await upload.done();
            const href = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
            return { href };
        } catch (error) {
            console.error("Ошибка загрузки файла на S3:", error);
            throw new Error("Ошибка при загрузке файла");
        }
    };

    async deleteFileFromS3(bucketName, fileKey) {
        const deleteParams = {
            Bucket: bucketName,
            Key: fileKey,
        };

        try {
            const response = await s3Client.send(new DeleteObjectCommand(deleteParams));
            console.log("File deleted successfully", response);
            return response;
        } catch (error) {
            console.error("Ошибка удаления файла с S3:", error);
            throw new Error("Ошибка при удалении файла");
        }
    }
}

module.exports = new s3Service();
