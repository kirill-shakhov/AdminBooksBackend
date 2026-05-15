const Role = require("../models/Role");
const ROLES = require("../constants/roles.constants");

async function initializeRoles() {
  try {
    const existingRoles = await Role.countDocuments();
    if (existingRoles === 0) {
      await Role.create({ value: ROLES.USER }, { value: ROLES.ADMIN });
      console.log("Roles initialized");
    }
  } catch (e) {
    console.log("Error initializing roles:", e);
  }
}

module.exports = initializeRoles;
