const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');

dotenv.config();

const SITE_ROOT = path.join(__dirname, '..');
const app = express();
app.use(helmet());
app.disable('x-powered-by');

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8888,http://localhost:5500,http://127.0.0.1:5500')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  if (/^https:\/\/.*\.netlify\.app$/i.test(origin)) {
    return true;
  }

  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin no permitido: ${origin}`));
    }
  },
  credentials: true
}));

app.use(express.json());

// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data:; " +
    "frame-ancestors 'none'; " +
    "form-action 'self'"
  );
  next();
});

app.use('/api/user', require('./routes/protected'));
app.use(express.static(SITE_ROOT));
app.use('/api/auth', require('./routes/auth'));

const comidaRoutes = require('./routes/comida');
app.use('/api/comida', comidaRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(SITE_ROOT, 'index.html'));
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow:');
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>${process.env.PUBLIC_URL || 'http://localhost:3000'}/</loc></url>
  </urlset>`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
