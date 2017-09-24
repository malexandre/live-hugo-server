'use strict'

const fakeHandler = (req, res) => res.sendStatus(200)

const buildApi = (app) => {
    app.get('/api/get', fakeHandler)
    app.get('/api/list', fakeHandler)

    app.post('/api/build', fakeHandler)
    app.post('/api/publish', fakeHandler)
    app.post('/api/save', fakeHandler)
    app.post('/api/unpublish', fakeHandler)
    app.post('/api/upload', fakeHandler)

    app.delete('/api/delete', fakeHandler)
}

module.exports = { buildApi }
