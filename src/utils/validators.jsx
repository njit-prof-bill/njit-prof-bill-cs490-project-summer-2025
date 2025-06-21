// /lib/utils/validators.js

/**
 * Validate an email address (basic regex)
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a U.S. phone number (accepts formats like:
 * (123) 456-7890, 123-456-7890, 1234567890, +1 123-456-7890)
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhoneNumber(phone) {
  const cleaned = phone.replace(/\s|[-().]/g, '');

  // Accepts 10 digits or 11 digits starting with 1
  const usPhoneRegex = /^(1)?\d{10}$/;

  return usPhoneRegex.test(cleaned);
}




// /**
//  * Validate a phone number in E.164 international format
//  * @param {string} phone
//  * @returns {boolean}
//  */
// export function isValidPhoneNumber(phone) {
//   const phoneRegex = /^\+?[1-9]\d{1,14}$/;
//   return phoneRegex.test(phone);
// }
