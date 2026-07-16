/**
 * Módulo activos.js - Gestión de activos
 */

let activosData = [];
let basePath = '';

function detectarBasePathActivos() {
    const path = window.location.pathname;
    if (path.includes('/pages/')) {
        basePath = '../';
    } else {
        basePath = './';
    }
    return basePath;
}

async function cargarActivos() {
    detectarBasePathActivos();
    try {
        const response = await fetch(`${basePath}assets/data/datos.json`);
        const data = await response.json();
        activosData = data.activos || [];
        renderizarActivos(activosData);
    } catch (error) {
        console.error('Error cargando activos:', error);
        mostrarToast('Error cargando activos', 'error');
        // Datos de fallback
        activosData = [
            { id: 'ACT-001', codigo: 'AAPL', nombre: 'Apple Inc.', tipo: 'acción', precio_actual: 175.50, variacion_diaria: 1.25, variacion_semanal: 3.50, variacion_mensual: 8.20, variacion_anual: 25.30, estado: 'activo' },
            { id: 'ACT-002', codigo: 'BTC-USD', nombre: 'Bitcoin', tipo: 'criptomoneda', precio_actual: 68250.00, variacion_diaria: 3.20, variacion_semanal: 8.50, variacion_mensual: 15.30, variacion_anual: 85.40, estado: 'activo' }
        ];
        renderizarActivos(activosData);
    }
}

function renderizarActivos(activos) {
    const container = document.getElementById('listaActivos');
    if (!container) return;

    if (activos.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted py-4">
                <i class="fas fa-info-circle me-2"></i> No hay activos disponibles.
            </div>
        `;
        return;
    }

    container.innerHTML = activos.map(a => `
        <div class="col-md-4 col-lg-3">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <h6 class="fw-bold">${a.codigo}</h6>
                        <span class="badge ${a.tipo === 'acción' ? 'bg-primary' : a.tipo === 'criptomoneda' ? 'bg-success' : 'bg-secondary'}">${a.tipo}</span>
                    </div>
                    <p class="text-muted small">${a.nombre}</p>
                    <p class="fs-5 fw-bold">${formatearMoneda(a.precio_actual)}</p>
                    <p class="${a.variacion_diaria >= 0 ? 'text-success' : 'text-danger'}">
                        ${a.variacion_diaria >= 0 ? '+' : ''}${a.variacion_diaria}%
                    </p>
                    <button class="btn btn-sm btn-outline-primary w-100" onclick="verDetalleActivo('${a.id}')">
                        <i class="fas fa-eye me-1"></i> Ver Detalle
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filtrarActivos(termino) {
    const tipo = document.getElementById('filtroTipo')?.value || '';
    let filtrados = activosData;

    if (termino) {
        const t = termino.toLowerCase();
        filtrados = filtrados.filter(a => 
            a.nombre.toLowerCase().includes(t) || 
            a.codigo.toLowerCase().includes(t)
        );
    }

    if (tipo) {
        filtrados = filtrados.filter(a => a.tipo === tipo);
    }

    renderizarActivos(filtrados);
}

function verDetalleActivo(id) {
    const activo = activosData.find(a => a.id === id);
    if (!activo) { mostrarToast('Activo no encontrado', 'warning'); return; }
    localStorage.setItem('activoDetalle', JSON.stringify(activo));
    window.location.href = 'activo-detalle.html';
}

function comprarActivo() {
    const activo = JSON.parse(localStorage.getItem('activoDetalle'));
    if (activo) {
        localStorage.setItem('activoCompra', JSON.stringify(activo));
        window.location.href = 'comprar-activo.html';
    }
}

// === FUNCIONES PARA ADMIN ===

function renderizarTablaActivosAdmin(activos) {
    const tbody = document.getElementById('tablaActivosAdmin');
    if (!tbody) return;

    if (activos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No hay activos registrados.</td></tr>`;
        return;
    }

    tbody.innerHTML = activos.map(a => `
        <tr>
            <td><strong>${a.codigo}</strong></td>
            <td>${a.nombre}</td>
            <td><span class="badge ${a.tipo === 'acción' ? 'bg-primary' : a.tipo === 'criptomoneda' ? 'bg-success' : 'bg-secondary'}">${a.tipo}</span></td>
            <td>${formatearMoneda(a.precio_actual)}</td>
            <td class="${a.variacion_diaria >= 0 ? 'text-success' : 'text-danger'}">${a.variacion_diaria >= 0 ? '+' : ''}${a.variacion_diaria}%</td>
            <td><span class="badge ${a.estado === 'activo' ? 'bg-success' : 'bg-danger'}">${a.estado}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-secondary" onclick="editarActivoAdmin('${a.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="cambiarEstadoActivoAdmin('${a.id}')" title="Cambiar estado">
                    <i class="fas fa-exchange-alt"></i>
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="actualizarPrecioIndividual('${a.id}')" title="Actualizar precio">
                    <i class="fas fa-dollar-sign"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function cargarActivosAdmin() {
    detectarBasePathActivos();
    try {
        const response = await fetch(`${basePath}assets/data/datos.json`);
        const data = await response.json();
        activosData = data.activos || [];
        renderizarTablaActivosAdmin(activosData);
    } catch (error) {
        console.error('Error cargando activos admin:', error);
        mostrarToast('Error cargando activos', 'error');
    }
}

function editarActivoAdmin(id) {
    const activo = activosData.find(a => a.id === id);
    if (!activo) { mostrarToast('Activo no encontrado', 'warning'); return; }
    localStorage.setItem('activoEditar', JSON.stringify(activo));
    window.location.href = 'admin-activo-editar.html';
}

function cambiarEstadoActivoAdmin(id) {
    const activo = activosData.find(a => a.id === id);
    if (!activo) return;
    const nuevo = activo.estado === 'activo' ? 'inactivo' : 'activo';
    if (confirm(`¿Cambiar estado de ${activo.nombre} a ${nuevo}?`)) {
        activo.estado = nuevo;
        renderizarTablaActivosAdmin(activosData);
        mostrarToast(`Estado actualizado a ${nuevo}`, 'success');
    }
}

function actualizarPrecioIndividual(id) {
    const activo = activosData.find(a => a.id === id);
    if (!activo) return;
    const nuevoPrecio = prompt('Ingrese el nuevo precio:', activo.precio_actual);
    if (nuevoPrecio !== null && !isNaN(nuevoPrecio) && parseFloat(nuevoPrecio) > 0) {
        activo.precio_actual = parseFloat(nuevoPrecio);
        renderizarTablaActivosAdmin(activosData);
        mostrarToast('Precio actualizado', 'success');
    }
}

function actualizarPreciosMasivos() {
    if (confirm('¿Actualizar todos los precios con variación aleatoria (-5% a +5%)?')) {
        activosData.forEach(a => {
            const variacion = (Math.random() * 10) - 5;
            a.precio_actual = parseFloat((a.precio_actual * (1 + variacion / 100)).toFixed(2));
            a.variacion_diaria = parseFloat(variacion.toFixed(2));
        });
        renderizarTablaActivosAdmin(activosData);
        mostrarToast('Precios actualizados masivamente', 'success');
    }
}

// Inicializar según la página
document.addEventListener('DOMContentLoaded', function() {
    detectarBasePathActivos();
    
    if (document.getElementById('listaActivos')) {
        cargarActivos();
    }
    if (document.getElementById('detalleActivo')) {
        cargarDetalleActivo();
    }
    if (document.getElementById('tablaActivosAdmin')) {
        cargarActivosAdmin();
    }
});

// Función para cargar detalle de activo (desde activo-detalle.html)
function cargarDetalleActivo() {
    const data = localStorage.getItem('activoDetalle');
    if (!data) {
        window.location.href = 'activos.html';
        return;
    }
    const a = JSON.parse(data);
    document.getElementById('activoTitulo').textContent = `Detalle: ${a.nombre}`;
    document.getElementById('detalleCodigo').textContent = a.codigo;
    document.getElementById('detalleNombre').textContent = a.nombre;
    document.getElementById('detalleTipo').textContent = a.tipo;
    document.getElementById('detalleEstado').innerHTML = `<span class="badge ${a.estado === 'activo' ? 'bg-success' : 'bg-danger'}">${a.estado}</span>`;
    document.getElementById('detallePrecio').textContent = formatearMoneda(a.precio_actual);
    document.getElementById('detalleVariacionDiaria').innerHTML = `<span class="${a.variacion_diaria >= 0 ? 'text-success' : 'text-danger'}">${a.variacion_diaria >= 0 ? '+' : ''}${a.variacion_diaria}%</span>`;
    document.getElementById('detalleVariacionSemanal').textContent = `${a.variacion_semanal >= 0 ? '+' : ''}${a.variacion_semanal}%`;
    document.getElementById('detalleVariacionMensual').textContent = `${a.variacion_mensual >= 0 ? '+' : ''}${a.variacion_mensual}%`;
    document.getElementById('detalleVariacionAnual').textContent = `${a.variacion_anual >= 0 ? '+' : ''}${a.variacion_anual}%`;
}