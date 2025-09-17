function findConversation(db, userId1, userId2) {
    const row = db
        .prepare(
            `
    SELECT c.id
    FROM conversations c
    JOIN conversation_participants cp1 ON cp1.conversation_id = c.id
    JOIN conversation_participants cp2 ON cp2.conversation_id = c.id
    WHERE cp1.user_id = ? AND cp2.user_id = ?
  `
        )
        .get(userId1, userId2)
    return row ? row.id : null
}

function createConversation(db, userIds) {
    const result = db.prepare(`INSERT INTO conversations DEFAULT VALUES`).run()
    const conversationId = result.lastInsertRowid

    const stmt = db.prepare(`
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (?, ?)
  `)
    for (const uid of userIds) {
        stmt.run(conversationId, uid)
    }
    return conversationId
}

function insertMessage(db, conversationId, senderId, content) {
    const result = db
        .prepare(
            `
    INSERT INTO messages (conversation_id, sender_id, content)
    VALUES (?, ?, ?)
  `
        )
        .run(conversationId, senderId, content)
    return result.lastInsertRowid
}

function addMessageStatus(db, messageId, userId, status = 'pending') {
    return db
        .prepare(
            `
    INSERT INTO message_status (message_id, user_id, status)
    VALUES (?, ?, ?)
  `
        )
        .run(messageId, userId, status)
}

function markMessagesSeen(db, conversationId, userId) {
    const stmt = db.prepare(`
    UPDATE message_status
    SET status = 'seen', updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ? AND message_id IN (
      SELECT id FROM messages WHERE conversation_id = ?
    )
    AND status != 'seen'
  `)
    return stmt.run(userId, conversationId)
}

module.exports = {
    findConversation,
    createConversation,
    insertMessage,
    addMessageStatus,
    markMessagesSeen,
}
