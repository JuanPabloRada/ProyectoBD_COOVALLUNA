-- Consultas SQL de los 7 reportes requeridos, con comentarios explicativos.
-- Cada bloque corresponde a un endpoint de backend/routes/reportes.routes.js

-- 1. Listado de asociados por estado y agencia
-- SELECT
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
        COALESCE(
            (
                SELECT COUNT(*)
                FROM CUENTA_AHORRO ca
                WHERE ca.cedula_asociado = a.cedula_asociado
                  AND ca.estado = 'ACTIVA'
            ),
            0
        )
        +
        COALESCE(
            (
                SELECT COUNT(*)
                FROM CREDITO c
                WHERE c.cedula_asociado = a.cedula_asociado
                  AND c.estado_credito IN (
                        'EN_ESTUDIO',
                        'APROBADO',
                        'DESEMBOLSADO',
                        'AL_DIA',
                        'EN_MORA'
                  )
            ),
            0
        )
    ) AS productos_activos

FROM ASOCIADO a

LEFT JOIN ASOCIADO_FUNDADOR af
    ON a.cedula_asociado = af.cedula_asociado

LEFT JOIN AGENCIA ag
    ON ag.codigo_agencia = :codigo_agencia

WHERE
    (
        :estado IS NULL
        OR a.estado = :estado
    )

    AND

    (
        :codigo_agencia IS NULL

        OR EXISTS (
            SELECT 1
            FROM CUENTA_AHORRO ca
            WHERE ca.cedula_asociado = a.cedula_asociado
              AND ca.codigo_agencia = :codigo_agencia
        )

        OR EXISTS (
            SELECT 1
            FROM CREDITO c
            WHERE c.cedula_asociado = a.cedula_asociado
              AND c.codigo_agencia = :codigo_agencia
        )
    )

ORDER BY
    a.apellidos,
    a.nombres;



-- 2. Extracto de cuenta de ahorro
SELECT
m.numero_transaccion,
m.fecha_hora,
m.tipo_movimiento,
m.canal,
m.valor_transaccion,


SUM(
    CASE
        WHEN m.tipo_movimiento IN (
            'DEPOSITO',
            'CONSIGNACION',
            'TRANSFERENCIA_ENTRANTE'
        )
        THEN m.valor_transaccion

        WHEN m.tipo_movimiento IN (
            'RETIRO',
            'PAGO',
            'TRANSFERENCIA_SALIENTE'
        )
        THEN -m.valor_transaccion

        ELSE 0
    END
) OVER (
    ORDER BY
        m.fecha_hora,
        m.numero_transaccion
    ROWS BETWEEN UNBOUNDED PRECEDING
             AND CURRENT ROW
) AS saldo_acumulado


FROM MOVIMIENTO m

WHERE
m.numero_cuenta = :numero_cuenta


AND m.fecha_hora >= :fecha_desde

AND m.fecha_hora < (
    :fecha_hasta + INTERVAL '1 day'
)

AND (
    :tipo_movimiento IS NULL
    OR m.tipo_movimiento = :tipo_movimiento
)

AND (
    :canal IS NULL
    OR m.canal = :canal
)


ORDER BY
m.fecha_hora,
m.numero_transaccion;


-- 3. Estado de cartera por linea y estado de credito

SELECT
c.linea_credito,
c.estado_credito,


COUNT(*) AS cantidad_creditos,

COALESCE(
    SUM(c.valor_aprobado),
    0
) AS valor_total,

ROUND(
    (
        COALESCE(
            SUM(c.valor_aprobado),
            0
        ) * 100.0
    )
    /
    NULLIF(
        SUM(
            COALESCE(
                SUM(c.valor_aprobado),
                0
            )
        ) OVER (),
        0
    ),
    2
) AS porcentaje_cartera


FROM CREDITO c

WHERE


(
    :codigo_agencia IS NULL
    OR c.codigo_agencia = :codigo_agencia
)

AND

(
    :fecha_desde IS NULL
    OR (
        c.fecha_aprobacion IS NOT NULL
        AND c.fecha_aprobacion >= :fecha_desde
    )
)

AND

(
    :fecha_hasta IS NULL
    OR (
        c.fecha_aprobacion IS NOT NULL
        AND c.fecha_aprobacion <
            (:fecha_hasta + INTERVAL '1 day')
    )
)


GROUP BY
c.linea_credito,
c.estado_credito

ORDER BY
c.linea_credito,
c.estado_credito;


-- 4. Asociados en mora
SELECT
a.cedula_asociado,
a.nombres,
a.apellidos,


c.numero_radicado,

pc.num_cuota,

pc.estado_pago,

pc.fecha_vencim_programada,

CURRENT_DATE - pc.fecha_vencim_programada
    AS dias_mora,

e.cedula_empleado,

e.nombres || ' ' || e.apellidos
    AS asesor_responsable


FROM PAGO_CUOTA pc

JOIN CREDITO c
ON pc.numero_radicado = c.numero_radicado

JOIN ASOCIADO a
ON c.cedula_asociado = a.cedula_asociado

JOIN EMPLEADO e
ON c.cedula_empleado = e.cedula_empleado

WHERE

pc.estado_pago = 'EN_MORA'

OR

(
    pc.fecha_vencim_programada < CURRENT_DATE

    AND pc.estado_pago IN (
        'PENDIENTE',
        'PARCIAL'
    )
)

ORDER BY
dias_mora DESC,
pc.fecha_vencim_programada;



-- 5. Historial de pagos de un credito
SELECT
pc.numero_radicado,


pc.num_cuota,

pc.fecha_vencim_programada,

pc.fecha_pago,

pc.valor_pagado,

pc.estado_pago,

CASE
    WHEN pc.estado_pago IN (
        'PENDIENTE',
        'EN_MORA',
        'PARCIAL'
    )
    THEN 'SI'
    ELSE 'NO'
END AS requiere_atencion

FROM PAGO_CUOTA pc

WHERE
pc.numero_radicado = :numero_radicado

ORDER BY
pc.num_cuota;

-- 6. Productividad de asesores por agencia
SELECT
e.cedula_empleado,
e.nombres,
e.apellidos,
ag.nombre_agencia,
(
    SELECT COUNT(*)
    FROM ATIENDE at
    WHERE at.cedula_empleado = e.cedula_empleado
      AND (
            :fecha_desde IS NULL
            OR at.fecha_inicio_asesoria >= :fecha_desde
          )
      AND (
            :fecha_hasta IS NULL
            OR at.fecha_inicio_asesoria <
               (:fecha_hasta + INTERVAL '1 day')
          )
) AS asociados_atendidos,

(
    SELECT COUNT(*)
    FROM CREDITO c
    WHERE c.cedula_empleado = e.cedula_empleado

      AND (
            :fecha_desde IS NULL
            OR c.fecha_radicacion >= :fecha_desde
          )

      AND (
            :fecha_hasta IS NULL
            OR c.fecha_radicacion <
               (:fecha_hasta + INTERVAL '1 day')
          )
) AS creditos_tramitados,

(
    SELECT COALESCE(
        SUM(c.valor_aprobado),
        0
    )
    FROM CREDITO c
    WHERE c.cedula_empleado = e.cedula_empleado

      AND (
            :fecha_desde IS NULL
            OR c.fecha_radicacion >= :fecha_desde
          )

      AND (
            :fecha_hasta IS NULL
            OR c.fecha_radicacion <
               (:fecha_hasta + INTERVAL '1 day')
          )
) AS valor_creditos_aprobados,

(
    SELECT COUNT(*)
    FROM CUENTA_AHORRO ca
    WHERE ca.cedula_empleado = e.cedula_empleado

      AND (
            :fecha_desde IS NULL
            OR ca.fecha_apertura >= :fecha_desde
          )

      AND (
            :fecha_hasta IS NULL
            OR ca.fecha_apertura <
               (:fecha_hasta + INTERVAL '1 day')
          )
) AS cuentas_abiertas


FROM EMPLEADO e

JOIN CARGO cg
ON e.codigo_cargo = cg.codigo_cargo

JOIN AGENCIA ag
ON e.codigo_agencia = ag.codigo_agencia

WHERE


UPPER(cg.nombre_cargo) = 'ASESOR COMERCIAL'

AND

(
    :codigo_agencia IS NULL
    OR e.codigo_agencia = :codigo_agencia
)


ORDER BY
valor_creditos_aprobados DESC,
asociados_atendidos DESC;






-- 7. Asociados con codeudoria activa
SELECT

c.numero_radicado,

titular.cedula_asociado
    AS cedula_titular,

titular.nombres || ' ' || titular.apellidos
    AS titular,

garante.cedula_asociado
    AS cedula_garante,

garante.nombres || ' ' || garante.apellidos
    AS garante,

c.valor_aprobado,

c.fecha_firma_pagare,

c.estado_credito


FROM CREDITO c

JOIN ASOCIADO titular
ON c.cedula_asociado = titular.cedula_asociado

JOIN ASOCIADO garante
ON c.cedula_garante = garante.cedula_asociado
WHERE
c.estado_credito NOT IN (
    'CANCELADO',
    'CASTIGADO'
)
ORDER BY
c.estado_credito,
c.numero_radicado;



