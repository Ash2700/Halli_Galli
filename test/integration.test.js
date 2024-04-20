const app = require('../app');
const request = require('supertest');
const assert = require('assert')
const sinon = require('sinon')
const userService = require('../service/user-service')

describe('Integration Tests', () => {
  afterEach(function () {
    sinon.restore()
  })
  it('should return status 200 for POST /register', async () => {
    sinon.stub(userService, 'postRegister').resolves({
      gameName: 'testUser',
      email: 'test@example.com',
    })
    const res = await request(app)
      .post('/register')
      .send({
        gameName: 'testUser',
        email: 'test@example.com',
        password: 'password',
        passwordCheck: 'password'
      })
      console.log(res.body)
    assert.equal(res.statusCode, 200)
    assert.equal(res.body.status, 'success')
  });

  it('should return status 200 for POST /login', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'test@example.com',
        password: 'password'
      })
    console.log(res.body)
    assert.equal(res.statusCode, 200)
    assert.equal(res.body.status, 'success')
  });
});
