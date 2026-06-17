-- =============================================================
-- DML DE DATOS DE PRUEBA — COOVALLUNA
-- =============================================================
-- Mínimos exigidos: 10 asociados, 4 beneficiarios, 3 agencias,
-- 6 empleados con jerarquía, 5 cuentas con 15 movimientos,
-- 4 créditos en distintos estados, 2 codeudorías.
-- =============================================================


-- -------------------------------------------------------
-- PASO 0: Agregar columna contrasena a EMPLEADO y ASOCIADO
--         (solo si no existe; inocuo al re-ejecutar)
-- -------------------------------------------------------
ALTER TABLE empleado
  ADD COLUMN IF NOT EXISTS contrasena VARCHAR(255) NOT NULL DEFAULT 'changeme';

ALTER TABLE asociado
  ADD COLUMN IF NOT EXISTS contrasena VARCHAR(255) NOT NULL DEFAULT 'changeme';


-- -------------------------------------------------------
-- CARGOS  (3 distintos para cubrir admin, asesor y otros)
-- -------------------------------------------------------
INSERT INTO cargo (codigo_cargo, nombre_cargo, descripcion) VALUES
  ('CRG001   ', 'ADMINISTRADOR',   'Administrador general del sistema'),
  ('CRG002   ', 'ASESOR',          'Asesor comercial y de crédito'),
  ('CRG003   ', 'CONTADOR',        'Área contable')
ON CONFLICT (codigo_cargo) DO NOTHING;


-- -------------------------------------------------------
-- AGENCIAS  (3 sedes)
-- -------------------------------------------------------
INSERT INTO agencia
  (codigo_agencia, nombre_agencia, direccion, municipio, telefono, fecha_apertura)
VALUES
  ('AGC001   ', 'Sede Principal Bugalagrande', 'Calle 5 # 3-20',   'Bugalagrande', '3201000001', '2010-03-15'),
  ('AGC002   ', 'Sede Tuluá',                 'Carrera 28 # 15-5', 'Tuluá',        '3201000002', '2015-06-01'),
  ('AGC003   ', 'Sede Cartago',               'Av. 4N # 20-10',    'Cartago',      '3201000003', '2018-09-20')
ON CONFLICT (codigo_agencia) DO NOTHING;


-- -------------------------------------------------------
-- EMPLEADOS  (6 con jerarquía de supervisión)
-- Contraseñas de prueba en texto plano
-- -------------------------------------------------------
INSERT INTO empleado
  (cedula_empleado, nombres, apellidos, fecha_ingreso, salario_base,
   correo_corporativo, estado_laboral, codigo_cargo, cedula_supervisor,
   codigo_agencia, contrasena)
VALUES
  -- Admin (sin supervisor)
  ('1001', 'Laura',   'Ospina',   '2010-03-15', 5000000, 'laura.ospina@coovalluna.com',
   'ACTIVO', 'CRG001   ', NULL,   'AGC001   ', 'admin123'),

  -- Asesores supervisados por el admin
  ('1002', 'Carlos',  'Ríos',     '2015-06-01', 3000000, 'carlos.rios@coovalluna.com',
   'ACTIVO', 'CRG002   ', '1001', 'AGC001   ', 'asesor123'),

  ('1003', 'Mónica',  'Valencia', '2016-02-14', 3100000, 'monica.valencia@coovalluna.com',
   'ACTIVO', 'CRG002   ', '1001', 'AGC002   ', 'monica456'),

  ('1004', 'Andrés',  'Muñoz',    '2017-07-20', 2900000, 'andres.munoz@coovalluna.com',
   'ACTIVO', 'CRG002   ', '1001', 'AGC002   ', 'andres789'),

  ('1005', 'Patricia','Salcedo',  '2018-09-20', 3200000, 'patricia.salcedo@coovalluna.com',
   'ACTIVO', 'CRG003   ', '1001', 'AGC003   ', 'patri321'),

  -- Empleado retirado (para probar el check de estado_laboral)
  ('1006', 'Jorge',   'Patiño',   '2012-01-10', 2800000, 'jorge.patino@coovalluna.com',
   'RETIRADO', 'CRG002   ', '1001', 'AGC001   ', 'jorge000')

ON CONFLICT (cedula_empleado) DO NOTHING;


-- -------------------------------------------------------
-- ASOCIADOS  (10 personas)
-- -------------------------------------------------------
INSERT INTO asociado
  (cedula_asociado, nombres, apellidos, fecha_nacimiento, direccion_residencia,
   barrio, municipio, fecha_afiliacion, estado, cuota_sostenimiento, contrasena)
VALUES
  ('2001', 'Hernán',    'Castaño',  '1980-04-12', 'Calle 10 # 5-30', 'La Unión',   'Bugalagrande', '2012-05-01', 'ACTIVO',    25000, 'hernan123'),
  ('2002', 'Rosa',      'Martínez', '1975-08-22', 'Cra 7 # 12-40',   'Centro',     'Bugalagrande', '2013-03-15', 'ACTIVO',    25000, 'rosa456'),
  ('2003', 'Luis',      'Gutiérrez','1990-11-30', 'Calle 3 # 2-10',  'El Porvenir','Tuluá',        '2014-07-20', 'ACTIVO',    25000, 'luis789'),
  ('2004', 'Carmen',    'Prado',    '1985-06-18', 'Av 2 # 8-50',     'Versalles',  'Tuluá',        '2015-01-10', 'ACTIVO',    25000, 'carmen321'),
  ('2005', 'Fabio',     'Torres',   '1970-02-05', 'Cra 5 # 3-20',    'Palmeras',   'Cartago',      '2011-09-05', 'ACTIVO',    30000, 'fabio654'),
  ('2006', 'Beatriz',   'Herrera',  '1988-09-14', 'Calle 8 # 7-60',  'La Ceja',    'Bugalagrande', '2016-11-25', 'ACTIVO',    25000, 'beatriz987'),
  ('2007', 'Gonzalo',   'Restrepo', '1965-12-01', 'Cra 9 # 14-35',   'El Bosque',  'Cartago',      '2010-03-15', 'ACTIVO',    35000, 'gonzalo111'),
  ('2008', 'Esperanza', 'Lozano',   '1992-03-27', 'Calle 1 # 1-01',  'Nuevo Horizonte','Tuluá',    '2020-02-14', 'ACTIVO',    25000, 'espe222'),
  -- Suspendido y retirado (para probar el check de estado)
  ('2009', 'Mario',     'Pineda',   '1978-07-07', 'Cra 3 # 5-15',    'Las Palmas', 'Cartago',      '2013-06-30', 'SUSPENDIDO',25000, 'mario333'),
  ('2010', 'Alba',      'Sánchez',  '1983-10-20', 'Calle 12 # 9-80', 'Villa Nueva','Bugalagrande', '2014-08-18', 'RETIRADO',  25000, 'alba444')

ON CONFLICT (cedula_asociado) DO NOTHING;


-- -------------------------------------------------------
-- ASOCIADOS FUNDADORES  (2 de los 10 anteriores)
-- -------------------------------------------------------
INSERT INTO asociado_fundador
  (cedula_asociado, numero_acta_fundacional, anio_reconocimiento, descripcion_beneficios)
VALUES
  ('2005', 'ACTA-FUND-001', 2010, 'Descuento del 10 % en tasa de interés'),
  ('2007', 'ACTA-FUND-002', 2010, 'Exoneración de cuota de sostenimiento año 1')
ON CONFLICT (cedula_asociado) DO NOTHING;


-- -------------------------------------------------------
-- BENEFICIARIOS  (4 en total)
-- -------------------------------------------------------
INSERT INTO beneficiario
  (num_orden, cedula_asociado, numero_documento, nombre_completo,
   parentesco, porcentaje_participacion, telefono_contacto)
VALUES
  (1, '2001', 'BEN-DOC-001', 'Sandra Castaño Ruiz',    'Hija',   60.00, '3101234567'),
  (2, '2001', 'BEN-DOC-002', 'Pedro Castaño Ruiz',     'Hijo',   40.00, '3109876543'),
  (1, '2003', 'BEN-DOC-003', 'Marta Gutiérrez López',  'Esposa', 100.00,'3155551234'),
  (1, '2005', 'BEN-DOC-004', 'Felipe Torres Cardona',  'Hijo',   100.00,'3187654321')
ON CONFLICT (num_orden, cedula_asociado) DO NOTHING;


-- -------------------------------------------------------
-- TELÉFONOS Y CORREOS DE ASOCIADOS
-- -------------------------------------------------------
INSERT INTO telefono_asociado (cedula_asociado, telefono_contacto) VALUES
  ('2001','3111110001'), ('2002','3111110002'), ('2003','3111110003'),
  ('2004','3111110004'), ('2005','3111110005'), ('2006','3111110006')
ON CONFLICT DO NOTHING;

INSERT INTO correo_asociado (cedula_asociado, correo_electronico) VALUES
  ('2001','hernan.castano@mail.com'),  ('2002','rosa.martinez@mail.com'),
  ('2003','luis.gutierrez@mail.com'),  ('2004','carmen.prado@mail.com'),
  ('2005','fabio.torres@mail.com'),    ('2006','beatriz.herrera@mail.com')
ON CONFLICT DO NOTHING;


-- -------------------------------------------------------
-- CUENTAS DE AHORRO  (5 cuentas)
-- -------------------------------------------------------
INSERT INTO cuenta_ahorro
  (numero_cuenta, fecha_apertura, estado, cedula_asociado, codigo_agencia)
VALUES
  ('CTA0000000000000001', '2012-06-01', 'ACTIVA',   '2001', 'AGC001   '),
  ('CTA0000000000000002', '2013-04-15', 'ACTIVA',   '2002', 'AGC001   '),
  ('CTA0000000000000003', '2014-08-20', 'ACTIVA',   '2003', 'AGC002   '),
  ('CTA0000000000000004', '2015-02-10', 'INACTIVA', '2004', 'AGC002   '),
  ('CTA0000000000000005', '2011-10-05', 'ACTIVA',   '2005', 'AGC003   ')
ON CONFLICT (numero_cuenta) DO NOTHING;


-- -------------------------------------------------------
-- MOVIMIENTOS  (15 transacciones)
-- -------------------------------------------------------
INSERT INTO movimiento
  (numero_transaccion, tipo_movimiento, valor_transaccion, fecha_hora, canal,
   cuenta_origen, cuenta_destino, numero_cuenta)
VALUES
  ('TRX00001','DEPOSITO',     500000, '2024-01-05 09:00:00','VENTANILLA', NULL,NULL,'CTA0000000000000001'),
  ('TRX00002','RETIRO',       100000, '2024-01-10 10:30:00','VENTANILLA', NULL,NULL,'CTA0000000000000001'),
  ('TRX00003','DEPOSITO',     800000, '2024-02-01 08:00:00','APP_MOVIL',  NULL,NULL,'CTA0000000000000001'),
  ('TRX00004','TRANSFERENCIA',200000, '2024-02-15 14:00:00','WEB',
              'CTA0000000000000001','CTA0000000000000002','CTA0000000000000001'),
  ('TRX00005','DEPOSITO',    1000000,'2024-03-01 09:00:00','VENTANILLA', NULL,NULL,'CTA0000000000000002'),
  ('TRX00006','RETIRO',       300000, '2024-03-10 11:00:00','CAJERO',     NULL,NULL,'CTA0000000000000002'),
  ('TRX00007','DEPOSITO',     600000, '2024-04-05 10:00:00','APP_MOVIL',  NULL,NULL,'CTA0000000000000002'),
  ('TRX00008','DEPOSITO',     400000, '2024-04-20 09:30:00','VENTANILLA', NULL,NULL,'CTA0000000000000003'),
  ('TRX00009','RETIRO',       150000, '2024-05-02 15:00:00','CAJERO',     NULL,NULL,'CTA0000000000000003'),
  ('TRX00010','CONSIGNACION', 700000, '2024-05-15 08:00:00','VENTANILLA', NULL,NULL,'CTA0000000000000003'),
  ('TRX00011','DEPOSITO',     250000, '2024-06-01 10:00:00','APP_MOVIL',  NULL,NULL,'CTA0000000000000005'),
  ('TRX00012','RETIRO',       100000, '2024-06-10 12:00:00','CAJERO',     NULL,NULL,'CTA0000000000000005'),
  ('TRX00013','DEPOSITO',     500000, '2024-07-01 09:00:00','VENTANILLA', NULL,NULL,'CTA0000000000000005'),
  ('TRX00014','TRANSFERENCIA',300000, '2024-07-20 16:00:00','WEB',
              'CTA0000000000000005','CTA0000000000000001','CTA0000000000000005'),
  ('TRX00015','CONSIGNACION', 900000, '2024-08-01 08:30:00','VENTANILLA', NULL,NULL,'CTA0000000000000001')
ON CONFLICT (numero_transaccion) DO NOTHING;


-- -------------------------------------------------------
-- CRÉDITOS  (4 en distintos estados + 2 codeudorías)
-- -------------------------------------------------------
INSERT INTO credito
  (numero_radicado, valor_solicitado, valor_aprobado, tasa_interes_mensual,
   plazo_meses, fecha_aprobacion, fecha_primer_vencimiento, estado_credito,
   linea_credito, cedula_asociado, cedula_garante, fecha_firma_pagare,
   cedula_empleado)
VALUES
  ('RAD0000000000000001', 5000000, 4800000, 0.0180, 24,
   '2024-01-15','2024-02-15','AL_DIA',    'LIBRE INVERSIÓN',  '2001', NULL,   '2024-01-15','1002'),
  ('RAD0000000000000002',10000000, 9500000, 0.0160, 36,
   '2024-03-01','2024-04-01','EN_MORA',   'VIVIENDA',         '2003', '2001', '2024-03-01','1002'),
  ('RAD0000000000000003', 3000000,    NULL, 0.0200, 12,
   NULL,         NULL,        'EN_ESTUDIO','EDUCACIÓN',        '2004', NULL,   NULL,        '1003'),
  ('RAD0000000000000004', 8000000, 8000000, 0.0170, 48,
   '2023-06-01','2023-07-01','CANCELADO', 'MICROEMPRESA',     '2005', '2006', '2023-06-01','1002')
ON CONFLICT (numero_radicado) DO NOTHING;


-- -------------------------------------------------------
-- PLAN DE PAGO - CUOTAS (muestra parcial: 3 por crédito)
-- -------------------------------------------------------
INSERT INTO pago_cuota
  (numero_radicado, num_cuota, fecha_vencim_programada, fecha_pago, valor_pagado, estado_pago)
VALUES
  -- Crédito 1 (AL_DIA)
  ('RAD0000000000000001',1,'2024-02-15','2024-02-14',216000,'PAGADA'),
  ('RAD0000000000000001',2,'2024-03-15','2024-03-14',214000,'PAGADA'),
  ('RAD0000000000000001',3,'2024-04-15',NULL,        NULL,  'PENDIENTE'),
  -- Crédito 2 (EN_MORA)
  ('RAD0000000000000002',1,'2024-04-01','2024-04-02',290000,'PAGADA'),
  ('RAD0000000000000002',2,'2024-05-01',NULL,        NULL,  'EN_MORA'),
  ('RAD0000000000000002',3,'2024-06-01',NULL,        NULL,  'EN_MORA'),
  -- Crédito 4 (CANCELADO)
  ('RAD0000000000000004',1,'2023-07-01','2023-07-01',192000,'PAGADA'),
  ('RAD0000000000000004',2,'2023-08-01','2023-08-01',190000,'PAGADA'),
  ('RAD0000000000000004',3,'2023-09-01','2023-09-01',188000,'PAGADA')
ON CONFLICT (numero_radicado, num_cuota) DO NOTHING;


-- -------------------------------------------------------
-- RELACIÓN ATIENDE  (empleado → asociado)
-- -------------------------------------------------------
INSERT INTO atiende (cedula_empleado, cedula_asociado, fecha_inicio_asesoria) VALUES
  ('1002','2001','2024-01-15'),
  ('1002','2003','2024-03-01'),
  ('1003','2004','2024-01-10'),
  ('1004','2006','2024-02-20')
ON CONFLICT DO NOTHING;


-- -------------------------------------------------------
-- RADICADO_EN  (agencia → crédito)
-- -------------------------------------------------------
INSERT INTO radicado_en (codigo_agencia, numero_radicado) VALUES
  ('AGC001   ','RAD0000000000000001'),
  ('AGC002   ','RAD0000000000000002'),
  ('AGC002   ','RAD0000000000000003'),
  ('AGC003   ','RAD0000000000000004')
ON CONFLICT DO NOTHING;


-- =============================================================
-- RESUMEN DE USUARIOS DE PRUEBA PARA LOGIN
-- =============================================================
--  ROL       | CÉDULA | CONTRASEÑA  | NOMBRE
-- -----------+--------+-------------+------------------------
--  admin     | 1001   | admin123    | Laura Ospina
--  asesor    | 1002   | asesor123   | Carlos Ríos
--  asesor    | 1003   | monica456   | Mónica Valencia
--  asociado  | 2001   | hernan123   | Hernán Castaño
--  asociado  | 2003   | luis789     | Luis Gutiérrez
-- -----------+--------+-------------+------------------------
--  (Retirado — debe dar 403)
--  empleado  | 1006   | jorge000    | Jorge Patiño
--  asociado  | 2010   | alba444     | Alba Sánchez
-- =============================================================
