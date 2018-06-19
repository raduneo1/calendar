import moment from 'moment'

if (!Array.prototype.fill) {
  Object.defineProperty(Array.prototype, 'fill', {
    value: function(value) {

      // Steps 1-2.
      if (this == null) {
        throw new TypeError('this is null or not defined');
      }

      var O = Object(this);

      // Steps 3-5.
      var len = O.length >>> 0;

      // Steps 6-7.
      var start = arguments[1];
      var relativeStart = start >> 0;

      // Step 8.
      var k = relativeStart < 0 ?
        Math.max(len + relativeStart, 0) :
        Math.min(relativeStart, len);

      // Steps 9-10.
      var end = arguments[2];
      var relativeEnd = end === undefined ?
        len : end >> 0;

      // Step 11.
      var final = relativeEnd < 0 ?
        Math.max(len + relativeEnd, 0) :
        Math.min(relativeEnd, len);

      // Step 12.
      while (k < final) {
        O[k] = value;
        k++;
      }

      // Step 13.
      return O;
    }
  });
}

export const MAX_DAYS_IN_CAL_MONTH = 42;
export const DAYS_IN_WEEK = 7;
export const NUM_WEEKS = MAX_DAYS_IN_CAL_MONTH/DAYS_IN_WEEK;
export const MONTHS_IN_YEAR = 12;

export const WEEKDAYS = new Array(7);
WEEKDAYS[0] = "Sunday";
WEEKDAYS[1] = "Monday";
WEEKDAYS[2] = "Tuesday";
WEEKDAYS[3] = "Wednesday";
WEEKDAYS[4] = "Thursday";
WEEKDAYS[5] = "Friday";
WEEKDAYS[6] = "Saturday";

export const MONTH_LENGTHS = new Array(MONTHS_IN_YEAR);
MONTH_LENGTHS.fill(31);
MONTH_LENGTHS[1] = 28;
MONTH_LENGTHS[3] = MONTH_LENGTHS[5] = MONTH_LENGTHS[8] = MONTH_LENGTHS[10] = 30;

export const MONTH_NAMES = ["January", "February", "Mars", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function loadJS(src) {
  const ref = window.document.getElementsByTagName("script")[0];
  const script = window.document.createElement("script");
  script.src = src;
  script.async = true;
  ref.parentNode.insertBefore(script, ref);
}

export function isToday(day, month, year) {
  return (
    year === moment().year()
    && month === moment().month()
    && day === moment().date()
  );
}

