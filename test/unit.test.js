const sinon = require('sinon');
const userService = require('../service/user-service')
const { User } = require('../models')

describe('Unit Tests for userService', () => {
  describe('postRegister', () => {
    it('should create a new user', async () => {
      const req = {
        body: {
          gameName: 'testUser',
          email: 'test@example.com',
          password: 'password',
          passwordCheck: 'password'
        }
      };
      const countStub = sinon.stub().resolves(0);
      const createStub = sinon.stub().resolves({ toJSON: () => ({ gameName: 'testUser', email: 'test@example.com' }) });
      sinon.replace(userService.User, 'count', countStub);
      sinon.replace(userService.User, 'create', createStub);

      const result = await userService.postRegister(req);
      expect(result).to.deep.equal({ gameName: 'testUser', email: 'test@example.com' });

      sinon.restore();
    });
  });

  describe('postLogin', () => {
    it('should return a token and user data', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password'
        }
      };
      const findOneStub = sinon.stub().resolves({ email: 'test@example.com', password: '$2b$10$ZVuMZkSfUa8cjfCfM9WZ5eJ2ZpUaCFkV9ggNnZoUD.p8/fmr/GNkO' });
      sinon.replace(userService.User, 'findOne', findOneStub);

      const result = await userService.postLogin(req);
      expect(result).to.have.property('token');
      expect(result).to.have.property('user');
      expect(result.user).to.not.have.property('password');

      sinon.restore();
    });

    it('should throw an error for incorrect email or password', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      };
      const findOneStub = sinon.stub().resolves({ email: 'test@example.com', password: '$2b$10$ZVuMZkSfUa8cjfCfM9WZ5eJ2ZpUaCFkV9ggNnZoUD.p8/fmr/GNkO' });
      sinon.replace(userService.User, 'findOne', findOneStub);

      try {
        await userService.postLogin(req);
      } catch (err) {
        expect(err.message).to.equal('Incorrect email or password');
      }

      sinon.restore();
    });
  });
});
