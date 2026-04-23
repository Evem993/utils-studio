// Math utility functions

/**
 * Calculates the factorial of a number
 * @param {number} n - The input number
 * @returns {number} The factorial of n
 */
export function factorial(n) {
    if (n < 0) return undefined;
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

/**
 * Checks if a number is prime
 * @param {number} n - The input number
 * @returns {boolean} True if prime, false otherwise
 */
export function isPrime(n) {
    if (n <= 1) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} A random integer
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
