'use strict'

const { check, validationResult } = require('express-validator/check')
const multer = require('multer')
const slugify = require('slugify')

const asyncMiddleware = require('../async-middleware')
const { fs } = require('../promisified-libs')
const { folders } = require('../config')
const { del, get, list, save, setPublish } = require('../post')
const checkDirExists = require('../post/check-image-folder-exists')
const Hugo = require('../hugo')

const storage = multer.diskStorage({
    destination: async(req, file, cb) => {
        const postName = req.body.postName
        const postSlug = postName ? `${slugify(postName)}/`.toLowerCase() : ''
        const destFolder = `${folders.upload}/${postSlug}`

        if (postName && !await checkDirExists(destFolder)) {
            await fs.mkdirAsync(destFolder)
        }

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

const apiGet = async(req, res) => {
    const path = req.query.path
    res.status(200).json(await get(path))
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

    const results = await list({
        filter: req.query.filter,
        orderby: orderby,
        offset: !isNaN(offset) && offset >= 0 ? offset : 0,
        count: !isNaN(count) && count > 0 ? count : 10
    })

    res.status(200).json(results)
}

const apiSave = async(req, res) => {
    const { post, oldPath } = req.body
    res.status(200).json(await save(post, oldPath))
}

const apiSetPublish = (publishStatus) => {
    return async(req, res) => {
        const { path } = req.body
        res.status(200).json(await setPublish(path, publishStatus))
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

const buildApi = (app, passport) => {
    app.get(
        '/api/get',
        passport.authenticate('jwt', { session: false }),
        [checkString('path', 'path is required')],
        validationHandler,
        asyncMiddleware(apiGet)
    )
    app.get(
        '/api/list',
        passport.authenticate('jwt', { session: false }),
        [
            checkInteger('offset', 'offset must be a positive integer').optional(),
            checkInteger('count', 'offset must be a positive integer').optional()
        ],
        validationHandler,
        asyncMiddleware(apiList)
    )
    app.post(
        '/api/save',
        passport.authenticate('jwt', { session: false }),
        [checkString('post', 'path is required'), checkString('oldPath', 'oldPath must be valid string').optional()],
        validationHandler,
        asyncMiddleware(apiSave)
    )
    app.delete(
        '/api/delete',
        passport.authenticate('jwt', { session: false }),
        [checkString('path', 'path is required')],
        validationHandler,
        asyncMiddleware(apiDelete)
    )

    app.post(
        '/api/publish',
        passport.authenticate('jwt', { session: false }),
        [checkString('path', 'path is required')],
        validationHandler,
        asyncMiddleware(apiSetPublish(true))
    )
    app.post(
        '/api/unpublish',
        passport.authenticate('jwt', { session: false }),
        [checkString('path', 'path is required')],
        validationHandler,
        asyncMiddleware(apiSetPublish(false))
    )

    app.post(
        '/api/build',
        passport.authenticate('jwt', { session: false }),
        asyncMiddleware(async(req, res) => {
            await Hugo.build()
            res.sendStatus(204)
        })
    )
    app.post(
        '/api/upload',
        passport.authenticate('jwt', { session: false }),
        [checkString('postName', 'postName must be valid string').optional()],
        validationHandler,
        upload.single('new-image'),
        (req, res) => {
            res.status(200).send(req.file.path)
        }
    )
}

module.exports = { buildApi }
