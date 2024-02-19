// AdminBooksBackend > src > app.js
require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
const authRouter = require('./api/routes/authRouter');
const bookRouter = require('./api/routes/bookRouter');
const profileRouter = require('./api/routes/profileRouter');
const uploadRouter = require('./api/routes/s3Router');
const errorMiddleware = require('./middleware/errorMiddleware');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerDef');

const app = express();
const PORT = process.env.PORT || 5000


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/uploads/avatars', express.static('uploads/avatars'));
app.use('/uploads/booksImages', express.static('uploads/booksImages')); // Для изображений книг
app.use('/uploads/books', express.static('uploads/books')); // Для файлов книг (PDF)
app.use('/auth', authRouter);
app.use('/books', bookRouter);
app.use('/profile', profileRouter);
app.use('/image', uploadRouter);
app.use(errorMiddleware);

async function start() {
    try {
        await mongoose.connect(process.env.DB_URL)
        app.listen(PORT, () => {
            console.log(`server started on port ${PORT}`)
        });
    } catch (e) {
        console.log(e);
    }
}

start();