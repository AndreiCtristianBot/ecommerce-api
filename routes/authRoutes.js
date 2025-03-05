// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
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

// Endpoint pentru login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Caută utilizatorul după email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email sau parola incorectă' });
    }
    const user = result.rows[0];
    // Compară parola furnizată cu cea criptată din baza de date
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email sau parola incorectă' });
    }
    // Generează token-ul JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Eroare la autentificare' });
  }
});

module.exports = router;


