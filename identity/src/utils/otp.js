const { createOtp } = require('../repositories/userAuth')

function generateOtp(app, userId) {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    createOtp(app, userId, code, expiresAt)
    console.log(code)
    return code
}

module.exports = generateOtp
