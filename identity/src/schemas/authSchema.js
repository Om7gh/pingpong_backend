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
            additionalProperties: false,
        },
    },
}

const loginSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
                username: { type: 'string' },
                password: { type: 'string' },
            },
            additionalProperties: false,
        },
    },
}

const activateSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['otp'],
            properties: {
                otp: {
                    type: 'string',
                    pattern: '^[0-9]{4,6}$',
                },
            },
            additionalProperties: false,
        },
    },
}

const forgetPasswordSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['email'],
            properties: {
                email: { type: 'string', format: 'email' },
            },
            additionalProperties: false,
        },
    },
}

const resetPasswordSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['password', 'repeatPassword'],
            properties: {
                password: { type: 'string', maxLength: 25, minLength: 8 },
                repeatPassword: { type: 'string', maxLength: 25, minLength: 8 },
            },
            additionalProperties: false,
        },
    },
}

const check2faSchema = {
    schema: {
        querystring: {
            type: 'object',
            required: ['token'],
            properties: {
                token: { type: 'string', minLength: 10 }, // adjust validation as needed
            },
            additionalProperties: false,
        },
    },
}

module.exports = {
    signInSchema,
    loginSchema,
    activateSchema,
    forgetPasswordSchema,
    resetPasswordSchema,
    check2faSchema,
}
