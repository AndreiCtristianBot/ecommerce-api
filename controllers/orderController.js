// controllers/orderController.js
const { pool } = require('../config/db');

const placeOrder = async (req, res) => {
    const userId = req.user.id;
    try {
        await pool.query('INSERT INTO orders (user_id, status) VALUES ($1, $2)', [userId, 'Pending']);
        res.json({ message: 'Order placed' });
    } catch (error) {
        res.status(500).json({ message: 'Error placing order' });
    }
};

const getOrders = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving orders' });
    }
};

module.exports = { placeOrder, getOrders };

