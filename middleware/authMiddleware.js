// authMiddleware.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    // Se presupune că token-ul este în format "Bearer <token>"
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    // Adaugă și suport pentru ambele variante de cheie:
    req.user = { userId: decoded.userId || decoded.id, email: decoded.email };
    next();
  } catch (error) {
    console.error('Token error:', error);
    res.status(401).json({ message: 'Not authorized' });
  }
};

module.exports = { protect };

