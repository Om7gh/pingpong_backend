const fp = require('fastify-plugin')
const { chatProcess } = require('../controllers/chat')

const chatRoutes = async function (fastify) {
    fastify.get('/ws/chat/:username', { websocket: true }, chatProcess)
}

module.exports = fp(chatRoutes)
