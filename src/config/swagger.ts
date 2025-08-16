import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LED Controller API',
      version: '1.0.0',
      description: 'API for controlling LED lights and effects',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        LEDSetRequest: {
          type: 'object',
          required: ['index', 'color'],
          properties: {
            index: {
              type: 'integer',
              description: 'LED index position',
              example: 0,
            },
            color: {
              type: 'string',
              description: 'Hex color code',
              example: '#FF0000',
            },
          },
        },
        LEDRangeRequest: {
          type: 'object',
          required: ['start', 'end', 'color'],
          properties: {
            start: {
              type: 'integer',
              description: 'Start index',
              example: 0,
            },
            end: {
              type: 'integer',
              description: 'End index (exclusive)',
              example: 10,
            },
            color: {
              type: 'string',
              description: 'Hex color code',
              example: '#00FF00',
            },
          },
        },
        LEDPatternRequest: {
          type: 'object',
          required: ['pattern'],
          properties: {
            pattern: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of hex color codes',
              example: ['#FF0000', '#00FF00', '#0000FF'],
            },
          },
        },
        LEDFillRequest: {
          type: 'object',
          required: ['color'],
          properties: {
            color: {
              type: 'string',
              description: 'Hex color code',
              example: '#FFFFFF',
            },
          },
        },
        LEDBrightnessRequest: {
          type: 'object',
          required: ['brightness'],
          properties: {
            brightness: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Brightness level (0.0 to 1.0)',
              example: 0.5,
            },
          },
        },
        EffectRequest: {
          type: 'object',
          properties: {
            color: {
              type: 'string',
              description: 'Hex color code',
              example: '#FFFFFF',
            },
            delay: {
              type: 'integer',
              description: 'Delay in milliseconds',
              example: 100,
            },
            duration: {
              type: 'integer',
              description: 'Duration in milliseconds',
              example: 2000,
            },
            count: {
              type: 'integer',
              description: 'Number of sparkles',
              example: 5,
            },
            length: {
              type: 'integer',
              description: 'Chase length',
              example: 3,
            },
            fromColor: {
              type: 'string',
              description: 'Starting color for fade',
              example: '#000000',
            },
            toColor: {
              type: 'string',
              description: 'Ending color for fade',
              example: '#FFFFFF',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);