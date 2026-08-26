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
            <div id="tablaMovimientosContenedor">Cargando registros...</div>
        </div>`;

    const res = await API.llamar(tipoMovimiento === 'ENTRADAS' ? "obtenerEntradas" : "obtenerSalidas", {}, "GET");
    const contenedor = document.getElementById("tablaMovimientosContenedor");

    if (res && res.status === "success" && res.data && res.data.length > 0) {
        let html = `<div class="table-container"><table class="data-table"><thead><tr><th>ID</th><th>Fecha</th><th>SKU / Referencia</th><th>Cantidad</th><th>Motivo</th><th>Usuario</th><th>Observaciones</th>`;
        if (tipoMovimiento === 'SALIDAS') html += `<th>Acciones</th>`;
        html += `</tr></thead><tbody>`;

        res.data.forEach(m => {
            let idMov = m.ID_Movimiento || m.ID_Salida || m.id_movimiento || m.id_salida || '-';
            let sku = m.SKU || m.sku || '-';
            html += `<tr><td><strong>${idMov}</strong></td><td>${m.Fecha || m.fecha || '-'}</td><td><strong style="color: #d97706;">${sku}</strong></td><td>${m.Cantidad || m.cantidad || 1}</td><td>${m.Motivo || m.motivo || '-'}</td><td>${m.Usuario || m.usuario || '-'}</td><td>${m.Observaciones || m.observaciones || '-'}</td>`;
            if (tipoMovimiento === 'SALIDAS') {
                html += `<td><button class="btn-action btn-delete" onclick="reversarSalidaUnica('${idMov}')" title="Reversar Salida">↩️</button></td>`;
            }
            html += `</tr>`;
        });
        html += `</tbody></table></div>`;
        contenedor.innerHTML = html;
    } else {
        contenedor.innerHTML = `<p style="text-align: center; color: #64748b; padding: 2rem;">No hay registros de ${tipoMovimiento.toLowerCase()} en el sistema.</p>`;
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
                <h3 style="color: #0f172a; margin: 0;">📑 Kardex de Movimientos de Inventario</h3>
                <button class="btn-nuevo-producto" onclick="renderizarModuloKardex(document.getElementById('contentBody'))">🔄 Actualizar</button>
            </div>
            <div id="tablaKardexContenedor">Cargando Kardex y cruzando estados...</div>
        </div>`;

    try {
        const [resE, resS] = await Promise.all([API.llamar("obtenerEntradas", {}, "GET"), API.llamar("obtenerSalidas", {}, "GET")]);
        let movs = [];
        if (resE && resE.status === "success" && resE.data) resE.data.forEach(e => movs.push({ ...e, Tipo: 'ENTRADA' }));
        if (resS && resS.status === "success" && resS.data) resS.data.forEach(s => movs.push({ ...s, Tipo: 'SALIDA' }));
        movs.sort((a, b) => new Date(b.Fecha || b.fecha || 0) - new Date(a.Fecha || a.fecha || 0));

        const contenedor = document.getElementById("tablaKardexContenedor");
        if (movs.length === 0) {
            contenedor.innerHTML = `<p style="text-align: center; color: #64748b; padding: 2rem;">No hay movimientos registrados en el Kardex.</p>`;
            return;
        }

        let html = `<div class="table-container"><table class="data-table"><thead><tr><th>Tipo</th><th>Fecha</th><th>SKU / Barras</th><th>Producto</th><th>Estado</th><th>Cantidad</th><th>Motivo</th><th>Usuario</th></tr></thead><tbody>`;
        movs.forEach(m => {
            let tipo = m.Tipo || 'MOV';
            let bg = tipo === 'ENTRADA' ? '#059669' : '#dc2626';
            html += `<tr><td><span class="badge" style="background:${bg};">${tipo}</span></td><td>${m.Fecha||m.fecha||'-'}</td><td><strong>${m.SKU||m.sku||'-'}</strong></td><td>${m.Nombre_Producto||'-'}</td><td>${m.Estado_Actual||'DISPONIBLE'}</td><td>${m.Cantidad||m.cantidad||1}</td><td>${m.Motivo||m.motivo||'-'}</td><td>${m.Usuario||m.usuario||'-'}</td></tr>`;
        });
        html += `</tbody></table></div>`;
        contenedor.innerHTML = html;
    } catch (e) {
        document.getElementById("tablaKardexContenedor").innerHTML = `<p style="color: #ef4444; text-align: center; padding: 2rem;">Error al cargar el Kardex.</p>`;
    }
}
