function getDateTimeNow() {
  const date = new Date();
  const yyyy = date.getUTCFullYear();
  let gg = date.getUTCDate();
  let mm = date.getUTCMonth() + 1;

  if (gg < 10) gg = `0${gg}`;

  if (mm < 10) mm = `0${mm}`;

  const curDay = `${yyyy}-${mm}-${gg}`;

  let hours = date.getUTCHours();
  let minutes = date.getUTCMinutes();
  let seconds = date.getUTCSeconds();

  if (hours < 10) hours = `0${hours}`;

  if (minutes < 10) minutes = `0${minutes}`;

  if (seconds < 10) seconds = `0${seconds}`;

  return `${curDay} ${hours}:${minutes}:${seconds}`;
}

function numberFullStr(num) {
  if (typeof num !== 'number') {
    return '0';
  }

  const data = String(num).split(/[eE]/);
  if (data.length === 1) return data[0];

  let z = '';
  const sign = num < 0 ? '-' : '';
  const str = data[0].replace('.', '');
  let mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = `${sign}0.`;
    while (mag++) z += '0';
    return z + str.replace(/^\-/, '');
  }
  mag -= str.length;
  while (mag--) z += '0';
  return str + z;
}

const s4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
const generateGUID = () => `${s4() + s4()}-${s4()}-4${s4().substr(0, 3)}-${s4()}-${s4()}${s4()}${s4()}`.toLowerCase();

module.exports = {
  getDateTimeNow,
  numberFullStr,
  s4,
  generateGUID,
};
