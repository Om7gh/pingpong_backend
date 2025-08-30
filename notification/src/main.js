const fastify = require('fastify')
const cors = require('@fastify/cors')

const options = {
    logger: {
        level: 'debug',
        trasnport: {
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
