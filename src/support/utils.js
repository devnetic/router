/**
 * Show a deprecated method message in the console
 *
 * @param {string} method
 * @param {string} alternative
 * @returns {string}
 */
const deprecated = (method, alternative) => {
  return `The method ${method}() is deprecated, use ${alternative}() instead.`
}

/**
 * Transforms a list of key-value pairs into an object.
 *
 * @param {Iterable} iterable An iterable such as Array or Map or other objects
 * implementing the iterable protocol.
 * @returns {Object<string, string>} A new object whose properties are given by the entries of the
 * iterable.
 */
const fromEntries = (entries) => {
  return Array.from(entries).reduce((result, [key, value]) => {
    return { ...result, [key]: value }
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
const matchAll = (regex, value) => {
  let match
  const matches = []

  while ((match = regex.exec(value)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (match.index === regex.lastIndex) {
      regex.lastIndex++
    }

    // The result can be accessed through the `m`-variable.
    matches.push(match)
  }

  return matches
}

export { deprecated, fromEntries, matchAll }
