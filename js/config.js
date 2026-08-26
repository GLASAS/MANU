/**
 * MANU JOYEROS - Configuración Global y Enrutador (config.js)
 */
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbw2dhdfkcK5j1ISFFb0vhMBuxz30CO4tECVTTeykg4be72WPeQoj_Oj6JerBfcQ9_C9/exec",
  URL_API: "https://script.google.com/macros/s/AKfycbw2dhdfkcK5j1ISFFb0vhMBuxz30CO4tECVTTeykg4be72WPeQoj_Oj6JerBfcQ9_C9/exec",
  NOMBRE_EMPRESA: "MANU JOYEROS",
  NIT: "902.078.370-8",
  TELEFONO: "+57 (311) 888 6137",
  DIRECCION: "Calle 114 6A 92 Local 301",
  EDIFICIO_O_LOCAL: "Hacienda Santa Barbara",
  CIUDAD: "Bogotá D.C., Colombia",
  VERSION: "V1.1647"
};

let usuarioActual = JSON.parse(localStorage.getItem("usuario_manu")) || JSON.parse(localStorage.getItem("usuario_manu_joyeros")) || null;
let listaProductosCache = [];
let listaProductosFiltradosCache = [];
let paginaActual = 1;
const registrosPorPagina = 10;
let valorOroDelDiaCache = 250000;

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
    
    if (usuarioActual && usuarioActual.rol && usuarioActual.rol.toUpperCase() !== 'ADMIN' && usuarioActual.rol.toUpperCase() !== 'ADMINISTRADOR') {
        document.querySelectorAll('.nav-admin-only').forEach(el => el.style.display = 'none');
    }
});

function cerrarSesion() {
    localStorage.removeItem("usuario_manu");
    localStorage.removeItem("usuario_manu_joyeros");
    window.location.href = "login.html";
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (sidebar) sidebar.classList.toggle("active");
    if (overlay) overlay.classList.toggle("active");
}

async function cambiarVista(vista, event) {
    if (event) event.preventDefault();
    const contenedor = document.getElementById('contentBody');
    const tituloVista = document.getElementById('viewTitle');

    document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => l.classList.remove('active'));
    if (event && event.currentTarget) event.currentTarget.classList.add('active');

    if (vista === 'dashboard') {
        if (tituloVista) tituloVista.textContent = "Dashboard General";
        contenedor.innerHTML = `
            <div class="welcome-banner">
                <div class="welcome-text">
                    <h1>Bienvenido, <span id="userNameBanner">${usuarioActual ? usuarioActual.nombre : 'Administrador'}</span> 👋</h1>
                    <p>Sistema profesional de inventario — <em>🪙 ¡Joyas que trascienden el tiempo!</em></p>
                </div>
            </div>`;
    } else if (vista === 'productos') {
        if (tituloVista) tituloVista.textContent = "Catálogo de Productos";
        if (typeof renderizarModuloProductos === 'function') await renderizarModuloProductos(contenedor);
    } else if (vista === 'inventario') {
        if (tituloVista) tituloVista.textContent = "Inventario y Arqueo";
        if (typeof renderizarModuloInventario === 'function') await renderizarModuloInventario(contenedor);
    } else if (vista === 'actualizacion_oro') {
        if (tituloVista) tituloVista.textContent = "Actualización del Valor del Oro";
        renderizarModuloActualizacionOro(contenedor);
    } else if (vista === 'entradas') {
        if (tituloVista) tituloVista.textContent = "Entradas de Inventario";
        if (typeof renderizarModuloEntradasSalidas === 'function') await renderizarModuloEntradasSalidas(contenedor, 'ENTRADAS');
    } else if (vista === 'salidas') {
        if (tituloVista) tituloVista.textContent = "Salidas de Inventario";
        if (typeof renderizarModuloEntradasSalidas === 'function') await renderizarModuloEntradasSalidas(contenedor, 'SALIDAS');
    } else if (vista === 'kardex') {
        if (tituloVista) tituloVista.textContent = "Kardex de Movimientos";
        if (typeof renderizarModuloKardex === 'function') await renderizarModuloKardex(contenedor);
    } else if (vista === 'proveedores') {
        if (tituloVista) tituloVista.textContent = "Gestión de Proveedores";
        if (typeof renderizarModuloProveedores === 'function') await renderizarModuloProveedores(contenedor);
    } else if (vista === 'usuarios') {
        if (tituloVista) tituloVista.textContent = "Gestión de Usuarios";
        if (typeof renderizarModuloUsuarios === 'function') await renderizarModuloUsuarios(contenedor);
    } else if (vista === 'cambiar_password') {
        if (tituloVista) tituloVista.textContent = "Cambiar Contraseña";
        if (typeof renderizarModuloCambiarPassword === 'function') await renderizarModuloCambiarPassword(contenedor);
    }

    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

function renderizarModuloActualizacionOro(container) {
    container.innerHTML = `
        <div class="card" style="max-width: 550px; margin: 0 auto;">
            <h3 style="margin-bottom: 0.5rem; color: #0f172a;">🪙 Actualización del Valor del Oro del Día</h3>
            <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 1.5rem;">Este valor se utilizará como base para multiplicar automáticamente por los gramos de cada pieza.</p>
            <form id="formOroDia" onsubmit="ejecutarActualizacionOro(event)">
                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label style="font-weight: 600; color: #1e293b; display: block; margin-bottom: 6px;">Valor del Gramo de Oro Actual ($ COP) *</label>
                    <input type="number" id="inputValorOroDiaModal" required style="font-size: 1.25rem; font-weight: bold; color: #d97706;" value="${window.valorOroDelDiaCache || 250000}">
                </div>
                <button type="submit" class="btn-form-save" style="width: 100%; padding: 12px; font-size: 1rem; background: #0f172a; color: white; border: none; border-radius: 8px; cursor: pointer;">💾 Guardar y Actualizar Valor del Oro</button>
            </form>
        </div>`;
}

async function ejecutarActualizacionOro(event) {
    event.preventDefault();
    const nuevoValor = Number(document.getElementById("inputValorOroDiaModal").value);
    if (isNaN(nuevoValor) || nuevoValor <= 0) { alert("Por favor ingrese un valor válido."); return; }

    const res = await API.llamar("actualizarValorOroDia", { action: "actualizarValorOroDia", valor_oro_dia: nuevoValor }, "POST");
    if (res && res.status === "success") {
        alert(res.message);
        window.valorOroDelDiaCache = nuevoValor;
    } else {
        alert("Error al actualizar: " + (res ? res.message : "Desconocido"));
    }
}

async function cargarValorOroDia() {
    try {
        const res = await API.llamar("obtenerValorOroDia", {}, "GET");
        if (res && res.status === "success") {
            window.valorOroDelDiaCache = Number(res.valor_oro_dia) || 250000;
        }
    } catch(e) { window.valorOroDelDiaCache = 250000; }
}

async function cargarCategoriasDinamicas() {}
async function cargarMaterialesDinamicos() {}
async function cargarColoresDinamicos() {}
function abrirModalQrCatalogo() { alert("Módulo de QR de Catálogo Web activo."); }
