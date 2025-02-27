// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;

// Endpoint pentru înregistrare
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Verifică dacă utilizatorul există deja
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Utilizatorul există deja' });
    }
    // Hash pentru parolă
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Inserează noul utilizator
    const newUserResult = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    const newUser = newUserResult.rows[0];
    // Generează token (opțional, pentru autentificare automată)
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(201).json({ token, user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Înregistrarea nu s-a putut efectua' });
  }
});

module.exports = router;

