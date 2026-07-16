/**
 * CRUD de Clientes
 */

let clientesData = [];
let currentPage = 1;
const itemsPerPage = 10;

// Cargar clientes desde datos simulados
async function cargarClientes() {
    try {
        const response = await fetch('../assets/data/datos.json');
        const data = await response.json();
        clientesData = data.clientes || [];
        renderizarTablaClientes(clientesData, currentPage);
    } catch (error) {
        mostrarToast('Error cargando clientes', 'error');
        clientesData = obtenerClientesFallback();
        renderizarTablaClientes(clientesData, currentPage);
    }
}

// Renderizar tabla de clientes
function renderizarTablaClientes(clientes, page = 1) {
    const tbody = document.getElementById('tablaClientes');
    const paginacion = document.getElementById('paginacionClientes');
    if (!tbody) return;

    const searchTerm = document.getElementById('buscarCliente')?.value?.toLowerCase() || '';
    let filtered = clientes;
    if (searchTerm) {
        filtered = clientes.filter(c =>
            c.nombres.toLowerCase().includes(searchTerm) ||
            c.apellidos.toLowerCase().includes(searchTerm) ||
            c.identificacion.includes(searchTerm)
        );
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (page - 1) * itemsPerPage;
    const pageItems = filtered.slice(startIndex, startIndex + itemsPerPage);

    if (totalItems === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-4">
            <i class="fas fa-info-circle me-2"></i> No hay clientes registrados.
        </td></tr>`;
        if (paginacion) paginacion.innerHTML = '';
        return;
    }

    tbody.innerHTML = pageItems.map(c => `
        <tr>
            <td><span class="badge bg-secondary">${c.id}</span></td>
            <td><strong>${c.nombres}</strong></td>
            <td>${c.apellidos}</td>
            <td>${c.identificacion}</td>
            <td>${c.telefono || '-'}</td>
            <td>${c.celular}</td>
            <td>${c.correo}</td>
            <td><span class="badge bg-info">${c.estadoCivil}</span></td>
            <td><span class="badge ${c.estado === 'activo' ? 'bg-success' : 'bg-danger'}">${c.estado}</span></td>
            <td>
                <button class="btn btn-outline-primary btn-sm" onclick="verDetalle('${c.id}')"><i class="fas fa-eye"></i></button>
                <button class="btn btn-outline-secondary btn-sm" onclick="editarCliente('${c.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-outline-warning btn-sm" onclick="cambiarEstado('${c.id}')"><i class="fas fa-exchange-alt"></i></button>
            </td>
        </tr>
    `).join('');

    if (paginacion) {
        paginacion.innerHTML = `
            <nav><ul class="pagination pagination-sm justify-content-center">
                <li class="page-item ${page <= 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="cambiarPagina(${page - 1})">Anterior</a>
                </li>
                ${Array.from({length: totalPages}, (_, i) => i + 1).map(p => `
                    <li class="page-item ${p === page ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="cambiarPagina(${p})">${p}</a>
                    </li>
                `).join('')}
                <li class="page-item ${page >= totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="cambiarPagina(${page + 1})">Siguiente</a>
                </li>
            </ul></nav>
        `;
    }
}

function cambiarPagina(page) {
    currentPage = page;
    renderizarTablaClientes(clientesData, page);
}

function filtrarClientes(termino) {
    renderizarTablaClientes(clientesData, 1);
}

function verDetalle(id) {
    const cliente = clientesData.find(c => c.id === id);
    if (!cliente) { mostrarToast('Cliente no encontrado', 'warning'); return; }
    localStorage.setItem('clienteDetalle', JSON.stringify(cliente));
    window.location.href = 'admin-cliente-detalle.html';
}

function editarCliente(id) {
    const cliente = clientesData.find(c => c.id === id);
    if (!cliente) { mostrarToast('Cliente no encontrado', 'warning'); return; }
    localStorage.setItem('clienteEditar', JSON.stringify(cliente));
    window.location.href = 'admin-cliente-editar.html';
}

function cambiarEstado(id) {
    const cliente = clientesData.find(c => c.id === id);
    if (!cliente) return;
    const nuevo = cliente.estado === 'activo' ? 'inactivo' : 'activo';
    if (confirm(`¿Cambiar estado de ${cliente.nombres} a ${nuevo}?`)) {
        cliente.estado = nuevo;
        renderizarTablaClientes(clientesData, currentPage);
        mostrarToast(`Estado actualizado a ${nuevo}`, 'success');
        guardarCambiosLocal();
    }
}

// Registrar cliente
function handleRegistro(event) {
    event.preventDefault();

    const nombres = document.getElementById('nombres').value.trim();
    const apellidos = document.getElementById('apellidos').value.trim();
    const identificacion = document.getElementById('identificacion').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const celular = document.getElementById('celular').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const estadoCivil = document.getElementById('estadoCivil').value;
    const estado = document.getElementById('estado').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!nombres || !apellidos || !identificacion || !celular || !correo || !estadoCivil || !estado) {
        mostrarToast('Complete todos los campos obligatorios', 'error');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        mostrarToast('Correo no válido', 'error');
        return false;
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
        mostrarToast('Contraseña: mínimo 8 caracteres, mayúscula, minúscula y número', 'error');
        return false;
    }

    if (password !== confirmPassword) {
        mostrarToast('Las contraseñas no coinciden', 'error');
        return false;
    }

    if (clientesData.some(c => c.identificacion === identificacion)) {
        mostrarToast('Identificación ya registrada', 'error');
        return false;
    }

    if (clientesData.some(c => c.correo === correo)) {
        mostrarToast('Correo ya registrado', 'error');
        return false;
    }

    const nuevo = {
        id: `CLI-${String(clientesData.length + 1).padStart(3, '0')}`,
        nombres, apellidos, identificacion, telefono, celular, correo,
        direccion: direccion || '', estadoCivil, estado,
        fecha_registro: new Date().toISOString(),
        password
    };

    clientesData.push(nuevo);
    guardarCambiosLocal();
    mostrarToast(`Cliente ${nombres} registrado exitosamente`, 'success');

    setTimeout(() => window.location.href = 'login.html', 2000);
    return false;
}

function guardarCambiosLocal() {
    localStorage.setItem('clientesData', JSON.stringify(clientesData));
}

function obtenerClientesFallback() {
    return [
        { id: 'CLI-001', nombres: 'Ana', apellidos: 'Martínez', identificacion: '1234567890', telefono: '022345678', celular: '0987654321', correo: 'ana@email.com', direccion: '', estadoCivil: 'soltero', estado: 'activo', fecha_registro: new Date().toISOString() },
        { id: 'CLI-002', nombres: 'Carlos', apellidos: 'Gómez', identificacion: '2345678901', telefono: '', celular: '0998765432', correo: 'carlos@email.com', direccion: '', estadoCivil: 'casado', estado: 'activo', fecha_registro: new Date().toISOString() }
    ];
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('tablaClientes')) {
        cargarClientes();
    }
});