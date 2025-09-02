const fp = require('fastify-plugin')
const catchAsyncError = require('../utils/catchAsyncError')

module.exports = fp(async function (fastify, opt) {
    fastify.register(require('@fastify/jwt'), {
        secret: process.env.JWT_SECRET,
        cookie: {
            cookieName: 'token',
            signed: false,
        },
    })

    fastify.decorate(
        'jwtAuth',
        catchAsyncError(async function (req, rep) {
            req.jwtVerify()
        })
    )
})
