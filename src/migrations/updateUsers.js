const mongoose = require('mongoose');
const User = require('../models/User'); // Импортируйте модель User

const connectDb = async () => {
    try {
        await mongoose.connect('mongodb+srv://shakhovworking:onecheck13@cluster0.ykiwddm.mongodb.net/?retryWrites=true&w=majority');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

const migrateUsers = async () => {
    try {
        // Найти всех пользователей без новых полей
        const users = await User.find({ firstName: { $exists: false }, lastName: { $exists: false }, image: { $exists: false } });

        for (let user of users) {
            // Установите значения по умолчанию или логику для определения этих полей
            user.firstName = 'DefaultFirstName';
            user.lastName = 'DefaultLastName';
            user.image = 'default-image-url';

            await user.save();
        }

        console.log(`Migrated ${users.length} users.`);
    } catch (error) {
        console.error('Error during migration:', error);
    }
};

const runMigration = async () => {
    await connectDb();
    await migrateUsers();
    mongoose.disconnect();
};

runMigration();
