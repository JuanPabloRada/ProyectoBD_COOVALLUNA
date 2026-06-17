BEGIN;

--  TABLA CARGO 

INSERT INTO CARGO (codigo_cargo, nombre_cargo, descripcion) VALUES
('CRG0001','Gerente General','Responsable de la dirección estratégica y administrativa de la cooperativa'),
('CRG0002','Subgerente','Apoya la gestión gerencial y supervisa las áreas operativas'),
('CRG0003','Asesor Comercial','Atiende y asesora a los asociados en productos de ahorro y crédito'),
('CRG0004','Cajero','Encargado de la atención en ventanilla y manejo de efectivo'),
('CRG0005','Analista de Crédito','Evalúa y tramita las solicitudes de crédito de los asociados');

--  TABLA AGENCIA 

INSERT INTO AGENCIA (codigo_agencia, nombre_agencia, direccion, municipio, telefono, fecha_apertura) VALUES
('AGE0001','Agencia Principal Tuluá','Calle 25 # 10-15','Tuluá','6022245566','1995-01-20'),
('AGE0002','Agencia Buga','Carrera 14 # 5-30','Guadalajara de Buga','6022287788','2003-06-10'),
('AGE0003','Agencia Cali Norte','Avenida 6N # 28-50','Cali','6023349900','2010-11-05');


--  TABLA EMPLEADO 
INSERT INTO EMPLEADO (cedula_empleado, nombres, apellidos, fecha_ingreso, salario_base, correo_corporativo, estado_laboral, codigo_cargo, cedula_supervisor, codigo_agencia) VALUES
('2001112233','Ricardo','Vélez Montoya','2008-01-15',12000000.00,'ricardo.velez@coopvalle.com.co','ACTIVO','CRG0001',NULL,'AGE0001'),
('2002223344','Patricia','Restrepo Cano','2009-03-01',8000000.00,'patricia.restrepo@coopvalle.com.co','ACTIVO','CRG0002','2001112233','AGE0001'),
('2003334455','Felipe','Arango Buitrago','2012-06-01',3500000.00,'felipe.arango@coopvalle.com.co','ACTIVO','CRG0003','2002223344','AGE0001'),
('2004445566','Natalia','Cifuentes Marín','2014-09-15',3500000.00,'natalia.cifuentes@coopvalle.com.co','ACTIVO','CRG0003','2002223344','AGE0002'),
('2005556677','Oscar','Mosquera León','2016-02-01',2200000.00,'oscar.mosquera@coopvalle.com.co','EN_LICENCIA','CRG0004','2002223344','AGE0002'),
('2006667788','Daniela','Ríos Palacio','2017-05-10',4500000.00,'daniela.rios@coopvalle.com.co','ACTIVO','CRG0005','2001112233','AGE0003');


--  TABLA ASOCIADO 

INSERT INTO ASOCIADO (cedula_asociado, nombres, apellidos, fecha_nacimiento, barrio, calle, numero, municipio, fecha_afiliacion, estado, cuota_sostenimiento) VALUES
('1006723456','Carlos Andrés','Gómez Pérez','1968-04-12','Centro','Calle 25','10-15','Tuluá','1995-02-10','ACTIVO',35000.00),
('1023456789','María Fernanda','López Ruiz','1970-08-23','San José','Calle 30','12-40','Tuluá','1995-02-10','ACTIVO',35000.00),
('1094567890','José Luis','Martínez Díaz','1965-11-05','La Graciela','Carrera 20','5-22','Buga','1995-03-01','ACTIVO',35000.00),
('1112233445','Diana Patricia','Herrera Soto','1980-01-15','Alameda','Calle 40','8-12','Tuluá','2005-06-15','ACTIVO',25000.00),
('1098765432','Andrés Felipe','Castaño Ríos','1985-09-30','Bosque','Calle 15','3-45','Buga','2010-04-20','ACTIVO',20000.00),
('1076543210','Luisa Fernanda','Ortiz Cárdenas','1990-03-22','El Carmen','Carrera 10','6-30','Cali','2012-08-05','ACTIVO',20000.00),
('1065432109','Jorge Iván','Salazar Mejía','1978-07-19','Santa Rita','Calle 50','9-18','Tuluá','2008-11-10','ACTIVO',30000.00),
('1054321098','Sandra Milena','Zapata Vélez','1982-12-02','La Inmaculada','Calle 18','4-22','Sevilla','2009-05-25','ACTIVO',22000.00),
('1043210987','Camilo Ernesto','Bedoya Torres','1992-06-14','Modelia','Calle 22','7-10','Palmira','2019-02-18','SUSPENDIDO',18000.00),
('1032109876','Paola Andrea','Quintero Gil','1995-10-08','Primavera','Calle 12','2-05','Andalucía','2021-09-12','RETIRADO',15000.00);


--  TABLA ASOCIADO_FUNDADOR (especialización de ASOCIADO) 

INSERT INTO ASOCIADO_FUNDADOR (cedula_asociado, numero_acta_fundacional, anio_reconocimiento, descripcion_beneficios) VALUES
('1006723456','ACTA-001-1995',1995,'Beneficio en tasa preferencial durante el primer año de crédito'),
('1023456789','ACTA-002-1995',1995,'Beneficio en cuota de sostenimiento reducida de forma permanente'),
('1094567890','ACTA-003-1995',1996,'Exoneración de la cuota de afiliación inicial');


--  TABLA BENEFICIARIO (entidad débil de ASOCIADO) 

INSERT INTO BENEFICIARIO (num_orden, cedula_asociado, numero_documento, nombre_completo, parentesco, porcentaje_participacion, telefono_contacto) VALUES
(1,'1006723456','1006998877','Valentina Gómez López','HIJA',50.00,'3201112222'),
(2,'1006723456','1006998878','Mariana Gómez López','HIJA',50.00,'3201112223'),
(1,'1112233445','1112299887','Andrés Soto Marín','ESPOSO',100.00,NULL),
(1,'1065432109','1065998822','Sebastián Salazar Mejía','HIJO',100.00,'3157778899');


--  TABLA TELEFONO_ASOCIADO (atributo multivaluado) 

INSERT INTO TELEFONO_ASOCIADO (cedula_asociado, telefono_contacto) VALUES
('1006723456','3014567890'),
('1006723456','3204567890'),
('1023456789','3023456781'),
('1094567890','3034567892'),
('1112233445','3045678903'),
('1098765432','3056789014'),
('1076543210','3067890125'),
('1065432109','3078901236'),
('1054321098','3089012347'),
('1043210987','3090123458'),
('1032109876','3101234569');


--  TABLA CORREO_ASOCIADO (atributo multivaluado) 

INSERT INTO CORREO_ASOCIADO (cedula_asociado, correo_electronico) VALUES
('1006723456','carlos.gomez@example.com'),
('1006723456','cgomez.personal@example.com'),
('1023456789','maria.lopez@example.com'),
('1094567890','jose.martinez@example.com'),
('1112233445','diana.herrera@example.com'),
('1098765432','andres.castano@example.com'),
('1076543210','luisa.ortiz@example.com'),
('1065432109','jorge.salazar@example.com'),
('1054321098','sandra.zapata@example.com'),
('1043210987','camilo.bedoya@example.com'),
('1032109876','paola.quintero@example.com');


--  TABLA CUENTA_AHORRO 

INSERT INTO CUENTA_AHORRO (numero_cuenta, fecha_apertura, estado, cedula_asociado, codigo_agencia) VALUES
('CTA00000000000000001','2010-03-15','ACTIVA','1006723456','AGE0001'),
('CTA00000000000000002','2011-05-20','ACTIVA','1023456789','AGE0001'),
('CTA00000000000000003','2015-07-10','ACTIVA','1112233445','AGE0002'),
('CTA00000000000000004','2018-01-25','ACTIVA','1076543210','AGE0003'),
('CTA00000000000000005','2020-09-05','INACTIVA','1043210987','AGE0002');


--  TABLA MOVIMIENTO 

INSERT INTO MOVIMIENTO (numero_transaccion, tipo_movimiento, valor_transaccion, fecha_hora, canal, cuenta_origen, cuenta_destino, numero_cuenta) VALUES
('TRX00000000000000001','DEPOSITO',500000.00,'2010-04-01 09:15:00','VENTANILLA',NULL,NULL,'CTA00000000000000001'),
('TRX00000000000000002','DEPOSITO',300000.00,'2010-07-01 10:20:00','VENTANILLA',NULL,NULL,'CTA00000000000000001'),
('TRX00000000000000003','RETIRO',150000.00,'2011-02-10 14:05:00','CAJERO_AUTOMATICO',NULL,NULL,'CTA00000000000000001'),
('TRX00000000000000004','DEPOSITO',800000.00,'2011-06-01 08:40:00','VENTANILLA',NULL,NULL,'CTA00000000000000002'),
('TRX00000000000000005','TRANSFERENCIA',100000.00,'2012-03-15 16:00:00','APP_MOVIL','CTA00000000000000002','CTA00000000000000003','CTA00000000000000002'),
('TRX00000000000000006','RETIRO',50000.00,'2013-01-05 11:30:00','CAJERO_AUTOMATICO',NULL,NULL,'CTA00000000000000002'),
('TRX00000000000000007','DEPOSITO',600000.00,'2015-08-01 09:00:00','VENTANILLA',NULL,NULL,'CTA00000000000000003'),
('TRX00000000000000008','CONSIGNACION',200000.00,'2016-02-20 13:10:00','VENTANILLA',NULL,NULL,'CTA00000000000000003'),
('TRX00000000000000009','RETIRO',100000.00,'2017-05-10 15:45:00','CAJERO_AUTOMATICO',NULL,NULL,'CTA00000000000000003'),
('TRX00000000000000010','DEPOSITO',400000.00,'2018-02-01 09:30:00','VENTANILLA',NULL,NULL,'CTA00000000000000004'),
('TRX00000000000000011','DEPOSITO',250000.00,'2018-06-15 10:00:00','APP_MOVIL',NULL,NULL,'CTA00000000000000004'),
('TRX00000000000000012','PAGO',80000.00,'2019-03-10 12:00:00','PSE',NULL,NULL,'CTA00000000000000004'),
('TRX00000000000000013','RETIRO',50000.00,'2020-01-15 16:20:00','CAJERO_AUTOMATICO',NULL,NULL,'CTA00000000000000004'),
('TRX00000000000000014','DEPOSITO',350000.00,'2020-09-10 09:50:00','VENTANILLA',NULL,NULL,'CTA00000000000000005'),
('TRX00000000000000015','RETIRO',100000.00,'2021-01-20 14:15:00','CAJERO_AUTOMATICO',NULL,NULL,'CTA00000000000000005');


--  TABLA CREDITO 

INSERT INTO CREDITO (numero_radicado, valor_solicitado, valor_aprobado, tasa_interes_mensual, plazo_meses, fecha_aprobacion, fecha_primer_vencimiento, estado_credito, linea_credito, cedula_asociado, cedula_garante, fecha_firma_pagare, cedula_empleado) VALUES
('CRD00000000000000001',5000000.00,NULL,0.0150,12,NULL,NULL,'EN_ESTUDIO','CONSUMO','1098765432',NULL,NULL,'2006667788'),
('CRD00000000000000002',8000000.00,8000000.00,0.0140,24,'2022-03-10','2022-04-10','APROBADO','LIBRE_INVERSION','1076543210','1006723456','2022-03-12','2003334455'),
('CRD00000000000000003',15000000.00,15000000.00,0.0135,18,'2021-05-01','2021-06-01','DESEMBOLSADO','VIVIENDA','1065432109','1023456789','2021-05-05','2004445566'),
('CRD00000000000000004',6000000.00,6000000.00,0.0160,36,'2020-08-01','2020-09-01','EN_MORA','CONSUMO','1054321098',NULL,'2020-08-05','2006667788');


--  TABLA PAGO_CUOTA (entidad débil de CREDITO) 

INSERT INTO PAGO_CUOTA (numero_radicado, num_cuota, fecha_vencim_programada, fecha_pago, valor_pagado, estado_pago) VALUES
-- Plan de pagos CRD...001 (EN_ESTUDIO: aún no hay pagos, solo cronograma tentativo)
('CRD00000000000000001',1,'2026-07-15',NULL,NULL,'PENDIENTE'),
('CRD00000000000000001',2,'2026-08-15',NULL,NULL,'PENDIENTE'),
('CRD00000000000000001',3,'2026-09-15',NULL,NULL,'PENDIENTE'),
-- Plan de pagos CRD...002 (APROBADO: aprobado pero aún no desembolsado, sin pagos)
('CRD00000000000000002',1,'2022-04-10',NULL,NULL,'PENDIENTE'),
('CRD00000000000000002',2,'2022-05-10',NULL,NULL,'PENDIENTE'),
('CRD00000000000000002',3,'2022-06-10',NULL,NULL,'PENDIENTE'),
-- Plan de pagos CRD...003 (DESEMBOLSADO: 2 cuotas pagadas, 1 pago parcial, 1 pendiente)
('CRD00000000000000003',1,'2021-06-01','2021-06-01',950000.00,'PAGADA'),
('CRD00000000000000003',2,'2021-07-01','2021-07-03',950000.00,'PAGADA'),
('CRD00000000000000003',3,'2021-08-01','2021-08-05',500000.00,'PARCIAL'),
('CRD00000000000000003',4,'2021-09-01',NULL,NULL,'PENDIENTE'),
-- Plan de pagos CRD...004 (EN_MORA: 2 cuotas pagadas, 2 cuotas en mora)
('CRD00000000000000004',1,'2020-09-01','2020-09-01',220000.00,'PAGADA'),
('CRD00000000000000004',2,'2020-10-01','2020-10-02',220000.00,'PAGADA'),
('CRD00000000000000004',3,'2020-11-01',NULL,NULL,'EN_MORA'),
('CRD00000000000000004',4,'2020-12-01',NULL,NULL,'EN_MORA');


--  TABLA ATIENDE (relación M:N EMPLEADO - ASOCIADO) 

INSERT INTO ATIENDE (cedula_empleado, cedula_asociado, fecha_inicio_asesoria) VALUES
('2003334455','1006723456','2012-07-01'),
('2003334455','1023456789','2012-08-01'),
('2003334455','1094567890','2012-09-01'),
('2003334455','1112233445','2013-01-15'),
('2004445566','1098765432','2014-10-01'),
('2004445566','1076543210','2014-11-01'),
('2004445566','1065432109','2015-02-01'),
('2005556677','1054321098','2016-03-01'),
('2005556677','1043210987','2019-03-01'),
('2006667788','1032109876','2021-10-01');


--  TABLA RADICADO_EN (relación M:N AGENCIA - CREDITO)

INSERT INTO RADICADO_EN (codigo_agencia, numero_radicado) VALUES
('AGE0003','CRD00000000000000001'),
('AGE0001','CRD00000000000000001'),
('AGE0001','CRD00000000000000002'),
('AGE0002','CRD00000000000000003'),
('AGE0003','CRD00000000000000004');

COMMIT;


-- RESUMEN DE REGISTROS INSERTADOS 
-- CARGO se agregaron 5
-- AGENCIA se agregaron 3
-- EMPLEADO se agregaron 6
-- ASOCIADO se agregaron 10
-- ASOCIADO_FUNDADOR se agregaron 3
-- BENEFICIARIO se agregaron 4
-- TELEFONO_ASOCIADO se agregaron 11
-- CORREO_ASOCIADO se agregaron 11
-- CUENTA_AHORRO se agregaron 5
-- MOVIMIENTO se agregaron 15
-- CREDITO se agregaron 4
-- PAGO_CUOTA se agregaron 14
-- ATIENDE se agregaron 10
-- RADICADO_EN se agregaron 5
-- ----------------------------------
-- 106 REGISTROS 
