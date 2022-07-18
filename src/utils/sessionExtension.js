const mongoose = require('mongoose');
const { logException } = require('../config/exception');

const sessionRetryWrite = async (callback) => {
  const retryWrite = 5;
  for (let i = 0; i < retryWrite; i++) {
    const session = await mongoose.startSession();
    try {
      let result = false;
      await session.withTransaction(async () => {
        result = await callback(session);
      });
      if (result) {
        return result;
      }
    } catch (error) {
      logException(error);
    } finally {
      session.endSession();
    }
  }

  return false;
};

module.exports = {
  sessionRetryWrite,
};
