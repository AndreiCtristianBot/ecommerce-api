const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const crypto = require('crypto');

// POST /api/orders – plasare comandă
// POST /api/orders – plasare comandă
router.post('/', protect, async (req, res) => {
  const userId = req.user.userId; // din token
  const { county, city, address, phone, email, total, items } = req.body; // items: array de { product_id, quantity, price }
  
  try {
    // Inserăm comanda și returnează ID-ul comenzii
    const orderResult = await pool.query(
      'INSERT INTO orders (user_id, county, city, address, phone, email, total) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [userId, county, city, address, phone, email, total]
    );
    const orderId = orderResult.rows[0].id;

    // Generează un token aleatoriu pentru comandă (ex. 8 caractere hexazecimale)
    const orderToken = crypto.randomBytes(4).toString('hex');

    // Actualizează comanda cu token-ul generat
    await pool.query('UPDATE orders SET order_token = $1 WHERE id = $2', [orderToken, orderId]);

    // Inserează elementele comenzii
    for (let item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    res.status(201).json({ message: 'Comanda a fost plasată cu succes', orderId, orderToken });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Eroare la crearea comenzii' });
  }
});


// GET /api/orders – preluare comenzi (actualizează statusul la Delivered pentru comenzile mai vechi de 1 oră)
router.get('/', protect, async (req, res) => {
  const userId = req.user.userId;
  try {
    // Actualizează statusul comenzilor mai vechi de 1 oră la 'Delivered'
    await pool.query(
      `UPDATE orders 
       SET status = 'Delivered' 
       WHERE user_id = $1 AND order_date <= (NOW() - INTERVAL '1 hour')`,
      [userId]
    );

    // Preia comenzile pentru utilizatorul logat cu elementele corespunzătoare
    const ordersResult = await pool.query(
      `SELECT o.id, o.order_token, o.county, o.city, o.address, o.phone, o.email, o.total, o.order_date, o.status,
              COALESCE(json_agg(oi) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.order_date DESC`,
      [userId]
    );
    res.json(ordersResult.rows);
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).json({ message: 'Error retrieving orders' });
  }
});

// DELETE /api/orders/:id – șterge o comandă, dar numai dacă are statusul 'Delivered'
router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;
  try {
    // Verifică dacă comanda există și are statusul 'Delivered'
    const orderRes = await pool.query('SELECT status FROM orders WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Comanda nu a fost găsită' });
    }
    if (orderRes.rows[0].status !== 'Delivered') {
      return res.status(400).json({ message: 'Doar comenzile livrate pot fi șterse' });
    }
    // Șterge elementele comenzii
    await pool.query('DELETE FROM order_items WHERE order_id = $1', [id]);
    // Șterge comanda
    await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    res.json({ message: 'Comanda a fost ștearsă cu succes' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Eroare la ștergerea comenzii' });
  }
});

module.exports = router;






