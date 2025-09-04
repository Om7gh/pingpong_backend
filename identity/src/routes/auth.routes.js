const {
    signInSchema,
    loginSchema,
    activateSchema,
    forgetPasswordSchema,
    resetPasswordSchema,
    completeAuthSchema,
} = require('../schemas/authSchema.js')

const {
    signup,
    activeAccount,
    check2fa,
    forgetPassword,
    login,
    resendOtp,
    resetPassword,
    logout,
    completeAuth,
    refreshToken,
    isAuthenticated,
} = require('../controllers/auth.js')
const fp = require('fastify-plugin')

const authRoutes = async function (fastify, opt) {
    fastify.post('/auth/signup', signInSchema, signup) // done
    fastify.post('/auth/activate-account', activateSchema, activeAccount) // done
    fastify.post('/auth/login', loginSchema, login) // done
    fastify.post('/auth/resend-otp/:username', resendOtp) // done
    fastify.post('/auth/logout', logout) // done
    fastify.post(
        '/auth/complete-auth/:username',
        { completeAuthSchema, consumes: ['multipart/form-data'] },
        completeAuth
    ) // done
    fastify.post('/auth/check-2fa', activateSchema, check2fa) // done
    fastify.post('/auth/refresh-token', refreshToken) // done
    fastify.post('/auth/forget-password', forgetPasswordSchema, forgetPassword) // done
    fastify.post(
        '/auth/reset-password/:token',
        resetPasswordSchema,
        resetPassword
    )
    fastify.post('/auth/me', isAuthenticated) // done
}

module.exports = fp(authRoutes)
