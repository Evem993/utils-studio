// String utility functions

/**
 * Capitalizes the first letter of a string
 * @param {string} str - The input string
 * @returns {string} The capitalized string
 */
export function capitalize(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Reverses a string
 * @param {string} str - The input string
 * @returns {string} The reversed string
 */
export function reverse(str) {
    return str.split('').reverse().join('');
}

/**
 * Checks if a string is a palindrome
 * @param {string} str - The input string
 * @returns {boolean} True if palindrome, false otherwise
 */
export function isPalindrome(str) {
    const cleaned = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return cleaned === cleaned.split('').reverse().join('');
}
