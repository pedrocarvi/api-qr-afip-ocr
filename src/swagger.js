// swagger.js
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi    = require('swagger-ui-express')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RapidAPI QR AFIP OCR',
      version: '1.0.0',
      description: 'Documentación de endpoints para subir QR y datos AFIP'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API Key'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['src/index.js']  
}

const specs = swaggerJsdoc(options)

module.exports = { swaggerUi, specs }
