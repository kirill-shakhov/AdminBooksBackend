// swaggerDef.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My API',
            version: '1.0.0',
            description: 'A simple Express API',
        },
    },
    apis: ['./src/swagger.yaml'], // пути к вашим маршрутам
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
