const app = require('./main.js')
const authRoutes = require('./routes/auth.routes.js')
const friendRoutes = require('./routes/friend.routes.js')
const oauthRoutes = require('./routes/oauth.routes.js')

app.register(authRoutes, { prefix: '/api/v1/' })
app.register(oauthRoutes, { prefix: 'api/v1' })
app.register(friendRoutes, { prefix: '/api/v1' })

app.ready(() => {
    const start = async () => {
        app.listen(
            { port: process.env.PORT, host: process.env.HOST },
            (err, addr) => {
                if (err) {
                    app.log.error(err)
                    process.exit(1)
                }
                app.log.info(`server is running on ${addr}`)
                app.log.info(app.printRoutes())
            }
        )
    }
    start()
})
