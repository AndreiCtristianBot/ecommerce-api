// Checkout.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Checkout({ cart, total, setCart }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ramburs'); // implicit "Ramburs la livrare"
  const [error, setError] = useState('');

  // Dacă nu e autentificat, redirecționează la login
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Formularul este valid dacă toate câmpurile sunt completate
  const isFormValid =
    address.trim() && phone.trim() && email.trim() && paymentMethod.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Verificăm dacă coșul este gol
    if (cart.length === 0) {
      setError('Coșul este gol.');
      return;
    }
    if (!isFormValid) {
      setError('Vă rugăm completați toate câmpurile.');
      return;
    }
    try {
      const orderData = {
        county,
        city,
        address,
        phone,
        email,
        paymentMethod,
        total,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await axios.post('http://localhost:8000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Order response:', response.data);
      alert('Comanda a fost trimisă cu succes!');
      setCart([]); // Golește coșul global
      navigate('/');
    } catch (err) {
      console.error('Order submission error:', err.response || err);
      setError('Eroare la trimiterea comenzii: ' + (err.response?.data?.message || ''));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Checkout</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Adresă:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Telefon:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Modalitate de plată:</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="ramburs">Ramburs la livrare</option>
            <option value="card">Card</option>
          </select>
        </div>
        <div>
          <p>Total: ${Number(total).toFixed(2)}</p>
        </div>
        <button type="submit" disabled={!isFormValid}>
          Trimite Comanda
        </button>
      </form>
    </div>
  );
}

export default Checkout;


