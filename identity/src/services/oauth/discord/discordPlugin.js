const oauthPlugin = require('@fastify/oauth2')
const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opt) {
    fastify.register(oauthPlugin, {
        name: 'discordOAuth2',
        scope: ['email', 'identify', 'connection'],
        credentials: {
            client: {
                id: process.env.DISCORD_ID,
                secret: process.env.DISCORD_SECRET_KEY,
            },
            auth: {
                tokenHost: 'https://discord.com',
                authorizePath: '/oauth2/authorize',
                tokenPath: '/api/oauth2/token',
            },
        },
        callbackUri: process.env.DISCORD_REDIRECT_URL,
    })
})
