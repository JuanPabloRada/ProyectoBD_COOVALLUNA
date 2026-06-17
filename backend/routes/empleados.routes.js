const express = require('express');
const pool = require('../config/db');

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// GET /api/empleados
router.get('/', asyncHandler(async (req, res) => {
  // TODO (equipo): SELECT sobre EMPLEADO
  const query = '';
  const result = await pool.query(query);
  res.json(result.rows);
}));

// POST /api/empleados
router.post('/', asyncHandler(async (req, res) => {
  // TODO (equipo): INSERT parametrizado sobre EMPLEADO
  const query = '';
  const values = [];
  const result = await pool.query(query, values);
  res.status(201).json(result.rows[0]);
}));

// PUT /api/empleados/:cedula
router.put('/:cedula', asyncHandler(async (req, res) => {
  // TODO (equipo): UPDATE parametrizado sobre EMPLEADO (cargo, agencia, supervisor, estado)
  const query = '';
  const values = [];
  const result = await pool.query(query, values);
  res.json(result.rows[0]);
}));

module.exports = router;
