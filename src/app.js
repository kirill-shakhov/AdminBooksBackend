// AdminBooksBackend > src > app.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRouter = require('./api/routes/authRouter');

const app = express();
const PORT = process.env.PORT || 5000


app.use(express.json());
app.use('/auth', authRouter);
app.use('/uploads/avatars', express.static('uploads/avatars'));
app.use(cors());

async function start() {
    try {
        await mongoose.connect('mongodb+srv://shakhovworking:onecheck13@cluster0.ykiwddm.mongodb.net/?retryWrites=true&w=majority')
        app.listen(PORT, () => {
            console.log(`server started on port ${PORT}`)
        });
    } catch (e) {
        console.log(e);
    }
}

start();