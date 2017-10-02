const generatePost = (idx, title) => {
    const date = new Date(idx * 1000)
        .toISOString()
        .replace('T', ' ')
        .substring(0, 19)
    let post = '---\n'
    post += `title: ${title}\n`
    post += `date: ${date}\n`
    post += 'categories: ["Cat 1", "Cat 2"]\n'
    post += '---\n'
    post += 'My post'
    return post
}

module.exports = { generatePost }
