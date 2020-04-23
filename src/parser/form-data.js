const NEW_LINE = 0x0a
const CARRIAGE_RETURN = 0x0d

/**
 *
 * @typedef {Object} Part
 * @property {string} header
 * @property {string} info
 * @property {Array<number>} buffer
 */

/**
 *
 * @typedef {Object} Input
 * @property {string} name
 * @property {string} [type]
 * @property {Buffer} buffer
 */

/**
 *
 * @param {Buffer} multipartBodyBuffer
 * @param {string} boundary
 * @returns {Array<Input>}
 */
export const formData = (multipartBodyBuffer, boundary) => {
  let lastLine = ''
  let header = ''
  let info = ''
  let state = 0
  let buffer = []
  const inputs = []

  for (let index = 0; index < multipartBodyBuffer.length; index++) {
    const currentByte = multipartBodyBuffer[index]
    const prevByte = index > 0 ? multipartBodyBuffer[index - 1] : null
    const newLineDetected = currentByte === NEW_LINE && prevByte === CARRIAGE_RETURN
    const newLineChar = currentByte === NEW_LINE || currentByte === CARRIAGE_RETURN

    if (!newLineChar) {
      lastLine += String.fromCharCode(currentByte)
    }

    if (state === 0 && newLineDetected) {
      if (`--${boundary}` === lastLine) {
        state = 1
      }

      lastLine = ''
    } else if (state === 1 && newLineDetected) {
      header = lastLine
      state = 2

      if (!header.includes('filename')) {
        state = 3
      }

      lastLine = ''
    } else if (state === 2 && newLineDetected) {
      info = lastLine
      state = 3
      lastLine = ''
    } else if (state === 3 && newLineDetected) {
      state = 4
      buffer = []
      lastLine = ''
    } else if (state === 4) {
      if (lastLine.length > boundary.length + 4) {
        lastLine = '' // mem save
      }

      if ('--' + boundary === lastLine) {
        const length = buffer.length - lastLine.length
        const data = buffer.slice(0, length - 1)
        const part = { header, info, buffer: data }

        inputs.push(transformIntoInput(part))
        buffer = []
        lastLine = ''
        state = 5
        header = ''
        info = ''
      } else {
        buffer.push(currentByte)
      }

      if (newLineDetected) {
        lastLine = ''
      }
    } else if (state === 5) {
      if (newLineDetected) {
        state = 1
      }
    }
  }

  return inputs
}

/**
 *
 * @param {string} header
 * @returns {string}
 */
export const getBoundary = (header) => {
  return header.split('; boundary=')[1]
}

/**
 *
 * @param {Part} part
 * @returns {Input}
 */
const transformIntoInput = (part) => {
  const header = part.header.split(';')
  const input = { buffer: Buffer.alloc(0), name: '' }
  const fileDataHeader = header[2]

  if (fileDataHeader !== undefined) {
    input.name = fileDataHeader.split('=')[1].trim()
    input.type = part.info.split(':')[1].trim()
  } else {
    input.name = header[1].split('=')[1].replace(/"/g, '')
  }

  input.buffer = Buffer.from(part.buffer)

  return input
}
