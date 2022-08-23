const dateFormat = require('handlebars-dateformat');

module.exports = {
  dateFormat: dateFormat,
  heightFormat: function (height) {
    if (height === 0) {
      return '';
    }
    let feet = Math.floor(height / 12);
    let inches = height % 12;
    return feet + "\' " + inches + '\"';
  },
  //used for handlebars, if value equals comparator, then return '' otherwise, return the value with the print
  check: function (value, comparator, print) {
    return (value === comparator) ? '' : value + print;
  },
  //used to see if a value is undefined or not (used to prevent warning in console)
  seeIfExistsNumber: function (value) {
    return (typeof value === undefined) ? 0 : value
  },
  seeIfExistsString: function (value) {
    return (typeof value === undefined) ? "" : value
  }
}