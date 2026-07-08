const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Diet Tracker API',
    version: '1.0.0',
    description: 'Calorie/macro tracking API with multi-user accounts, manual food entry, and TDEE-based goal calculation.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      FoodEntry: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          user_id: { type: 'integer' },
          date: { type: 'string', example: '2026-07-08' },
          time: { type: 'string', example: '12:00:00' },
          meal_type: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
          name: { type: 'string' },
          weight_g: { type: 'number' },
          calories_per_100g: { type: 'number', nullable: true },
          protein_per_100g: { type: 'number', nullable: true },
          carbs_per_100g: { type: 'number', nullable: true },
          fat_per_100g: { type: 'number', nullable: true },
          calories: { type: 'number', description: 'Generated' },
          protein: { type: 'number', description: 'Generated' },
          carbs: { type: 'number', description: 'Generated' },
          fat: { type: 'number', description: 'Generated' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Goal: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          user_id: { type: 'integer' },
          daily_calories: { type: 'number' },
          protein: { type: 'number' },
          carbs: { type: 'number' },
          fat: { type: 'number' },
        },
      },
      Profile: {
        type: 'object',
        properties: {
          age: { type: 'integer' },
          sex: { type: 'string', enum: ['male', 'female'] },
          height_cm: { type: 'number' },
          weight_kg: { type: 'number' },
          activity_level: { type: 'string', enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'] },
          goal_type: { type: 'string', enum: ['cut', 'maintain', 'bulk'] },
        },
      },
      Preset: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          user_id: { type: 'integer' },
          name: { type: 'string' },
          calories_per_100g: { type: 'number', nullable: true },
          protein_per_100g: { type: 'number', nullable: true },
          carbs_per_100g: { type: 'number', nullable: true },
          fat_per_100g: { type: 'number', nullable: true },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': { description: 'Server and database are healthy' },
          '503': { description: 'Database unreachable' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Account created', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' } } } } } },
          '400': { description: 'Missing fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '409': { description: 'Username taken', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' } } } } } },
          '400': { description: 'Missing fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/entries': {
      get: {
        tags: ['Entries'],
        summary: 'List entries for a date',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'date',
            in: 'query',
            required: true,
            schema: { type: 'string', example: '2026-07-08' },
            description: 'Date in YYYY-MM-DD format',
          },
        ],
        responses: {
          '200': { description: 'Array of food entries', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/FoodEntry' } } } } },
          '400': { description: 'Missing or invalid date', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Entries'],
        summary: 'Create a food entry',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['date', 'time', 'meal_type', 'name', 'weight_g'],
                properties: {
                  date: { type: 'string', example: '2026-07-08' },
                  time: { type: 'string', example: '12:00:00' },
                  meal_type: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
                  name: { type: 'string' },
                  weight_g: { type: 'number' },
                  calories_per_100g: { type: 'number' },
                  protein_per_100g: { type: 'number' },
                  carbs_per_100g: { type: 'number' },
                  fat_per_100g: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Entry created', content: { 'application/json': { schema: { $ref: '#/components/schemas/FoodEntry' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/entries/{id}': {
      put: {
        tags: ['Entries'],
        summary: 'Update a food entry',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  time: { type: 'string' },
                  meal_type: { type: 'string' },
                  name: { type: 'string' },
                  weight_g: { type: 'number' },
                  calories_per_100g: { type: 'number' },
                  protein_per_100g: { type: 'number' },
                  carbs_per_100g: { type: 'number' },
                  fat_per_100g: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Entry updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/FoodEntry' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '403': { description: 'Forbidden (not your entry)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Entry not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Entries'],
        summary: 'Delete a food entry',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Entry deleted' },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '403': { description: 'Forbidden (not your entry)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Entry not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/goals': {
      get: {
        tags: ['Goals'],
        summary: 'Get daily targets',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Current goals', content: { 'application/json': { schema: { $ref: '#/components/schemas/Goal', nullable: true } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        tags: ['Goals'],
        summary: 'Manual override of targets',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  daily_calories: { type: 'number' },
                  protein: { type: 'number' },
                  carbs: { type: 'number' },
                  fat: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Goals updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Goal' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/profile': {
      get: {
        tags: ['Profile'],
        summary: 'Fetch saved profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Saved profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/Profile', nullable: true } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Profile'],
        summary: 'Save profile and calculate TDEE goals',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Profile' },
            },
          },
        },
        responses: {
          '200': { description: 'Calculated goals', content: { 'application/json': { schema: { $ref: '#/components/schemas/Goal' } } } },
          '400': { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/presets': {
      get: {
        tags: ['Presets'],
        summary: 'List saved quick-add foods',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Array of presets', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Preset' } } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Presets'],
        summary: 'Save a new preset',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  calories_per_100g: { type: 'number' },
                  protein_per_100g: { type: 'number' },
                  carbs_per_100g: { type: 'number' },
                  fat_per_100g: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Preset created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Preset' } } } },
          '400': { description: 'Name required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/presets/{id}': {
      delete: {
        tags: ['Presets'],
        summary: 'Delete a preset',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Preset deleted' },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '403': { description: 'Forbidden (not your preset)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Preset not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
};

export default swaggerDefinition;
