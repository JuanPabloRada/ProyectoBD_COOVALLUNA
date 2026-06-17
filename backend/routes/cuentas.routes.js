const express = require('express');
const pool = require('../config/db');

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// GET /api/cuentas
router.get('/', asyncHandler(async (req, res) => {

  const query = `
    SELECT
      numero_cuenta,
      fecha_apertura,
      estado,
      cedula_asociado,
      codigo_agencia
    FROM cuenta_ahorro
    ORDER BY numero_cuenta
  `;

  const result = await pool.query(query);

  res.json(result.rows);

}));

// POST /api/cuentas
router.post('/', asyncHandler(async (req, res) => {

  const {
    numero_cuenta,
    fecha_apertura,
    estado,
    cedula_asociado,
    codigo_agencia
  } = req.body;

  const query = `
    INSERT INTO cuenta_ahorro(
      numero_cuenta,
      fecha_apertura,
      estado,
      cedula_asociado,
      codigo_agencia
    )
    VALUES($1,$2,$3,$4,$5)
    RETURNING *
  `;

  const values = [
    numero_cuenta,
    fecha_apertura,
    estado,
    cedula_asociado,
    codigo_agencia
  ];

  const result = await pool.query(query, values);

  res.status(201).json(result.rows[0]);

}));

// GET saldo
router.get('/:numero_cuenta/saldo', asyncHandler(async (req, res) => {

  const query = `
    SELECT
      numero_cuenta,
      COALESCE(
        SUM(
          CASE
            WHEN tipo_movimiento IN ('DEPOSITO','CONSIGNACION')
              THEN valor_transaccion
            WHEN tipo_movimiento IN ('RETIRO','TRANSFERENCIA')
              THEN -valor_transaccion
            ELSE 0
          END
        ),0
      ) AS saldo
    FROM movimiento
    WHERE numero_cuenta = $1
    GROUP BY numero_cuenta
  `;

  const result =
    await pool.query(query,[req.params.numero_cuenta]);

  res.json(result.rows[0] || { saldo: 0 });

}));

module.exports = router;