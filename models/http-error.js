class HttpError extends Error {
    constructor (message, errorCode) {
        super(message) //add message property from Error class
        this.code = errorCode
    }
}

module.exports = HttpError