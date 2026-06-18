const API_URL = 'http://localhost:3000/api/asociados';

document.addEventListener('DOMContentLoaded', () => {
    cargarAsociadosALaTabla();
});

async function cargarAsociadosALaTabla() {
    const tabla = document.getElementById('tablaAsociadosAdmin');
    
    try {
        const respuesta = await fetch(API_URL);
        const asociados = await respuesta.json();

        // Limpiamos la tabla por seguridad
        tabla.innerHTML = '';

        // Recorremos los asociados cargados desde la base de datos
        asociados.forEach(asoc => {
            const fila = document.createElement('tr');
            fila.style.borderBottom = '1px solid #f1f5f9';
            
            // Evaluamos el color del estado dinámicamente
            const colorEstado = asoc.estado === 'ACTIVO' ? '#22c55e' : '#ef4444';

            fila.innerHTML = `
                <td style="padding: 12px; font-weight: 500;">${asoc.cedula_asociado}</td>
                <td style="padding: 12px;">${asoc.nombres} ${asoc.apellidos}</td>
                <td style="padding: 12px;">${asoc.municipio}</td>
                <td style="padding: 12px;">${new Date(asoc.fecha_afiliacion).toLocaleDateString()}</td>
                <td style="padding: 12px;">
                    <span style="background: ${colorEstado}15; color: ${colorEstado}; padding: 4px 8px; border-radius: 4px; font-size: 14px; font-weight: bold;">
                        ${asoc.estado}
                    </span>
                </td>
            `;
            tabla.appendChild(fila);
        });

    } catch (error) {
        console.error('Error al conectar con la API de asociados:', error);
        tabla.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: red;">No se pudieron cargar los datos del servidor.</td></tr>`;
    }
}
