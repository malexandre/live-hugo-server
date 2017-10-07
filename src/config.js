'use strict'

module.exports = {
    port: process.env.LIVE_HUGO_PORT || 3000,
    buildCmd: process.env.LIVE_HUGO_BUILD_CMD || 'docker-compose run build',
    folders: {
        git: process.env.LIVE_HUGO_GIT_FOLDER || '../blog',
        post: process.env.LIVE_HUGO_POST_FOLDER || '../blog/content/post',
        upload: process.env.LIVE_HUGO_UPLOAD_FOLDER || '../blog/assets/img'
    },
}
