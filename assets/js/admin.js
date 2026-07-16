/**
 * Módulo admin.js - Panel de administración
 */

async function cargarEstadisticasAdmin() {
    try {
        const response = await fetch('../assets/data/datos.json');
        const data = await response.json();

        const clientes = data.clientes || [];
        const portafolios = data.portafolios || [];
        const transacciones = data.transacciones || [];

        document.getElementById('totalClientes').textContent = clientes.length;
        document.getElementById('clientesActivos').textContent = clientes.filter(c => c.estado === 'activo').length;
        document.getElementById('totalPortafoliosAdmin').textContent = portafolios.length;
        document.getElementById('totalTransaccionesAdmin').textContent = transacciones.length;
    } catch (error) {
        mostrarToast('Error cargando estadísticas', 'error');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('estadisticasAdmin')) {
        cargarEstadisticasAdmin();
    }
});