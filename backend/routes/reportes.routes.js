const express = require('express');
const pool = require('../config/db');

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// 1. GET /api/reportes/asociados-por-estado-agencia
router.get('/asociados-por-estado-agencia', asyncHandler(async (req, res) => {
  const query = ''; // TODO (equipo)
  const result = await pool.query(query);
  res.json(result.rows);
}));

// 2. GET /api/reportes/extracto-cuenta/:numero_cuenta
router.get('/extracto-cuenta/:numero_cuenta', asyncHandler(async (req, res) => {
  const query = ''; // TODO (equipo)
  const result = await pool.query(query, [req.params.numero_cuenta]);
  res.json(result.rows);
}));

// 3. GET /api/reportes/cartera-por-linea-estado
router.get('/cartera-por-linea-estado', asyncHandler(async (req, res) => {
  const query = ''; // TODO (equipo)
  const result = await pool.query(query);
  res.json(result.rows);
}));

// 4. GET /api/reportes/asociados-en-mora
router.get('/asociados-en-mora', asyncHandler(async (req, res) => {
  const query = ''; // TODO (equipo)
  const result = await pool.query(query);
  res.json(result.rows);
}));

// 5. GET /api/reportes/historial-pagos/:numero_radicado
router.get('/historial-pagos/:numero_radicado', asyncHandler(async (req, res) => {
  const query = ''; // TODO (equipo)
  const result = await pool.query(query, [req.params.numero_radicado]);
  res.json(result.rows);
}));

// 6. GET /api/reportes/productividad-asesores
router.get('/productividad-asesores', asyncHandler(async (req, res) => {
  const query = ''; // TODO (equipo)
  const result = await pool.query(query);
  res.json(result.rows);
}));

// 7. GET /api/reportes/codeudoria-activa
router.get('/codeudoria-activa', asyncHandler(async (req, res) => {
  const query = ''; // TODO (equipo)
  const result = await pool.query(query);
  res.json(result.rows);
}));

module.exports = router;
