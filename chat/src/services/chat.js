const {
    addMessageStatus,
    createConversation,
    findConversation,
    insertMessage,
    markMessagesSeen,
} = require('../repository/chat.js')
const AppError = require('../utils/appError.js')
const catchAsyncError = require('../utils/catchAsyncError.js')

const storeMessageProcess = async function (db, fromUser, toUser, content) {
    let conversationId = findConversation(db, fromUser.id, toUser.id)
    if (!conversationId) {
        conversationId = createConversation(db, [fromUser.id, toUser.id])
    }

    const messageId = insertMessage(db, conversationId, fromUser.id, content)

    addMessageStatus(db, messageId, fromUser.id, 'delivered')
    addMessageStatus(db, messageId, toUser.id, 'pending')

    return { messageId, conversationId }
}

const markMessagesSeenRepo = catchAsyncError(async function (
    db,
    convId,
    userId
) {
    const res = markMessagesSeen(db, convId, userId)
    if (res.changes === 0) throw new AppError('db fail to update status', 401)
    return res
})

module.exports = { storeMessageProcess, markMessagesSeenRepo }
