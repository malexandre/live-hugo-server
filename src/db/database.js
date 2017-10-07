const { createClient } = require('redis')
const { promisify } = require('util')

const redisClient = createClient({ host: 'redis', port: 6379 })
const promisifiedClient = Object.assign({}, redisClient, {
    expireAsync: promisify(redisClient.expire).bind(redisClient),
    hgetallAsync: promisify(redisClient.hgetall).bind(redisClient),
    hmsetAsync: promisify(redisClient.hmset).bind(redisClient)
})

const getObject = async(type, key) => await promisifiedClient.hgetallAsync(`${type}:${key}`)

const saveObject = async(type, key, data, expiration) => {
    await promisifiedClient.hmsetAsync(`${type}:${key}`, data)

    if (expiration) {
        await promisifiedClient.expireAsync(`${type}:${key}`, expiration)
    }
}

module.exports = { getObject, saveObject }
