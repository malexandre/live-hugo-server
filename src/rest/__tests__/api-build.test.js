const express = require('express')
const bodyParser = require('body-parser')
const supertest = require('supertest')

const Api = require('../')
const Hugo = require('../../hugo')
let app

jest.mock('../../hugo', () => ({
    build: jest.fn()
}))

beforeAll(() => {
    app = express()
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    Api.buildApi(app)
})

beforeEach(() => {
    Hugo.build.mockClear()
})

test('Calling get with a path', async() => {
    const response = await supertest(app).post('/api/build')
    expect(response.statusCode).toBe(204)
    expect(Hugo.build).toBeCalled()
})
