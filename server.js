// server.js
const dotenv = require('dotenv');
dotenv.config(); // Încărcăm variabilele de mediu imediat

const express = require('express');
const cors = require('cors');
const session = require('express-session'); // Pentru sesiuni, necesare la OAuth
const { pool, connectDB } = require('./config/db');

console.log({
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.PGDATABASE,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_PORT: process.env.DB_PORT,
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configurare sesiuni (necesare pentru Passport cu OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false
}));

// Importă Passport configurat pentru Google OAuth
const passport = require('./auth/authGoogle');
app.use(passport.initialize());
app.use(passport.session());

// Conectăm baza de date
connectDB();

// Rutele pentru Google OAuth
app.get('/api/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generează un token JWT pentru utilizatorul autentificat
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    // Redirecționează către frontend cu token-ul în query string
    res.redirect(`http://localhost:3000/?token=${token}`);
  }
);

// Importăm celelalte rute
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Montăm rutele
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('E-commerce API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});






