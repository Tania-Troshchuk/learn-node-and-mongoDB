const mongoose = require('mongoose');
const Joi = require('joi')

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    maxlength: 50,
    required: true
  },
  isFilms: {
    type: Boolean,
    default: true
  }
})

const Genre = mongoose.model('Course', genreSchema)

function validateGenre(genre) {
  const schema = {
    name: Joi.string().min(3).max(50).required()
  };

  return Joi.validate(genre, schema);
}

exports.Genre = Genre;
exports.validateGenre = validateGenre;
exports.genreSchema = genreSchema;