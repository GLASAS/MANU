/**
 * MANU JOYEROS - Módulo de Inventario y Arqueo (inventario.js)
 * Versión Íntegra y Completa con Selector de Responsable, Ajuste de Texto y Exportación a Excel
 */

async function renderizarModuloInventario(container) {
    container.innerHTML = `
        <div class="card" style="margin-bottom: 20px; background: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">
                <div>
                    <h3 style="margin: 0; color: #0f172a; font-size: 1.2rem;">📋 Módulo de Auditoría — Arqueo e Inventario Físico en Línea</h3>
                    <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: #64748b;">Verifique existencias reales en vitrinas y caja fuerte escaneando o buscando por SKU, código de barras o nombre.</p>
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button type="button" onclick="exportarArqueoExcel()" style="background: #059669; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">📥 Guardar Arqueo (Excel)</button>
                    <button type="button" onclick="limpiarArqueoInventario()" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer;">🧹 Limpiar</button>
                </div>
            </div>

            <!-- FILTROS Y RESPONSABLE -->
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: bold; color: #475569; margin-bottom: 5px;">Fecha de Arqueo</label>
                    <input type="date" id="invFechaArqueo" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: white;" readonly>
                </div>
                <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: bold; color: #475569; margin-bottom: 5px;">Responsable del Arqueo</label>
                    <select id="invResponsableSelect" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: white;">
                        <option value="">Cargando administradores...</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: bold; color: #475569; margin-bottom: 5px;">Área / Vitrina</label>
                    <select id="invAreaSelect" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: white;">
                        <option value="TODAS">Inventario General / Vitrinas</option>
                        <option value="CAJA FUERTE">Caja Fuerte</option>
                        <option value="VITRINA PRINCIPAL">Vitrina Principal</option>
                    </select>
                </div>
            </div>

            <!-- TARJETAS DE RESUMEN -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 0.75rem; font-weight: bold; color: #64748b; text-transform: uppercase;">Total Productos</span>
                    <span id="lblTotalInv" style="font-size: 1.5rem; font-weight: bold; color: #0f172a;">0</span>
                </div>
                <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #a7f3d0;">
                    <span style="display: block; font-size: 0.75rem; font-weight: bold; color: #047857; text-transform: uppercase;">Presentes (Auditados)</span>
                    <span id="lblPresentesInv" style="font-size: 1.5rem; font-weight: bold; color: #059669;">0</span>
                </div>
                <div style="background: #fef2f2; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #fecaca;">
                    <span style="display: block; font-size: 0.75rem; font-weight: bold; color: #b91c1c; text-transform: uppercase;">Faltantes / Pendientes</span>
                    <span id="lblFaltantesInv" style="font-size: 1.5rem; font-weight: bold; color: #dc2626;">0</span>
                </div>
            </div>

            <!-- BUSCADOR INTERNO -->
            <div style="display: flex; gap: 10px; margin-bottom: 15px; align-items: center;">
                <input type="text" id="buscadorInventarioFisico" onkeyup="filtrarTablaInventarioArqueo()" placeholder="🔍 Buscar por SKU, código de barras o nombre..." style="flex: 1; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; font-size: 0.9rem;">
                <select id="filtroEstadoInventario" onchange="filtrarTablaInventarioArqueo()" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; background: white; font-size: 0.9rem;">
                    <option value="TODOS">Todos los estados</option>
                    <option value="PRESENTE">Presentes</option>
                    <option value="FALTANTE">Faltantes</option>
                </select>
            </div>

            <!-- TABLA DE INVENTARIO (SIN SCROLL HORIZONTAL, DESCRIPCIÓN AJUSTADA) -->
            <div style="width: 100%; overflow-x: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; table-layout: fixed;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
                            <th style="padding: 10px; width: 110px;">Estado Físico</th>
                            <th style="padding: 10px; width: 90px;">SKU</th>
                            <th style="padding: 10px; width: 130px;">Código de Barras</th>
                            <th style="padding: 10px; width: auto;">Producto / Descripción</th>
                        </tr>
                    </thead>
                    <tbody id="tablaInventarioArqueoBody">
                        <tr><td colspan="4" style="text-align: center; padding: 30px; color: #64748b;">Cargando inventario para arqueo...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Asignar fecha actual
    const hoy = new Date().toISOString().split('T')[0];
    const inputFecha = document.getElementById("invFechaArqueo");
    if (inputFecha) inputFecha.value = hoy;

    await cargarAdministradoresArqueo();
    await cargarDatosInventarioArqueo();
}

async function cargarAdministradoresArqueo() {
    const select = document.getElementById("invResponsableSelect");
    if (!select) return;

    try {
        const res = await API.llamar("obtenerUsuarios", {}, "GET");
        if (res && res.status === "success" && res.data) {
            let html = `<option value="">Seleccione responsable...</option>`;
            res.data.forEach(u => {
                let nombreUser = u.Nombre || u.nombre || u.Usuario || u.usuario || "Admin";
                html += `<option value="${nombreUser}">${nombreUser}</option>`;
            });
            select.innerHTML = html;

            // Si hay un usuario actual en sesión, seleccionarlo por defecto
            if (typeof usuarioActual !== 'undefined' && usuarioActual && usuarioActual.usuario) {
                select.value = usuarioActual.usuario;
            }
        } else {
            select.innerHTML = `<option value="ADMINISTRADOR GENERAL">Administrador General</option>`;
        }
    } catch (e) {
        select.innerHTML = `<option value="ADMINISTRADOR GENERAL">Administrador General</option>`;
    }
}

async function cargarDatosInventarioArqueo() {
    const tbody = document.getElementById("tablaInventarioArqueoBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 30px; color: #64748b;">Sincronizando inventario...</td></tr>`;

    try {
        const res = await API.llamar("obtenerProductos", {}, "GET");
        if (res && res.status === "success" && res.data) {
            window.inventarioArqueoCache = res.data.map(p => ({
                sku: p.SKU || p.sku || "",
                codigoBarra: p.Codigo_Barra || p.codigo_barra || p.SKU || p.sku || "",
                nombre: p.Nombre || p.nombre || "Joya sin nombre",
                ubicacion: p.ID_Ubicacion || p.ubicacion || "VITRINA",
                estadoFisico: "FALTANTE" // Por defecto inician como faltantes hasta ser marcados
            }));
            renderizarTablaInventarioArqueo();
        } else {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 30px; color: #ef4444;">No se pudieron cargar los productos para el arqueo.</td></tr>`;
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 30px; color: #ef4444;">Error de conexión con el servidor.</td></tr>`;
    }
}

function renderizarTablaInventarioArqueo() {
    const tbody = document.getElementById("tablaInventarioArqueoBody");
    if (!tbody) return;

    const lista = window.inventarioArqueoCache || [];
    const textoFiltro = document.getElementById("buscadorInventarioFisico")?.value.trim().toLowerCase() || "";
    const estadoFiltro = document.getElementById("filtroEstadoInventario")?.value || "TODOS";
    const areaFiltro = document.getElementById("invAreaSelect")?.value || "TODAS";

    let filtrados = lista.filter(item => {
        let matchTexto = item.sku.toLowerCase().includes(textoFiltro) || 
                         item.codigoBarra.toLowerCase().includes(textoFiltro) || 
                         item.nombre.toLowerCase().includes(textoFiltro);
        let matchEstado = estadoFiltro === "TODOS" || item.estadoFisico === estadoFiltro;
        let matchArea = areaFiltro === "TODAS" || item.ubicacion.toUpperCase().includes(areaFiltro);
        return matchTexto && matchEstado && matchArea;
    });

    // Actualizar contadores globales
    let total = lista.length;
    let presentes = lista.filter(i => i.estadoFisico === "PRESENTE").length;
    let faltantes = total - presentes;

    if (document.getElementById("lblTotalInv")) document.getElementById("lblTotalInv").textContent = total;
    if (document.getElementById("lblPresentesInv")) document.getElementById("lblPresentesInv").textContent = presentes;
    if (document.getElementById("lblFaltantesInv")) document.getElementById("lblFaltantesInv").textContent = faltantes;

    if (filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 30px; color: #64748b;">No se encontraron productos coincidentes.</td></tr>`;
        return;
    }

    let html = "";
    filtrados.forEach(item => {
        let esPresente = item.estadoFisico === "PRESENTE";
        let botonEstado = esPresente ? 
            `<button type="button" onclick="cambiarEstadoArqueo('${item.sku}')" style="background: #059669; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.78rem; width: 100%; box-shadow: 0 2px 4px rgba(5,150,105,0.2);">✔ PRESENTE</button>` :
            `<button type="button" onclick="cambiarEstadoArqueo('${item.sku}')" style="background: #dc2626; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.78rem; width: 100%; box-shadow: 0 2px 4px rgba(220,38,38,0.2);">✖ FALTANTE</button>`;

        html += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; vertical-align: middle;">${botonEstado}</td>
                <td style="padding: 10px; font-weight: bold; color: #0f172a; vertical-align: middle; word-break: break-word;">${item.sku}</td>
                <td style="padding: 10px; color: #475569; vertical-align: middle; word-break: break-word;">${item.codigoBarra}</td>
                <td style="padding: 10px; color: #1e293b; vertical-align: middle; word-break: break-word; line-height: 1.3;">${item.nombre}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function cambiarEstadoArqueo(sku) {
    const item = (window.inventarioArqueoCache || []).find(i => i.sku === sku);
    if (item) {
        item.estadoFisico = item.estadoFisico === "PRESENTE" ? "FALTANTE" : "PRESENTE";
        renderizarTablaInventarioArqueo();
    }
}

function filtrarTablaInventarioArqueo() {
    renderizarTablaInventarioArqueo();
}

function limpiarArqueoInventario() {
    if (confirm("¿Desea reiniciar el arqueo y marcar todos los ítems como faltantes?")) {
        if (window.inventarioArqueoCache) {
            window.inventarioArqueoCache.forEach(i => i.estadoFisico = "FALTANTE");
            renderizarTablaInventarioArqueo();
        }
    }
}

function exportarArqueoExcel() {
    const responsable = document.getElementById("invResponsableSelect")?.value || "No asignado";
    const fecha = document.getElementById("invFechaArqueo")?.value || new Date().toISOString().split('T')[0];
    const area = document.getElementById("invAreaSelect")?.value || "TODAS";
    const lista = window.inventarioArqueoCache || [];

    if (lista.length === 0) {
        alert("No hay datos de inventario para exportar.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += `REPORTE DE ARQUEO E INVENTARIO FISICO\n`;
    csvContent += `Fecha:,${fecha}\n`;
    csvContent += `Responsable:,${responsable}\n`;
    csvContent += `Área / Vitrina:,${area}\n\n`;
    csvContent += `Estado Físico,SKU,Código de Barras,Producto / Descripción,Ubicación\n`;

    lista.forEach(i => {
        let nombreLimpio = `"${i.nombre.replace(/"/g, '""')}"`;
        csvContent += `${i.estadoFisico},${i.sku},${i.codigoBarra},${nombreLimpio},${i.ubicacion}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Arqueo_Inventario_${fecha}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("¡Arqueo guardado y exportado exitosamente a Excel!");
}
