"""
URL configuration for investcapital_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

# Vista para la raíz
def home_view(request):
    return HttpResponse(
        "<h1>🚀 InvestCapital Hub API</h1>"
        "<p>Bienvenido a la API de InvestCapital Hub</p>"
        "<p>Endpoints disponibles:</p>"
        "<ul>"
        "<li><strong>POST /api/login/</strong> - Iniciar sesión</li>"
        "<li><strong>GET /api/activos/</strong> - Listar activos</li>"
        "<li><strong>GET /api/clientes/</strong> - Listar clientes</li>"
        "<li><strong>GET /api/portafolios/</strong> - Listar portafolios</li>"
        "<li><strong>GET /api/admin/estadisticas/</strong> - Estadísticas admin</li>"
        "</ul>"
        "<p><a href='/admin/'>Ir al panel de administración</a></p>"
    )

urlpatterns = [
    path('', home_view, name='home'),  # ← Agregar esta línea
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]