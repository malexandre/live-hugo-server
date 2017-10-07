const { checkInteger, checkString, validationHandler } = require('./validation')
const upload = require('./upload')

const asyncMiddleware = require('../async-middleware')
const Post = require('../post')
const Hugo = require('../hugo')

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

    const results = await Post.list({
        filter: req.query.filter,
        orderby: orderby,
        offset: !isNaN(offset) && offset >= 0 ? offset : 0,
        count: !isNaN(count) && count > 0 ? count : 10
    })

    res.status(200).json(results)
}

const apiSetPublish = (publishStatus) => {
    return async(req, res) => {
        const { path } = req.body
        res.status(200).json(await Post.setPublish(path, publishStatus))
    }
}

const buildApi = (app, passport) => {
    app.get(
        '/api/get',
        passport.authenticate('jwt', { session: false }),
        [checkString('path', 'path is required')],
        validationHandler,
        asyncMiddleware(async(req, res) => {
            const path = req.query.path
            res.status(200).json(await Post.get(path))
        })
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
        asyncMiddleware(async(req, res) => {
            const { post, oldPath } = req.body
            res.status(200).json(await Post.save(post, oldPath))
        })
    )
    app.delete(
        '/api/delete',
        passport.authenticate('jwt', { session: false }),
        [checkString('path', 'path is required')],
        validationHandler,
        asyncMiddleware(async(req, res) => {
            const path = req.query.path
            await Post.del(path)
            res.sendStatus(204)
        })
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
