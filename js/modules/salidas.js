/**
 * MANU JOYEROS - Módulo Independiente de Salidas (salidas.js)
 * Versión Completa e Íntegra con Soporte para Código de Barras y Pistola - 2026
 */

async function renderizarModuloSalidas(container) {
    if (!container) {
        container = document.getElementById("contentBody") || document.querySelector("main");
    }

    container.innerHTML = `
        <div class="card" style="margin-bottom: 25px; background: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 1.2rem; margin-bottom: 5px;">📤 Salidas de Inventario</h3>
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 20px;">Escanee el código de barras o digite el SKU para registrar la salida.</p>
            
            <form id="formRegistrarSalida" onsubmit="enviarRegistroSalida(event)">
                <div style="display: grid; grid-template-columns: 2fr 1fr 2fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Código de Barras / SKU *</label>
                        <input type="text" id="inputSalidaSku" required placeholder="Escanee o digite código..." oninput="manejarInputSalida(event)" onpaste="setTimeout(enviarRegistroSalidaDirecto, 50)" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Cantidad *</label>
                        <input type="number" id="inputSalidaCantidad" min="1" value="1" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Motivo / Referencia *</label>
                        <input type="text" id="inputSalidaMotivo" required placeholder="Ej: Venta directa / Garantía" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                    </div>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Observaciones</label>
                    <input type="text" id="inputSalidaObservaciones" placeholder="Detalles adicionales..." style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                </div>
                <div style="text-align: right;">
                    <button type="submit" style="background: #dc2626; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer;">Registrar Salida</button>
                </div>
            </form>
        </div>

        <div class="card" style="background: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #0f172a; font-size: 1.1rem;">Historial de Salidas</h3>
                <button type="button" onclick="cargarHistorialSalidas()" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">🔄 Actualizar Lista</button>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
                            <th style="padding: 10px;">ID Salida</th>
                            <th style="padding: 10px;">Fecha</th>
                            <th style="padding: 10px;">SKU / Barras</th>
                            <th style="padding: 10px;">Cantidad</th>
                            <th style="padding: 10px;">Motivo</th>
                            <th style="padding: 10px;">Usuario</th>
                            <th style="padding: 10px;">Observaciones</th>
                        </tr>
                    </thead>
                    <tbody id="tablaSalidasBody">
                        <tr><td colspan="7" style="text-align: center; padding: 20px; color: #64748b;">Cargando historial de salidas...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    setTimeout(() => {
        const inp = document.getElementById("inputSalidaSku");
        if (inp) inp.focus();
    }, 200);

    await cargarHistorialSalidas();
}

function manejarInputSalida(event) {
    const input = document.getElementById("inputSalidaSku");
    if (!input) return;

    const valor = input.value.trim();
    // Si la pistola escanea un código de barras estándar (ej: 13 dígitos) se dispara automáticamente
    if (valor.length >= 12) {
        setTimeout(() => {
            if (document.getElementById("inputSalidaSku") && document.getElementById("inputSalidaSku").value.trim() === valor) {
                // Autocompletar motivo por defecto si está vacío para agilizar la venta con pistola
                const motivoInput = document.getElementById("inputSalidaMotivo");
                if (motivoInput && !motivoInput.value.trim()) {
                    motivoInput.value = "Venta Directa (Escaneo)";
                }
            }
        }, 50);
    }
}

async function enviarRegistroSalidaDirecto() {
    // Función auxiliar para autodisparar al pegar con pistola de códigos
    setTimeout(() => {
        const skuVal = document.getElementById("inputSalidaSku")?.value.trim();
        if (skuVal && skuVal.length >= 5) {
            const motivoInput = document.getElementById("inputSalidaMotivo");
            if (motivoInput && !motivoInput.value.trim()) {
                motivoInput.value = "Venta Directa (Escaneo)";
            }
        }
    }, 50);
}

async function cargarHistorialSalidas() {
    const tbody = document.getElementById("tablaSalidasBody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #64748b;">Sincronizando salidas...</td></tr>`;

    try {
        const res = await API.llamar("obtenerSalidas", {}, "GET");
        if (res && res.status === "success" && res.data && res.data.length > 0) {
            let html = "";
            res.data.reverse().forEach(row => {
                html += `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px; font-weight: bold; color: #0f172a;">${row.ID_Salida || '-'}</td>
                        <td style="padding: 10px; color: #475569;">${row.Fecha || '-'}</td>
                        <td style="padding: 10px; font-weight: bold; color: #2563eb;">${row.SKU || '-'}</td>
                        <td style="padding: 10px; font-weight: bold; color: #dc2626;">${row.CANTIDAD || '1'}</td>
                        <td style="padding: 10px; color: #334155;">${row.Motivo || '-'}</td>
                        <td style="padding: 10px; color: #475569;">${row.Usuario || '-'}</td>
                        <td style="padding: 10px; color: #64748b;">${row.Observaciones || '-'}</td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        } else {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #64748b;">No se encontraron registros de salidas.</td></tr>`;
        }
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ef4444;">Error al cargar las salidas.</td></tr>`;
    }
}

async function enviarRegistroSalida(event) {
    if (event) event.preventDefault();
    if (typeof mostrarSpinner === "function") mostrarSpinner("Registrando salida y actualizando estado...");

    const sku = document.getElementById("inputSalidaSku").value.trim();
    const cantidad = document.getElementById("inputSalidaCantidad").value;
    const motivo = document.getElementById("inputSalidaMotivo").value.trim();
    const observaciones = document.getElementById("inputSalidaObservaciones").value.trim();
    const usuario = (typeof usuarioActual !== 'undefined' && usuarioActual && usuarioActual.nombre) ? usuarioActual.nombre : "ADMIN";

    try {
        const res = await API.llamar("registrarSalida", {
            action: "registrarSalida",
            sku: sku,
            cantidad: cantidad,
            motivo: motivo,
            observaciones: observaciones,
            usuario: usuario
        }, "POST");

        if (typeof ocultarSpinner === "function") ocultarSpinner();

        if (res && res.status === "success") {
            alert(res.message);
            document.getElementById("formRegistrarSalida").reset();
            document.getElementById("inputSalidaCantidad").value = "1";
            cargarHistorialSalidas();
            
            // Volver a enfocar el input de escaneo para el siguiente producto
            const inputSku = document.getElementById("inputSalidaSku");
            if (inputSku) inputSku.focus();
        } else {
            alert("Error: " + (res ? res.message : "No se pudo registrar la salida."));
        }
    } catch (e) {
        if (typeof ocultarSpinner === "function") ocultarSpinner();
        console.error(e);
        alert("⚠️ Error de conexión al registrar la salida.");
    }
}
