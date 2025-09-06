function addFriend(db, from_id, to_id) {
    return db
        .prepare(
            `
    INSERT INTO friends (from_id, to_id)
    VALUES (?, ?) 
    `
        )
        .run(from_id, to_id)
}

function getFriendship(db, from_id, to_id) {
    return db
        .prepare(
            `
            SELECT * FROM friends 
            WHERE (from_id = ? AND to_id = ?)
               OR (from_id = ? AND to_id = ?)
            `
        )
        .get(from_id, to_id, to_id, from_id)
}

function cancelFriendShip(db, from_id, to_id) {
    console.log(from_id, to_id)
    const stmt = db
        .prepare(
            `
            DELETE FROM friends
            WHERE from_id = ? AND to_id = ? AND status = 'pending'
            `
        )
        .run(from_id, to_id)
    return stmt
}

function updateFriendStatus(db, friendId, status) {
    const stmt = db.prepare(`
    UPDATE friends
    SET status = ?
    WHERE id = ?
    `)
    stmt.run(status, friendId)
    return stmt
}

function acceptFriend(db, friendId) {
    return db
        .prepare(
            `
        UPDATE friends
        SET status = 'accepted'
        WHERE id = ?
    `
        )
        .run(friendId)
}

function cancelFriend(db, friendId) {
    return db
        .prepare(
            `
    UPDATE friends
    SET status = 'canceled'
    WHERE id = ?
    `
        )
        .run(friendId)
}

function blockFriend(db, friendId) {
    return db
        .prepare(
            `
    UPDATE friends
    SET status = 'blocked'
    WHERE id = ?
    `
        )
        .run(friendId)
}

function getAcceptedFriend(db, userId) {
    return db
        .prepare(
            `
    SELECT u.id, u.username, u.avatar, u.bio
    FROM friends f
    JOIN users u 
        ON (u.id = f.from_id AND f.to_id = ?) 
        OR (u.id = f.to_id AND f.from_id = ?)
    WHERE f.status = 'accepted'
`
        )
        .all(userId, userId)
}

function getSentFriendRequests(db, userId) {
    return db
        .prepare(
            `
    SELECT u.id, u.username, u.avatar, u.bio
    FROM friends f
    JOIN users u ON u.id = f.to_id
    WHERE f.from_id = ? AND f.status = 'pending'
`
        )
        .all(userId)
}

function getReceivedFriendRequests(db, userId) {
    return db
        .prepare(
            `
SELECT u.id, u.username, u.avatar, u.bio
FROM friends f
JOIN users u ON u.id = f.from_id
WHERE f.to_id = ? AND f.status = 'pending'
`
        )
        .all(userId)
}

function getBlockedFriend(db, userId) {
    return db
        .prepare(
            `
    SELECT u.id, u.username, u.avatar, u.bio
    FROM friends f
    JOIN users u ON u.id = f.to_id
    WHERE f.from_id = ? AND f.status = 'blocked'
`
        )
        .all(userId)
}

function deleteFriend(db, id) {
    return db
        .prepare(
            `
    DELETE FROM friends 
    WHERE id = ?
`
        )
        .run(id)
}

function updateFriendStatus(db, friendId, status) {
    return db
        .prepare(
            `
            UPDATE friends
            SET status = ?
            WHERE id = ?
        `
        )
        .run(status, friendId)
}

module.exports = {
    getFriendship,
    addFriend,
    acceptFriend,
    blockFriend,
    cancelFriend,
    cancelFriendShip,
    updateFriendStatus,
    getAcceptedFriend,
    getSentFriendRequests,
    getReceivedFriendRequests,
    getBlockedFriend,
    deleteFriend,
}
