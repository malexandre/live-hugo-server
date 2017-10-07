'use strict'

module.exports = {
    port: process.env.LIVE_HUGO_PORT || 3000,
    buildCmd: process.env.LIVE_HUGO_BUILD_CMD || 'docker-compose run build',
    bcryptSaltRounds: process.env.LIVE_HUGO_BCRYPT_SALT_ROUNDS || 12,
    initialUser: {
        email: process.env.LIVE_HUGO_INITIAL_USER_EMAIL || 'admin@email.com',
        password: process.env.LIVE_HUGO_INITIAL_USER_PASSWORD || 'password',
        firstname: process.env.LIVE_HUGO_INITIAL_USER_FIRSTNAME || 'Admin',
        lastname: process.env.LIVE_HUGO_INITIAL_USER_LASTNAME || 'Fake Lastname',
        avatar: process.env.LIVE_HUGO_INITIAL_USER_AVATAR || 'https://www.drupal.org/files/issues/default-avatar.png'
    },
    folders: {
        git: process.env.LIVE_HUGO_GIT_FOLDER || './',
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
