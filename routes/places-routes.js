const express = require('express');
const { check } = require('express-validator');
// custom modules
const placesController = require('../controllers/places-controller');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router()

router
    .route('/:pid')
    .get(placesController.getPlaceById)

router
    .route('/user/:uid')
    .get(placesController.getPlacesByUserId)

router.use(checkAuth)

router
    .route('/')
    .post(
        fileUpload.single('image'),
        [
        check('title').not().isEmpty(),
        check('description').isLength({min: 5}),
        check('address').not().isEmpty()
    ], 
    placesController.createPlace)

router
    .route('/:pid')
    .patch([
        check('title').not().isEmpty()
    ],
    placesController.updatePlace)

router
    .route('/:pid')
    .delete(placesController.deletePlace)

module.exports = router;