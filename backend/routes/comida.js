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

const ORDER_STATES = ['nuevo', 'preparando', 'listo', 'entregado', 'cancelado'];

function parseJsonMaybe(value) {
  if (value == null) return null;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeTienda(row) {
  if (!row) return null;
  return {
    ...row,
    horario: parseJsonMaybe(row.horario),
    abierta: Number(row.abierta ?? 1) === 1
  };
}

function isPlaceholderStore(row) {
  if (!row) return false;
  const nombre = String(row.nombre || '').trim().toLowerCase();
  const descripcion = String(row.descripcion || '').trim().toLowerCase();
  return nombre === 'mi tienda' && (!descripcion || descripcion === 'emprendimiento estudiantil uthub');
}

async function getAuthenticatedUserId(req) {
  if (req.usuario?.id) {
    return Number(req.usuario.id);
  }

  if (req.usuario?.email) {
    const [rows] = await db.query('SELECT id FROM usuarios WHERE email = ? LIMIT 1', [req.usuario.email]);
    if (rows[0]?.id) {
      req.usuario.id = rows[0].id;
      return Number(rows[0].id);
    }
  }

  return null;
}

async function getMainStoreForUser(userId) {
  const [rows] = await db.query(
    `SELECT * FROM tiendas
     WHERE usuario_id = ?
     ORDER BY
       CASE
         WHEN LOWER(TRIM(COALESCE(nombre, ''))) = 'mi tienda'
          AND LOWER(TRIM(COALESCE(descripcion, ''))) IN ('', 'emprendimiento estudiantil uthub')
         THEN 1 ELSE 0
       END,
       id ASC
     LIMIT 1`,
    [userId]
  );

  if (rows[0]) return normalizeTienda(rows[0]);

  const [legacyRows] = await db.query(
    `SELECT *
     FROM tiendas
     WHERE usuario_id IS NULL
       AND LOWER(TRIM(COALESCE(nombre, ''))) = 'mi tienda'
     ORDER BY id ASC
     LIMIT 1`
  );

  if (!legacyRows[0]) return null;

  await db.query(
    'UPDATE tiendas SET usuario_id = ? WHERE id = ? AND usuario_id IS NULL',
    [userId, legacyRows[0].id]
  );

  return getStoreById(legacyRows[0].id);
}

function groupPedidos(rows) {
  const pedidos = new Map();

  for (const row of rows) {
    if (!pedidos.has(row.id)) {
      pedidos.set(row.id, {
        id: row.id,
        usuario_id: row.usuario_id,
        tienda_id: row.tienda_id,
        tienda_nombre: row.tienda_nombre,
        ubicacion: row.ubicacion,
        instrucciones: row.instrucciones || '',
        total: Number(row.total) || 0,
        estado: row.estado || 'nuevo',
        fecha: row.created_at,
        created_at: row.created_at,
        items: []
      });
    }

    if (row.producto_id) {
      pedidos.get(row.id).items.push({
        id: row.producto_id,
        nombre: row.producto_nombre || `Producto #${row.producto_id}`,
        precio: Number(row.producto_precio) || 0,
        cantidad: Number(row.cantidad) || 0
      });
    }
  }

  return [...pedidos.values()].sort((a, b) => {
    const ta = new Date(a.fecha || 0).getTime();
    const tb = new Date(b.fecha || 0).getTime();
    return tb - ta || b.id - a.id;
  });
}

async function ensureColumn(table, column, definition) {
  const [rows] = await db.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
  if (rows.length === 0) {
    await db.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  }
}

async function ensureFoodSchema() {
  await ensureColumn('productos', 'categoria', 'VARCHAR(50) DEFAULT NULL');
  await ensureColumn('productos', 'badge', 'VARCHAR(50) DEFAULT NULL');
  await ensureColumn('pedidos', 'estado', "ENUM('nuevo','preparando','listo','entregado','cancelado') NOT NULL DEFAULT 'nuevo'");
  await ensureColumn('pedidos', 'tienda_id', 'INT DEFAULT NULL');
  await ensureColumn('pedidos', 'tienda_nombre', 'VARCHAR(120) DEFAULT NULL');
  await ensureColumn('pedidos', 'instrucciones', 'TEXT DEFAULT NULL');
  await ensureColumn('detalle_pedido', 'producto_nombre', 'VARCHAR(150) DEFAULT NULL');
  await ensureColumn('detalle_pedido', 'producto_precio', 'DECIMAL(10,2) DEFAULT NULL');
  await ensureColumn('tiendas', 'abierta', 'TINYINT(1) NOT NULL DEFAULT 1');
}

ensureFoodSchema().catch((error) => {
  console.warn('No se pudo preparar el esquema de comidas:', error.message);
});

function mapStateFromRequest(value) {
  if (!value) return 'nuevo';
  if (ORDER_STATES.includes(value)) return value;
  return 'nuevo';
}

function canManageStore(user, store) {
  if (!store) return false;
  if (!user) return false;
  if (user.rol === 'admin') return true;
  if (user.id && Number(store.usuario_id) === Number(user.id)) return true;
  return Boolean(
    user.email
    && store.usuario_email
    && String(user.email).toLowerCase() === String(store.usuario_email).toLowerCase()
  );
}

async function getStoreById(id) {
  const [rows] = await db.query(
    `SELECT t.*, u.email AS usuario_email
     FROM tiendas t
     LEFT JOIN usuarios u ON u.id = t.usuario_id
     WHERE t.id = ?`,
    [id]
  );
  return normalizeTienda(rows[0]);
}

async function getManageableStore(req, id) {
  let store = await getStoreById(id);
  if (!store) return null;

  if (store.usuario_id == null && isPlaceholderStore(store)) {
    const userId = await getAuthenticatedUserId(req);
    if (userId) {
      await db.query(
        'UPDATE tiendas SET usuario_id = ? WHERE id = ? AND usuario_id IS NULL',
        [userId, store.id]
      );
      store = await getStoreById(id);
    }
  }

  return store;
}

async function getOwnershipInfoByPedidoId(pedidoId) {
  const [rows] = await db.query(
    `SELECT p.id, p.tienda_id, t.usuario_id
     FROM pedidos p
     LEFT JOIN tiendas t ON t.id = p.tienda_id
     WHERE p.id = ?`,
    [pedidoId]
  );
  return rows[0] || null;
}

// Puntos de entrega oficiales del campus
router.get('/ubicaciones', (req, res) => {
  res.json(UBICACIONES_CAMPUS);
});

// Tiendas públicas
router.get('/tiendas', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.*, COALESCE(pc.total_productos, 0) AS total_productos
       FROM tiendas t
       LEFT JOIN (
         SELECT tienda_id, COUNT(*) AS total_productos
         FROM productos
         GROUP BY tienda_id
       ) pc ON pc.tienda_id = t.id
       WHERE NOT (
         LOWER(TRIM(COALESCE(t.nombre, ''))) = 'mi tienda'
         AND LOWER(TRIM(COALESCE(t.descripcion, ''))) IN ('', 'emprendimiento estudiantil uthub')
         AND COALESCE(pc.total_productos, 0) = 0
       )
       ORDER BY t.id DESC`
    );

    res.json(rows.map((row) => {
      const tienda = normalizeTienda(row);
      delete tienda.total_productos;
      return tienda;
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tiendas' });
  }
});

router.get('/mis-tiendas', auth, async (req, res) => {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'No se pudo identificar al usuario' });
    }

    const tienda = await getMainStoreForUser(userId);
    res.json(tienda ? [tienda] : []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tus tiendas' });
  }
});

router.get('/mi-tienda', auth, async (req, res) => {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'No se pudo identificar al usuario' });
    }

    const tienda = await getMainStoreForUser(userId);
    if (!tienda) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }
    res.json(tienda);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tu tienda' });
  }
});

router.get('/tienda/:id', async (req, res) => {
  try {
    const tienda = await getStoreById(req.params.id);
    if (!tienda) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }
    res.json(tienda);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tienda' });
  }
});

router.post('/tienda', auth, async (req, res) => {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'No se pudo identificar al usuario' });
    }

    const existingStore = await getMainStoreForUser(userId);
    if (existingStore) {
      return res.status(200).json({ ok: true, tienda: existingStore, reused: true });
    }

    const {
      nombre = 'Mi Tienda',
      descripcion = '',
      imagen = '',
      categoria = 'otro',
      horario = null,
      abierta = true,
      edificio = ''
    } = req.body;

    const horarioValue = typeof horario === 'string' ? horario : (horario ? JSON.stringify(horario) : null);
    const descripcionFinal = descripcion || edificio || null;

    const [result] = await db.query(
      `INSERT INTO tiendas (nombre, descripcion, imagen, categoria, horario, abierta, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcionFinal, imagen || null, categoria || 'otro', horarioValue, abierta ? 1 : 0, userId]
    );

    const tienda = await getStoreById(result.insertId);
    res.status(201).json({ ok: true, tienda });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear tienda' });
  }
});

router.put('/tienda/:id', auth, async (req, res) => {
  try {
    const tienda = await getManageableStore(req, req.params.id);
    if (!tienda) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }
    if (!canManageStore(req.usuario, tienda)) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta tienda' });
    }

    const next = {
      nombre: req.body.nombre ?? tienda.nombre,
      descripcion: req.body.descripcion ?? tienda.descripcion,
      imagen: req.body.imagen ?? tienda.imagen,
      categoria: req.body.categoria ?? tienda.categoria,
      horario: req.body.horario ?? tienda.horario,
      abierta: typeof req.body.abierta === 'boolean' ? req.body.abierta : tienda.abierta
    };

    const horarioValue = typeof next.horario === 'string' ? next.horario : JSON.stringify(next.horario || null);

    await db.query(
      `UPDATE tiendas
       SET nombre = ?, descripcion = ?, imagen = ?, categoria = ?, horario = ?, abierta = ?
       WHERE id = ?`,
      [
        next.nombre,
        next.descripcion,
        next.imagen || null,
        next.categoria || 'otro',
        horarioValue,
        next.abierta ? 1 : 0,
        req.params.id
      ]
    );

    const updated = await getStoreById(req.params.id);
    res.json({ ok: true, tienda: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar tienda' });
  }
});

router.delete('/tienda/:id', auth, async (req, res) => {
  try {
    const tienda = await getManageableStore(req, req.params.id);
    if (!tienda) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }
    if (!canManageStore(req.usuario, tienda)) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta tienda' });
    }

    await db.query('DELETE FROM tiendas WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar tienda' });
  }
});

// Productos
router.get('/productos/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM productos WHERE tienda_id = ? ORDER BY id DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.post('/producto', auth, async (req, res) => {
  try {
    const tiendaId = Number(req.body.tienda_id);
    if (!tiendaId) {
      return res.status(400).json({ error: 'La tienda es requerida' });
    }

    const tienda = await getManageableStore(req, tiendaId);
    if (!tienda) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }
    if (!canManageStore(req.usuario, tienda)) {
      return res.status(403).json({ error: 'No tienes permiso para agregar productos a esta tienda' });
    }

    const nombre = (req.body.nombre || '').trim();
    const precio = Number(req.body.precio);
    if (!nombre || !Number.isFinite(precio)) {
      return res.status(400).json({ error: 'Nombre y precio son requeridos' });
    }

    const [result] = await db.query(
      `INSERT INTO productos (tienda_id, nombre, precio, descripcion, imagen, categoria, badge)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        tiendaId,
        nombre,
        precio,
        req.body.descripcion || null,
        req.body.imagen || null,
        req.body.categoria || null,
        req.body.badge || null
      ]
    );

    const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [result.insertId]);
    res.status(201).json({ ok: true, producto: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

router.put('/producto/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    const producto = rows[0];
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const tienda = await getManageableStore(req, producto.tienda_id);
    if (!canManageStore(req.usuario, tienda)) {
      return res.status(403).json({ error: 'No tienes permiso para editar este producto' });
    }

    const next = {
      nombre: req.body.nombre ?? producto.nombre,
      precio: req.body.precio ?? producto.precio,
      descripcion: req.body.descripcion ?? producto.descripcion,
      imagen: req.body.imagen ?? producto.imagen,
      categoria: req.body.categoria ?? producto.categoria,
      badge: req.body.badge ?? producto.badge
    };

    await db.query(
      `UPDATE productos
       SET nombre = ?, precio = ?, descripcion = ?, imagen = ?, categoria = ?, badge = ?
       WHERE id = ?`,
      [
        next.nombre,
        Number(next.precio) || 0,
        next.descripcion || null,
        next.imagen || null,
        next.categoria || null,
        next.badge || null,
        req.params.id
      ]
    );

    const [updated] = await db.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    res.json({ ok: true, producto: updated[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

router.delete('/producto/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    const producto = rows[0];
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const tienda = await getManageableStore(req, producto.tienda_id);
    if (!canManageStore(req.usuario, tienda)) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este producto' });
    }

    await db.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// Pedidos
router.post('/pedido', auth, async (req, res) => {
  const conn = await db.getConnection();
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'No se pudo identificar al usuario' });
    }

    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const ubicacion = (req.body.ubicacion || '').trim();
    const instrucciones = (req.body.instrucciones || '').trim();

    if (items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }
    if (!ubicacion) {
      return res.status(400).json({ error: 'La ubicación es requerida' });
    }

    await conn.beginTransaction();

    let tiendaId = null;
    let tiendaNombre = null;
    let total = 0;
    const detalles = [];

    for (const item of items) {
      const productoId = Number(item.producto_id || item.id);
      const cantidad = Number(item.cantidad || 1);
      if (!productoId || !Number.isFinite(cantidad) || cantidad <= 0) {
        throw new Error('Producto inválido');
      }

      const [rows] = await conn.query(
        `SELECT p.id, p.nombre, p.precio, p.tienda_id, t.nombre AS tienda_nombre
         FROM productos p
         LEFT JOIN tiendas t ON t.id = p.tienda_id
         WHERE p.id = ?`,
        [productoId]
      );

      const producto = rows[0];
      if (!producto) {
        throw new Error(`Producto no encontrado: ${productoId}`);
      }

      if (tiendaId == null) {
        tiendaId = producto.tienda_id;
        tiendaNombre = producto.tienda_nombre;
      } else if (Number(tiendaId) !== Number(producto.tienda_id)) {
        throw new Error('El carrito solo puede contener productos de una misma tienda');
      }

      total += Number(producto.precio) * cantidad;
      detalles.push({
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        producto_precio: Number(producto.precio),
        cantidad
      });
    }

    const [pedidoResult] = await conn.query(
      `INSERT INTO pedidos (usuario_id, tienda_id, tienda_nombre, ubicacion, instrucciones, total, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        tiendaId,
        tiendaNombre,
        ubicacion,
        instrucciones || null,
        total,
        'nuevo'
      ]
    );

    for (const detalle of detalles) {
      await conn.query(
        `INSERT INTO detalle_pedido (pedido_id, producto_id, producto_nombre, producto_precio, cantidad)
         VALUES (?, ?, ?, ?, ?)`,
        [pedidoResult.insertId, detalle.producto_id, detalle.producto_nombre, detalle.producto_precio, detalle.cantidad]
      );
    }

    await conn.commit();

    res.status(201).json({
      ok: true,
      pedido: {
        id: pedidoResult.insertId,
        usuario_id: userId,
        tienda_id: tiendaId,
        tienda_nombre: tiendaNombre,
        ubicacion,
        instrucciones,
        total,
        estado: 'nuevo',
        fecha: new Date().toISOString(),
        items: detalles.map((detalle) => ({
          id: detalle.producto_id,
          nombre: detalle.producto_nombre,
          precio: detalle.producto_precio,
          cantidad: detalle.cantidad
        }))
      }
    });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al crear pedido' });
  } finally {
    conn.release();
  }
});

router.get('/pedidos/mios', auth, async (req, res) => {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'No se pudo identificar al usuario' });
    }

    const [rows] = await db.query(
      `SELECT p.id, p.usuario_id, p.tienda_id, p.tienda_nombre, p.ubicacion, p.instrucciones,
              p.total, p.estado, p.created_at,
              d.producto_id, d.producto_nombre, d.producto_precio, d.cantidad
       FROM pedidos p
       LEFT JOIN detalle_pedido d ON d.pedido_id = p.id
       WHERE p.usuario_id = ?
       ORDER BY p.created_at DESC, p.id DESC, d.id ASC`,
      [userId]
    );

    res.json(groupPedidos(rows));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

router.get('/tienda/:id/pedidos', auth, async (req, res) => {
  try {
    const tienda = await getManageableStore(req, req.params.id);
    if (!tienda) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }
    if (!canManageStore(req.usuario, tienda)) {
      return res.status(403).json({ error: 'No tienes permiso para ver estos pedidos' });
    }

    const [rows] = await db.query(
      `SELECT p.id, p.usuario_id, p.tienda_id, p.tienda_nombre, p.ubicacion, p.instrucciones,
              p.total, p.estado, p.created_at,
              d.producto_id, d.producto_nombre, d.producto_precio, d.cantidad
       FROM pedidos p
       LEFT JOIN detalle_pedido d ON d.pedido_id = p.id
       WHERE p.tienda_id = ?
       ORDER BY p.created_at DESC, p.id DESC, d.id ASC`,
      [req.params.id]
    );

    res.json(groupPedidos(rows));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener pedidos de la tienda' });
  }
});

router.put('/pedido/:id/estado', auth, async (req, res) => {
  try {
    const info = await getOwnershipInfoByPedidoId(req.params.id);
    if (!info) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const tienda = info.tienda_id ? await getManageableStore(req, info.tienda_id) : null;
    if (!canManageStore(req.usuario, tienda)) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este pedido' });
    }

    const estado = mapStateFromRequest(req.body.estado);
    await db.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, req.params.id]);

    const [rows] = await db.query(
      `SELECT p.id, p.usuario_id, p.tienda_id, p.tienda_nombre, p.ubicacion, p.instrucciones,
              p.total, p.estado, p.created_at,
              d.producto_id, d.producto_nombre, d.producto_precio, d.cantidad
       FROM pedidos p
       LEFT JOIN detalle_pedido d ON d.pedido_id = p.id
       WHERE p.id = ?
       ORDER BY d.id ASC`,
      [req.params.id]
    );

    res.json({ ok: true, pedido: groupPedidos(rows)[0] || null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el estado del pedido' });
  }
});

router.delete('/pedidos/mios', auth, async (req, res) => {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'No se pudo identificar al usuario' });
    }

    const [rows] = await db.query('SELECT id FROM pedidos WHERE usuario_id = ?', [userId]);
    const pedidoIds = rows.map((row) => row.id);
    if (pedidoIds.length === 0) {
      return res.json({ ok: true, removed: 0 });
    }

    await db.query('DELETE FROM detalle_pedido WHERE pedido_id IN (?)', [pedidoIds]);
    await db.query('DELETE FROM pedidos WHERE usuario_id = ?', [userId]);
    res.json({ ok: true, removed: pedidoIds.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al limpiar tus pedidos' });
  }
});

module.exports = router;


