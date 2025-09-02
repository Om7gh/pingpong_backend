const Database = require('better-sqlite3')
const fp = require('fastify-plugin')

const prepareDb = function (app) {
    const db = new Database('./user.sqlite')
    db.exec(`
    
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        avatar TEXT,
        bio TEXT,
        isVerified INTEGER DEFAULT 0,
        enable2fa INTEGER DEFAULT 0,
        resetPasswordToken TEXT
        resetPasswordExpire INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS otp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        code TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        used INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    `)
    app.decorate('db', db)
}

module.exports = fp(prepareDb)
