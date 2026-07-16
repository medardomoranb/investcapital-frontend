/**
 * Módulo reportes.js - Gestión de reportes
 */

let reportesData = [];

async function cargarReportes() {
    try {
        const response = await fetch('../assets/data/datos.json');
        const data = await response.json();
        reportesData = data.reportes || [];
        renderizarReportes(reportesData);
    } catch (error) {
        mostrarToast('Error cargando reportes', 'error');
    }
}

function renderizarReportes(reportes) {
    const container = document.getElementById('listaReportes');
    if (!container) return;

    const publicados = reportes.filter(r => r.estado === 'publicado');

    if (publicados.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted py-4">
                <i class="fas fa-info-circle me-2"></i> No hay reportes publicados.
            </div>
        `;
        return;
    }

    container.innerHTML = publicados.map(r => `
        <div class="col-md-6 col-lg-4">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <h5 class="fw-bold">${r.titulo}</h5>
                        <span class="badge bg-info">${r.categoria}</span>
                    </div>
                    <p class="text-muted small">${r.resumen || 'Sin resumen'}</p>
                    <hr />
                    <div class="d-flex justify-content-between text-muted small">
                        <span><i class="fas fa-user me-1"></i> ${r.autor}</span>
                        <span><i class="fas fa-calendar me-1"></i> ${new Date(r.fecha_publicacion).toLocaleDateString()}</span>
                        <span><i class="fas fa-eye me-1"></i> ${r.visualizaciones || 0}</span>
                    </div>
                    <button class="btn btn-sm btn-primary w-100 mt-2" onclick="verDetalleReporte('${r.id}')">
                        <i class="fas fa-eye me-1"></i> Ver Reporte
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filtrarReportes(termino) {
    const categoria = document.getElementById('filtroCategoriaReporte')?.value || '';
    let filtrados = reportesData.filter(r => r.estado === 'publicado');

    if (termino) {
        const t = termino.toLowerCase();
        filtrados = filtrados.filter(r => r.titulo.toLowerCase().includes(t) || r.contenido?.toLowerCase().includes(t));
    }

    if (categoria) {
        filtrados = filtrados.filter(r => r.categoria === categoria);
    }

    renderizarReportes(filtrados);
}

function verDetalleReporte(id) {
    const r = reportesData.find(r => r.id === id);
    if (!r) { mostrarToast('Reporte no encontrado', 'warning'); return; }
    localStorage.setItem('reporteDetalle', JSON.stringify(r));
    window.location.href = 'reporte-detalle.html';
}

function cargarDetalleReporte() {
    const data = localStorage.getItem('reporteDetalle');
    if (!data) {
        window.location.href = 'reportes.html';
        return;
    }
    const r = JSON.parse(data);
    document.getElementById('reporteTitulo').textContent = `Detalle: ${r.titulo}`;
    document.getElementById('reporteDetalleTitulo').textContent = r.titulo;
    document.getElementById('reporteDetalleCategoria').textContent = r.categoria;
    document.getElementById('reporteDetalleAutor').textContent = r.autor;
    document.getElementById('reporteDetalleFecha').textContent = new Date(r.fecha_publicacion).toLocaleDateString();
    document.getElementById('reporteDetalleVisualizaciones').textContent = r.visualizaciones || 0;
    document.getElementById('reporteDetalleResumen').textContent = r.resumen || 'Sin resumen';
    document.getElementById('reporteDetalleContenido').textContent = r.contenido || 'Sin contenido disponible.';

    // Activos relacionados
    fetch('../assets/data/datos.json')
        .then(res => res.json())
        .then(data => {
            const activos = data.activos || [];
            const relacionados = activos.filter(a => r.activos_relacionados?.includes(a.id));
            const container = document.getElementById('reporteActivosRelacionados');
            if (relacionados.length === 0) {
                container.innerHTML = '<p class="text-muted">No hay activos relacionados.</p>';
            } else {
                container.innerHTML = relacionados.map(a => `
                    <span class="badge bg-secondary me-1">${a.codigo} - ${a.nombre}</span>
                `).join(' ');
            }
        });
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('listaReportes')) {
        cargarReportes();
    }
    if (document.getElementById('detalleReporte')) {
        cargarDetalleReporte();
    }
});