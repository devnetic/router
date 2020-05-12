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

export {
  deprecated
}
