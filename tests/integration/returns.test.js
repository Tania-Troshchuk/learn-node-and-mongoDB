const request = require('supertest')
const mongoose = require('mongoose')
const { Rental } = require('../../models/rental');
const { User } = require('../../models/user');
const moment = require('moment');
const { Movie } = require('../../models/movie');
let server;

describe('/api/returns', () => {
  let customerId;
  let movieId;
  let rental;
  let token;
  let movie;

  beforeEach(async () => { 
    server = require('../../index')
    customerId = new mongoose.Types.ObjectId()
    movieId = new mongoose.Types.ObjectId()
    token = new User().generateAuthToken()

    movie = new Movie({
      _id: movieId,
      title: '123',
      dailyRentalRate: 2,
      genre: { name: '12345'},
      numberInStock: 10
    })
    await movie.save()

    rental = new Rental({
      customer: {
        _id: customerId, 
        name: '123',
        phone: '1234'
      },
      movie: {
        _id: movieId,
        title: '123',
        dailyRentalRate: 2
      }
    })

    await rental.save()
  })

  afterEach(async () => { 
    await server.close()
    await Rental.collection.deleteMany({})
    await Movie.collection.deleteMany({})
  })

  const runRequest = () => {
    return request(server)
      .post('/api/returns')
      .set('X-Auth-Token', token)
      .send({ customerId, movieId })
  }

  it('should work', async () => {
    const rentalInDb = await Rental.findById(rental._id)
    expect(rentalInDb).not.toBeNull()
  })

  it('should return 401 if client not looged in', async () => {
    token = ''
    
    const res = await runRequest()

    expect(res.status).toBe(401)
  })

  it('should return 400 if customerId is not provided', async () => {
    customerId = ''

    const res = await runRequest()

    expect(res.status).toBe(400)
  })

  it('should return 400 if movieId is not provided', async () => {
    movieId = ''

    const res = await runRequest()

    expect(res.status).toBe(400)
  })

  it('should return 404 if not rental found for customer/movie', async () => {
    await Rental.collection.deleteMany({})

    const res = await runRequest()

    expect(res.status).toBe(404)
  })

  it('should return 400 if the rental already processed', async () => {
    rental.dateReturned = Date.now()
    await rental.save()
    
    const res = await runRequest()

    expect(res.status).toBe(400)
  })

  it('should return 200 if the request is valid', async () => {
    const res = await runRequest()

    expect(res.status).toBe(200)
  })

  it('should set returned date to the rental', async () => {
    await runRequest()

    const rentalInDb = await Rental.findById(rental._id)
    const diff = new Date() - rentalInDb.dateReturned

    expect(diff).toBeLessThan(10 * 1000)
  })

  it('should calculate the rentall fee', async () => {
    rental.dateOut = moment().add(-7, 'days').toDate()
    await rental.save()

    await runRequest()

    const rentalInDb = await Rental.findById(rental._id)

    expect(rentalInDb.rentalFee).toBe(14)
  })

  it('should increase the movie stock', async () => {
    await runRequest()

    const movieInDb = await Movie.findById(movieId)

    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1)
  })

  it('should return the rental', async () => {
    const res = await runRequest()

    expect(Object.keys(res.body)).toEqual(expect.arrayContaining([
      'dateOut', 'dateReturned', 'rentalFee', 'customer', 'movie'
    ]))
  })
})