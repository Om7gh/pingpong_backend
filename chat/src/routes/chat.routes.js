const fp = require('fastify-plugin')
const { chatProcess } = require('../controllers/chat')

const chatRoutes = async function (fastify) {
    fastify.get('/ws/chat/:username', { websocket: true }, chatProcess)

    fastify.get('/chat/conversations/:username', getConversations)
    fastify.get('/chat/messages/:conversation_id', getMessages)
    fastify.put('/chat/messages/:conversation_id/seen', markMessagesSeen)
    fastify.post('/chat/messages', sendMessage)
    fastify.get('/chat/messages/pending/:username', getPendingMessages)
}

module.exports = fp(chatRoutes)
