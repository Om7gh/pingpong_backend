const db = require('../database/db.js')

function createUser({ username, email, passwordHash }) {
    const stmt = db.prepare(`
        INSERT INTO users (username, email, password)
        VALUES (?, ?, ?)
    `)
    const result = stmt.run(username, email, passwordHash)
    return result.lastInsertRowid
}

function getUserByUsername(username) {
    return db.prepare(`SELECT * FROM users WHERE username = ?`).get(username)
}

function getUserById(id) {
    return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id)
}

function activateUser(userId) {
    return db
        .prepare(`UPDATE users SET isVerified = 1 WHERE id = ?`)
        .run(userId)
}

function updatePassword(userId, newPasswordHash) {
    return db
        .prepare(`UPDATE users SET password = ? WHERE id = ?`)
        .run(newPasswordHash, userId)
}

function enable2FA(userId) {
    return db.prepare(`UPDATE users SET enable2fa = 1 WHERE id = ?`).run(userId)
}

function createOtp(userId, code, expiresAt) {
    return db
        .prepare(
            `
        INSERT INTO otp (user_id, code, expires_at)
        VALUES (?, ?, ?)
    `
        )
        .run(userId, code, expiresAt)
}

function getLatestOtp(userId) {
    return db
        .prepare(
            `
        SELECT * FROM otp
        WHERE user_id = ? AND used = 0
        ORDER BY id DESC LIMIT 1
    `
        )
        .get(userId)
}

function verifyOtp(userId, code) {
    const otp = db
        .prepare(
            `
        SELECT * FROM otp
        WHERE user_id = ? AND code = ? AND used = 0
    `
        )
        .get(userId, code)

    if (!otp) return null
    if (new Date(otp.expires_at) < new Date()) return null

    db.prepare(`UPDATE otp SET used = 1 WHERE id = ?`).run(otp.id)
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
}
