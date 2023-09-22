const request = require('supertest');
const { Genre } = require('../../models/genre')
const { User } = require('../../models/user');
const { default: mongoose } = require('mongoose');
let server;

describe('api/genres', () => {
  beforeEach(() => { server = require('../../index') })
  afterEach(async () => {
    await server.close();
    await Genre.collection.deleteMany({})
  })

  describe('GET /', () => {
    it('should return all genres', async () => {
      await Genre.collection.insertMany([
        { name: 'genre-1', isFilms: true },
        { name: 'genre-2', isFilms: true },
      ])

      const res = await request(server).get('/api/genres')
      expect(res.status).toBe(200)
      expect(res.body.length).toBe(2)
      expect(res.body.some(genre => genre.name === 'genre-1')).toBeTruthy()
      expect(res.body.some(genre => genre.name === 'genre-2')).toBeTruthy()
    })
  })

  describe('GET /:id', () => {
    it('should return a genre if valid id is passed', async () => {
      const genre = new Genre({ name: 'genre-1', isFilms: true })
      await genre.save()

      const res = await request(server).get(`/api/genres/${genre._id}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('name', genre.name)
      expect(res.body).toHaveProperty('isFilms', genre.isFilms)
    })

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/genres/1')

      expect(res.status).toBe(404)
    })

    it('should return 404 if no genre with the given id exists', async () => {
      const id = new mongoose.Types.ObjectId()
      const res = await request(server).get('/api/genres/' + id)

      expect(res.status).toBe(404)
    })
  })

  describe('POST /', () => {
    let token;
    let name;

    const execute = async () => {
      return await request(server)
        .post('/api/genres')
        .set('X-Auth-Token', token)
        .send({ name })
    }

    beforeEach(() => {
      token = new User().generateAuthToken()
      name = 'genre-1'
    })

    it('should return 401 if client is not logged in', async () => {
      token = ''

      const res = await execute()

      expect(res.status).toBe(401)
    })

    it('should return 400 if genre is less that 3 characters', async () => {
      name = 'ge';

      const res = await execute()

      expect(res.status).toBe(400)
    })

    it('should return 400 if genre is more that 50 characters', async () => {
      name = new Array(52).join('a')

      const res = await execute()

      expect(res.status).toBe(400)
    })

    it('should save the genre if it is valid', async () => {
      await execute()

      const genre = await Genre.find({ name: 'genre-1' })

      expect(genre).not.toBeNull()
    })

    it('should return the genre if it is valid', async () => {
      const res = await execute()

      expect(res.body).toHaveProperty('_id')
      expect(res.body).toHaveProperty('name', 'genre-1')
    })
  })

  describe('DELETE /:id', () => {
    let genre;
    let token;
    let id;

    beforeEach(async () => {
      genre = new Genre({ name: 'genre-1' })
      await genre.save()
      id = genre._id

      token = new User({ isAdmin: true }).generateAuthToken()
    })

    const execute = () => {
      return request(server)
      .delete(`/api/genres/${id}`)
      .set('X-Auth-Token', token)
    }

    it('should return 401 if client is not logged in', async () => {
      token = ''

      const res = await execute()

      expect(res.status).toBe(401)
    })

    it('should return 403 if client is not an admin', async () => {
      token = new User().generateAuthToken()

      const res = await execute()

      expect(res.status).toBe(403)
    })

    it('should return 404 if id is invalid', async () => {
      id = 1

      const res = await execute()

      expect(res.status).toBe(404)
    })

    it('should return 404 if the genre with given id if not found', async () => {
      id = new mongoose.Types.ObjectId()

      const res = await execute()

      expect(res.status).toBe(404)
    })

    it('should delete the genre if input is valid', async() => {
      const genreInDb = await Genre.findById(id)
      expect(genreInDb).toBeDefined()

      await execute()

      const deletedGenre = await Genre.findById(id)
      expect(deletedGenre).toBeNull()
    })

    it('should return the genre if input is valid', async () => {
      const res = await execute()

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('name', genre.name)
      expect(res.body).toHaveProperty('_id', genre._id.toHexString())
    })
  })

  describe('PUT /:id', () => {
    let token;
    let id;
    let name;
    let genre;

    const runRequest = () => {
      return request(server)
        .put(`/api/genres/${id}`)
        .set('X-Auth-Token', token)
        .send({ name })
    }

    beforeEach(async () => {
      genre = new Genre({ name: 'genre-1' })
      await genre.save()
      id = genre._id
      name = 'genre-2'

      token = new User().generateAuthToken()
    })

    it('should return 401 for if client not logged in', async () => {
      token = ''

      const res = await runRequest()

      expect(res.status).toBe(401)
    })

    it('should return 404 if id is invalid', async () => {
      id = 1

      const res = await runRequest()

      expect(res.status).toBe(404)
    })

    it('should return 400 if the genre less than 3 charachters', async () => {
      name = 'ge'

      const res = await runRequest()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the genre more than 50 charachters', async () => {
      name = new Array(52).join('a')

      const res = await runRequest()

      expect(res.status).toBe(400)
    })

    it('should return 404 if the genre with given id is not found', async () => {
      id = new mongoose.Types.ObjectId()
      
      const res = await runRequest()

      expect(res.status).toBe(404)
    })

    it('should update the genre in DB if input is valid', async () => {
      await runRequest()

      const genreInDb = await Genre.findById(id)

      expect(genreInDb.name).toBe(name)
    })

    it('should return the updated genre if input is valid', async () => {
      const res = await runRequest()

      expect(res.body).toHaveProperty('_id')
      expect(res.body).toHaveProperty('name', name)
    })
  })
})