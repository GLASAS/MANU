/**
 * MANU JOYEROS - Configuración Global y Enrutador (config.js)
 */
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbx_yzFyraVxogjmdMZXmJW74nd8u2LCJIM07Th7GqXAHmjHOxjZl8S1zHP24WYV58I2/exec",
  URL_API: "https://script.google.com/macros/s/AKfycbx_yzFyraVxogjmdMZXmJW74nd8u2LCJIM07Th7GqXAHmjHOxjZl8S1zHP24WYV58I2/exec",
  NOMBRE_EMPRESA: "MANU JOYEROS",
  NIT: "902.078.370-8",
  TELEFONO: "+57 (311) 888 6137",
  DIRECCION: "Calle 114 6A 92 Local 301",
  EDIFICIO_O_LOCAL: "Hacienda Santa Barbara",
  CIUDAD: "Bogotá D.C., Colombia",
  VERSION: "V1.1545"
};

let usuarioActual = JSON.parse(localStorage.getItem("usuario_manu")) || JSON.parse(localStorage.getItem("usuario_manu_joyeros")) || null;
let listaProductosCache = [];
let listaProductosFiltradosCache = [];
let paginaActual = 1;
const registrosPorPagina = 10;
let valorOroDelDiaCache = 250000;

document.addEventListener("DOMContentLoaded", async () => {
    // Detectar si la página actual es pública (catálogo o certificado)
    const pathActual = window.location.pathname.toLowerCase();
    const esPaginaPublica = pathActual.includes("catalogomanu") || pathActual.includes("cert.html");

    // Si NO hay sesión y NO es una página pública, redirigir al login
    if (!usuarioActual && !esPaginaPublica && !window.location.href.includes("login.html")) {
        window.location.href = "login.html";
        return;
    }

    // Si es una página pública, no ejecutar lógica del panel administrativo
    if (esPaginaPublica) {
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

    // Sincronización automática de versión en el Sidebar
    const lblVersionSidebar = document.getElementById("versionSidebarLabel");
    if (lblVersionSidebar && typeof CONFIG !== 'undefined') {
        lblVersionSidebar.textContent = `${CONFIG.NOMBRE_EMPRESA} ${CONFIG.VERSION}`;
    }

    // CARGAR EL VALOR REAL DE LA BASE DE DATOS AL INICIAR
    await cargarValorOroDia();
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
        await renderizarModuloActualizacionOro(contenedor);
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

async function renderizarModuloActualizacionOro(container) {
    // Consultar obligatoriamente la base de datos antes de pintar el formulario
    await cargarValorOroDia();

    container.innerHTML = `
        <div class="card" style="max-width: 550px; margin: 0 auto; background: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <h3 style="margin-bottom: 0.5rem; color: #0f172a;">🪙 Actualización del Valor del Oro del Día</h3>
            <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 1.5rem;">Este valor se utilizará como base para multiplicar automáticamente por los gramos de cada pieza.</p>
            <form id="formOroDia" onsubmit="ejecutarActualizacionOro(event)">
                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label style="font-weight: 600; color: #1e293b; display: block; margin-bottom: 6px;">Valor del Gramo de Oro Actual ($ COP) *</label>
                    <input type="number" id="inputValorOroDiaModal" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1.25rem; font-weight: bold; color: #d97706;" value="${window.valorOroDelDiaCache}">
                </div>
                <button type="submit" style="width: 100%; padding: 12px; font-size: 1rem; background: #0f172a; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">💾 Guardar y Actualizar Valor del Oro</button>
            </form>
        </div>`;
}

async function ejecutarActualizacionOro(event) {
    event.preventDefault();
    const inputEl = document.getElementById("inputValorOroDiaModal");
    if (!inputEl) return;

    const nuevoValor = Number(inputEl.value);
    if (isNaN(nuevoValor) || nuevoValor <= 0) { alert("Por favor ingrese un valor válido."); return; }

    const res = await API.llamar("actualizarValorOroDia", { action: "actualizarValorOroDia", valor_oro_dia: nuevoValor }, "POST");
    if (res && res.status === "success") {
        alert(res.message || "Valor del oro actualizado correctamente.");
        window.valorOroDelDiaCache = nuevoValor;
    } else {
        alert("Error al actualizar: " + (res ? res.message : "Desconocido"));
    }
}

async function cargarValorOroDia() {
    try {
        const res = await API.llamar("obtenerValorOroDia", {}, "GET");
        if (res && res.status === "success") {
            const valorLeido = Number(res.valor_oro_dia !== undefined ? res.valor_oro_dia : res.valor);
            if (!isNaN(valorLeido) && valorLeido > 0) {
                window.valorOroDelDiaCache = valorLeido;
            }
        }
    } catch(e) { 
        console.error("Error al sincronizar el valor del oro:", e);
    }
}

async function cargarCategoriasDinamicas() {}
async function cargarMaterialesDinamicos() {}
async function cargarColoresDinamicos() {}

// Módulo de Generación de Código QR Catálogo Web
function abrirModalQrCatalogo() {
    const urlCatalogo = "https://glasas.github.io/MANU/catalogomanu";
    
    let modalID = "modalQrDinamico";
    let modalDiv = document.getElementById(modalID);
    
    if (!modalDiv) {
        modalDiv = document.createElement("div");
        modalDiv.id = modalID;
        modalDiv.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; z-index:9999;";
        modalDiv.innerHTML = `
            <div style="background:white; padding:30px; border-radius:16px; text-align:center; max-width:350px; width:90%; box-shadow:0 20px 25px -5px rgba(0,0,0,0.3);">
                <h3 style="color:#0f172a; margin-bottom:10px;">📱 QR Catálogo Web</h3>
                <p style="color:#64748b; font-size:0.85rem; margin-bottom:20px;">Escanee este código para ver el catálogo en su dispositivo móvil.</p>
                <div id="contenedorQrImagen" style="margin:0 auto 20px auto; display:flex; justify-content:center;"></div>
                <input type="text" id="inputUrlQr" value="${urlCatalogo}" readonly style="width:100%; padding:8px; font-size:0.8rem; border:1px solid #cbd5e1; border-radius:6px; margin-bottom:15px; background:#f8fafc; text-align:center;" />
                <div style="display:flex; gap:10px;">
                    <button onclick="copiarUrlQr()" style="flex:1; padding:10px; background:#0f172a; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">📋 Copiar Link</button>
                    <button onclick="cerrarModalQr()" style="flex:1; padding:10px; background:#ef4444; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Cerrar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);
    } else {
        modalDiv.style.display = "flex";
    }

    const contenedorImg = document.getElementById("contenedorQrImagen");
    const apiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(urlCatalogo)}`;
    contenedorImg.innerHTML = `<img src="${apiQrUrl}" alt="Código QR Catálogo" style="border-radius:8px; border:1px solid #e2e8f0; padding:5px;" />`;
}

function cerrarModalQr() {
    const modalDiv = document.getElementById("modalQrDinamico");
    if (modalDiv) modalDiv.style.display = "none";
}

function copiarUrlQr() {
    const input = document.getElementById("inputUrlQr");
    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(input.value);
    alert("¡Enlace del catálogo copiado al portapapeles!");
}
