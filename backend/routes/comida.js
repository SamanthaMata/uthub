const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');

// 🏪 Obtener tiendas
router.get('/tiendas', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tiendas');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tiendas' });
  }
});

// 🍔 Obtener productos por tienda
router.get('/productos/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM productos WHERE tienda_id = ?',
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// 🧾 Crear pedido
router.post('/pedido', auth, async (req, res) => {
  try {
    const { items, ubicacion } = req.body;
    const userId = req.user.id;

    let total = 0;

    for (const item of items) {
      const [p] = await db.query(
        'SELECT precio FROM productos WHERE id = ?',
        [item.id]
      );
      total += p[0].precio * item.cantidad;
    }

    const [pedido] = await db.query(
      'INSERT INTO pedidos (usuario_id, ubicacion, total) VALUES (?, ?, ?)',
      [userId, ubicacion, total]
    );

    for (const item of items) {
      await db.query(
        'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad) VALUES (?, ?, ?)',
        [pedido.insertId, item.id, item.cantidad]
      );
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

// 🏪 Obtener UNA tienda por ID
router.get('/tienda/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM tiendas WHERE id = ?',
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tienda' });
  }
});

module.exports = router;