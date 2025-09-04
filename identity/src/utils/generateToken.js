const crypto = require('crypto')

module.exports = function generateToken() {
    const newToken = crypto.randomBytes(20).toString('hex')
    const token = crypto.createHash('sha256').update(newToken).digest('hex')
    return token
}
