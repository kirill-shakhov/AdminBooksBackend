// AdminBooksBackend > src > models > Role.js

const { Schema, model } = require("mongoose");
const ROLES = require("../constants/roles.constants");

const Role = new Schema({
  value: { type: String, unique: true, default: ROLES.USER },
});

module.exports = model("Role", Role);
