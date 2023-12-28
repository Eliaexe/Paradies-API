// passport-config.js
const InstagramStrategy = require('passport-instagram').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const SnapchatStrategy = require('passport-snapchat').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const { each } = require('mongoose/lib/utils');
const User = require('../models/User'); 

const authType = ['instagram', 'google', 'snapchat', 'facebook', 'apple']

const authenticationStrategies = authType.map(e => {
  const strategy = require(`passport-${e}`).Strategy

  return {
    name: e,
    strategy: strategy,
    options: {
      clientID: process.env[`PUBLIC${e}KEY`],
      clientSecret: process.env[`PRIVATE${e}KEY`],
      callbackURL: `http://localhost:5000/auth/${e}/callback`
    },
    callback: (accessToken, refreshToken, profile, done) => {
      // Implementa la logica per trovare o creare l'utente nel database
      const socialId = `${e}Id`;
      const query = {};
      query[socialId] = profile.id;

      User.findOneOrCreate(query, function (err, user) {
        return done(err, user);
      });
    }
  };
});

module.exports = function (passport) {
  authenticationStrategies.forEach(({ name, strategy, options, callback }) => {
    passport.use(
      new strategy(options, callback)
    );
  });
};
