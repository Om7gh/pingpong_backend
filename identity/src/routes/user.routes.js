const fp = require('fastify-plugin')

const {
    updateBioSchema,
    updatePasswordSchema,
    updateUsernameSchema,
} = require('../schemas/userSchema')
const catchAsyncError = require('../utils/catchAsyncError')
const { active2fa, updateUserAvatar } = require('../controllers/user')

const userRoutes = async function (fastify) {
    fastify.addHook(
        'onRequest',
        catchAsyncError(async function (req, rep) {
            req.jwtVerify()
        })
    )
    fastify.put(
        '/user/update/password/:username',
        updatePasswordSchema,
        updateUserPassword
    )
    fastify.put('/user/update/avatar/:username', updateUserAvatar)
    fastify.put('/user/update/bio/:username', updateBioSchema, updateUserBio)
    fastify.put(
        '/user/update/username/:username',
        updateUsernameSchema,
        updateUserUsername
    )
    fastify.put('/user/block-account', deleteAccount)
    fastify.put('/user/active-2fa', active2faSchema, active2fa)
}

module.exports = fp(userRoutes)
