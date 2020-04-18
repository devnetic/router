const { router } = require('./../lib')

const { createServer } = require('http')

const requestHandler = (request, response) => {
  console.log('Route Handler')

  response.cookie('some-key', 'some-value')

  const data = {
    status: 'ok',
    body: request.body
  }

  response.writeHead(200, {
    'Content-Type': 'application/json',
    'X-Powered-By': 'kiirus-router'
  })

  response.end(JSON.stringify(data))
}

const handlers = [(request, response) => {
  console.log('Route-level middleware')
}, (request, response) => {
  console.log('Route-level middleware')
}]

router.use((request, response) => {
  request.params = { foo: 'value'}
  console.log('Application-level middleware')
})

router.use('/users', (request, response) => {
  console.log('Route-level middleware')
})

router.use('/posters', handlers)

router.get('/users', requestHandler)
router.get('/posters', requestHandler)
router.get('/users/:id', requestHandler)

router.post('/users', requestHandler)

const server = createServer(router.start)

server.listen(3000, () => {
  console.log('listening in the port 3000');
})
