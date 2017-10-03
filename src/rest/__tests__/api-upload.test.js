const fs = require('fs')
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
    expect(response.statusCode).toBe(200)
    expect(response.text).toBe('assets/img/my-post/test.jpg')
    const img = fs.readFileSync(response.text, 'utf8')
    expect(img).toBeDefined()
    // Multer seems to go through MockFS and write in the disk. Cleaning the file
    fs.unlink(response.text)
})

test('Calling upload with an image and without a postName', async() => {
    const response = await supertest(app)
        .post('/api/upload')
        .attach('new-image', 'src/rest/__tests__/test.jpg')
    expect(response.statusCode).toBe(200)
    expect(response.text).toBe('assets/img/test.jpg')
    const img = fs.readFileSync(response.text, 'utf8')
    expect(img).toBeDefined()
    // Multer seems to go through MockFS and write in the disk. Cleaning the file
    fs.unlink(response.text)
})
