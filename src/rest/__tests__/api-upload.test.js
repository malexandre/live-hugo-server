const fs = require('fs-extra')
const express = require('express')
const bodyParser = require('body-parser')
const mockFs = require('mock-fs')
const supertest = require('supertest')

const Api = require('../')
let app

beforeAll(() => {
    app = express()
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    Api.buildApi(app)

    mockFs({
        assets: {
            img: {}
        }
    })
})

beforeEach(() => mockFs.restore())

test('Calling upload with an image and a postName', async() => {
    const response = await supertest(app)
        .post('/api/upload')
        .field('postName', 'My Post')
        .attach('new-image', 'src/rest/__tests__/test.jpg')
    expect(response).toBe(200)
    expect(response.statusCode).toBe(200)
    const img = fs.readFileSync('assest/img/my-post/test.jpg', 'utf8')
    expect(img).toBeDefined()
})
