const express = require('express');
const pool = require('../config/db');

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

/**
 * POST /api/login
 *
 * Body: { cedula: string, password: string }
 *
 * Estrategia de búsqueda:
 *   1. Busca en EMPLEADO (JOIN CARGO para saber el rol).
 *      - nombre_cargo = 'ADMINISTRADOR' → rol "admin"
 *      - cualquier otro cargo              → rol "asesor"
 *   2. Si no existe como empleado, busca en ASOCIADO.
 *
 * Contraseña comparada en texto plano por ahora.
 * Para migrar a bcrypt: reemplaza la comparación por bcrypt.compare().
 *
 * Respuesta exitosa: { success: true, rol, nombre }
 * Respuesta fallida: { success: false, mensaje }
 */
router.post('/', asyncHandler(async (req, res) => {
  const { cedula, password } = req.body;

  // --- Validación básica de entrada ---
  if (!cedula || !password) {
    return res.status(400).json({
      success: false,
      mensaje: 'Cédula y contraseña son obligatorias.',
    });
  }

  // --- 1. Buscar en EMPLEADO ---
  const queryEmpleado = `
    SELECT
      e.cedula_empleado,
      e.nombres,
      e.apellidos,
      e.contrasena,
      e.estado_laboral,
      TRIM(c.nombre_cargo) AS nombre_cargo
    FROM empleado e
    JOIN cargo   c ON c.codigo_cargo = e.codigo_cargo
    WHERE e.cedula_empleado = $1
    LIMIT 1
  `;

  const resEmpleado = await pool.query(queryEmpleado, [cedula.trim()]);

  if (resEmpleado.rowCount > 0) {
    const emp = resEmpleado.rows[0];

    // Verificar que el empleado esté activo
    if (emp.estado_laboral !== 'ACTIVO') {
      return res.status(403).json({
        success: false,
        mensaje: 'Empleado inactivo. Contacte a recursos humanos.',
      });
    }

    // Comparar contraseña (texto plano → fácil de migrar a bcrypt)
    // Para bcrypt: const ok = await bcrypt.compare(password, emp.contrasena);
    const ok = password === emp.contrasena;

    if (!ok) {
      return res.status(401).json({ success: false, mensaje: 'Credenciales incorrectas.' });
    }

    // Determinar rol según cargo
    const nombreCargo = emp.nombre_cargo.toUpperCase();
    const rol = nombreCargo === 'ADMINISTRADOR' ? 'admin' : 'asesor';

    return res.json({
      success: true,
      rol,
      nombre: `${emp.nombres} ${emp.apellidos}`,
    });
  }

  // --- 2. Buscar en ASOCIADO ---
  const queryAsociado = `
    SELECT
      cedula_asociado,
      nombres,
      apellidos,
      contrasena,
      estado
    FROM asociado
    WHERE cedula_asociado = $1
    LIMIT 1
  `;

  const resAsociado = await pool.query(queryAsociado, [cedula.trim()]);

  if (resAsociado.rowCount > 0) {
    const asoc = resAsociado.rows[0];

    // Verificar que el asociado esté activo
    if (asoc.estado !== 'ACTIVO') {
      return res.status(403).json({
        success: false,
        mensaje: 'Asociado suspendido o retirado. Contacte a la cooperativa.',
      });
    }

    // Comparar contraseña (texto plano)
    const ok = password === asoc.contrasena;

    if (!ok) {
      return res.status(401).json({ success: false, mensaje: 'Credenciales incorrectas.' });
    }

    return res.json({
      success: true,
      rol: 'asociado',
      nombre: `${asoc.nombres} ${asoc.apellidos}`,
    });
  }

  // --- 3. Usuario no encontrado en ninguna tabla ---
  return res.status(401).json({ success: false, mensaje: 'Credenciales incorrectas.' });
}));

module.exports = router;
