// passport-config.js
const InstagramStrategy = require('passport-instagram').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const SnapchatStrategy = require('passport-snapchat').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const { each } = require('mongoose/lib/utils');
const User = require('./models/User'); // Assicurati di avere un modello User nel tuo progetto

const authType = [instagram, google, snapchat, facebook, apple]

const authenticationStrategies = authType.map(e => {
  const capitalizedStrategy = `${e.charAt(0).toUpperCase() + e.slice(1)}Strategy`;

  return {
    name: e,
    strategy: capitalizedStrategy,
    options: {
      clientID: `your-${e}-client-id`,
      clientSecret: `your-${e}-client-secret`,
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
