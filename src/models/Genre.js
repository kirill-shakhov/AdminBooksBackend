// AdminBooksBackend > src > models > User.js
const {Schema, model} = require('mongoose');

const Genre = new Schema({
    name: {type: String, unique: true, required: true},
    user: { type: Schema.Types.ObjectId, ref: 'User' }
});


module.exports = model('Genre', Genre);



