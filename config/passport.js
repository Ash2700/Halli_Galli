const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const { User } = require('../models')

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWTSECRET
}

passport.use(new JwtStrategy(options, function (jwt_payload, done) {
  User.findOne({ where: { email: jwt_payload.email }, attributes: { exclude: ['password'] } })
  .then(user => done(null, user))
  .catch(error => done(error))
}))



module.exports = passport