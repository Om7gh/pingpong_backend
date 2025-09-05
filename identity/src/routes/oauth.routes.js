const fp = require('fastify-plugin')
const {
    discordAuthorization,
    discordCallback,
} = require('../controllers/OAuth/discord')

const OAuthRoutes = async function (fastify) {
    // discord routes
    fastify.get('/auth/discord/login', discordAuthorization)
    fastify.get('/auth/discord/callback', discordCallback)

    // google routes

    // intra routes
}

module.exports = fp(OAuthRoutes)
