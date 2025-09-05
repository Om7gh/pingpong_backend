const generateAvatar = async function (username) {
    return `https://avatar.iran.liara.run/username?username=${encodeURIComponent(
        username
    )}`
}

module.exports = generateAvatar
