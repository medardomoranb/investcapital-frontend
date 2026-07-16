# 📄 README.md - InvestCapital Hub (VERSIÓN CORREGIDA)

```markdown
# InvestCapital Hub 🚀

**Plataforma Fintech de Simulación de Inversiones**

---

## 📋 Tabla de Contenidos

1. [Descripción del Proyecto](#-descripción-del-proyecto)
2. [Cómo Ejecutar el Proyecto](#-cómo-ejecutar-el-proyecto)
3. [Credenciales de Acceso](#-credenciales-de-acceso)
4. [Usuarios del Sistema](#-usuarios-del-sistema)
5. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
6. [Estructura del Proyecto](#-estructura-del-proyecto)
7. [Módulo Clientes (Obligatorio)](#-módulo-clientes-obligatorio)
8. [Funcionalidades Principales](#-funcionalidades-principales)
9. [Capturas de Pantalla](#-capturas-de-pantalla)
10. [Próximas Fases](#-próximas-fases)
11. [Contacto](#-contacto)

---

## 📋 Descripción del Proyecto

**InvestCapital Hub** es un prototipo web de una plataforma **Fintech educativa** diseñada para que los usuarios aprendan sobre inversiones financieras de manera práctica, interactiva y completamente sin riesgos.

El sistema permite a los usuarios:

- **Registrarse y gestionar** su perfil personal como inversionista
- **Explorar un catálogo** de activos financieros (acciones, criptomonedas, ETFs, bonos)
- **Simular compras y ventas** de activos en tiempo real
- **Visualizar el rendimiento** de sus inversiones con gráficos profesionales
- **Consultar reportes de investigación** para tomar decisiones informadas
- **Gestionar clientes** (CRUD completo para administradores)

---

## 🚀 Cómo Ejecutar el Proyecto

### **Requisitos Previos**
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet (para cargar CDNs de Bootstrap, Tailwind, etc.)

### **Pasos para ejecutar**

#### **Opción 1: Abrir directamente en el navegador**
```bash
1. Descargar o clonar el repositorio
2. Navegar a la carpeta del proyecto
3. Hacer doble clic en index.html
```

#### **Opción 2: Usar Live Server (Recomendado)**
```bash
# Instalar Live Server globalmente
npm install -g live-server

# Navegar a la carpeta del proyecto
cd investcapital-hub-frontend

# Ejecutar Live Server
live-server
```

#### **Opción 3: Usar VS Code con Live Server**
```bash
1. Abrir el proyecto en VS Code
2. Instalar la extensión "Live Server"
3. Hacer clic derecho en index.html
4. Seleccionar "Open with Live Server"
```

---

## 🔐 Credenciales de Acceso

| **Rol** | **Correo** | **Contraseña** |
|---------|-----------|----------------|
| **Administrador** | admin@investcapital.com | admin1234 |
| **Inversionista** | ana.martinez@email.com | password123 |

> **Nota:** Estas credenciales también aparecen en la pantalla de inicio de sesión para facilitar el acceso.

---

## 👥 Usuarios del Sistema

| **Rol** | **Descripción** | **Capacidades** |
|---------|-----------------|-----------------|
| **Inversionista (Cliente)** | Persona natural que desea aprender a invertir. | Explorar activos, simular compras/ventas, consultar reportes, editar perfil, ver mercado en tiempo real. |
| **Administrador** | Personal interno que gestiona la plataforma. | Gestionar clientes, activos y reportes. Visualizar estadísticas generales. |

---

## 🛠️ Tecnologías Utilizadas

| **Tecnología** | **Versión** | **Propósito** |
|----------------|-------------|---------------|
| **HTML5** | - | Estructura del contenido |
| **CSS3** | - | Estilos y diseño visual |
| **Bootstrap 5** | 5.3.0 | Framework CSS para diseño responsive |
| **Tailwind CSS** | - | Utilidades CSS adicionales |
| **DaisyUI** | 4.12.14 | Componentes UI basados en Tailwind |
| **JavaScript** | ES6+ | Lógica del sistema y manipulación del DOM |
| **Chart.js** | - | Gráficos interactivos para el dashboard |
| **JSON** | - | Datos simulados para pruebas |
| **Font Awesome** | 6.5.1 | Iconos y elementos visuales |

---

## 📂 Estructura del Proyecto

```
investcapital-hub-frontend/
│
├── index.html                                      # Landing Page
│
├── pages/                                          # 26 pantallas del sistema
│   ├── login.html                                  # Inicio de sesión
│   ├── registro.html                               # Registro de cliente
│   ├── dashboard.html                              # Dashboard inversionista
│   ├── dashboard-inversiones.html                  # Mercado de inversiones
│   ├── activos.html                                # Exploración de activos
│   ├── activo-detalle.html                         # Detalle de activo
│   ├── portafolios.html                            # Listado de portafolios
│   ├── portafolio-crear.html                       # Crear portafolio
│   ├── portafolio-detalle.html                     # Detalle de portafolio
│   ├── comprar-activo.html                         # Comprar activo
│   ├── vender-activo.html                          # Vender activo
│   ├── reportes.html                               # Listado de reportes
│   ├── reporte-detalle.html                        # Detalle de reporte
│   ├── perfil.html                                 # Mi perfil
│   ├── perfil-editar.html                          # Editar perfil
│   ├── admin-panel.html                            # Panel administrador
│   ├── admin-clientes.html                         # Gestión de clientes
│   ├── admin-cliente-detalle.html                  # Detalle de cliente
│   ├── admin-cliente-editar.html                   # Editar cliente
│   ├── admin-activos.html                          # Gestión de activos
│   ├── admin-activo-crear.html                     # Crear activo
│   ├── admin-activo-editar.html                    # Editar activo
│   ├── admin-reportes.html                         # Gestión de reportes
│   ├── admin-reporte-crear.html                    # Crear reporte
│   └── admin-reporte-editar.html                   # Editar reporte
│
├── assets/
│   ├── css/
│   │   └── styles.css                              # Estilos personalizados
│   ├── js/
│   │   └── app.js                                  # Lógica completa (unificada)
│   ├── data/
│   │   └── datos.json                              # Datos simulados
│   └── img/
│       └── logo.png                                # Logotipo del sistema
│
└── components/                                     # Fragmentos HTML reutilizables
    ├── header.html                                 # Barra de navegación
    ├── footer.html                                 # Pie de página
    ├── toast.html                                  # Notificaciones
    ├── modal.html                                  # Modal genérico
    ├── modal-cambio-estado.html                    # Modal cambio estado
    ├── modal-confirmacion.html                     # Modal confirmación
    ├── filtros-transacciones.html                  # Filtros
    ├── tabla-clientes.html                         # Tabla clientes
    ├── tabla-activos-portafolio.html               # Tabla activos
    ├── tabla-transacciones.html                    # Tabla transacciones
    ├── tabla-reportes.html                         # Tabla reportes
    ├── tarjeta-activo.html                         # Tarjeta activo
    └── tarjeta-portafolio.html                     # Tarjeta portafolio
```

---

## 📋 Módulo Clientes (Obligatorio)

### **Campos del Cliente**

| **Campo** | **Obligatorio** | **Tipo** | **Validación** |
|-----------|-----------------|----------|----------------|
| `id` | ✅ Automático | String | Generado automáticamente (CLI-001) |
| `nombres` | ✅ Sí | String | No vacío |
| `apellidos` | ✅ Sí | String | No vacío |
| `identificacion` | ✅ Sí | String | Única, no vacío |
| `telefono` | ❌ No | String | Opcional |
| `celular` | ✅ Sí | String | No vacío |
| `correo` | ✅ Sí | Email | Formato válido, único |
| `direccion` | ❌ No | String | Opcional |
| `estadoCivil` | ✅ Sí | Select | soltero, casado, divorciado, separado, unión libre |
| `estado` | ✅ Sí | Select | activo, inactivo |
| `fecha_registro` | ✅ Automático | Date | Generado al registrar |

### **Funcionalidades del Módulo**

| **Funcionalidad** | **Estado** | **Descripción** |
|-------------------|------------|-----------------|
| Registrar clientes | ✅ | Formulario completo con validaciones |
| Listar clientes | ✅ | Tabla con paginación (10 elementos) |
| Buscar clientes | ✅ | Por nombres, apellidos o identificación |
| Consultar detalle | ✅ | Vista completa de todos los campos |
| Editar clientes | ✅ | Formulario precargado con validaciones |
| Cambiar estado civil | ✅ | Select con 5 opciones predefinidas |
| Cambiar estado | ✅ | Alternar entre activo e inactivo |

---

## 📱 Funcionalidades Principales

### **Para Inversionistas**
- 📊 Dashboard con resumen de inversiones
- 📈 **Mercado de inversiones** con gráficos en tiempo real
- 💼 Gestión de portafolios (crear, editar, archivar)
- 💰 Compra y venta simulada de activos
- 📚 Consulta de reportes de investigación
- 👤 Edición de perfil personal
- 📝 Bitácora de acciones

### **Para Administradores**
- 📊 Panel con estadísticas generales
- 👥 Gestión completa de clientes (CRUD)
- 📈 Gestión de activos (CRUD, actualización de precios)
- 📄 Gestión de reportes (CRUD, publicar/despublicar)
- 📝 Bitácora de acciones

---

## 📸 Capturas de Pantalla

### **Pantalla de Login con Credenciales**
![Login](screenshots/login.png)

### **Dashboard Inversionista**
![Dashboard](screenshots/dashboard.png)

### **Mercado de Inversiones**
![Mercado](screenshots/mercado.png)

### **Panel de Administración**
![Admin Panel](screenshots/admin-panel.png)

---

## 🚧 Próximas Fases

| **Fase** | **Descripción** | **Tecnologías** | **Estado** |
|----------|-----------------|-----------------|------------|
| **Fase 1** | Frontend | HTML5, CSS3, JavaScript, Bootstrap, JSON | ✅ Completado |
| **Fase 2** | Backend | Django, PostgreSQL, Python | ⏳ Pendiente |
| **Fase 3** | API REST | Django REST Framework, JWT | ⏳ Pendiente |
| **Fase 4** | App Móvil | React Native, Expo | ⏳ Pendiente |

---

## 📞 Contacto

- **Nombre:** [Tu nombre completo]
- **Correo:** [tu.email@ejemplo.com]
- **Universidad:** [Nombre de tu universidad]
- **Asignatura:** Desarrollo de Aplicaciones Web y Móviles
- **Año:** 2026

---

## 🙏 Agradecimientos

- A los **profesores y tutores** del curso por su guía y enseñanza
- A los **compañeros de clase** por el feedback y colaboración
- A **Bootstrap, Tailwind, DaisyUI, Chart.js y Font Awesome** por sus excelentes herramientas

---

**InvestCapital Hub** - "Aprende a invertir sin riesgos" 🚀
```

---

## 📋 GUÍA RÁPIDA DE USO

| **Pantalla** | **Acción** |
|--------------|------------|
| **Login** | Usa las credenciales mostradas en pantalla |
| **Dashboard** | Ver resumen de inversiones |
| **Mercado** | Ver activos, comprar, actualizar precios |
| **Portafolios** | Crear y gestionar portafolios |
| **Admin Panel** | Gestionar clientes, activos y reportes |

---

**¡El README está completo y listo para usar!** 🚀