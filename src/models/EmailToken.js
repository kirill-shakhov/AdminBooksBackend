const {Schema, model} = require('mongoose');

const EmailVerificationToken = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = model('EmailVerificationToken', EmailVerificationToken);