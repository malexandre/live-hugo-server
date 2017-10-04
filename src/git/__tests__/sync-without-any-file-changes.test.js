const simpleGit = require('../../promisified-libs/simple-git')
const git = require('../')

jest.mock('../../promisified-libs/simple-git', () => ({
    commitAsync: jest.fn(),
    statusAsync: () => ({
        not_added: [], // eslint-disable-line camelcase
        conflicted: [],
        created: [],
        deleted: [],
        modified: [],
        renamed: [],
        files: [{ path: 'src/git/index.js', index: '?', working_dir: '?' }], // eslint-disable-line camelcase
        ahead: 1,
        behind: 0,
        current: 'master',
        tracking: 'origin/master'
    })
}))

test('No commit if there is no uncommited changes', async() => {
    await git.syncFiles('My Message')
    expect(simpleGit.commitAsync).not.toBeCalled()
})
