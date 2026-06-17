const express = require('express');
const pool = require('../config/db');

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// GET /api/cuentas
router.get('/', asyncHandler(async (req, res) => {
  // TODO (equipo): SELECT sobre CUENTA_AHORRO
  const query = '';
  const result = await pool.query(query);
  res.json(result.rows);
}));

// POST /api/cuentas
router.post('/', asyncHandler(async (req, res) => {
  // TODO (equipo): INSERT parametrizado sobre CUENTA_AHORRO
  const query = '';
  const values = [];
  const result = await pool.query(query, values);
  res.status(201).json(result.rows[0]);
}));

// POST /api/cuentas/:numero_cuenta/movimientos
router.post('/:numero_cuenta/movimientos', asyncHandler(async (req, res) => {
  // TODO (equipo): INSERT parametrizado sobre MOVIMIENTO (deposito, retiro, transferencia)
  const query = '';
  const values = [];
  const result = await pool.query(query, values);
  res.status(201).json(result.rows[0]);
}));

// GET /api/cuentas/:numero_cuenta/saldo
router.get('/:numero_cuenta/saldo', asyncHandler(async (req, res) => {
  // TODO (equipo): SUM de movimientos para calcular el saldo dinamicamente
  const query = '';
  const result = await pool.query(query, [req.params.numero_cuenta]);
  res.json(result.rows[0]);
}));

module.exports = router;
