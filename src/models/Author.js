const {Schema, model} = require('mongoose');

const Author = new Schema({
    name: {type: String, required: true},
    user: { type: Schema.Types.ObjectId, ref: 'User' }
});


module.exports = model('Author', Author);

