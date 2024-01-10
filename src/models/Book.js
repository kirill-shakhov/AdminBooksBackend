// AdminBooksBackend > src > models > User.js
const {Schema, model} = require('mongoose');

const Book = new Schema({
    title: {type: String, required: true},
    image: {type: String},
    genre: {type: Schema.Types.ObjectId, ref: 'Genre', required: true},
    author: {type: Schema.Types.ObjectId, ref: 'Author', required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User'}
});


module.exports = model('Book', Book);
