const mockFs = require('mock-fs')

const generatePost = (idx, title, options = {}, content = 'My post') => {
    const date = new Date(idx * 1000)
        .toISOString()
        .replace('T', ' ')
        .substring(0, 19)
    let post = '---\n'
    post += `title: ${title}\n`
    post += `date: ${date}\n`
    Object.keys(options).forEach((key) => {
        post += `${key}: ${options[key]}\n`
    })
    post += '---\n'
    post += content
    return post
}

const initMockFs = () => {
    const posts = {}

    for (let i = 1; i <= 5; ++i) {
        posts[`post-${i}.md`] = generatePost(i, `Post ${i}`)
    }

    for (let i = 6; i <= 15; ++i) {
        posts[`random-${i}.md`] = generatePost(i, `Random ${i}`)
    }

    mockFs({
        content: {
            post: posts
        }
    })
}

module.exports = { generatePost, initMockFs }
