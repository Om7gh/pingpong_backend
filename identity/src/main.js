const fastify = require('fastify')
const cors = require('@fastify/cors')
require('dotenv').config()

const options = {
    logger: {
        level: 'debug',
        transport: {
            target: 'pino-pretty',
        },
    },
}

const app = fastify(options)

app.register(cors, {
    origin: '*',
    methods: ['POST', 'GET', 'PUT', 'DELETE', 'HEAD'],
    allowedHeaders: ['Content-type', 'authorization'],
    credentials: true,
})

module.exports = app
