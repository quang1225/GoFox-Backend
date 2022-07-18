const httpStatus = require('http-status');
const config = require('../config/config');
const { throwException } = require('../config/exception');

// To use this, need add query token to validate
const credentials = (req, res, next) => {
  const { token } = req.query;
  if (!token || token !== config.server.credential.secrect) {
    throwException(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }
  next();
};

module.exports = credentials;
