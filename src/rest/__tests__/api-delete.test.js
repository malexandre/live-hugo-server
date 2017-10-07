const express = require('express')
const bodyParser = require('body-parser')
const supertest = require('supertest')

const Api = require('../')
const Post = require('../../post')
let app

jest.mock('../../post', () => ({
    del: jest.fn()
}))

jest.mock('../../config', () => ({
    folders: {
        post: 'content/post',
        upload: 'assets/img',
        git: './'
    }
}))

beforeAll(() => {
    app = express()
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    Api.buildApi(app)
})

beforeEach(() => {
    Post.del.mockClear()
})

test('Calling delete with a path', async() => {
    const response = await supertest(app).delete('/api/delete?path=My%20Path')
    expect(response.statusCode).toBe(204)
    expect(Post.del).toBeCalledWith('My Path')
})

test('Calling delete without a path', async() => {
    const response = await supertest(app).delete('/api/delete')
    expect(response.statusCode).toBe(400)
    expect(Post.del).not.toBeCalled()
})
