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
      valor_solicitado,
      valor_aprobado,
      tasa_interes_mensual,
      plazo_meses,
      estado_credito,
      linea_credito,
      cedula_asociado,
      cedula_empleado
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
    valor_solicitado,
    valor_aprobado,
    tasa_interes_mensual,
    plazo_meses,
    estado_credito,
    linea_credito,
    cedula_asociado,
    cedula_empleado
  } = req.body;

  const query = `
    INSERT INTO credito (
      numero_radicado,
      valor_solicitado,
      valor_aprobado,
      tasa_interes_mensual,
      plazo_meses,
      estado_credito,
      linea_credito,
      cedula_asociado,
      cedula_empleado
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `;

  const values = [
    numero_radicado,
    valor_solicitado,
    valor_aprobado,
    tasa_interes_mensual,
    plazo_meses,
    estado_credito,
    linea_credito,
    cedula_asociado,
    cedula_empleado
  ];

  const result = await pool.query(query, values);

  res.status(201).json(result.rows[0]);

}));

module.exports = router;