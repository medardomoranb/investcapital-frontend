"""
Modelos de la base de datos - InvestCapital Hub
"""

from django.db import models
from django.contrib.auth.models import User

# ============================================
# ENUMS (Opciones predefinidas)
# ============================================

class EstadoCivil(models.TextChoices):
    SOLTERO = 'soltero', 'Soltero/a'
    CASADO = 'casado', 'Casado/a'
    DIVORCIADO = 'divorciado', 'Divorciado/a'
    SEPARADO = 'separado', 'Separado/a'
    UNION_LIBRE = 'unión libre', 'Unión Libre'

class EstadoCliente(models.TextChoices):
    ACTIVO = 'activo', 'Activo'
    INACTIVO = 'inactivo', 'Inactivo'

class EstadoActivo(models.TextChoices):
    ACTIVO = 'activo', 'Activo'
    INACTIVO = 'inactivo', 'Inactivo'

class EstadoPortafolio(models.TextChoices):
    ACTIVO = 'activo', 'Activo'
    ARCHIVADO = 'archivado', 'Archivado'

class EstadoReporte(models.TextChoices):
    PUBLICADO = 'publicado', 'Publicado'
    DESPUBLICADO = 'despublicado', 'Despublicado'

class TipoActivo(models.TextChoices):
    ACCION = 'acción', 'Acción'
    CRIPTOMONEDA = 'criptomoneda', 'Criptomoneda'
    ETF = 'ETF', 'ETF'
    BONO = 'bono', 'Bono'

class CategoriaReporte(models.TextChoices):
    FUNDAMENTAL = 'Análisis Fundamental', 'Análisis Fundamental'
    TECNICO = 'Análisis Técnico', 'Análisis Técnico'
    SECTORIAL = 'Análisis Sectorial', 'Análisis Sectorial'
    EDUCATIVO = 'Educativo', 'Educativo'
    GENERAL = 'General', 'General'

class TipoTransaccion(models.TextChoices):
    COMPRA = 'compra', 'Compra'
    VENTA = 'venta', 'Venta'

class EstadoTransaccion(models.TextChoices):
    COMPLETADA = 'completada', 'Completada'

# ============================================
# MODELOS
# ============================================

class Usuario(models.Model):
    """
    Usuario del sistema (autenticación)
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    correo = models.EmailField(unique=True)
    nombre = models.CharField(max_length=100)
    rol = models.CharField(max_length=20, choices=[('administrador', 'Administrador'), ('inversionista', 'Inversionista')])
    ultimo_acceso = models.DateTimeField(null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} ({self.correo})"

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'


class Cliente(models.Model):
    """
    Cliente (Inversionista)
    """
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='cliente')
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    identificacion = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    celular = models.CharField(max_length=20)
    correo = models.EmailField(unique=True)
    direccion = models.TextField(blank=True, null=True)
    estadoCivil = models.CharField(max_length=20, choices=EstadoCivil.choices)
    estado = models.CharField(max_length=10, choices=EstadoCliente.choices, default=EstadoCliente.ACTIVO)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"

    @property
    def nombre_completo(self):
        return f"{self.nombres} {self.apellidos}"

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'


class Administrador(models.Model):
    """
    Administrador del sistema
    """
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='administrador')
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    correo = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"

    @property
    def nombre_completo(self):
        return f"{self.nombres} {self.apellidos}"

    class Meta:
        verbose_name = 'Administrador'
        verbose_name_plural = 'Administradores'


class Activo(models.Model):
    """
    Activo financiero
    """
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TipoActivo.choices)
    precio_actual = models.DecimalField(max_digits=15, decimal_places=2)
    variacion_diaria = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    variacion_semanal = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    variacion_mensual = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    variacion_anual = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    estado = models.CharField(max_length=10, choices=EstadoActivo.choices, default=EstadoActivo.ACTIVO)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

    class Meta:
        verbose_name = 'Activo'
        verbose_name_plural = 'Activos'


class PrecioHistorico(models.Model):
    """
    Precio histórico de un activo (para gráficos)
    """
    activo = models.ForeignKey(Activo, on_delete=models.CASCADE, related_name='precios_historicos')
    precio = models.DecimalField(max_digits=15, decimal_places=2)
    fecha = models.DateField()

    def __str__(self):
        return f"{self.activo.codigo} - {self.fecha}: ${self.precio}"

    class Meta:
        verbose_name = 'Precio Histórico'
        verbose_name_plural = 'Precios Históricos'
        ordering = ['-fecha']


class Portafolio(models.Model):
    """
    Portafolio de inversión de un cliente
    """
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='portafolios')
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    estado = models.CharField(max_length=10, choices=EstadoPortafolio.choices, default=EstadoPortafolio.ACTIVO)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombre} - {self.cliente.nombre_completo}"

    class Meta:
        verbose_name = 'Portafolio'
        verbose_name_plural = 'Portafolios'


class PortafolioActivo(models.Model):
    """
    Tabla intermedia: Portafolio - Activo
    """
    portafolio = models.ForeignKey(Portafolio, on_delete=models.CASCADE, related_name='portafolio_activos')
    activo = models.ForeignKey(Activo, on_delete=models.CASCADE, related_name='portafolio_activos')
    cantidad = models.DecimalField(max_digits=20, decimal_places=8)
    precio_compra = models.DecimalField(max_digits=15, decimal_places=2)
    fecha_compra = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.portafolio.nombre} - {self.activo.codigo}"

    class Meta:
        verbose_name = 'Portafolio Activo'
        verbose_name_plural = 'Portafolio Activos'
        unique_together = ['portafolio', 'activo']


class Transaccion(models.Model):
    """
    Transacción simulada (compra/venta)
    """
    portafolio = models.ForeignKey(Portafolio, on_delete=models.CASCADE, related_name='transacciones')
    activo = models.ForeignKey(Activo, on_delete=models.CASCADE, related_name='transacciones')
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='transacciones')
    tipo = models.CharField(max_length=10, choices=TipoTransaccion.choices)
    cantidad = models.DecimalField(max_digits=20, decimal_places=8)
    precio_unitario = models.DecimalField(max_digits=15, decimal_places=2)
    monto_total = models.DecimalField(max_digits=20, decimal_places=2)
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=15, choices=EstadoTransaccion.choices, default=EstadoTransaccion.COMPLETADA)

    def __str__(self):
        return f"{self.tipo} - {self.activo.codigo} - {self.cliente.nombre_completo}"

    class Meta:
        verbose_name = 'Transacción'
        verbose_name_plural = 'Transacciones'
        ordering = ['-fecha']


class Reporte(models.Model):
    """
    Reporte de investigación
    """
    administrador = models.ForeignKey(Administrador, on_delete=models.CASCADE, related_name='reportes')
    titulo = models.CharField(max_length=200)
    resumen = models.TextField()
    contenido = models.TextField()
    categoria = models.CharField(max_length=50, choices=CategoriaReporte.choices)
    fecha_publicacion = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=15, choices=EstadoReporte.choices, default=EstadoReporte.PUBLICADO)
    visualizaciones = models.IntegerField(default=0)

    def __str__(self):
        return self.titulo

    class Meta:
        verbose_name = 'Reporte'
        verbose_name_plural = 'Reportes'


class ReporteActivo(models.Model):
    """
    Tabla intermedia: Reporte - Activo
    """
    reporte = models.ForeignKey(Reporte, on_delete=models.CASCADE, related_name='reporte_activos')
    activo = models.ForeignKey(Activo, on_delete=models.CASCADE, related_name='reporte_activos')

    def __str__(self):
        return f"{self.reporte.titulo} - {self.activo.codigo}"

    class Meta:
        verbose_name = 'Reporte Activo'
        verbose_name_plural = 'Reporte Activos'
        unique_together = ['reporte', 'activo']


class Bitacora(models.Model):
    """
    Bitácora de acciones del usuario
    """
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='bitacora')
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    detalles = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)
    ip = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.nombre} - {self.usuario.nombre}"

    class Meta:
        verbose_name = 'Bitácora'
        verbose_name_plural = 'Bitácoras'
        ordering = ['-fecha']


class User2FA(models.Model):
    """Configuración de 2FA con TOTP"""
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='twofa')
    secret = models.CharField(max_length=100, blank=True, null=True)
    habilitado = models.BooleanField(default=False)
    
    def __str__(self):
        return f"2FA - {self.usuario.nombre}"
    