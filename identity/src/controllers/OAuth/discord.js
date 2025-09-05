const catchAsyncError = require('../../utils/catchAsyncError')
const AppError = require('../../utils/appError.js')
const axios = require('axios')
const { discordAuthProcess } = require('../../services/oauth/discord/index.js')
const app = require('../../main.js')

const discordAuthorization = catchAsyncError(async function (req, rep) {
    const url = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_ID}&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fauth%2Fdiscord%2Fcallback&scope=identify+email+connections`
    rep.redirect(url)
})

const discordCallback = catchAsyncError(async function (req, rep) {
    const { code } = req.query
    if (!code) throw new AppError('Code not provided', 401)
    const params = new URLSearchParams({
        client_id: process.env.DISCORD_ID,
        client_secret: process.env.DISCORD_SECRET_KEY,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URL,
    })
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
    const response = await axios.post(
        'https://discord.com/api/oauth2/token',
        params.toString(),
        {
            headers,
        }
    )
    const { access_token } = response.data
    const { token_type } = response.data
    const userData = await axios.get('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${token_type} ${access_token}`,
        },
    })
    const { id, username, avatar, email } = userData.data
    const user = await discordAuthProcess({ id, username, avatar, email })
    const accessToken = app.jwt.sign(
        { id: user.id, username: user.username },
        { expiresIn: '15m' }
    )
    const refreshToken = app.jwt.sign(
        { id: user.id, username: user.username },
        { expiresIn: '7d' }
    )
    rep.setCookie('access-token', accessToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    })
        .setCookie('refresh-token', refreshToken, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        })
        .redirect('http://localhost:3000/dashboard')
})

module.exports = {
    discordAuthorization,
    discordCallback,
}
