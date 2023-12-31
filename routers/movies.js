const express = require('express');
const { Movie, validateMovie } = require('../models/movie');
const { Genre } = require('../models/genre');
const auth = require('../middleware/auth');
const router = express.Router()
const validate = require('../middleware/validate')

router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().sort('name')
    res.send(movies)
  } catch (err) {
    res.status(400).send(err.message)
  }
});

router.post('/', [auth, validate(validateMovie)], async (req, res) => {
  const genre = await Genre.findById(req.body.genreId)

  if (!genre) return res.status(400).send('Invalid genre')

  const movie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate
  })
  await movie.save();

  res.send(movie);
});

router.put('/:id', [auth, validate(validateMovie)], async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    // {$set: { name: req.body.name }},
    { name: req.body.name },
    {new: true }
  )

  if (!movie) return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

router.delete('/:id', auth, async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);

  if (!movie) return res.status(404).send('The movie with the given ID was not found.');
  res.send(movie);
});

router.get('/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) return res.status(404).send('The movie with the given ID was not found.');
  res.send(movie);
});

module.exports = router;