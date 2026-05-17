// AdminBooksBackend > src > models > User.js
const { Schema, model } = require("mongoose");

const Activity = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = model("Activity", Activity);
