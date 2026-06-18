const API_URL = 'http://localhost:3000/api/creditos';

document.addEventListener('DOMContentLoaded', () => {
    cargarCreditosAdmin();
});

async function cargarCreditosAdmin() {
    const tabla = document.getElementById('tablaCreditosAdmin');
    
    try {
        const respuesta = await fetch(API_URL);
        const creditos = await respuesta.json();

        tabla.innerHTML = '';

        // Formateador para pesos colombianos (COP)
        const formatoMoneda = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        });

        creditos.forEach(cred => {
            const fila = document.createElement('tr');
            
            // Sincronizado con: cred.estado_credito
            const estadoActual = cred.estado_credito || 'EN_ESTUDIO';
            
            // Asignación de colores dinámicos según los estados reales de tu DML
            let colorEstado = '#64748b'; // Por defecto gris
            if (estadoActual === 'EN_ESTUDIO') colorEstado = '#3b82f6';   // Azul
            if (estadoActual === 'APROBADO') colorEstado = '#ec4899';     // Rosado/Magenta
            if (estadoActual === 'DESEMBOLSADO') colorEstado = '#f97316';  // Naranja
            if (estadoActual === 'AL_DIA') colorEstado = '#22c55e';        // Verde

            // Sincronizado con: cred.valor_solicitado y cred.valor_aprobado
            const solicitado = Number(cred.valor_solicitado || 0);
            const aprobado = cred.valor_aprobado !== null && cred.valor_aprobado !== undefined ? Number(cred.valor_aprobado) : null;
            
            const textoAprobado = aprobado !== null 
                ? formatoMoneda.format(aprobado) 
                : '<span style="color:#94a3b8; font-style:italic;">Por definir</span>';

            fila.innerHTML = `
                <td><b>${cred.numero_radicado}</b></td>
                <td>${cred.linea_credito.replace('_', ' ')}</td>
                <td>${cred.cedula_asociado}</td>
                <td><span style="font-weight: 500;">${formatoMoneda.format(solicitado)}</span></td>
                <td><span style="font-weight: 500; color: #1e3a8a;">${textoAprobado}</span></td>
                <td style="text-align: center;">${cred.plazo_meses} meses</td>
                <td>
                    <span style="background: ${colorEstado}15; color: ${colorEstado}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                        ${estadoActual}
                    </span>
                </td>
            `;
            tabla.appendChild(fila);
        });

    } catch (error) {
        console.error('Error cargando créditos:', error);
        tabla.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color: #ef4444;">No se pudo conectar con el servidor de créditos.</td></tr>`;
    }
}
