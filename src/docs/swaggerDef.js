const { version } = require('../../package.json');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'GoFox API documentation',
    version,
  },
  servers: [
    {
      url: process.env.API_ENDPOINT,
    },
  ],
};

module.exports = swaggerDef;
