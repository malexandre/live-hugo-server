const express = require('express')
const bodyParser = require('body-parser')
const supertest = require('supertest')

const Api = require('../')
const Post = require('../../post')
let app

jest.mock('../../post', () => ({
    list: jest.fn()
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
    Post.list.mockClear()
})

test('Calling list with default parameters', async() => {
    const response = await supertest(app).get('/api/list')
    expect(response.statusCode).toBe(200)
    expect(Post.list).toBeCalledWith({ offset: 0, count: 10 })
})

test('Calling list with one custom orderby', async() => {
    const response = await supertest(app).get('/api/list?orderby=title')
    expect(response.statusCode).toBe(200)
    expect(Post.list).toBeCalledWith({ orderby: ['title'], offset: 0, count: 10 })
})

test('Calling list with multiple custom orderby', async() => {
    const response = await supertest(app).get('/api/list?orderby=title&orderby=-date')
    expect(response.statusCode).toBe(200)
    expect(Post.list).toBeCalledWith({ orderby: ['title', '-date'], offset: 0, count: 10 })
})

test('Calling list with one custom filter', async() => {
    const response = await supertest(app).get('/api/list?filter=new%20query')
    expect(response.statusCode).toBe(200)
    expect(Post.list).toBeCalledWith({ filter: 'new query', offset: 0, count: 10 })
})

test('Calling list with multiple custom filter', async() => {
    const response = await supertest(app).get('/api/list?filter=query&filter=should%20not%20work')
    expect(response.statusCode).toBe(400)
    expect(Post.list).not.toBeCalled()
})

test('Calling list with one custom offset', async() => {
    const response = await supertest(app).get('/api/list?offset=10')
    expect(response.statusCode).toBe(200)
    expect(Post.list).toBeCalledWith({ offset: 10, count: 10 })
})

test('Calling list with multiple custom offset', async() => {
    const response = await supertest(app).get('/api/list?offset=10&offset=20')
    expect(response.statusCode).toBe(400)
    expect(Post.list).not.toBeCalled()
})

test('Calling list with one custom count', async() => {
    const response = await supertest(app).get('/api/list?count=20')
    expect(response.statusCode).toBe(200)
    expect(Post.list).toBeCalledWith({ offset: 0, count: 20 })
})

test('Calling list with multiple custom count', async() => {
    const response = await supertest(app).get('/api/list?count=10&count=20')
    expect(response.statusCode).toBe(400)
    expect(Post.list).not.toBeCalled()
})

test('Calling list with all arugments', async() => {
    const response = await supertest(app).get('/api/list?filter=query&offset=10&count=20&orderby=title')
    expect(response.statusCode).toBe(200)
    expect(Post.list).toBeCalledWith({ filter: 'query', orderby: ['title'], offset: 10, count: 20 })
})
