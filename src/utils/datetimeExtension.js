const getNextHoursTime = (hours) => {
  const now = new Date();
  const nowHours = now.getHours();
  now.setHours(nowHours + hours);
  return now;
};

function convertDateTimeToUtc(dateTime) {
  dateTime = dateTime || new Date();

  return new Date(
    dateTime.getUTCFullYear(),
    dateTime.getUTCMonth(),
    dateTime.getUTCDate(),
    dateTime.getUTCHours(),
    dateTime.getUTCMinutes(),
    dateTime.getUTCSeconds()
  );
}

module.exports = { getNextHoursTime, convertDateTimeToUtc };
