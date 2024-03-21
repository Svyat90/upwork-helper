const moment = require('moment');

function formatDateRelative(dateString) {
  const date = moment(dateString, 'ddd, DD MMM YYYY HH:mm:ss Z');
  const secondsAgo = moment().diff(date, 'seconds');

  if (secondsAgo < 60) {
    return `${secondsAgo} s. ago`;
  } else if (secondsAgo < 60 * 60) {
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo} m. ago`;
  } else if (secondsAgo < 24 * 60 * 60) {
    const hoursAgo = Math.floor(secondsAgo / (60 * 60));
    return `${hoursAgo} h. ago`;
  } else {
    const daysAgo = Math.floor(secondsAgo / (24 * 60 * 60));
    return `${daysAgo} d. ago`;
  }
}

module.exports = { formatDateRelative };
