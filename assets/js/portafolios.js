/**
 * Módulo portafolios.js - Gestión de portafolios
 */

let portafoliosData = [];
let activosData = [];

async function cargarPortafolios() {
    try {
        const response = await fetch('../assets/data/datos.json');
        const data = await response.json();
        portafoliosData = data.portafolios || [];
        activosData = data.activos || [];
        renderizarPortafolios(portafoliosData);
    } catch (error) {
        mostrarToast('Error cargando portafolios', 'error');
    }
}

function renderizarPortafolios(portafolios) {
    const container = document.getElementById('listaPortafolios');
    if (!container) return;

    const activos = portafolios.filter(p => p.estado === 'activo');

    if (activos.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="card border-0 shadow-sm">
                    <div class="card-body text-center text-muted py-4">
                        <i class="fas fa-briefcase me-2"></i> No tienes portafolios aún.
                        <a href="portafolio-crear.html" class="btn btn-sm btn-primary ms-2">Crear portafolio</a>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = activos.map(p => `
        <div class="col-md-6 col-lg-4">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <h5 class="fw-bold">${p.nombre}</h5>
                        <span class="badge ${p.estado === 'activo' ? 'bg-success' : 'bg-secondary'}">${p.estado}</span>
                    </div>
                    <p class="text-muted small">${p.descripcion || 'Sin descripción'}</p>
                    <hr />
                    <div class="d-flex justify-content-between">
                        <span class="text-muted">Valor:</span>
                        <span class="fw-bold">${formatearMoneda(p.valor_actual_total || 0)}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span class="text-muted">Rendimiento:</span>
                        <span class="${(p.rendimiento_porcentual || 0) >= 0 ? 'text-success' : 'text-danger'} fw-bold">
                            ${(p.rendimiento_porcentual || 0) >= 0 ? '+' : ''}${(p.rendimiento_porcentual || 0).toFixed(2)}%
                        </span>
                    </div>
                    <div class="mt-3 d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary" onclick="verDetallePortafolio('${p.id}')">
                            <i class="fas fa-eye me-1"></i> Ver
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="editarPortafolio('${p.id}')">
                            <i class="fas fa-edit me-1"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="archivarPortafolio('${p.id}')">
                            <i class="fas fa-archive me-1"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function verDetallePortafolio(id) {
    const p = portafoliosData.find(p => p.id === id);
    if (!p) { mostrarToast('Portafolio no encontrado', 'warning'); return; }
    localStorage.setItem('portafolioDetalle', JSON.stringify(p));
    window.location.href = 'portafolio-detalle.html';
}

function editarPortafolio(id) {
    const p = portafoliosData.find(p => p.id === id);
    if (!p) { mostrarToast('Portafolio no encontrado', 'warning'); return; }
    const nuevoNombre = prompt('Nuevo nombre:', p.nombre);
    if (nuevoNombre && nuevoNombre.trim()) {
        p.nombre = nuevoNombre.trim();
        renderizarPortafolios(portafoliosData);
        mostrarToast('Portafolio actualizado', 'success');
    }
}

function archivarPortafolio(id) {
    const p = portafoliosData.find(p => p.id === id);
    if (!p) return;
    if (confirm(`¿Archivar portafolio "${p.nombre}"?`)) {
        p.estado = 'archivado';
        renderizarPortafolios(portafoliosData);
        mostrarToast('Portafolio archivado', 'success');
    }
}

function handleCrearPortafolio(event) {
    event.preventDefault();
    const nombre = document.getElementById('nombrePortafolio').value.trim();
    const descripcion = document.getElementById('descripcionPortafolio').value.trim();

    if (!nombre) {
        mostrarToast('El nombre es obligatorio', 'error');
        return false;
    }

    const nuevo = {
        id: `POR-${String(portafoliosData.length + 1).padStart(3, '0')}`,
        cliente_id: 'CLI-001',
        nombre: nombre,
        descripcion: descripcion || '',
        estado: 'activo',
        fecha_creacion: new Date().toISOString(),
        valor_total_invertido: 0,
        valor_actual_total: 0,
        rendimiento_porcentual: 0
    };

    portafoliosData.push(nuevo);
    mostrarToast('Portafolio creado exitosamente', 'success');
    setTimeout(() => window.location.href = 'portafolios.html', 1500);
    return false;
}

// Cargar detalle de portafolio
function cargarDetallePortafolio() {
    const data = localStorage.getItem('portafolioDetalle');
    if (!data) {
        window.location.href = 'portafolios.html';
        return;
    }
    const p = JSON.parse(data);
    document.getElementById('portafolioTitulo').textContent = `Detalle: ${p.nombre}`;
    document.getElementById('detalleNombrePortafolio').textContent = p.nombre;
    document.getElementById('detalleDescripcionPortafolio').textContent = p.descripcion || 'Sin descripción';
    document.getElementById('detalleValorTotal').textContent = formatearMoneda(p.valor_actual_total || 0);
    document.getElementById('detalleRendimiento').innerHTML = `
        <span class="${(p.rendimiento_porcentual || 0) >= 0 ? 'text-success' : 'text-danger'}">
            ${(p.rendimiento_porcentual || 0) >= 0 ? '+' : ''}${(p.rendimiento_porcentual || 0).toFixed(2)}%
        </span>
    `;

    // Simular activos en portafolio
    const tbody = document.getElementById('cuerpoActivosPortafolio');
    if (tbody) {
        const activosMock = [
            { nombre: 'Apple Inc.', codigo: 'AAPL', cantidad: 10, precio_compra: 168.50, precio_actual: 175.50 },
            { nombre: 'Bitcoin', codigo: 'BTC-USD', cantidad: 0.05, precio_compra: 67000, precio_actual: 68250 }
        ];
        tbody.innerHTML = activosMock.map(a => {
            const rend = (a.precio_actual - a.precio_compra) * a.cantidad;
            const rendPct = ((a.precio_actual / a.precio_compra) - 1) * 100;
            return `
                <tr>
                    <td><strong>${a.nombre}</strong> <span class="text-muted small">(${a.codigo})</span></td>
                    <td>${a.cantidad}</td>
                    <td>${formatearMoneda(a.precio_compra)}</td>
                    <td>${formatearMoneda(a.precio_actual)}</td>
                    <td class="${rend >= 0 ? 'text-success' : 'text-danger'}">${rend >= 0 ? '+' : ''}${formatearMoneda(rend)}</td>
                    <td class="${rendPct >= 0 ? 'text-success' : 'text-danger'}">${rendPct >= 0 ? '+' : ''}${rendPct.toFixed(2)}%</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="window.location.href='vender-activo.html'">
                            <i class="fas fa-minus-circle me-1"></i> Vender
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Simular transacciones
    const tbodyTrans = document.getElementById('cuerpoTransacciones');
    if (tbodyTrans) {
        const transaccionesMock = [
            { fecha: '2026-06-01T10:30:00Z', activo: 'AAPL', tipo: 'compra', cantidad: 10, precio: 168.50, total: 1685.00 },
            { fecha: '2026-06-03T14:20:00Z', activo: 'BTC-USD', tipo: 'compra', cantidad: 0.05, precio: 67000.00, total: 3350.00 }
        ];
        tbodyTrans.innerHTML = transaccionesMock.map(t => `
            <tr>
                <td>${new Date(t.fecha).toLocaleString()}</td>
                <td>${t.activo}</td>
                <td><span class="badge ${t.tipo === 'compra' ? 'bg-success' : 'bg-danger'}">${t.tipo}</span></td>
                <td>${t.cantidad}</td>
                <td>${formatearMoneda(t.precio)}</td>
                <td>${formatearMoneda(t.total)}</td>
                <td><span class="badge bg-success">Completada</span></td>
            </tr>
        `).join('');
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('listaPortafolios')) {
        cargarPortafolios();
    }
    if (document.getElementById('portafolioTitulo')) {
        cargarDetallePortafolio();
    }
});