const SnapchatStrategy = require('passport-snapchat').Strategy;
const User = require('../models/User');

const authenticationStrategies = [
  {
    name: 'snapchat',
    strategy: SnapchatStrategy,
    options: {
      clientID: process.env.PUBLIC_SNAPCHAT_ID,
      clientSecret: process.env.PRIVATE_SNAPCHAT_KEY,
      callbackURL: `${process.env.CLIENT_URL}auth/snapchat/callback`,
    },
    callback: (accessToken, refreshToken, profile, done) => {
      // Implement the logic to find or create the user in the database
      const socialId = 'snapchatId';
      const query = {};
      query[socialId] = profile.id;

      User.findOneOrCreate(query, function (err, user) {
        return done(err, user);
      });
    },
  },
];

module.exports = function (passport) {
  authenticationStrategies.forEach(({ name, strategy, options, callback }) => {
    passport.use(new strategy(options, callback));
  });
};
