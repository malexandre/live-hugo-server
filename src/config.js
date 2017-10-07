'use strict'

module.exports = {
    port: process.env.LIVE_HUGO_PORT || 3000,
    buildCmd: process.env.LIVE_HUGO_BUILD_CMD || 'docker-compose run build',
    bcryptSaltRounds: process.env.LIVE_HUGO_BCRYPT_SALT_ROUNDS || 12,
    folders: {
        git: process.env.LIVE_HUGO_GIT_FOLDER || '../blog',
        post: process.env.LIVE_HUGO_POST_FOLDER || '../blog/content/post',
        upload: process.env.LIVE_HUGO_UPLOAD_FOLDER || '../blog/assets/img'
    },
    tokenExpiration: {
        access: process.env.LIVE_HUGO_ACCESS_TOKEN_EXPIRATION || 15 * 60, // In seconds
        refresh: process.env.LIVE_HUGO_REFRESH_TOKEN_EXPIRATION || 7 * 24 * 60 * 60 // In seconds
    },
    redis: {
        host: process.env.LIVE_HUGO_REDIS_HOST || 'redis',
        port: process.env.LIVE_HUGO_REDIS_PORT || 6379
    },
    jwtSecret: process.env.LIVE_HUGO_JWT_SECRET || 'jyNwL1Dhm1VC0sX6cdVFELkHCXCu9lL6AylFDaWGJevTjuUlYaeDPGR3E8'
}
