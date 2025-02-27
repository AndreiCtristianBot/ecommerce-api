const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { pool } = require('./db');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [profile.emails[0].value]);
        let user;
        if (result.rows.length === 0) {
          const newUser = await pool.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
            [profile.displayName, profile.emails[0].value]
          );
          user = newUser.rows[0];
        } else {
          user = result.rows[0];
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: '/api/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'emails'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [profile.emails[0].value]);
        let user;
        if (result.rows.length === 0) {
          const newUser = await pool.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
            [profile.displayName, profile.emails[0].value]
          );
          user = newUser.rows[0];
        } else {
          user = result.rows[0];
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  done(null, result.rows[0]);
});

module.exports = passport;