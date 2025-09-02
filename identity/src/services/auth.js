const bcrypt = require('bcrypt')
const app = require('../main.js')
const crypto = require('crypto')
const cloudinary = require('../config/cloudinary.js')

const {
    createUser: newUser,
    verifyOtp,
    getUserByUsername,
    storeAvatarAndBio,
    getLatestOtp,
    getUserByEmail,
    storeResetToken,
} = require('../repositories/userAuth.js')
const AppError = require('../utils/appError.js')
const jwt = require('./jwt.js')
const { sendEmail } = require('./email.js')
const generateOtp = require('../utils/otp.js')
const createUser = async function ({ username, email, password }) {
    const passwordHash = await bcrypt.hash(password, 12)
    try {
        const userId = newUser({ username, email, passwordHash })
        return userId
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new AppError('Username or email already exists', 400)
        }
        throw new AppError('Database error', 500)
    }
}

const checkCompleteProfile = async function ({ parts, username }) {
    let avatar = ''
    let bio = ''

    for await (const part of parts) {
        if (part.fieldname === 'avatar') {
            avatar = part.value
        } else if (!part.file && part.fieldname === 'bio') bio = part.value
    }

    if (bio == '') bio = 'bio is empty'
    if (avatar === '') {
        const { id } = getUserByUsername(username)
        avatar = `https://avatar.iran.liara.run/public/${id}`
    }
    storeAvatarAndBio({ avatar, bio, username })
}

const checkOtp = async function ({ code, username }) {
    const { id } = getUserByUsername(username)
    return verifyOtp(id, code)
}

const checkLoginUser = async function ({ username, password }) {
    const user = getUserByUsername(username)
    if (!user) throw new AppError('Invalid username or password', 401)
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new AppError('Invalid username or password', 401)
    if (!user.isVerified)
        throw new AppError('Please verify your account first', 403)
    if (user.enable2fa) {
        return { access_token: '', refresh_token: '' }
    }
    const access_token = app.jwt.sign(
        { id: user.id, username: user.username },
        { expiresIn: '15m' }
    )
    const refresh_token = app.jwt.sign(
        { id: user.id, username: user.username },
        { expiresIn: '7d' }
    )
    return { access_token, refresh_token }
}

const resendOtpProcess = async function ({ username }) {
    const user = await getUserByUsername(username)
    if (!user) throw new AppError('User not found!', 404)

    let otpRow = getLatestOtp(user.id)
    const now = new Date()

    if (!otpRow || otpRow.used || new Date(otpRow.expires_at) < now) {
        const code = generateOtp(user.id)
        const text = `Your verification code is: ${code}`
        await sendEmail(user.email, 'Resend OTP Verification', text)

        return code
    }

    await sendEmail(
        user.email,
        'Resend OTP Verification',
        `Your verification code is: ${otpRow.code}`
    )
    return otpRow.code
}

const resetPassowrdProcess = async function ({ email }) {
    const user = await getUserByEmail(email)
    if (!user) throw new AppError('User not found', 404)

    const token = crypto.randomBytes(20).toString('hex')
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex')
    const resetPasswordExpire = Date.now() + 15 * 60 * 1000
    await storeResetToken({
        resetPasswordToken,
        resetPasswordExpire,
        id: user.id,
    })
    const resetPasswordUrl = `http://localhost:3000/password/reset/${resetPasswordToken}`
    const message = `Your password reset link : ${resetPasswordUrl}\n\n if you dont request it please ignore it`

    await sendEmail(email, 'reset password url', message)
}

module.exports = {
    createUser,
    checkOtp,
    checkCompleteProfile,
    checkLoginUser,
    resendOtpProcess,
    resetPassowrdProcess,
}
