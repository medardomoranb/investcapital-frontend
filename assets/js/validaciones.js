/**
 * Módulo validaciones.js - Validaciones del lado del cliente
 */

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarPassword(password) {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /\d/.test(password);
}

function validarCamposObligatorios(campos) {
    for (let campo of campos) {
        if (!campo.value || campo.value.trim() === '') {
            campo.classList.add('is-invalid');
            return false;
        }
        campo.classList.remove('is-invalid');
    }
    return true;
}