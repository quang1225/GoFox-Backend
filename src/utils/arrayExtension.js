const arrayItemRemove = (array, value) => {
  const _index = array.indexOf(value);
  if (_index >= 0) {
    array.splice(_index, 1);
    return true;
  }
  return false;
};

const arrayItemAdd = (array, value) => {
  const _index = array.indexOf(value);
  if (_index < 0) {
    array.push(value);
  }
  return true;
};

module.exports = { arrayItemRemove, arrayItemAdd };
