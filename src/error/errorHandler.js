const fs = require('fs');

function errorHandler(error) {
  console.error('Fatal Error:', error);
  fs.appendFileSync('error.log', `${new Date().toISOString()} - ${error}\n`);
}

module.exports = { errorHandler };
