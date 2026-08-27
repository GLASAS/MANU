/**
 * MANU JOYEROS - Configuración Global (config.js)
 */
const CONFIG = {
  // Asegúrate de tener aquí la URL de tu Web App de Google Apps Script vigente
  URL_API: "https://script.google.com/macros/s/TU_SCRIPT_ID/exec" 
};

let usuarioActual = JSON.parse(localStorage.getItem("usuario_manu_joyeros")) || null;
let listaProductosCache = [];
let listaProductosFiltradosCache = [];
let paginaActual = 1;
const registrosPorPagina = 10;
let valorOroDelDiaCache = 250000;

// Verificación de sesión al cargar
document.addEventListener("DOMContentLoaded", () => {
    if (!usuarioActual && !window.location.href.includes("login.html")) {
        window.location.href = "login.html";
        return;
    }
    if (usuarioActual) {
        const lblNombre = document.getElementById("userNameLabel");
        const lblBanner = document.getElementById("userNameBanner");
        const lblRol = document.getElementById("userRoleBadge");
        if (lblNombre) lblNombre.textContent = usuarioActual.nombre;
        if (lblBanner) lblBanner.textContent = usuarioActual.nombre;
        if (lblRol) lblRol.textContent = usuarioActual.rol;
    }
    
    // Ocultar elementos de admin si no lo es
    if (usuarioActual && usuarioActual.rol && usuarioActual.rol.toUpperCase() !== 'ADMIN' && usuarioActual.rol.toUpperCase() !== 'ADMINISTRADOR') {
        document.querySelectorAll('.nav-admin-only').forEach(el => el.style.display = 'none');
    }
});

function cerrarSesion() {
    localStorage.removeItem("usuario_manu_joyeros");
    window.location.href = "login.html";
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (sidebar) sidebar.classList.toggle("active");
    if (overlay) overlay.classList.toggle("active");
}
