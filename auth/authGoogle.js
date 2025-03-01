// auth/authGoogle.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { pool } = require('../config/db'); // Folosește conexiunea la DB

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // setat în .env
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // setat în .env
    callbackURL: process.env.GOOGLE_CALLBACK_URL // de ex.: http://localhost:8000/api/auth/google/callback
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Verifică dacă utilizatorul există deja pe baza email-ului furnizat de Google
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [profile.emails[0].value]);
      if (result.rows.length > 0) {
        return done(null, result.rows[0]);
      } else {
        // Dacă utilizatorul nu există, îl creează (poți lăsa parola goală sau seta un placeholder)
        const newUserResult = await pool.query(
          'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
          [profile.displayName, profile.emails[0].value, ''] 
        );
        return done(null, newUserResult.rows[0]);
      }
    } catch (err) {
      return done(err, null);
    }
  }
));

// Serializare și deserializare pentru sesiuni (dacă folosești sesiuni)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;

