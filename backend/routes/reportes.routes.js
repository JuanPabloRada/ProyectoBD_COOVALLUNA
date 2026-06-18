const express = require('express');
const pool    = require('../config/db');
const router  = express.Router();

function asyncHandler(fn) {
    return (req, res, next) => fn(req, res, next).catch(next);
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTE 1 — Asociados por estado y agencia
// GET /api/reportes/asociados-por-estado-agencia?estado=ACTIVO&codigo_agencia=AG001
// ─────────────────────────────────────────────────────────────────────────────
router.get('/asociados-por-estado-agencia', asyncHandler(async (req, res) => {
    const estado         = req.query.estado         || null;
    const codigoAgencia  = req.query.codigo_agencia || null;

    const query = `
        SELECT
            a.cedula_asociado,
            a.nombres,
            a.apellidos,
            a.fecha_afiliacion,
            a.estado,

            CASE
                WHEN af.cedula_asociado IS NOT NULL THEN 'SI'
                ELSE 'NO'
            END AS es_fundador,

            COALESCE(ag.nombre_agencia, 'MULTIAGENCIA') AS agencia,

            (
                COALESCE((
                    SELECT COUNT(*)
                    FROM CUENTA_AHORRO ca
                    WHERE ca.cedula_asociado = a.cedula_asociado
                      AND ca.estado = 'ACTIVA'
                ), 0)
                +
                COALESCE((
                    SELECT COUNT(*)
                    FROM CREDITO c
                    WHERE c.cedula_asociado = a.cedula_asociado
                      AND c.estado_credito IN (
                            'EN_ESTUDIO','APROBADO','DESEMBOLSADO','AL_DIA','EN_MORA'
                          )
                ), 0)
            ) AS productos_activos

        FROM ASOCIADO a

        LEFT JOIN ASOCIADO_FUNDADOR af
            ON a.cedula_asociado = af.cedula_asociado

        LEFT JOIN AGENCIA ag
            ON ag.codigo_agencia = $2

        WHERE
            ($1::VARCHAR IS NULL OR a.estado = $1)
            AND (
                $2::VARCHAR IS NULL
                OR EXISTS (
                    SELECT 1 FROM CUENTA_AHORRO ca
                    WHERE ca.cedula_asociado = a.cedula_asociado
                      AND ca.codigo_agencia  = $2
                )
                OR EXISTS (
                    SELECT 1 FROM CREDITO c
                    WHERE c.cedula_asociado = a.cedula_asociado
                      AND c.codigo_agencia  = $2
                )
            )

        ORDER BY a.apellidos, a.nombres;
    `;

    const result = await pool.query(query, [estado, codigoAgencia]);
    res.json(result.rows);
}));


// ─────────────────────────────────────────────────────────────────────────────
// REPORTE 2 — Extracto de cuenta de ahorro
// GET /api/reportes/extracto-cuenta/:numero_cuenta?fecha_desde=2024-01-01&fecha_hasta=2024-12-31&tipo_movimiento=&canal=
// ─────────────────────────────────────────────────────────────────────────────
router.get('/extracto-cuenta/:numero_cuenta', asyncHandler(async (req, res) => {
    const numeroCuenta    = req.params.numero_cuenta;
    const fechaDesde      = req.query.fecha_desde      || '1900-01-01';
    const fechaHasta      = req.query.fecha_hasta      || new Date().toISOString().slice(0, 10);
    const tipoMovimiento  = req.query.tipo_movimiento  || null;
    const canal           = req.query.canal            || null;

    const query = `
        SELECT
            m.numero_transaccion  AS codigo_movimiento,
            m.fecha_hora          AS fecha_movimiento,
            m.tipo_movimiento,
            m.canal,
            m.valor_transaccion   AS monto,

            SUM(
                CASE
                    WHEN m.tipo_movimiento IN ('DEPOSITO','CONSIGNACION','TRANSFERENCIA_ENTRANTE')
                        THEN  m.valor_transaccion
                    WHEN m.tipo_movimiento IN ('RETIRO','PAGO','TRANSFERENCIA_SALIENTE')
                        THEN -m.valor_transaccion
                    ELSE 0
                END
            ) OVER (
                ORDER BY m.fecha_hora, m.numero_transaccion
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) AS saldo_acumulado

        FROM MOVIMIENTO m

        WHERE
            m.numero_cuenta = $1
            AND m.fecha_hora >= $2
            AND m.fecha_hora <  ($3::DATE + INTERVAL '1 day')
            AND ($4::VARCHAR IS NULL OR m.tipo_movimiento = $4)
            AND ($5::VARCHAR IS NULL OR m.canal           = $5)

        ORDER BY m.fecha_hora, m.numero_transaccion;
    `;

    const result = await pool.query(query, [
        numeroCuenta,
        fechaDesde,
        fechaHasta,
        tipoMovimiento,
        canal
    ]);
    res.json(result.rows);
}));


// ─────────────────────────────────────────────────────────────────────────────
// REPORTE 3 — Estado de cartera por línea y estado del crédito
// GET /api/reportes/cartera-por-linea-estado?codigo_agencia=&fecha_desde=&fecha_hasta=
// ─────────────────────────────────────────────────────────────────────────────
router.get('/cartera-por-linea-estado', asyncHandler(async (req, res) => {
    const codigoAgencia = req.query.codigo_agencia || null;
    const fechaDesde    = req.query.fecha_desde    || null;
    const fechaHasta    = req.query.fecha_hasta    || null;

    const query = `
        SELECT
            c.linea_credito,
            c.estado_credito,
            COUNT(*)                          AS cantidad_creditos,
            COALESCE(SUM(c.valor_aprobado),0) AS valor_total,

            ROUND(
                (COALESCE(SUM(c.valor_aprobado),0) * 100.0)
                /
                NULLIF(
                    SUM(COALESCE(SUM(c.valor_aprobado),0)) OVER (),
                    0
                ),
                2
            ) AS porcentaje_cartera

        FROM CREDITO c

        WHERE
            ($1::VARCHAR IS NULL OR c.codigo_agencia = $1)
            AND (
                $2::DATE IS NULL
                OR (c.fecha_aprobacion IS NOT NULL AND c.fecha_aprobacion >= $2)
            )
            AND (
                $3::DATE IS NULL
                OR (c.fecha_aprobacion IS NOT NULL AND c.fecha_aprobacion < ($3::DATE + INTERVAL '1 day'))
            )

        GROUP BY c.linea_credito, c.estado_credito
        ORDER BY c.linea_credito, c.estado_credito;
    `;

    const result = await pool.query(query, [codigoAgencia, fechaDesde, fechaHasta]);
    res.json(result.rows);
}));


// ─────────────────────────────────────────────────────────────────────────────
// REPORTE 4 — Asociados en mora
// GET /api/reportes/asociados-en-mora
// ─────────────────────────────────────────────────────────────────────────────
router.get('/asociados-en-mora', asyncHandler(async (req, res) => {
    const query = `
        SELECT
            a.cedula_asociado,
            a.nombres,
            a.apellidos,
            c.numero_radicado,
            c.linea_credito,
            pc.num_cuota,
            pc.estado_pago,
            pc.fecha_vencim_programada,
            (CURRENT_DATE - pc.fecha_vencim_programada) AS dias_mora,
            e.cedula_empleado,
            e.nombres || ' ' || e.apellidos             AS asesor_responsable

        FROM PAGO_CUOTA pc

        JOIN CREDITO  c  ON pc.numero_radicado = c.numero_radicado
        JOIN ASOCIADO a  ON c.cedula_asociado  = a.cedula_asociado
        JOIN EMPLEADO e  ON c.cedula_empleado  = e.cedula_empleado

        WHERE
            pc.estado_pago = 'EN_MORA'
            OR (
                pc.fecha_vencim_programada < CURRENT_DATE
                AND pc.estado_pago IN ('PENDIENTE','PARCIAL')
            )

        ORDER BY dias_mora DESC, pc.fecha_vencim_programada;
    `;

    const result = await pool.query(query);
    res.json(result.rows);
}));


// ─────────────────────────────────────────────────────────────────────────────
// REPORTE 5 — Historial de pagos de un crédito
// GET /api/reportes/historial-pagos/:numero_radicado
// ─────────────────────────────────────────────────────────────────────────────
router.get('/historial-pagos/:numero_radicado', asyncHandler(async (req, res) => {
    const query = `
        SELECT
            pc.numero_radicado,
            pc.num_cuota,
            pc.fecha_vencim_programada,
            pc.fecha_pago,
            pc.valor_pagado,
            pc.estado_pago,

            CASE
                WHEN pc.estado_pago IN ('PENDIENTE','EN_MORA','PARCIAL') THEN 'SI'
                ELSE 'NO'
            END AS requiere_atencion

        FROM PAGO_CUOTA pc
        WHERE pc.numero_radicado = $1
        ORDER BY pc.num_cuota;
    `;

    const result = await pool.query(query, [req.params.numero_radicado]);
    res.json(result.rows);
}));


// ─────────────────────────────────────────────────────────────────────────────
// REPORTE 6 — Productividad de asesores por agencia
// GET /api/reportes/productividad-asesores?codigo_agencia=&fecha_desde=&fecha_hasta=
// ─────────────────────────────────────────────────────────────────────────────
router.get('/productividad-asesores', asyncHandler(async (req, res) => {
    const codigoAgencia = req.query.codigo_agencia || null;
    const fechaDesde    = req.query.fecha_desde    || null;
    const fechaHasta    = req.query.fecha_hasta    || null;

    const query = `
        SELECT
            e.cedula_empleado,
            e.nombres,
            e.apellidos,
            ag.nombre_agencia,

            (
                SELECT COUNT(*)
                FROM ATIENDE at
                WHERE at.cedula_empleado = e.cedula_empleado
                  AND ($2::DATE IS NULL OR at.fecha_inicio_asesoria >= $2)
                  AND ($3::DATE IS NULL OR at.fecha_inicio_asesoria < ($3::DATE + INTERVAL '1 day'))
            ) AS asociados_atendidos,

            (
                SELECT COUNT(*)
                FROM CREDITO c
                WHERE c.cedula_empleado = e.cedula_empleado
                  AND ($2::DATE IS NULL OR c.fecha_radicacion >= $2)
                  AND ($3::DATE IS NULL OR c.fecha_radicacion < ($3::DATE + INTERVAL '1 day'))
            ) AS creditos_tramitados,

            (
                SELECT COALESCE(SUM(c.valor_aprobado), 0)
                FROM CREDITO c
                WHERE c.cedula_empleado = e.cedula_empleado
                  AND ($2::DATE IS NULL OR c.fecha_radicacion >= $2)
                  AND ($3::DATE IS NULL OR c.fecha_radicacion < ($3::DATE + INTERVAL '1 day'))
            ) AS valor_creditos_aprobados,

            (
                SELECT COUNT(*)
                FROM CUENTA_AHORRO ca
                WHERE ca.cedula_empleado = e.cedula_empleado
                  AND ($2::DATE IS NULL OR ca.fecha_apertura >= $2)
                  AND ($3::DATE IS NULL OR ca.fecha_apertura < ($3::DATE + INTERVAL '1 day'))
            ) AS cuentas_abiertas

        FROM EMPLEADO e

        JOIN CARGO   cg ON e.codigo_cargo   = cg.codigo_cargo
        JOIN AGENCIA ag ON e.codigo_agencia = ag.codigo_agencia

        WHERE
            UPPER(cg.nombre_cargo) = 'ASESOR COMERCIAL'
            AND ($1::VARCHAR IS NULL OR e.codigo_agencia = $1)

        ORDER BY valor_creditos_aprobados DESC, asociados_atendidos DESC;
    `;

    const result = await pool.query(query, [codigoAgencia, fechaDesde, fechaHasta]);
    res.json(result.rows);
}));


// ─────────────────────────────────────────────────────────────────────────────
// REPORTE 7 — Asociados con codeudoría activa
// GET /api/reportes/codeudoria-activa
// ─────────────────────────────────────────────────────────────────────────────
router.get('/codeudoria-activa', asyncHandler(async (req, res) => {
    const query = `
        SELECT
            c.numero_radicado,
            titular.cedula_asociado                        AS cedula_titular,
            titular.nombres || ' ' || titular.apellidos    AS titular,
            garante.cedula_asociado                        AS cedula_garante,
            garante.nombres || ' ' || garante.apellidos    AS garante,
            c.valor_aprobado,
            c.fecha_firma_pagare,
            c.estado_credito

        FROM CREDITO c

        JOIN ASOCIADO titular ON c.cedula_asociado = titular.cedula_asociado
        JOIN ASOCIADO garante ON c.cedula_garante  = garante.cedula_asociado

        WHERE c.estado_credito NOT IN ('CANCELADO','CASTIGADO')

        ORDER BY c.estado_credito, c.numero_radicado;
    `;

    const result = await pool.query(query);
    res.json(result.rows);
}));


module.exports = router;