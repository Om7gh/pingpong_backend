const fastify = require('fastify')

const options = {
    logger: {
        level: 'debug',
        transport: {
            target: 'pino-pretty',
        },
    },
}

const app = fastify(options)

app.register(require('./database/chat.js'))
app.register(require('@fastify/websocket'))
app.register(require('./rabbitmq/'))

app.register(require('@fastify/cors'), {
    origin: '*',
    methods: ['POST', 'GET', 'PUT', 'DELETE', 'HEAD'],
    allowedHeaders: ['Content-type', 'authorization'],
    credentials: true,
})

module.exports = app
