'use strict'

const { get, list, save, setPublish } = require('../post')

const fakeHandler = (req, res) => res.sendStatus(200)

const buildApi = (app) => {
    app.get('/api/get', (req, res) => {
        const path = req.query.path

        if (!path) {
            res.status(400).send('Path is mandatory')
            return
        }

        if (typeof path !== 'string') {
            res.status(400).send('Path should be a string')
            return
        }

        res.status(200).json(get(path))
    })

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

    app.post('/api/publish', (req, res) => {
        const { path } = req.body

        if (!path) {
            res.status(400).send('Path is required')
            return
        }

        res.status(200).json(setPublish(path, true))
    })

    app.post('/api/save', (req, res) => {
        const { post, oldPath } = req.body

        if (!post) {
            res.status(400).send('Post is required')
            return
        }

        res.status(200).json(save(post, oldPath))
    })

    app.post('/api/unpublish', (req, res) => {
        const { path } = req.body

        if (!path) {
            res.status(400).send('Path is required')
            return
        }

        res.status(200).json(setPublish(path, false))
    })

    app.post('/api/upload', fakeHandler)

    app.delete('/api/delete', fakeHandler)
}

module.exports = { buildApi }
