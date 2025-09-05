const bcrypt = require('bcrypt')
const {
    getUserByUsername,
    updatePassword,
    updateBio,
    deleteUserAccount,
} = require('../repositories/userAuth')
const AppError = require('../utils/appError')
const streamUpload = require('../config/cloudinary/upload')

const updatePasswordProcess = async function ({
    oldpassword,
    newpassword,
    repeatnewpassword,
    username,
}) {
    const user = getUserByUsername(username)
    if (!user) throw new AppError('user not found', 404)
    const isMatch = await bcrypt.compare(oldpassword, user.password)
    if (!isMatch) throw new AppError('old password is not correct', 400)
    if (newpassword != repeatnewpassword)
        throw new AppError('password and confirm password doesnt match', 400)
    const hashedPassword = await bcrypt.hash(newpassword, 12)
    updatePassword(user.id, hashedPassword)
}

const updateBioProcess = async function ({ username, bio }) {
    const user = getUserByUsername(username)
    if (!user) throw new AppError('user not found', 404)
    updateBio(user.id, bio)
}

const updateUsernameProcess = async function ({ username, newusername }) {
    const user = getUserByUsername(username)
    if (!user) throw new AppError('User not found', 404)
    const newUser = getUserByUsername(newusername)
    if (newUser) throw new AppError('This username already taken', 401)
    updateUsername(user.id, newusername)
}

const deleteAccountProcess = async function ({ username, password }) {
    const user = getUserByUsername(username)
    if (!user) throw new AppError('user not found', 404)
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new AppError('password doesnt match', 401)
    deleteUserAccount(user.id)
}

const updateAvatarProcess = async function ({ file, username }) {
    const avatarUrl = await streamUpload(file, username)
    app.db
        .prepare('UPDATE users SET avatar = ? WHERE username = ?')
        .run(avatarUrl, username)
}

module.exports = {
    updatePasswordProcess,
    updateBioProcess,
    updateUsernameProcess,
    deleteAccountProcess,
    updateAvatarProcess,
}
