from django.urls import path
from . import views

urlpatterns = [
    # ============================================
    # AUTENTICACIÓN JWT + 2FA
    # ============================================
    path('auth/login/', views.login_jwt, name='login_jwt'),
    path('auth/verificar-2fa/', views.verificar_2fa, name='verificar_2fa'),
    path('auth/configurar-2fa/', views.configurar_2fa, name='configurar_2fa'),
    path('auth/activar-2fa/', views.activar_2fa, name='activar_2fa'),
    path('auth/desactivar-2fa/', views.desactivar_2fa, name='desactivar_2fa'),
    path('auth/generar-qr/', views.generar_qr_2fa, name='generar_qr_2fa'),
    
    # Compatibilidad con frontend actual
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
    path('me/', views.me_view, name='me'),

    # ============================================
    # CLIENTES
    # ============================================
    path('clientes/', views.clientes_list, name='clientes_list'),
    path('clientes/<int:id>/', views.cliente_detail, name='cliente_detail'),
    path('clientes/<int:id>/estado/', views.cliente_estado, name='cliente_estado'),

    # ============================================
    # ACTIVOS
    # ============================================
    path('activos/', views.activos_list, name='activos_list'),
    path('activos/<int:id>/', views.activo_detail, name='activo_detail'),
    path('activos/<int:activo_id>/historial/', views.historial_precios, name='historial_precios'),
    path('activos/actualizar-precios/', views.actualizar_precios, name='actualizar_precios'),

    # ============================================
    # PORTAFOLIOS
    # ============================================
    path('portafolios/', views.portafolios_list, name='portafolios_list'),
    path('portafolios/<int:id>/', views.portafolio_detail, name='portafolio_detail'),
    path('portafolios/crear/', views.portafolio_create, name='portafolio_create'),
    path('portafolios/<int:id>/archivar/', views.portafolio_archivar, name='portafolio_archivar'),
    path('portafolios/<int:id>/update/', views.portafolio_update, name='portafolio_update'),

    # ============================================
    # TRANSACCIONES
    # ============================================
    path('transacciones/comprar/', views.comprar_activo, name='comprar_activo'),
    path('transacciones/vender/', views.vender_activo, name='vender_activo'),
    path('transacciones/historial/<int:portafolio_id>/', views.historial_transacciones, name='historial_transacciones'),

    # ============================================
    # REPORTES
    # ============================================
    path('reportes/', views.reportes_list, name='reportes_list'),
    path('reportes/<int:id>/', views.reporte_detail, name='reporte_detail'),
    path('reportes/<int:id>/visualizar/', views.reporte_visualizar, name='reporte_visualizar'),

    # ============================================
    # BITÁCORA
    # ============================================
    path('bitacora/', views.bitacora_list, name='bitacora_list'),
    path('bitacora/crear/', views.bitacora_create, name='bitacora_create'),
    path('bitacora/limpiar/', views.bitacora_limpiar, name='bitacora_limpiar'),

    # ============================================
    # ESTADÍSTICAS (ADMIN)
    # ============================================
    path('admin/estadisticas/', views.estadisticas_admin, name='estadisticas_admin'),
]