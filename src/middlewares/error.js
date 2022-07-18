const mongoose = require('mongoose');
const httpStatus = require('http-status');
const config = require('../config/config'); 
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');  
const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  let { statusCode, message } = error;
  if (config.env === 'production' && !error.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = error.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: error.stack }),
  };

  logger.error(error);
  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
