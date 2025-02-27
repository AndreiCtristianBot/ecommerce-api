// controllers/cartController.js
const { pool } = require('../config/db');

const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;
    try {
        await pool.query(
            'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)',
            [userId, productId, quantity]
        );
        res.json({ message: 'Product added to cart' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding to cart' });
    }
};

const getCart = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query('SELECT * FROM cart WHERE user_id = $1', [userId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving cart' });
    }
};

const removeFromCart = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const result = await pool.query(
            'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing from cart' });
    }
};

module.exports = { addToCart, getCart, removeFromCart };

