/**
 * MANU JOYEROS - Módulo de Consulta Rápida con Spinner de Carga (consulta.js)
 * Versión Completa e Íntegra - 2026
 */

async function renderizarModuloConsulta(container) {
    if (!container) {
        container = document.getElementById("contentBody") || document.querySelector("main");
    }

    container.innerHTML = `
        <div class="card" style="max-width: 650px; margin: 30px auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h3 style="margin: 0; color: #0f172a; font-size: 1.4rem;">🔍 Consulta Rápida de Joyas</h3>
                <p style="font-size: 0.85rem; color: #64748b; margin-top: 5px;">Escanee el código de barras (carga automática) o digite el SKU / Código y presione Consultar.</p>
            </div>

            <div style="display: flex; gap: 10px; margin-bottom: 25px;">
                <input type="text" id="inputConsultaCodigo" placeholder="Escanee código de barras o digite SKU..." style="flex: 1; padding: 12px 15px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 1rem; outline: none;" oninput="verificarEscaneoAutomatico(event)" onkeydown="if(event.key === 'Enter') ejecutarConsultaRapidaProducto()">
                <button type="button" onclick="ejecutarConsultaRapidaProducto()" style="background: #0f172a; color: white; border: none; padding: 0 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.95rem;">Consultar</button>
                <button type="button" onclick="limpiarConsultaRapida()" style="background: #ef4444; color: white; border: none; padding: 0 16px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.95rem;" title="Limpiar consulta">🧹 Limpiar</button>
            </div>

            <!-- CONTENEDOR DE RESULTADO -->
            <div id="resultadoConsultaContainer" style="display: none; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; background: #f8fafc; text-align: center;">
                <div style="margin-bottom: 15px; position: relative; display: inline-block;">
                    <img id="imgConsultaFoto" src="" style="width: 180px; height: 180px; object-fit: cover; border-radius: 8px; border: 2px solid #cbd5e1; display: block; cursor: pointer;" onclick="abrirZoomImagenSrc(this.src)" alt="Foto del Producto">
                    <div id="badgeEstadoConsulta" style="position: absolute; top: 8px; right: 8px; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; display: none;"></div>
                </div>
                <div style="margin-bottom: 15px;">
                    <span id="lblConsultaSku" style="background: #e2e8f0; color: #334155; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 0.8rem;"></span>
                </div>
                <h4 id="lblConsultaNombre" style="color: #0f172a; font-size: 1.1rem; margin: 0 0 10px 0; padding: 0 10px;"></h4>
                <div style="font-size: 1.3rem; font-weight: bold; color: #059669; margin-bottom: 15px;" id="contenedorPrecioConsulta">
                    Valor Venta: <span id="lblConsultaPrecio">$0</span>
                </div>
                <div style="display: flex; justify-content: center; gap: 20px; font-size: 0.85rem; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                    <span>Categoría: <strong id="lblConsultaCategoria" style="color: #334155;">-</strong></span>
                    <span>Ubicación: <strong id="lblConsultaUbicacion" style="color: #334155;">-</strong></span>
                </div>
            </div>

            <div id="mensajeConsultaVacio" style="text-align: center; padding: 20px; color: #64748b; font-size: 0.9rem;">
                Esperando lectura de código...
            </div>
        </div>
    `;

    setTimeout(() => {
        const inp = document.getElementById("inputConsultaCodigo");
        if (inp) inp.focus();
    }, 200);

    // Mostrar spinner flotante si la caché no está cargada
    if (!window.listaProductosCache || window.listaProductosCache.length === 0) {
        if (typeof mostrarSpinner === "function") {
            mostrarSpinner("Sincronizando inventario y valor del oro...");
        }
        try {
            const [resOro, resProd] = await Promise.all([
                API.llamar("obtenerValorOroDia", {}, "GET"),
                API.llamar("obtenerProductos", {}, "GET")
            ]);
            if (resOro && resOro.status === "success") window.valorOroDelDiaCache = Number(resOro.valor_oro_dia);
            if (resProd && resProd.status === "success") window.listaProductosCache = resProd.data;
        } catch (e) {
            console.error(e);
        } finally {
            if (typeof ocultarSpinner === "function") {
                ocultarSpinner();
            }
        }
    }
}

function verificarEscaneoAutomatico(event) {
    const input = document.getElementById("inputConsultaCodigo");
    if (!input) return;

    const valor = input.value.trim();
    if (valor.length >= 8 && /^\d+$/.test(valor)) {
        setTimeout(() => {
            if (document.getElementById("inputConsultaCodigo") && document.getElementById("inputConsultaCodigo").value.trim() === valor) {
                ejecutarConsultaRapidaProducto();
            }
        }, 80);
    }
}

function limpiarConsultaRapida() {
    const input = document.getElementById("inputConsultaCodigo");
    const containerRes = document.getElementById("resultadoConsultaContainer");
    const mensajeVacio = document.getElementById("mensajeConsultaVacio");

    if (input) {
        input.value = "";
        input.focus();
    }
    if (containerRes) {
        containerRes.style.display = "none";
    }
    if (mensajeVacio) {
        mensajeVacio.style.display = "block";
        mensajeVacio.innerHTML = "Esperando lectura de código...";
    }
}

async function ejecutarConsultaRapidaProducto() {
    const input = document.getElementById("inputConsultaCodigo");
    if (!input) return;

    const query = input.value.trim().toLowerCase();
    if (!query) {
        alert("⚠️ Por favor ingrese o escanee un código de barras o SKU.");
        return;
    }

    const lista = window.listaProductosCache || [];
    const productoEncontrado = lista.find(p => {
        let sku = String(p.SKU || p.sku || "").trim().toLowerCase();
        let barras = String(p.Codigo_Barra || p.codigo_barra || "").trim().toLowerCase();
        return sku === query || barras === query || barras.includes(query) || query.includes(barras);
    });

    const containerRes = document.getElementById("resultadoConsultaContainer");
    const mensajeVacio = document.getElementById("mensajeConsultaVacio");

    if (!productoEncontrado) {
        if (containerRes) containerRes.style.display = "none";
        if (mensajeVacio) {
            mensajeVacio.style.display = "block";
            mensajeVacio.innerHTML = `<span style="color: #ef4444; font-weight: bold;">❌ No se encontró ningún producto con el código: "${input.value}"</span>`;
        }
        input.value = "";
        input.focus();
        return;
    }

    let sku = productoEncontrado.SKU || productoEncontrado.sku || "-";
    let nombre = productoEncontrado.Nombre || productoEncontrado.nombre || "Joya sin nombre";
    let categoria = productoEncontrado.ID_Categoria || productoEncontrado.categoria || "-";
    
    let pesoCrudo = productoEncontrado.Peso !== undefined ? productoEncontrado.Peso : (productoEncontrado.peso !== undefined ? productoEncontrado.peso : 0);
    let pesoItem = parseFloat(String(pesoCrudo).replace(',', '.')) || 0;
    
    let valPiedra = Number(productoEncontrado.Valor_Piedra !== undefined ? productoEncontrado.Valor_Piedra : (productoEncontrado.valor_piedra !== undefined ? productoEncontrado.valor_piedra : 0)) || 0;
    let margen = Number(productoEncontrado.Porcentaje_Venta !== undefined ? productoEncontrado.Porcentaje_Venta : (productoEncontrado.porcentaje_venta !== undefined ? productoEncontrado.porcentaje_venta : 100)) || 100;
    let descPct = Number(productoEncontrado.Tiene_Descuento !== undefined ? productoEncontrado.Tiene_Descuento : (productoEncontrado.tiene_descuento !== undefined ? productoEncontrado.tiene_descuento : 0)) || 0;
    let ubicacion = productoEncontrado.ID_Ubicacion || productoEncontrado.id_ubicacion || productoEncontrado.ubicacion || "VITRINA";
    let foto = productoEncontrado.Foto || productoEncontrado.foto || "";
    
    let estadoItem = String(productoEncontrado.Estado || productoEncontrado.estado || "").trim().toUpperCase();
    let esVendido = estadoItem === "VENDIDO" || estadoItem === "SALIDA" || estadoItem === "INACTIVO";

    let valorOroActual = window.valorOroDelDiaCache || 250000;
    let valorVentaBase = (valorOroActual * pesoItem) + valPiedra;
    let precioBaseConMargen = valorVentaBase * (1 + (margen / 100));
    let valorVentaFinal = Math.round(precioBaseConMargen - (precioBaseConMargen * (descPct / 100)));

    document.getElementById("imgConsultaFoto").src = foto || "https://via.placeholder.com/180?text=Sin+Foto";
    document.getElementById("lblConsultaSku").textContent = `SKU: ${sku}`;
    document.getElementById("lblConsultaNombre").textContent = nombre;
    
    const badgeEstado = document.getElementById("badgeEstadoConsulta");
    if (esVendido) {
        badgeEstado.style.display = "block";
        badgeEstado.style.background = "#ef4444";
        badgeEstado.style.color = "white";
        badgeEstado.textContent = "🔴 VENDIDO";
        document.getElementById("lblConsultaPrecio").textContent = `Vendido ($${valorVentaFinal.toLocaleString()})`;
    } else if (descPct > 0) {
        badgeEstado.style.display = "block";
        badgeEstado.style.background = "#f59e0b";
        badgeEstado.style.color = "white";
        badgeEstado.textContent = `🔥 ${descPct}% DESC`;
        document.getElementById("lblConsultaPrecio").innerHTML = `<span style="text-decoration: line-through; color: #94a3b8; font-size: 1rem; margin-right: 8px;">$${Math.round(precioBaseConMargen).toLocaleString()}</span> $${valorVentaFinal.toLocaleString()}`;
    } else {
        badgeEstado.style.display = "none";
        document.getElementById("lblConsultaPrecio").textContent = `$${valorVentaFinal.toLocaleString()}`;
    }

    document.getElementById("lblConsultaCategoria").textContent = categoria;
    document.getElementById("lblConsultaUbicacion").textContent = ubicacion;

    if (mensajeVacio) mensajeVacio.style.display = "none";
    if (containerRes) containerRes.style.display = "block";

    input.value = "";
    input.focus();
}
