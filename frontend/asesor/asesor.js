document.addEventListener('DOMContentLoaded', () => {
    // Sincronizado con tu login.js: Leemos desde sessionStorage con tu llave exacta
    const nombreUsuario = sessionStorage.getItem('coovalluna_nombre') || 'Asesor Comercial';
    
    // Personalizamos las etiquetas en el HTML con el nombre real del empleado
    document.getElementById('nombreAsesor').textContent = nombreUsuario;
    document.getElementById('saludoAsesor').innerHTML = `<h2>¡Hola, ${nombreUsuario}!</h2>`;

    // Lógica para destruir la sesión al salir limpiando el sessionStorage
    document.getElementById('btnCerrarSesion').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '../index.html'; // Redirige al login de la raíz
    });
});
