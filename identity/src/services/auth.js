const bcrypt = require('bcrypt')

const { createUser: newUser } = require('../repositories/userAuth.js')
const createUser = async function ({ username, email, password }) {
    const passwordHash = await bcrypt.hash(password, 10)
    try {
        const userId = newUser({ username, email, password: passwordHash })
        return userId
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new AppError('Username or email already exists', 400)
        }
        throw new AppError('Database error', 500)
    }
}

const verifyUser = async function ({ username, password }) {}
module.exports = { createUser, verifyUser }
