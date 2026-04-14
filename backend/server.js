const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());



// Servir archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, '../uthub')));

// Rutas
app.use('/api/auth', require('./routes/auth'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'UThub API corriendo ✅' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

app.use('/api/user', require('./routes/protected'));

const comidaRoutes = require('./routes/comida');
app.use('/api/comida', comidaRoutes);

