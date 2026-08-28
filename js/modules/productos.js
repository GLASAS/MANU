/**
 * MANU JOYEROS - Módulo de Gestión de Productos y Catálogo (productos.js)
 * Versión Completa con Botón de Cerrar Debajo de la Imagen
 */

async function renderizarModuloProductos(container) {
    const esAdmin = usuarioActual && (
        String(usuarioActual.rol || "").toUpperCase() === 'ADMIN' || 
        String(usuarioActual.rol || "").toUpperCase() === 'ADMINISTRADOR'
    );

    container.innerHTML = `
        <div class="card" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; background: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="display: flex; gap: 10px; flex-wrap: wrap;" id="contenedorBotonesAccionProductos">
                ${esAdmin ? `
                    <button type="button" class="btn-action" onclick="abrirModalNuevoProducto()" style="background: #0f172a; color: white; padding: 8px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;">✨ Nuevo Producto</button>
                    <button type="button" class="btn-action" onclick="abrirModalImportarExcel()" style="background: #059669; color: white; padding: 8px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;">📁 Importar</button>
                ` : ''}
                <button type="button" class="btn-action" onclick="exportarProductosCSV()" style="background: #2563eb; color: white; padding: 8px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;">📤 Exportar</button>
                ${esAdmin ? `
                    <button type="button" class="btn-action text-danger" onclick="eliminarProductosSeleccionados()" style="background: #ef4444; color: white; padding: 8px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;">🗑️ Eliminar</button>
                ` : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <button type="button" onclick="cargarListaProductos()" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 8px; cursor: pointer;" title="Actualizar Lista">🔄</button>
                <input type="text" id="buscadorProductos" onkeyup="filtrarProductosTabla()" placeholder="SKU, Barras, Nombre..." style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; width: 250px;">
            </div>
        </div>

        <div class="card" style="background: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #0f172a; font-size: 1.1rem;">Catálogo de Productos y Joyas</h3>
                <div id="paginacionInfoProductos" style="font-size: 0.85rem; color: #64748b;">Mostrando registros...</div>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
                            ${esAdmin ? `<th style="padding: 10px; width: 30px;"><input type="checkbox" id="selectAllProductos" onclick="toggleSelectAllProductos(this)"></th>` : ''}
                            <th style="padding: 10px;">Nombre / Descripción</th>
                            <th style="padding: 10px;">Categoría</th>
                            <th style="padding: 10px;">Color</th>
                            <th style="padding: 10px;">Material</th>
                            <th style="padding: 10px;">Peso</th>
                            ${esAdmin ? `
                                <th style="padding: 10px;">Costo Oro</th>
                                <th style="padding: 10px;">Valor Venta (Base)</th>
                                <th style="padding: 10px;">Margen</th>
                                <th style="padding: 10px;">Desc.</th>
                            ` : ''}
                            <th style="padding: 10px;">Venta Final</th>
                            <th style="padding: 10px;">Ubicación</th>
                            <th style="padding: 10px;">Foto</th>
                            <th style="padding: 10px; text-align: center;">Etiqueta</th>
                            ${esAdmin ? `<th style="padding: 10px; text-align: center;">Acciones</th>` : ''}
                        </tr>
                    </thead>
                    <tbody id="tablaProductosBody">
                        <tr><td colspan="${esAdmin ? '15' : '10'}" style="text-align: center; padding: 30px; color: #64748b;">Cargando inventario...</td></tr>
                    </tbody>
                </table>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;" id="paginacionControlesContainer">
                <span id="lblPaginacionTexto" style="font-size: 0.85rem; color: #64748b;">Mostrando 0 a 0 de 0</span>
                <div style="display: flex; gap: 8px;">
                    <button type="button" id="btnPaginaAnterior" onclick="cambiarPaginaProductos(-1)" style="padding: 6px 12px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer;">◀ Anterior</button>
                    <span id="lblPaginaActualNum" style="padding: 6px 12px; font-weight: bold; color: #0f172a;">Página 1 de 1</span>
                    <button type="button" id="btnPaginaSiguiente" onclick="cambiarPaginaProductos(1)" style="padding: 6px 12px; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer;">Siguiente ▶</button>
                </div>
            </div>
        </div>

        <!-- MODAL CRUD PRODUCTO -->
        <div class="image-modal" id="modalFormularioProducto" style="display: none; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); z-index:9998; position:fixed; top:0; left:0; width:100%; height:100%;">
            <div style="background: white; width: 95%; max-width: 650px; border-radius: 12px; padding: 25px; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 id="modalProductoTitulo" style="margin: 0; color: #0f172a;">Gestión de Producto</h3>
                    <button type="button" onclick="cerrarModalFormularioProducto()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b;">✕</button>
                </div>
                <form id="formCrudProducto" onsubmit="guardarProductoInventario(event)">
                    <input type="hidden" id="prodSkuOriginal">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 12px;">
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">SKU Automático *</label>
                            <input type="text" id="prodSku" required readonly tabindex="-1" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f1f5f9; font-weight: bold; color: #0f172a; cursor: not-allowed;" title="Generado automáticamente">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Código de Barras Único</label>
                            <input type="text" id="prodCodigoBarra" readonly tabindex="-1" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f1f5f9; color: #475569; cursor: not-allowed;" title="Generado automáticamente">
                        </div>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Nombre / Descripción de la Joya *</label>
                        <input type="text" id="prodNombre" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Categoría *</label>
                            <select id="prodCategoria" onchange="generarSkuYBarraAutomatico()" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: white;">
                                <option value="ANILLOS">ANILLOS</option>
                                <option value="CADENAS">CADENAS</option>
                                <option value="CANDONGAS">CANDONGAS</option>
                                <option value="ARETES">ARETES</option>
                                <option value="DIJES">DIJES</option>
                                <option value="PULSERAS">PULSERAS</option>
                                <option value="TOPOS">TOPOS</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Material</label>
                            <input type="text" id="prodMaterial" placeholder="ORO" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Color</label>
                            <input type="text" id="prodColor" placeholder="AMARILLO" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Peso (g)</label>
                            <input type="number" step="0.01" id="prodPeso" value="0" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Valor Piedra ($)</label>
                            <input type="number" id="prodValorPiedra" value="0" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Costo Oro ($)</label>
                            <input type="number" id="prodCosto" value="0" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Margen (%)</label>
                            <input type="number" id="prodMargen" value="100" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Descuento (%)</label>
                            <input type="number" id="prodDescuento" value="0" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Ubicación / Vitrina</label>
                            <input type="text" id="prodUbicacion" placeholder="CAJA FUERTE" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Foto del Producto (Galería o Cámara)</label>
                            <div style="display: flex; gap: 6px; align-items: center;">
                                <input type="text" id="prodFoto" placeholder="https://... o Base64" style="flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.8rem;">
                                <input type="file" id="inputArchivoFoto" accept="image/*" style="display: none;" onchange="procesarImagenSeleccionada(this)">
                                <button type="button" onclick="document.getElementById('inputArchivoFoto').removeAttribute('capture'); document.getElementById('inputArchivoFoto').click();" style="background: #0284c7; color: white; border: none; padding: 8px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold;" title="Seleccionar de Galería">📁 Galería</button>
                                <button type="button" onclick="const inp = document.getElementById('inputArchivoFoto'); inp.setAttribute('capture', 'environment'); inp.click();" style="background: #0d9488; color: white; border: none; padding: 8px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold;" title="Tomar Foto con Cámara">📸 Cámara</button>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button type="button" onclick="cerrarModalFormularioProducto()" style="padding: 8px 16px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer;">Cancelar</button>
                        <button type="submit" id="btnGuardarProdSubmit" style="padding: 8px 20px; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">💾 Guardar Producto</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- MODAL IMPORTAR CSV -->
        <div class="image-modal" id="modalImportarExcel" style="display: none; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); z-index:9998; position:fixed; top:0; left:0; width:100%; height:100%;">
            <div style="background: white; width: 95%; max-width: 480px; border-radius: 12px; padding: 25px;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #0f172a;">📁 Importar Productos Masivos (CSV)</h3>
                    <button type="button" onclick="cerrarModalImportarExcel()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b;">✕</button>
                </div>
                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 15px;">Seleccione un archivo CSV con las cabeceras correspondientes para cargar el inventario masivamente.</p>
                
                <div style="margin-bottom: 20px;">
                    <input type="file" id="inputArchivoCsvImport" accept=".csv" style="width: 100%; padding: 10px; border: 1px dashed #cbd5e1; border-radius: 8px; background: #f8fafc;">
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" onclick="cerrarModalImportarExcel()" style="padding: 8px 16px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer;">Cancelar</button>
                    <button type="button" id="btnProcesarCsv" onclick="procesarArchivoCsvImportado()" style="padding: 8px 20px; background: #059669; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">📥 Procesar e Importar</button>
                </div>
            </div>
        </div>

        <!-- SPINNER / MODAL GLOBAL DE CARGA EN PROCESO -->
        <div id="modalSpinnerGlobal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 99999; justify-content: center; align-items: center;">
            <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); max-width: 300px; width: 90%;">
                <div style="width: 50px; height: 50px; border: 5px solid #f1f5f9; border-top: 5px solid #0f172a; border-radius: 50%; animation: girarSpinner 0.8s linear infinite; margin: 0 auto 15px auto;"></div>
                <h4 id="lblSpinnerTexto" style="color: #0f172a; margin: 0; font-size: 1rem;">Procesando...</h4>
                <p style="font-size: 0.8rem; color: #64748b; margin-top: 5px;">Por favor espere un momento.</p>
            </div>
        </div>

        <style>
            @keyframes girarSpinner {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>

        <!-- MODAL ZOOM IMAGEN (BOTÓN CERRAR ABAJO) -->
        <div id="imageModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 9999; justify-content: center; align-items: center;" onclick="cerrarZoomImagen()">
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; max-width: 90%; max-height: 90%; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);" onclick="event.stopPropagation()">
                <img id="imgModalSrc" src="" style="max-width: 100%; max-height: 75vh; border-radius: 8px; object-fit: contain; margin-bottom: 15px;">
                <button type="button" onclick="cerrarZoomImagen()" style="background: #ef4444; color: white; border: none; padding: 10px 30px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.95rem; width: 100%; max-width: 250px; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">Cerrar</button>
            </div>
        </div>
    `;

    await cargarListaProductos();
}

function mostrarSpinner(texto = "Procesando...") {
    const lbl = document.getElementById("lblSpinnerTexto");
    if (lbl) lbl.textContent = texto;
    const modal = document.getElementById("modalSpinnerGlobal");
    if (modal) modal.style.display = "flex";
}

function ocultarSpinner() {
    const modal = document.getElementById("modalSpinnerGlobal");
    if (modal) modal.style.display = "none";
}

async function cargarListaProductos() {
    const esAdmin = usuarioActual && (
        String(usuarioActual.rol || "").toUpperCase() === 'ADMIN' || 
        String(usuarioActual.rol || "").toUpperCase() === 'ADMINISTRADOR'
    );
    const colspanVal = esAdmin ? '15' : '10';

    const tbody = document.getElementById("tablaProductosBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="${colspanVal}" style="text-align: center; padding: 30px; color: #64748b;">Sincronizando inventario y valor del oro...</td></tr>`;

    try {
        const [resOro, resProd] = await Promise.all([
            API.llamar("obtenerValorOroDia", {}, "GET"),
            API.llamar("obtenerProductos", {}, "GET")
        ]);

        if (resOro && resOro.status === "success" && resOro.valor_oro_dia) {
            window.valorOroDelDiaCache = Number(resOro.valor_oro_dia);
        }

        if (resProd && resProd.status === "success" && resProd.data) {
            window.listaProductosCache = resProd.data;
            window.listaProductosFiltradosCache = resProd.data;
            paginaActual = 1;
            renderizarTablaProductosAdmin();
        } else {
            tbody.innerHTML = `<tr><td colspan="${colspanVal}" style="text-align: center; padding: 30px; color: #ef4444;">No se pudieron cargar los productos.</td></tr>`;
        }
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="${colspanVal}" style="text-align: center; padding: 30px; color: #ef4444;">Error de conexión con el servidor.</td></tr>`;
    }
}

function renderizarTablaProductosAdmin() {
    const esAdmin = usuarioActual && (
        String(usuarioActual.rol || "").toUpperCase() === 'ADMIN' || 
        String(usuarioActual.rol || "").toUpperCase() === 'ADMINISTRADOR'
    );
    const colspanVal = esAdmin ? '15' : '10';

    const tbody = document.getElementById("tablaProductosBody");
    if (!tbody) return;

    const lista = window.listaProductosFiltradosCache || [];
    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${colspanVal}" style="text-align: center; padding: 30px; color: #64748b;">No hay productos registrados o coincidentes.</td></tr>`;
        document.getElementById("lblPaginacionTexto").textContent = "Mostrando 0 a 0 de 0";
        document.getElementById("lblPaginaActualNum").textContent = "Página 1 de 1";
        return;
    }

    const totalRegistros = lista.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina) || 1;
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    if (paginaActual < 1) paginaActual = 1;

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const paginaItems = lista.slice(inicio, fin);

    let valorOroActual = window.valorOroDelDiaCache || 250000;
    let html = "";

    paginaItems.forEach(p => {
        let sku = p.SKU || p.sku || "-";
        let codigoBarra = p.Codigo_Barra || p.codigo_barra || sku;
        let nombre = p.Nombre || p.nombre || "Joya sin nombre";
        let categoria = p.ID_Categoria || p.categoria || "-";
        let color = p.Color || p.color || "-";
        let material = p.Material || p.material || "ORO";
        
        let pesoCrudo = p.Peso !== undefined ? p.Peso : (p.peso !== undefined ? p.peso : 0);
        let pesoItem = parseFloat(String(pesoCrudo).replace(',', '.')) || 0;

        let costoItem = Number(p.Valor_Oro !== undefined ? p.Valor_Oro : (p.valor_oro !== undefined ? p.valor_oro : (p.Costo !== undefined ? p.Costo : (p.costo !== undefined ? p.costo : 0)))) || 0;
        let valPiedra = Number(p.Valor_Piedra !== undefined ? p.Valor_Piedra : (p.valor_piedra !== undefined ? p.valor_piedra : 0)) || 0;
        let margen = Number(p.Porcentaje_Venta !== undefined ? p.Porcentaje_Venta : (p.porcentaje_venta !== undefined ? p.porcentaje_venta : 100)) || 100;
        let descPct = Number(p.Tiene_Descuento !== undefined ? p.Tiene_Descuento : (p.tiene_descuento !== undefined ? p.tiene_descuento : 0)) || 0;
        let ubicacion = p.ID_Ubicacion || p.id_ubicacion || p.ubicacion || "VITRINA";
        let foto = p.Foto || p.foto || "";

        let valorVentaBase = (valorOroActual * pesoItem) + valPiedra;
        let precioBaseConMargen = valorVentaBase * (1 + (margen / 100));
        let valorVentaFinal = Math.round(precioBaseConMargen - (precioBaseConMargen * (descPct / 100)));

        let fotoHtml = foto ? `<img src="${foto}" style="width: 38px; height: 38px; object-fit: cover; border-radius: 6px; cursor: pointer;" onclick="abrirZoomImagenSrc('${foto}')">` : `💍`;
        let descBadge = descPct > 0 ? `<span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">${descPct}%</span>` : `0%`;

        html += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                ${esAdmin ? `<td style="padding: 10px;"><input type="checkbox" class="check-producto-item" value="${sku}"></td>` : ''}
                <td style="padding: 10px; max-width: 220px;">
                    <div style="font-weight: 500; color: #0f172a;">${nombre}</div>
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 600; margin-top: 2px;">SKU: ${sku}</div>
                </td>
                <td style="padding: 10px; color: #475569;">${categoria}</td>
                <td style="padding: 10px; color: #475569;">${color}</td>
                <td style="padding: 10px; color: #475569;">${material}</td>
                <td style="padding: 10px;">${pesoItem.toFixed(2)}g</td>
                ${esAdmin ? `
                    <td style="padding: 10px;">$${costoItem.toLocaleString()}</td>
                    <td style="padding: 10px; font-weight: bold; color: #2563eb;">$${Math.round(valorVentaBase).toLocaleString()}</td>
                    <td style="padding: 10px;">${margen}%</td>
                    <td style="padding: 10px;">${descBadge}</td>
                ` : ''}
                <td style="padding: 10px; font-weight: bold; color: #059669;">$${valorVentaFinal.toLocaleString()}</td>
                <td style="padding: 10px; color: #64748b;">${ubicacion}</td>
                <td style="padding: 10px;">${fotoHtml}</td>
                <td style="padding: 10px; text-align: center;">
                    <button type="button" onclick="abrirEtiquetaProducto('${sku}', '${nombre.replace(/'/g, "\\'")}', '${valorVentaFinal.toLocaleString()}', '${codigoBarra}')" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 6px; cursor: pointer;" title="Generar Etiqueta QR y Código de Barras">🏷️</button>
                </td>
                ${esAdmin ? `
                    <td style="padding: 10px; text-align: center;">
                        <button type="button" onclick="editarProducto('${sku}')" style="background: #0f172a; color: white; border: none; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem;" title="Editar">✏️</button>
                    </td>
                ` : ''}
            </tr>
        `;
    });

    tbody.innerHTML = html;

    document.getElementById("lblPaginacionTexto").textContent = `Mostrando ${inicio + 1} a ${Math.min(fin, totalRegistros)} de ${totalRegistros} productos`;
    document.getElementById("lblPaginaActualNum").textContent = `Página ${paginaActual} de ${totalPaginas}`;
    document.getElementById("btnPaginaAnterior").disabled = paginaActual === 1;
    document.getElementById("btnPaginaSiguiente").disabled = paginaActual === totalPaginas;
}

function cambiarPaginaProductos(direccion) {
    const totalPaginas = Math.ceil((window.listaProductosFiltradosCache || []).length / registrosPorPagina) || 1;
    paginaActual += direccion;
    if (paginaActual < 1) paginaActual = 1;
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    renderizarTablaProductosAdmin();
}

function filtrarProductosTabla() {
    const texto = document.getElementById("buscadorProductos").value.trim().toLowerCase();
    if (!window.listaProductosCache) return;

    window.listaProductosFiltradosCache = window.listaProductosCache.filter(p => {
        let sku = String(p.SKU || p.sku || "").toLowerCase();
        let nombre = String(p.Nombre || p.nombre || "").toLowerCase();
        let barras = String(p.Codigo_Barra || p.codigo_barra || "").toLowerCase();
        return sku.includes(texto) || nombre.includes(texto) || barras.includes(texto);
    });

    paginaActual = 1;
    renderizarTablaProductosAdmin();
}

function toggleSelectAllProductos(source) {
    checkboxes = document.querySelectorAll('.check-producto-item');
    checkboxes.forEach(cb => cb.checked = source.checked);
}

function abrirModalNuevoProducto() {
    document.getElementById("modalProductoTitulo").textContent = "Nuevo Producto";
    document.getElementById("formCrudProducto").reset();
    document.getElementById("prodSkuOriginal").value = "";
    
    document.getElementById("prodCategoria").value = "ANILLOS";
    document.getElementById("prodMaterial").value = "ORO";
    document.getElementById("prodColor").value = "AMARILLO";
    document.getElementById("prodMargen").value = "100";
    document.getElementById("prodUbicacion").value = "CAJA FUERTE";

    generarSkuYBarraAutomatico();

    document.getElementById("modalFormularioProducto").style.display = "flex";
}

function generarSkuYBarraAutomatico() {
    const categoriaSelect = document.getElementById("prodCategoria");
    if (!categoriaSelect) return;

    const catValor = categoriaSelect.value.trim().toUpperCase();
    
    let prefijo = "JO";
    if (catValor.includes("CANDON")) {
        prefijo = "CAN";
    } else if (catValor.length >= 2) {
        prefijo = catValor.substring(0, 2);
    }

    const lista = window.listaProductosCache || [];
    const filtradosPrefijo = lista.filter(p => {
        let s = String(p.SKU || p.sku || "").trim().toUpperCase();
        return s.startsWith(prefijo);
    });
    
    let siguienteNumero = filtradosPrefijo.length + 1;
    let consecutivoStr = String(siguienteNumero).padStart(5, '0');
    let skuGenerado = `${prefijo}${consecutivoStr}`;

    while (lista.some(p => String(p.SKU || p.sku || "").trim().toUpperCase() === skuGenerado.toUpperCase())) {
        siguienteNumero++;
        consecutivoStr = String(siguienteNumero).padStart(5, '0');
        skuGenerado = `${prefijo}${consecutivoStr}`;
    }

    let codigoBarraUnico = Math.floor(7700000000000 + Math.random() * 999999999);

    document.getElementById("prodSku").value = skuGenerado;
    document.getElementById("prodCodigoBarra").value = codigoBarraUnico;
}

function cerrarModalFormularioProducto() {
    document.getElementById("modalFormularioProducto").style.display = "none";
}

function procesarImagenSeleccionada(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                
                const maxDim = 800;
                if (width > height && width > maxDim) {
                    height *= maxDim / width;
                    width = maxDim;
                } else if (height > maxDim) {
                    width *= maxDim / height;
                    height = maxDim;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
                document.getElementById("prodFoto").value = dataUrl;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

async function guardarProductoInventario(event) {
    event.preventDefault();
    mostrarSpinner("Guardando producto...");

    const skuOriginal = document.getElementById("prodSkuOriginal").value.trim();
    const sku = document.getElementById("prodSku").value.trim();
    const codigo_barra = document.getElementById("prodCodigoBarra").value.trim();
    const nombre = document.getElementById("prodNombre").value.trim();
    const categoria = document.getElementById("prodCategoria").value.trim();
    const material = document.getElementById("prodMaterial").value.trim();
    const color = document.getElementById("prodColor").value.trim();
    const peso = parseFloat(String(document.getElementById("prodPeso").value || "0").replace(',', '.')) || 0;
    const valor_piedra = Number(document.getElementById("prodValorPiedra").value) || 0;
    const valor_oro = Number(document.getElementById("prodCosto").value) || 0;
    const valor_compra = valor_oro + valor_piedra;
    
    let valorOroActual = window.valorOroDelDiaCache || 250000;
    let valor_venta = (valorOroActual * peso) + valor_piedra;

    const porcentaje_venta = Number(document.getElementById("prodMargen").value) || 100;
    const tiene_descuento = Number(document.getElementById("prodDescuento").value) || 0;
    const ubicacion = document.getElementById("prodUbicacion").value.trim();
    const foto = document.getElementById("prodFoto").value.trim();

    const accionApi = skuOriginal ? "actualizarProducto" : "guardarProducto";

    try {
        const res = await API.llamar(accionApi, {
            action: accionApi,
            sku: sku,
            sku_original: skuOriginal,
            codigo_barra: codigo_barra,
            nombre: nombre,
            categoria: categoria,
            material: material,
            color: color,
            peso: Number(peso.toFixed(2)),
            valor_piedra: valor_piedra,
            valor_oro: valor_oro,
            valor_compra: valor_compra,
            valor_venta: valor_venta,
            porcentaje_venta: porcentaje_venta,
            tiene_descuento: tiene_descuento,
            ubicacion: ubicacion,
            foto: foto
        }, "POST");

        ocultarSpinner();

        if (res && res.status === "success") {
            alert(res.message || "Operación realizada con éxito.");
            cerrarModalFormularioProducto();
            cargarListaProductos();
        } else {
            alert("Error: " + (res ? res.message : "No se pudo guardar el producto."));
        }
    } catch(err) {
        ocultarSpinner();
        console.error(err);
        alert("⚠️ Error de conexión al guardar el producto.");
    }
}

function editarProducto(sku) {
    const prod = (window.listaProductosCache || []).find(p => String(p.SKU || p.sku || "").trim().toUpperCase() === sku.toUpperCase());
    if (!prod) {
        alert("No se encontró el producto para editar.");
        return;
    }

    const pPeso = prod.Peso !== undefined ? prod.Peso : (prod.peso !== undefined ? prod.peso : 0);
    const pValorOro = prod.Valor_Oro !== undefined ? prod.Valor_Oro : (prod.valor_oro !== undefined ? prod.valor_oro : (prod.Costo !== undefined ? prod.Costo : (prod.costo !== undefined ? prod.costo : 0)));
    const pValorPiedra = prod.Valor_Piedra !== undefined ? prod.Valor_Piedra : (prod.valor_piedra !== undefined ? prod.valor_piedra : 0);
    const pMargen = prod.Porcentaje_Venta !== undefined ? prod.Porcentaje_Venta : (prod.porcentaje_venta !== undefined ? prod.porcentaje_venta : 100);
    const pDescuento = prod.Tiene_Descuento !== undefined ? prod.Tiene_Descuento : (prod.tiene_descuento !== undefined ? prod.tiene_descuento : 0);
    const pUbicacion = prod.ID_Ubicacion || prod.id_ubicacion || prod.ubicacion || "CAJA FUERTE";

    document.getElementById("modalProductoTitulo").textContent = `Editar Producto: ${sku}`;
    document.getElementById("prodSkuOriginal").value = sku;
    document.getElementById("prodSku").value = prod.SKU || prod.sku || "";
    document.getElementById("prodCodigoBarra").value = prod.Codigo_Barra || prod.codigo_barra || "";
    document.getElementById("prodNombre").value = prod.Nombre || prod.nombre || "";
    document.getElementById("prodCategoria").value = prod.ID_Categoria || prod.categoria || "ANILLOS";
    document.getElementById("prodMaterial").value = prod.Material || prod.material || "ORO";
    document.getElementById("prodColor").value = prod.Color || prod.color || "AMARILLO";
    document.getElementById("prodPeso").value = pPeso;
    document.getElementById("prodValorPiedra").value = pValorPiedra;
    document.getElementById("prodCosto").value = pValorOro;
    document.getElementById("prodMargen").value = pMargen;
    document.getElementById("prodDescuento").value = pDescuento;
    document.getElementById("prodUbicacion").value = pUbicacion;
    document.getElementById("prodFoto").value = prod.Foto || prod.foto || "";

    document.getElementById("modalFormularioProducto").style.display = "flex";
}

async function eliminarProductosSeleccionados() {
    const checks = document.querySelectorAll('.check-producto-item:checked');
    if (checks.length === 0) {
        alert("Por favor seleccione al menos un producto para eliminar.");
        return;
    }

    if (!confirm(`¿Está seguro de eliminar ${checks.length} producto(s) seleccionado(s)?`)) return;

    mostrarSpinner("Eliminando productos...");
    let skusAEliminar = Array.from(checks).map(cb => cb.value);
    
    for (let sku of skusAEliminar) {
        await API.llamar("eliminarProducto", { action: "eliminarProducto", sku: sku }, "POST");
    }

    ocultarSpinner();
    alert("Productos eliminados correctamente.");
    cargarListaProductos();
}

function exportarProductosCSV() {
    if (!window.listaProductosCache || window.listaProductosCache.length === 0) {
        alert("No hay productos para exportar.");
        return;
    }

    let csv = "ID_Producto;SKU;Codigo_Barra;Nombre;ID_Categoria;Material;Color;Peso;Valor_Piedra;Valor_Oro;Porcentaje_Venta;Tiene_Descuento;ID_Ubicacion;Estado;Fecha_Creacion;Valor_Compra;Valor_Venta\n";
    let valorOroActual = window.valorOroDelDiaCache || 250000;

    window.listaProductosCache.forEach(p => {
        let valOro = Number(p.Valor_Oro || p.valor_oro || p.Costo || p.costo) || 0;
        let valPiedra = Number(p.Valor_Piedra || p.valor_piedra) || 0;
        let pesoItem = parseFloat(String(p.Peso || p.peso || 0).replace(',', '.')) || 0;
        let valorCompraTotal = valOro + valPiedra;
        let valorVentaCalc = (valorOroActual * pesoItem) + valPiedra;

        csv += [
            p.ID_Producto || p.sku || "",
            p.SKU || p.sku || "",
            p.Codigo_Barra || p.codigo_barra || "",
            `"${(p.Nombre || p.nombre || "").replace(/"/g, '""')}"`,
            p.ID_Categoria || p.categoria || "",
            p.Material || p.material || "ORO",
            p.Color || p.color || "AMARILLO",
            pesoItem.toFixed(2),
            valPiedra,
            valOro,
            p.Porcentaje_Venta || p.porcentaje_venta || 100,
            p.Tiene_Descuento || p.tiene_descuento || 0,
            p.ID_Ubicacion || p.id_ubicacion || p.ubicacion || "CAJA FUERTE",
            p.Estado || p.estado || "DISPONIBLE",
            p.Fecha_Creacion || p.fecha_creacion || new Date().toISOString().slice(0,10),
            valorCompraTotal,
            valorVentaCalc
        ].join(";") + "\n";
    });

    let link = document.createElement("a");
    link.href = encodeURI("data:text/csv;charset=utf-8,\uFEFF" + csv);
    link.download = `inventario_manu.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function abrirModalImportarExcel() {
    let modal = document.getElementById("modalImportarExcel");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modalImportarExcel";
        modal.style.cssText = "display: none; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); z-index: 9998; position: fixed; top: 0; left: 0; width: 100%; height: 100%;";
        modal.innerHTML = `
            <div style="background: white; width: 95%; max-width: 480px; border-radius: 12px; padding: 25px;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #0f172a;">📁 Importar Productos Masivos (CSV)</h3>
                    <button type="button" onclick="cerrarModalImportarExcel()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b;">✕</button>
                </div>
                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 15px;">Seleccione un archivo CSV con las cabeceras correspondientes para cargar el inventario masivamente.</p>
                
                <div style="margin-bottom: 20px;">
                    <input type="file" id="inputArchivoCsvImport" accept=".csv" style="width: 100%; padding: 10px; border: 1px dashed #cbd5e1; border-radius: 8px; background: #f8fafc;">
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" onclick="cerrarModalImportarExcel()" style="padding: 8px 16px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer;">Cancelar</button>
                    <button type="button" id="btnProcesarCsv" onclick="procesarArchivoCsvImportado()" style="padding: 8px 20px; background: #059669; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">📥 Procesar e Importar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = "flex";
}

function cerrarModalImportarExcel() {
    const modal = document.getElementById("modalImportarExcel");
    if (modal) modal.style.display = "none";
}

async function procesarArchivoCsvImportado() {
    const input = document.getElementById("inputArchivoCsvImport");
    if (!input || !input.files || input.files.length === 0) {
        alert("⚠️ Por favor seleccione un archivo CSV válido antes de procesar.");
        return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async function(e) {
        const contenido = e.target.result;
        const lineas = contenido.split(/\r\n|\n/);
        
        if (lineas.length < 2) {
            alert("⚠️ El archivo CSV está vacío o no contiene registros válidos.");
            return;
        }

        mostrarSpinner("Procesando e importando productos...");

        let cabeceraLinea = lineas[0].trim();
        let separador = cabeceraLinea.includes(';') ? ';' : ',';
        let headers = cabeceraLinea.split(separador).map(h => h.replace(/["\r]/g, "").trim().toLowerCase());

        let idxSku = headers.findIndex(h => h === 'sku');
        let idxNombre = headers.findIndex(h => h.includes('nombre'));
        let idxCat = headers.findIndex(h => h.includes('categoria') || h.includes('id_categoria'));
        let idxMat = headers.findIndex(h => h.includes('material'));
        let idxColor = headers.findIndex(h => h.includes('color'));
        let idxPeso = headers.findIndex(h => h.includes('peso'));
        let idxValorOro = headers.findIndex(h => h.includes('valor_oro') || h.includes('valor_compra_oro') || h.includes('costo'));
        let idxValorPiedra = headers.findIndex(h => h.includes('valor_piedra'));
        let idxMargen = headers.findIndex(h => h.includes('porcentaje_venta') || h.includes('margen'));
        let idxDescuento = headers.findIndex(h => h.includes('tiene_descuento') || h.includes('descuento'));
        let idxUbicacion = headers.findIndex(h => h.includes('ubicacion') || h.includes('id_ubicacion'));

        let importadosCount = 0;
        const listaActual = window.listaProductosCache || [];

        let limpiarMonto = (val) => {
            if (!val) return 0;
            let limpio = String(val).replace(/[\$\s"]/g, '');
            if (limpio.includes(',')) {
                limpio = limpio.replace(/\./g, '').replace(',', '.');
            } else {
                limpio = limpio.replace(/,/g, '');
            }
            return parseFloat(limpio) || 0;
        };

        let limpiarPesoDecimal = (val) => {
            if (!val) return 0;
            let limpio = String(val).replace(/[\s"]/g, '').replace(',', '.');
            let num = parseFloat(limpio);
            return isNaN(num) ? 0 : Number(num.toFixed(2));
        };

        for (let i = 1; i < lineas.length; i++) {
            let linea = lineas[i].trim();
            if (!linea) continue;

            let columnas = linea.split(separador);
            if (columnas.length < 2) continue;

            let getVal = (idx) => (idx !== -1 && columnas[idx] !== undefined) ? columnas[idx].replace(/"/g, '').trim() : '';

            let nombre = getVal(idxNombre);
            let skuCsv = getVal(idxSku);
            let categoria = getVal(idxCat) ? getVal(idxCat).toUpperCase() : 'ANILLOS';
            let material = getVal(idxMat) || 'ORO';
            let color = getVal(idxColor) || 'AMARILLO';
            
            let peso = limpiarPesoDecimal(getVal(idxPeso));
            let valorOro = limpiarMonto(getVal(idxValorOro));
            let valorPiedra = limpiarMonto(getVal(idxValorPiedra));
            let valorCompraTotal = valorOro + valorPiedra;

            let valorOroActual = window.valorOroDelDiaCache || 250000;
            let valorVentaCalc = (valorOroActual * peso) + valorPiedra;

            let margen = Number(getVal(idxMargen)) || 100;
            let descuento = Number(getVal(idxDescuento)) || 0;
            let ubicacion = getVal(idxUbicacion) || 'CAJA FUERTE';

            if (nombre) {
                let prefijo = "JO";
                if (categoria.includes("CANDON")) {
                    prefijo = "CAN";
                } else if (categoria.length >= 2) {
                    prefijo = categoria.substring(0, 2);
                }

                const filtradosPrefijo = listaActual.filter(p => {
                    let s = String(p.SKU || p.sku || "").trim().toUpperCase();
                    return s.startsWith(prefijo);
                });

                let skuGenerado = skuCsv;
                if (!skuGenerado) {
                    let siguienteNumero = filtradosPrefijo.length + importadosCount + 1;
                    let consecutivoStr = String(siguienteNumero).padStart(5, '0');
                    skuGenerado = `${prefijo}${consecutivoStr}`;

                    while (listaActual.some(p => String(p.SKU || p.sku || "").trim().toUpperCase() === skuGenerado.toUpperCase())) {
                        siguienteNumero++;
                        consecutivoStr = String(siguienteNumero).padStart(5, '0');
                        skuGenerado = `${prefijo}${consecutivoStr}`;
                    }
                }

                let codigoBarraUnico = Math.floor(7700000000000 + Math.random() * 999999999);

                try {
                    await API.llamar("guardarProducto", {
                        action: "guardarProducto",
                        sku: skuGenerado,
                        codigo_barra: String(codigoBarraUnico),
                        nombre: nombre,
                        categoria: categoria,
                        material: material,
                        color: color,
                        peso: peso,
                        valor_piedra: valorPiedra,
                        valor_oro: valorOro,
                        valor_compra: valorCompraTotal,
                        valor_venta: valorVentaCalc,
                        porcentaje_venta: margen,
                        tiene_descuento: descuento,
                        ubicacion: ubicacion,
                        foto: ""
                    }, "POST");
                    importadosCount++;
                } catch(err) {
                    console.error("Error al importar producto:", nombre, err);
                }
            }
        }

        ocultarSpinner();
        alert(`✅ ¡Importación completada con éxito! Se procesaron y cargaron ${importadosCount} productos al inventario.`);
        cerrarModalImportarExcel();
        cargarListaProductos();
    };

    reader.readAsText(file, "UTF-8");
}

function abrirZoomImagenSrc(url) {
    const modal = document.getElementById("imageModal");
    const img = document.getElementById("imgModalSrc");
    if (modal && img) {
        img.src = url;
        modal.style.display = "flex";
    }
}

function cerrarZoomImagen() {
    const modal = document.getElementById("imageModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function abrirEtiquetaProducto(sku, nombre, precio, codigoBarra) {
    let modalID = "modalEtiquetaJoya";
    let modalDiv = document.getElementById(modalID);
    
    if (!modalDiv) {
        modalDiv = document.createElement("div");
        modalDiv.id = modalID;
        modalDiv.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; z-index:9999;";
        document.body.appendChild(modalDiv);
    } else {
        modalDiv.style.display = "flex";
    }

    const valorBarras = codigoBarra && codigoBarra !== "undefined" && codigoBarra !== "" ? codigoBarra : sku;
    const skuToken = btoa(sku);
    const certLink = `https://glasas.github.io/MANU/cert.html?token=${skuToken}`;
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(certLink)}`;
    const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(valorBarras)}&scale=3&height=12&includetext=true`;

    modalDiv.innerHTML = `
        <div style="background:white; padding:25px; border-radius:12px; text-align:center; max-width:360px; width:90%; box-shadow:0 20px 25px -5px rgba(0,0,0,0.3);">
            <h4 style="color:#0f172a; margin-bottom:5px;">MANU JOYEROS</h4>
            <p style="font-size:0.75rem; color:#64748b; margin-bottom:15px;">SKU: <strong id="lblSkuEtiqueta">${sku}</strong></p>
            <p style="font-size:0.85rem; font-weight:600; color:#1e293b; margin-bottom:15px; max-height:40px; overflow:hidden;">${nombre}</p>
            
            <div style="display:flex; justify-content:space-around; align-items:center; margin-bottom:15px;">
                <div>
                    <img id="imgQrCanvas" src="${qrUrl}" crossorigin="anonymous" alt="QR Certificado" style="width:110px; height:110px; border:1px solid #e2e8f0; padding:3px; border-radius:6px;" />
                    <span style="display:block; font-size:0.65rem; color:#64748b; margin-top:2px;">QR Certificado</span>
                </div>
                <div>
                    <img id="imgBarcodeCanvas" src="${barcodeUrl}" crossorigin="anonymous" alt="Código de Barras" style="width:140px; height:60px; object-fit:contain;" />
                    <span style="display:block; font-size:0.65rem; color:#64748b; margin-top:2px;">${valorBarras}</span>
                </div>
            </div>

            <p style="font-size:1rem; font-weight:bold; color:#d97706; margin-bottom:15px;">Ref: ${sku}</p>

            <div style="display:flex; flex-direction:column; gap:8px;">
                <div style="display:flex; gap:8px;">
                    <button onclick="descargarImagenPng('imgQrCanvas', 'QR_Cert_${sku}.png')" style="flex:1; padding:8px; background:#0284c7; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:0.8rem;">📥 Descargar QR</button>
                    <button onclick="descargarImagenPng('imgBarcodeCanvas', 'Barras_${sku}.png')" style="flex:1; padding:8px; background:#0d9488; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:0.8rem;">📥 Descargar Barras</button>
                </div>
                <button onclick="document.getElementById('${modalID}').style.display='none'" style="width:100%; padding:8px; background:#ef4444; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:0.85rem;">Cerrar</button>
            </div>
        </div>
    `;
}

function descargarImagenPng(imgId, nombreArchivo) {
    const img = document.getElementById(imgId);
    if (!img) return;

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || 300;
    canvas.height = img.naturalHeight || 150;
    const ctx = canvas.getContext("2d");

    const imageObj = new Image();
    imageObj.crossOrigin = "anonymous";
    imageObj.onload = function() {
        ctx.drawImage(imageObj, 0, 0);
        const link = document.createElement("a");
        link.download = nombreArchivo;
        link.href = canvas.toDataURL("image/png");
        link.click();
    };
    imageObj.src = img.src;
}
