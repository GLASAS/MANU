/**
 * MANU JOYEROS - Módulo de Inventario y Arqueo (inventario.js)
 * Versión Íntegra y Completa con Selector de Responsable, Ajuste de Pantalla y Exportación a Excel
 */

let listaInventarioCache = [];
let listaInventarioFiltradosCache = [];
let timeoutArqueoBuscador = null;

async function renderizarModuloInventario(container) {
    let fechaHoy = new Date().toISOString().split('T')[0];

    container.innerHTML = `
        <div class="card" style="background: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">
                <div>
                    <h3 style="margin: 0; color: #0f172a; font-size: 1.2rem;">📋 Módulo de Auditoría — Arqueo e Inventario Físico en Línea</h3>
                    <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: #64748b;">Verifique existencias reales en vitrinas y caja fuerte escaneando o buscando por SKU, código de barras o nombre.</p>
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button type="button" onclick="exportarArqueoExcel()" style="background: #059669; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">📥 Guardar Arqueo (Excel)</button>
                    <button type="button" onclick="limpiarArqueoFisico()" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer;">🧹 Limpiar</button>
                </div>
            </div>

            <!-- FILTROS Y RESPONSABLE -->
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: bold; color: #475569; margin-bottom: 5px;">Fecha de Arqueo</label>
                    <input type="date" id="arqFecha" value="${fechaHoy}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: white;" readonly>
                </div>
                <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: bold; color: #475569; margin-bottom: 5px;">Responsable del Arqueo</label>
                    <select id="arqResponsableSelect" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: white;">
                        <option value="">Cargando usuarios...</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; font-size: 0.78rem; font-weight: bold; color: #475569; margin-bottom: 5px;">Área / Vitrina</label>
                    <select id="arqArea" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: white;">
                        <option value="Inventario General / Vitrinas">Inventario General / Vitrinas</option>
                        <option value="Caja Fuerte">Caja Fuerte</option>
                        <option value="Vitrina 1">Vitrina 1</option>
                        <option value="Vitrina 2">Vitrina 2</option>
                    </select>
                </div>
            </div>

            <!-- RESUMEN DE ARQUEO -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 0.75rem; font-weight: bold; color: #64748b; text-transform: uppercase;">Total Productos</span>
                    <span id="lblTotalInventario" style="font-size: 1.5rem; font-weight: bold; color: #0f172a;">0</span>
                </div>
                <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #a7f3d0;">
                    <span style="display: block; font-size: 0.75rem; font-weight: bold; color: #047857; text-transform: uppercase;">Presentes (Auditados)</span>
                    <span id="lblPresentesInventario" style="font-size: 1.5rem; font-weight: bold; color: #059669;">0</span>
                </div>
                <div style="background: #fef2f2; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #fecaca;">
                    <span style="display: block; font-size: 0.75rem; font-weight: bold; color: #b91c1c; text-transform: uppercase;">Faltantes / Pendientes</span>
                    <span id="lblFaltantesInventario" style="font-size: 1.5rem; font-weight: bold; color: #dc2626;">0</span>
                </div>
            </div>

            <!-- BUSCADOR UNIVERSAL INTELIGENTE DE ARQUEO -->
            <div style="margin-bottom: 15px; display: flex; gap: 10px; align-items: center;">
                <input type="text" id="inputBuscadorArqueo" placeholder="🔍 Buscar por SKU, código de barras, nombre, ubicación..." oninput="filtrarArqueoEnVivoOptimizado()" style="flex: 1; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; font-size: 0.9rem;">
                <select id="filtroEstadoArqueo" onchange="filtrarArqueoEnVivoOptimizado()" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; background: white; font-size: 0.9rem;">
                    <option value="TODOS">Todos los estados</option>
                    <option value="PRESENTES">Presentes</option>
                    <option value="FALTANTES">Faltantes</option>
                </select>
            </div>

            <!-- CONTENEDOR DE TABLA (AJUSTADO SIN SCROLL HORIZONTAL) -->
            <div id="tablaInventarioContainer" style="width: 100%; overflow-x: hidden;">
                <p style="text-align: center; color: #64748b; padding: 2rem;">Cargando inventario para auditoría...</p>
            </div>
        </div>`;

    await cargarUsuariosResponsablesArqueo();
    await cargarDatosInventarioArqueo();
}

async function cargarUsuariosResponsablesArqueo() {
    const select = document.getElementById("arqResponsableSelect");
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

            // Seleccionar usuario actual por defecto si existe en sesión
            if (typeof usuarioActual !== 'undefined' && usuarioActual && (usuarioActual.nombre || usuarioActual.usuario)) {
                select.value = usuarioActual.nombre || usuarioActual.usuario;
            }
        } else {
            select.innerHTML = `<option value="Administrador General">Administrador General</option>`;
        }
    } catch (e) {
        select.innerHTML = `<option value="Administrador General">Administrador General</option>`;
    }
}

async function cargarDatosInventarioArqueo() {
    let productos = null;
    let cache = localStorage.getItem("cache_productos_manu");
    
    if (cache) {
        try { productos = JSON.parse(cache); } catch(e) {}
    }

    if (!productos) {
        const res = await API.llamar("obtenerProductos", {}, "GET");
        if (res && res.status === "success") {
            productos = res.data;
            localStorage.setItem("cache_productos_manu", JSON.stringify(productos));
        } else {
            document.getElementById("tablaInventarioContainer").innerHTML = `<p style="color: #ef4444; text-align: center; padding: 2rem;">Error al cargar datos del servidor.</p>`;
            return;
        }
    }

    listaInventarioCache = (productos || []).filter(p => String(p.Estado || p.estado || "DISPONIBLE").trim().toUpperCase().includes("DISPONIBLE")).map(p => ({
        ...p,
        auditado: false // Inician como no auditados (faltantes)
    }));

    listaInventarioFiltradosCache = listaInventarioCache;
    actualizarContadoresArqueo();
    renderizarTablaArqueo();
}

/**
 * Buscador Universal de Arqueo Inteligente y Veloz con Debounce
 */
function filtrarArqueoEnVivoOptimizado() {
    clearTimeout(timeoutArqueoBuscador);
    timeoutArqueoBuscador = setTimeout(() => {
        const query = document.getElementById("inputBuscadorArqueo").value.toLowerCase().trim();
        const filtroEstado = document.getElementById("filtroEstadoArqueo").value;

        listaInventarioFiltradosCache = listaInventarioCache.filter(p => {
            const sku = String(p.SKU || "").toLowerCase();
            const nombre = String(p.Nombre || "").toLowerCase();
            const codigoBarra = String(p.Codigo_Barra || "").toLowerCase();
            const categoria = String(p.ID_Categoria || "").toLowerCase();
            const material = String(p.Material_Oro || "").toLowerCase();
            const color = String(p.Color || "").toLowerCase();
            const ubicacion = String(p.ID_Ubicacion || "").toLowerCase();

            let cumpleTexto = true;
            if (query) {
                const terminos = query.split(/\s+/);
                cumpleTexto = terminos.every(t => 
                    sku.includes(t) || 
                    codigoBarra.includes(t) || 
                    nombre.includes(t) || 
                    categoria.includes(t) || 
                    material.includes(t) || 
                    color.includes(t) || 
                    ubicacion.includes(t)
                );
            }

            let cumpleEstado = true;
            if (filtroEstado === "PRESENTES") cumpleEstado = p.auditado === true;
            if (filtroEstado === "FALTANTES") cumpleEstado = p.auditado === false;

            return cumpleTexto && cumpleEstado;
        });

        renderizarTablaArqueo();
    }, 120);
}

function marcarItemAuditado(sku) {
    let item = listaInventarioCache.find(p => p.SKU === sku);
    if (item) {
        item.auditado = !item.auditado;
    }
    actualizarContadoresArqueo();
    renderizarTablaArqueo();
}

function actualizarContadoresArqueo() {
    let total = listaInventarioCache.length;
    let presentes = listaInventarioCache.filter(p => p.auditado).length;
    let faltantes = total - presentes;

    if (document.getElementById("lblTotalInventario")) document.getElementById("lblTotalInventario").textContent = total;
    if (document.getElementById("lblPresentesInventario")) document.getElementById("lblPresentesInventario").textContent = presentes;
    if (document.getElementById("lblFaltantesInventario")) document.getElementById("lblFaltantesInventario").textContent = faltantes;
}

function renderizarTablaArqueo() {
    const contenedor = document.getElementById("tablaInventarioContainer");
    if (!listaInventarioFiltradosCache || listaInventarioFiltradosCache.length === 0) {
        contenedor.innerHTML = `<p style="color: #64748b; text-align: center; padding: 2rem;">No se encontraron registros en el arqueo.</p>`;
        return;
    }

    let html = `
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; table-layout: fixed;">
            <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
                    <th style="padding: 10px; width: 110px;">Estado Físico</th>
                    <th style="padding: 10px; width: 90px;">SKU</th>
                    <th style="padding: 10px; width: 130px;">Código de Barras</th>
                    <th style="padding: 10px; width: auto;">Producto / Descripción</th>
                </tr>
            </thead>
            <tbody>
    `;

    listaInventarioFiltradosCache.forEach(p => {
        let codigoBarraVal = p.Codigo_Barra || p.codigo_barra || '-';
        let btnAccion = p.auditado
            ? `<button type="button" onclick="marcarItemAuditado('${p.SKU}')" style="background: #059669; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.78rem; width: 100%; box-shadow: 0 2px 4px rgba(5,150,105,0.2);">✔ PRESENTE</button>`
            : `<button type="button" onclick="marcarItemAuditado('${p.SKU}')" style="background: #dc2626; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.78rem; width: 100%; box-shadow: 0 2px 4px rgba(220,38,38,0.2);">✖ FALTANTE</button>`;

        html += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; vertical-align: middle;">${btnAccion}</td>
                <td style="padding: 10px; font-weight: bold; color: #0f172a; vertical-align: middle; word-break: break-word;">${p.SKU}</td>
                <td style="padding: 10px; color: #475569; vertical-align: middle; word-break: break-word;">${codigoBarraVal}</td>
                <td style="padding: 10px; color: #1e293b; vertical-align: middle; word-break: break-word; line-height: 1.3;">${p.Nombre || ''}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    contenedor.innerHTML = html;
}

function limpiarArqueoFisico() {
    if (confirm("¿Desea reiniciar el arqueo y marcar todos los ítems como faltantes?")) {
        listaInventarioCache.forEach(p => p.auditado = false);
        if (document.getElementById("inputBuscadorArqueo")) document.getElementById("inputBuscadorArqueo").value = "";
        if (document.getElementById("filtroEstadoArqueo")) document.getElementById("filtroEstadoArqueo").value = "TODOS";
        listaInventarioFiltradosCache = listaInventarioCache;
        actualizarContadoresArqueo();
        renderizarTablaArqueo();
    }
}

function exportarArqueoExcel() {
    if (!listaInventarioCache || listaInventarioCache.length === 0) { 
        alert("No hay datos para exportar."); 
        return; 
    }

    const responsable = document.getElementById("arqResponsableSelect")?.value || "No asignado";
    const fecha = document.getElementById("arqFecha")?.value || new Date().toISOString().split('T')[0];
    const area = document.getElementById("arqArea")?.value || "Inventario General";

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += `REPORTE DE ARQUEO E INVENTARIO FISICO\n`;
    csvContent += `Fecha:,${fecha}\n`;
    csvContent += `Responsable:,${responsable}\n`;
    csvContent += `Área / Vitrina:,${area}\n\n`;
    csvContent += `Estado Físico,SKU,Código de Barras,Producto / Descripción,Ubicación\n`;

    listaInventarioCache.forEach(p => {
        let estado = p.auditado ? "PRESENTE" : "FALTANTE";
        let nombreLimpio = `"${(p.Nombre || "").replace(/"/g, '""')}"`;
        let ubicacion = p.ID_Ubicacion || p.ubicacion || "-";
        csvContent += `${estado},${p.SKU},${p.Codigo_Barra || ""},${nombreLimpio},${ubicacion}\n`;
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
