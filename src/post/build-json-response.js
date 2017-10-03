const buildJsonResponse = (yamlData) => {
    const postJson = Object.assign({ content: yamlData.body }, yamlData.attributes)
    if (postJson.categories) {
        postJson.categories = postJson.categories.split(',')
    }
    return postJson
}

module.exports = buildJsonResponse
