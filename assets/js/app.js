/**
 * InvestCapital Hub - Aplicación Unificada
 * CON CONEXIÓN A API - VERSIÓN COMPLETA
 */

// ============================================
// 1. CONFIGURACIÓN DE LA API
// ============================================

const API_URL = 'http://127.0.0.1:8000/api/';


// ============================================
// 2. UTILIDADES
// ============================================

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(valor || 0);
}

function mostrarToast(mensaje, tipo) {
    tipo = tipo || 'info';
    var container = document.getElementById('toastContainer');
    if (!container) {
        alert(mensaje);
        return;
    }
    var colores = {
        success: 'bg-success',
        error: 'bg-danger',
        warning: 'bg-warning text-dark',
        info: 'bg-info text-dark'
    };
    var iconos = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    var toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white ' + (colores[tipo] || 'bg-secondary') + ' border-0 show';
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
    setTimeout(function() {
        if (toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(function() { toast.remove(); }, 500);
        }
    }, 5000);
}

// ============================================
// 3. BITÁCORA
// ============================================

var bitacora = [];

function registrarAccion(nombre, descripcion, detalles) {
    detalles = detalles || '';
    var registro = {
        id: Date.now(),
        fecha: new Date().toLocaleString(),
        nombre: nombre,
        descripcion: descripcion,
        detalles: detalles
    };
    bitacora.unshift(registro);
    if (bitacora.length > 50) bitacora = bitacora.slice(0, 50);
    localStorage.setItem('bitacora', JSON.stringify(bitacora));
    renderizarBitacora();
}

function cargarBitacora() {
    var guardado = localStorage.getItem('bitacora');
    if (guardado) {
        try { bitacora = JSON.parse(guardado); } catch (e) { bitacora = []; }
    }
    return bitacora;
}

function renderizarBitacora() {
    var container = document.getElementById('bitacoraContainer');
    if (!container) return;
    if (bitacora.length === 0) {
        container.innerHTML = '<div class="text-center text-muted py-4"><i class="fas fa-info-circle me-2"></i> No hay acciones registradas aún.</div>';
        return;
    }
    var mostrar = bitacora.slice(0, 10);
    var html = '';
    for (var i = 0; i < mostrar.length; i++) {
        var accion = mostrar[i];
        html += `
            <div class="list-group-item list-group-item-action d-flex align-items-start gap-3 py-3">
                <div class="flex-shrink-0"><span class="badge bg-primary rounded-pill">${new Date(accion.fecha).toLocaleTimeString()}</span></div>
                <div class="flex-grow-1">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-0 fw-bold">${accion.nombre}</h6>
                        <small class="text-muted">${accion.fecha}</small>
                    </div>
                    <p class="mb-0 text-muted small">${accion.descripcion}</p>
                    ${accion.detalles ? '<small class="text-secondary">' + accion.detalles + '</small>' : ''}
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
    var contador = document.getElementById('bitacoraContador');
    if (contador) contador.textContent = bitacora.length;
}

function limpiarBitacora() {
    if (confirm('¿Está seguro de limpiar todas las acciones de la bitácora?')) {
        bitacora = [];
        localStorage.removeItem('bitacora');
        renderizarBitacora();
        mostrarToast('Bitácora limpiada exitosamente', 'success');
    }
}

// ============================================
// 4. AUTENTICACIÓN
// ============================================

function verificarSesion() {
    var session = localStorage.getItem('session');
    if (!session) return null;
    try {
        return JSON.parse(session);
    } catch (e) {
        return null;
    }
}

function cerrarSesion() {
    localStorage.removeItem('session');
    localStorage.removeItem('sessionTime');
    registrarAccion('Cierre de Sesión', 'El usuario cerró sesión', '');
    mostrarToast('Sesión cerrada exitosamente', 'info');
    setTimeout(function() {
        window.location.href = '../index.html';
    }, 1000);
}


// ============================================
// 5. LOGIN - CON REDIRECCIÓN FORZADA
// ============================================

async function handleLogin(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    console.log('🔐 Iniciando login...');
    
    var correoInput = document.getElementById('correoLogin');
    var passwordInput = document.getElementById('passwordLogin');
    
    if (!correoInput || !passwordInput) {
        mostrarToast('Error: Campos de login no encontrados', 'error');
        return false;
    }
    
    var correo = correoInput.value.trim();
    var password = passwordInput.value.trim();

    if (!correo || !password) {
        mostrarToast('Correo y contraseña son obligatorios', 'error');
        return false;
    }

    try {
        var response = await fetch(API_URL + 'login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: correo, password: password })
        });

        var data = await response.json();

        if (data.success) {
          var clientesResponse = await fetch(API_URL + 'clientes/');
    var clientes = await clientesResponse.json();
    var clienteReal = clientes.find(function(c) {
        return c.correo === data.usuario.correo;
    });
    
    var session = {
        id: clienteReal ? clienteReal.id : data.usuario.id,
        nombre: data.usuario.nombre,
        correo: data.usuario.correo,
        rol: data.usuario.rol
    };
    localStorage.setItem('session', JSON.stringify(session));
            mostrarToast('Bienvenido ' + data.usuario.nombre, 'success');

            // ✅ REDIRECCIÓN INMEDIATA
            if (data.usuario.rol === 'administrador') {
                window.location.href = 'admin-panel.html';
            } else {
                window.location.href = 'dashboard.html';
            }

        } else {
            mostrarToast(data.error || 'Credenciales incorrectas', 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        mostrarToast('Error de conexión con el servidor', 'error');
    }

    return false;
}

// ============================================
// 6. MENÚ Y NAVEGACIÓN
// ============================================

function cargarMenuPorRol() {
    var session = verificarSesion();
    var menu = document.getElementById('menuPrincipal');
    var userInfo = document.getElementById('userInfo');
    
    if (!menu) return;
    
    if (!session) {
        menu.innerHTML = '';
        if (userInfo) {
            userInfo.innerHTML = `
                <a href="login.html" class="btn btn-outline-light btn-sm me-2">
                    <i class="fas fa-sign-in-alt me-1"></i> Iniciar Sesión
                </a>
                <a href="registro.html" class="btn btn-primary btn-sm">
                    <i class="fas fa-user-plus me-1"></i> Registrarse
                </a>
            `;
        }
        configurarLogo();
        return;
    }
    
    var items = '';
    if (session.rol === 'administrador') {
        items = `
            <li class="nav-item"><a class="nav-link" href="admin-panel.html"><i class="fas fa-tachometer-alt me-1"></i> Panel</a></li>
            <li class="nav-item"><a class="nav-link" href="admin-clientes.html"><i class="fas fa-users me-1"></i> Clientes</a></li>
            <li class="nav-item"><a class="nav-link" href="admin-activos.html"><i class="fas fa-chart-bar me-1"></i> Activos</a></li>
            <li class="nav-item"><a class="nav-link" href="admin-reportes.html"><i class="fas fa-file-alt me-1"></i> Reportes</a></li>
            <li class="nav-item"><a class="nav-link" href="perfil.html"><i class="fas fa-user me-1"></i> Perfil</a></li>
        `;
    } else {
        items = `
            <li class="nav-item"><a class="nav-link" href="dashboard.html"><i class="fas fa-home me-1"></i> Dashboard</a></li>
            <li class="nav-item"><a class="nav-link" href="dashboard-inversiones.html"><i class="fas fa-chart-line me-1"></i> Mercado</a></li>
            <li class="nav-item"><a class="nav-link" href="portafolios.html"><i class="fas fa-briefcase me-1"></i> Portafolios</a></li>
            <li class="nav-item"><a class="nav-link" href="reportes.html"><i class="fas fa-file-alt me-1"></i> Reportes</a></li>
            <li class="nav-item"><a class="nav-link" href="perfil.html"><i class="fas fa-user me-1"></i> Perfil</a></li>
        `;
    }
    
    menu.innerHTML = items;
    
    if (userInfo) {
        userInfo.innerHTML = `
            <span class="text-light me-3 small">
                <i class="fas fa-user-circle me-1"></i> ${session.nombre || session.correo}
            </span>
            <button class="btn btn-outline-danger btn-sm" onclick="cerrarSesion()">
                <i class="fas fa-sign-out-alt me-1"></i> Salir
            </button>
        `;
    }
    
    configurarLogo();
}

function configurarLogo() {
    var logoLink = document.getElementById('logoLink');
    if (!logoLink) return;
    
    logoLink.onclick = function(e) {
        e.preventDefault();
        var session = verificarSesion();
        var path = window.location.pathname;
        
        if (session && session.rol === 'administrador') {
            window.location.href = 'admin-panel.html';
        } else if (session && session.rol === 'inversionista') {
            window.location.href = 'dashboard.html';
        } else {
            if (path.indexOf('/pages/') !== -1) {
                window.location.href = '../index.html';
            } else {
                window.location.href = 'index.html';
            }
        }
    };
}

// ============================================
// 7. CLIENTES - CRUD COMPLETO
// ============================================

var clientesData = [];
var currentPage = 1;
var itemsPerPage = 10;

async function cargarClientes() {
    try {
        var response = await fetch(API_URL + 'clientes/');
        var data = await response.json();
        clientesData = data;
        renderizarTablaClientes(clientesData, currentPage);
        console.log('✅ Clientes cargados:', clientesData.length);
    } catch (error) {
        console.error('Error cargando clientes:', error);
        mostrarToast('Error cargando clientes', 'error');
    }
}

function renderizarTablaClientes(clientes, page) {
    page = page || 1;
    var tbody = document.getElementById('tablaClientes');
    var paginacion = document.getElementById('paginacionClientes');
    if (!tbody) return;

    var searchTerm = '';
    var searchInput = document.getElementById('buscarCliente');
    if (searchInput) searchTerm = searchInput.value.toLowerCase();

    var filtered = clientes;
    if (searchTerm) {
        filtered = [];
        for (var i = 0; i < clientes.length; i++) {
            var c = clientes[i];
            if (c.nombres.toLowerCase().indexOf(searchTerm) !== -1 ||
                c.apellidos.toLowerCase().indexOf(searchTerm) !== -1 ||
                c.identificacion.indexOf(searchTerm) !== -1) {
                filtered.push(c);
            }
        }
    }

    var totalItems = filtered.length;
    var totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    var startIndex = (page - 1) * itemsPerPage;
    var pageItems = filtered.slice(startIndex, startIndex + itemsPerPage);

    if (totalItems === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4">No hay clientes registrados.</td></tr>';
        if (paginacion) paginacion.innerHTML = '';
        return;
    }

    var html = '';
    for (var j = 0; j < pageItems.length; j++) {
        var c = pageItems[j];
        html += `
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
                    <button class="btn btn-outline-primary btn-sm" onclick="verDetalleCliente('${c.id}')"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="editarCliente('${c.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-outline-warning btn-sm" onclick="cambiarEstadoCliente('${c.id}')"><i class="fas fa-exchange-alt"></i></button>
                </td>
            </tr>
        `;
    }
    tbody.innerHTML = html;

    if (paginacion) {
        var pagHtml = '<nav><ul class="pagination pagination-sm justify-content-center">';
        pagHtml += '<li class="page-item ' + (page <= 1 ? 'disabled' : '') + '"><a class="page-link" href="#" onclick="cambiarPaginaClientes(' + (page - 1) + ')">Anterior</a></li>';
        for (var p = 1; p <= totalPages; p++) {
            pagHtml += '<li class="page-item ' + (p === page ? 'active' : '') + '"><a class="page-link" href="#" onclick="cambiarPaginaClientes(' + p + ')">' + p + '</a></li>';
        }
        pagHtml += '<li class="page-item ' + (page >= totalPages ? 'disabled' : '') + '"><a class="page-link" href="#" onclick="cambiarPaginaClientes(' + (page + 1) + ')">Siguiente</a></li>';
        pagHtml += '</ul></nav>';
        paginacion.innerHTML = pagHtml;
    }
}

function cambiarPaginaClientes(page) {
    currentPage = page;
    renderizarTablaClientes(clientesData, page);
}

function filtrarClientes(termino) {
    renderizarTablaClientes(clientesData, 1);
    if (termino && termino.length > 0) {
        registrarAccion('Búsqueda de Clientes', 'El usuario buscó "' + termino + '"', '');
    }
}

function filtrarReportes(termino) {
    var categoria = document.getElementById('filtroCategoriaReporte')?.value || '';
    var filtrados = reportesData.filter(function(r) { return r.estado === 'publicado'; });
    
    if (termino) {
        var t = termino.toLowerCase();
        filtrados = filtrados.filter(function(r) {
            return r.titulo.toLowerCase().indexOf(t) !== -1 || 
                   (r.contenido && r.contenido.toLowerCase().indexOf(t) !== -1);
        });
    }
    
    if (categoria) {
        filtrados = filtrados.filter(function(r) { return r.categoria === categoria; });
    }
    
    renderizarReportes(filtrados);
}

async function verDetalleCliente(id) {
    try {
        var response = await fetch(API_URL + 'clientes/' + id + '/');
        var cliente = await response.json();
        localStorage.setItem('clienteDetalle', JSON.stringify(cliente));
        window.location.href = 'admin-cliente-detalle.html';
    } catch (error) {
        mostrarToast('Error cargando cliente', 'error');
    }
}

function editarCliente(id) {
    var cliente = clientesData.find(function(c) { return c.id === id; });
    if (!cliente) { mostrarToast('Cliente no encontrado', 'warning'); return; }
    localStorage.setItem('clienteEditar', JSON.stringify(cliente));
    window.location.href = 'admin-cliente-editar.html';
}

async function cambiarEstadoCliente(id) {
    var cliente = clientesData.find(function(c) { return c.id === id; });
    if (!cliente) return;
    var nuevo = cliente.estado === 'activo' ? 'inactivo' : 'activo';
    if (confirm('¿Cambiar estado de ' + cliente.nombres + ' a ' + nuevo + '?')) {
        try {
            var response = await fetch(API_URL + 'clientes/' + id + '/estado/', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevo })
            });
            var data = await response.json();
            cliente.estado = data.estado;
            renderizarTablaClientes(clientesData, currentPage);
            registrarAccion('Cambio de Estado', 'El usuario cambió el estado del cliente ' + cliente.nombres + ' a ' + nuevo, '');
            mostrarToast('Estado actualizado a ' + nuevo, 'success');
        } catch (error) {
            mostrarToast('Error actualizando estado', 'error');
        }
    }
}

// ============================================
// 8. ACTIVOS - CRUD COMPLETO
// ============================================

var activosData = [];

async function cargarActivos() {
    try {
        var response = await fetch(API_URL + 'activos/');
        var data = await response.json();
        activosData = data;
        renderizarActivos(activosData);
        console.log('✅ Activos cargados:', activosData.length);
    } catch (error) {
        console.error('Error cargando activos:', error);
        mostrarToast('Error cargando activos', 'error');
    }
}

function renderizarActivos(activos) {
    var container = document.getElementById('listaActivos');
    if (!container) return;
    if (activos.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted py-4">No hay activos disponibles.</div>';
        return;
    }
    var html = '';
    for (var i = 0; i < activos.length; i++) {
        var a = activos[i];
        var badgeColor = 'bg-secondary';
        if (a.tipo === 'acción') badgeColor = 'bg-primary';
        else if (a.tipo === 'criptomoneda') badgeColor = 'bg-success';
        else if (a.tipo === 'ETF') badgeColor = 'bg-warning text-dark';
        html += `
            <div class="col-md-4 col-lg-3">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <h6 class="fw-bold">${a.codigo}</h6>
                            <span class="badge ${badgeColor}">${a.tipo}</span>
                        </div>
                        <p class="text-muted small">${a.nombre}</p>
                        <p class="fs-5 fw-bold">${formatearMoneda(a.precio_actual)}</p>
                        <p class="${a.variacion_diaria >= 0 ? 'text-success' : 'text-danger'}">${a.variacion_diaria >= 0 ? '+' : ''}${a.variacion_diaria}%</p>
                        <button class="btn btn-sm btn-outline-primary w-100" onclick="verDetalleActivo('${a.id}')"><i class="fas fa-eye me-1"></i> Ver Detalle</button>
                    </div>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

async function verDetalleActivo(id) {
    try {
        var response = await fetch(API_URL + 'activos/' + id + '/');
        var activo = await response.json();
        localStorage.setItem('activoDetalle', JSON.stringify(activo));
        window.location.href = 'activo-detalle.html';
    } catch (error) {
        mostrarToast('Error cargando activo', 'error');
    }
}

async function cargarActivosAdmin() {
    try {
        var response = await fetch(API_URL + 'activos/');
        var data = await response.json();
        activosData = data;
        renderizarTablaActivosAdmin(activosData);
        console.log('✅ Activos admin cargados:', activosData.length);
    } catch (error) {
        console.error('Error cargando activos admin:', error);
        mostrarToast('Error cargando activos', 'error');
    }
}

function renderizarTablaActivosAdmin(activos) {
    var tbody = document.getElementById('tablaActivosAdmin');
    if (!tbody) return;
    if (activos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No hay activos registrados.</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < activos.length; i++) {
        var a = activos[i];
        var badgeColor = 'bg-secondary';
        if (a.tipo === 'acción') badgeColor = 'bg-primary';
        else if (a.tipo === 'criptomoneda') badgeColor = 'bg-success';
        else if (a.tipo === 'ETF') badgeColor = 'bg-warning text-dark';
        html += `
            <tr>
                <td><strong>${a.codigo}</strong></td>
                <td>${a.nombre}</td>
                <td><span class="badge ${badgeColor}">${a.tipo}</span></td>
                <td>${formatearMoneda(a.precio_actual)}</td>
                <td class="${a.variacion_diaria >= 0 ? 'text-success' : 'text-danger'}">${a.variacion_diaria >= 0 ? '+' : ''}${a.variacion_diaria}%</td>
                <td><span class="badge ${a.estado === 'activo' ? 'bg-success' : 'bg-danger'}">${a.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary" onclick="editarActivoAdmin('${a.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-warning" onclick="cambiarEstadoActivoAdmin('${a.id}')"><i class="fas fa-exchange-alt"></i></button>
                    <button class="btn btn-sm btn-outline-info" onclick="actualizarPrecioIndividual('${a.id}')"><i class="fas fa-dollar-sign"></i></button>
                </td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
}

function editarActivoAdmin(id) {
    var activo = activosData.find(function(a) { return a.id === id; });
    if (!activo) { mostrarToast('Activo no encontrado', 'warning'); return; }
    localStorage.setItem('activoEditar', JSON.stringify(activo));
    window.location.href = 'admin-activo-editar.html';
}

async function cambiarEstadoActivoAdmin(id) {
    var activo = activosData.find(function(a) { return a.id === id; });
    if (!activo) return;
    var nuevo = activo.estado === 'activo' ? 'inactivo' : 'activo';
    if (confirm('¿Cambiar estado de ' + activo.nombre + ' a ' + nuevo + '?')) {
        try {
            var response = await fetch(API_URL + 'activos/' + id + '/', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevo })
            });
            var data = await response.json();
            activo.estado = data.estado;
            renderizarTablaActivosAdmin(activosData);
            registrarAccion('Cambio de Estado Activo', 'El usuario cambió el estado del activo ' + activo.nombre + ' a ' + nuevo, '');
            mostrarToast('Estado actualizado a ' + nuevo, 'success');
        } catch (error) {
            mostrarToast('Error actualizando estado', 'error');
        }
    }
}

async function actualizarPrecioIndividual(id) {
    var activo = activosData.find(function(a) { return a.id === id; });
    if (!activo) return;
    var nuevoPrecio = prompt('Ingrese el nuevo precio:', activo.precio_actual);
    if (nuevoPrecio !== null && !isNaN(nuevoPrecio) && parseFloat(nuevoPrecio) > 0) {
        try {
            var response = await fetch(API_URL + 'activos/' + id + '/', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ precio_actual: parseFloat(nuevoPrecio) })
            });
            var data = await response.json();
            activo.precio_actual = data.precio_actual;
            renderizarTablaActivosAdmin(activosData);
            registrarAccion('Actualización de Precio', 'El usuario actualizó el precio de ' + activo.nombre, 'Nuevo precio: ' + formatearMoneda(activo.precio_actual));
            mostrarToast('Precio actualizado', 'success');
        } catch (error) {
            mostrarToast('Error actualizando precio', 'error');
        }
    }
}

async function actualizarPreciosMasivos() {
    if (confirm('¿Actualizar todos los precios con variación aleatoria (-5% a +5%)?')) {
        try {
            var response = await fetch(API_URL + 'activos/actualizar-precios/', {
                method: 'POST'
            });
            var data = await response.json();
            if (data.success) {
                await cargarActivosAdmin();
                registrarAccion('Actualización Masiva', 'El usuario actualizó todos los precios de activos', '');
                mostrarToast('Precios actualizados masivamente', 'success');
            }
        } catch (error) {
            mostrarToast('Error actualizando precios', 'error');
        }
    }
}
// ============================================
// 9. PORTAFOLIOS - COMPLETO
// ============================================

var portafoliosData = [];

async function cargarPortafolios() {
    try {
        var session = verificarSesion();
        var clienteId = session ? session.id : 1;
        var response = await fetch(API_URL + 'portafolios/?cliente_id=' + clienteId);
        var data = await response.json();
        portafoliosData = data;
        renderizarPortafolios(portafoliosData);
        console.log('✅ Portafolios cargados:', portafoliosData.length);
    } catch (error) {
        console.error('Error cargando portafolios:', error);
        mostrarToast('Error cargando portafolios', 'error');
        portafoliosData = [];
        renderizarPortafolios(portafoliosData);
    }
}

function renderizarPortafolios(portafolios) {
    var container = document.getElementById('listaPortafolios');
    if (!container) return;
    
    if (!portafolios || portafolios.length === 0) {
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
    
    var html = '';
    for (var i = 0; i < portafolios.length; i++) {
        var p = portafolios[i];
        var rendClass = (p.rendimiento_porcentual || 0) >= 0 ? 'text-success' : 'text-danger';
        var rendSymbol = (p.rendimiento_porcentual || 0) >= 0 ? '+' : '';
        html += `
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
                            <span class="${rendClass} fw-bold">${rendSymbol}${(p.rendimiento_porcentual || 0).toFixed(2)}%</span>
                        </div>
                        <div class="mt-3 d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary" onclick="verDetallePortafolio('${p.id}')">
                                <i class="fas fa-eye me-1"></i> Ver
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="editarPortafolio('${p.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-warning" onclick="archivarPortafolio('${p.id}')">
                                <i class="fas fa-archive"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

async function verDetallePortafolio(id) {
    try {
        var response = await fetch(API_URL + 'portafolios/' + id + '/');
        var portafolio = await response.json();
        localStorage.setItem('portafolioDetalle', JSON.stringify(portafolio));
        window.location.href = 'portafolio-detalle.html';
    } catch (error) {
        console.error('Error cargando portafolio:', error);
        mostrarToast('Error cargando portafolio', 'error');
    }
}

async function crearPortafolio(event) {
    event.preventDefault();
    var nombre = document.getElementById('nombrePortafolio').value.trim();
    var descripcion = document.getElementById('descripcionPortafolio').value.trim();
    
    if (!nombre) {
        mostrarToast('El nombre es obligatorio', 'error');
        return false;
    }
    
    try {
        var session = verificarSesion();
        var response = await fetch(API_URL + 'portafolios/crear/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cliente_id: session.id,
                nombre: nombre,
                descripcion: descripcion || ''
            })
        });
        var data = await response.json();
        if (data.id) {
            mostrarToast('Portafolio creado exitosamente', 'success');
            registrarAccion('Creación de Portafolio', 'El usuario creó el portafolio "' + nombre + '"', '');
            setTimeout(function() {
                window.location.href = 'portafolios.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Error creando portafolio:', error);
        mostrarToast('Error creando portafolio', 'error');
    }
    return false;
}

async function editarPortafolio(id) {
    var portafolio = portafoliosData.find(function(p) { return p.id === id; });
    if (!portafolio) { mostrarToast('Portafolio no encontrado', 'warning'); return; }
    var nuevoNombre = prompt('Nuevo nombre:', portafolio.nombre);
    if (nuevoNombre && nuevoNombre.trim()) {
        try {
            var response = await fetch(API_URL + 'portafolios/' + id + '/', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: nuevoNombre.trim() })
            });
            var data = await response.json();
            portafolio.nombre = data.nombre;
            renderizarPortafolios(portafoliosData);
            mostrarToast('Portafolio actualizado', 'success');
        } catch (error) {
            mostrarToast('Error actualizando portafolio', 'error');
        }
    }
}

async function archivarPortafolio(id) {
    var portafolio = portafoliosData.find(function(p) { return p.id === id; });
    if (!portafolio) return;
    if (confirm('¿Archivar portafolio "' + portafolio.nombre + '"?')) {
        try {
            var response = await fetch(API_URL + 'portafolios/' + id + '/archivar/', {
                method: 'PUT'
            });
            var data = await response.json();
            portafolio.estado = data.estado;
            renderizarPortafolios(portafoliosData);
            registrarAccion('Archivar Portafolio', 'El usuario archivó el portafolio "' + portafolio.nombre + '"', '');
            mostrarToast('Portafolio archivado', 'success');
        } catch (error) {
            mostrarToast('Error archivando portafolio', 'error');
        }
    }
}

// ============================================
// 10. REPORTES - COMPLETO
// ============================================

var reportesData = [];

async function cargarReportes() {
    try {
        var response = await fetch(API_URL + 'reportes/');
        var data = await response.json();
        reportesData = data;
        renderizarReportes(reportesData);
        console.log('✅ Reportes cargados:', reportesData.length);
    } catch (error) {
        console.error('Error cargando reportes:', error);
        mostrarToast('Error cargando reportes', 'error');
        reportesData = [];
        renderizarReportes(reportesData);
    }
}

function renderizarReportes(reportes) {
    var container = document.getElementById('listaReportes');
    if (!container) return;
    
    if (!reportes || reportes.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted py-4">No hay reportes publicados.</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < reportes.length; i++) {
        var r = reportes[i];
        html += `
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
        `;
    }
    container.innerHTML = html;
}

async function verDetalleReporte(id) {
    try {
        // Incrementar visualizaciones
        await fetch(API_URL + 'reportes/' + id + '/visualizar/', {
            method: 'POST'
        });
        var response = await fetch(API_URL + 'reportes/' + id + '/');
        var reporte = await response.json();
        localStorage.setItem('reporteDetalle', JSON.stringify(reporte));
        window.location.href = 'reporte-detalle.html';
    } catch (error) {
        console.error('Error cargando reporte:', error);
        mostrarToast('Error cargando reporte', 'error');
    }
}

async function cargarReportesAdmin() {
    try {
        var response = await fetch(API_URL + 'reportes/');
        var data = await response.json();
        reportesData = data;
        renderizarTablaReportesAdmin(reportesData);
        console.log('✅ Reportes admin cargados:', reportesData.length);
    } catch (error) {
        console.error('Error cargando reportes admin:', error);
        mostrarToast('Error cargando reportes', 'error');
        reportesData = [];
        renderizarTablaReportesAdmin(reportesData);
    }
}

function renderizarTablaReportesAdmin(reportes) {
    var tbody = document.getElementById('tablaReportesAdmin');
    if (!tbody) return;
    
    if (!reportes || reportes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No hay reportes registrados.</td></tr>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < reportes.length; i++) {
        var r = reportes[i];
        html += `
            <tr>
                <td><strong>${r.titulo}</strong></td>
                <td><span class="badge bg-info">${r.categoria}</span></td>
                <td>${r.autor}</td>
                <td>${new Date(r.fecha_publicacion).toLocaleDateString()}</td>
                <td>${r.visualizaciones || 0}</td>
                <td><span class="badge ${r.estado === 'publicado' ? 'bg-success' : 'bg-secondary'}">${r.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary" onclick="editarReporteAdmin('${r.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-warning" onclick="cambiarEstadoReporteAdmin('${r.id}')"><i class="fas fa-exchange-alt"></i></button>
                </td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
}

function editarReporteAdmin(id) {
    var reporte = reportesData.find(function(r) { return r.id === id; });
    if (!reporte) { mostrarToast('Reporte no encontrado', 'warning'); return; }
    localStorage.setItem('reporteEditar', JSON.stringify(reporte));
    window.location.href = 'admin-reporte-editar.html';
}

async function cambiarEstadoReporteAdmin(id) {
    var reporte = reportesData.find(function(r) { return r.id === id; });
    if (!reporte) return;
    var nuevo = reporte.estado === 'publicado' ? 'despublicado' : 'publicado';
    if (confirm('¿Cambiar estado de "' + reporte.titulo + '" a ' + nuevo + '?')) {
        try {
            var response = await fetch(API_URL + 'reportes/' + id + '/', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevo })
            });
            var data = await response.json();
            reporte.estado = data.estado;
            renderizarTablaReportesAdmin(reportesData);
            registrarAccion('Cambio de Estado Reporte', 'El usuario cambió el estado del reporte "' + reporte.titulo + '" a ' + nuevo, '');
            mostrarToast('Estado actualizado a ' + nuevo, 'success');
        } catch (error) {
            mostrarToast('Error actualizando estado', 'error');
        }
    }
}

async function crearReporte(event) {
    event.preventDefault();
    var titulo = document.getElementById('tituloReporte').value.trim();
    var resumen = document.getElementById('resumenReporte').value.trim();
    var contenido = document.getElementById('contenidoReporte').value.trim();
    var categoria = document.getElementById('categoriaReporte').value;
    
    if (!titulo || !resumen || !contenido || !categoria) {
        mostrarToast('Complete todos los campos obligatorios', 'error');
        return false;
    }
    
    try {
        var response = await fetch(API_URL + 'reportes/crear/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                titulo: titulo,
                resumen: resumen,
                contenido: contenido,
                categoria: categoria
            })
        });
        var data = await response.json();
        if (data.id) {
            mostrarToast('Reporte publicado exitosamente', 'success');
            registrarAccion('Creación de Reporte', 'El usuario publicó el reporte "' + titulo + '"', '');
            setTimeout(function() {
                window.location.href = 'admin-reportes.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Error creando reporte:', error);
        mostrarToast('Error creando reporte', 'error');
    }
    return false;
}

async function editarReporte(event) {
    event.preventDefault();
    var id = document.getElementById('reporteId').value;
    var titulo = document.getElementById('tituloReporte').value.trim();
    var resumen = document.getElementById('resumenReporte').value.trim();
    var contenido = document.getElementById('contenidoReporte').value.trim();
    var categoria = document.getElementById('categoriaReporte').value;
    var estado = document.getElementById('estadoReporte').value;
    
    if (!titulo || !resumen || !contenido || !categoria) {
        mostrarToast('Complete todos los campos obligatorios', 'error');
        return false;
    }
    
    try {
        var response = await fetch(API_URL + 'reportes/' + id + '/', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                titulo: titulo,
                resumen: resumen,
                contenido: contenido,
                categoria: categoria,
                estado: estado
            })
        });
        var data = await response.json();
        if (data.id) {
            mostrarToast('Reporte actualizado exitosamente', 'success');
            registrarAccion('Edición de Reporte', 'El usuario editó el reporte "' + titulo + '"', '');
            setTimeout(function() {
                window.location.href = 'admin-reportes.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Error editando reporte:', error);
        mostrarToast('Error editando reporte', 'error');
    }
    return false;
}
// ============================================
// 11. ESTADÍSTICAS ADMIN
// ============================================

async function cargarEstadisticasAdmin() {
    try {
        var response = await fetch(API_URL + 'admin/estadisticas/');
        var data = await response.json();
        
        document.getElementById('totalClientes').textContent = data.total_clientes || 0;
        document.getElementById('clientesActivos').textContent = data.clientes_activos || 0;
        document.getElementById('totalPortafoliosAdmin').textContent = data.total_portafolios || 0;
        document.getElementById('totalTransaccionesAdmin').textContent = data.total_transacciones || 0;
        
        console.log('✅ Estadísticas cargadas:', data);
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// ============================================
// 12. DASHBOARD
// ============================================

async function cargarDashboard() {
    try {
        var response = await fetch(API_URL + 'activos/');
        var activos = await response.json();
        
        var session = verificarSesion();
        var clienteId = session ? session.id : 1;
        var portafoliosResponse = await fetch(API_URL + 'portafolios/?cliente_id=' + clienteId);
        var portafolios = await portafoliosResponse.json();
        
        var valorInvertido = 0;
        var valorActual = 0;
        for (var i = 0; i < portafolios.length; i++) {
            valorInvertido += portafolios[i].valor_total_invertido || 0;
            valorActual += portafolios[i].valor_actual_total || 0;
        }
        var ganancia = valorActual - valorInvertido;
        
        document.getElementById('valorInvertido').textContent = formatearMoneda(valorInvertido);
        document.getElementById('valorActual').textContent = formatearMoneda(valorActual);
        var gananciaEl = document.getElementById('gananciaPerdida');
        if (gananciaEl) {
            gananciaEl.textContent = formatearMoneda(ganancia);
            gananciaEl.className = 'fw-bold ' + (ganancia >= 0 ? 'text-success' : 'text-danger');
        }
        document.getElementById('totalPortafolios').textContent = portafolios.length;
        
        var lista = document.getElementById('activosDestacados');
        if (lista && activos.length > 0) {
            var destacados = activos.slice(0, 3);
            var html = '';
            for (var j = 0; j < destacados.length; j++) {
                var a = destacados[j];
                html += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span>${a.codigo} - ${a.nombre}</span>
                        <span class="badge ${a.variacion_diaria >= 0 ? 'bg-success' : 'bg-danger'}">
                            ${a.variacion_diaria >= 0 ? '+' : ''}${a.variacion_diaria}%
                        </span>
                    </li>
                `;
            }
            lista.innerHTML = html;
        }
        
        console.log('✅ Dashboard cargado');
    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}

// ============================================
// 13. PERFIL
// ============================================
async function cargarPerfil() {
    try {
        var session = verificarSesion();
        if (!session) {
            window.location.href = 'login.html';
            return;
        }
        
        // Si es administrador, redirigir
        if (session.rol === 'administrador') {
            window.location.href = 'admin-panel.html';
            return;
        }
        
        // Buscar cliente por correo
        var response = await fetch(API_URL + 'clientes/');
        var clientes = await response.json();
        var cliente = clientes.find(function(c) {
            return c.correo === session.correo;
        });
        
        if (!cliente) {
            console.error('❌ Cliente no encontrado para:', session.correo);
            mostrarToast('Cliente no encontrado', 'error');
            return;
        }
        
        // Mostrar datos
        document.getElementById('perfilId').textContent = cliente.id;
        document.getElementById('perfilNombres').textContent = cliente.nombres;
        document.getElementById('perfilApellidos').textContent = cliente.apellidos;
        document.getElementById('perfilIdentificacion').textContent = cliente.identificacion;
        document.getElementById('perfilTelefono').textContent = cliente.telefono || 'No registrado';
        document.getElementById('perfilCelular').textContent = cliente.celular;
        document.getElementById('perfilCorreo').textContent = cliente.correo;
        document.getElementById('perfilDireccion').textContent = cliente.direccion || 'No registrada';
        document.getElementById('perfilEstadoCivil').textContent = cliente.estadoCivil;
        document.getElementById('perfilEstado').innerHTML = '<span class="badge ' + (cliente.estado === 'activo' ? 'bg-success' : 'bg-danger') + '">' + cliente.estado + '</span>';
        document.getElementById('perfilFechaRegistro').textContent = new Date(cliente.fecha_registro).toLocaleString();
        
        console.log('✅ Perfil cargado para:', cliente.nombres);
    } catch (error) {
        console.error('❌ Error cargando perfil:', error);
        mostrarToast('Error cargando perfil', 'error');
    }
}


// ============================================
// DETALLE DE PORTAFOLIO
// ============================================

function cargarDetallePortafolio() {
    var data = localStorage.getItem('portafolioDetalle');
    if (!data) {
        window.location.href = 'portafolios.html';
        return;
    }
    var p = JSON.parse(data);
    
    document.getElementById('portafolioTitulo').textContent = 'Detalle: ' + p.nombre;
    document.getElementById('detalleNombrePortafolio').textContent = p.nombre;
    document.getElementById('detalleDescripcionPortafolio').textContent = p.descripcion || 'Sin descripción';
    document.getElementById('detalleValorTotal').textContent = formatearMoneda(p.valor_actual_total || 0);
    
    var rend = document.getElementById('detalleRendimiento');
    var rendPct = p.rendimiento_porcentual || 0;
    rend.innerHTML = '<span class="' + (rendPct >= 0 ? 'text-success' : 'text-danger') + '">' + (rendPct >= 0 ? '+' : '') + rendPct.toFixed(2) + '%</span>';
    
    // Cargar activos del portafolio
    var tbody = document.getElementById('cuerpoActivosPortafolio');
    if (tbody && p.portafolio_activos) {
        if (p.portafolio_activos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">No hay activos en este portafolio</td></tr>';
        } else {
            var html = '';
            for (var i = 0; i < p.portafolio_activos.length; i++) {
                var pa = p.portafolio_activos[i];
                var activo = pa.activo || {};
                var rendimiento = (activo.precio_actual - pa.precio_compra) * pa.cantidad;
                var rendPctActivo = ((activo.precio_actual / pa.precio_compra) - 1) * 100;
                html += `
                    <tr>
                        <td><strong>${activo.codigo || '-'}</strong> - ${activo.nombre || ''}</td>
                        <td>${pa.cantidad}</td>
                        <td>${formatearMoneda(pa.precio_compra)}</td>
                        <td>${formatearMoneda(activo.precio_actual || 0)}</td>
                        <td class="${rendimiento >= 0 ? 'text-success' : 'text-danger'}">${rendimiento >= 0 ? '+' : ''}${formatearMoneda(rendimiento)}</td>
                        <td class="${rendPctActivo >= 0 ? 'text-success' : 'text-danger'}">${rendPctActivo >= 0 ? '+' : ''}${rendPctActivo.toFixed(2)}%</td>
                        <td>
                            <button class="btn btn-sm btn-outline-danger" onclick="venderActivo('${activo.id}')">
                                <i class="fas fa-minus-circle me-1"></i> Vender
                            </button>
                        </td>
                    </tr>
                `;
            }
            tbody.innerHTML = html;
        }
    }
    
    // Cargar transacciones
    cargarTransacciones(p.id);
}

async function cargarTransacciones(portafolioId) {
    try {
        var response = await fetch(API_URL + 'transacciones/historial/' + portafolioId + '/');
        var transacciones = await response.json();
        
        var tbody = document.getElementById('cuerpoTransacciones');
        if (!tbody) return;
        
        if (!transacciones || transacciones.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">No hay transacciones registradas</td></tr>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < transacciones.length; i++) {
            var t = transacciones[i];
            html += `
                <tr>
                    <td>${new Date(t.fecha).toLocaleString()}</td>
                    <td>${t.activo_nombre || '-'} (${t.activo_codigo || '-'})</td>
                    <td><span class="badge ${t.tipo === 'compra' ? 'bg-success' : 'bg-danger'}">${t.tipo}</span></td>
                    <td>${t.cantidad}</td>
                    <td>${formatearMoneda(t.precio_unitario)}</td>
                    <td>${formatearMoneda(t.monto_total)}</td>
                    <td><span class="badge bg-success">${t.estado}</span></td>
                </tr>
            `;
        }
        tbody.innerHTML = html;
    } catch (error) {
        console.error('Error cargando transacciones:', error);
    }
}

// ============================================
// 14. EXPONER FUNCIONES GLOBALMENTE - COMPLETO
// ============================================

window.cargarReportesAdmin = cargarReportesAdmin;
window.renderizarTablaReportesAdmin = renderizarTablaReportesAdmin;
window.editarReporteAdmin = editarReporteAdmin;
window.cambiarEstadoReporteAdmin = cambiarEstadoReporteAdmin;

window.cargarActivosAdmin = cargarActivosAdmin;
window.renderizarTablaActivosAdmin = renderizarTablaActivosAdmin;
window.editarActivoAdmin = editarActivoAdmin;
window.cambiarEstadoActivoAdmin = cambiarEstadoActivoAdmin;
window.actualizarPrecioIndividual = actualizarPrecioIndividual;
window.actualizarPreciosMasivos = actualizarPreciosMasivos;

window.cargarClientes = cargarClientes;
window.renderizarTablaClientes = renderizarTablaClientes;
window.cambiarPaginaClientes = cambiarPaginaClientes;
window.filtrarClientes = filtrarClientes;
window.filtrarReportes = filtrarReportes;
window.verDetalleCliente = verDetalleCliente;
window.editarCliente = editarCliente;
window.cambiarEstadoCliente = cambiarEstadoCliente;

window.cargarPortafolios = cargarPortafolios;
window.verDetallePortafolio = verDetallePortafolio;
window.editarPortafolio = editarPortafolio;
window.archivarPortafolio = archivarPortafolio;
window.cargarDetallePortafolio = cargarDetallePortafolio;

window.cargarReportes = cargarReportes;
window.verDetalleReporte = verDetalleReporte;

window.cargarDashboard = cargarDashboard;
window.cargarEstadisticasAdmin = cargarEstadisticasAdmin;
window.cargarPerfil = cargarPerfil;

window.handleLogin = handleLogin;
window.cerrarSesion = cerrarSesion;
window.cargarMenuPorRol = cargarMenuPorRol;
window.configurarLogo = configurarLogo;
window.mostrarToast = mostrarToast;
window.limpiarBitacora = limpiarBitacora;
window.registrarAccion = registrarAccion;
window.formatearMoneda = formatearMoneda;
window.verificarSesion = verificarSesion;
window.cargarReportes = cargarReportes;
window.renderizarReportes = renderizarReportes;


console.log('✅ app.js cargado correctamente');