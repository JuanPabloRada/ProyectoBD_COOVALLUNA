const express = require('express');
const pool = require('../config/db');

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// GET /api/asociados
router.get('/', asyncHandler(async (req, res) => {
  // TODO (equipo): SELECT sobre ASOCIADO
  const query = 'SELECT * FROM asociado';
  const result = await pool.query(query);
  res.json(result.rows);
}));

// POST /api/asociados
router.post('/', asyncHandler(async (req, res) => {
  // TODO (equipo): INSERT parametrizado sobre ASOCIADO
  const query = '';
  const values = [];
  const result = await pool.query(query, values);
  res.status(201).json(result.rows[0]);
}));

// PUT /api/asociados/:cedula
router.put('/:cedula', asyncHandler(async (req, res) => {
  // TODO (equipo): UPDATE parametrizado sobre ASOCIADO
  const query = '';
  const values = [];
  const result = await pool.query(query, values);
  res.json(result.rows[0]);
}));

// DELETE /api/asociados/:cedula
router.delete('/:cedula', asyncHandler(async (req, res) => {
  const { cedula } = req.params;
  // TODO (equipo): DELETE parametrizado sobre ASOCIADO
  const query = '';
  const result = await pool.query(query, [cedula]);
  res.json({ eliminado: result.rowCount > 0 });
}));

module.exports = router;
