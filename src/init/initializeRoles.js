const Role = require('../models/Role');

async function initializeRoles() {
    try {
        const existingRoles = await Role.countDocuments();
        if (existingRoles === 0) {
            await Role.create(
                { value: 'USER' },
                { value: 'ADMIN' }
            );
            console.log('Roles initialized');
        }
    } catch (e) {
        console.log('Error initializing roles:', e);
    }
}

module.exports = initializeRoles;