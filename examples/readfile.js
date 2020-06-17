const fs = require('fs')

const file = '/home/aagamezl/Downloads/test-file.txt'
const stream = fs.createReadStream(file/* , { encoding: 'utf8' } */)

const data = []

stream.on('data', chunk => {
  data.push(chunk)
})

stream.on('end', () => {
  console.log(data)
})
