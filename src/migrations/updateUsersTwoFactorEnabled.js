require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function connectDb() {
  await mongoose.connect(process.env.DB_URL);
  console.log("Connected to MongoDB");
}

async function migrateUsersTwoFactorEnabled() {
  const twoFactorEnabledResult = await User.updateMany(
    { twoFactorEnabled: { $exists: false } },
    { $set: { twoFactorEnabled: false } },
  );

  const twoFactorSecretResult = await User.updateMany(
    { twoFactorSecret: { $exists: false } },
    { $set: { twoFactorSecret: null } },
  );

  const twoFactorTempSecretResult = await User.updateMany(
    { twoFactorTempSecret: { $exists: false } },
    { $set: { twoFactorTempSecret: null } },
  );
}

(async function runMigration() {
  try {
    await connectDb();
    await migrateUsersTwoFactorEnabled();
  } catch (error) {
    console.error("Migration error:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
})();
