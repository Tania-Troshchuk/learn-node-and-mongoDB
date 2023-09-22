const express = require('express')
const auth = require('../middleware/auth')
const { validateRental, Rental } = require('../models/rental')
const { Movie } = require('../models/movie');
const validate = require('../middleware/validate')
const router = express.Router()

router.post('/', [auth, validate(validateRental)], async (req, res) => {
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId)

  if (!rental) {
    return res.status(404).send('The rental not found')
  }

  if (rental.dateReturned) {
    return res.status(400).send('The rental already processed')
  }

  rental.return()
  await rental.save()

  await Movie.updateOne({ _id: req.body.movieId }, { 
    $inc: { numberInStock: 1 }
   })

  return res.send(rental)
})

module.exports = router