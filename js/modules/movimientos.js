/**
 * MANU JOYEROS - Módulo de Entradas, Salidas y Kardex (movimientos.js)
 */

async function renderizarModuloSalidas(container) {
    container.innerHTML = `
        <div class="card">
            <h3 style="color: #0f172a; margin-bottom: 0.5rem; font-size: 1.1rem;">📤 Salidas del Inventario</h3>
            <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 1.25rem;">Gestione y registre las salidas vinculadas a SKU o Código de Barras.</p>
            
            <div style="display: flex; gap: 10px; margin-bottom: 1.25rem; flex-wrap: wrap;">
                <button class="btn-modern btn-danger-action" onclick="abrirModalRegistrarSalida()">➕ Registrar Salida</button>
            </div>

            <div class="toolbar-search-box" style="margin-bottom: 1.25rem;">
                <span>🔍</span>
                <input type="text" id="inputBuscadorSalidas" placeholder="Buscar por SKU, código de barras, motivo, usuario..." oninput="filtrarSalidasEnVivo()" style="width: 100%; padding: 8px 8px 8px 32px; border: 1px solid #cbd5e1; border-radius: 6px;">
            </div>

            <div id="tablaSalidasContainer"><p style="text-align: center; color: #64748b; padding: 2rem;">Cargando registros de salidas...</p></div>
        </div>

        <!-- MODAL PROFESIONAL PARA REGISTRAR SALIDA (En vez de ventanita prompt) -->
        <div class="image-modal" id="modalFormSalida" onclick="cerrarModalSalidaCustom()">
            <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 480px; width: 95%; color: #0f172a; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);" onclick="event.stopPropagation()">
                <h3 style="margin-bottom: 1rem; color: #0f172a; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">📤 Registrar Salida de Inventario</h3>
                <form onsubmit="ejecutarRegistroSalidaCustom(event)">
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="display: block; font-size: 0.85rem; font-weight: 500; color: #334155; margin-bottom: 4px;">SKU o Código de Barras *</label>
                        <input type="text" id="salidaInputSku" required placeholder="Escanee o escriba SKU..." style="width:100%; padding:9px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.95rem;">
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="display: block; font-size: 0.85rem; font-weight: 500; color: #334155; margin-bottom: 4px;">Motivo (Ej: Venta, Reparación, Producción Taller) *</label>
                        <input type="text" id="salidaInputMotivo" required placeholder="Venta Cliente" style="width:100%; padding:9px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.95rem;" value="Venta Cliente">
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="display: block; font-size: 0.85rem; font-weight: 500; color: #334155; margin-bottom: 4px;">Cantidad *</label>
                        <input type="number" id="salidaInputCantidad" required value="1" min="1" style="width:100%; padding:9px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.95rem;">
                    </div>
                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <label style="display: block; font-size: 0.85rem; font-weight: 500; color: #334155; margin-bottom: 4px;">Observaciones adicionales</label>
                        <input type="text" id="salidaInputObs" placeholder="Detalles o notas..." style="width:100%; padding:9px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.95rem;">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" style="flex: 1; background-color: #0f172a; color: #ffffff; border: none; padding: 0.75rem; border-radius: 8px; font-weight: 500; cursor: pointer;">Aceptar</button>
                        <button type="button" onclick="cerrarModalSalidaCustom()" style="flex: 1; background-color: #ef4444; color: #ffffff; border: none; padding: 0.75rem; border-radius: 8px; font-weight: 500; cursor: pointer;">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>`;

    await cargarListaSalidas();
}

function abrirModalRegistrarSalida() {
    document.getElementById("salidaInputSku").value = "";
    document.getElementById("salidaInputMotivo").value = "Venta Cliente";
    document.getElementById("salidaInputCantidad").value = "1";
    document.getElementById("salidaInputObs").value = "";
    document.getElementById("modalFormSalida").classList.add("active");
    setTimeout(() => document.getElementById("salidaInputSku").focus(), 100);
}

function cerrarModalSalidaCustom() {
    document.getElementById("modalFormSalida").classList.remove("active");
}

async function ejecutarRegistroSalidaCustom(e) {
    e.preventDefault();
    let sku = document.getElementById("salidaInputSku").value.trim();
    let motivo = document.getElementById("salidaInputMotivo").value.trim();
    let cantidad = document.getElementById("salidaInputCantidad").value.trim();
    let observaciones = document.getElementById("salidaInputObs").value.trim();

    if (!sku) return;

    cerrarModalSalidaCustom();

    const res = await API.llamar("registrarSalida", {
        action: "registrarSalida",
        sku: sku,
        motivo: motivo,
        cantidad: cantidad,
        observaciones: observaciones,
        usuario: usuarioActual ? usuarioActual.usuario : "ADMIN"
    }, "POST");

    if (res && res.status === "success") {
        alert(res.message);
        localStorage.removeItem("cache_productos_manu");
        renderizarModuloSalidas(document.getElementById('contentBody'));
    } else {
        alert("Error: " + (res ? res.message : "No se pudo registrar la salida."));
    }
}

let listaSalidasCache = [];

async function cargarListaSalidas() {
    const contenedor = document.getElementById("tablaSalidasContainer");
    const res = await API.llamar("obtenerSalidas", {}, "GET");
    if (res && res.status === "success") {
        listaSalidasCache = res.data || [];
        renderizarTablaSalidas(listaSalidasCache);
    } else {
        contenedor.innerHTML = `<p style="color: #ef4444; text-align: center;">No hay registros de salidas en el sistema.</p>`;
    }
}

function filtrarSalidasEnVivo() {
    const query = document.getElementById("inputBuscadorSalidas").value.toLowerCase().trim();
    if (!query) {
        renderizarTablaSalidas(listaSalidasCache);
        return;
    }
    const terminos = query.split(/\s+/);
    const filtrados = listaSalidasCache.filter(s => {
        const id = String(s.ID || s.id || "").toLowerCase();
        const sku = String(s.SKU || s.sku || "").toLowerCase();
        const fecha = String(s.Fecha || s.fecha || "").toLowerCase();
        const motivo = String(s.Motivo || s.motivo || "").toLowerCase();
        const usuario = String(s.Usuario || s.usuario || "").toLowerCase();
        const obs = String(s.Observaciones || s.observaciones || "").toLowerCase();

        return terminos.every(t => id.includes(t) || sku.includes(t) || fecha.includes(t) || motivo.includes(t) || usuario.includes(t) || obs.includes(t));
    });
    renderizarTablaSalidas(filtrados);
}

function renderizarTablaSalidas(data) {
    const contenedor = document.getElementById("tablaSalidasContainer");
    if (!data || data.length === 0) {
        contenedor.innerHTML = `<p style="color: #64748b; text-align: center; padding: 2rem;">No hay registros de salidas en el sistema.</p>`;
        return;
    }

    let html = `<div class="table-container"><table class="data-table"><thead><tr>
        <th>ID</th><th>Fecha</th><th>SKU</th><th>Cantidad</th><th>Motivo</th><th>Usuario</th><th>Observaciones</th><th>Acciones</th>
    </tr></thead><tbody>`;

    data.forEach(s => {
        html += `<tr>
            <td>${s.ID || s.id || ''}</td>
            <td>${s.Fecha || s.fecha || ''}</td>
            <td><strong>${s.SKU || s.sku || ''}</strong></td>
            <td>${s.Cantidad || s.cantidad || 1}</td>
            <td>${s.Motivo || s.motivo || ''}</td>
            <td>${s.Usuario || s.usuario || ''}</td>
            <td>${s.Observaciones || s.observaciones || ''}</td>
            <td><button class="btn-action" onclick="anularSalida('${s.ID || s.id || ''}')" style="background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Anular</button></td>
        </tr>`;
    });

    html += `</tbody></table></div>`;
    contenedor.innerHTML = html;
}

async function anularSalida(idSalida) {
    if (!idSalida || !confirm(`¿Está seguro de anular la salida [${idSalida}]? El producto volverá a estar disponible.`)) return;
    const res = await API.llamar("anularSalida", { action: "anularSalida", id: idSalida }, "POST");
    if (res && res.status === "success") {
        alert(res.message);
        localStorage.removeItem("cache_productos_manu");
        renderizarModuloSalidas(document.getElementById('contentBody'));
    } else {
        alert("Error al anular la salida.");
    }
}
