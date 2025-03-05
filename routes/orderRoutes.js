const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const crypto = require('crypto');



// Adaugă acest endpoint în orderRoutes.js
router.get('/', protect, async (req, res) => {
  const userId = req.user.userId || req.user.id;
  await pool.query(
    `UPDATE orders
     SET status = 'Delivered'
     WHERE user_id = $1
       AND status = 'Pending'
       AND order_date < (CURRENT_TIMESTAMP - INTERVAL '1 hour')`,
    [userId]
  );
  try {
    const result = await pool.query(`
      SELECT 
        o.*,
        COALESCE(
          (SELECT json_agg(oi) FROM order_items oi WHERE oi.order_id = o.id),
          '[]'::json
        ) AS items
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.order_date DESC
    `, [userId]);    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// POST /api/orders – plasare comandă
router.post('/', protect, async (req, res) => {
  const userId = req.user.userId || req.user.id; // din token
  // Extindem destructurarea pentru a include postal_code
  const { country, county, city, admin_area, address, postal_code, phone, email, total, items } = req.body;
  
  // Debug: verifică valorile și items
  console.log("Valori de inserat:", [userId, country, county, city, admin_area, address, postal_code, phone, email, total]);
  console.log("Items primite:", items);

  try {
    // Inserăm comanda și returnează ID-ul comenzii
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, country, county, city, admin_area, address, postal_code, phone, email, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [userId, country, county, city, admin_area, address, postal_code, phone, email, total]
    );
    const orderId = orderResult.rows[0].id;

    // Generează un token aleatoriu pentru comandă (ex. 8 caractere hexazecimale)
    const orderToken = crypto.randomBytes(4).toString('hex');
    await pool.query('UPDATE orders SET order_token = $1 WHERE id = $2', [orderToken, orderId]);

    // Inserează elementele comenzii
    for (let item of items) {
      console.log('Inserăm order item:', item); // Debug: verificăm conținutul fiecărui item
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.price]
      );
      console.log('Order item inserat pentru order_id:', orderId);
    }

    res.status(201).json({ message: 'Comanda a fost plasată cu succes', orderId, orderToken });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Eroare la crearea comenzii' });
  }
});


router.delete('/:id', protect, async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.userId || req.user.id;
  
  try {
    // Verifică dacă comanda există și dacă statusul este Delivered
    const orderRes = await pool.query(
      'SELECT status FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Comanda nu a fost găsită' });
    }
    if (orderRes.rows[0].status !== 'Delivered') {
      return res.status(400).json({ message: 'Doar comenzile delivered pot fi șterse' });
    }
    
    // Șterge comanda (și, dacă ai definit, cascada va șterge și order_items)
    await pool.query('DELETE FROM orders WHERE id = $1 AND user_id = $2', [orderId, userId]);
    res.json({ message: 'Comanda a fost ștearsă cu succes' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Eroare la ștergerea comenzii' });
  }
});



// (Endpoint-urile GET și DELETE rămân neschimbate)

module.exports = router;









