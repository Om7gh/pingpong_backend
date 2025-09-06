const requestFriendSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['to_user'],
            properties: {
                to_user: { type: 'string' },
            },
            additionalProperties: false,
        },
    },
}

const responseFriendSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['to_user', 'status'],
            properties: {
                to_user: { type: 'string' },
                status: { type: 'string' },
            },
            additionalProperties: false,
        },
    },
}

module.exports = { requestFriendSchema, responseFriendSchema }
