const {
    addFriend,
    getFriendship,
    cancelFriendShip,
    updateFriendStatus,
    getAcceptedFriend,
    getSentFriendRequests,
    getReceivedFriendRequests,
    getBlockedFriend,
    deleteFriend,
} = require('../repositories/friend')
const app = require('../main.js')
const AppError = require('../utils/appError.js')
const catchAsyncError = require('../utils/catchAsyncError.js')

const sendFriendRequestProcess = catchAsyncError(async function ({
    from_id,
    to_id,
}) {
    const friendship = getFriendship(app.db, from_id, to_id)
    if (friendship) throw new AppError('you already added this player', 401)
    const result = addFriend(app.db, from_id, to_id)
    if (result.changes === 0)
        throw new AppError('Failed to send friend request', 500)
})

const cancelFriendRequestProcess = catchAsyncError(async function ({
    from_id,
    to_id,
}) {
    const friendship = getFriendship(app.db, from_id, to_id)
    if (!friendship) throw new AppError('No friend request exist', 404)
    if (friendship.status !== 'pending')
        throw new AppError('you cant cancel this friend request', 401)
    const result = cancelFriendShip(app.db, from_id, to_id)
    console.log(result)
    if (result.changes === 0)
        throw new AppError('Failed to cancel friend request', 500)
})

const responseRequestProcess = catchAsyncError(async function ({
    from_id,
    to_id,
    status,
}) {
    const friendship = getFriendship(app.db, from_id, to_id)
    if (!friendship) throw new AppError('No friend request exist', 404)
    if (friendship.status !== 'pending')
        throw new AppError('This friend request cannot be responded to', 400)
    let result
    if (status === 'accepted')
        result = updateFriendStatus(app.db, friendship.id, status)
    else if (status === 'rejected')
        result = cancelFriendShip(app.db, from_id, to_id)
    else throw new AppError('Invalid status, must be accepted or rejected', 400)
    if (result.changes === 0)
        throw new AppError('failed to respond to this player', 500)
})

const getFriendsByStatus = function (db, userId) {
    return {
        accepted: getAcceptedFriend(db, userId),
        sent: getSentFriendRequests(db, userId),
        received: getReceivedFriendRequests(db, userId),
        blocked: getBlockedFriend(db, userId),
    }
}

const removeFriendProcess = catchAsyncError(function ({ userId, friendId }) {
    const friendship = getFriendship(app.db, userId, friendId)
    if (!friendship) throw new AppError('No friendship exist', 404)

    if (friendship.status !== 'accepted')
        throw new AppError(
            'You cannot remove this player, they are not in your friend list',
            400
        )
    const result = deleteFriend(app.db, friendship.id)
    if (result.changes === 0)
        throw new AppError('Failed to remove this friend', 500)
})

const blockFriendProcess = catchAsyncError(async function ({
    userId,
    friendId,
}) {
    const friendship = getFriendship(app.db, userId, friendId)
    if (!friendship) throw new AppError('No friendship exist', 404)

    if (friendship.status !== 'accepted')
        throw new AppError(
            'You cannot block this player, they are not in your friend list',
            400
        )

    const result = updateFriendStatus(app.db, friendship.id, 'blocked')
    if (result.changes === 0)
        throw new AppError('Failed to block this friend', 500)
})

const unblockFriendProcess = catchAsyncError(async function ({
    userId,
    friendId,
}) {
    const friendship = getFriendship(app.db, userId, friendId)
    if (!friendship) throw new AppError('No friendship exist', 404)

    if (friendship.status !== 'blocked')
        throw new AppError('This player is not blocked', 400)

    const result = updateFriendStatus(app.db, friendship.id, 'accepted')
    if (result.changes === 0)
        throw new AppError('Failed to unblock this friend', 500)
})

module.exports = {
    sendFriendRequestProcess,
    cancelFriendRequestProcess,
    responseRequestProcess,
    getFriendsByStatus,
    removeFriendProcess,
    blockFriendProcess,
    unblockFriendProcess,
}
