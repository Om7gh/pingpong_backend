const fp = require('fastify-plugin')
const { chatProcess, seenMessage } = require('../controllers/chat')

const chatRoutes = async function (fastify) {
    fastify.get('/ws/chat/:username', { websocket: true }, chatProcess)
    fastify.put('/ws/chat/:conversationId/seen', seenMessage)
}

module.exports = fp(chatRoutes)
