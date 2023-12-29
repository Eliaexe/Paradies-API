// passport-config.js
const InstagramStrategy = require('passport-instagram').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const SnapchatStrategy = require('passport-snapchat').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const { each } = require('mongoose/lib/utils');
const User = require('../models/User'); 

const authType = ['snapchat']
// ,'instagram', 'google', 'facebook', 'apple'

const authenticationStrategies = authType.map(e => {
  const strategy = require(`${e.charAt(0).toUpperCase() + e.slice(1).toLowerCase()}Strategy`);
  return {
    name: e,
    strategy: strategy,
    options: {
      clientID: process.env[`PUBLIC_${e.toUpperCase()}_ID`],
      clientSecret: process.env[`PRIVATE_${e.toUpperCase()}_KEY`],
      callbackURL: `${process.env.CLIENT_URL}auth/${e}/callback`
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
