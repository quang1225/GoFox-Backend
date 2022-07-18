const morgan = require('morgan');
const httpContext = require('express-http-context');
const config = require('./config');
const logger = require('./logger');

// define token keyword
morgan.token('message', (req, res) => res.locals.errorMessage || '');
morgan.token('body', (req) => JSON.stringify(req.body) || '');

const getIpFormat = () => (config.env === 'production' ? ':remote-addr - ' : '');
const successResponseFormat = `${getIpFormat()} :method :url :status - :response-time ms - [user-agent: :user-agent] [headers: :req[header]] [body: :body] `;
const errorResponseFormat = `${getIpFormat()} :method :url :status - :response-time ms - message: :message - [header: :req[header]] [body: :body]`;

const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: (message) => logger.info(`${httpContext.get('requestId')} ${message.trim()}`) },
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: (message) => logger.error(`${httpContext.get('requestId')} ${message.trim()}`) },
});

module.exports = {
  successHandler,
  errorHandler,
};
