// routes/cartRoutes.js
const express = require('express');
const { addToCart, getCart, removeFromCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, addToCart);
router.get('/', protect, getCart);
router.delete('/:id', protect, removeFromCart);

// Exportă direct instanța routerului, nu ca parte a unui obiect!
module.exports = router;


