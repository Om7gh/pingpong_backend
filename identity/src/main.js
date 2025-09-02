const fastify = require('fastify')
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

app.register(require('@fastify/cors'), {
    origin: '*',
    methods: ['POST', 'GET', 'PUT', 'DELETE', 'HEAD'],
    allowedHeaders: ['Content-type', 'authorization'],
    credentials: true,
})
app.register(require('./database/db.js'))
app.register(require('@fastify/multipart'))
app.register(require('./services/jwt.js'))
app.register(require('@fastify/cookie'))

app.setErrorHandler((error, request, reply) => {
    if (error.isOperational) {
        reply.status(error.statusCode).send({
            status: error.status,
            message: error.message,
        })
    } else {
        console.error(error)
        reply.status(500).send({
            status: 'error',
            message: 'Something went wrong!',
        })
    }
})

module.exports = app
