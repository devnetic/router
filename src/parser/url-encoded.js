/**
 *
 * @param {Buffer} body
 * @returns {Object<string, string>}
 */
export const urlEncoded = (body) => {
  return decodeURI(body.toString())
    .split('&')
    .reduce((result, current) => {
      const [key, value] = current.split('=')

      result[key] = value

      return result
    }, {})
}
