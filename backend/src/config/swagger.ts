import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DocVault API',
      version: '1.0.0',
      description: 'Production-quality Document Management REST API',
      contact: { name: 'DocVault Team', email: 'api@docvault.io' },
    },
    servers: [
      { url: 'http://localhost:5000/api/v1', description: 'Development Server' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Document: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            fileUrl: { type: 'string' },
            fileSize: { type: 'number' },
            mimeType: { type: 'string' },
            uploadedBy: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };
