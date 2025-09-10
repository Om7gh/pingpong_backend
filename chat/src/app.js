const app = require('./main.js')
const chatRoutes = require('./routes/chat.routes.js')
const db = require('./database/chat.js')
app.register(chatRoutes)
app.register(db)

const start = async () => {
    app.listen(
        { port: process.env.PORT || 4001, host: '0.0.0.0' },
        (err, addr) => {
            if (err) {
                app.log.error(err)
                process.exit(1)
            }
            app.log.info(`server is running on ${addr}`)
        }
    )
}

start()
