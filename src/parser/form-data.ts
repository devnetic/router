const NEW_LINE = 0x0a
const CARRIAGE_RETURN = 0x0d

interface Part {
  header: string
  info: string
  buffer: number[]
}

interface Input {
  name: string
  type?: string
  buffer: Buffer
}

/**
 *
 * @param {Buffer} multipartBodyBuffer
 * @param {string} boundary
 */
export const formData = (multipartBodyBuffer: Buffer, boundary: string): Input[] => {
  let lastLine = ''
  let header = ''
  let info = ''
  let state = 0
  let buffer: number[] = []
  const inputs: Input[] = []

  for (let index = 0; index < multipartBodyBuffer.length; index++) {
    const currentByte: number = multipartBodyBuffer[index]
    const prevByte: number | null = index > 0 ? multipartBodyBuffer[index - 1] : null
    const newLineDetected: boolean = currentByte === NEW_LINE && prevByte === CARRIAGE_RETURN
    const newLineChar: boolean = currentByte === NEW_LINE || currentByte === CARRIAGE_RETURN

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
        const part: Part = { header, info, buffer: data }

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
      if (newLineDetected) state = 1
    }
  }

  return inputs
}

export const getBoundary = (header: string): string => {
  return header.split('; boundary=')[1]
}

const transformIntoInput = (part: Part): Input => {
  const header = part.header.split(';')

  const input: Input = { buffer: Buffer.alloc(0), name: '' }
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
