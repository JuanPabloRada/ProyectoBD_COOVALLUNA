const express = require('express');
const pool = require('../config/db');

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// GET /api/empleados
router.get('/', asyncHandler(async (req, res) => {

  const query = `
    SELECT
      cedula_empleado,
      nombres,
      apellidos,
      correo_corporativo,
      estado_laboral,
      codigo_cargo,
      codigo_agencia
    FROM empleado
    ORDER BY cedula_empleado
  `;

  const result = await pool.query(query);

  res.json(result.rows);

}));

// POST /api/empleados
router.post('/', asyncHandler(async (req, res) => {

  const {
    cedula_empleado,
    nombres,
    apellidos,
    correo_corporativo,
    estado_laboral,
    codigo_cargo,
    codigo_agencia,
    contrasena
  } = req.body;

  const query = `
    INSERT INTO empleado(
      cedula_empleado,
      nombres,
      apellidos,
      correo_corporativo,
      estado_laboral,
      codigo_cargo,
      codigo_agencia,
      contrasena,
      fecha_ingreso,
      salario_base
    )
    VALUES(
      $1,$2,$3,$4,$5,$6,$7,$8,
      CURRENT_DATE,
      1000000
    )
    RETURNING *
  `;

  const values = [
    cedula_empleado,
    nombres,
    apellidos,
    correo_corporativo,
    estado_laboral,
    codigo_cargo,
    codigo_agencia,
    contrasena
  ];

  const result = await pool.query(query, values);

  res.status(201).json(result.rows[0]);

}));

module.exports = router;