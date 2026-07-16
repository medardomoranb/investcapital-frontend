"""
Vistas de la API - InvestCapital Hub
"""

from django.shortcuts import get_object_or_404
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.db.models import Count, Sum, Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import *
from .serializers import *
import random
from datetime import datetime, timedelta
import pyotp

# ============================================
# AUTENTICACIÓN CON 2FA
# ============================================

@api_view(['POST'])
@permission_classes([AllowAny])
def login_jwt(request):
    """Login con JWT y 2FA"""
    correo = request.data.get('correo')
    password = request.data.get('password')
    
    if not correo or not password:
        return Response({'error': 'Correo y contraseña son obligatorios'}, status=400)
    
    try:
        usuario = Usuario.objects.get(correo=correo)
        user = usuario.user
        
        if not user.check_password(password):
            return Response({'error': 'Contraseña incorrecta'}, status=401)
        
        # Verificar si tiene 2FA
        twofa, created = User2FA.objects.get_or_create(usuario=usuario)
        
        # CASO 1: No tiene secret → Generar y mostrar QR
        if not twofa.secret:
            import pyotp
            secret = pyotp.random_base32()
            twofa.secret = secret
            twofa.save()
            
            totp = pyotp.TOTP(secret)
            otp_auth_url = totp.provisioning_uri(usuario.correo, issuer_name="InvestCapital Hub")
            
            return Response({
                'requires_setup_2fa': True,
                'usuario_id': usuario.id,
                'secret': secret,
                'otp_auth_url': otp_auth_url,
                'mensaje': 'Escanea el QR con Google Authenticator'
            })
        
        # CASO 2: Tiene secret pero no activado → Mostrar QR para activar
        if twofa.secret and not twofa.habilitado:
            import pyotp
            totp = pyotp.TOTP(twofa.secret)
            otp_auth_url = totp.provisioning_uri(usuario.correo, issuer_name="InvestCapital Hub")
            
            return Response({
                'requires_setup_2fa': True,
                'usuario_id': usuario.id,
                'secret': twofa.secret,
                'otp_auth_url': otp_auth_url,
                'mensaje': 'Escanea el QR con Google Authenticator para activar 2FA'
            })
        
        # CASO 3: Tiene 2FA activado → Pedir código
        if twofa.habilitado:
            return Response({
                'requires_2fa': True,
                'usuario_id': usuario.id,
                'mensaje': 'Ingresa el código de autenticación de tu app (Google Authenticator)'
            })
        
        # CASO 4: Sin 2FA (fallback)
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'usuario': {
                'id': usuario.id,
                'nombre': usuario.nombre,
                'correo': usuario.correo,
                'rol': usuario.rol
            }
        })
        
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
    

@api_view(['POST'])
@permission_classes([AllowAny])
def verificar_2fa(request):
    """Verificar código TOTP de Google/Microsoft Authenticator"""
    usuario_id = request.data.get('usuario_id')
    codigo = request.data.get('codigo')
    
    if not usuario_id or not codigo:
        return Response({'error': 'Usuario y código son obligatorios'}, status=400)
    
    try:
        usuario = Usuario.objects.get(id=usuario_id)
        twofa = User2FA.objects.get(usuario=usuario)
        
        if not twofa.secret:
            return Response({'error': '2FA no configurado para este usuario'}, status=400)
        
        # Verificar código TOTP
        totp = pyotp.TOTP(twofa.secret)
        if not totp.verify(codigo):
            return Response({'error': 'Código incorrecto'}, status=401)
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(usuario.user)
        
        return Response({
            'success': True,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'usuario': {
                'id': usuario.id,
                'nombre': usuario.nombre,
                'correo': usuario.correo,
                'rol': usuario.rol
            }
        })
        
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    except User2FA.DoesNotExist:
        return Response({'error': '2FA no configurado'}, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def configurar_2fa(request):
    """Generar secret y QR para Google Authenticator"""
    usuario_id = request.data.get('usuario_id')
    
    if not usuario_id:
        return Response({'error': 'Usuario ID es obligatorio'}, status=400)
    
    try:
        usuario = Usuario.objects.get(id=usuario_id)
        twofa, _ = User2FA.objects.get_or_create(usuario=usuario)
        
        # Generar nuevo secret
        secret = pyotp.random_base32()
        twofa.secret = secret
        twofa.save()
        
        # Generar URL para QR
        totp = pyotp.TOTP(secret)
        otp_auth_url = totp.provisioning_uri(usuario.correo, issuer_name="InvestCapital Hub")
        
        return Response({
            'success': True,
            'secret': secret,
            'otp_auth_url': otp_auth_url,
            'mensaje': 'Escanea el QR con Google Authenticator o Microsoft Authenticator'
        })
        
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)


@api_view(['POST'])
@permission_classes([AllowAny])
def activar_2fa(request):
    """Activar 2FA después de verificar el código"""
    usuario_id = request.data.get('usuario_id')
    codigo = request.data.get('codigo')
    
    if not usuario_id or not codigo:
        return Response({'error': 'Usuario y código son obligatorios'}, status=400)
    
    try:
        usuario = Usuario.objects.get(id=usuario_id)
        twofa = User2FA.objects.get(usuario=usuario)
        
        if not twofa.secret:
            return Response({'error': 'No hay secret configurado'}, status=400)
        
        # Verificar código
        totp = pyotp.TOTP(twofa.secret)
        if not totp.verify(codigo):
            return Response({'error': 'Código incorrecto'}, status=401)
        
        # Activar 2FA
        twofa.habilitado = True
        twofa.save()
        
        return Response({
            'success': True,
            'mensaje': '2FA activado correctamente'
        })
        
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    except User2FA.DoesNotExist:
        return Response({'error': '2FA no configurado'}, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def desactivar_2fa(request):
    """Desactivar 2FA"""
    usuario_id = request.data.get('usuario_id')
    
    if not usuario_id:
        return Response({'error': 'Usuario ID es obligatorio'}, status=400)
    
    try:
        usuario = Usuario.objects.get(id=usuario_id)
        twofa = User2FA.objects.get(usuario=usuario)
        
        twofa.habilitado = False
        twofa.secret = None
        twofa.save()
        
        return Response({
            'success': True,
            'mensaje': '2FA desactivado correctamente'
        })
        
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    except User2FA.DoesNotExist:
        return Response({'error': '2FA no configurado'}, status=400)


# ============================================
# AUTH COMPATIBILIDAD CON EL FRONTEND ACTUAL
# ============================================

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login para compatibilidad con el frontend actual"""
    return login_jwt(request)


@api_view(['POST'])
def logout_view(request):
    """Cierre de sesión"""
    logout(request)
    return Response({'success': True, 'message': 'Sesión cerrada'})


@api_view(['GET'])
def me_view(request):
    """Obtener usuario actual"""
    if not request.user.is_authenticated:
        return Response({'error': 'No autenticado'}, status=401)
    
    try:
        usuario = Usuario.objects.get(user=request.user)
        return Response(UsuarioSerializer(usuario).data)
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Registro de nuevo cliente"""
    data = request.data

    required_fields = ['nombres', 'apellidos', 'identificacion', 'celular', 'correo', 'estadoCivil', 'estado']
    for field in required_fields:
        if not data.get(field):
            return Response({'error': f'Campo {field} es obligatorio'}, status=400)

    if Usuario.objects.filter(correo=data['correo']).exists():
        return Response({'error': 'El correo ya está registrado'}, status=400)

    if Cliente.objects.filter(identificacion=data['identificacion']).exists():
        return Response({'error': 'La identificación ya está registrada'}, status=400)

    username = data['correo'].split('@')[0]
    user = User.objects.create_user(
        username=username,
        email=data['correo'],
        password=data.get('password', 'password123')
    )

    usuario = Usuario.objects.create(
        user=user,
        correo=data['correo'],
        nombre=data['nombres'],
        rol='inversionista'
    )

    cliente = Cliente.objects.create(
        usuario=usuario,
        nombres=data['nombres'],
        apellidos=data['apellidos'],
        identificacion=data['identificacion'],
        telefono=data.get('telefono', ''),
        celular=data['celular'],
        correo=data['correo'],
        direccion=data.get('direccion', ''),
        estadoCivil=data['estadoCivil'],
        estado=data['estado']
    )

    return Response({
        'success': True,
        'message': 'Cliente registrado exitosamente',
        'cliente': ClienteSerializer(cliente).data
    })


# ============================================
# CLIENTES
# ============================================

@api_view(['GET'])
def clientes_list(request):
    clientes = Cliente.objects.all()
    serializer = ClienteSerializer(clientes, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def cliente_detail(request, id):
    cliente = get_object_or_404(Cliente, id=id)
    return Response(ClienteSerializer(cliente).data)


@api_view(['PUT'])
def cliente_estado(request, id):
    cliente = get_object_or_404(Cliente, id=id)
    nuevo_estado = request.data.get('estado')
    
    if nuevo_estado not in ['activo', 'inactivo']:
        return Response({'error': 'Estado inválido'}, status=400)
    
    cliente.estado = nuevo_estado
    cliente.save()
    
    return Response(ClienteSerializer(cliente).data)


# ============================================
# ACTIVOS
# ============================================

@api_view(['GET'])
def activos_list(request):
    activos = Activo.objects.all()
    serializer = ActivoSerializer(activos, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def activo_detail(request, id):
    activo = get_object_or_404(Activo, id=id)
    return Response(ActivoSerializer(activo).data)


@api_view(['GET'])
def historial_precios(request, activo_id):
    try:
        activo = Activo.objects.get(id=activo_id)
        precios = PrecioHistorico.objects.filter(activo=activo).order_by('fecha')
        
        data = {
            'codigo': activo.codigo,
            'nombre': activo.nombre,
            'precio_actual': float(activo.precio_actual),
            'fechas': [p.fecha.strftime('%Y-%m-%d') for p in precios],
            'precios': [float(p.precio) for p in precios]
        }
        return Response(data)
    except Activo.DoesNotExist:
        return Response({'error': 'Activo no encontrado'}, status=404)


@api_view(['POST'])
def actualizar_precios(request):
    import random
    from datetime import date
    
    activos = Activo.objects.all()
    contador = 0
    
    for activo in activos:
        variacion = (random.random() * 6) - 3
        precio_actual_float = float(activo.precio_actual)
        nuevo_precio = precio_actual_float * (1 + variacion / 100)
        nuevo_precio = round(nuevo_precio, 2)
        
        activo.precio_actual = nuevo_precio
        activo.variacion_diaria = round(variacion, 2)
        activo.save()
        
        PrecioHistorico.objects.create(
            activo=activo,
            precio=nuevo_precio,
            fecha=date.today()
        )
        contador += 1
    
    return Response({
        'success': True,
        'message': 'Precios actualizados correctamente',
        'activos_actualizados': contador
    })


# ============================================
# PORTAFOLIOS
# ============================================

@api_view(['GET'])
def portafolios_list(request):
    cliente_id = request.query_params.get('cliente_id')
    if cliente_id:
        portafolios = Portafolio.objects.filter(cliente_id=cliente_id)
    else:
        portafolios = Portafolio.objects.all()
    
    serializer = PortafolioSerializer(portafolios, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def portafolio_detail(request, id):
    portafolio = get_object_or_404(Portafolio, id=id)
    return Response(PortafolioSerializer(portafolio).data)


@api_view(['POST'])
def portafolio_create(request):
    cliente_id = request.data.get('cliente_id')
    nombre = request.data.get('nombre')
    descripcion = request.data.get('descripcion', '')

    if not cliente_id or not nombre:
        return Response({'error': 'cliente_id y nombre son obligatorios'}, status=400)

    portafolio = Portafolio.objects.create(
        cliente_id=cliente_id,
        nombre=nombre,
        descripcion=descripcion
    )

    return Response(PortafolioSerializer(portafolio).data, status=201)


@api_view(['PUT'])
def portafolio_archivar(request, id):
    portafolio = get_object_or_404(Portafolio, id=id)
    portafolio.estado = 'archivado'
    portafolio.save()
    return Response(PortafolioSerializer(portafolio).data)


@api_view(['PUT'])
def portafolio_update(request, id):
    portafolio = get_object_or_404(Portafolio, id=id)
    nombre = request.data.get('nombre')
    if nombre:
        portafolio.nombre = nombre
        portafolio.save()
    return Response(PortafolioSerializer(portafolio).data)


# ============================================
# TRANSACCIONES
# ============================================

@api_view(['POST'])
def comprar_activo(request):
    data = request.data
    portafolio_id = data.get('portafolio_id')
    activo_id = data.get('activo_id')
    cliente_id = data.get('cliente_id')
    cantidad = data.get('cantidad')

    if not all([portafolio_id, activo_id, cliente_id, cantidad]):
        return Response({'error': 'Faltan campos obligatorios'}, status=400)

    portafolio = get_object_or_404(Portafolio, id=portafolio_id)
    activo = get_object_or_404(Activo, id=activo_id)
    cliente = get_object_or_404(Cliente, id=cliente_id)

    if float(cantidad) <= 0:
        return Response({'error': 'La cantidad debe ser mayor a 0'}, status=400)

    monto = float(cantidad) * float(activo.precio_actual)

    transaccion = Transaccion.objects.create(
        portafolio=portafolio,
        activo=activo,
        cliente=cliente,
        tipo='compra',
        cantidad=cantidad,
        precio_unitario=activo.precio_actual,
        monto_total=round(monto, 2)
    )

    pa, created = PortafolioActivo.objects.get_or_create(
        portafolio=portafolio,
        activo=activo,
        defaults={
            'cantidad': cantidad,
            'precio_compra': activo.precio_actual
        }
    )
    if not created:
        total_cantidad = pa.cantidad + cantidad
        total_precio = (pa.cantidad * pa.precio_compra) + (cantidad * activo.precio_actual)
        pa.cantidad = total_cantidad
        pa.precio_compra = round(total_precio / total_cantidad, 2)
        pa.save()

    return Response(TransaccionSerializer(transaccion).data)


@api_view(['POST'])
def vender_activo(request):
    data = request.data
    portafolio_id = data.get('portafolio_id')
    activo_id = data.get('activo_id')
    cliente_id = data.get('cliente_id')
    cantidad = data.get('cantidad')

    if not all([portafolio_id, activo_id, cliente_id, cantidad]):
        return Response({'error': 'Faltan campos obligatorios'}, status=400)

    portafolio = get_object_or_404(Portafolio, id=portafolio_id)
    activo = get_object_or_404(Activo, id=activo_id)
    cliente = get_object_or_404(Cliente, id=cliente_id)

    if float(cantidad) <= 0:
        return Response({'error': 'La cantidad debe ser mayor a 0'}, status=400)

    pa = get_object_or_404(PortafolioActivo, portafolio=portafolio, activo=activo)
    if pa.cantidad < cantidad:
        return Response({'error': 'No tiene suficientes unidades'}, status=400)

    monto = float(cantidad) * float(activo.precio_actual)

    transaccion = Transaccion.objects.create(
        portafolio=portafolio,
        activo=activo,
        cliente=cliente,
        tipo='venta',
        cantidad=cantidad,
        precio_unitario=activo.precio_actual,
        monto_total=round(monto, 2)
    )

    pa.cantidad -= cantidad
    if pa.cantidad <= 0:
        pa.delete()
    else:
        pa.save()

    return Response(TransaccionSerializer(transaccion).data)


@api_view(['GET'])
def historial_transacciones(request, portafolio_id):
    transacciones = Transaccion.objects.filter(portafolio_id=portafolio_id).order_by('-fecha')
    serializer = TransaccionSerializer(transacciones, many=True)
    return Response(serializer.data)


# ============================================
# REPORTES
# ============================================

@api_view(['GET'])
def reportes_list(request):
    reportes = Reporte.objects.filter(estado='publicado')
    serializer = ReporteSerializer(reportes, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def reporte_detail(request, id):
    reporte = get_object_or_404(Reporte, id=id)
    return Response(ReporteSerializer(reporte).data)


@api_view(['POST'])
def reporte_visualizar(request, id):
    reporte = get_object_or_404(Reporte, id=id)
    reporte.visualizaciones += 1
    reporte.save()
    return Response({'success': True, 'visualizaciones': reporte.visualizaciones})


# ============================================
# BITÁCORA
# ============================================

@api_view(['GET'])
def bitacora_list(request):
    usuario_id = request.query_params.get('usuario_id')
    if usuario_id:
        bitacora = Bitacora.objects.filter(usuario_id=usuario_id)
    else:
        bitacora = Bitacora.objects.all()
    
    serializer = BitacoraSerializer(bitacora.order_by('-fecha')[:50], many=True)
    return Response(serializer.data)


@api_view(['POST'])
def bitacora_limpiar(request):
    usuario_id = request.data.get('usuario_id')
    if usuario_id:
        Bitacora.objects.filter(usuario_id=usuario_id).delete()
    return Response({'success': True, 'message': 'Bitácora limpiada'})


@api_view(['POST'])
def bitacora_create(request):
    data = request.data
    usuario_id = data.get('usuario_id')
    nombre = data.get('nombre')
    descripcion = data.get('descripcion')
    detalles = data.get('detalles', '')
    
    if not usuario_id or not nombre:
        return Response({'error': 'usuario_id y nombre son obligatorios'}, status=400)
    
    usuario = get_object_or_404(Usuario, id=usuario_id)
    bitacora = Bitacora.objects.create(
        usuario=usuario,
        nombre=nombre,
        descripcion=descripcion,
        detalles=detalles
    )
    
    return Response(BitacoraSerializer(bitacora).data, status=201)


# ============================================
# ESTADÍSTICAS ADMIN
# ============================================

@api_view(['GET'])
def estadisticas_admin(request):
    total_clientes = Cliente.objects.count()
    clientes_activos = Cliente.objects.filter(estado='activo').count()
    total_portafolios = Portafolio.objects.count()
    total_transacciones = Transaccion.objects.count()
    total_reportes = Reporte.objects.count()

    return Response({
        'total_clientes': total_clientes,
        'clientes_activos': clientes_activos,
        'total_portafolios': total_portafolios,
        'total_transacciones': total_transacciones,
        'total_reportes': total_reportes
    })

@api_view(['POST'])
def generar_qr_2fa(request):
    """Generar QR para Google Authenticator"""
    correo = request.data.get('correo')
    
    if not correo:
        return Response({'error': 'Correo es obligatorio'}, status=400)
    
    try:
        usuario = Usuario.objects.get(correo=correo)
        twofa, _ = User2FA.objects.get_or_create(usuario=usuario)
        
        if not twofa.secret:
            twofa.secret = pyotp.random_base32()
            twofa.save()
        
        totp = pyotp.TOTP(twofa.secret)
        otp_auth_url = totp.provisioning_uri(usuario.correo, issuer_name="InvestCapital Hub")
        
        return Response({
            'success': True,
            'secret': twofa.secret,
            'otp_auth_url': otp_auth_url,
            'qr_url': f'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={otp_auth_url}',
            'mensaje': 'Escanea el QR con Google Authenticator o Microsoft Authenticator'
        })
        
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)