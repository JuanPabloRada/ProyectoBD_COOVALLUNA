const API_URL = 'http://localhost:3000/api/empleados';

document.addEventListener('DOMContentLoaded', () => {
    cargarEmpleados();
});

async function cargarEmpleados() {
    const tabla = document.getElementById('tablaEmpleadosAdmin');
    
    try {
        const respuesta = await fetch(API_URL);
        const empleados = await respuesta.json();

        tabla.innerHTML = '';

        // Formateador para pesos colombianos (COP)
        const formatoMoneda = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        });

        empleados.forEach(emp => {
            const fila = document.createElement('tr');
            
            // Definición dinámica de colores de estado laboral según tu CHECK del DDL
            let colorEstado = '#64748b'; // Por defecto retirado o licencia
            if (emp.estado_laboral === 'ACTIVO') colorEstado = '#22c55e';
            if (emp.estado_laboral === 'EN_LICENCIA') colorEstado = '#eab308';

            // Nota: Si tu backend ya hace un JOIN con CARGO y AGENCIA, puedes usar emp.nombre_cargo 
            // de lo contrario usamos los códigos base emp.codigo_cargo y emp.codigo_agencia
            const cargo = emp.nombre_cargo || emp.codigo_cargo;
            const agencia = emp.nombre_agencia || emp.codigo_agencia;

            // CORRECCIÓN: Extraer el salario soportando camelCase o snake_case y forzar su conversión a tipo número
            // REEMPLAZA estas dos líneas dentro del empleados.forEach:
const salarioCrudo = emp.salario_base || emp.salarioBase || emp.salario || emp.salariobase || emp.salario_empleado || emp.sueldo || 0;
const salarioNumerico = Number(salarioCrudo);


            fila.innerHTML = `
                <td><b>${emp.cedula_empleado}</b></td>
                <td>${emp.nombres} ${emp.apellidos}</td>
                <td>${emp.correo_corporativo}</td>
                <td><span style="color: #475569; font-size: 13px; font-weight: 500;">${cargo}</span></td>
                <td>${agencia}</td>
                <!-- Se actualiza aquí para pasar el valor ya convertido en formato numérico -->
                <td><span style="font-weight: 500; color: #0f172a;">${formatoMoneda.format(salarioNumerico)}</span></td>
                <td>
                    <span style="background: ${colorEstado}15; color: ${colorEstado}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                        ${emp.estado_laboral}
                    </span>
                </td>
            `;
            tabla.appendChild(fila);
        });

    } catch (error) {
        console.error('Error cargando empleados:', error);
        tabla.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color: #ef4444;">No se pudo conectar con el servidor de empleados.</td></tr>`;
    }
}
