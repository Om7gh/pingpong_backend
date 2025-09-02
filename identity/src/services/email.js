const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
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
