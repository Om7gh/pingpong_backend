const mq = require('amqplib')
const fp = require('fastify-plugin')
const { v4: uuidv4 } = require('uuid')

const chatRPC = async function (app) {
    let connection = await mq.connect('amqp://localhost')
    let channel = await connection.createChannel()

    const { queue: replyQueue } = await channel.assertQueue('', {
        exclusive: true,
        autoDelete: true,
    })

    const pendingRequests = new Map()

    channel.consume(
        replyQueue,
        (msg) => {
            if (msg) {
                const correlationId = msg.properties.correlationId
                if (pendingRequests.has(correlationId)) {
                    const { resolve } = pendingRequests.get(correlationId)
                    const response = JSON.parse(msg.content.toString())
                    resolve(response)
                    pendingRequests.delete(correlationId)
                }
                channel.ack(msg)
            }
        },
        { noAck: false }
    )

    const sendQueueMessage = async function (action, payload, timeout = 5000) {
        const correlationId = uuidv4()
        const message = { action, payload }

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                pendingRequests.delete(correlationId)
                reject(new Error('RPC request timeout'))
            }, timeout)

            pendingRequests.set(correlationId, { resolve, timeoutId })

            channel.sendToQueue(
                'identity_requests',
                Buffer.from(JSON.stringify(message)),
                {
                    correlationId,
                    replyTo: replyQueue,
                    persistent: true,
                }
            )
        })
    }

    app.decorate('mq', { sendQueueMessage })

    app.addHook('onClose', async () => {
        await channel.close()
        await connection.close()
    })
}

module.exports = fp(chatRPC)
