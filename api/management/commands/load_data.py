"""
Comando para cargar datos iniciales en la base de datos
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from api.models import *
import random
from datetime import datetime, timedelta


class Command(BaseCommand):
    help = 'Carga datos iniciales en la base de datos'

    def handle(self, *args, **options):
        self.stdout.write('🚀 Cargando datos iniciales...')

        # ============================================
        # 1. USUARIOS
        # ============================================
        self.stdout.write('📝 Creando usuarios...')

        # Admin
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={'email': 'admin@investcapital.com'}
        )
        admin_user.set_password('admin1234')
        admin_user.save()

        admin_usuario, _ = Usuario.objects.get_or_create(
            correo='admin@investcapital.com',
            defaults={
                'user': admin_user,
                'nombre': 'Administrador',
                'rol': 'administrador'
            }
        )

        # Inversionista
        inv_user, _ = User.objects.get_or_create(
            username='ana.martinez',
            defaults={'email': 'ana.martinez@email.com'}
        )
        inv_user.set_password('password123')
        inv_user.save()

        inv_usuario, _ = Usuario.objects.get_or_create(
            correo='ana.martinez@email.com',
            defaults={
                'user': inv_user,
                'nombre': 'Ana Martínez',
                'rol': 'inversionista'
            }
        )

        self.stdout.write('✅ Usuarios creados')

        # ============================================
        # 2. ADMINISTRADOR
        # ============================================
        admin_obj, _ = Administrador.objects.get_or_create(
            usuario=admin_usuario,
            defaults={
                'nombres': 'Administrador',
                'apellidos': 'Sistema',
                'correo': 'admin@investcapital.com',
                'telefono': '0999999999'
            }
        )

        # ============================================
        # 3. CLIENTE
        # ============================================
        cliente, _ = Cliente.objects.get_or_create(
            usuario=inv_usuario,
            defaults={
                'nombres': 'Ana',
                'apellidos': 'Martínez',
                'identificacion': '1234567890',
                'telefono': '022345678',
                'celular': '0987654321',
                'correo': 'ana.martinez@email.com',
                'direccion': 'Calle Principal 123, Quito',
                'estadoCivil': 'soltero',
                'estado': 'activo'
            }
        )

        self.stdout.write('✅ Cliente creado')

        # ============================================
        # 4. ACTIVOS
        # ============================================
        self.stdout.write('📊 Creando activos...')

        activos_data = [
            {'codigo': 'AAPL', 'nombre': 'Apple Inc.', 'tipo': 'acción', 'precio_actual': 175.50},
            {'codigo': 'GOOGL', 'nombre': 'Alphabet Inc.', 'tipo': 'acción', 'precio_actual': 142.80},
            {'codigo': 'MSFT', 'nombre': 'Microsoft Corp.', 'tipo': 'acción', 'precio_actual': 380.25},
            {'codigo': 'AMZN', 'nombre': 'Amazon.com Inc.', 'tipo': 'acción', 'precio_actual': 185.90},
            {'codigo': 'TSLA', 'nombre': 'Tesla Inc.', 'tipo': 'acción', 'precio_actual': 240.60},
            {'codigo': 'BTC-USD', 'nombre': 'Bitcoin', 'tipo': 'criptomoneda', 'precio_actual': 68250.00},
            {'codigo': 'ETH-USD', 'nombre': 'Ethereum', 'tipo': 'criptomoneda', 'precio_actual': 3850.00},
            {'codigo': 'SOL-USD', 'nombre': 'Solana', 'tipo': 'criptomoneda', 'precio_actual': 168.20},
            {'codigo': 'SPY', 'nombre': 'S&P 500 ETF', 'tipo': 'ETF', 'precio_actual': 478.50},
            {'codigo': 'QQQ', 'nombre': 'Nasdaq ETF', 'tipo': 'ETF', 'precio_actual': 435.80},
        ]

        for a in activos_data:
            activo, _ = Activo.objects.get_or_create(
                codigo=a['codigo'],
                defaults={
                    'nombre': a['nombre'],
                    'tipo': a['tipo'],
                    'precio_actual': a['precio_actual']
                }
            )
            self.stdout.write(f'   ✅ {a["codigo"]} - {a["nombre"]}')

        self.stdout.write('✅ Activos creados')

        # ============================================
        # 5. PRECIOS HISTÓRICOS
        # ============================================
        self.stdout.write('📈 Generando precios históricos...')

        for activo in Activo.objects.all():
            precio = float(activo.precio_actual)
            for i in range(30, 0, -1):
                fecha = timezone.now().date() - timedelta(days=i)
                variacion = (random.random() * 6) - 3
                precio = precio * (1 + variacion / 100)
                PrecioHistorico.objects.get_or_create(
                    activo=activo,
                    fecha=fecha,
                    defaults={'precio': round(precio, 2)}
                )

        self.stdout.write('✅ Precios históricos generados')

        # ============================================
        # 6. PORTAFOLIO
        # ============================================
        portafolio, _ = Portafolio.objects.get_or_create(
            cliente=cliente,
            nombre='Portafolio de Crecimiento',
            defaults={
                'descripcion': 'Inversiones a largo plazo en tecnología',
                'estado': 'activo'
            }
        )

        self.stdout.write('✅ Portafolio creado')

        # ============================================
        # 7. PORTAFOLIO - ACTIVOS
        # ============================================
        aapl = Activo.objects.get(codigo='AAPL')
        btc = Activo.objects.get(codigo='BTC-USD')
        spy = Activo.objects.get(codigo='SPY')

        PortafolioActivo.objects.get_or_create(
            portafolio=portafolio,
            activo=aapl,
            defaults={'cantidad': 10, 'precio_compra': 168.50}
        )

        PortafolioActivo.objects.get_or_create(
            portafolio=portafolio,
            activo=btc,
            defaults={'cantidad': 0.05, 'precio_compra': 67000.00}
        )

        PortafolioActivo.objects.get_or_create(
            portafolio=portafolio,
            activo=spy,
            defaults={'cantidad': 5, 'precio_compra': 470.00}
        )

        self.stdout.write('✅ Activos agregados al portafolio')

        # ============================================
        # 8. TRANSACCIONES
        # ============================================
        Transaccion.objects.get_or_create(
            portafolio=portafolio,
            activo=aapl,
            cliente=cliente,
            tipo='compra',
            defaults={
                'cantidad': 10,
                'precio_unitario': 168.50,
                'monto_total': 1685.00,
                'estado': 'completada'
            }
        )

        Transaccion.objects.get_or_create(
            portafolio=portafolio,
            activo=btc,
            cliente=cliente,
            tipo='compra',
            defaults={
                'cantidad': 0.05,
                'precio_unitario': 67000.00,
                'monto_total': 3350.00,
                'estado': 'completada'
            }
        )

        self.stdout.write('✅ Transacciones creadas')

        # ============================================
        # 9. REPORTES
        # ============================================
        reporte1, _ = Reporte.objects.get_or_create(
            titulo='Análisis de Apple Inc.',
            defaults={
                'administrador': admin_obj,
                'resumen': 'Apple muestra un crecimiento sostenido en servicios y nuevas tecnologías.',
                'contenido': 'Apple Inc. (AAPL) continúa su tendencia alcista en el Q3 2026. La compañía ha mostrado un crecimiento sostenido en su división de servicios, que representa cada vez más porcentaje de sus ingresos totales. El lanzamiento de nuevos productos y la expansión en mercados emergentes son factores clave para su crecimiento futuro. Se recomienda mantener la posición actual con un objetivo de precio de $200 para los próximos 12 meses.',
                'categoria': 'Análisis Fundamental',
                'estado': 'publicado',
                'visualizaciones': 145
            }
        )

        reporte2, _ = Reporte.objects.get_or_create(
            titulo='Guía básica de inversión en ETFs',
            defaults={
                'administrador': admin_obj,
                'resumen': 'Aprende qué son los ETFs y cómo invertir en ellos para diversificar tu portafolio.',
                'contenido': 'Los ETFs (Exchange Traded Funds) son fondos cotizados que permiten a los inversionistas diversificar su portafolio de manera sencilla y con bajos costos. En esta guía aprenderás qué son, cómo funcionan y cuáles son los mejores ETFs para comenzar a invertir. Los ETFs más recomendados para principiantes son SPY, QQQ y VTI.',
                'categoria': 'Educativo',
                'estado': 'publicado',
                'visualizaciones': 320
            }
        )

        ReporteActivo.objects.get_or_create(reporte=reporte1, activo=aapl)
        ReporteActivo.objects.get_or_create(reporte=reporte2, activo=spy)

        self.stdout.write('✅ Reportes creados')

        # ============================================
        # 10. BITÁCORA
        # ============================================
        Bitacora.objects.get_or_create(
            usuario=inv_usuario,
            nombre='Inicio de Sesión',
            defaults={
                'descripcion': 'El usuario Ana Martínez inició sesión como inversionista',
                'detalles': 'Correo: ana.martinez@email.com'
            }
        )

        self.stdout.write('✅ Bitácora creada')

        # ============================================
        # RESUMEN FINAL
        # ============================================
        self.stdout.write('')
        self.stdout.write('=' * 50)
        self.stdout.write('✅ DATOS CARGADOS EXITOSAMENTE!')
        self.stdout.write('=' * 50)
        self.stdout.write(f'👤 Usuarios: {Usuario.objects.count()}')
        self.stdout.write(f'👥 Clientes: {Cliente.objects.count()}')
        self.stdout.write(f'📊 Activos: {Activo.objects.count()}')
        self.stdout.write(f'💼 Portafolios: {Portafolio.objects.count()}')
        self.stdout.write(f'📈 Transacciones: {Transaccion.objects.count()}')
        self.stdout.write(f'📄 Reportes: {Reporte.objects.count()}')
        self.stdout.write('')
        self.stdout.write('🔐 Credenciales:')
        self.stdout.write('   Admin: admin@investcapital.com / admin1234')
        self.stdout.write('   Inversionista: ana.martinez@email.com / password123')
        self.stdout.write('')
        self.stdout.write('🚀 Servidor corriendo en: http://127.0.0.1:8000/')
        self.stdout.write('=' * 50)