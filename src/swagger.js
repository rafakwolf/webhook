const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

/**
 * Register swagger 
 * @param {Express} app
 */
module.exports = (app) => {
    const swaggerDefinition = {
      info: {
        title: 'Webhook API',
        version: '1.0.0',
        description: 'Rest Api',
      },
      host: 'localhost:3000',
      basePath: '/',
    };

    const options = {
      swaggerDefinition: swaggerDefinition,
      apis: [path.join(__dirname, 'routes.js')],
    };

    const swaggerSpec = swaggerJSDoc(options);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}