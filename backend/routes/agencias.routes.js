const express = require('express');
const pool = require('../config/db');

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// GET /api/agencias
router.get('/', asyncHandler(async (req, res) => {
  // TODO (equipo): SELECT sobre AGENCIA
  const query = '';
  const result = await pool.query(query);
  res.json(result.rows);
}));

// POST /api/agencias
router.post('/', asyncHandler(async (req, res) => {
  // TODO (equipo): INSERT parametrizado sobre AGENCIA
  const query = '';
  const values = [];
  const result = await pool.query(query, values);
  res.status(201).json(result.rows[0]);
}));

module.exports = router;
