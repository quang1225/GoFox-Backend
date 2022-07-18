const NodeCache = require('node-cache');

let cache; // only one instance
const defaultTtl = 300; // seconds

const createCacheInstance = () => {
  cache = cache || new NodeCache();
  return cache;
};

const setValue = (key, value, ttl) => {
  createCacheInstance().set(key, value, ttl || defaultTtl);
};

const getValue = (key) => {
  const value = createCacheInstance().get(key);
  return value;
};

const cacheRequest = (fn) => async (req, res, next) => {
  const key = `${req.path}_${JSON.stringify(req.query)}`;

  // check cache, return if exist
  const cacheResult = getValue(key);
  if (cacheResult) {
    return res.send(cacheResult);
  }

  const result = await fn(req, res, next);
  // store cache request
  setValue(key, result);
};

module.exports = {
  cacheRequest,
};
