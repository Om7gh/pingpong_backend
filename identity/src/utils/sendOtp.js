const { sendEmail } = require('../services/email')
const AppError = require('./appError')
const generateOtp = require('./otp')

module.exports = async function (userId, email) {
    const code = generateOtp(userId)
    const text = `your verification code is : ${code}`
    try {
        await sendEmail(email, 'verification Account code', text)
    } catch (err) {
        throw new AppError(err.message, 400)
    }
}
