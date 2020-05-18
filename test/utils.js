const buildFormData = (data, files = []) => {
  const dashSeparator = '-'.repeat(28)
  const boundary = `${dashSeparator}${Math.random().toPrecision(24).toString().substring(2)}`

  const formData = Object.entries(data).reduce((lines, [key, value], index) => {
    lines.push(`Content-Disposition: form-data; name="${key}"`)

    lines.push('\r\n')
    lines.push('\r\n')

    lines.push(value)

    lines.push('\r\n')
    lines.push(`${boundary}`)
    lines.push('\r\n')

    return lines
  }, [])

  formData.unshift(...[boundary, '\r\n']) // first line boundary

  files.forEach(file => {
    formData.push(`Content-Disposition: form-data; name="${file.name}"; filename="${file.filename}"`)
    formData.push('\r\n')
    formData.push(`Content-Type: ${file.type}`)

    formData.push('\r\n')
    formData.push('\r\n')

    formData.push(file.content)
    formData.push('\n')
    formData.push('\r\n')

    formData.push(`${boundary}`)
    formData.push('\r\n')
  })

  formData[formData.length - 2] += '--'

  return { formData: Buffer.from(formData.join(''), 'utf-8'), boundary: boundary.substring(2) }
}

module.exports = {
  buildFormData
}
