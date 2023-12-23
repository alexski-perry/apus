export function isValidDate(date: any): date is Date {
  return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
}
