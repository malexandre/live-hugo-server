'use strict'

const { list } = require('../post')

const fakeHandler = (req, res) => res.sendStatus(200)

const buildApi = (app) => {
    app.get('/api/get', fakeHandler)
    app.get('/api/list', async(req, res) => {
        const count = parseInt(req.query.count)
        const offset = parseInt(req.query.offset)

        if (typeof req.query.filter !== 'string' && typeof req.query.filter !== 'undefined') {
            res.status(400).send('Filter should be unique')
            return
        }

        if ((isNaN(offset) && typeof req.query.offset !== 'undefined') || Array.isArray(req.query.offset)) {
            res.status(400).send('Offset should be unique and an integer')
            return
        }

        if ((isNaN(count) && typeof req.query.count !== 'undefined') || Array.isArray(req.query.count)) {
            res.status(400).send('Count should be unique and an integer')
            return
        }

        const results = list({
            filter: req.query.filter,
            orderby: req.query.orderby,
            offset: !isNaN(offset) && offset >= 0 ? offset : 0,
            count: !isNaN(count) && count > 0 ? count : 10
        })

        res.status(200).json(results)
    })

    app.post('/api/build', fakeHandler)
    app.post('/api/publish', fakeHandler)
    app.post('/api/save', fakeHandler)
    app.post('/api/unpublish', fakeHandler)
    app.post('/api/upload', fakeHandler)

    app.delete('/api/delete', fakeHandler)
}

module.exports = { buildApi }
