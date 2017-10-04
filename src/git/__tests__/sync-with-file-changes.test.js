const simpleGit = require('../../promise-simple-git/')
const git = require('../')

jest.mock('../../promise-simple-git/', () => ({
    commitAsync: jest.fn(),
    statusAsync: () => ({
        not_added: ['file1', 'file2'], // eslint-disable-line camelcase
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

test('Commit all unstaged files', async() => {
    await git.syncFiles('My Message')
    expect(simpleGit.commitAsync).toBeCalledWith('My Message', ['file1', 'file2'])
})
