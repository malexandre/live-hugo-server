const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const supertest = require('supertest')

const Api = require('../')
let app

jest.mock('../../config', () => ({
    folders: {
        post: 'content/post',
        upload: 'assets/img',
        git: './'
    }
}))

jest.mock('../../git', () => ({
    syncFiles: jest.fn()
}))

const rmdir = (dir) => {
    const list = fs.readdirSync(dir)
    for (let i = 0; i < list.length; i++) {
        const filename = path.join(dir, list[i])
        const stats = fs.statSync(filename)

        if (filename == '.' || filename == '..') {
            // pass these files
        }
        else if (stats.isDirectory()) {
            rmdir(filename)
        }
        else {
            fs.unlinkSync(filename)
        }
    }
    fs.rmdirSync(dir)
}

beforeAll(() => {
    app = express()
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    Api.buildApi(app)
})

// Multer seems to go through MockFS and write in the disk. Cleaning the file
beforeEach(() => {
    fs.mkdirSync('assets')
    fs.mkdirSync('assets/img')
})

afterEach(() => {
    rmdir('assets')
})

test('Calling upload with an image and a postName', async() => {
    const response = await supertest(app)
        .post('/api/upload')
        .field('postName', 'My Post')
        .attach('new-image', 'src/rest/__tests__/test.jpg')
    expect(response.statusCode).toBe(200)
    expect(response.text).toBe('assets/img/my-post/test.jpg')
    const img = fs.readFileSync(response.text, 'utf8')
    expect(img).toBeDefined()
    fs.unlinkSync(response.text)
    fs.rmdirSync('assets/img/my-post')
})

test('Calling upload with an image and without a postName', async() => {
    const response = await supertest(app)
        .post('/api/upload')
        .attach('new-image', 'src/rest/__tests__/test.jpg')
    expect(response.statusCode).toBe(200)
    expect(response.text).toBe('assets/img/test.jpg')
    const img = fs.readFileSync(response.text, 'utf8')
    expect(img).toBeDefined()
    fs.unlinkSync(response.text)
})
