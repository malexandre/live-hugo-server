const fs = require('fs')
const mockFs = require('mock-fs')
const Post = require('../')
const Git = require('../../git')
const { generatePost, initMockFs } = require('./setup-common')

jest.mock('../../config', () => ({
    folders: {
        post: 'content/post',
        upload: 'assets/img'
    }
}))

jest.mock('../../git', () => ({
    syncFiles: jest.fn()
}))

beforeEach(() => initMockFs())
afterEach(() => {
    mockFs.restore()
    Git.syncFiles.mockClear()
})

test('Creating a new post should return the new post JSON with the tile', async() => {
    const resp = await Post.save(generatePost(16, 'Post Test'))
    expect(resp.title).toBe('Post Test')
})

test('Creating a new post should return the new post JSON with the categories', async() => {
    const resp = await Post.save(generatePost(16, 'Post Test', { categories: ['Cat 1', 'Cat 2'] }))
    expect(resp.categories).toEqual(['Cat 1', 'Cat 2'])
})

test('Creating a new post should return the new post JSON with the description', async() => {
    const resp = await Post.save(generatePost(16, 'Post Test', { description: 'My description' }))
    expect(resp.description).toBe('My description')
})

test('Creating a new post should return the new post JSON with the content', async() => {
    const resp = await Post.save(generatePost(16, 'Post Test', undefined, 'Test content'))
    expect(resp.content).toBe('Test content')
})

test('Creating a new post should return the new post JSON with the date', async() => {
    const resp = await Post.save(generatePost(16, 'Post Test', undefined, 'Test content'))
    expect(resp.date).toEqual(new Date(16 * 1000))
})

test('Creating a new post should write the file on the fs', async() => {
    const sentData = generatePost(16, 'Post Test', undefined, 'Test content')
    await Post.save(sentData)
    const data = fs.readFileSync('content/post/post-test.md', 'utf8')
    expect(data).toBe(sentData.replace('---', '---\ndraft: true'))
})

test('Creating a new post should call Git.syncFiles with the right commit message', async() => {
    await Post.save(generatePost(16, 'Post Test', undefined, 'Test content'))
    expect(Git.syncFiles).toBeCalledWith('[HugoLive] New post: post-test.md')
})

test('Saving an existing post should return the new post JSON with the tile', async() => {
    const resp = await Post.save(
        generatePost(1, 'Post 1', { categories: ['Cat 1', 'Cat 2'], description: 'My description' }, 'Test content'),
        'content/post/post-1.md'
    )
    expect(resp.title).toBe('Post 1')
})

test('Saving an existing post should return the new post JSON with the categories', async() => {
    const resp = await Post.save(
        generatePost(1, 'Post 1', { categories: ['Cat 1', 'Cat 2'], description: 'My description' }, 'Test content'),
        'content/post/post-1.md'
    )
    expect(resp.categories).toEqual(['Cat 1', 'Cat 2'])
})

test('Saving an existing post should return the new post JSON with the description', async() => {
    const resp = await Post.save(
        generatePost(1, 'Post 1', { categories: ['Cat 1', 'Cat 2'], description: 'My description' }, 'Test content'),
        'content/post/post-1.md'
    )
    expect(resp.description).toBe('My description')
})

test('Saving an existing post should return the new post JSON with the content', async() => {
    const resp = await Post.save(
        generatePost(1, 'Post 1', { categories: ['Cat 1', 'Cat 2'], description: 'My description' }, 'Test content'),
        'content/post/post-1.md'
    )
    expect(resp.content).toBe('Test content')
})

test('Saving an existing post should return the new post JSON with the date', async() => {
    const resp = await Post.save(
        generatePost(1, 'Post 1', { categories: ['Cat 1', 'Cat 2'], description: 'My description' }, 'Test content'),
        'content/post/post-1.md'
    )
    expect(resp.date).toEqual(new Date(1 * 1000))
})

test('Saving an existing post should write the file on the fs', async() => {
    const oldPath = 'content/post/post-1.md'
    const oldData = fs.readFileSync(oldPath, 'utf8')
    const sentData = generatePost(
        1,
        'Post 1',
        { categories: ['Cat 1', 'Cat 2'], description: 'My description' },
        'Test content'
    )
    await Post.save(sentData, oldPath)
    const data = fs.readFileSync(oldPath, 'utf8')
    expect(data).toBe(sentData)
    expect(data).not.toBe(oldData)
})

test('Saving an existing post should call Git.syncFiles with the right commit message', async() => {
    await Post.save(generatePost(1, 'Post 1'), 'content/post/post-1.md')
    expect(Git.syncFiles).toBeCalledWith('[HugoLive] Edit post: post-1.md')
})

test('Saving an existing post with a new name should move the file on the fs', async() => {
    const oldPath = 'content/post/post-1.md'
    const oldData = fs.readFileSync(oldPath, 'utf8')
    const sentData = generatePost(
        1,
        'New Post 1',
        { categories: ['Cat 1', 'Cat 2'], description: 'My description' },
        'Test content'
    )
    await Post.save(sentData, oldPath)
    const data = fs.readFileSync('content/post/new-post-1.md', 'utf8')
    expect(data).toBe(sentData)
    expect(data).not.toBe(oldData)
    expect(() => fs.readFileSync(oldPath, 'utf8')).toThrowError('ENOENT')
})

test('Saving an existing post with a new name should move the images on the fs', async() => {
    const newImagePath = 'assets/img/new-post-1/fake-image.jpg'
    const oldImagePath = 'assets/img/post-1/fake-image.jpg'
    const oldImageData = fs.readFileSync(oldImagePath, 'utf8')
    const sentData = generatePost(
        1,
        'New Post 1',
        { categories: ['Cat 1', 'Cat 2'], description: 'My description' },
        'Test content'
    )
    await Post.save(sentData, 'content/post/post-1.md')
    const data = fs.readFileSync(newImagePath, 'utf8')
    expect(data).toBe(oldImageData)
    expect(() => fs.readFileSync(oldImagePath, 'utf8')).toThrowError('ENOENT')
})

test('Saving an existing post with a new name should work with a post without image folder', async() => {
    const oldPath = 'content/post/post-2.md'
    const oldData = fs.readFileSync(oldPath, 'utf8')
    const sentData = generatePost(
        1,
        'New Post 2',
        { categories: ['Cat 1', 'Cat 2'], description: 'My description' },
        'Test content'
    )
    await Post.save(sentData, oldPath)
    const data = fs.readFileSync('content/post/new-post-2.md', 'utf8')
    expect(data).toBe(sentData)
    expect(data).not.toBe(oldData)
    expect(() => fs.readFileSync(oldPath, 'utf8')).toThrowError('ENOENT')
})

test('Saving an existing post with a new name should call Git.syncFiles with the right commit message', async() => {
    await Post.save(generatePost(1, 'New Post 1'), 'content/post/post-1.md')
    expect(Git.syncFiles).toBeCalledWith('[HugoLive] Move post: post-1.md to new-post-1.md')
})

test('Saving an existing post with a new name already used by another post should throw an error', async() => {
    const oldPath = 'content/post/post-1.md'
    const oldData = fs.readFileSync(oldPath, 'utf8')
    const newImagePath = 'assets/img/post-2/fake-image.jpg'
    const oldImagePath = 'assets/img/post-1/fake-image.jpg'
    const oldImageData = fs.readFileSync(oldImagePath, 'utf8')
    const sentData = generatePost(
        1,
        'Post 2',
        { categories: ['Cat 1', 'Cat 2'], description: 'My description' },
        'Test content'
    )
    expect.assertions(6)
    try {
        await Post.save(sentData, oldPath)
    }
    catch (e) {
        expect(e.message.includes('Post.save: Path already used by another file')).toBe(true)
    }
    const data = fs.readFileSync(oldPath, 'utf8')
    expect(data).not.toBe(sentData)
    expect(data).toBe(oldData)
    expect(fs.readFileSync(oldImagePath, 'utf8')).toBe(oldImageData)
    expect(() => fs.readFileSync(newImagePath, 'utf8')).toThrowError('ENOENT')
    expect(Git.syncFiles).not.toBeCalled()
})

test('Saving an non-existing post with a wrong oldName should throw an error', async() => {
    expect.assertions(2)
    try {
        await Post.save(generatePost(20, 'Test Post'), 'fake path')
    }
    catch (e) {
        expect(e.code).toBe('ENOENT')
    }
    expect(Git.syncFiles).not.toBeCalled()
})

test('Saving an existing post without draft status should keep the same draft status on the fs', async() => {
    const sentNotDraftData = generatePost(
        1,
        'Post 1',
        { categories: ['Cat 1', 'Cat 2'], description: 'My description' },
        'Test content'
    )
    await Post.save(sentNotDraftData, 'content/post/post-1.md')
    const notDraftData = fs.readFileSync('content/post/post-1.md', 'utf8')
    expect(notDraftData).toBe(sentNotDraftData)

    const sentDraftData = generatePost(
        6,
        'Random 6',
        { categories: ['Cat 1', 'Cat 2'], description: 'My description' },
        'Test content'
    )
    await Post.save(sentDraftData, 'content/post/random-6.md')
    const data = fs.readFileSync('content/post/random-6.md', 'utf8')
    expect(data).toBe(sentDraftData.replace('---', '---\ndraft: true'))
})

test('Saving an existing post with a changed draft status should keep the same draft status on the fs', async() => {
    const sentNotDraftData = generatePost(
        1,
        'Post 1',
        { categories: ['Cat 1', 'Cat 2'], description: 'My description' },
        'Test content'
    )
    await Post.save(sentNotDraftData.replace('---', '---\ndraft: true'), 'content/post/post-1.md')
    const notDraftData = fs.readFileSync('content/post/post-1.md', 'utf8')
    expect(notDraftData).toBe(sentNotDraftData)

    const sentDraftData = generatePost(
        6,
        'Random 6',
        { categories: ['Cat 1', 'Cat 2'], description: 'My description' },
        'Test content'
    ).replace('---', '---\ndraft: false')
    await Post.save(sentDraftData, 'content/post/random-6.md')
    const data = fs.readFileSync('content/post/random-6.md', 'utf8')
    expect(data).toBe(sentDraftData.replace('---', '---\ndraft: true'))
})
