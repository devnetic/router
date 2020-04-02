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
const deprecated = (method: string, alternative: string): string => {
  return `The method ${method}() is deprecated, use ${alternative}() instead.`
}

/**
 * Transforms a list of key-value pairs into an object.
 *
 * @param {*} iterable An iterable such as Array or Map or other objects
 * implementing the iterable protocol.
 * @returns A new object whose properties are given by the entries of the
 * iterable.
 */
const fromEntries = (iterable: Iterable<any>|Array<any>): Object => {
  return Array.from(iterable).reduce((obj, [key, val]) => {
    obj[key] = val
    return obj
  }, {})
}

/**
 * Perform a global regular expression match. Searches subject for all
 * matches to the regular expression given in pattern and return them.
 *
 * @param {Object} regex
 * @param {string} value
 * @returns {Array}
 */
const matchAll = (regex: RegExp, value: string): Array<RegExpMath> => {
  let match: RegExpMath
  const matches: Array<RegExpMath> = []

  while ((match = <RegExpMath> regex.exec(value)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (match.index === regex.lastIndex) {
      regex.lastIndex++
    }

    // The result can be accessed through the `m`-variable.
    matches.push(match)
  }

  return matches
}

export {
  RegExpMath,
  deprecated,
  fromEntries,
  matchAll
}
