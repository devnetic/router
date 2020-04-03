interface RegExpMath extends Array<any> {
    index: number;
    input: any;
}
/**
 * Show a deprecated method message in the console
 *
 * @param {string} method
 * @param {string} alternative
 * @returns {string}
 */
declare const deprecated: (method: string, alternative: string) => string;
/**
 * Transforms a list of key-value pairs into an object.
 *
 * @param {*} iterable An iterable such as Array or Map or other objects
 * implementing the iterable protocol.
 * @returns A new object whose properties are given by the entries of the
 * iterable.
 */
declare const fromEntries: (iterable: any[] | Iterable<any>) => Object;
/**
 * Perform a global regular expression match. Searches subject for all
 * matches to the regular expression given in pattern and return them.
 *
 * @param {Object} regex
 * @param {string} value
 * @returns {Array}
 */
declare const matchAll: (regex: RegExp, value: string) => RegExpMath[];
export { RegExpMath, deprecated, fromEntries, matchAll };
