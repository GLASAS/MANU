async function cambiarVista(vista, event) {
    if (event) event.preventDefault();
    const contenedor = document.getElementById('contentBody');
    const tituloVista = document.getElementById('viewTitle');

    // Manejar enlaces activos del menú
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => l.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');

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
        if (typeof renderizarModuloProductos === 'function') {
            await renderizarModuloProductos(contenedor);
        } else {
            contenedor.innerHTML = `<p style="color:red;">Error: Módulo de productos no cargado correctamente.</p>`;
        }
    } else if (vista === 'inventario') {
        if (tituloVista) tituloVista.textContent = "Inventario y Arqueo";
        if (typeof renderizarModuloInventario === 'function') await renderizarModuloInventario(contenedor);
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
    }

    // Cerrar menú en dispositivos móviles al hacer clic
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

// Funciones auxiliares globales de carga de oro y categorías para evitar errores
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
