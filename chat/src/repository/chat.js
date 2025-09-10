function getConversation(db, userAId, userBId) {
    return db
        .prepare(
            `
            SELECT c.id
            FROM conversations c
            JOIN conversation_participants p1 ON c.id = p1.conversation_id AND p1.user_id = ?
            JOIN conversation_participants p2 ON c.id = p2.conversation_id AND p2.user_id = ?
        `
        )
        .get(userAId, userBId)
}

function createConversation(db, userAId, userBId) {
    const insertConv = db.prepare(`INSERT INTO conversations DEFAULT VALUES`)
    const info = insertConv.run()
    const convId = info.lastInsertRowid

    const insertParticipants = db.prepare(`
        INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)
    `)
    insertParticipants.run(convId, userAId, convId, userBId)
    return convId
}

function getOrCreateConversation(db, userAId, userBId) {
    let conv = getConversation(db, userAId, userBId)
    if (!conv) conv = { id: createConversation(db, userAId, userBId) }
    return conv.id
}

function sendMessage(db, conversationId, senderId, content) {
    const insertMsg = db.prepare(`
        INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)
    `)
    const info = insertMsg.run(conversationId, senderId, content)
    const messageId = info.lastInsertRowid

    const participants = db
        .prepare(
            `SELECT user_id FROM conversation_participants WHERE conversation_id = ?`
        )
        .all(conversationId)
    const insertStatus = db.prepare(`
        INSERT INTO message_status (message_id, user_id) VALUES (?, ?)
    `)
    const insertMany = db.transaction((users) => {
        for (const u of users) insertStatus.run(messageId, u.user_id)
    })
    insertMany(participants)

    return messageId
}

function getMessages(db, conversationId, limit = 50, offset = 0) {
    return db
        .prepare(
            `
            SELECT m.id, m.sender_id, m.content, m.created_at
            FROM messages m
            WHERE m.conversation_id = ?
            ORDER BY m.created_at ASC
            LIMIT ? OFFSET ?
        `
        )
        .all(conversationId, limit, offset)
}

function updateMessageStatus(db, messageId, userId, status) {
    const stmt = db.prepare(`
        UPDATE message_status
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE message_id = ? AND user_id = ?
    `)
    return stmt.run(status, messageId, userId)
}

function getUnreadMessages(db, userId) {
    return db
        .prepare(
            `
            SELECT ms.message_id, m.sender_id, m.content, m.conversation_id, ms.status
            FROM message_status ms
            JOIN messages m ON ms.message_id = m.id
            WHERE ms.user_id = ? AND ms.status != 'seen'
        `
        )
        .all(userId)
}

function getConversationsForUser(db, userId) {
    return db
        .prepare(
            `
            SELECT c.id, MAX(m.created_at) as last_message_at
            FROM conversations c
            JOIN conversation_participants p ON c.id = p.conversation_id
            LEFT JOIN messages m ON m.conversation_id = c.id
            WHERE p.user_id = ?
            GROUP BY c.id
            ORDER BY last_message_at DESC
        `
        )
        .all(userId)
}

module.exports = {
    getConversation,
    createConversation,
    getOrCreateConversation,
    sendMessage,
    getMessages,
    updateMessageStatus,
    getUnreadMessages,
    getConversationsForUser,
}
