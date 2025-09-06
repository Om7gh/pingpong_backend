const { getUserByUsername } = require('../repositories/userAuth')
const {
    sendFriendRequestProcess,
    cancelFriendRequestProcess,
    responseRequestProcess,
    getFriendsByStatus,
    removeFriendProcess,
    blockFriendProcess,
    unblockFriendProcess,
} = require('../services/friend')
const AppError = require('../utils/appError')
const catchAsyncError = require('../utils/catchAsyncError')

// requests
const sendFriendRequest = catchAsyncError(async function (req, rep) {
    const { to_user } = req.body
    const { username } = req.params
    if (!username) throw new AppError('username is missing from url', 400)
    if (!to_user) throw new AppError('missing addressed user', 400)
    const fromUser = getUserByUsername(username)
    const toUser = getUserByUsername(to_user)
    if (!fromUser || !toUser) throw new AppError('User not found', 404)
    if (fromUser.id === toUser.id)
        throw new AppError('You cannot send friend request to yourself', 400)

    await sendFriendRequestProcess({ from_id: fromUser.id, to_id: toUser.id })
    return rep.send({
        status: 'success',
        message: 'Friend request has beeing sended successfully',
    })
})

const cancelFriendRequest = catchAsyncError(async function (req, rep) {
    const { to_user } = req.body
    const { username } = req.params
    if (!username) throw new AppError('username is missing from url', 400)
    if (!to_user) throw new AppError('missing addressed user', 400)
    const fromUser = getUserByUsername(username)
    const toUser = getUserByUsername(to_user)
    if (!fromUser || !toUser) throw new AppError('User not found', 404)
    if (fromUser.id === toUser.id)
        throw new AppError('You cannot cancel yourself', 400)
    await cancelFriendRequestProcess({ from_id: fromUser.id, to_id: toUser.id })

    return rep.send({
        status: 'success',
        message: 'Friend request has beeing cancled successfully',
    })
})
const responseRequest = catchAsyncError(async function (req, rep) {
    const { to_user, status } = req.body
    const { username } = req.params
    if (!username) throw new AppError('username is missing from url', 400)
    if (!to_user || !status)
        throw new AppError(
            'missing addressed user or friend response status',
            400
        )
    const fromUser = getUserByUsername(username)
    const toUser = getUserByUsername(to_user)
    if (!fromUser || !toUser) throw new AppError('User not found', 404)
    if (fromUser.id === toUser.id)
        throw new AppError('You cannot respond to yourself', 400)
    await responseRequestProcess({
        from_id: fromUser.id,
        to_id: toUser.id,
        status,
    })

    return rep.send({
        status: 'success',
        message: 'Friend response has beeing sended successfully',
    })
})

// friendship
const friendList = catchAsyncError(async function (req, rep) {
    const { username } = req.params
    if (!username) throw new AppError('username is missing from url', 400)

    const user = getUserByUsername(username)
    if (!user) throw new AppError('User not found', 404)
    const list = getFriendsByStatus(app.db, user.id)
    return rep.send({
        status: 'success',
        data: list,
    })
})

const removeFriend = catchAsyncError(async function (req, rep) {
    const { to_user } = req.body
    const { username } = req.params

    if (!username) throw new AppError('username is missing from url', 400)
    if (!to_user) throw new AppError('missing addressed user', 400)

    const fromUser = getUserByUsername(username)
    const toUser = getUserByUsername(to_user)
    if (!fromUser || !toUser) throw new AppError('User not found', 404)
    if (fromUser.id === toUser.id)
        throw new AppError('You cannot remove yourself', 400)

    await removeFriendProcess({ userId: fromUser.id, friendId: toUser.id })

    return rep.send({
        status: 'success',
        message: 'You removed this player from your friend list successfully',
    })
})

// blocking request
const blockFriend = catchAsyncError(async function (req, rep) {
    const { to_user } = req.body
    const { username } = req.params

    if (!username) throw new AppError('username is missing from url', 400)
    if (!to_user) throw new AppError('missing addressed user', 400)

    const fromUser = getUserByUsername(username)
    const toUser = getUserByUsername(to_user)
    if (!fromUser || !toUser) throw new AppError('User not found', 404)
    if (fromUser.id === toUser.id)
        throw new AppError('You cannot remove yourself', 400)

    await blockFriendProcess({ userId: fromUser.id, friendId: toUser.id })

    return rep.send({
        status: 'success',
        message: 'You blocked this player from your friend list successfully',
    })
})

const unblockFriend = catchAsyncError(async function (req, rep) {
    const { to_user } = req.body
    const { username } = req.params

    if (!username) throw new AppError('username is missing from url', 400)
    if (!to_user) throw new AppError('missing addressed user', 400)

    const fromUser = getUserByUsername(username)
    const toUser = getUserByUsername(to_user)

    if (!fromUser || !toUser) throw new AppError('User not found', 404)
    if (fromUser.id === toUser.id)
        throw new AppError('You cannot unblock yourself', 400)

    await unblockFriendProcess({ userId: fromUser.id, friendId: toUser.id })

    return rep.send({
        status: 'success',
        message: 'You unblocked this player successfully',
    })
})

module.exports = {
    sendFriendRequest,
    blockFriend,
    cancelFriendRequest,
    unblockFriend,
    removeFriend,
    friendList,
    responseRequest,
}
