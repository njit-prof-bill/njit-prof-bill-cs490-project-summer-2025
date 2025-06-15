/**
 * Format a U.S. phone number to (XXX) XXX-XXXX
 * Assumes input is a valid 10-digit or 11-digit U.S. number
 * @param {string} phone
 * @returns {string}
 */
export function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, ''); // Remove all non-digit characters
  
    let number = cleaned;
    if (number.length === 11 && number.startsWith('1')) {
      number = number.slice(1); // Remove leading '1' if present
    }
  
    if (number.length !== 10) return phone; // Return as-is if not 10 digits
  
    const areaCode = number.slice(0, 3);
    const centralOffice = number.slice(3, 6);
    const lineNumber = number.slice(6);
  
    return `(${areaCode}) ${centralOffice}-${lineNumber}`;
  }
  