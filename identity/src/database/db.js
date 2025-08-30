const Database = require('better-sqlite3')

const db = new Database('./user.db')

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, -- store a bcrypt hash, not plain password
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    avatar TEXT,
    bio TEXT,
    isVerified INTEGER DEFAULT 0,
    enable2fa INTEGER DEFAULT 0
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

module.exports = db
