const isObjectId = (value) => value.match(/^[0-9a-fA-F]{24}$/);

const objectId = (value, helpers) => {
  if (!isObjectId(value)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const arrayObjectId = (array, helpers) => {
  if (array.some((value) => !isObjectId(value))) {
    return helpers.message('"{{#label}}" must be a valid mongo id array');
  }
  return array;
};

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message('password must be at least 8 characters');
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message('password must contain at least 1 letter and 1 number');
  }
  return value;
};

module.exports = {
  objectId,
  arrayObjectId,
  password,
};
