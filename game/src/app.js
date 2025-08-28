const app = require('./main.js')

const start = async () => {
  app.listen(
    { port: process.env.PORT || 4002, hosts: '0.0.0.0' },
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
