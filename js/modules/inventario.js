/**
 * MANU JOYEROS - Módulo de Inventario y Arqueo (inventario.js)
 */

async function renderizarModuloInventario(container) {
    await cargarCategoriasDinamicas();
    await cargarValorOroDia();

    let fechaHoy = new Date().toISOString().split('T')[0];
    let nombreUsuarioLogueado = usuarioActual ? (usuarioActual.nombre || '') : '';

    container.innerHTML = `
        <div class="card">
            <div style="border-bottom: 2px solid #f1f5f9; padding-bottom: 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 15px;">
                <div>
                    <span style="font-size: 0.72rem; font-weight: 700; color: #d97706; text-transform: uppercase;">Módulo de Auditoría</span>
                    <h2 style="color: #0f172a; margin: 2px 0 5px 0;">📦 Arqueo e Inventario Físico en Línea</h2>
                    <p style="color: #64748b; font-size: 0.88rem; margin: 0;">Verifique existencias reales en vitrinas y caja fuerte.</p>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn-nuevo-producto" style="background: #059669;" onclick="exportarFormatoArqueoCSV()">📥 Descargar Formato Excel</button>
                    <button class="btn-nuevo-producto" style="background: #2563eb;" onclick="reiniciarArqueoEnLinea()">🔄 Limpiar</button>
                </div>
            </div>
            <div style="background: #f8fafc; padding: 1.25rem; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 1.5rem;">
                <h4 style="margin: 0 0 10px 0; color: #0f172a;">📋 Responsables</h4>
                <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px;">
                    <div><label style="font-size:0.85rem; font-weight:600; color:#334155;">📅 Fecha</label><input type="date" id="arqFechaInput" value="${fechaHoy}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;"></div>
                    <div><label style="font-size:0.85rem; font-weight:600; color:#334155;">👤 Responsable</label><input type="text" id="arqResponsableInput" value="${nombreUsuarioLogueado}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;"></div>
                    <div><label style="font-size:0.85rem; font-weight:600; color:#334155;">🏢 Área / Vitrina</label><input type="text" id="arqAuditadoAInput" value="Inventario General / Vitrinas" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;"></div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 1.5rem;">
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;"><span style="font-size: 0.72rem; color: #64748b;">TOTAL</span><div id="arqTotalItems" style="font-size: 1.4rem; font-weight: bold;">0</div></div>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;"><span style="font-size: 0.72rem; color: #059669;">✅ PRESENTES</span><div id="arqTotalPresentes" style="font-size: 1.4rem; font-weight: bold; color: #059669;">0</div></div>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;"><span style="font-size: 0.72rem; color: #dc2626;">❌ FALTANTES</span><div id="arqTotalFaltantes" style="font-size: 1.4rem; font-weight: bold; color: #dc2626;">0</div></div>
            </div>
            <div class="catalog-toolbar" style="margin-bottom: 1rem;">
                <input type="text" id="filtroArqTexto" placeholder="🔍 Buscar SKU, Nombre..." style="max-width: 400px; padding: 8px; border:1px solid #cbd5e1; border-radius:6px;" oninput="filtrarTablaArqueo()">
                <select id="filtroArqEstado" style="max-width: 180px; padding: 8px; border:1px solid #cbd5e1; border-radius:6px;" onchange="filtrarTablaArqueo()">
                    <option value="TODOS">Todos</option><option value="PRESENTE">Presentes</option><option value="PENDIENTE">Pendientes</option><option value="FALTANTE">Faltantes</option>
                </select>
            </div>
            <div id="tablaArqueoContenedor">Cargando arqueo...</div>
        </div>`;

    let res = await API.llamar("obtenerProductos", {}, "GET");
    window.listaDisponiblesArqueo = (res && res.status === "success" ? res.data : []).filter(p => String(p.Estado || "").toUpperCase().includes("DISPONIBLE"));
    window.listaArqueoFiltradaCache = window.listaDisponiblesArqueo;

    if (!window.arqueoEstados) window.arqueoEstados = {};
    window.listaDisponiblesArqueo.forEach(p => { if (window.arqueoEstados[p.SKU] === undefined) window.arqueoEstados[p.SKU] = ""; });
    construirTablaArqueo(window.listaArqueoFiltradaCache);
}

function construirTablaArqueo(productos) {
    let total = window.listaDisponiblesArqueo.length;
    let presentes = 0, faltantes = 0;
    window.listaDisponiblesArqueo.forEach(p => {
        if (window.arqueoEstados[p.SKU] === 'PRESENTE') presentes++;
        else if (window.arqueoEstados[p.SKU] === 'FALTANTE') faltantes++;
    });
    document.getElementById("arqTotalItems").textContent = total;
    document.getElementById("arqTotalPresentes").textContent = presentes;
    document.getElementById("arqTotalFaltantes").textContent = faltantes;

    const contenedor = document.getElementById("tablaArqueoContenedor");
    if (!productos || productos.length === 0) { contenedor.innerHTML = `<p style="text-align: center; color: #64748b;">No hay joyas para auditar.</p>`; return; }

    let html = `<div class="table-container"><table class="data-table"><thead><tr><th>SKU</th><th>Código Barras</th><th>Descripción</th><th>Ubicación</th><th>Peso</th><th>Estado Arqueo</th></tr></thead><tbody>`;
    productos.forEach(p => {
        let sku = p.SKU, est = window.arqueoEstados[sku] || "";
        let bg = est === 'PRESENTE' ? '#dcfce7' : est === 'FALTANTE' ? '#fee2e2' : '#ffffff';
        let col = est === 'PRESENTE' ? '#166534' : est === 'FALTANTE' ? '#991b1b' : '#64748b';
        html += `<tr><td><strong>${sku}</strong></td><td>${p.Codigo_Barra || ''}</td><td>${p.Nombre}</td><td>${p.ID_Ubicacion || ''}</td><td>${p.Peso || 0}g</td><td>
            <select onchange="window.arqueoEstados['${sku}']=this.value;construirTablaArqueo(window.listaArqueoFiltradaCache);" style="background:${bg};color:${col};font-weight:bold;padding:6px;border-radius:6px;width:100%;">
                <option value="" ${est===''?'selected':''}>-- Seleccionar --</option>
                <option value="PRESENTE" ${est==='PRESENTE'?'selected':''}>✅ Presente</option>
                <option value="FALTANTE" ${est==='FALTANTE'?'selected':''}>❌ Faltante</option>
            </select></td></tr>`;
    });
    html += `</tbody></table></div>`;
    contenedor.innerHTML = html;
}

function exportarFormatoArqueoCSV() {
    if (!window.listaDisponiblesArqueo || window.listaDisponiblesArqueo.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }
    let csv = "\uFEFFSKU;Codigo_Barra;Nombre;Ubicacion;Peso;Estado_Fisico\n";
    window.listaDisponiblesArqueo.forEach(p => {
        let estadoActual = window.arqueoEstados[p.SKU] || "PENDIENTE";
        csv += `"${p.SKU}";"${p.Codigo_Barra || ''}";"${p.Nombre}";"${p.ID_Ubicacion || ''}";"${p.Peso || 0}";"${estadoActual}"\n`;
    });
    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `arqueo_inventario_manu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function reiniciarArqueoEnLinea() { window.arqueoEstados = {}; construirTablaArqueo(window.listaArqueoFiltradaCache); }
function filtrarTablaArqueo() {
    let q = document.getElementById("filtroArqTexto").value.toLowerCase();
    let est = document.getElementById("filtroArqEstado").value;
    window.listaArqueoFiltradaCache = window.listaDisponiblesArqueo.filter(p => {
        let txt = (p.SKU + p.Nombre + p.ID_Ubicacion).toLowerCase().includes(q);
        let e = window.arqueoEstados[p.SKU] || "";
        let matchEst = est === 'TODOS' || (est === 'PRESENTE' && e === 'PRESENTE') || (est === 'FALTANTE' && e === 'FALTANTE') || (est === 'PENDIENTE' && e === '');
        return txt && matchEst;
    });
    construirTablaArqueo(window.listaArqueoFiltradaCache);
}
