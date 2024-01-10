// AdminBooksBackend > src > app.js
require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
const authRouter = require('./api/routes/authRouter');
const bookRouter = require('./api/routes/bookRouter');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000


app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/uploads/avatars', express.static('uploads/avatars'));
app.use('/auth', authRouter);
app.use('/book', bookRouter);
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