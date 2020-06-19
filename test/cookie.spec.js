const test = require('ava')

const { create, parse } = require('./../lib/cookie')

test('should parse a cookie', t => {
  const expires = new Date('2020/04/22').toUTCString()
  const cookie = `foo=bar;Domain=https://localhost:3000;Expires=${expires};HttpOnly;Max-Age=12;Path=/;SameSite=Lax;Secure`
  const expected = {
    foo: 'bar',
    domain: 'https://localhost:3000',
    expires,
    httpOnly: true,
    maxAge: '12',
    sameSite: 'Lax',
    secure: true,
    path: '/'
  }

  t.deepEqual(parse(cookie), expected)
})

test('should create a simple cookie', t => {
  const name = 'foo'
  const value = 'bar'
  const expected = `${name}=${value};Path=/`

  t.is(create(name, value), expected)
})

test('should create a cookie with options', t => {
  const name = 'foo'
  const value = 'bar'
  const expires = new Date('2020/04/22').toUTCString()
  const domain = 'https://localhost:3000'
  const httpOnly = true
  const maxAge = 12
  const sameSite = 'Lax'
  const secure = true
  const path = '/users'
  const options = {
    domain,
    expires,
    httpOnly,
    maxAge,
    path,
    sameSite,
    secure
  }
  const expected = `${name}=${value};Domain=${domain};Expires=${expires};HttpOnly;Max-Age=${maxAge};Path=${path};SameSite=${sameSite};Secure`

  t.deepEqual(create(name, value, options), expected)
})

test('should throw an error when name validation fails', t => {
  const name = 'f\noo'
  const value = 'bar'

  const error = t.throws(() => {
    create(name, value)
  }, { instanceOf: TypeError })

  t.is(error.message, 'Argument name is invalid')
})

test('should throw an error when value validation fails', t => {
  const name = 'foo'
  const value = 'b\nar'

  const error = t.throws(() => {
    create(name, value)
  }, { instanceOf: TypeError })

  t.is(error.message, 'Argument value is invalid')
})

test('should throw an error when domain validation fails', t => {
  const name = 'foo'
  const value = 'bar'
  const options = {
    domain: 'https://localhost:3000\n'
  }

  const error = t.throws(() => {
    create(name, value, options)
  }, { instanceOf: TypeError })

  t.is(error.message, 'Option domain is invalid')
})

test('should throw an error when expires validation fails', t => {
  const name = 'foo'
  const value = 'bar'
  const options = {
    expires: ''
  }

  const error = t.throws(() => {
    create(name, value, options)
  }, { instanceOf: TypeError })

  t.is(error.message, 'Option expires is invalid')
})

test('should throw an error when path validation fails', t => {
  const name = 'foo'
  const value = 'bar'
  const options = {
    path: '/\n'
  }

  const error = t.throws(() => {
    create(name, value, options)
  }, { instanceOf: TypeError })

  t.is(error.message, 'Option path is invalid')
})

test('should throw an error when sameSite validation fails', t => {
  const name = 'foo'
  const value = 'bar'
  const options = {
    sameSite: ''
  }

  const error = t.throws(() => {
    create(name, value, options)
  }, { instanceOf: TypeError })

  t.is(error.message, 'Option sameSite is invalid')
})
