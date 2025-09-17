const mq = require('amqplib')
const fp = require('fastify-plugin')
const { getUserByUsername } = require('../repositories/userAuth.js')

async function startIdentityConsumer(app) {
    try {
        const connection = await mq.connect('amqp://localhost')
        const channel = await connection.createChannel()

        await channel.assertQueue('identity_requests', { durable: true })
        channel.prefetch(1)

        console.log('Identity service waiting for RPC requests...')

        channel.consume('identity_requests', async (msg) => {
            if (msg !== null) {
                try {
                    const request = JSON.parse(msg.content.toString())
                    const { action, payload } = request

                    let response

                    switch (action) {
                        case 'getUser':
                            console.log(payload.username)
                            response = await getUserByUsername(
                                app,
                                payload.username
                            )
                            break
                        case 'validateUser':
                            response = await validateUser(app, payload)
                            break
                        default:
                            response = { error: 'Unknown action' }
                    }

                    channel.sendToQueue(
                        msg.properties.replyTo,
                        Buffer.from(JSON.stringify(response)),
                        {
                            correlationId: msg.properties.correlationId,
                        }
                    )

                    channel.ack(msg)
                } catch (error) {
                    console.error('Error processing request:', error)
                    channel.sendToQueue(
                        msg.properties.replyTo,
                        Buffer.from(
                            JSON.stringify({
                                error: error.message,
                            })
                        ),
                        {
                            correlationId: msg.properties.correlationId,
                        }
                    )
                    channel.ack(msg)
                }
            }
        })

        app.addHook('onClose', async () => {
            await channel.close()
            await connection.close()
        })

        process.on('SIGINT', async () => {
            await channel.close()
            await connection.close()
            process.exit(0)
        })
    } catch (error) {
        console.error('RabbitMQ connection error:', error)
        process.exit(1)
    }
}

module.exports = fp(startIdentityConsumer)
