const API_URL = 'http://localhost:3000/api/cuentas';

document.addEventListener('DOMContentLoaded', () => {
    cargarCuentasAdmin();
});

async function cargarCuentasAdmin() {
    const tabla = document.getElementById('tablaCuentasAdmin');
    
    try {
        const respuesta = await fetch(API_URL);
        const cuentas = await respuesta.json();

        tabla.innerHTML = '';

        cuentas.forEach(cta => {
            const fila = document.createElement('tr');
            
            // Colores dinámicos para los estados definidos en tu CHECK del DDL
            let colorEstado = '#64748b'; // Gris inactiva
            if (cta.estado === 'ACTIVA') colorEstado = '#22c55e';    // Verde
            if (cta.estado === 'EMBARGADA') colorEstado = '#ef4444'; // Rojo

            // Mapeo tentativo de variables (lo confirmamos con el código de tu backend)
            const numeroCuenta = cta.numero_cuenta || cta.numeroCuenta;
            const cedulaAsociado = cta.cedula_asociado || cta.cedulaAsociado;
            const fechaApertura = cta.fecha_apertura || cta.fechaApertura;
            const agencia = cta.codigo_agencia || cta.nombre_agencia || cta.codigoAgencia;
            // Busca esta línea y cámbiala por esta que cubre el nombre real del DDL:
            const asesor = cta.cedula_empleado || cta.cedulaEmpleado || cta.empleado_cedula || 'No asignado';


            fila.innerHTML = `
                <td><b>${numeroCuenta}</b></td>
                <td>${cedulaAsociado}</td>
                <td>${new Date(fechaApertura).toLocaleDateString()}</td>
                <td>${agencia}</td>
                <td>${asesor}</td>
                <td>
                    <span style="background: ${colorEstado}15; color: ${colorEstado}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                        ${cta.estado}
                    </span>
                </td>
            `;
            tabla.appendChild(fila);
        });

    } catch (error) {
        console.error('Error cargando cuentas:', error);
        tabla.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: #ef4444;">No se pudo conectar con el servidor de cuentas.</td></tr>`;
    }
}
