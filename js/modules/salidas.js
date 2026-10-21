/**
 * MANU JOYEROS - Módulo de Salidas y Facturación (salidas.js)
 * Versión 100% Completa e Íntegra con Facturación, Contado, Crédito, Abono y Escaneo - 2026
 */

async function renderizarModuloSalidas(container) {
    if (!container) {
        container = document.getElementById("contentBody") || document.querySelector("main");
    }

    container.innerHTML = `
        <div class="card" style="margin-bottom: 25px; background: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <h3 style="margin: 0; color: #0f172a; font-size: 1.2rem;">🛒 Módulo de Ventas y Salidas de Inventario</h3>
                <div style="text-align: right;">
                    <span style="font-size: 0.75rem; color: #64748b; display: block;">Nro. Factura Sugerido:</span>
                    <strong id="lblFacturaSugerida" style="color: #2563eb; font-size: 0.95rem;">FAC-00001</strong>
                </div>
            </div>
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 20px;">Registre la venta indicando número de factura, modalidad (contado, crédito o abono), cliente y escanee el producto.</p>
            
            <form id="formRegistrarSalida" onsubmit="enviarRegistroSalida(event)">
                <!-- FILA 1: SKU, Cantidad, Nro Factura, Modalidad de Pago -->
                <div style="display: grid; grid-template-columns: 2fr 1fr 1.5fr 1.5fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">SKU o Código de Barras *</label>
                        <input type="text" id="inputSalidaSku" required placeholder="Escanee o digite SKU..." oninput="manejarInputSalida(event)" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Cantidad *</label>
                        <input type="number" id="inputSalidaCantidad" min="1" value="1" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Nro. de Factura *</label>
                        <input type="text" id="inputSalidaFactura" required placeholder="Ej: FAC-00125" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; font-weight: bold; color: #0f172a;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Modalidad de Venta *</label>
                        <select id="inputSalidaModalidadPago" onchange="actualizarCamposModalidadPago()" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: white; font-weight: bold; color: #0f172a;">
                            <option value="CONTADO">💵 Venta de Contado</option>
                            <option value="CREDITO">📋 Venta a Crédito</option>
                            <option value="ABONO">💳 Sistema de Abono</option>
                        </select>
                    </div>
                </div>

                <!-- FILA 2: Cliente, Abono Inicial (dinámico), Motivo, Observaciones -->
                <div style="display: grid; grid-template-columns: 1.5fr 1.5fr 1fr 2fr; gap: 15px; margin-bottom: 15px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Cliente / Comprador *</label>
                        <input type="text" id="inputSalidaCliente" value="CONSUMIDOR FINAL" placeholder="Nombre del cliente" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: white;">
                    </div>
                    <div id="contenedorMontoAbono" style="display: none;">
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #d97706; margin-bottom: 4px;">Valor Abono Inicial ($)</label>
                        <input type="text" id="inputSalidaAbono" value="0" oninput="formatearEntradaMonedaSalida(this)" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: white; font-weight: bold;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Motivo / Tipo *</label>
                        <input type="text" id="inputSalidaMotivo" required placeholder="Ej: Venta directa" value="Venta Directa" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: white;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Observaciones</label>
                        <input type="text" id="inputSalidaObservaciones" placeholder="Detalles de entrega, saldo o notas..." style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: white;">
                    </div>
                </div>

                <div style="text-align: right;">
                    <button type="submit" style="background: #dc2626; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.3);">💾 Registrar Venta / Salida</button>
                </div>
            </form>
        </div>

        <div class="card" style="background: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #0f172a; font-size: 1.1rem;">Historial de Ventas y Salidas</h3>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="text" id="buscadorSalidas" onkeyup="filtrarTablaSalidas()" placeholder="Buscar por factura, SKU o cliente..." style="padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; width: 220px; font-size: 0.85rem;">
                    <button type="button" onclick="cargarHistorialSalidas()" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">🔄 Actualizar Lista</button>
                </div>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
                            <th style="padding: 10px;">Nro. Factura</th>
                            <th style="padding: 10px;">Fecha</th>
                            <th style="padding: 10px;">SKU / Producto</th>
                            <th style="padding: 10px;">Cant.</th>
                            <th style="padding: 10px;">Modalidad</th>
                            <th style="padding: 10px;">Cliente</th>
                            <th style="padding: 10px;">Motivo</th>
                            <th style="padding: 10px;">Vendedor</th>
                            <th style="padding: 10px;">Observaciones</th>
                        </tr>
                    </thead>
                    <tbody id="tablaSalidasBody">
                        <tr><td colspan="9" style="text-align: center; padding: 20px; color: #64748b;">Cargando historial de ventas...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    setTimeout(() => {
        const inp = document.getElementById("inputSalidaSku");
        if (inp) inp.focus();
    }, 200);

    generarSugerenciaFacturaSalida();
    await cargarHistorialSalidas();
}

function generarSugerenciaFacturaSalida() {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const campo = document.getElementById("inputSalidaFactura");
    if (campo && !campo.value) {
        campo.value = `FAC-${randomNum}`;
    }
}

function actualizarCamposModalidadPago() {
    const modalidad = document.getElementById("inputSalidaModalidadPago").value;
    const contenedorAbono = document.getElementById("contenedorMontoAbono");
    if (contenedorAbono) {
        if (modalidad === "ABONO" || modalidad === "CREDITO") {
            contenedorAbono.style.display = "block";
            if (modalidad === "CREDITO") {
                document.getElementById("inputSalidaAbono").value = "0";
            }
        } else {
            contenedorAbono.style.display = "none";
        }
    }
}

function formatearEntradaMonedaSalida(input) {
    let valorLimpio = input.value.replace(/\D/g, "");
    if (valorLimpio === "") {
        input.value = "0";
        return;
    }
    let numero = parseInt(valorLimpio, 10);
    input.value = numero.toLocaleString("es-CO");
}

function obtenerValorNumericoMonedaSalida(valorStr) {
    if (!valorStr) return 0;
    let limpio = String(valorStr).replace(/\./g, "").replace(/\D/g, "");
    return parseFloat(limpio) || 0;
}

function manejarInputSalida(event) {
    const input = document.getElementById("inputSalidaSku");
    if (!input) return;

    const valor = input.value.trim();
    if (valor.length >= 12) {
        setTimeout(() => {
            if (document.getElementById("inputSalidaSku") && document.getElementById("inputSalidaSku").value.trim() === valor) {
                const motivoInput = document.getElementById("inputSalidaMotivo");
                if (motivoInput && !motivoInput.value.trim()) {
                    motivoInput.value = "Venta Directa (Escaneo)";
                }
            }
        }, 50);
    }
}

async function cargarHistorialSalidas() {
    const tbody = document.getElementById("tablaSalidasBody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px; color: #64748b;">Sincronizando ventas...</td></tr>`;

    try {
        const res = await API.llamar("obtenerSalidas", {}, "GET");
        if (res && res.status === "success" && res.data && res.data.length > 0) {
            window.listaSalidasCache = res.data;
            renderizarTablaSalidas(res.data);
        } else {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px; color: #64748b;">No se encontraron registros de ventas o salidas.</td></tr>`;
        }
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px; color: #ef4444;">Error al cargar el historial de ventas.</td></tr>`;
    }
}

function renderizarTablaSalidas(lista) {
    const tbody = document.getElementById("tablaSalidasBody");
    if (!tbody) return;

    let html = "";
    lista.slice().reverse().forEach(row => {
        let facturaId = row.Factura || row.factura || row.Nro_Factura || row.ID_Salida || '-';
        let fecha = row.Fecha || row.fecha || '-';
        let sku = row.SKU || row.sku || '-';
        let cantidad = row.CANTIDAD || row.Cantidad || row.cantidad || '1';
        let modalidad = row.Modalidad_Pago || row.modalidad_pago || 'CONTADO';
        let cliente = row.Cliente || row.cliente || 'CONSUMIDOR FINAL';
        let motivo = row.Motivo || row.motivo || '-';
        let usuario = row.Usuario || row.usuario || '-';
        let observaciones = row.Observaciones || row.observaciones || '-';

        let badgeMod = modalidad === "CONTADO" ? `<span style="color: #059669; font-weight: bold;">Contado</span>` :
                       modalidad === "CREDITO" ? `<span style="color: #dc2626; font-weight: bold;">Crédito</span>` :
                       `<span style="color: #d97706; font-weight: bold;">Abono</span>`;

        html += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; font-weight: bold; color: #0f172a;">${facturaId}</td>
                <td style="padding: 10px; color: #475569;">${fecha}</td>
                <td style="padding: 10px; font-weight: bold; color: #2563eb;">${sku}</td>
                <td style="padding: 10px; font-weight: bold; color: #dc2626;">${cantidad}</td>
                <td style="padding: 10px;">${badgeMod}</td>
                <td style="padding: 10px; color: #334155; font-weight: 500;">${cliente}</td>
                <td style="padding: 10px; color: #334155;">${motivo}</td>
                <td style="padding: 10px; color: #475569;">${usuario}</td>
                <td style="padding: 10px; color: #64748b;">${observaciones}</td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function filtrarTablaSalidas() {
    const texto = document.getElementById("buscadorSalidas").value.trim().toLowerCase();
    if (!window.listaSalidasCache) return;

    const filtrados = window.listaSalidasCache.filter(s => {
        let fac = String(s.Factura || s.factura || s.Nro_Factura || s.ID_Salida || "").toLowerCase();
        let sku = String(s.SKU || s.sku || "").toLowerCase();
        let cli = String(s.Cliente || s.cliente || "").toLowerCase();
        return fac.includes(texto) || sku.includes(texto) || cli.includes(texto);
    });

    renderizarTablaSalidas(filtrados);
}

async function enviarRegistroSalida(event) {
    if (event) event.preventDefault();
    if (typeof mostrarSpinner === "function") mostrarSpinner("Registrando venta y actualizando inventario...");

    const sku = document.getElementById("inputSalidaSku").value.trim();
    const cantidad = document.getElementById("inputSalidaCantidad").value;
    const factura = document.getElementById("inputSalidaFactura").value.trim();
    const modalidadPago = document.getElementById("inputSalidaModalidadPago").value;
    const cliente = document.getElementById("inputSalidaCliente").value.trim() || "CONSUMIDOR FINAL";
    const abono = obtenerValorNumericoMonedaSalida(document.getElementById("inputSalidaAbono").value);
    const motivo = document.getElementById("inputSalidaMotivo").value.trim();
    const observaciones = document.getElementById("inputSalidaObservaciones").value.trim();
    const usuario = (typeof usuarioActual !== 'undefined' && usuarioActual && (usuarioActual.nombre || usuarioActual.Nombre)) ? (usuarioActual.nombre || usuarioActual.Nombre) : "ADMIN";

    try {
        const res = await API.llamar("registrarSalida", {
            action: "registrarSalida",
            sku: sku,
            cantidad: cantidad,
            factura: factura,
            modalidad_pago: modalidadPago,
            cliente: cliente,
            abono: abono,
            motivo: motivo,
            observaciones: observaciones,
            usuario: usuario
        }, "POST");

        if (typeof ocultarSpinner === "function") ocultarSpinner();

        if (res && res.status === "success") {
            alert(res.message || "✅ ¡Venta / Salida registrada con éxito!");
            document.getElementById("formRegistrarSalida").reset();
            document.getElementById("inputSalidaCantidad").value = "1";
            document.getElementById("inputSalidaCliente").value = "CONSUMIDOR FINAL";
            document.getElementById("inputSalidaAbono").value = "0";
            document.getElementById("inputSalidaMotivo").value = "Venta Directa";
            generarSugerenciaFacturaSalida();
            cargarHistorialSalidas();
            
            const inputSku = document.getElementById("inputSalidaSku");
            if (inputSku) inputSku.focus();
        } else {
            alert("Error: " + (res ? res.message : "No se pudo registrar la venta."));
        }
    } catch (e) {
        if (typeof ocultarSpinner === "function") ocultarSpinner();
        console.error(e);
        alert("⚠️ Error de conexión al registrar la venta.");
    }
}
