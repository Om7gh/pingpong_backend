const generateAvatar = require('../utils/generateAvatar')
const { getUserByUsername } = require('./userAuth')

function updateUserDiscordId(db, id, userId) {
    return db
        .prepare(
            `
        UPDATE users SET discord_id = ?, provider = 'discord' WHERE id = ?
    `
        )
        .run(id, userId)
}

async function createDiscordUser(db, username, email, avatar, id) {
    let finalUsername = username
    let counter = 1
    while (getUserByUsername(finalUsername))
        finalUsername = `${username}_${counter++}`
    let avatarUrl
    if (avatar)
        avatarUrl = `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
    else avatarUrl = await generateAvatar(username)

    return db
        .prepare(
            `
            INSERT INTO users (username, email, avatar, provider, discord_id, password)
            VALUES (?, ?, ?, 'discord', ?, NULL)
        `
        )
        .run(finalUsername, email, avatarUrl, id)
}

module.exports = {
    updateUserDiscordId,
    createDiscordUser,
}
