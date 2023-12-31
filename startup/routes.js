const express = require('express')
const genres = require('../routers/genres')
const customers = require('../routers/customers')
const movies = require('../routers/movies')
const rental = require('../routers/rental')
const users = require('../routers/users')
const auth = require('../routers/auth')
const returns = require('../routers/returns')
const { errorHandler } = require('../middleware/errorHandler')

module.exports = function (app) {
  app.use(express.json())
  app.use('/api/genres', genres)
  app.use('/api/customers', customers)
  app.use('/api/movies', movies)
  app.use('/api/rentals', rental)
  app.use('/api/users', users)
  app.use('/api/auth', auth)
  app.use('/api/returns', returns)
  app.use(errorHandler)
}