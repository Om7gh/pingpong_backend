const app = require('../main.js')
const { getUserByUsername } = require('../repositories/userAuth.js')
const {
    createUser,
    checkOtp,
    checkCompleteProfile,
    checkLoginUser,
    resendOtpProcess,
    forgetPassowrdProcess,
    resetPasswordProcess,
} = require('../services/auth.js')
const AppError = require('../utils/appError.js')
const catchAsyncError = require('../utils/catchAsyncError.js')
const sendOtp = require('../utils/sendOtp.js')

const signup = catchAsyncError(async function (req, rep) {
    const { username, email, password } = req.body
    if (!username || !email || !password)
        throw new AppError('please fill all field', 400)
    const userId = await createUser({ app, username, email, password })
    if (!sendOtp(app, userId, email))
        throw new AppError(
            "pingpop can't send you otp code, try the resend code link"
        )
    rep.send({
        status: 'success',
        message: 'User signed up successfully',
    })
})

const login = catchAsyncError(async function (req, rep) {
    const { username, password } = req.body
    if (!username || !password)
        throw new AppError('Please fill all fields', 400)

    const { access_token, refresh_token } = await checkLoginUser({
        app,
        username,
        password,
    })
    if (access_token === '' && refresh_token === '') {
        const user = getUserByUsername(app, username)
        if (!user) throw new AppError('user not found', 404)
        sendOtp(user.id, user.email)
        return rep.send({
            status: '2fa',
            message: 'verify your 2fa before login',
        })
    }
    rep.setCookie('access-token', access_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    })
        .setCookie('refresh-token', refresh_token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        })
        .send({
            status: 'success',
            message: 'User logged in successfully',
        })
})

const completeAuth = catchAsyncError(async function (req, rep) {
    const parts = await req.parts()
    const username = req.params.username
    if (!username) throw new AppError('you missed username from url', 400)
    await checkCompleteProfile({ app, parts, username })
    rep.send({
        status: 'success',
        message: 'User complete profile successfully',
    })
})

const logout = catchAsyncError(async function (req, rep) {
    rep.clearCookie('refresh-token', {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: true,
    })
        .clearCookie('access-token', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        })
        .send({ status: 'success', message: 'User logged out successfully' })
})

const activeAccount = catchAsyncError(async function (req, rep) {
    const { code, username } = req.body
    if (!code || !username)
        throw new AppError('missing activation code or username')
    await checkOtp({ app, code, username })
    const user = getUserByUsername(app, username)
    const token = app.jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    )
    rep.setCookie('token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }).send({
        status: 'success',
        message: 'User account is activated successfully',
        token,
    })
})

const check2fa = catchAsyncError(async function (req, rep) {
    const { code, username } = req.body
    if (!code || !username) throw new AppError('missing 2fa code or username')
    await checkOtp({ app, code, username })
    const user = getUserByUsername(app, username)
    const token = app.jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    )
    rep.setCookie('token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }).send({
        status: 'success',
        message: 'User logged in successfully',
    })
    rep.send({
        status: 'success',
        message: `Welcome back ${username}`,
    })
})

const forgetPassword = catchAsyncError(async function (req, rep) {
    const { email } = req.body
    if (!email) throw new AppError('email field is required', 400)
    await forgetPassowrdProcess({ app, email })
    rep.send({
        status: 'success',
        message: 'Code send in your mail successfully',
    })
})

const resetPassword = catchAsyncError(async function (req, rep) {
    const { password, repeatPassword } = req.body
    const { token } = req.params

    if (!password) throw new AppError('Missing password', 400)
    if (password !== repeatPassword)
        throw new AppError("password and confirm password doesn't match", 400)
    if (!token) throw new AppError('missing token in params', 400)
    await resetPasswordProcess({ app, password, token })
    rep.send({
        status: 'success',
        message: 'Password has reseted successfully',
    })
})

const resendOtp = catchAsyncError(async function (req, rep) {
    const { username } = req.params
    if (!username) throw new AppError('username missed from params', 400)
    await resendOtpProcess({ username })

    rep.send({
        status: 'success',
        message: 'OTP code has resended to your mail successfully',
    })
})

const refreshToken = catchAsyncError(async function (req, rep) {
    const refreshToken = req.cookies['refresh-token']
    if (!refreshToken) {
        throw new AppError('Missing refresh token', 401)
    }

    const payload = await req.jwtVerify(refreshToken)

    const newAccessToken = fastify.jwt.sign(
        { id: payload.id, username: payload.username },
        { expiresIn: '15m' }
    )
    rep.setCookie('access-token', newAccessToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }).send({
        status: 'success',
        message: 'Token refreshed successfully',
    })
})

const isAuthenticated = catchAsyncError(async function (req, rep) {
    req.jwtVerify()
})

module.exports = {
    signup,
    login,
    logout,
    activeAccount,
    check2fa,
    forgetPassword,
    resetPassword,
    resendOtp,
    completeAuth,
    refreshToken,
    isAuthenticated,
}
