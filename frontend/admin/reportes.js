const BASE_URL = 'http://localhost:3000/api/reportes';

const formatoMoneda = new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
});

// ─── Paneles de filtros opcionales por reporte ────────────────────────────────
const FILTROS = {
    'asociados-por-estado-agencia': `
        <div class="filtro-grupo">
            <label>Estado del asociado:</label>
            <select id="f_estado">
                <option value="">Todos</option>
                <option value="ACTIVO">ACTIVO</option>
                <option value="SUSPENDIDO">SUSPENDIDO</option>
                <option value="RETIRADO">RETIRADO</option>
            </select>
        </div>
        <div class="filtro-grupo">
            <label>Código de agencia:</label>
            <input type="text" id="f_agencia" placeholder="Ej: AG001">
        </div>`,

    'extracto-cuenta': `
        <div class="filtro-grupo">
            <label>N° de cuenta <span style="color:#ef4444">*</span>:</label>
            <input type="text" id="f_cuenta" placeholder="Ej: CTA00000000000000001" maxlength="20" required>
        </div>
        <div class="filtro-grupo">
            <label>Fecha desde:</label>
            <input type="date" id="f_fecha_desde">
        </div>
        <div class="filtro-grupo">
            <label>Fecha hasta:</label>
            <input type="date" id="f_fecha_hasta">
        </div>
        <div class="filtro-grupo">
            <label>Tipo de movimiento:</label>
            <select id="f_tipo_mov">
                <option value="">Todos</option>
                <option value="DEPOSITO">DEPOSITO</option>
                <option value="CONSIGNACION">CONSIGNACION</option>
                <option value="RETIRO">RETIRO</option>
                <option value="TRANSFERENCIA_ENTRANTE">TRANSFERENCIA ENTRANTE</option>
                <option value="TRANSFERENCIA_SALIENTE">TRANSFERENCIA SALIENTE</option>
                <option value="PAGO">PAGO</option>
            </select>
        </div>
        <div class="filtro-grupo">
            <label>Canal:</label>
            <select id="f_canal">
                <option value="">Todos</option>
                <option value="APP_MOVIL">App Móvil</option>
                <option value="PORTAL_WEB">Portal Web</option>
                <option value="VENTANILLA">Ventanilla</option>
                <option value="CAJERO">Cajero</option>
            </select>
        </div>`,

    'cartera-por-linea-estado': `
        <div class="filtro-grupo">
            <label>Código de agencia:</label>
            <input type="text" id="f_agencia" placeholder="Ej: AG001 (vacío = todas)">
        </div>
        <div class="filtro-grupo">
            <label>Fecha aprobación desde:</label>
            <input type="date" id="f_fecha_desde">
        </div>
        <div class="filtro-grupo">
            <label>Fecha aprobación hasta:</label>
            <input type="date" id="f_fecha_hasta">
        </div>`,

    'asociados-en-mora': `
        <p style="color:#64748b; font-size:13px; margin:0;">
            Este reporte no requiere filtros. Muestra todas las cuotas vencidas o en mora del sistema.
        </p>`,

    'historial-pagos': `
        <div class="filtro-grupo">
            <label>Número de radicado <span style="color:#ef4444">*</span>:</label>
            <input type="text" id="f_radicado" placeholder="Ej: CR001" maxlength="20" required>
        </div>`,

    'productividad-asesores': `
        <div class="filtro-grupo">
            <label>Código de agencia:</label>
            <input type="text" id="f_agencia" placeholder="Ej: AG001 (vacío = todas)">
        </div>
        <div class="filtro-grupo">
            <label>Fecha desde:</label>
            <input type="date" id="f_fecha_desde">
        </div>
        <div class="filtro-grupo">
            <label>Fecha hasta:</label>
            <input type="date" id="f_fecha_hasta">
        </div>`,

    'codeudoria-activa': `
        <p style="color:#64748b; font-size:13px; margin:0;">
            Este reporte no requiere filtros. Lista todas las codeudorías activas en la cooperativa.
        </p>`
};

// ─── Mostrar filtros al cambiar el selector ───────────────────────────────────
document.getElementById('selectorReporte').addEventListener('change', function () {
    const opcion      = this.value;
    const panelFiltro = document.getElementById('panelFiltros');
    const contenido   = document.getElementById('filtrosContenido');

    if (opcion && FILTROS[opcion]) {
        contenido.innerHTML  = FILTROS[opcion];
        panelFiltro.style.display = 'flex';
    } else {
        panelFiltro.style.display = 'none';
        contenido.innerHTML       = '';
    }

    // Limpiar resultados previos
    document.getElementById('tituloReporte').textContent  = 'Resultados de la Consulta';
    document.getElementById('cabeceraReporte').innerHTML  = '';
    document.getElementById('tablaReportesAdmin').innerHTML =
        `<tr><td colspan="100%" style="text-align:center; color:#94a3b8; padding:30px;">
            Configura los filtros y presiona "Consultar".
         </td></tr>`;
});

document.getElementById('btnConsultar').addEventListener('click', procesarConsultaReporte);

// ─── Leer valor de un campo de filtro de forma segura ────────────────────────
function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() || null : null;
}

// ─── Construir URL con parámetros de query string ────────────────────────────
function buildUrl(ruta, params = {}) {
    const url = new URL(`${BASE_URL}/${ruta}`, window.location.origin);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== '') url.searchParams.set(k, v);
    });
    return url.toString();
}

async function procesarConsultaReporte() {
    const opcion    = document.getElementById('selectorReporte').value;
    const titulo    = document.getElementById('tituloReporte');
    const cabecera  = document.getElementById('cabeceraReporte');
    const tabla     = document.getElementById('tablaReportesAdmin');

    if (!opcion) {
        alert('Por favor selecciona un tipo de reporte de la lista.');
        return;
    }

    tabla.innerHTML = `<tr><td colspan="100%" style="text-align:center; padding:20px; color:#64748b;">Consultando base de datos...</td></tr>`;

    try {
        let url;
        let nombreReporte;

        // ── Construir URL según el reporte seleccionado ───────────────────────
        switch (opcion) {

            case 'asociados-por-estado-agencia':
                nombreReporte = '1. Asociados por Estado y Agencia';
                url = buildUrl('asociados-por-estado-agencia', {
                    estado:          val('f_estado'),
                    codigo_agencia:  val('f_agencia')
                });
                break;

            case 'extracto-cuenta': {
                const cuenta = val('f_cuenta');
                if (!cuenta) { alert('Debes ingresar el número de cuenta.'); tabla.innerHTML = ''; return; }
                nombreReporte = `2. Extracto — Cuenta ${cuenta}`;
                url = buildUrl(`extracto-cuenta/${encodeURIComponent(cuenta)}`, {
                    fecha_desde:     val('f_fecha_desde'),
                    fecha_hasta:     val('f_fecha_hasta'),
                    tipo_movimiento: val('f_tipo_mov'),
                    canal:           val('f_canal')
                });
                break;
            }

            case 'cartera-por-linea-estado':
                nombreReporte = '3. Distribución de Cartera por Línea y Estado';
                url = buildUrl('cartera-por-linea-estado', {
                    codigo_agencia: val('f_agencia'),
                    fecha_desde:    val('f_fecha_desde'),
                    fecha_hasta:    val('f_fecha_hasta')
                });
                break;

            case 'asociados-en-mora':
                nombreReporte = '4. Listado de Asociados en Mora';
                url = buildUrl('asociados-en-mora');
                break;

            case 'historial-pagos': {
                const radicado = val('f_radicado');
                if (!radicado) { alert('Debes ingresar el número de radicado.'); tabla.innerHTML = ''; return; }
                nombreReporte = `5. Historial de Pagos — ${radicado}`;
                url = buildUrl(`historial-pagos/${encodeURIComponent(radicado)}`);
                break;
            }

            case 'productividad-asesores':
                nombreReporte = '6. Productividad de Asesores por Agencia';
                url = buildUrl('productividad-asesores', {
                    codigo_agencia: val('f_agencia'),
                    fecha_desde:    val('f_fecha_desde'),
                    fecha_hasta:    val('f_fecha_hasta')
                });
                break;

            case 'codeudoria-activa':
                nombreReporte = '7. Registro de Codeudorías Activas';
                url = buildUrl('codeudoria-activa');
                break;

            default:
                alert('Reporte no reconocido.');
                return;
        }

        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        const datos = await respuesta.json();

        titulo.textContent   = `Reporte: ${nombreReporte}`;
        tabla.innerHTML      = '';
        cabecera.innerHTML   = '';

        if (!datos || datos.length === 0) {
            tabla.innerHTML = `<tr><td colspan="100%" style="text-align:center; padding:20px; color:#94a3b8;">No se encontraron registros para esta consulta.</td></tr>`;
            return;
        }

        // ── Renderizar tabla según el reporte ─────────────────────────────────
        switch (opcion) {

            case 'asociados-por-estado-agencia':
                cabecera.innerHTML = `
                    <tr>
                        <th>Cédula</th><th>Nombres</th><th>Apellidos</th>
                        <th>Fecha afiliación</th><th>Estado</th>
                        <th>Fundador</th><th>Agencia</th><th>Productos activos</th>
                    </tr>`;
                datos.forEach(r => {
                    const colorEst = r.estado === 'ACTIVO' ? '#16a34a' : r.estado === 'SUSPENDIDO' ? '#d97706' : '#ef4444';
                    tabla.innerHTML += `
                        <tr>
                            <td><b>${r.cedula_asociado}</b></td>
                            <td>${r.nombres}</td>
                            <td>${r.apellidos}</td>
                            <td>${r.fecha_afiliacion ? new Date(r.fecha_afiliacion).toLocaleDateString('es-CO') : '—'}</td>
                            <td><span style="color:${colorEst}; font-weight:600;">${r.estado}</span></td>
                            <td style="text-align:center;">${r.es_fundador}</td>
                            <td>${r.agencia}</td>
                            <td style="text-align:center; font-weight:600;">${r.productos_activos}</td>
                        </tr>`;
                });
                break;

            case 'extracto-cuenta':
                cabecera.innerHTML = `
                    <tr>
                        <th>Código mov.</th><th>Fecha</th><th>Tipo</th>
                        <th>Canal</th><th style="text-align:right;">Monto</th>
                        <th style="text-align:right;">Saldo acumulado</th>
                    </tr>`;
                datos.forEach(r => {
                    const tipo = String(r.tipo_movimiento || '').toUpperCase();
                    const esEntrada = ['DEPOSITO','CONSIGNACION','TRANSFERENCIA_ENTRANTE'].some(t => tipo.includes(t));
                    const esSalida  = ['RETIRO','PAGO','TRANSFERENCIA_SALIENTE'].some(t => tipo.includes(t));
                    const colorMonto = esEntrada ? '#16a34a' : esSalida ? '#dc2626' : '#0f172a';
                    const prefijo    = esEntrada ? '+' : esSalida ? '-' : '';
                    tabla.innerHTML += `
                        <tr>
                            <td>${r.codigo_movimiento || '—'}</td>
                            <td>${r.fecha_movimiento ? new Date(r.fecha_movimiento).toLocaleString('es-CO') : '—'}</td>
                            <td><span style="font-size:12px; font-weight:600; color:#475569;">${tipo}</span></td>
                            <td>${r.canal || 'Ventanilla'}</td>
                            <td style="text-align:right; font-weight:600; color:${colorMonto};">
                                ${prefijo}${formatoMoneda.format(Number(r.monto || 0))}
                            </td>
                            <td style="text-align:right; font-weight:500; color:#1e40af;">
                                ${formatoMoneda.format(Number(r.saldo_acumulado || 0))}
                            </td>
                        </tr>`;
                });
                break;

            case 'cartera-por-linea-estado':
                cabecera.innerHTML = `
                    <tr>
                        <th>Línea de crédito</th><th>Estado</th>
                        <th style="text-align:center;">Cant. créditos</th>
                        <th style="text-align:right;">Valor total aprobado</th>
                        <th style="text-align:right;">% Cartera</th>
                    </tr>`;
                datos.forEach(r => {
                    tabla.innerHTML += `
                        <tr>
                            <td><b>${(r.linea_credito || '').replace(/_/g, ' ')}</b></td>
                            <td>${r.estado_credito}</td>
                            <td style="text-align:center;">${r.cantidad_creditos}</td>
                            <td style="text-align:right; color:#16a34a; font-weight:500;">
                                ${formatoMoneda.format(Number(r.valor_total || 0))}
                            </td>
                            <td style="text-align:right; font-weight:600; color:#1e40af;">
                                ${Number(r.porcentaje_cartera || 0).toFixed(2)} %
                            </td>
                        </tr>`;
                });
                break;

            case 'asociados-en-mora':
                cabecera.innerHTML = `
                    <tr>
                        <th>Cédula</th><th>Nombre completo</th><th>Radicado</th>
                        <th>Línea</th><th>Cuota N°</th><th>Estado pago</th>
                        <th>Vencimiento</th><th style="text-align:center;">Días mora</th>
                        <th>Asesor responsable</th>
                    </tr>`;
                datos.forEach(r => {
                    const dias = Number(r.dias_mora || 0);
                    const colorDias = dias > 90 ? '#dc2626' : dias > 30 ? '#d97706' : '#b45309';
                    tabla.innerHTML += `
                        <tr>
                            <td><b>${r.cedula_asociado}</b></td>
                            <td>${r.nombres} ${r.apellidos}</td>
                            <td>${r.numero_radicado}</td>
                            <td>${(r.linea_credito || '').replace(/_/g, ' ')}</td>
                            <td style="text-align:center;">${r.num_cuota}</td>
                            <td><span style="color:#ef4444; font-weight:600; font-size:12px;">${r.estado_pago}</span></td>
                            <td>${r.fecha_vencim_programada ? new Date(r.fecha_vencim_programada).toLocaleDateString('es-CO') : '—'}</td>
                            <td style="text-align:center; font-weight:700; color:${colorDias};">${dias}</td>
                            <td>${r.asesor_responsable || '—'}</td>
                        </tr>`;
                });
                break;

            case 'historial-pagos':
                cabecera.innerHTML = `
                    <tr>
                        <th>Radicado</th><th style="text-align:center;">N° cuota</th>
                        <th>Vencimiento programado</th><th>Fecha de pago</th>
                        <th style="text-align:right;">Valor pagado</th>
                        <th>Estado pago</th><th style="text-align:center;">Requiere atención</th>
                    </tr>`;
                datos.forEach(r => {
                    const alDia     = r.estado_pago === 'PAGADO';
                    const colorEst  = alDia ? '#16a34a' : ['EN_MORA','PARCIAL'].includes(r.estado_pago) ? '#ef4444' : '#d97706';
                    const colorAten = r.requiere_atencion === 'SI' ? '#ef4444' : '#64748b';
                    tabla.innerHTML += `
                        <tr>
                            <td><b>${r.numero_radicado}</b></td>
                            <td style="text-align:center;">${r.num_cuota}</td>
                            <td>${r.fecha_vencim_programada ? new Date(r.fecha_vencim_programada).toLocaleDateString('es-CO') : '—'}</td>
                            <td>${r.fecha_pago ? new Date(r.fecha_pago).toLocaleDateString('es-CO') : '—'}</td>
                            <td style="text-align:right; font-weight:500;">
                                ${formatoMoneda.format(Number(r.valor_pagado || 0))}
                            </td>
                            <td><span style="color:${colorEst}; font-weight:600; font-size:12px;">${r.estado_pago}</span></td>
                            <td style="text-align:center; font-weight:700; color:${colorAten};">${r.requiere_atencion}</td>
                        </tr>`;
                });
                break;

            case 'productividad-asesores':
                cabecera.innerHTML = `
                    <tr>
                        <th>Cédula</th><th>Nombres</th><th>Apellidos</th><th>Agencia</th>
                        <th style="text-align:center;">Asoc. atendidos</th>
                        <th style="text-align:center;">Créd. tramitados</th>
                        <th style="text-align:right;">Valor aprobado</th>
                        <th style="text-align:center;">Cuentas abiertas</th>
                    </tr>`;
                datos.forEach(r => {
                    tabla.innerHTML += `
                        <tr>
                            <td><b>${r.cedula_empleado}</b></td>
                            <td>${r.nombres}</td>
                            <td>${r.apellidos}</td>
                            <td>${r.nombre_agencia}</td>
                            <td style="text-align:center;">${r.asociados_atendidos}</td>
                            <td style="text-align:center;">${r.creditos_tramitados}</td>
                            <td style="text-align:right; font-weight:500; color:#1e3a8a;">
                                ${formatoMoneda.format(Number(r.valor_creditos_aprobados || 0))}
                            </td>
                            <td style="text-align:center;">${r.cuentas_abiertas}</td>
                        </tr>`;
                });
                break;

            case 'codeudoria-activa':
                cabecera.innerHTML = `
                    <tr>
                        <th>Radicado</th>
                        <th>Cédula titular</th><th>Titular</th>
                        <th>Cédula garante</th><th>Garante</th>
                        <th style="text-align:right;">Valor aprobado</th>
                        <th>Firma pagaré</th><th>Estado crédito</th>
                    </tr>`;
                datos.forEach(r => {
                    const colorEst = ['AL_DIA','DESEMBOLSADO'].includes(r.estado_credito) ? '#16a34a'
                        : r.estado_credito === 'EN_MORA' ? '#ef4444' : '#3b82f6';
                    tabla.innerHTML += `
                        <tr>
                            <td><b>${r.numero_radicado}</b></td>
                            <td>${r.cedula_titular}</td>
                            <td>${r.titular}</td>
                            <td>${r.cedula_garante}</td>
                            <td>${r.garante}</td>
                            <td style="text-align:right; font-weight:500; color:#16a34a;">
                                ${formatoMoneda.format(Number(r.valor_aprobado || 0))}
                            </td>
                            <td>${r.fecha_firma_pagare ? new Date(r.fecha_firma_pagare).toLocaleDateString('es-CO') : '—'}</td>
                            <td>
                                <span style="color:${colorEst}; font-weight:600; font-size:12px;">
                                    ${r.estado_credito}
                                </span>
                            </td>
                        </tr>`;
                });
                break;
        }

    } catch (error) {
        console.error('Error procesando reporte:', error);
        tabla.innerHTML = `<tr><td colspan="100%" style="text-align:center; padding:20px; color:#ef4444;">
            Falla en la consulta del reporte. Verifica la conexión con el backend.
        </td></tr>`;
    }
}