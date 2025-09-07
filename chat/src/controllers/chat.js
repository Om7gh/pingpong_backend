'use strict'
const AppError = require('../utils/appError')
const catchAsyncError = require('../utils/catchAsyncError')

const playerSockets = new Map()

const chatProcess = catchAsyncError(async function (socket, req) {
    const { username } = req.params
    if (!username) {
        socket.close()
        throw new AppError('User logged with this socket is not known', 400)
    }

    playerSockets.set(username, socket)
    console.log(`${username} connected`)

    socket.on('message', (raw) => {
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
            const receiver = playerSockets.get(to)
            if (!receiver) {
                socket.send(JSON.stringify({ error: `${to} is offline` }))
                return
            }
            const msg = {
                from,
                to,
                content,
                timestamp: new Date().toISOString(),
            }
            receiver.send(JSON.stringify(msg))
        } catch (err) {
            socket.send(JSON.stringify({ error: 'Invalid message format' }))
        }
    })

    socket.on('close', () => {
        playerSockets.delete(username)
        console.log(`${username} disconnected`)
    })
})

module.exports = { chatProcess }
