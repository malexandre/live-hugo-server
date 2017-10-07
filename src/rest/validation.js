const { check, validationResult } = require('express-validator/check')

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

const validationHandler = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.mapped() })
    }
    next()
}

module.exports = { checkInteger, checkString, validationHandler }
