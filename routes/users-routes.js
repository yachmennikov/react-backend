const express = require('express');
const { check } = require('express-validator');
// custom modules
const usersController = require('../controllers/users-controller');
const fileUpload = require('../middleware/file-upload');
const router = express.Router();

router
    .route('/')
    .get(usersController.getUsers)

router
    .route('/signup')
    .post(
        fileUpload.single('image'),
        [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({min: 6})
    ],
    usersController.signup)

router
    .route('/login')
    .post(usersController.login)

module.exports = router;