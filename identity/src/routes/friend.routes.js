const fp = require('fastify-plugin')
const {
    sendFriendRequest,
    cancelFriendRequest,
    responseRequest,
    friendList,
    removeFriend,
    blockFriend,
    unblockFriend,
} = require('../controllers/friend')
const {
    requestFriendSchema,
    responseFriendSchema,
} = require('../schemas/friendSchema')

const friendRoutes = async function (fastify) {
    // Requests
    fastify.post(
        '/friends/:username/request',
        requestFriendSchema,
        sendFriendRequest
    )
    fastify.delete(
        '/friends/:username/request',
        requestFriendSchema,
        cancelFriendRequest
    )
    fastify.put(
        '/friends/:username/response',
        responseFriendSchema,
        responseRequest
    )

    // Friendship
    fastify.get('/friends/:username', friendList)
    fastify.delete('/friends/:username', requestFriendSchema, removeFriend)

    // Blocking
    fastify.put('/friends/:username/block', requestFriendSchema, blockFriend)
    fastify.delete(
        '/friends/:username/block',
        requestFriendSchema,
        unblockFriend
    )
}

module.exports = fp(friendRoutes)
