const mockFs = require('mock-fs')
const Post = require('../')
const { initMockFs } = require('./setup-common')

jest.mock('../../config', () => ({
    postFolder: 'content/post',
    uploadFolder: 'assets/img'
}))

jest.mock('../../git', () => ({
    syncFiles: jest.fn()
}))

beforeEach(() => initMockFs())
afterEach(() => mockFs.restore())

test('Listing posts should have 10 items', async() => {
    const resp = await Post.list()
    expect(resp.items.length).toBe(10)
})

test('Listing posts should have more items', async() => {
    const resp = await Post.list()
    expect(resp.more).toBe(true)
})

test('Listing second page should have 5 items', async() => {
    const resp = await Post.list({ offset: 10 })
    expect(resp.items.length).toBe(5)
})

test('Listing second page should have no more item', async() => {
    const resp = await Post.list({ offset: 10 })
    expect(resp.more).toBe(false)
})

test('Listing third page should have 0 item', async() => {
    const resp = await Post.list({ offset: 20 })
    expect(resp.items.length).toBe(0)
})

test('Listing third page should have no more item', async() => {
    const resp = await Post.list({ offset: 20 })
    expect(resp.more).toBe(false)
})

test('Listing filtered page "Post" should have 5 items', async() => {
    const resp = await Post.list({ filter: 'Post' })
    expect(resp.items.length).toBe(5)
})

test('Listing filtered page "Post" should have no more item', async() => {
    const resp = await Post.list({ filter: 'Post' })
    expect(resp.more).toBe(false)
})

test('Listing 5 posts page should have 5 items', async() => {
    const resp = await Post.list({ count: 5 })
    expect(resp.items.length).toBe(5)
})

test('Listing 5 posts page should have more items', async() => {
    const resp = await Post.list({ count: 5 })
    expect(resp.more).toBe(true)
})

test('Listing 5 posts page order by date should have 5 "Post X" items in order', async() => {
    const resp = await Post.list({ count: 5, orderby: ['date'] })

    for (let i = 0; i < 5; ++i) {
        expect(resp.items[i].title).toBe(`Post ${i + 1}`)
    }
})

test('Listing 5 posts page order by -date should have 5 "Random X" items in order', async() => {
    const resp = await Post.list({ count: 5, orderby: ['-date'] })

    for (let i = 0; i < 5; ++i) {
        expect(resp.items[i].title).toBe(`Random ${15 - i}`)
    }
})

test('Listing 5 posts page order by [-date] should have 5 "Random X" items in order', async() => {
    const resp = await Post.list({ count: 5, orderby: ['-date'] })

    for (let i = 0; i < 5; ++i) {
        expect(resp.items[i].title).toBe(`Random ${15 - i}`)
    }
})
