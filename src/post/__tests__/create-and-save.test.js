const fs = require('fs-extra')
const mockFs = require('mock-fs')
const Post = require('../')
const { generatePost, initMockFs } = require('./setup-common')

beforeEach(() => initMockFs())
afterEach(() => mockFs.restore())

test('Creating a new post should return the new post JSON with the tile', () => {
    const resp = Post.save(generatePost(16, 'Post Test'))
    expect(resp.title).toBe('Post Test')
})

test('Creating a new post should return the new post JSON with the categories', () => {
    const resp = Post.save(generatePost(16, 'Post Test', { categories: ['Cat 1', 'Cat 2'] }))
    expect(resp.categories).toEqual(['Cat 1', 'Cat 2'])
})

test('Creating a new post should return the new post JSON with the description', () => {
    const resp = Post.save(generatePost(16, 'Post Test', { description: 'My description' }))
    expect(resp.description).toBe('My description')
})

test('Creating a new post should return the new post JSON with the content', () => {
    const resp = Post.save(generatePost(16, 'Post Test', undefined, 'Test content'))
    expect(resp.content).toBe('Test content')
})

test('Creating a new post should return the new post JSON with the date', () => {
    const resp = Post.save(generatePost(16, 'Post Test', undefined, 'Test content'))
    expect(resp.date).toEqual(new Date(16 * 1000))
})

test('Creating a new post should write the file on the fs', () => {
    const sentData = generatePost(16, 'Post Test', undefined, 'Test content')
    Post.save(sentData)
    const data = fs.readFileSync('content/post/post-test.md', 'utf8')
    expect(data).toBe(sentData.replace('---', '---\ndraft: true'))
})

test('Saving an existing post should return the new post JSON with the tile', () => {
    const resp = Post.save(
        generatePost(1, 'Post 1', { categories: ['Cat 1', 'Cat 2'], description: 'My description' }, 'Test content')
    )
    expect(resp.title).toBe('Post 1')
})

test('Saving an existing post should return the new post JSON with the categories', () => {
    const resp = Post.save(
        generatePost(1, 'Post 1', { categories: ['Cat 1', 'Cat 2'], description: 'My description' }, 'Test content')
    )
    expect(resp.categories).toEqual(['Cat 1', 'Cat 2'])
})

test('Saving an existing post should return the new post JSON with the description', () => {
    const resp = Post.save(
        generatePost(1, 'Post 1', { categories: ['Cat 1', 'Cat 2'], description: 'My description' }, 'Test content')
    )
    expect(resp.description).toBe('My description')
})

test('Saving an existing post should return the new post JSON with the content', () => {
    const resp = Post.save(
        generatePost(1, 'Post 1', { categories: ['Cat 1', 'Cat 2'], description: 'My description' }, 'Test content')
    )
    expect(resp.content).toBe('Test content')
})

test('Saving an existing post should return the new post JSON with the date', () => {
    const resp = Post.save(
        generatePost(1, 'Post 1', { categories: ['Cat 1', 'Cat 2'], description: 'My description' }, 'Test content')
    )
    expect(resp.date).toEqual(new Date(1 * 1000))
})

test('Saving an existing post should write the file on the fs', () => {
    const oldData = fs.readFileSync('content/post/post-1.md', 'utf8')
    const sentData = generatePost(
        1,
        'Post 1',
        { categories: ['Cat 1', 'Cat 2'], description: 'My description' },
        'Test content'
    )
    Post.save(sentData)
    const data = fs.readFileSync('content/post/post-1.md', 'utf8')
    expect(data).toBe(sentData)
    expect(data).not.toBe(oldData)
})

test('Saving an existing post with a new name should move the file on the fs', () => {
    const oldPath = 'content/post/post-1.md'
    const oldData = fs.readFileSync(oldPath, 'utf8')
    const sentData = generatePost(
        1,
        'New Post 1',
        { categories: ['Cat 1', 'Cat 2'], description: 'My description' },
        'Test content'
    )
    Post.save(sentData, oldPath)
    const data = fs.readFileSync('content/post/new-post-1.md', 'utf8')
    expect(data).toBe(sentData)
    expect(data).not.toBe(oldData)
    expect(() => fs.readFileSync(oldPath, 'utf8')).toThrowError('ENOENT')
})

test('Saving an non-existing post with a wrong oldName should throw an error', () => {
    expect(() => Post.save(generatePost(20, 'Test Post'), 'fake path')).toThrowError('ENOENT')
})

test('Saving an existing post without draft status should keep the same draft status on the fs', () => {
    const sentNotDraftData = generatePost(
        1,
        'Post 1',
        { categories: ['Cat 1', 'Cat 2'], description: 'My description' },
        'Test content'
    )
    Post.save(sentNotDraftData)
    const notDraftData = fs.readFileSync('content/post/post-1.md', 'utf8')
    expect(notDraftData).toBe(sentNotDraftData)

    const sentDraftData = generatePost(
        6,
        'Random 6',
        { categories: ['Cat 1', 'Cat 2'], description: 'My description' },
        'Test content'
    )
    Post.save(sentDraftData)
    const data = fs.readFileSync('content/post/random-6.md', 'utf8')
    expect(data).toBe(sentDraftData.replace('---', '---\ndraft: true'))
})

test('Saving an existing post with a changed draft status should keep the same draft status on the fs', () => {
    const sentNotDraftData = generatePost(
        1,
        'Post 1',
        { categories: ['Cat 1', 'Cat 2'], description: 'My description' },
        'Test content'
    )
    Post.save(sentNotDraftData.replace('---', '---\ndraft: true'))
    const notDraftData = fs.readFileSync('content/post/post-1.md', 'utf8')
    expect(notDraftData).toBe(sentNotDraftData)

    const sentDraftData = generatePost(
        6,
        'Random 6',
        { categories: ['Cat 1', 'Cat 2'], description: 'My description' },
        'Test content'
    ).replace('---', '---\ndraft: false')
    Post.save(sentDraftData)
    const data = fs.readFileSync('content/post/random-6.md', 'utf8')
    expect(data).toBe(sentDraftData.replace('---', '---\ndraft: true'))
})
