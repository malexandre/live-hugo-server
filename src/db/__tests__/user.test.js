const bcrypt = require('bcrypt')
const user = require('../user')
const database = require('../database')

const mockDefaultUser = {
    email: 'test',
    password: 'azerty'
}
const mockDefaultBcrypted = 'bcrypted:12:azerty'
const mockDefaultBcryptedUser = Object.assign({}, mockDefaultUser, { password: mockDefaultBcrypted })

jest.mock('../../config', () => ({
    bcryptSaltRounds: 12
}))

jest.mock('../database', () => ({
    getObject: jest.fn((type, email) =>
        Promise.resolve(email === mockDefaultUser.email ? mockDefaultBcryptedUser : null)
    ),
    saveObject: jest.fn()
}))

jest.mock('bcrypt', () => ({
    hash: jest.fn((data, saltRounds) => Promise.resolve(`bcrypted:${saltRounds}:${data}`)),
    compare: jest.fn((data, encryptedData) => Promise.resolve(`bcrypted:12:${data}` === encryptedData))
}))

afterEach(() => {
    bcrypt.hash.mockClear()
    bcrypt.compare.mockClear()
    database.getObject.mockClear()
    database.saveObject.mockClear()
})

test('Calling newUser should return a new user with all the arguments & the password bcrypted', async() => {
    const token = await user.newUser('my email', 'pwd', 'first', 'last', 'gravatar')
    expect(token).toEqual({
        email: 'my email',
        password: 'bcrypted:12:pwd',
        firstname: 'first',
        lastname: 'last',
        avatar: 'gravatar'
    })
    expect(bcrypt.hash).toBeCalledWith('pwd', 12)
})

test('Saving the user should call the database interface', async() => {
    await user.saveUser(mockDefaultBcryptedUser)
    expect(database.saveObject).toBeCalledWith('user', mockDefaultUser.email, mockDefaultBcryptedUser)
})

test('Checking a user should call the database interface and bcrpyt.compare', async() => {
    await user.checkUser(mockDefaultUser.email, mockDefaultUser.password)
    expect(database.getObject).toBeCalledWith('user', mockDefaultUser.email)
    expect(bcrypt.compare).toBeCalledWith(mockDefaultUser.password, mockDefaultBcryptedUser.password)
})

test('Checking an existing user with the right password should return true', async() => {
    expect(await user.checkUser(mockDefaultUser.email, mockDefaultUser.password)).toBe(true)
})

test('Checking an existing user with the wrong password should return false', async() => {
    expect(await user.checkUser(mockDefaultUser.email, 'fake password')).toBe(false)
})

test('Checking a non existing user should return false', async() => {
    expect(await user.checkUser('fake email', 'fake password')).toBe(false)
})
