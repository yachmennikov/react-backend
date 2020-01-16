const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const placeSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        minlength: 10
    },
    address: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    image: {
        type: String
    }
})

module.exports = mongoose.model('Place', placeSchema)