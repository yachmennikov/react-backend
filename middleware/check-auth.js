const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const err = new HttpError('Authorization failed!', 401);
    if (req.method === 'OPTIONS') {
        return next()
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return next(err)
        }
    const decodedToken = jwt.verify(token, 'supersecret_dont_share');
    req.userData = { userId: decodedToken.userId }
    next()
    } catch (error) {
        return next(err)
    }  
}