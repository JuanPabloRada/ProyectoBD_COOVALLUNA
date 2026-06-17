const express = require('express');
const pool = require('../config/db');

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// GET /api/creditos
router.get('/', asyncHandler(async (req, res) => {
  // TODO (equipo): SELECT sobre CREDITO
  const query = '';
  const result = await pool.query(query);
  res.json(result.rows);
}));

// POST /api/creditos
router.post('/', asyncHandler(async (req, res) => {
  // TODO (equipo): INSERT parametrizado sobre CREDITO
  const query = '';
  const values = [];
  const result = await pool.query(query, values);
  res.status(201).json(result.rows[0]);
}));

// PUT /api/creditos/:numero_radicado
router.put('/:numero_radicado', asyncHandler(async (req, res) => {
  // TODO (equipo): UPDATE parametrizado sobre CREDITO (ej: cambiar estado_credito)
  const query = '';
  const values = [];
  const result = await pool.query(query, values);
  res.json(result.rows[0]);
}));

// POST /api/creditos/:numero_radicado/pagos
router.post('/:numero_radicado/pagos', asyncHandler(async (req, res) => {
  // TODO (equipo): INSERT/UPDATE parametrizado sobre PAGO_CUOTA
  const query = '';
  const values = [];
  const result = await pool.query(query, values);
  res.status(201).json(result.rows[0]);
}));

module.exports = router;
