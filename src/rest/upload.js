const multer = require('multer')
const slugify = require('slugify')

const checkDirExists = require('../post/check-image-folder-exists')
const { folders } = require('../config')
const { fs } = require('../promisified-libs')

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

module.exports = upload
