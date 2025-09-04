const app = require('../main.js')
const AppError = require('../utils/appError.js')

function createUser({ username, email, passwordHash }) {
    const stmt = app.db
        .prepare(
            `
        INSERT INTO users (username, email, password)
        VALUES (?, ?, ?)
    `
        )
        .run(username, email, passwordHash)
    return stmt.lastInsertRowid
}

function storeAvatarAndBio({ avatar, bio, username }) {
    const stmt = app.db.prepare(`
        UPDATE users 
        SET avatar = ?, bio = ?
        WHERE username = ?
    `)
    stmt.run(avatar, bio, username)
}

function getUserByUsername(username) {
    return app.db
        .prepare(`SELECT * FROM users WHERE username = ?`)
        .get(username)
}

function getUserByResetToken(token) {
    const date = Date.now()
    console.log(typeof date)
    return app.db
        .prepare(
            `SELECT * FROM users WHERE resetPasswordToken = ? And resetPasswordExpire > ?`
        )
        .get(token, date)
}

function getUserByEmail(email) {
    return app.db.prepare(`SELECT * FROM users WHERE email = ?`).get(email)
}

function storeResetToken({ resetPasswordToken, resetPasswordExpire, id }) {
    return app.db
        .prepare(
            `UPDATE users SET resetPasswordToken = ?, resetPasswordExpire = ? WHERE id = ?`
        )
        .run(resetPasswordToken, resetPasswordExpire, id)
}

function getUserById(id) {
    return app.db.prepare(`SELECT * FROM users WHERE id = ?`).get(id)
}

function activateUser(userId) {
    return app.db
        .prepare(`UPDATE users SET isVerified = 1 WHERE id = ?`)
        .run(userId)
}

function updatePassword(userId, newPasswordHash) {
    return app.db
        .prepare(`UPDATE users SET password = ? WHERE id = ?`)
        .run(newPasswordHash, userId)
}

function enable2FA(userId) {
    return app.db
        .prepare(`UPDATE users SET enable2fa = 1 WHERE id = ?`)
        .run(userId)
}

function createOtp(userId, code, expiresAt) {
    return app.db
        .prepare(
            `
        INSERT INTO otp (user_id, code, expires_at)
        VALUES (?, ?, ?)
    `
        )
        .run(userId, code, expiresAt)
}

function getLatestOtp(userId) {
    return app.db
        .prepare(
            `
        SELECT * FROM otp
        WHERE user_id = ? AND used = 0
        ORDER BY id DESC LIMIT 1
    `
        )
        .get(userId)
}

function verifyOtp(id, code) {
    const otp = app.db
        .prepare(
            `
        SELECT * FROM otp
        WHERE user_id = ? AND code = ? AND used = 0
    `
        )
        .get(id, code)

    if (!otp) throw new AppError('Invalid Otp', 400)
    if (new Date(otp.expires_at) < new Date())
        throw new AppError('Otp has beeing expired', 400)
    if (otp.used === 1) throw new AppError('otp is already used', 400)
    app.db.prepare(`UPDATE otp SET used = 1 WHERE id = ?`).run(otp.id)
    app.db.prepare(`UPDATE users SET isVerified = 1 WHERE id = ?`).run(id)
    return otp
}

module.exports = {
    createUser,
    getUserByUsername,
    getUserById,
    activateUser,
    updatePassword,
    enable2FA,
    createOtp,
    getLatestOtp,
    verifyOtp,
    storeAvatarAndBio,
    getUserByEmail,
    storeResetToken,
    getUserByResetToken,
}
