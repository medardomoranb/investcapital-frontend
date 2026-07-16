/**
 * Dashboard - Resumen de inversiones
 */

async function cargarDashboard() {
    try {
        const response = await fetch('../assets/data/datos.json');
        const data = await response.json();

        const portafolios = data.portafolios || [];
        const transacciones = data.transacciones || [];
        const activos = data.activos || [];

        // Calcular valores
        let valorInvertido = 0;
        let valorActual = 0;

        portafolios.forEach(p => {
            valorInvertido += p.valor_total_invertido || 0;
            valorActual += p.valor_actual_total || 0;
        });

        const ganancia = valorActual - valorInvertido;
        const porcentaje = valorInvertido > 0 ? (ganancia / valorInvertido) * 100 : 0;

        // Actualizar resumen
        document.getElementById('valorInvertido').textContent = formatearMoneda(valorInvertido);
        document.getElementById('valorActual').textContent = formatearMoneda(valorActual);
        const gananciaEl = document.getElementById('gananciaPerdida');
        gananciaEl.textContent = formatearMoneda(ganancia);
        gananciaEl.className = `fw-bold ${ganancia >= 0 ? 'text-success' : 'text-danger'}`;
        document.getElementById('totalPortafolios').textContent = portafolios.filter(p => p.estado === 'activo').length;

        // Activos destacados
        const destacados = activos.slice(0, 3);
        const lista = document.getElementById('activosDestacados');
        if (lista) {
            lista.innerHTML = destacados.map(a => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>${a.codigo} - ${a.nombre}</span>
                    <span class="badge ${a.variacion_diaria >= 0 ? 'bg-success' : 'bg-danger'}">
                        ${a.variacion_diaria >= 0 ? '+' : ''}${a.variacion_diaria}%
                    </span>
                </li>
            `).join('') || '<li class="list-group-item text-muted">No hay activos destacados</li>';
        }

        // Portafolios
        const portafoliosLista = document.getElementById('portafoliosLista');
        if (portafoliosLista) {
            if (portafolios.length === 0) {
                portafoliosLista.innerHTML = `
                    <div class="col-12">
                        <div class="card border-0 shadow-sm">
                            <div class="card-body text-muted text-center py-4">
                                <i class="fas fa-briefcase me-2"></i> No tienes portafolios aún.
                                <a href="portafolio-crear.html" class="btn btn-sm btn-primary ms-2">Crear portafolio</a>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }

            portafoliosLista.innerHTML = portafolios.filter(p => p.estado === 'activo').slice(0, 4).map(p => `
                <div class="col-md-6">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <h5 class="fw-bold">${p.nombre}</h5>
                            <p class="text-muted small">${p.descripcion || 'Sin descripción'}</p>
                            <div class="d-flex justify-content-between">
                                <span>Valor: ${formatearMoneda(p.valor_actual_total || 0)}</span>
                                <span class="${(p.rendimiento_porcentual || 0) >= 0 ? 'text-success' : 'text-danger'} fw-bold">
                                    ${(p.rendimiento_porcentual || 0) >= 0 ? '+' : ''}${(p.rendimiento_porcentual || 0).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

    } catch (error) {
        mostrarToast('Error cargando dashboard', 'error');
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.container-fluid.px-4.py-4')) {
        cargarDashboard();
    }
});