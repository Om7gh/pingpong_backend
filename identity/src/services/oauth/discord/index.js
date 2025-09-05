const {
    updateUserDiscordId,
    createDiscordUser,
} = require('../../../repositories/oauth.js')
const { getUserByEmail } = require('../../../repositories/userAuth.js')
const app = require('../../../main.js')

const discordAuthProcess = async ({ id, username, avatar, email }) => {
    let user = getUserByEmail(email)
    if (user) {
        if (!user.discord_id) {
            updateUserDiscordId(app.db, id, user.id)
        }
    } else {
        await createDiscordUser(app.db, username, email, avatar, id)
        user = getUserByEmail(email)
    }
    return user
}

module.exports = { discordAuthProcess }
