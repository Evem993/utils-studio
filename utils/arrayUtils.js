// Array utility functions

/**
 * Removes duplicates from an array
 * @param {Array} arr - The input array
 * @returns {Array} Array with duplicates removed
 */
export function removeDuplicates(arr) {
    return [...new Set(arr)];
}

/**
 * Shuffles an array in place
 * @param {Array} arr - The input array
 * @returns {Array} The shuffled array
 */
export function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Finds the maximum value in an array
 * @param {Array<number>} arr - The input array of numbers
 * @returns {number} The maximum value
 */
export function max(arr) {
    return Math.max(...arr);
}
