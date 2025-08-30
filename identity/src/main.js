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
