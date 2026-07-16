/**
 * Módulo auth.js - Autenticación y protección de rutas
 */

let usuariosData = [];
let basePath = '';

// Detectar la ruta base automáticamente
function detectarBasePath() {
    const path = window.location.pathname;
    if (path.includes('/pages/')) {
        basePath = '../';
    } else if (path.includes('/components/')) {
        basePath = '../';
    } else {
        basePath = './';
    }
    return basePath;
}

// Cargar usuarios desde datos simulados
async function cargarUsuarios() {
    detectarBasePath();
    try {
        const response = await fetch(`${basePath}assets/data/datos.json`);
        const data = await response.json();
        usuariosData = data.usuarios || [];
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        usuariosData = [
            { correo: 'admin@investcapital.com', password: 'admin1234', rol: 'administrador', nombre: 'Administrador' },
            { correo: 'ana.martinez@email.com', password: 'password123', rol: 'inversionista', nombre: 'Ana Martínez' }
        ];
    }
}

// Iniciar sesión
function handleLogin(event) {
    event.preventDefault();

    const correo = document.getElementById('correoLogin').value.trim();
    const password = document.getElementById('passwordLogin').value.trim();

    if (!correo || !password) {
        mostrarToast('Correo y contraseña son obligatorios', 'error');
        return false;
    }

    const usuario = usuariosData.find(u => u.correo === correo && u.password === password);

    if (usuario) {
        const sessionData = {
            correo: usuario.correo,
            rol: usuario.rol,
            nombre: usuario.nombre || usuario.correo
        };
        localStorage.setItem('session', JSON.stringify(sessionData));
        localStorage.setItem('sessionTime', String(Date.now()));

        mostrarToast(`Bienvenido ${sessionData.nombre}`, 'success');

        setTimeout(() => {
            if (usuario.rol === 'administrador') {
                window.location.href = 'admin-panel.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }, 1500);
    } else {
        mostrarToast('Correo o contraseña incorrectos', 'error');
    }

    return false;
}

// Verificar sesión activa
function verificarSesion() {
    const session = localStorage.getItem('session');
    if (!session) return null;

    try {
        const sessionData = JSON.parse(session);
        const sessionTime = localStorage.getItem('sessionTime');
        if (sessionTime) {
            const elapsed = Date.now() - parseInt(sessionTime);
            const eightHours = 8 * 60 * 60 * 1000;
            if (elapsed > eightHours) {
                cerrarSesion();
                return null;
            }
        }
        return sessionData;
    } catch (e) {
        return null;
    }
}

// Proteger rutas según rol
function protegerRuta(rolRequerido) {
    const session = verificarSesion();
    if (!session) {
        window.location.href = 'login.html';
        return false;
    }
    if (rolRequerido && session.rol !== rolRequerido) {
        mostrarToast('No tiene permisos para acceder a esta sección', 'error');
        if (session.rol === 'administrador') {
            window.location.href = 'admin-panel.html';
        } else {
            window.location.href = 'dashboard.html';
        }
        return false;
    }
    return true;
}

// Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('session');
    localStorage.removeItem('sessionTime');
    mostrarToast('Sesión cerrada exitosamente', 'info');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// Cargar menú según rol
function cargarMenuPorRol() {
    const session = verificarSesion();
    const menu = document.getElementById('menuPrincipal');
    const userInfo = document.getElementById('userInfo');

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
        return;
    }

    let items = '';
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
            <li class="nav-item"><a class="nav-link" href="activos.html"><i class="fas fa-chart-bar me-1"></i> Activos</a></li>
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
}

// Inicializar autenticación
document.addEventListener('DOMContentLoaded', function() {
    detectarBasePath();
    cargarUsuarios();
    cargarMenuPorRol();

    // Protección de rutas - detectar página actual
    const path = window.location.pathname;
    if (path.includes('admin-') && !path.includes('login') && !path.includes('registro')) {
        protegerRuta('administrador');
    }
    if (path.includes('dashboard') || path.includes('portafolios') || path.includes('activos') || path.includes('reportes')) {
        protegerRuta('inversionista');
    }
});