const { cloudinary } = require('./cloudinary')

const streamUpload = (file, username) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'avatars', public_id: `user_${username}` },
            (error, result) => {
                if (error) reject(error)
                else resolve(result.secure_url)
            }
        )
        file.file.pipe(stream)
    })
}

module.exports = streamUpload
