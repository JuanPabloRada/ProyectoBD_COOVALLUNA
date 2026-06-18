const express = require('express');
const pool = require('../config/db');

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// GET /api/asociados
router.get('/', asyncHandler(async (req, res) => {
  const query = 'SELECT * FROM asociado';
  const result = await pool.query(query);
  res.json(result.rows);
}));

// POST /api/asociados - SOLUCIONADO DEFINITIVAMENTE
router.post('/', asyncHandler(async (req, res) => {
  const {
    cedula_asociado,
    nombres,
    apellidos,
    contrasena,
    fecha_nacimiento,
    barrio,
    calle,
    numero,
    municipio,
    fecha_afiliacion,
    estado,
    cuota_sostenimiento
  } = req.body;

  const query = `
    INSERT INTO asociado (
      cedula_asociado,
      nombres,
      apellidos,
      contrasena,
      fecha_nacimiento,
      barrio,
      calle,
      numero,
      municipio,
      fecha_afiliacion,
      estado,
      cuota_sostenimiento
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;

  const values = [
    cedula_asociado,
    nombres,
    apellidos,
    contrasena,
    fecha_nacimiento,
    barrio,
    calle,
    numero,
    municipio,
    fecha_afiliacion,
    estado,
    cuota_sostenimiento
  ];

  const result = await pool.query(query, values);
  res.status(201).json(result.rows[0]);
}));

// PUT /api/asociados/:cedula
router.put('/:cedula', asyncHandler(async (req, res) => {
  const query = '';
  const values = [];
  const result = await pool.query(query, values);
  res.json(result.rows[0]);
}));

// DELETE /api/asociados/:cedula
router.delete('/:cedula', asyncHandler(async (req, res) => {
  const { cedula } = req.params;
  const query = '';
  const result = await pool.query(query, [cedula]);
  res.json({ eliminado: result.rowCount > 0 });
}));

module.exports = router;
