const signInSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['username', 'email', 'password'], // Required fields
            properties: {
                username: { type: 'string', minLength: 3, maxLength: 20 },
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 8, maxLength: 20 },
            },
        },
    },
}

module.exports.signInSchema = signInSchema
