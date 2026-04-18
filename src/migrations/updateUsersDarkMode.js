const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = 'mongodb+srv://<user>:<pass>@cluster0.ykiwddm.mongodb.net/?retryWrites=true&w=majority';

async function connectDb() {
  await mongoose.connect('mongodb+srv://shakhovworking:onecheck13@cluster0.ykiwddm.mongodb.net/?retryWrites=true&w=majority');
  console.log('Connected to MongoDB');
}

async function migrateUserSettingsRename() {
  const res = await User.updateMany({}, [
    { $set: { userSettings: { $ifNull: ['$userSettings', {}] } } },
    {
      $set: {
        'userSettings.isDarkModeEnabled': {
          $ifNull: [
            '$userSettings.isDarkModeEnabled',
            { $ifNull: ['$userSettings.darkmode', false] }
          ]
        }
      }
    },
    { $unset: 'userSettings.darkmode' }
  ]);

  console.log(`Matched: ${res.matchedCount}, Modified: ${res.modifiedCount}`);
}

(async function run() {
  try {
    await connectDb();
    await migrateUserSettingsRename();
  } catch (e) {
    console.error('Migration error:', e);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
})();
