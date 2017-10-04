'use strict'

const { check, validationResult } = require('express-validator/check')
const multer = require('multer')
const slugify = require('slugify')

const { uploadFolder } = require('../config')
const { del, get, list, save, setPublish } = require('../post')
const Hugo = require('../hugo')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let postName = req.body.postName

        if (typeof postName !== 'string' || !postName) {
            postName = undefined
        }

        const postSlug = postName ? `${slugify(postName)}/`.toLowerCase() : ''
        const destFolder = `${uploadFolder}/${postSlug}`
        cb(null, destFolder)
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

const validationHandler = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.mapped() })
    }
    next()
}

const apiDelete = async(req, res) => {
    const path = req.query.path
    await del(path)
    res.sendStatus(204)
}

const apiGet = (req, res) => {
    const path = req.query.path
    res.status(200).json(get(path))
}

const apiList = async(req, res) => {
    const count = parseInt(req.query.count)
    const offset = parseInt(req.query.offset)
    let orderby

    if (Array.isArray(req.query.filter)) {
        return res.status(400).send('filter should be unique')
    }

    if (req.query.orderby && !Array.isArray(req.query.orderby)) {
        orderby = [req.query.orderby]
    }
    else {
        orderby = req.query.orderby
    }

    const results = list({
        filter: req.query.filter,
        orderby: orderby,
        offset: !isNaN(offset) && offset >= 0 ? offset : 0,
        count: !isNaN(count) && count > 0 ? count : 10
    })

    res.status(200).json(results)
}

const apiSave = (req, res) => {
    const { post, oldPath } = req.body
    res.status(200).json(save(post, oldPath))
}

const apiSetPublish = (publishStatus) => {
    return (req, res) => {
        const { path } = req.body
        res.status(200).json(setPublish(path, publishStatus))
    }
}

const checkString = (varName) =>
    check(varName)
        .exists()
        .trim()
        .not()
        .isEmpty()

const checkInteger = (varName) =>
    check(varName)
        .exists()
        .trim()
        .not()
        .isEmpty()
        .isInt({ gt: 0 })
        .toInt()

const buildApi = (app) => {
    app.get('/api/get', [checkString('path', 'path is required')], validationHandler, apiGet)
    app.get(
        '/api/list',
        [
            checkInteger('offset', 'offset must be a positive integer').optional(),
            checkInteger('count', 'offset must be a positive integer').optional()
        ],
        validationHandler,
        apiList
    )
    app.post(
        '/api/save',
        [checkString('post', 'path is required'), checkString('oldPath', 'oldPath must be valid string').optional()],
        validationHandler,
        apiSave
    )
    app.delete('/api/delete', [checkString('path', 'path is required')], validationHandler, apiDelete)

    app.post('/api/publish', [checkString('path', 'path is required')], validationHandler, apiSetPublish(true))
    app.post('/api/unpublish', [checkString('path', 'path is required')], validationHandler, apiSetPublish(false))

    app.post('/api/build', async(req, res) => {
        await Hugo.build()
        res.sendStatus(204)
    })
    app.post('/api/upload', upload.single('new-image'), (req, res) => {
        res.status(200).send(req.file.path)
    })
}

module.exports = { buildApi }
