/**
 * MANU JOYEROS - Módulo de Inventario y Arqueo (inventario.js)
 * Versión Ultra-Optimizada para Móviles con Spinner de Carga Integrado - 2026
 */

let listaInventarioCache = [];
let listaInventarioFiltradosCache = [];
let timeoutArqueoBuscador = null;

async function renderizarModuloInventario(container) {
    let fechaHoy = new Date().toISOString().split('T')[0];

    container.innerHTML = `
        <div class="card" style="background: #ffffff; padding: 15px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <h3 style="color: #0f172a; margin-bottom: 0.25rem; font-size: 1.1rem;">📦 Auditoría y Arqueo Físico</h3>
            <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 1rem;">Verifique existencias reales escaneando o buscando por SKU, código de barras o nombre.</p>
            
            <div style="display: flex; gap: 8px; margin-bottom: 1rem; flex-wrap: wrap;">
                <button class="btn-modern btn-success-action" onclick="exportarFormatoExcelVacio()" style="flex: 1; min-width: 130px; padding: 10px; font-size: 0.8rem; border-radius: 8px; font-weight: 600;">📥 Formato Excel</button>
                <button class="btn-modern" onclick="exportarArqueoExcel()" style="flex: 1; min-width: 130px; background: #0284c7; color: white; padding: 10px; font-size: 0.8rem; border-radius: 8px; font-weight: 600;">📊 Guardar Arqueo</button>
                <button class="btn-modern btn-danger-action" onclick="limpiarArqueoFisico()" style="padding: 10px; font-size: 0.8rem; border-radius: 8px; font-weight: 600;">🧹 Limpiar</button>
            </div>

            <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 1rem;">
                <div style="font-weight: bold; color: #334155; margin-bottom: 6px; font-size: 0.85rem;">📋 Filtros de Auditoría</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px;">
                    <div>
                        <label style="font-size: 0.75rem; color: #64748b;">Fecha</label>
                        <input type="date" id="arqFecha" value="${fechaHoy}" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:6px; font-size: 0.85rem;">
                    </div>
                    <div>
                        <label style="font-size: 0.75rem; color: #64748b;">Responsable</label>
                        <select id="arqResponsableSelect" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:6px; background:white; font-size: 0.85rem;">
                            <option value="">Cargando...</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 0.75rem; color: #64748b;">Área / Vitrina</label>
                        <select id="arqArea" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:6px; font-size: 0.85rem;">
                            <option value="Inventario General / Vitrinas">Inventario General / Vitrinas</option>
                            <option value="Caja Fuerte">Caja Fuerte</option>
                            <option value="Vitrina 1">Vitrina 1</option>
                            <option value="Vitrina 2">Vitrina 2</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- RESUMEN DE ARQUEO -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 1rem; text-align: center;">
                <div style="background: #e0f2fe; padding: 10px; border-radius: 8px; border: 1px solid #bae6fd;">
                    <div style="font-size: 0.7rem; color: #0369a1; font-weight: bold;">TOTAL</div>
                    <div id="lblTotalInventario" style="font-size: 1.15rem; font-weight: bold; color: #0369a1;">0</div>
                </div>
                <div style="background: #dcfce7; padding: 10px; border-radius: 8px; border: 1px solid #bbf7d0;">
                    <div style="font-size: 0.7rem; color: #15803d; font-weight: bold;">PRESENTES</div>
                    <div id="lblPresentesInventario" style="font-size: 1.15rem; font-weight: bold; color: #15803d;">0</div>
                </div>
                <div style="background: #fee2e2; padding: 10px; border-radius: 8px; border: 1px solid #fecaca;">
                    <div style="font-size: 0.7rem; color: #b91c1c; font-weight: bold;">FALTANTES</div>
                    <div id="lblFaltantesInventario" style="font-size: 1.15rem; font-weight: bold; color: #b91c1c;">0</div>
                </div>
            </div>

            <!-- BUSCADOR UNIVERSAL INTELIGENTE DE ARQUEO -->
            <div style="margin-bottom: 1rem; display: flex; gap: 8px; align-items: center;">
                <div class="toolbar-search-box" style="flex: 1; position: relative;">
                    <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%);">🔍</span>
                    <input type="text" id="inputBuscadorArqueo" placeholder="Buscar SKU, barras, nombre..." oninput="filtrarArqueoEnVivoOptimizado()" style="width: 100%; padding: 8px 8px 8px 32px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; box-sizing: border-box;">
                </div>
                <select id="filtroEstadoArqueo" onchange="filtrarArqueoEnVivoOptimizado()" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: white; font-size: 0.85rem;">
                    <option value="TODOS">Todos</option>
                    <option value="PRESENTES">Presentes</option>
                    <option value="FALTANTES">Faltantes</option>
                </select>
            </div>

            <div id="tablaInventarioContainer"><p style="text-align: center; color: #64748b; padding: 2rem;">Cargando inventario...</p></div>
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
            let html = `<option value="">Seleccione...</option>`;
            res.data.forEach(u => {
                let nombreUser = u.Nombre || u.nombre || u.Usuario || u.usuario || "Admin";
                html += `<option value="${nombreUser}">${nombreUser}</option>`;
            });
            select.innerHTML = html;

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
    if (typeof mostrarSpinner === "function") {
        mostrarSpinner("Sincronizando inventario físico...");
    }

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
            if (typeof ocultarSpinner === "function") ocultarSpinner();
            document.getElementById("tablaInventarioContainer").innerHTML = `<p style="color: #ef4444; text-align: center;">Error al cargar datos.</p>`;
            return;
        }
    }

    if (typeof ocultarSpinner === "function") {
        ocultarSpinner();
    }

    listaInventarioCache = (productos || []).filter(p => String(p.Estado || p.estado || "DISPONIBLE").trim().toUpperCase().includes("DISPONIBLE")).map(p => ({
        ...p,
        auditado: false
    }));

    listaInventarioFiltradosCache = listaInventarioCache;
    actualizarContadoresArqueo();
    renderizarTablaArqueo();
}

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

    document.getElementById("lblTotalInventario").textContent = total;
    document.getElementById("lblPresentesInventario").textContent = presentes;
    document.getElementById("lblFaltantesInventario").textContent = faltantes;
}

function renderizarTablaArqueo() {
    const contenedor = document.getElementById("tablaInventarioContainer");
    if (!listaInventarioFiltradosCache || listaInventarioFiltradosCache.length === 0) {
        contenedor.innerHTML = `<p style="color: #64748b; text-align: center; padding: 2rem;">No se encontraron registros en el arqueo.</p>`;
        return;
    }

    let html = `<div style="display: flex; flex-direction: column; gap: 10px;">`;

    listaInventarioFiltradosCache.forEach(p => {
        let codigoBarraVal = p.Codigo_Barra || p.codigo_barra || 'Sin código';
        let nombre = p.Nombre || p.nombre || 'Joya sin descripción';
        let categoria = p.ID_Categoria || p.categoria || 'Joyas';
        let ubicacion = p.ID_Ubicacion || p.ubicacion || 'General';
        let peso = p.Peso || p.peso || 0;

        let badgeEstado = p.auditado 
            ? `<span style="background-color: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 4px;">✔ PRESENTE</span>` 
            : `<span style="background-color: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 4px;">✖ FALTANTE</span>`;
        
        let btnAccion = p.auditado
            ? `<button class="btn-action" onclick="marcarItemAuditado('${p.SKU}')" style="background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 600; width: 100%;">Desmarcar</button>`
            : `<button class="btn-action" onclick="marcarItemAuditado('${p.SKU}')" style="background: #ecfdf5; color: #10b981; border: 1px solid #a7f3d0; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 600; width: 100%;">✔ Marcar Encontrado</button>`;

        html += `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                    <div>
                        <span style="font-size: 0.75rem; font-weight: bold; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">SKU: ${p.SKU}</span>
                        <div style="font-size: 0.95rem; font-weight: 600; color: #0f172a; margin-top: 6px; line-height: 1.3;">${nombre}</div>
                    </div>
                    <div>${badgeEstado}</div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; font-size: 0.8rem; color: #475569; background: #f8fafc; padding: 8px; border-radius: 6px;">
                    <div><strong>Categoría:</strong><br>${categoria}</div>
                    <div><strong>Ubicación:</strong><br>${ubicacion}</div>
                    <div><strong>Peso:</strong><br>${peso}g</div>
                </div>

                <div style="font-size: 0.75rem; color: #64748b;">
                    Código de Barras: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #334155;">${codigoBarraVal}</code>
                </div>

                <div style="margin-top: 4px;">
                    ${btnAccion}
                </div>
            </div>
        `;
    });

    html += `</div>`;
    contenedor.innerHTML = html;
}

function limpiarArqueoFisico() {
    listaInventarioCache.forEach(p => p.auditado = false);
    document.getElementById("inputBuscadorArqueo").value = "";
    document.getElementById("filtroEstadoArqueo").value = "TODOS";
    listaInventarioFiltradosCache = listaInventarioCache;
    actualizarContadoresArqueo();
    renderizarTablaArqueo();
}

function exportarFormatoExcelVacio() {
    if (!listaInventarioCache || listaInventarioCache.length === 0) { alert("No hay datos para exportar."); return; }
    let csv = "SKU;Codigo_Barra;Nombre;Categoria;Ubicacion;Peso;Conteo_Fisico\n";
    listaInventarioCache.forEach(p => {
        csv += [p.SKU, p.Codigo_Barra || "", `"${(p.Nombre || "").replace(/"/g, '""')}"`, p.ID_Categoria || "", p.ID_Ubicacion || "", p.Peso || 0, ""].join(";") + "\n";
    });
    let link = document.createElement("a");
    link.href = encodeURI("data:text/csv;charset=utf-8,\uFEFF" + csv);
    link.download = `formato_inventario_vacio.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

function exportarArqueoExcel() {
    if (!listaInventarioCache || listaInventarioCache.length === 0) { alert("No hay datos de arqueo."); return; }
    
    let responsable = document.getElementById("arqResponsableSelect")?.value || "No asignado";
    let fecha = document.getElementById("arqFecha")?.value || new Date().toISOString().split('T')[0];
    let area = document.getElementById("arqArea")?.value || "Inventario General";

    let csv = `REPORTE DE ARQUEO E INVENTARIO FISICO\nFecha:;${fecha}\nResponsable:;${responsable}\nArea:;${area}\n\n`;
    csv += "SKU;Codigo_Barra;Nombre;Categoría;Ubicación;Peso;Estado_Auditoria\n";
    
    listaInventarioCache.forEach(p => {
        let estado = p.auditado ? "PRESENTE" : "FALTANTE";
        csv += [p.SKU, p.Codigo_Barra || "", `"${(p.Nombre || "").replace(/"/g, '""')}"`, p.ID_Categoria || "", p.ID_Ubicacion || "", p.Peso || 0, estado].join(";") + "\n";
    });
    
    let link = document.createElement("a");
    link.href = encodeURI("data:text/csv;charset=utf-8,\uFEFF" + csv);
    link.download = `arqueo_inventario_${fecha}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}
