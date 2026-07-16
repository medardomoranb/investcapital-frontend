/**
 * Módulo transacciones.js - Compra y venta de activos
 */

let activoCompra = null;
let activoVenta = null;
let portafoliosData = [];

// Cargar datos para compra
function cargarCompra() {
    const data = localStorage.getItem('activoCompra');
    if (!data) {
        window.location.href = 'activos.html';
        return;
    }
    activoCompra = JSON.parse(data);
    document.getElementById('activoSeleccionado').textContent = `${activoCompra.nombre} (${activoCompra.codigo})`;
    document.getElementById('precioActualCompra').textContent = formatearMoneda(activoCompra.precio_actual);

    // Cargar portafolios del usuario
    fetch('../assets/data/datos.json')
        .then(res => res.json())
        .then(data => {
            portafoliosData = data.portafolios || [];
            const select = document.getElementById('portafolioCompra');
            const activos = portafoliosData.filter(p => p.estado === 'activo');
            select.innerHTML = '<option value="">Seleccionar portafolio...</option>' +
                activos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
        });

    // Calcular monto automáticamente
    document.getElementById('cantidadCompra').addEventListener('input', function() {
        const cantidad = parseFloat(this.value) || 0;
        const total = cantidad * (activoCompra?.precio_actual || 0);
        document.getElementById('montoTotalCompra').textContent = formatearMoneda(total);
    });
}

// Manejar compra
function handleComprarActivo(event) {
    event.preventDefault();
    const portafolioId = document.getElementById('portafolioCompra').value;
    const cantidad = parseFloat(document.getElementById('cantidadCompra').value);

    if (!portafolioId) {
        mostrarToast('Seleccione un portafolio', 'error');
        return false;
    }

    if (!cantidad || cantidad <= 0) {
        mostrarToast('Ingrese una cantidad válida', 'error');
        return false;
    }

    const total = cantidad * activoCompra.precio_actual;
    mostrarToast(`Compra de ${cantidad} ${activoCompra.codigo} por ${formatearMoneda(total)} confirmada`, 'success');
    setTimeout(() => window.location.href = 'portafolio-detalle.html', 2000);
    return false;
}

// Cargar datos para venta
function cargarVenta() {
    const data = localStorage.getItem('activoVenta');
    if (!data) {
        window.location.href = 'portafolio-detalle.html';
        return;
    }
    activoVenta = JSON.parse(data);
    document.getElementById('activoVentaSeleccionado').textContent = `${activoVenta.nombre} (${activoVenta.codigo})`;
    document.getElementById('cantidadDisponibleVenta').textContent = activoVenta.cantidad || 0;
    document.getElementById('precioActualVenta').textContent = formatearMoneda(activoVenta.precio_actual);

    document.getElementById('cantidadVenta').addEventListener('input', function() {
        const cantidad = parseFloat(this.value) || 0;
        const total = cantidad * (activoVenta?.precio_actual || 0);
        document.getElementById('montoTotalVenta').textContent = formatearMoneda(total);

        // Validar cantidad disponible
        const disponible = activoVenta.cantidad || 0;
        if (cantidad > disponible) {
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-invalid');
        }
    });
}

// Manejar venta
function handleVenderActivo(event) {
    event.preventDefault();
    const cantidad = parseFloat(document.getElementById('cantidadVenta').value);
    const disponible = activoVenta?.cantidad || 0;

    if (!cantidad || cantidad <= 0) {
        mostrarToast('Ingrese una cantidad válida', 'error');
        return false;
    }

    if (cantidad > disponible) {
        mostrarToast('No tiene suficientes unidades para vender', 'error');
        return false;
    }

    const total = cantidad * activoVenta.precio_actual;
    mostrarToast(`Venta de ${cantidad} ${activoVenta.codigo} por ${formatearMoneda(total)} confirmada`, 'success');
    setTimeout(() => window.location.href = 'portafolio-detalle.html', 2000);
    return false;
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('comprarActivoForm')) {
        cargarCompra();
    }
    if (document.getElementById('venderActivoForm')) {
        cargarVenta();
    }
});