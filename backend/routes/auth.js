const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { nombre, apellido, email, matricula, password, carrera } = req.body;

  if (!nombre || !apellido || !email || !matricula || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const [existe] = await db.query(
      'SELECT id FROM usuarios WHERE email = ? OR matricula = ?',
      [email, matricula]
    );
    if (existe.length > 0) {
      return res.status(400).json({ error: 'El email o matrícula ya están registrados' });
    }

    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, apellido, email, matricula, password, carrera) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, apellido, email, matricula, hash, carrera || null]
    );

    const token = jwt.sign(
      { id: result.insertId, email, rol: 'estudiante' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
    token, 
    usuario: { 
    id: result.insertId, 
    nombre, 
    apellido, // 👈 ESTE
    email 
  } 
});
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = rows[0];
    const match = await bcrypt.compare(password, usuario.password);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
    token, 
    usuario: { 
    id: usuario.id, 
    nombre: usuario.nombre, 
    apellido: usuario.apellido, // 👈 ESTE
    email: usuario.email, 
    rol: usuario.rol 
  } 
});
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;