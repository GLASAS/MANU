/**
 * MANU JOYEROS - Módulo Independiente de Kardex (kardex.js)
 * Versión Completa e Íntegra corregida para reflejar correctamente Motivo, Observación, Tipo y Cantidades - 2026
 */

async function renderizarModuloKardex(container) {
    if (!container) {
        container = document.getElementById("contentBody") || document.querySelector("main");
    }

    container.innerHTML = `
        <div class="card" style="background: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                    <h3 style="margin: 0; color: #0f172a; font-size: 1.2rem;">📋 Kardex General de Movimientos</h3>
                    <p style="font-size: 0.85rem; color: #64748b; margin-top: 4px;">Trazabilidad unificada de todas las entradas y salidas del inventario.</p>
                </div>
                <button type="button" onclick="cargarDatosKardex()" style="background: #0f172a; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.85rem;">🔄 Actualizar Kardex</button>
            </div>
            
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
                            <th style="padding: 10px;">ID Movimiento</th>
                            <th style="padding: 10px;">Fecha</th>
                            <th style="padding: 10px;">SKU / Producto</th>
                            <th style="padding: 10px;">Tipo</th>
                            <th style="padding: 10px; text-align: center;">Entrada</th>
                            <th style="padding: 10px; text-align: center;">Salida</th>
                            <th style="padding: 10px; text-align: center;">Stock</th>
                            <th style="padding: 10px;">Motivo</th>
                            <th style="padding: 10px;">Observaciones</th>
                            <th style="padding: 10px;">Usuario</th>
                        </tr>
                    </thead>
                    <tbody id="tablaKardexBody">
                        <tr><td colspan="10" style="text-align: center; padding: 30px; color: #64748b;">Cargando trazabilidad del Kardex...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    await cargarDatosKardex();
}

async function cargarDatosKardex() {
    const tbody = document.getElementById("tablaKardexBody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 30px; color: #64748b;">Sincronizando movimientos...</td></tr>`;

    try {
        const res = await API.llamar("obtenerKardex", {}, "GET");
        if (res && res.status === "success" && res.data && res.data.length > 0) {
            let html = "";
            res.data.reverse().forEach(row => {
                // Buscamos dinámicamente el tipo de movimiento cubriendo variaciones de nombres en las cabeceras
                let tipoRaw = row["Tipo_Movimiento (ENTRADA/SALIDA/AJUSTE)"] || row.Tipo_Movimiento || row.tipo_movimiento || "";
                let tipo = String(tipoRaw).toUpperCase();
                
                let badgeTipo = tipo.includes("ENTRADA") 
                    ? `<span style="background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">ENTRADA</span>`
                    : `<span style="background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">SALIDA</span>`;

                let skuProd = row.ID_Producto || row.id_producto || row.SKU || row.sku || "-";
                let cantEntrada = row.Cant_Entrada !== undefined ? row.Cant_Entrada : (row.cant_entrada || 0);
                let cantSalida = row.Cant_Salida !== undefined ? row.Cant_Salida : (row.cant_salida || 0);
                let saldoStock = row.Saldo_Stock !== undefined ? row.Saldo_Stock : (row.saldo_stock || 0);
                let motivoVal = row.Motivo || row.motivo || "-";
                let observacionVal = row.Observacion || row.observacion || row.Observaciones || row.observaciones || "-";
                let usuarioVal = row.Usuario || row.usuario || "-";
                let fechaVal = row.Fecha || row.fecha || "-";
                let idKardexVal = row.ID_Kardex || row.id_kardex || "-";

                html += `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px; font-weight: bold; color: #0f172a;">${idKardexVal}</td>
                        <td style="padding: 10px; color: #475569;">${fechaVal}</td>
                        <td style="padding: 10px; font-weight: bold; color: #2563eb;">${skuProd}</td>
                        <td style="padding: 10px;">${badgeTipo}</td>
                        <td style="padding: 10px; text-align: center; font-weight: bold; color: #059669;">${cantEntrada}</td>
                        <td style="padding: 10px; text-align: center; font-weight: bold; color: #dc2626;">${cantSalida}</td>
                        <td style="padding: 10px; text-align: center; font-weight: bold; color: #0f172a;">${saldoStock}</td>
                        <td style="padding: 10px; color: #334155; font-weight: 600;">${motivoVal}</td>
                        <td style="padding: 10px; color: #64748b;">${observacionVal}</td>
                        <td style="padding: 10px; color: #475569;">${usuarioVal}</td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        } else {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 30px; color: #64748b;">No hay registros en el Kardex.</td></tr>`;
        }
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 30px; color: #ef4444;">Error al cargar el Kardex.</td></tr>`;
    }
}
