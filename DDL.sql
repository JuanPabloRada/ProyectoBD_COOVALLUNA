-- DDL base de datos cooperativa de credito
-- Integrantes: Juan Pablo Rada, Joseph Andrey Puerta, Alejandro Jaramillo, Jean Carlo Ospina


-- borramos todo en orden inverso para no tener problemas con las FK

DROP TABLE IF EXISTS RADICADO_EN;
DROP TABLE IF EXISTS ATIENDE;
DROP TABLE IF EXISTS PAGO_CUOTA;
DROP TABLE IF EXISTS CREDITO;
DROP TABLE IF EXISTS MOVIMIENTO;
DROP TABLE IF EXISTS CUENTA_AHORRO;
DROP TABLE IF EXISTS CORREO_ASOCIADO;
DROP TABLE IF EXISTS TELEFONO_ASOCIADO;
DROP TABLE IF EXISTS BENEFICIARIO;
DROP TABLE IF EXISTS ASOCIADO_FUNDADOR;
DROP TABLE IF EXISTS ASOCIADO;
DROP TABLE IF EXISTS EMPLEADO;
DROP TABLE IF EXISTS AGENCIA;
DROP TABLE IF EXISTS CARGO;


-- entidad CARGO, la mas sencilla no tiene FK

CREATE TABLE CARGO (
    codigo_cargo  CHAR(10)     NOT NULL,
    nombre_cargo  VARCHAR(60)  NOT NULL,
    descripcion   VARCHAR(255)  NULL,

    CONSTRAINT pk_cargo PRIMARY KEY (codigo_cargo),
    CONSTRAINT uq_cargo_nombre UNIQUE (nombre_cargo)
);


-- entidad AGENCIA, la creamos antes que EMPLEADO porque EMPLEADO la referencia

CREATE TABLE AGENCIA (
    codigo_agencia  CHAR(10)     NOT NULL,
    nombre_agencia  VARCHAR(100) NOT NULL,
    direccion       VARCHAR(150) NOT NULL,
    municipio       VARCHAR(80)  NOT NULL,
    telefono        VARCHAR(20)  NOT NULL,
    fecha_apertura  DATE         NOT NULL,

    CONSTRAINT pk_agencia PRIMARY KEY (codigo_agencia),
    CONSTRAINT uq_agencia_nombre UNIQUE (nombre_agencia)
);


-- entidad EMPLEADO
-- tiene una autoreferencia en cedula_supervisor porque un empleado puede ser jefe de otro
-- el supervisor puede ser null si el empleado no tiene jefe

CREATE TABLE EMPLEADO (
    cedula_empleado    VARCHAR(15)   NOT NULL,
    nombres            VARCHAR(80)   NOT NULL,
    apellidos          VARCHAR(80)   NOT NULL,
    fecha_ingreso      DATE          NOT NULL,
    salario_base       DECIMAL(12,2) NOT NULL,
    correo_corporativo VARCHAR(120)  NOT NULL,
    estado_laboral     VARCHAR(20)   NOT NULL,
    codigo_cargo       CHAR(10)      NOT NULL,
    cedula_supervisor  VARCHAR(15) NULL, -- se permite NULL porque no todos tienen supervisor
    codigo_agencia     CHAR(10)      NOT NULL,

    CONSTRAINT pk_empleado PRIMARY KEY (cedula_empleado),
    CONSTRAINT uq_empleado_correo UNIQUE (correo_corporativo),
    CONSTRAINT fk_empleado_cargo FOREIGN KEY (codigo_cargo)
        REFERENCES CARGO (codigo_cargo),
    CONSTRAINT fk_empleado_supervisor FOREIGN KEY (cedula_supervisor)
        REFERENCES EMPLEADO (cedula_empleado),
    CONSTRAINT fk_empleado_agencia FOREIGN KEY (codigo_agencia)
        REFERENCES AGENCIA (codigo_agencia),
    CONSTRAINT chk_empleado_salario CHECK (salario_base > 0),
    CONSTRAINT chk_empleado_estado CHECK (
        estado_laboral IN ('ACTIVO', 'EN_LICENCIA', 'RETIRADO')
    )
);


-- entidad ASOCIADO
-- ojito: telefono y correo NO van aqui porque en el MER son atributos multivaluados
-- eso significa que un asociado puede tener varios, entonces van en tabla aparte

CREATE TABLE ASOCIADO (
    cedula_asociado      VARCHAR(15)   NOT NULL,
    nombres              VARCHAR(80)   NOT NULL,
    apellidos            VARCHAR(80)   NOT NULL,
    fecha_nacimiento     DATE          NOT NULL,
    barrio               VARCHAR(80),
    calle                VARCHAR(80),
    numero               VARCHAR(20),
    municipio            VARCHAR(80)   NOT NULL,
    fecha_afiliacion     DATE          NOT NULL,
    estado               VARCHAR(20)   NOT NULL,
    cuota_sostenimiento  DECIMAL(10,2) NOT NULL,

    CONSTRAINT pk_asociado PRIMARY KEY (cedula_asociado),
    CONSTRAINT chk_asociado_estado CHECK (
        estado IN ('ACTIVO', 'SUSPENDIDO', 'RETIRADO')
    ),
    CONSTRAINT chk_asociado_cuota CHECK (cuota_sostenimiento >= 0)
);


-- ASOCIADO_FUNDADOR es una especializacion de ASOCIADO
-- comparte la misma cedula, por eso la PK tambien es FK

CREATE TABLE ASOCIADO_FUNDADOR (
    cedula_asociado         VARCHAR(15)  NOT NULL,
    numero_acta_fundacional VARCHAR(30)  NOT NULL,
    anio_reconocimiento     SMALLINT     NOT NULL,
    descripcion_beneficios  VARCHAR(255),

    CONSTRAINT pk_asoc_fundador PRIMARY KEY (cedula_asociado),
    CONSTRAINT fk_asoc_fundador_asociado FOREIGN KEY (cedula_asociado)
        REFERENCES ASOCIADO (cedula_asociado),
    CONSTRAINT uq_asoc_fundador_acta UNIQUE (numero_acta_fundacional),
    CONSTRAINT chk_asoc_fundador_anio CHECK (anio_reconocimiento >= 1900)
);


-- entidad debil BENEFICIARIO, depende de ASOCIADO
-- la PK es compuesta: num_orden + cedula_asociado
-- porque el num_orden se repite entre asociados distintos

CREATE TABLE BENEFICIARIO (
    num_orden                SMALLINT     NOT NULL,
    cedula_asociado          VARCHAR(15)  NOT NULL,
    numero_documento         VARCHAR(20)  NOT NULL,
    nombre_completo          VARCHAR(160) NOT NULL,
    parentesco               VARCHAR(50)  NOT NULL,
    porcentaje_participacion DECIMAL(5,2) NOT NULL,
    telefono_contacto        VARCHAR(20),

    CONSTRAINT pk_beneficiario PRIMARY KEY (num_orden, cedula_asociado),
    CONSTRAINT fk_beneficiario_asociado FOREIGN KEY (cedula_asociado)
        REFERENCES ASOCIADO (cedula_asociado),
    CONSTRAINT uq_beneficiario_documento UNIQUE (numero_documento),
    CONSTRAINT chk_beneficiario_porcentaje CHECK (
        porcentaje_participacion > 0 AND porcentaje_participacion <= 100
    )
);


-- tabla para los telefonos del asociado
-- viene del atributo multivaluado del MER, la PK es compuesta

CREATE TABLE TELEFONO_ASOCIADO (
    cedula_asociado   VARCHAR(15) NOT NULL,
    telefono_contacto VARCHAR(20) NOT NULL,

    CONSTRAINT pk_telefono_asociado PRIMARY KEY (cedula_asociado, telefono_contacto),
    CONSTRAINT fk_telefono_asociado FOREIGN KEY (cedula_asociado)
        REFERENCES ASOCIADO (cedula_asociado)
);


-- igual que la de telefonos pero para correos
-- pusimos UNIQUE en correo_electronico porque dos personas no pueden tener el mismo correo

CREATE TABLE CORREO_ASOCIADO (
    cedula_asociado    VARCHAR(15)  NOT NULL,
    correo_electronico VARCHAR(120) NOT NULL,

    CONSTRAINT pk_correo_asociado PRIMARY KEY (cedula_asociado, correo_electronico),
    CONSTRAINT fk_correo_asociado FOREIGN KEY (cedula_asociado)
        REFERENCES ASOCIADO (cedula_asociado),
    CONSTRAINT uq_correo_electronico UNIQUE (correo_electronico)
);


-- entidad CUENTA_AHORRO
-- el saldo NO se guarda porque es un atributo derivado en el MER (ovalo discontinuo)
-- para saber el saldo se hace un SUM sobre los movimientos de esa cuenta

CREATE TABLE CUENTA_AHORRO (
    numero_cuenta   CHAR(20)    NOT NULL,
    fecha_apertura  DATE        NOT NULL,
    estado          VARCHAR(20) NOT NULL,
    cedula_asociado VARCHAR(15) NOT NULL,
    codigo_agencia  CHAR(10)    NOT NULL,

    CONSTRAINT pk_cuenta_ahorro PRIMARY KEY (numero_cuenta),
    CONSTRAINT fk_cuenta_asociado FOREIGN KEY (cedula_asociado)
        REFERENCES ASOCIADO (cedula_asociado),
    CONSTRAINT fk_cuenta_agencia FOREIGN KEY (codigo_agencia)
        REFERENCES AGENCIA (codigo_agencia),
    CONSTRAINT chk_cuenta_estado CHECK (
        estado IN ('ACTIVA', 'INACTIVA', 'EMBARGADA')
    )
);


-- entidad MOVIMIENTO
-- cuenta_origen y cuenta_destino son atributos normales, no son FK

-- el constraint chk_transferencia es para manejar el funcionamiento correcto:
-- si el tipo de movimiento es TRANSFERENCIA, entonces cuenta_origen y cuenta_destino
-- no pueden ser null, porque de donde salio la plata y a donde fue son obligatorios
-- para los otros tipos como DEPOSITO o RETIRO esos campos si pueden quedar en null

CREATE TABLE MOVIMIENTO (
    numero_transaccion CHAR(20)      NOT NULL,
    tipo_movimiento    VARCHAR(30)   NOT NULL,
    valor_transaccion  DECIMAL(14,2) NOT NULL,
    fecha_hora         TIMESTAMP     NOT NULL,
    canal              VARCHAR(40)   NOT NULL,
    cuenta_origen      VARCHAR(30),
    cuenta_destino     VARCHAR(30),
    numero_cuenta      CHAR(20)      NOT NULL,

    CONSTRAINT pk_movimiento PRIMARY KEY (numero_transaccion),
    CONSTRAINT fk_movimiento_cuenta FOREIGN KEY (numero_cuenta)
        REFERENCES CUENTA_AHORRO (numero_cuenta),
    CONSTRAINT chk_movimiento_tipo CHECK (
        tipo_movimiento IN ('DEPOSITO', 'RETIRO', 'TRANSFERENCIA', 'PAGO', 'CONSIGNACION')
    ),
    CONSTRAINT chk_movimiento_valor CHECK (valor_transaccion > 0),
    CONSTRAINT chk_transferencia CHECK (
        tipo_movimiento <> 'TRANSFERENCIA'
        OR (cuenta_origen IS NOT NULL AND cuenta_destino IS NOT NULL)
    )
);


-- entidad CREDITO
-- cedula_garante puede ser null si el credito no necesita garante
-- son dos FK distintas a ASOCIADO porque una es el que pide y otra es el que garantiza
-- cedula_empleado es el que tramita el credito, viene de la relacion "tramita" del MER

CREATE TABLE CREDITO (
    numero_radicado          CHAR(20)      NOT NULL,
    valor_solicitado         DECIMAL(14,2) NOT NULL,
    valor_aprobado           DECIMAL(14,2),
    tasa_interes_mensual     DECIMAL(6,4)  NOT NULL,
    plazo_meses              SMALLINT      NOT NULL,
    fecha_aprobacion         DATE,
    fecha_primer_vencimiento DATE,
    estado_credito           VARCHAR(20)   NOT NULL,
    linea_credito            VARCHAR(60)   NOT NULL,
    cedula_asociado          VARCHAR(15)   NOT NULL,
    cedula_garante           VARCHAR(15),
    fecha_firma_pagare       DATE,
    cedula_empleado          VARCHAR(15)   NOT NULL,

    CONSTRAINT pk_credito PRIMARY KEY (numero_radicado),
    CONSTRAINT fk_credito_asociado FOREIGN KEY (cedula_asociado)
        REFERENCES ASOCIADO (cedula_asociado),
    CONSTRAINT fk_credito_garante FOREIGN KEY (cedula_garante)
        REFERENCES ASOCIADO (cedula_asociado),
    CONSTRAINT fk_credito_empleado FOREIGN KEY (cedula_empleado)
        REFERENCES EMPLEADO (cedula_empleado),
    CONSTRAINT chk_credito_estado CHECK (
        estado_credito IN ('EN_ESTUDIO', 'APROBADO', 'DESEMBOLSADO',
                           'AL_DIA', 'EN_MORA', 'CANCELADO')
    ),
    CONSTRAINT chk_credito_val_sol CHECK (valor_solicitado > 0),
    CONSTRAINT chk_credito_val_apr CHECK (valor_aprobado > 0),
    CONSTRAINT chk_credito_tasa CHECK (tasa_interes_mensual > 0),
    CONSTRAINT chk_credito_plazo CHECK (plazo_meses > 0)
);


-- entidad debil PAGO_CUOTA, depende de CREDITO
-- PK compuesta porque el num_cuota solo tiene sentido dentro de un credito

CREATE TABLE PAGO_CUOTA (
    numero_radicado         CHAR(20)      NOT NULL,
    num_cuota               SMALLINT      NOT NULL,
    fecha_vencim_programada DATE          NOT NULL,
    fecha_pago              DATE,
    valor_pagado            DECIMAL(14,2),
    estado_pago             VARCHAR(20)   NOT NULL,

    CONSTRAINT pk_pago_cuota PRIMARY KEY (numero_radicado, num_cuota),
    CONSTRAINT fk_pago_cuota_credito FOREIGN KEY (numero_radicado)
        REFERENCES CREDITO (numero_radicado),
    CONSTRAINT chk_pago_cuota_num CHECK (num_cuota > 0),
    CONSTRAINT chk_pago_cuota_estado CHECK (
        estado_pago IN ('PENDIENTE', 'PAGADA', 'EN_MORA', 'PARCIAL')
    ),
    CONSTRAINT chk_pago_cuota_valor CHECK (valor_pagado > 0)
);


-- tabla intermedia ATIENDE, viene de la relacion M:N entre EMPLEADO y ASOCIADO
-- un empleado atiende muchos asociados y un asociado puede ser atendido por varios empleados

CREATE TABLE ATIENDE (
    cedula_empleado       VARCHAR(15) NOT NULL,
    cedula_asociado       VARCHAR(15) NOT NULL,
    fecha_inicio_asesoria DATE        NOT NULL,

    CONSTRAINT pk_atiende PRIMARY KEY (cedula_empleado, cedula_asociado),
    CONSTRAINT fk_atiende_empleado FOREIGN KEY (cedula_empleado)
        REFERENCES EMPLEADO (cedula_empleado),
    CONSTRAINT fk_atiende_asociado FOREIGN KEY (cedula_asociado)
        REFERENCES ASOCIADO (cedula_asociado)
);


-- tabla intermedia RADICADO_EN, viene de la relacion M:N entre AGENCIA y CREDITO
-- una agencia puede radicar muchos creditos y un credito puede estar en varias agencias

CREATE TABLE RADICADO_EN (
    codigo_agencia  CHAR(10) NOT NULL,
    numero_radicado CHAR(20) NOT NULL,

    CONSTRAINT pk_radicado_en PRIMARY KEY (codigo_agencia, numero_radicado),
    CONSTRAINT fk_radicado_agencia FOREIGN KEY (codigo_agencia)
        REFERENCES AGENCIA (codigo_agencia),
    CONSTRAINT fk_radicado_credito FOREIGN KEY (numero_radicado)
        REFERENCES CREDITO (numero_radicado)
);
