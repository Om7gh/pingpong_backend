const Database = require('better-sqlite3')
const fp = require('fastify-plugin')

const prepareDb = function (app) {
    const db = new Database('./user.sqlite')
    db.exec(`

    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        avatar TEXT,
        bio TEXT,
        isVerified INTEGER DEFAULT 0,
        enable2fa INTEGER DEFAULT 0,
        resetPasswordToken TEXT,
        resetPasswordExpire INTEGER,
        status TEXT DEFAULT 'active',
        provider TEXT DEFAULT 'local',
        discord_id TEXT UNIQUE,
        google_id TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS friends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_id INTEGER NOT NULL,
        to_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (to_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS otp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        code TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        used INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_resetPasswordToken ON users (resetPasswordToken);

    CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

    CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users (discord_id);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_friend_pair ON friends (
        CASE WHEN from_id < to_id THEN from_id ELSE to_id END,
        CASE WHEN from_id < to_id THEN to_id ELSE from_id END
    );

    `)
    app.decorate('db', db)
}

module.exports = fp(prepareDb)
