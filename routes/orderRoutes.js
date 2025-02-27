const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, async (req, res) => {
  const userId = req.user.userId; // din token
  const { address, phone, email, total, items } = req.body; // items: array de { product_id, quantity, price }
  
  try {
    // Inserează comanda și returnează ID-ul comenzii
    const orderResult = await pool.query(
      'INSERT INTO orders (user_id, address, phone, email, total) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [userId, address, phone, email, total]
    );
    const orderId = orderResult.rows[0].id;

    // Inserează elementele comenzii
    for (let item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    res.status(201).json({ message: 'Comanda a fost plasată cu succes', orderId });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Eroare la crearea comenzii' });
  }
});

module.exports = router;



