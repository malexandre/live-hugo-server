const fs = require('fs-extra')
const mockFs = require('mock-fs')
const Post = require('../')
const { generatePost, initMockFs } = require('./setup-common')

beforeEach(() => initMockFs())
afterEach(() => mockFs.restore())

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

test('Creating a new post should write the file on the file system', async() => {
    const sentData = generatePost(16, 'Post Test', undefined, 'Test content')
    await Post.save(sentData)
    const data = fs.readFileSync('content/post/post-test.md', 'utf8')
    expect(data).toBe(sentData)
})

test('Saving an existing post should return the new post JSON with the tile', async() => {
    const resp = await Post.save(
        generatePost(1, 'Post 1', { categories: ['Cat 1', 'Cat 2'], description: 'My description' }, 'Test content')
    )
    expect(resp.title).toBe('Post 1')
})

test('Saving an existing post should return the new post JSON with the categories', async() => {
    const resp = await Post.save(
        generatePost(1, 'Post 1', { categories: ['Cat 1', 'Cat 2'], description: 'My description' }, 'Test content')
    )
    expect(resp.categories).toEqual(['Cat 1', 'Cat 2'])
})

test('Saving an existing post should return the new post JSON with the description', async() => {
    const resp = await Post.save(
        generatePost(1, 'Post 1', { categories: ['Cat 1', 'Cat 2'], description: 'My description' }, 'Test content')
    )
    expect(resp.description).toBe('My description')
})

test('Saving an existing post should return the new post JSON with the content', async() => {
    const resp = await Post.save(
        generatePost(1, 'Post 1', { categories: ['Cat 1', 'Cat 2'], description: 'My description' }, 'Test content')
    )
    expect(resp.content).toBe('Test content')
})

test('Saving an existing post should return the new post JSON with the date', async() => {
    const resp = await Post.save(
        generatePost(1, 'Post 1', { categories: ['Cat 1', 'Cat 2'], description: 'My description' }, 'Test content')
    )
    expect(resp.date).toEqual(new Date(1 * 1000))
})

test('Saving an existing post should write the file on the file system', async() => {
    const oldData = fs.readFileSync('content/post/post-1.md', 'utf8')
    const sentData = generatePost(
        1,
        'Post 1',
        { categories: ['Cat 1', 'Cat 2'], description: 'My description' },
        'Test content'
    )
    await Post.save(sentData)
    const data = fs.readFileSync('content/post/post-1.md', 'utf8')
    expect(data).toBe(sentData)
    expect(data).not.toBe(oldData)
})