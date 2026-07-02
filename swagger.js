const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Produtos',
            version: '1.0.0',
            description: 'Documentação da API'
        }
    },
    apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(options);