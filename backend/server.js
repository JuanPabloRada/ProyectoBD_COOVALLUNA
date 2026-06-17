require('dotenv').config({ path: '/backend/.env' });

const express = require('express');
const cors = require('cors');

const authRoutes      = require('./routes/auth.routes');
const asociadosRoutes = require('./routes/asociados.routes');
const creditosRoutes  = require('./routes/creditos.routes');
const cuentasRoutes   = require('./routes/cuentas.routes');
const empleadosRoutes = require('./routes/empleados.routes');
const agenciasRoutes  = require('./routes/agencias.routes');
const reportesRoutes  = require('./routes/reportes.routes');

const app = express();
app.use(cors());
app.use(express.json());

// --- Autenticación (sin prefijo extra, queda en /api/login) ---
app.use('/api/login', authRoutes);

// --- Recursos ---
app.use('/api/asociados', asociadosRoutes);
app.use('/api/creditos',  creditosRoutes);
app.use('/api/cuentas',   cuentasRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/agencias',  agenciasRoutes);
app.use('/api/reportes',  reportesRoutes);

// --- Manejo de errores centralizado ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error en el servidor', detalle: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
