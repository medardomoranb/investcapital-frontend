"""
Serializers para la API - InvestCapital Hub
"""

from rest_framework import serializers
from .models import *

# ============================================
# USUARIO Y AUTENTICACIÓN
# ============================================

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'correo', 'rol']


class LoginSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    password = serializers.CharField()


# ============================================
# CLIENTES
# ============================================

class ClienteSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()
    usuario = UsuarioSerializer(read_only=True)

    class Meta:
        model = Cliente
        fields = '__all__'

    def get_nombre_completo(self, obj):
        return f"{obj.nombres} {obj.apellidos}"


# ============================================
# ACTIVOS
# ============================================

class ActivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activo
        fields = '__all__'


class PrecioHistoricoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrecioHistorico
        fields = '__all__'


# ============================================
# PORTAFOLIOS
# ============================================

class PortafolioActivoSerializer(serializers.ModelSerializer):
    activo = ActivoSerializer(read_only=True)
    activo_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = PortafolioActivo
        fields = ['id', 'activo', 'activo_id', 'cantidad', 'precio_compra', 'fecha_compra']


class PortafolioSerializer(serializers.ModelSerializer):
    portafolio_activos = PortafolioActivoSerializer(many=True, read_only=True)
    valor_total_invertido = serializers.SerializerMethodField()
    valor_actual_total = serializers.SerializerMethodField()
    rendimiento_porcentual = serializers.SerializerMethodField()

    class Meta:
        model = Portafolio
        fields = ['id', 'nombre', 'descripcion', 'estado', 'fecha_creacion', 
                  'portafolio_activos', 'valor_total_invertido', 'valor_actual_total', 
                  'rendimiento_porcentual']

    def get_valor_total_invertido(self, obj):
        total = 0
        for pa in obj.portafolio_activos.all():
            total += pa.cantidad * pa.precio_compra
        return round(total, 2)

    def get_valor_actual_total(self, obj):
        total = 0
        for pa in obj.portafolio_activos.all():
            total += pa.cantidad * pa.activo.precio_actual
        return round(total, 2)

    def get_rendimiento_porcentual(self, obj):
        invertido = self.get_valor_total_invertido(obj)
        actual = self.get_valor_actual_total(obj)
        if invertido > 0:
            return round(((actual - invertido) / invertido) * 100, 2)
        return 0


# ============================================
# TRANSACCIONES
# ============================================

class TransaccionSerializer(serializers.ModelSerializer):
    activo_nombre = serializers.CharField(source='activo.nombre', read_only=True)
    activo_codigo = serializers.CharField(source='activo.codigo', read_only=True)

    class Meta:
        model = Transaccion
        fields = '__all__'


# ============================================
# REPORTES
# ============================================

class ReporteActivoSerializer(serializers.ModelSerializer):
    activo = ActivoSerializer(read_only=True)

    class Meta:
        model = ReporteActivo
        fields = ['id', 'activo']


class ReporteSerializer(serializers.ModelSerializer):
    activos_relacionados = serializers.SerializerMethodField()

    class Meta:
        model = Reporte
        fields = '__all__'

    def get_activos_relacionados(self, obj):
        return [ra.activo.id for ra in obj.reporte_activos.all()]


# ============================================
# BITÁCORA
# ============================================

class BitacoraSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.nombre', read_only=True)

    class Meta:
        model = Bitacora
        fields = '__all__'


# ============================================
# ESTADÍSTICAS
# ============================================

class EstadisticasSerializer(serializers.Serializer):
    total_clientes = serializers.IntegerField()
    clientes_activos = serializers.IntegerField()
    total_portafolios = serializers.IntegerField()
    total_transacciones = serializers.IntegerField()
    total_reportes = serializers.IntegerField()