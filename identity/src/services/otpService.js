const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
})

const sendEmail = async function (to, subject, text) {
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        text,
    })
}

module.exports = { sendEmail }
