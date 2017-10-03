const express = require('express')
const bodyParser = require('body-parser')
const supertest = require('supertest')

const Api = require('../')
const Post = require('../../post')
let app

jest.mock('../../post', () => ({
    get: jest.fn()
}))

beforeAll(() => {
    app = express()
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    Api.buildApi(app)
})

beforeEach(() => {
    Post.get.mockClear()
})

test('Calling get with a path', async() => {
    const response = await supertest(app).get('/api/get?path=My%20Path')
    expect(response.statusCode).toBe(200)
    expect(Post.get).toBeCalledWith('My Path')
})

test('Calling get without a path', async() => {
    const response = await supertest(app).get('/api/get')
    expect(response.statusCode).toBe(400)
    expect(Post.get).not.toBeCalled()
})
