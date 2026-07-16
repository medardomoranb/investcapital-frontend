/**
 * Utilidades - Funciones comunes
 */

// Mostrar notificación (toast)
function mostrarToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.log(`${tipo.toUpperCase()}: ${mensaje}`);
        return;
    }

    const colores = {
        success: 'bg-success',
        error: 'bg-danger',
        warning: 'bg-warning text-dark',
        info: 'bg-info text-dark'
    };

    const iconos = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white ${colores[tipo] || 'bg-secondary'} border-0 show`;
    toast.role = 'alert';
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas ${iconos[tipo] || 'fa-info-circle'} me-2"></i>
                ${mensaje}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }
    }, 5000);
}

// Formatear moneda
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(valor);
}

// Formatear porcentaje
function formatearPorcentaje(valor) {
    return new Intl.NumberFormat('es-EC', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor / 100);
}

// Generar ID único
function generarId(prefix = '') {
    return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
}

// Capitalizar texto
function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}