'use strict'
const AppError = require('../utils/appError')
const catchAsyncError = require('../utils/catchAsyncError')

catchAsyncError(async function handleMessage({
    db,
    fromUsername,
    toUsername,
    content,
    playerSockets,
}) {
    const fromUser = db
        .prepare('SELECT id FROM users WHERE username = ?')
        .get(fromUsername)
    const toUser = db
        .prepare('SELECT id FROM users WHERE username = ?')
        .get(toUsername)
    if (!fromUser || !toUser) throw new AppError('User not found', 404)

    const conversationId = getOrCreateConversation(db, fromUser.id, toUser.id)

    const messageId = sendMessage(db, conversationId, fromUser.id, content)

    initializeMessageStatus(db, messageId, fromUser.id)
    initializeMessageStatus(db, messageId, toUser.id)

    const msg = {
        id: messageId,
        from: fromUsername,
        to: toUsername,
        content,
        timestamp: new Date().toISOString(),
    }

    const receiverSocket = playerSockets.get(toUsername)
    if (receiverSocket) {
        receiverSocket.send(JSON.stringify(msg))
        updateMessageStatus(db, messageId, toUser.id, 'delivered')
    }

    return msg
})

function getOrCreateConversation(db, user1, user2) {
    let conv = db
        .prepare(
            `
        SELECT c.id FROM conversations c
        JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = ?
        JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = ?
    `
        )
        .get(user1, user2)

    if (!conv) {
        const result = db
            .prepare(`INSERT INTO conversations DEFAULT VALUES`)
            .run()
        const convId = result.lastInsertRowid
        db.prepare(
            `INSERT INTO conversation_participants(conversation_id, user_id) VALUES(?, ?)`
        ).run(convId, user1)
        db.prepare(
            `INSERT INTO conversation_participants(conversation_id, user_id) VALUES(?, ?)`
        ).run(convId, user2)
        return convId
    }

    return conv.id
}

function sendMessage(db, conversationId, senderId, content) {
    const result = db
        .prepare(
            `
        INSERT INTO messages(conversation_id, sender_id, content) VALUES (?, ?, ?)
    `
        )
        .run(conversationId, senderId, content)
    return result.lastInsertRowid
}

function initializeMessageStatus(db, messageId, userId) {
    db.prepare(
        `
        INSERT INTO message_status(message_id, user_id, status) VALUES (?, ?, 'pending')
    `
    ).run(messageId, userId)
}

function updateMessageStatus(db, messageId, userId, status) {
    db.prepare(
        `
        UPDATE message_status SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE message_id = ? AND user_id = ?
    `
    ).run(status, messageId, userId)
}

catchAsyncError(async function getPendingMessages(username) {
    const user = app.db
        .prepare(`SELECT id FROM users WHERE username = ?`)
        .get(username)
    if (!user) return []

    const messages = app.db
        .prepare(
            `
            SELECT m.id, u.username as from, m.content, m.created_at
            FROM messages m
            JOIN users u ON u.id = m.sender_id
            JOIN message_status ms ON ms.message_id = m.id
            WHERE ms.user_id = ? AND ms.status = 'pending'
            ORDER BY m.created_at ASC
        `
        )
        .all(user.id)

    const stmt = app.db.prepare(`
        UPDATE message_status SET status = 'delivered', updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND status = 'pending'
    `)
    stmt.run(user.id)

    return messages
})

catchAsyncError(async function handleMessage({
    from,
    to,
    content,
    playerSockets,
}) {
    const fromUser = app.db
        .prepare(`SELECT id FROM users WHERE username = ?`)
        .get(from)
    const toUser = app.db
        .prepare(`SELECT id FROM users WHERE username = ?`)
        .get(to)
    if (!fromUser || !toUser) throw new AppError('User not found', 404)

    let conversation = app.db
        .prepare(
            `
            SELECT c.id
            FROM conversations c
            JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = ?
            JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = ?
        `
        )
        .get(fromUser.id, toUser.id)

    if (!conversation) {
        const convStmt = app.db.prepare(
            `INSERT INTO conversations DEFAULT VALUES`
        )
        const info = convStmt.run()
        const conversationId = info.lastInsertRowid

        const partStmt = app.db.prepare(`
            INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)
        `)
        partStmt.run(conversationId, fromUser.id)
        partStmt.run(conversationId, toUser.id)

        conversation = { id: conversationId }
    }

    const msgStmt = app.db.prepare(`
        INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)
    `)
    const info = msgStmt.run(conversation.id, fromUser.id, content)
    const messageId = info.lastInsertRowid

    const statusStmt = app.db.prepare(`
        INSERT INTO message_status (message_id, user_id, status) VALUES (?, ?, ?)
    `)
    statusStmt.run(messageId, fromUser.id, 'seen')
    statusStmt.run(messageId, toUser.id, 'pending')

    const msg = {
        id: messageId,
        from,
        to,
        content,
        timestamp: new Date().toISOString(),
    }

    const receiverSocket = playerSockets.get(to)
    if (receiverSocket) {
        receiverSocket.send(JSON.stringify(msg))

        app.db
            .prepare(
                `
                UPDATE message_status SET status = 'delivered', updated_at = CURRENT_TIMESTAMP
                WHERE message_id = ? AND user_id = ?
            `
            )
            .run(messageId, toUser.id)
    }

    return msg
})

module.exports = { handleMessage, getPendingMessages }
