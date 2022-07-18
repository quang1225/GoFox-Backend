const httpContext = require('express-http-context');
const logger = require('./logger');
const ApiError = require('../utils/ApiError');

function exceptionHandler(statusCode, message, breakRequest = false) {
  const requestId = httpContext.get('requestId');
  if (breakRequest) {
    throw new ApiError(statusCode, message);
  }

  logger.error(`${requestId} - ${message}`);
}

function throwException(statusCode, message) {
  exceptionHandler(statusCode, message, true);
}

function logException(message) {
  exceptionHandler(null, message);
}

module.exports = { throwException, logException };
