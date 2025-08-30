const { signInSchema } = require('../schemas/authSchema.js')
const fp = require('fastify-plugin')

const authRoutes = async function (fastify) {
    fastify.get('/', async (req, rep) => {
        return { message: 'hello world' }
    })
    fastify.post('/auth/signup', signInSchema, async (req, rep) => {
        return { message: 'user signIn Successfully' }
    })
}

module.exports = authRoutes
