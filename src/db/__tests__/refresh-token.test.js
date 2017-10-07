const bcrypt = require('bcrypt')
const { crypto } = require('../../promisified-libs')
const { refreshToken } = require('../')
const database = require('../database')

const mockDefaultToken = {
    email: 'test',
    data: 'azerty',
    expiration: 5
}
const mockDefaultBcrypted = 'bcrypted:12:azerty'
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
    hash: jest.fn((data, saltRounds) => Promise.resolve(`bcrypted:${saltRounds}:${data}`))
}))

afterEach(() => {
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
    expect(bcrypt.hash).toBeCalledWith(mockDefaultToken.data, 12)
})

test('Checking a token should call the database interface after bcrypting the data', async() => {
    await refreshToken.checkRefreshToken(mockDefaultToken.email, mockDefaultToken)
    expect(database.getObject).toBeCalledWith('token', mockDefaultBcrypted)
    expect(bcrypt.hash).toBeCalledWith(mockDefaultToken.data, 12)
})

test('Checking an existing token should return true', async() => {
    expect(await refreshToken.checkRefreshToken(mockDefaultToken.email, mockDefaultToken)).toBe(true)
})

test('Checking a non existing token should return false', async() => {
    const token = await refreshToken.newRefreshToken('fake email')
    expect(await refreshToken.checkRefreshToken(token.email, token)).toBe(false)
})
