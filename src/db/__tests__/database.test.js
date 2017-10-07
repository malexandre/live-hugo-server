const redisMock = require('redis-mock')
const database = require('../database')

const client = redisMock.createClient()

jest.mock('redis', () => require('redis-mock'))

afterEach(() => client.flushall())

test('Saving an object should store it in Redis using the type & key as the redis key', async(done) => {
    expect.assertions(1)
    await database.saveObject('test', '1', { test: 'wat' })
    client.hgetall('test:1', (err, result) => {
        expect(result).toEqual({ test: 'wat' })
        done()
    })
})

test('Saving an object and fetching it should return the object saved', async() => {
    await database.saveObject('test', '1', { test: 'wat' })
    expect(await database.getObject('test', '1')).toEqual({ test: 'wat' })
})

test('Saving over an existing object and fetching it should return the second object saved', async() => {
    await database.saveObject('test', '1', { test: 'wat' })
    await database.saveObject('test', '1', { test: 'wut' })
    expect(await database.getObject('test', '1')).toEqual({ test: 'wut' })
})

test('Fetching a non existing object should', async() => {
    expect(await database.getObject('test', '1')).toBe(null)
})
