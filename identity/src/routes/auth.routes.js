const {
    signInSchema,
    loginSchema,
    activateSchema,
    forgetPasswordSchema,
    resetPasswordSchema,
    check2faSchema,
} = require('../schemas/authSchema.js')

const {
    signup,
    activeAccount,
    check2fa,
    forgetPassword,
    login,
    resendOtp,
    resetPassword,
    sendOtp,
    logout,
} = require('../controllers/auth.js')
const fp = require('fastify-plugin')

const authRoutes = async function (fastify) {
    fastify.post('/auth/signup', signInSchema, signup)
    fastify.post('/auth/login', loginSchema, login)
    fastify.post('/auth/send-otp', sendOtp)
    fastify.post('/auth/resend-otp', resendOtp)
    fastify.post('/auth/logout', logout)
    fastify.post('/auth/activate-account', activateSchema, activeAccount)
    fastify.post('/auth/check-2fa', check2faSchema, check2fa)
    fastify.post('/auth/forget-password', forgetPasswordSchema, forgetPassword)
    fastify.post('/auth/reset-password', resetPasswordSchema, resetPassword)
}

module.exports = fp(authRoutes)
