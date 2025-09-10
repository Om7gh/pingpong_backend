'use strict'
const AppError = require('../utils/appError')
const catchAsyncError = require('../utils/catchAsyncError')
const { getPendingMessages, handleMessage } = require('../services/chat.js')
const playerSockets = new Map()

const chatProcess = catchAsyncError(async function (socket, req) {
    const { username } = req.params
    if (!username) {
        socket.close()
        throw new AppError('User logged with this socket is not known', 400)
    }
    playerSockets.set(username, socket)
    const pending = await getPendingMessages(username)
    pending.forEach((msg) => {
        socket.send(JSON.stringify(msg))
    })
    socket.on('message', async (raw) => {
        try {
            const { from, to, content } = JSON.parse(raw)

            if (from === to) {
                socket.send(
                    JSON.stringify({
                        error: "You can't send message to yourself",
                    })
                )
                return
            }
            const msg = await handleMessage({
                from,
                to,
                content,
                playerSockets,
            })
            socket.send(JSON.stringify(msg))
        } catch (err) {
            socket.send(
                JSON.stringify({
                    error: err.message || 'Invalid message format',
                })
            )
        }
    })

    socket.on('close', () => {
        playerSockets.delete(username)
    })
})

const getConversations = async function () {}

const getMessages = async function () {}

const markMessagesSeen = async function () {}

const sendMessage = async function () {}

const getPendingMessages = async function () {}

module.exports = {
    chatProcess,
    getConversations,
    getMessages,
    markMessagesSeen,
    sendMessage,
    getPendingMessages,
}
