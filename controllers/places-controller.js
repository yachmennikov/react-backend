const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const fs = require('fs');
// custom modules
const HttpError = require('../models/http-error');
const Place = require('../models/place');
const User = require('../models/user');

exports.getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    const place = await Place.findById(placeId)
    if (!place) {
        throw new HttpError('Could not find a place for the provided id', 404);
    }
    res.json( {place: place.toObject({ getters: true })} )
}

exports.getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let userWithPlaces;
    try {
        userWithPlaces = await User.findById(userId).populate('places')
    } catch (err) {
        throw new Error('Could not find a place for the provided user id', 404)
    }
    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        throw new Error('Could not find a place for the provided user id', 404)
    }
    res.json( {places: userWithPlaces.places} )
}

exports.createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description, address, creator } = req.body;

  const createdPlace = new Place({
    title,
    description,
    address,
    image: req.file.path,
    creator
  });

  let user;
  try {
    let user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to edit this place',
      401
    );
    return next(error)
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess }); 
    user.places.push(createdPlace); 
    await user.save({ session: sess }); 
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

exports.updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

exports.deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId).populate('creator')
    } catch (err) {
        return next(new HttpError('Something went wrong, could not delete place', 500)) 
    }
    if (!place) {
        return next(new HttpError('The place could not be find', 404))
    }

    if(place.creator.id.toString() !== req.userData.userId) {
      const error = new HttpError(
        'You are not allowed to delete this place',
        401
      );
      return next(error)
    }

    const imagePath = place.image;
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await place.remove({session: session});
        place.creator.places.pull(place);
        await place.creator.save({session: session});
        await session.commitTransaction()
    } catch (err) {
        return next(new HttpError('Something went wrong, could not delete place', 500)) 
    }
    fs.unlink(imagePath, err => {
      console.log(err)
    })
    res
      .status(200)
      .json({message: 'Deleted place'})
}

