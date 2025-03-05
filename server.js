// server.js
const dotenv = require('dotenv');
dotenv.config(); // Încărcăm variabilele de mediu imediat

const express = require('express');
const cors = require('cors');
const session = require('express-session'); // Pentru sesiuni, necesare la OAuth
const { pool, connectDB } = require('./config/db');

// Noi dependințe pentru securitate
const helmet = require('helmet');
const hpp = require('hpp');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');

console.log({
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.PGDATABASE,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_PORT: process.env.DB_PORT,
});

const app = express();
const PORT = process.env.PORT || 5000;

/* 
  Aplicați middleware-urile de securitate:
  - Helmet: setează headere de securitate HTTP
  - HPP: previne HTTP Parameter Pollution
  - xss-clean: sanitizează input-urile pentru a preveni XSS
  - Rate Limiting: limitează numărul de cereri pe o perioadă de timp
*/
app.use(helmet());
app.use(hpp());
app.use(xssClean());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 100, // maxim 100 cereri per IP pe fereastră
  message: 'Prea multe cereri, te rugăm să încerci din nou mai târziu.'
});
app.use(limiter);

// Configurare CORS – se poate ajusta după necesități
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parsează cookie-urile (necesare pentru csurf)
app.use(cookieParser());

// Configurare sesiuni (pentru Passport și alte utilizări)
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true }
}));

// Parsează corpul cererilor (similar body-parser)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurare CSRF – folosește cookie-uri pentru stocarea tokenului CSRF
// Notă: Dacă API-ul tău folosește autentificare JWT în header,
// riscul CSRF este redus, dar această protecție poate fi utilă pentru rutele critice.
const csrfProtection = csurf({ cookie: true });
app.use(csrfProtection);

// Expunem token-ul CSRF către client printr-un cookie
app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
});

// Importăm Passport configurat pentru Google OAuth
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







