const childProcess = require('child_process')
const hugo = require('../')

jest.mock('../../config', () => ({
    buildCmd: 'hugo'
}))

jest.mock('child_process', () => ({
    exec: jest.fn()
}))

afterEach(() => {
    childProcess.exec.mockClear()
})

test('Calling build should call the build command CLI', () => {
    hugo.build(false) // Problem testing promisify version of exec
    expect(childProcess.exec).toBeCalledWith('hugo')
})
