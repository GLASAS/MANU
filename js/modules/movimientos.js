/**
 * MANU JOYEROS - Módulo Unificado de Entradas, Salidas y Kardex (movimientos.js)
 */

async function renderizarModuloEntradasSalidas(container, tipoMovimiento) {
    const esEntrada = tipoMovimiento === 'ENTRADAS';
    const tituloSeccion = esEntrada ? '📥 Registro de Entradas de Inventario' : '📤 Registro de Salidas de Inventario';
    const colorAccion = esEntrada ? '#059669' : '#dc2626';

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 20px; max-width: 1200px; margin: 0 auto;">
            
            <!-- FORMULARIO DIRECTO INTEGRADO -->
            <div class="card" style="background: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <h3 style="margin-bottom: 15px; color: #0f172a; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
                    <span>${esEntrada ? '📥' : '📤'}</span> ${tituloSeccion}
                </h3>
                <form id="formMovimientoInventario" onsubmit="procesarMovimientoInventario(event, '${tipoMovimiento}')">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 15px;">
                        
                        <div>
                            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 5px;">SKU o Código de Producto *</label>
                            <input type="text" id="movSku" required placeholder="Ej. AN001" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none;">
                        </div>

                        <div>
                            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 5px;">Cantidad *</label>
                            <input type="number" id="movCantidad" min="1" value="1" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none;">
                        </div>

                        <div>
                            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 5px;">Motivo / Referencia *</label>
                            <input type="text" id="movMotivo" required placeholder="${esEntrada ? 'Compra a proveedor' : 'Venta mostrador'}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none;">
                        </div>

                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button type="submit" style="background-color: ${colorAccion}; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.95rem;">
                            Registrar ${esEntrada ? 'Entrada' : 'Salida'}
                        </button>
                    </div>
                </form>
            </div>

            <!-- SECCIÓN DE LISTADO COMPLETO -->
            <div class="card" style="background: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #0f172a; font-size: 1.1rem;">Historial de ${esEntrada ? 'Entradas' : 'Salidas'}</h3>
                    <button type="button" onclick="cargarHistorialMovimientos('${tipoMovimiento}')" style="background: #0f172a; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">🔄 Actualizar Lista</button>
                </div>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                        <thead>
                            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
                                <th style="padding: 10px;">Fecha</th>
                                <th style="padding: 10px;">SKU</th>
                                <th style="padding: 10px;">Cantidad</th>
                                <th style="padding: 10px;">Motivo</th>
                                <th style="padding: 10px;">Usuario</th>
                            </tr>
                        </thead>
                        <tbody id="tablaMovimientosBody">
                            <tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">Cargando registros...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    `;

    await cargarHistorialMovimientos(tipoMovimiento);
}

async function cargarHistorialMovimientos(tipo) {
    const tbody = document.getElementById("tablaMovimientosBody");
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">Consultando registros...</td></tr>`;

    try {
        const accionObtener = tipo === 'ENTRADAS' ? 'obtenerEntradas' : 'obtenerSalidas';
        const res = await API.llamar(accionObtener, { action: accionObtener }, "GET");
        
        if (res && res.status === "success" && res.data && res.data.length > 0) {
            let html = "";
            res.data.forEach(m => {
                let fecha = m.Fecha || m.fecha || '-';
                let sku = m.SKU || m.sku || '-';
                let cantidad = m.CANTIDAD || m.Cantidad || m.cantidad || 0;
                let motivo = m.Motivo || m.motivo || m.Observaciones || '-';
                let usuario = m.Usuario || m.usuario || '-';

                html += `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px;">${fecha}</td>
                        <td style="padding: 10px; font-weight: bold; color: #0f172a;">${sku}</td>
                        <td style="padding: 10px;">${cantidad}</td>
                        <td style="padding: 10px;">${motivo}</td>
                        <td style="padding: 10px; color: #64748b;">${usuario}</td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        } else {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">No hay registros de ${tipo.toLowerCase()} disponibles.</td></tr>`;
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #ef4444;">Error al conectar con el servidor.</td></tr>`;
    }
}

async function procesarMovimientoInventario(event, tipo) {
    event.preventDefault();
    const sku = document.getElementById("movSku").value.trim();
    const cantidad = Number(document.getElementById("movCantidad").value);
    const motivo = document.getElementById("movMotivo").value.trim();
    const usuario = (typeof usuarioActual !== 'undefined' && usuarioActual) ? (usuarioActual.usuario || usuarioActual.nombre) : 'Admin';

    const accionRegistro = tipo === 'ENTRADAS' ? 'guardarEntrada' : 'guardarSalida';

    const payload = tipo === 'ENTRADAS' ? {
        action: accionRegistro,
        sku: sku,
        cantidad: cantidad,
        factura: cantidad,
        observaciones: motivo,
        usuario: usuario
    } : {
        action: accionRegistro,
        sku: sku,
        cantidad: cantidad,
        motivo: motivo,
        observaciones: motivo,
        usuario: usuario
    };

    const res = await API.llamar(accionRegistro, payload, "POST");

    if (res && res.status === "success") {
        alert(res.message || "Registro guardado correctamente.");
        document.getElementById("formMovimientoInventario").reset();
        cargarHistorialMovimientos(tipo);
    } else {
        alert("Error: " + (res ? res.message : "No se pudo procesar el registro."));
    }
}

async function renderizarModuloKardex(container) {
    container.innerHTML = `
        <div class="card" style="background: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #0f172a; font-size: 1.15rem;">📑 Kardex General de Movimientos</h3>
                <button type="button" onclick="cargarKardexCompleto()" style="background: #0f172a; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">🔄 Actualizar Kardex</button>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
                            <th style="padding: 10px;">Fecha</th>
                            <th style="padding: 10px;">Tipo</th>
                            <th style="padding: 10px;">SKU</th>
                            <th style="padding: 10px;">Cantidad</th>
                            <th style="padding: 10px;">Motivo</th>
                            <th style="padding: 10px;">Usuario</th>
                        </tr>
                    </thead>
                    <tbody id="tablaKardexBody">
                        <tr><td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">Cargando Kardex...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    await cargarKardexCompleto();
}

async function cargarKardexCompleto() {
    const tbody = document.getElementById("tablaKardexBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">Consultando transacciones...</td></tr>`;

    try {
        const res = await API.llamar("obtenerKardex", { action: "obtenerKardex" }, "GET");
        if (res && res.status === "success" && res.data && res.data.length > 0) {
            let html = "";
            res.data.forEach(k => {
                let tipoRaw = String(k.Tipo || k.tipo || "ENTRADA").trim().toUpperCase();
                let esEntrada = tipoRaw.includes('ENTRADA');
                let tipoBadge = esEntrada 
                    ? `<span style="background: #d1fae5; color: #065f46; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">ENTRADA</span>` 
                    : `<span style="background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">SALIDA</span>`;
                
                html += `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px;">${k.Fecha || k.fecha || '-'}</td>
                        <td style="padding: 10px;">${tipoBadge}</td>
                        <td style="padding: 10px; font-weight: bold; color: #0f172a;">${k.SKU || k.sku || '-'}</td>
                        <td style="padding: 10px;">${k.CANTIDAD || k.Cantidad || k.cantidad || 0}</td>
                        <td style="padding: 10px;">${k.Motivo || k.motivo || k.Observaciones || '-'}</td>
                        <td style="padding: 10px; color: #64748b;">${k.Usuario || k.usuario || '-'}</td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">No hay registros en el Kardex.</td></tr>`;
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #ef4444;">Error al conectar con el servidor.</td></tr>`;
    }
}
