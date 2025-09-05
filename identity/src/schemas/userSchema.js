const updatePasswordSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['oldpassword', 'newpassword', 'repeatnewpassword'],
            properties: {
                oldpassword: { type: 'string' },
                newpassword: { type: 'string', minLength: 8, maxLength: 20 },
                repeatnewpassword: {
                    type: 'string',
                    minLength: 8,
                    maxLength: 20,
                },
            },
            additionalProperties: false,
        },
    },
}

const updateBioSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['bio'],
            properties: {
                bio: { type: 'string', minLength: 10, maxLength: 50 },
            },
            additionalProperties: false,
        },
    },
}

const updateUsernameSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['username'],
            properties: {
                username: { type: 'string' },
            },
            additionalProperties: false,
        },
    },
}

const active2faSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['password'],
            properties: {
                password: { type: 'string' },
            },
            additionalProperties: false,
        },
    },
}

module.exports = {
    updateUsernameSchema,
    updatePasswordSchema,
    updateBioSchema,
    active2faSchema,
}
