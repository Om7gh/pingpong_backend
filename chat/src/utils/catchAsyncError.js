const catchAsyncError = (fn) => {
    return async function (req, rep) {
        try {
            await fn(req, rep)
        } catch (error) {
            throw error
        }
    }
}

module.exports = catchAsyncError
