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
  }
}