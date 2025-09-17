'use strict'
const AppError = require('../utils/appError')
const catchAsyncError = require('../utils/catchAsyncError')
const {
    getPendingMessages,
    handleMessage,
    storeMessageProcess,
    markMessagesSeenRepo,
} = require('../services/chat.js')
const playerSockets = new Map()
const app = require('../main.js')

const chatProcess = catchAsyncError(async function (socket, req) {
    const { username } = req.params
    if (!username) {
        socket.close()
        throw new AppError('User logged with this socket is not known', 400)
    }
    playerSockets.set(username, socket)

    // await getPendingMessages(app, username) // to build

    socket.on('message', async (raw) => {
        try {
            const { from, to, content } = JSON.parse(raw)

            const fromUser = await app.mq.sendQueueMessage('getUser', {
                username: from,
            })
            const toUser = await app.mq.sendQueueMessage('getUser', {
                username: to,
            })

            if (fromUser.username !== username)
                throw new AppError('Sender mismatch with socket URL', 400)
            if (!fromUser || !toUser) throw new AppError('User not found', 404)

            if (from === to) {
                socket.send(
                    JSON.stringify({ error: "You can't message yourself" })
                )
                return
            }

            const { messageId, conversationId } = storeMessageProcess(
                app.db,
                fromUser,
                toUser,
                content
            )

            const receiver = playerSockets.get(toUser.username)
            if (receiver) {
                receiver.send(
                    JSON.stringify({
                        conversationId,
                        messageId,
                        from,
                        to,
                        content,
                    })
                )
                app.db
                    .prepare(
                        `
        UPDATE message_status
        SET status = 'delivered', updated_at = CURRENT_TIMESTAMP
        WHERE message_id = ? AND user_id = ?
      `
                    )
                    .run(messageId, toUser.id)
            }
        } catch (err) {
            socket.send(
                JSON.stringify({ error: err.message || 'Invalid message' })
            )
        }
    })

    socket.on('close', () => {
        playerSockets.delete(username)
    })
})

const seenMessage = catchAsyncError(async function (req, rep) {
    const { conversationId } = req.params
    const { username } = req.body

    const user = app.mq.sendQueueMessage('getUser', { username })
    if (!user) throw new AppError('User not found', 404)

    const result = markMessagesSeenRepo(app.db, conversationId, user.id)

    return rep.send({
        status: 'success',
        updated: result.changes,
    })
})

module.exports = {
    chatProcess,
    seenMessage,
}
