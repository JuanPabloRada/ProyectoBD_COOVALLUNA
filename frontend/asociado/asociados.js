document.addEventListener('DOMContentLoaded', () => {
    const nombreAsoc = sessionStorage.getItem('coovalluna_nombre') || 'Asociado';
    const cedulaAsoc = sessionStorage.getItem('coovalluna_cedula') || '9999';

    document.getElementById('perfilAsociado').textContent = `C.C. ${cedulaAsoc}`;
    document.getElementById('saludoAsociado').innerHTML = `<h2>¡Hola, ${nombreAsoc}!</h2>`;

    cargarCuentasDelAsociado(cedulaAsoc);
    cargarCreditosDelAsociado(cedulaAsoc);

    // ── Cerrar modal extracto ──────────────────────────────────────────────────
    document.getElementById('cerrarModalExtracto').onclick = () => {
        document.getElementById('modalExtracto').style.display = 'none';
    };

    // ── Abrir modal transferencia ─────────────────────────────────────────────
    document.getElementById('btnMenuTransferencia').addEventListener('click', (e) => {
        e.preventDefault();
        abrirModalTransferencia();
    });

    // ── Cerrar modal transferencia ────────────────────────────────────────────
    document.getElementById('cerrarModalTrans').onclick = () => {
        document.getElementById('modalTransferencia').style.display = 'none';
    };

    // ── Submit del formulario de transferencia ────────────────────────────────
    document.getElementById('formTransferirDinero').addEventListener('submit', async (e) => {
        e.preventDefault();
        await ejecutarTransferencia();
    });

    // ── Cerrar modales al hacer clic fuera del contenido ─────────────────────
    window.addEventListener('click', (e) => {
        const modalExt  = document.getElementById('modalExtracto');
        const modalTrans = document.getElementById('modalTransferencia');
        if (e.target === modalExt)  modalExt.style.display  = 'none';
        if (e.target === modalTrans) modalTrans.style.display = 'none';
    });

    // ── Cierre de sesión ──────────────────────────────────────────────────────
    document.getElementById('btnCerrarSesionAsoc').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '../index.html';
    });
});

// ─── Formato de moneda colombiana ────────────────────────────────────────────
const formatoMoneda = new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
});

// ─── Variable global para almacenar las cuentas del asociado en sesión ───────
// Se usa al poblar el <select> del formulario de transferencia
let cuentasEnSesion = [];


// ═══════════════════════════════════════════════════════════════════════════════
//  SECCIÓN 1 — CARGA INICIAL DE PRODUCTOS
// ═══════════════════════════════════════════════════════════════════════════════

async function cargarCuentasDelAsociado(cedula) {
    const tbody = document.getElementById('misCuentasAhorro');
    try {
        const res = await fetch('http://localhost:3000/api/cuentas');
        const todasLasCuentas = await res.json();

        cuentasEnSesion = todasLasCuentas.filter(c => c.cedula_asociado === cedula);

        tbody.innerHTML = '';
        if (cuentasEnSesion.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:15px; color:#94a3b8;">No registras cuentas de ahorro activas.</td></tr>`;
            return;
        }

        cuentasEnSesion.forEach(cta => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><b>${cta.numero_cuenta}</b></td>
                <td>${new Date(cta.fecha_apertura).toLocaleDateString('es-CO')}</td>
                <td><span style="color:#22c55e; font-weight:bold;">${cta.estado}</span></td>
                <td>
                    <button onclick="abrirExtracto('${cta.numero_cuenta}')"
                        style="background:#047857; color:white; border:none; padding:6px 12px;
                               border-radius:4px; cursor:pointer; font-size:12px; font-weight:500;">
                        Ver Extracto
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Falla de conexión al cargar cuentas.</td></tr>`;
    }
}

async function cargarCreditosDelAsociado(cedula) {
    const tbody = document.getElementById('misCreditosAsoc');
    try {
        const res = await fetch('http://localhost:3000/api/creditos');
        const todosLosCreditos = await res.json();

        const misCreditos = todosLosCreditos.filter(c => c.cedula_asociado === cedula);

        tbody.innerHTML = '';
        if (misCreditos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:15px; color:#94a3b8;">No registras solicitudes de crédito vigentes.</td></tr>`;
            return;
        }

        misCreditos.forEach(cred => {
            const tr = document.createElement('tr');
            const monto = Number(cred.valor_solicitado || 0);
            const estadoActual = cred.estado_credito || 'EN_ESTUDIO';

            let colorEst = '#3b82f6';
            if (['AL_DIA', 'DESEMBOLSADO'].includes(estadoActual)) colorEst = '#22c55e';
            if (['MORA', 'VENCIDO'].includes(estadoActual))         colorEst = '#ef4444';

            tr.innerHTML = `
                <td><b>${cred.numero_radicado}</b></td>
                <td>${(cred.linea_credito || '').replace(/_/g, ' ')}</td>
                <td><span style="font-weight:500;">${formatoMoneda.format(monto)}</span></td>
                <td>
                    <span style="background:${colorEst}15; color:${colorEst};
                                 padding:4px 8px; border-radius:4px;
                                 font-size:12px; font-weight:bold;">
                        ${estadoActual}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Falla de conexión al cargar créditos.</td></tr>`;
    }
}


// ═══════════════════════════════════════════════════════════════════════════════
//  SECCIÓN 2 — MODAL EXTRACTO BANCARIO
// ═══════════════════════════════════════════════════════════════════════════════

async function abrirExtracto(numeroCuenta) {
    const modal      = document.getElementById('modalExtracto');
    const titulo     = document.getElementById('tituloModalExtracto');
    const saldoTxt   = document.getElementById('saldoModalExtracto');
    const tbodyMovs  = document.getElementById('tablaMovimientosExtracto');

    titulo.textContent    = `Extracto — Cuenta N° ${numeroCuenta}`;
    saldoTxt.textContent  = 'Consultando saldo...';
    tbodyMovs.innerHTML   = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#64748b;">Cargando movimientos...</td></tr>`;
    modal.style.display   = 'flex';

    try {
        // Consultas en paralelo: saldo actual + lista de movimientos
        const [resSaldo, resMovs] = await Promise.all([
            fetch(`http://localhost:3000/api/cuentas/${numeroCuenta}/saldo`),
            fetch(`http://localhost:3000/api/reportes/extracto-cuenta/${numeroCuenta}`)
        ]);

        // ── Saldo ─────────────────────────────────────────────────────────────
        if (resSaldo.ok) {
            const dataSaldo = await resSaldo.json();
            saldoTxt.textContent = `Saldo Disponible: ${formatoMoneda.format(dataSaldo.saldo || 0)}`;
        } else {
            saldoTxt.textContent = 'Saldo no disponible';
        }

        // ── Movimientos ───────────────────────────────────────────────────────
        if (!resMovs.ok) throw new Error(`HTTP ${resMovs.status}`);
        const movimientos = await resMovs.json();

        tbodyMovs.innerHTML = '';

        if (!movimientos || movimientos.length === 0) {
            tbodyMovs.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding:20px; color:#94a3b8;">
                        Esta cuenta no registra movimientos en el sistema.
                    </td>
                </tr>`;
            return;
        }

        movimientos.forEach(m => {
            const tipo = String(m.tipo_movimiento || m.tipo || '').toUpperCase();

            // Color financiero: verde = entrada, rojo = salida
            let colorMonto = '#0f172a';
            const esEntrada = ['DEPOSITO', 'CONSIGNACION', 'TRANSFERENCIA_ENTRANTE'].some(t => tipo.includes(t));
            const esSalida  = ['RETIRO', 'TRANSFERENCIA_SALIENTE', 'TRANSFERENCIA'].some(t => tipo.includes(t));
            if (esEntrada) colorMonto = '#16a34a';
            if (esSalida)  colorMonto = '#dc2626';

            const prefijo     = esEntrada ? '+' : (esSalida ? '-' : '');
            const codigo      = m.codigo_movimiento || m.codigo   || '—';
            const canal       = m.canal                            || 'Ventanilla';
            const fechaMov    = m.fecha_movimiento  || m.fecha     || null;
            const montoValor  = Number(m.monto      || m.valor     || 0);
            const fechaFmt    = fechaMov
                ? new Date(fechaMov).toLocaleDateString('es-CO')
                : '—';

            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #f1f5f9';
            tr.innerHTML = `
                <td style="padding:10px; font-size:13px;">${codigo}</td>
                <td style="padding:10px;">
                    <span style="font-size:12px; font-weight:600; color:#475569;">${tipo}</span>
                </td>
                <td style="padding:10px; font-size:13px;">${canal}</td>
                <td style="padding:10px; font-size:13px;">${fechaFmt}</td>
                <td style="padding:10px; text-align:right; font-weight:600; color:${colorMonto};">
                    ${prefijo}${formatoMoneda.format(montoValor)}
                </td>
            `;
            tbodyMovs.appendChild(tr);
        });

    } catch (error) {
        console.error('Error cargando extracto:', error);
        tbodyMovs.innerHTML = `
            <tr>
                <td colspan="5" style="color:red; text-align:center; padding:20px;">
                    Error al conectar con la base de datos de movimientos.
                </td>
            </tr>`;
    }
}


// ═══════════════════════════════════════════════════════════════════════════════
//  SECCIÓN 3 — MODAL TRANSFERENCIAS
// ═══════════════════════════════════════════════════════════════════════════════

function abrirModalTransferencia() {
    const modal  = document.getElementById('modalTransferencia');
    const select = document.getElementById('selectCuentaOrigen');

    // Poblar el <select> con las cuentas activas del asociado en sesión
    select.innerHTML = '';
    const cuentasActivas = cuentasEnSesion.filter(c => c.estado === 'ACTIVA');

    if (cuentasActivas.length === 0) {
        select.innerHTML = '<option disabled selected>No tienes cuentas activas</option>';
    } else {
        cuentasActivas.forEach(cta => {
            const opt = document.createElement('option');
            opt.value       = cta.numero_cuenta;
            opt.textContent = `${cta.numero_cuenta} — ${cta.estado}`;
            select.appendChild(opt);
        });
    }

    // Limpiar campos del formulario antes de abrir
    document.getElementById('cuenta_destino').value   = '';
    document.getElementById('monto_transferir').value  = '';
    document.getElementById('canal_transferencia').value = 'APP_MOVIL';
    limpiarMensajeTransferencia();

    modal.style.display = 'flex';
}

async function ejecutarTransferencia() {
    const numeroCuentaOrigen = document.getElementById('selectCuentaOrigen').value;
    const cuentaDestino      = document.getElementById('cuenta_destino').value.trim();
    const montoIngresado     = Number(document.getElementById('monto_transferir').value);
    const canal              = document.getElementById('canal_transferencia').value;
    const btnSubmit          = document.querySelector('#formTransferirDinero button[type="submit"]');

    limpiarMensajeTransferencia();

    // ── Validación 1: monto mínimo ────────────────────────────────────────────
    if (montoIngresado < 1000) {
        mostrarMensajeTransferencia('El monto mínimo para transferir es $1.000.', 'error');
        return;
    }

    // ── Validación 2: cuenta destino ≠ cuenta origen ──────────────────────────
    if (cuentaDestino === numeroCuentaOrigen) {
        mostrarMensajeTransferencia('La cuenta de destino no puede ser la misma que la de origen.', 'error');
        return;
    }

    // ── Validación 3: saldo suficiente (consulta al backend) ──────────────────
    try {
        mostrarMensajeTransferencia('Validando saldo disponible...', 'info');
        const resSaldo = await fetch(`http://localhost:3000/api/cuentas/${numeroCuentaOrigen}/saldo`);

        if (!resSaldo.ok) throw new Error('No se pudo consultar el saldo de la cuenta origen.');

        const dataSaldo  = await resSaldo.json();
        const saldoActual = Number(dataSaldo.saldo || 0);

        if (montoIngresado > saldoActual) {
            mostrarMensajeTransferencia(
                `Saldo insuficiente. Tu saldo disponible es ${formatoMoneda.format(saldoActual)}.`,
                'error'
            );
            return;
        }
    } catch (err) {
        mostrarMensajeTransferencia(`Error al validar saldo: ${err.message}`, 'error');
        return;
    }

    // ── Envío al backend ──────────────────────────────────────────────────────
    btnSubmit.disabled       = true;
    btnSubmit.textContent    = 'Procesando...';
    limpiarMensajeTransferencia();

    try {
        const res = await fetch('http://localhost:3000/api/cuentas/transferencia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                numero_cuenta_origen:  numeroCuentaOrigen,
                numero_cuenta_destino: cuentaDestino,
                monto:                 montoIngresado,
                canal:                 canal
            })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            mostrarMensajeTransferencia(
                `✓ Transferencia exitosa por ${formatoMoneda.format(montoIngresado)} a la cuenta ${cuentaDestino}.`,
                'exito'
            );
            // Recargar las cuentas para reflejar el nuevo saldo
            const cedulaAsoc = sessionStorage.getItem('coovalluna_cedula') || '9999';
            await cargarCuentasDelAsociado(cedulaAsoc);

        } else {
            mostrarMensajeTransferencia(
                data.message || 'El servidor rechazó la transferencia. Intenta de nuevo.',
                'error'
            );
        }

    } catch (err) {
        console.error('Error al procesar transferencia:', err);
        mostrarMensajeTransferencia('Error de conexión con el servidor. Verifica tu red.', 'error');
    } finally {
        btnSubmit.disabled    = false;
        btnSubmit.textContent = 'Confirmar y Enviar Dinero';
    }
}

// ── Helpers de mensajes en el modal ──────────────────────────────────────────
function mostrarMensajeTransferencia(texto, tipo) {
    let el = document.getElementById('mensajeTransferencia');

    if (!el) {
        el = document.createElement('p');
        el.id = 'mensajeTransferencia';
        el.style.cssText = 'margin-top: 8px; padding: 10px 14px; border-radius: 6px; font-size: 14px; font-weight: 500;';
        document.getElementById('formTransferirDinero').appendChild(el);
    }

    const estilos = {
        error: { bg: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
        exito: { bg: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
        info:  { bg: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }
    };
    const s = estilos[tipo] || estilos.info;

    el.style.background  = s.bg;
    el.style.color       = s.color;
    el.style.border      = s.border;
    el.textContent       = texto;
    el.style.display     = 'block';
}

function limpiarMensajeTransferencia() {
    const el = document.getElementById('mensajeTransferencia');
    if (el) el.style.display = 'none';
}