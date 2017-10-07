const bcrypt = require('bcrypt')
const { crypto } = require('../../promisified-libs')
const { refreshToken } = require('../')
const database = require('../database')

const mockDefaultToken = {
    email: 'test',
    data: 'azerty',
    maxAge: 5
}
const mockDefaultBcrypted = 'bcrypted:salt:12:azerty'
const mockDefaultBcryptedToken = Object.assign({}, mockDefaultToken, { data: mockDefaultBcrypted })

jest.mock('../../config', () => ({
    tokenExpiration: {
        refresh: 5
    },
    bcryptSaltRounds: 12
}))

jest.mock('../../promisified-libs', () => ({
    crypto: {
        randomBytesAsync: jest.fn(() => Promise.resolve(mockDefaultToken.data))
    }
}))

jest.mock('../database', () => ({
    getObject: jest.fn((type, data) => Promise.resolve(data === mockDefaultBcrypted ? mockDefaultBcryptedToken : null)),
    saveObject: jest.fn()
}))

jest.mock('bcrypt', () => ({
    genSalt: jest.fn((saltRounds) => Promise.resolve(`salt:${saltRounds}`)),
    hash: jest.fn((data, salt) => Promise.resolve(`bcrypted:${salt}:${data}`))
}))

afterEach(() => {
    bcrypt.genSalt.mockClear()
    bcrypt.hash.mockClear()
    crypto.randomBytesAsync.mockClear()
    database.getObject.mockClear()
    database.saveObject.mockClear()
})

test('Calling newRefreshToken should return a new token with the email in argument', async() => {
    const token = await refreshToken.newRefreshToken(mockDefaultToken.email)
    expect(token).toEqual(mockDefaultToken)
    expect(crypto.randomBytesAsync).toBeCalled()
})

test('Saving the token should call the database interface after bcrypting the data', async() => {
    await refreshToken.saveRefreshToken(mockDefaultToken)
    expect(database.saveObject).toBeCalledWith('token', mockDefaultBcrypted, mockDefaultBcryptedToken)
    expect(bcrypt.genSalt).toBeCalledWith(12)
    expect(bcrypt.hash).toBeCalledWith(mockDefaultToken.data, 'salt:12')
})

test('Saving the token should returnits salt', async() => {
    const savedToken = await refreshToken.saveRefreshToken(mockDefaultToken)
    expect(savedToken).toEqual('salt:12')
})

test('Checking a token should call the database interface after bcrypting the data', async() => {
    await refreshToken.checkRefreshToken(
        mockDefaultToken.email,
        Object.assign({}, mockDefaultToken, { salt: 'salt:12' })
    )
    expect(database.getObject).toBeCalledWith('token', mockDefaultBcrypted)
    expect(bcrypt.hash).toBeCalledWith(mockDefaultToken.data, 'salt:12')
})

test('Checking an existing token should return true', async() => {
    expect(
        await refreshToken.checkRefreshToken(
            mockDefaultToken.email,
            Object.assign({}, mockDefaultToken, { salt: 'salt:12' })
        )
    ).toBe(true)
})

test('Checking a non existing token should return false', async() => {
    const token = await refreshToken.newRefreshToken('fake email')
    expect(await refreshToken.checkRefreshToken(token.email, Object.assign({}, token, { salt: 'salt:12' }))).toBe(false)
})
