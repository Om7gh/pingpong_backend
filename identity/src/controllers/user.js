const { updateAvatarProcess } = require('../services/user')
const AppError = require('../utils/appError')
const catchAsyncError = require('../utils/catchAsyncError')

const updateUserPassword = catchAsyncError(async function (req, rep) {
    const { oldpassword, newpassword, repeatnewpassword } = req.body
    const { username } = req.params
    if (!oldpassword || !newpassword || !repeatnewpassword)
        throw new AppError('all fields are required', 400)
    if (!username) throw new AppError('username is missing from route', 400)
    updatePasswordProcess({
        oldpassword,
        newpassword,
        repeatnewpassword,
        username,
    })

    return rep.send({
        status: 'success',
        message: 'User password updated successfully',
    })
})

const updateUserAvatar = catchAsyncError(async function (req, rep) {
    const updateUserAvatar = catchAsyncError(async function (req, rep) {
        const username = req.params.username
        if (!username) throw new AppError('Username is required', 400)

        const file = await req.file({ limits: { fileSize: 5 * 1024 * 1024 } })
        if (!file) throw new AppError('No file uploaded', 400)
        await updateAvatarProcess({ file, username })
        rep.send({
            status: 'success',
            message: 'Avatar updated successfully',
            avatar: avatarUrl,
        })
    })

    const streamUpload = (file) => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'avatars', public_id: file.filename.split('.')[0] },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result.secure_url)
                }
            )
            file.file.pipe(stream)
        })
    }
})

const updateUserBio = catchAsyncError(async function (req, rep) {
    const { bio } = req.body
    const { username } = req.params
    if (!bio) throw new AppError('all field are required', 400)
    if (!username) throw new AppError('username is missing from route', 400)
    updateBioProcess({ username, bio })
    return rep.send({
        status: 'success',
        message: 'User bio updated successfully',
    })
})

const updateUserUsername = catchAsyncError(async function (req, rep) {
    const { newusername } = req.body
    const { username } = req.params
    if (!newusername) throw new AppError('all field are required', 400)
    if (!username) throw new AppError('username is missing from route', 400)
    updateUsernameProcess({ username, newusername })
})

const active2fa = catchAsyncError(async function (req, rep) {
    return rep.send({
        status: 'success',
        message: '2fa is enabled succesfully',
    })
})

const deleteAccount = catchAsyncError(async function (req, rep) {
    const { password } = req.body
    const { username } = req.params

    if (!password || !username)
        throw new AppError('missing requierd information', 400)
    deleteAccountProcess({ username, password })
    return rep.send({
        status: 'success',
        message: 'compte is removed succesfully.\nthank you for your time',
    })
})

module.exports = {
    deleteAccount,
    updateUserPassword,
    updateUserAvatar,
    updateUserBio,
    updateUserUsername,
    active2fa,
}
