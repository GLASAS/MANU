/**
 * MANU JOYEROS - Módulo de Kardex (kardex.js)
 * Versión corregida para lectura correcta de Movimientos, Cantidades y SKU - 2026
 */

async function renderizarModuloKardex(container) {
    if (!container) {
        container = document.getElementById("contentBody") || document.querySelector("main");
    }

    container.innerHTML = `
        <div class="card" style="background: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h3 style="margin: 0; color: #0f172a; font-size: 1.1rem;">📋 Kardex General de Movimientos</h3>
                    <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #64748b;">Trazabilidad unificada de todas las entradas y salidas del inventario.</p>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button type="button" onclick="cargarDatosKardex()" style="background: #0f172a; color: white; border: none; padding: 8px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.85rem;">🔄 Actualizar Kardex</button>
                    <input type="text" id="buscadorKardex" placeholder="Filtrar por SKU, Motivo..." onkeyup="filtrarTablaKardex()" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; font-size: 0.85rem; width: 220px;">
                </div>
            </div>

            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
                            <th style="padding: 10px;">Fecha</th>
                            <th style="padding: 10px;">Tipo</th>
                            <th style="padding: 10px;">SKU / Producto</th>
                            <th style="padding: 10px;">Cantidad</th>
                            <th style="padding: 10px;">Motivo</th>
                            <th style="padding: 10px;">Observaciones</th>
                            <th style="padding: 10px;">Usuario</th>
                        </tr>
                    </thead>
                    <tbody id="tablaKardexBody">
                        <tr><td colspan="7" style="text-align: center; padding: 30px; color: #64748b;">Cargando movimientos del kardex...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    await cargarDatosKardex();
}

let kardexGlobalCache = [];

async function cargarDatosKardex() {
    const tbody = document.getElementById("tablaKardexBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; color: #2563eb; font-weight: bold;">🔄 Sincronizando movimientos...</td></tr>`;

    if (typeof mostrarSpinner === "function") {
        mostrarSpinner("Sincronizando kardex...");
    }

    try {
        const res = await API.llamar("obtenerKardex", {}, "GET");
        
        if (typeof ocultarSpinner === "function") {
            ocultarSpinner();
        }

        if (res && res.status === "success" && res.data) {
            kardexGlobalCache = res.data;
            renderizarTablaKardex(kardexGlobalCache);
        } else {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; color: #ef4444;">No hay registros en el Kardex.</td></tr>`;
        }
    } catch (e) {
        if (typeof ocultarSpinner === "function") {
            ocultarSpinner();
        }
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; color: #ef4444;">Error de conexión con el servidor.</td></tr>`;
    }
}

function renderizarTablaKardex(lista) {
    const tbody = document.getElementById("tablaKardexBody");
    if (!tbody) return;

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; color: #64748b;">No se encontraron movimientos registrados.</td></tr>`;
        return;
    }

    let html = "";
    lista.forEach(item => {
        let fecha = item.Fecha || item.fecha || "-";
        let tipo = String(item.Tipo_Movimiento || item.tipo_movimiento || "").toUpperCase();
        let sku = item.ID_Producto || item.id_producto || item.SKU || item.sku || "-";
        
        let cantEntrada = Number(item.Cant_Entrada || item.cant_entrada || 0);
        let cantSalida = Number(item.Cant_Salida || item.cant_salida || 0);
        let cantidadFinal = cantEntrada > 0 ? cantEntrada : cantSalida;

        let motivo = item.Motivo || item.motivo || "-";
        let observaciones = item.Observacion || item.observacion || item.Observaciones || item.observaciones || "-";
        let usuario = item.Usuario || item.usuario || "-";

        let badgeTipo = "";
        if (tipo.includes("ENTRADA")) {
            badgeTipo = `<span style="background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 0.75rem;">📥 ENTRADA</span>`;
        } else if (tipo.includes("SALIDA")) {
            badgeTipo = `<span style="background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 0.75rem;">📤 SALIDA</span>`;
        } else {
            badgeTipo = `<span style="background: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 0.75rem;">${tipo}</span>`;
        }

        html += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; color: #475569; font-size: 0.82rem;">${fecha}</td>
                <td style="padding: 10px;">${badgeTipo}</td>
                <td style="padding: 10px; font-weight: bold; color: #0f172a;">${sku}</td>
                <td style="padding: 10px; font-weight: bold; color: ${tipo.includes("SALIDA") ? "#dc2626" : "#059669"};">${tipo.includes("SALIDA") ? "-" : "+"}${cantidadFinal}</td>
                <td style="padding: 10px; color: #334155;">${motivo}</td>
                <td style="padding: 10px; color: #64748b; font-size: 0.82rem;">${observaciones}</td>
                <td style="padding: 10px; color: #475569; font-size: 0.82rem;">${usuario}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function filtrarTablaKardex() {
    const query = document.getElementById("buscadorKardex").value.toLowerCase().trim();
    if (!query) {
        renderizarTablaKardex(kardexGlobalCache);
        return;
    }

    const filtrados = kardexGlobalCache.filter(item => {
        const sku = String(item.ID_Producto || item.id_producto || item.SKU || "").toLowerCase();
        const motivo = String(item.Motivo || item.motivo || "").toLowerCase();
        const usuario = String(item.Usuario || item.usuario || "").toLowerCase();
        const observaciones = String(item.Observacion || item.observacion || "").toLowerCase();
        return sku.includes(query) || motivo.includes(query) || usuario.includes(query) || observaciones.includes(query);
    });

    renderizarTablaKardex(filtrados);
}
