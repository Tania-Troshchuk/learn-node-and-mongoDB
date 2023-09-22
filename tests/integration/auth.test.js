const request = require('supertest');
const { User } = require('../../models/user');
const { Genre } = require('../../models/genre');
let server;

describe('auth middleware', () => {
  let token;

  beforeEach(() => { 
    server = require('../../index');
    token = new User().generateAuthToken();
  })
  afterEach(async () => {
    await Genre.collection.deleteMany({})
    await server.close()
  })

  const execute = () => {
    return request(server)
      .post('/api/genres')
      .set('X-Auth-Token', token)
      .send({ name: 'genre-1' })
  }
  
  it('should return 401 if no token is provided', async () => {
    token = ''

    const res = await execute()

    expect(res.status).toBe(401)
  })

  it('should return 400 if token is invalid', async () => {
    token = 'a'

    const res = await execute()

    expect(res.status).toBe(400)
  })

  it('should return 200 if token is valid', async () => {
    const res = await execute()

    expect(res.status).toBe(200)
  })
})