const express = require('express');
const { Rental, validateRental } = require('../models/rental');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const rentals = await Rental.find().sort('-dateOut')
    res.send(rentals)
  } catch (err) {
    res.status(400).send(err.message)
  }
})

router.post('/', [auth, validate(validateRental)], async (req, res) => {
  const customer = await Customer.findById(req.body.customerId)
  if (!customer) return res.status(400).send('Customer with given Id not found')

  const movie = await Movie.findById(req.body.movieId)
  if (!movie) return res.status(400).send('Movie with given Id not found')
  if (!movie.numberInStock) return res.status(400).send('Movie not in stock')

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate
    },
    rentalFee: 12
  })

  rental = await rental.save()
  movie.numberInStock--;
  res.send(rental)
})

module.exports = router