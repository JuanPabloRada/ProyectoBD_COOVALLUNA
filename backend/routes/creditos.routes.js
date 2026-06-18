const express = require('express');
const pool = require('../config/db');

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// GET /api/creditos
router.get('/', asyncHandler(async (req, res) => {
  const query = `
    SELECT
      numero_radicado,
      fecha_radicacion,
      valor_solicitado,
      valor_aprobado,
      tasa_interes_mensual,
      plazo_meses,
      estado_credito,
      linea_credito,
      cedula_asociado,
      cedula_empleado,
      codigo_agencia
    FROM credito
    ORDER BY numero_radicado
  `;
  const result = await pool.query(query);
  res.json(result.rows);
}));

// POST /api/creditos
router.post('/', asyncHandler(async (req, res) => {
  const {
    numero_radicado,
    fecha_radicacion,
    valor_solicitado,
    valor_aprobado,
    tasa_interes_mensual,
    plazo_meses,
    estado_credito,
    linea_credito,
    cedula_asociado,
    cedula_empleado,
    codigo_agencia
  } = req.body;

  const query = `
    INSERT INTO credito (
      numero_radicado,
      fecha_radicacion,
      valor_solicitado,
      valor_aprobado,
      tasa_interes_mensual,
      plazo_meses,
      estado_credito,
      linea_credito,
      cedula_asociado,
      cedula_empleado,
      codigo_agencia
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;

  const values = [
    numero_radicado,
    fecha_radicacion,
    valor_solicitado,
    valor_aprobado,
    tasa_interes_mensual,
    plazo_meses,
    estado_credito,
    linea_credito,
    cedula_asociado,
    cedula_empleado,
    codigo_agencia || 'AG001'
  ];

  const result = await pool.query(query, values);
  res.status(201).json(result.rows);
}));

module.exports = router;
