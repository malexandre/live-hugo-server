const fs = require('fs-extra')
const mockFs = require('mock-fs')
const Post = require('../')
const { generatePost, initMockFs } = require('./setup-common')

beforeEach(() => initMockFs())
afterEach(() => mockFs.restore())

test('Publishing an existing draft should remove the draft status', () => {
    const path = 'content/post/random-6.md'
    const sentNotDraftData = generatePost(6, 'Random 6')
    const oldData = fs.readFileSync(path, 'utf8')
    Post.setPublish(path, true)
    const data = fs.readFileSync(path, 'utf8')
    expect(data).toBe(sentNotDraftData)
    expect(data).not.toBe(oldData)
})

test('Unpublishing an existing draft should make no change', () => {
    const path = 'content/post/random-6.md'
    const sentNotDraftData = generatePost(6, 'Random 6')
    const oldData = fs.readFileSync(path, 'utf8')
    Post.setPublish(path, false)
    const data = fs.readFileSync(path, 'utf8')
    expect(data).not.toBe(sentNotDraftData)
    expect(data).toBe(oldData)
})

test('Publishing an existing published version should make no change', () => {
    const path = 'content/post/post-1.md'
    const sentDraftData = generatePost(1, 'Post 1').replace('---', '---\ndraft: true')
    const oldData = fs.readFileSync(path, 'utf8')
    Post.setPublish(path, true)
    const data = fs.readFileSync(path, 'utf8')
    expect(data).not.toBe(sentDraftData)
    expect(data).toBe(oldData)
})

test('Unpublishing an existing published version should add the draft status', () => {
    const path = 'content/post/post-1.md'
    const sentDraftData = generatePost(1, 'Post 1').replace('---', '---\ndraft: true')
    const oldData = fs.readFileSync(path, 'utf8')
    Post.setPublish(path, false)
    const data = fs.readFileSync(path, 'utf8')
    expect(data).toBe(sentDraftData)
    expect(data).not.toBe(oldData)
})

test('Publishing a non-existant file should throw an error', () => {
    expect(() => Post.setPublish('fake path', true)).toThrow()
})

test('Unpublishing a non-existant file should throw an error', () => {
    expect(() => Post.setPublish('fake path', false)).toThrow()
})
