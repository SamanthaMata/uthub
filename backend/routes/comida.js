const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');

const UBICACIONES_CAMPUS = [
  { id: 'docencia', nombre: 'Docencia', tipo: 'Punto académico', detalle: 'Edificio de docencia de la UTSC.', lat: 25.68957341733084, lng: -100.5123611969405 },
  { id: 'cafeteria', nombre: 'Cafetería UTSC', tipo: 'Comida y entregas', detalle: 'Punto principal para comprar comida o recoger pedidos.', lat: 25.689080321121647, lng: -100.51192132371544 },
  { id: 'cajas', nombre: 'Cajas de pago', tipo: 'Trámites y pagos', detalle: 'Área de cajas de pago dentro del plantel.', lat: 25.690762609496144, lng: -100.51130972310952 },
  { id: 'laboratorio-pesado-3', nombre: 'Laboratorio Pesado 3', tipo: 'Laboratorios', detalle: 'Referencia del Laboratorio Pesado 3.', lat: 25.690153482051695, lng: -100.51062308461488 },
  { id: 'laboratorio-pesado-1', nombre: 'Laboratorio Pesado 1', tipo: 'Laboratorios', detalle: 'Referencia del Laboratorio Pesado 1.', lat: 25.690153482051695, lng: -100.51062308461488 },
  { id: 'vinculacion', nombre: 'Edificio de Vinculación', tipo: 'Servicios universitarios', detalle: 'Edificio de Vinculación de la UTSC.', lat: 25.691149362259768, lng: -100.51214657905558 }
];

// 📍 Obtener puntos de entrega oficiales del campus
router.get('/ubicaciones', (req, res) => {
  res.json(UBICACIONES_CAMPUS);
});

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
