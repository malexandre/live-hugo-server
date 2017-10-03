'use strict'

const mkdirp = require('mkdirp-promise')
const multer = require('multer')
const slugify = require('slugify')

const { uploadFolder } = require('../config')
const { get, list, save, setPublish } = require('../post')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let postName = req.body.postName

        if (typeof postName !== 'string' || !postName) {
            postName = undefined
        }

        const postSlug = postName ? `${slugify(postName)}/`.toLowerCase() : ''
        const destFolder = `${uploadFolder}/${postSlug}`
        mkdirp(destFolder).then(() => cb(null, destFolder))
    },
    filename: (req, file, cb) => cb(null, file.originalname)
})

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const acceptedMimetype = ['image/gif', 'image/jpeg', 'image/png', 'image/webp']
        cb(null, acceptedMimetype.indexOf(file.mimetype) !== -1)
    }
})

const fakeHandler = (req, res) => res.sendStatus(200)

const apiGet = (req, res) => {
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
}

const apiList = async(req, res) => {
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
}

const apiSave = (req, res) => {
    const { post, oldPath } = req.body

    if (!post) {
        res.status(400).send('Post is mandatory')
        return
    }

    if (typeof post !== 'string') {
        res.status(400).send('Post should be a string')
        return
    }

    if (typeof oldPath !== 'string' && typeof oldPath !== 'undefined') {
        res.status(400).send('oldPath should be a string')
        return
    }

    res.status(200).json(save(post, oldPath))
}

const apiSetPublish = (publishStatus) => {
    return (req, res) => {
        const { path } = req.body

        if (!path) {
            res.status(400).send('Path is mandatory')
            return
        }

        if (typeof path !== 'string') {
            res.status(400).send('Path should be a string')
            return
        }

        res.status(200).json(setPublish(path, publishStatus))
    }
}

const buildApi = (app) => {
    app.get('/api/get', apiGet)
    app.get('/api/list', apiList)
    app.post('/api/save', apiSave)
    app.delete('/api/delete', fakeHandler)

    app.post('/api/publish', apiSetPublish(true))
    app.post('/api/unpublish', apiSetPublish(false))

    app.post('/api/build', fakeHandler)
    app.post('/api/upload', upload.single('new-image'), async(req, res) => {
        res.status(200).send(req.file.path)
    })
}

module.exports = { buildApi }
