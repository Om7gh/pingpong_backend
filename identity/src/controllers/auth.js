const { createUser, verifyUser } = require('../services/auth.js')
const { sendEmail } = require('../services/otpService.js')
const AppError = require('../utils/appError.js')
const catchAsyncError = require('../utils/catchAsyncError.js')
const generateOtp = require('../utils/otp.js')

const signup = catchAsyncError(async function (req, rep) {
    const { username, email, password } = req.body
    if (!username || !email || !password)
        throw new AppError('please fill all field', 400)
    const userId = createUser({ username, email, password })
    const code = generateOtp(userId)
    const text = `your verification code is : ${code}`
    await sendEmail(email, 'verification Account code', text)
    rep.send({
        status: 'success',
        message: 'User signed up successfully',
        userId,
    })
})

const login = catchAsyncError(async function (req, rep) {
    const { username, password } = req.body
    if (!username || !password) throw new AppError('please fill all field', 400)

    rep.send({ status: 'success', message: 'User logged in successfully' })
})

const logout = catchAsyncError(async function (req, rep) {
    // TODO:

    rep.send({ status: 'success', message: 'User logged out successfully' })
})

const activeAccount = catchAsyncError(async function (req, rep) {
    // TODO:

    rep.send({
        status: 'success',
        message: 'User account is activated successfully',
    })
})

const sendOtp = catchAsyncError(async function (req, rep) {
    // TODO:

    rep.send({ status: 'success', message: 'Otp is send successfully' })
})

const check2fa = catchAsyncError(async function (req, rep) {
    // TODO:

    rep.send({ status: 'success', message: '2FA is checekd successfully' })
})

const forgetPassword = catchAsyncError(async function (req, rep) {
    // TODO:

    rep.send({
        status: 'success',
        message: 'Code send in your mail successfully',
    })
})

const resetPassword = catchAsyncError(async function (req, rep) {
    // TODO:

    rep.send({
        status: 'success',
        message: 'Password has reseted successfully',
    })
})

const resendOtp = catchAsyncError(async function (req, rep) {
    // TODO:

    rep.send({
        status: 'success',
        message: 'OTP code has resended to your mail successfully',
    })
})

module.exports = {
    signup,
    login,
    logout,
    activeAccount,
    sendOtp,
    check2fa,
    forgetPassword,
    resetPassword,
    resendOtp,
}
