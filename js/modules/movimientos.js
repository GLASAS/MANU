/**
 * MANU JOYEROS - Módulo de Movimientos y Kardex (movimientos.js)
 */

async function renderizarModuloEntradasSalidas(container, tipoMovimiento) {
    let titulo = tipoMovimiento === 'ENTRADAS' ? '📥 Entradas al Inventario' : '📤 Salidas del Inventario';
    let color = tipoMovimiento === 'ENTRADAS' ? '#059669' : '#dc2626';

    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="color: #0f172a; margin: 0;">${titulo}</h3>
                ${tipoMovimiento === 'ENTRADAS' ? `<button class="btn-nuevo-producto" style="background:${color};" onclick="abrirFormularioMovimiento('${tipoMovimiento}')">+ Registrar Entrada</button>` : ''}
            </div>
            <div id="tablaMovimientosContenedor">Cargando...</div>
        </div>`;

    const res = await API.llamar(tipoMovimiento === 'ENTRADAS' ? "obtenerEntradas" : "obtenerSalidas", {}, "GET");
    const contenedor = document.getElementById("tablaMovimientosContenedor");

    if (res && res.status === "success" && res.data && res.data.length > 0) {
        let html = `<div class="table-container"><table class="data-table"><thead><tr><th>ID</th><th>Fecha</th><th>SKU</th><th>Cantidad</th><th>Motivo</th><th>Usuario</th><th>Observaciones</th>`;
        if (tipoMovimiento === 'SALIDAS') html += `<th>Acciones</th>`;
        html += `</tr></thead><tbody>`;

        res.data.forEach(m => {
            let idMov = m.ID_Movimiento || m.ID_Salida || '-';
            let sku = m.SKU || '-';
            html += `<tr><td><strong>${idMov}</strong></td><td>${m.Fecha || '-'}</td><td><strong style="color: #d97706;">${sku}</strong></td><td>${m.Cantidad || 1}</td><td>${m.Motivo || '-'}</td><td>${m.Usuario || '-'}</td><td>${m.Observaciones || '-'}</td>`;
            if (tipoMovimiento === 'SALIDAS') {
                html += `<td><button class="btn-action btn-delete" onclick="reversarSalidaUnica('${idMov}')" title="Reversar Salida">↩️</button></td>`;
            }
            html += `</tr>`;
        });
        html += `</tbody></table></div>`;
        contenedor.innerHTML = html;
    } else {
        contenedor.innerHTML = `<p style="text-align: center; color: #64748b; padding: 2rem;">No hay registros.</p>`;
    }
}

async function reversarSalidaUnica(idSalida) {
    if (!confirm(`¿Está seguro de anular la salida [${idSalida}]? El producto volverá a estado DISPONIBLE.`)) return;
    const res = await API.llamar("reversarSalida", { action: "reversarSalida", id_salida: idSalida, usuario: usuarioActual.usuario }, "POST");
    if (res && res.status === "success") {
        alert(res.message);
        localStorage.removeItem("cache_productos_manu");
        renderizarModuloEntradasSalidas(document.getElementById('contentBody'), 'SALIDAS');
    } else {
        alert("Error al reversar: " + (res ? res.message : "Desconocido"));
    }
}

async function renderizarModuloKardex(container) {
    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="color: #0f172a; margin: 0;">📑 Kardex de Movimientos</h3>
                <button class="btn-nuevo-producto" onclick="renderizarModuloKardex(document.getElementById('contentBody'))">🔄 Actualizar</button>
            </div>
            <div id="tablaKardexContenedor">Cargando Kardex...</div>
        </div>`;

    const [resE, resS] = await Promise.all([API.llamar("obtenerEntradas", {}, "GET"), API.llamar("obtenerSalidas", {}, "GET")]);
    let movs = [];
    if (resE && resE.data) resE.data.forEach(e => movs.push({ ...e, Tipo: 'ENTRADA' }));
    if (resS && resS.data) resS.data.forEach(s => movs.push({ ...s, Tipo: 'SALIDA' }));
    movs.sort((a, b) => new Date(b.Fecha || 0) - new Date(a.Fecha || 0));

    const contenedor = document.getElementById("tablaKardexContenedor");
    let html = `<div class="table-container"><table class="data-table"><thead><tr><th>Tipo</th><th>Fecha</th><th>SKU</th><th>Producto</th><th>Estado</th><th>Cantidad</th><th>Motivo</th><th>Usuario</th></tr></thead><tbody>`;
    movs.forEach(m => {
        html += `<tr><td><span class="badge" style="background:${m.Tipo==='ENTRADA'?'#059669':'#dc2626'};">${m.Tipo}</span></td><td>${m.Fecha||'-'}</td><td><strong>${m.SKU||'-'}</strong></td><td>${m.Nombre_Producto||'-'}</td><td>${m.Estado_Actual||'DISPONIBLE'}</td><td>${m.Cantidad||1}</td><td>${m.Motivo||'-'}</td><td>${m.Usuario||'-'}</td></tr>`;
    });
    html += `</tbody></table></div>`;
    contenedor.innerHTML = html;
}