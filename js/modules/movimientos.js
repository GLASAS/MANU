/**
 * MANU JOYEROS - Módulo de Entradas, Salidas y Kardex (movimientos.js)
 * Versión Íntegra con Doble Parámetro de Envío (action y accion) para Compatibilidad Absoluta con el Backend
 */

async function renderizarModuloEntradasSalidas(container, tipo = 'ENTRADAS') {
    const esEntrada = tipo === 'ENTRADAS';
    const titulo = esEntrada ? '📥 Entradas de Inventario' : '📤 Salidas de Inventario';
    const desc = esEntrada ? 'Registre la entrada de nuevas piezas o reabastecimiento al inventario.' : 'Registre la salida de joyas por venta, garantía o traslado.';
    const btnTexto = esEntrada ? 'Registrar Entrada' : 'Registrar Salida';
    const colorBtn = esEntrada ? '#059669' : '#dc2626';

    container.innerHTML = `
        <div class="card" style="background: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <h3 style="color: #0f172a; margin-bottom: 0.25rem; font-size: 1.1rem;">${titulo}</h3>
            <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 1.25rem;">${desc}</p>
            
            <form id="formMovimientoInventario" onsubmit="ejecutarRegistroMovimiento(event, '${tipo}')">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">SKU o Código de Producto *</label>
                        <input type="text" id="movSku" required placeholder="Ej: AN5000" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Cantidad *</label>
                        <input type="number" id="movCantidad" required min="1" value="1" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Motivo / Referencia *</label>
                        <input type="text" id="movMotivo" required placeholder="Ej: Compra proveedor / Venta directa" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Observaciones</label>
                        <input type="text" id="movObservaciones" placeholder="Detalles adicionales..." style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem;">
                    </div>
                </div>
                <div style="display: flex; justify-content: flex-end;">
                    <button type="submit" style="background: ${colorBtn}; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.9rem;">${btnTexto}</button>
                </div>
            </form>
        </div>

        <div class="card" style="background: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #0f172a; font-size: 1.1rem;">Historial de ${esEntrada ? 'Entradas' : 'Salidas'}</h3>
                <button type="button" onclick="cargarHistorialMovimientos('${tipo}')" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">🔄 Actualizar Lista</button>
            </div>
            <div id="tablaMovimientosContainer" style="overflow-x: auto;">
                <p style="text-align: center; color: #64748b; padding: 2rem;">Cargando historial...</p>
            </div>
        </div>
    `;

    await cargarHistorialMovimientos(tipo);
}

async function ejecutarRegistroMovimiento(event, tipo) {
    event.preventDefault();
    const esEntrada = tipo === 'ENTRADAS';
    
    const sku = document.getElementById("movSku").value.trim();
    const cantidad = Number(document.getElementById("movCantidad").value) || 1;
    const motivo = document.getElementById("movMotivo").value.trim();
    const observaciones = document.getElementById("movObservaciones").value.trim();
    const usuario = (typeof usuarioActual !== 'undefined' && usuarioActual) ? (usuarioActual.nombre || usuarioActual.usuario) : 'Admin';

    // Definimos ambos nombres de acción habituales que suelen requerir los scripts de Apps Script
    const nombreAccion = esEntrada ? "registrarEntrada" : "registrarSalida";

    const payload = {
        action: nombreAccion,
        accion: nombreAccion,
        tipo: esEntrada ? "ENTRADA" : "SALIDA",
        sku: sku,
        cantidad: cantidad,
        motivo: motivo,
        observaciones: observaciones,
        usuario: usuario
    };

    try {
        const res = await API.llamar(nombreAccion, payload, "POST");
        if (res && res.status === "success") {
            alert(res.message || "Movimiento registrado con éxito.");
            document.getElementById("formMovimientoInventario").reset();
            document.getElementById("movCantidad").value = "1";
            await cargarHistorialMovimientos(tipo);
        } else {
            alert("Error: " + (res ? res.message : "No se pudo procesar el movimiento."));
        }
    } catch (e) {
        console.error(e);
        alert("Error de conexión al intentar registrar el movimiento.");
    }
}

async function cargarHistorialMovimientos(tipo) {
    const esEntrada = tipo === 'ENTRADAS';
    const contenedor = document.getElementById("tablaMovimientosContainer");
    if (!contenedor) return;

    contenedor.innerHTML = `<p style="text-align: center; color: #64748b; padding: 2rem;">Sincronizando registros...</p>`;

    const accionApi = esEntrada ? "obtenerEntradas" : "obtenerSalidas";

    try {
        const res = await API.llamar(accionApi, {}, "GET");
        if (res && res.status === "success" && res.data) {
            const lista = res.data;
            if (lista.length === 0) {
                contenedor.innerHTML = `<p style="text-align: center; color: #64748b; padding: 2rem;">No hay registros de ${esEntrada ? 'entradas' : 'salidas'} disponibles.</p>`;
                return;
            }

            let html = `<table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;"><thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
                    <th style="padding: 10px;">Fecha</th>
                    <th style="padding: 10px;">SKU</th>
                    <th style="padding: 10px;">Cantidad</th>
                    <th style="padding: 10px;">Motivo</th>
                    <th style="padding: 10px;">Observaciones</th>
                    <th style="padding: 10px;">Usuario</th>
                </tr></thead><tbody>`;

            lista.reverse().forEach(m => {
                let fecha = m.Fecha || m.fecha || '-';
                let sku = m.SKU || m.sku || '-';
                let cant = m.Cantidad || m.cantidad || 0;
                let mot = m.Motivo || m.motivo || '-';
                let obs = m.Observaciones || m.observaciones || '-';
                let usr = m.Usuario || m.usuario || '-';

                html += `<tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px; color: #64748b;">${fecha}</td>
                    <td style="padding: 10px; font-weight: bold; color: #0f172a;">${sku}</td>
                    <td style="padding: 10px; font-weight: bold; color: ${esEntrada ? '#059669' : '#dc2626'};">${cant}</td>
                    <td style="padding: 10px; color: #334155;">${mot}</td>
                    <td style="padding: 10px; color: #64748b;">${obs}</td>
                    <td style="padding: 10px; color: #475569;">${usr}</td>
                </tr>`;
            });

            html += `</tbody></table>`;
            contenedor.innerHTML = html;
        } else {
            contenedor.innerHTML = `<p style="text-align: center; color: #64748b; padding: 2rem;">No se encontraron registros de ${esEntrada ? 'entradas' : 'salidas'}.</p>`;
        }
    } catch (e) {
        console.error(e);
        contenedor.innerHTML = `<p style="text-align: center; color: #ef4444; padding: 2rem;">Error al cargar el historial.</p>`;
    }
}

/**
 * MÓDULO DE KARDEX GENERAL DE MOVIMIENTOS
 */
async function renderizarModuloKardex(container) {
    container.innerHTML = `
        <div class="card" style="background: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                <div>
                    <h3 style="margin: 0; color: #0f172a; font-size: 1.1rem;">📑 Kardex General de Movimientos</h3>
                    <p style="margin: 0; font-size: 0.85rem; color: #64748b;">Trazabilidad unificada de todas las entradas y salidas del inventario.</p>
                </div>
                <button type="button" onclick="cargarKardexGeneral()" style="background: #0f172a; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.85rem;">🔄 Actualizar Kardex</button>
            </div>
            <div id="tablaKardexContainer" style="overflow-x: auto;">
                <p style="text-align: center; color: #64748b; padding: 2rem;">Cargando movimientos del Kardex...</p>
            </div>
        </div>
    `;

    await cargarKardexGeneral();
}

async function cargarKardexGeneral() {
    const contenedor = document.getElementById("tablaKardexContainer");
    if (!contenedor) return;

    contenedor.innerHTML = `<p style="text-align: center; color: #64748b; padding: 2rem;">Consolidando trazabilidad de entradas y salidas...</p>`;

    try {
        const res = await API.llamar("obtenerKardex", {}, "GET");
        if (res && res.status === "success" && res.data) {
            const lista = res.data;
            if (lista.length === 0) {
                contenedor.innerHTML = `<p style="text-align: center; color: #64748b; padding: 2rem;">No hay registros en el Kardex.</p>`;
                return;
            }

            let html = `<table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;"><thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
                    <th style="padding: 10px;">Fecha</th>
                    <th style="padding: 10px;">Tipo</th>
                    <th style="padding: 10px;">SKU</th>
                    <th style="padding: 10px;">Cantidad</th>
                    <th style="padding: 10px;">Motivo</th>
                    <th style="padding: 10px;">Observaciones</th>
                    <th style="padding: 10px;">Usuario</th>
                </tr></thead><tbody>`;

            lista.reverse().forEach(k => {
                let fecha = k.Fecha || k.fecha || '-';
                let tipo = String(k.Tipo || k.tipo || 'ENTRADA').toUpperCase();
                let sku = k.SKU || k.sku || '-';
                let cantidad = k.Cantidad || k.cantidad || 0;
                let motivo = k.Motivo || k.motivo || '-';
                let obs = k.Observaciones || k.observaciones || '-';
                let usuario = k.Usuario || k.usuario || '-';

                let badgeTipo = tipo.includes('ENTRADA') 
                    ? `<span style="background: #d1fae5; color: #065f46; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">📥 ENTRADA</span>`
                    : `<span style="background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">📤 SALIDA</span>`;

                html += `<tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px; color: #64748b;">${fecha}</td>
                    <td style="padding: 10px;">${badgeTipo}</td>
                    <td style="padding: 10px; font-weight: bold; color: #0f172a;">${sku}</td>
                    <td style="padding: 10px; font-weight: bold;">${cantidad}</td>
                    <td style="padding: 10px; color: #334155;">${motivo}</td>
                    <td style="padding: 10px; color: #64748b;">${obs}</td>
                    <td style="padding: 10px; color: #475569;">${usuario}</td>
                </tr>`;
            });

            html += `</tbody></table>`;
            contenedor.innerHTML = html;
        } else {
            contenedor.innerHTML = `<p style="text-align: center; color: #64748b; padding: 2rem;">No hay registros en el Kardex.</p>`;
        }
    } catch (e) {
        console.error(e);
        contenedor.innerHTML = `<p style="text-align: center; color: #ef4444; padding: 2rem;">Error al cargar el Kardex general.</p>`;
    }
}
