const express = require('express')
const bodyParser = require('body-parser')
const supertest = require('supertest')

const Api = require('../')
const Post = require('../../post')
let app

jest.mock('../../post', () => ({
    save: jest.fn(),
    setPublish: jest.fn()
}))

beforeAll(() => {
    app = express()
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    Api.buildApi(app)
})

beforeEach(() => {
    Post.save.mockClear()
    Post.setPublish.mockClear()
})

test('Calling save with a post', async() => {
    const response = await supertest(app)
        .post('/api/save')
        .send({ post: 'My Post' })
    expect(response.statusCode).toBe(200)
    expect(Post.save).toBeCalledWith('My Post', undefined)
})

test('Calling save without a post', async() => {
    const response = await supertest(app).post('/api/save')
    expect(response.statusCode).toBe(400)
    expect(Post.save).not.toBeCalled()
})

test('Calling save with a post and an oldPath', async() => {
    const response = await supertest(app)
        .post('/api/save')
        .send({ post: 'My Post', oldPath: 'My Old Path' })
    expect(response.statusCode).toBe(200)
    expect(Post.save).toBeCalledWith('My Post', 'My Old Path')
})

test('Calling save with an oldPath and without a post', async() => {
    const response = await supertest(app)
        .post('/api/save')
        .send({ oldPath: 'My Old Path' })
    expect(response.statusCode).toBe(400)
    expect(Post.save).not.toBeCalled()
})

test('Calling publish with a path', async() => {
    const response = await supertest(app)
        .post('/api/publish')
        .send({ path: 'My Path' })
    expect(response.statusCode).toBe(200)
    expect(Post.setPublish).toBeCalledWith('My Path', true)
})

test('Calling publish without a path', async() => {
    const response = await supertest(app).post('/api/publish')
    expect(response.statusCode).toBe(400)
    expect(Post.setPublish).not.toBeCalled()
})

test('Calling unpublish with a path', async() => {
    const response = await supertest(app)
        .post('/api/unpublish')
        .send({ path: 'My Path' })
    expect(response.statusCode).toBe(200)
    expect(Post.setPublish).toBeCalledWith('My Path', false)
})

test('Calling unpublish without a path', async() => {
    const response = await supertest(app).post('/api/unpublish')
    expect(response.statusCode).toBe(400)
    expect(Post.setPublish).not.toBeCalled()
})
