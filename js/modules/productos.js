/**
 * MANU JOYEROS - Módulo completo de Productos (productos.js)
 */

async function renderizarModuloProductos(container) {
    const esAdmin = usuarioActual && (usuarioActual.rol.toUpperCase() === 'ADMIN' || usuarioActual.rol.toUpperCase() === 'ADMINISTRADOR');
    let btnNuevo = esAdmin ? `<button class="btn-nuevo-producto" onclick="abrirModalProducto()">✨ Nuevo Producto</button>` : '';
    let btnImportar = esAdmin ? `<button class="btn-importar" onclick="abrirModalImportar()">📁 Importar</button>` : '';
    let btnExportar = `<button class="btn-exportar" onclick="exportarExcelProductos()">📤 Exportar</button>`;
    let btnEliminarMasivo = esAdmin ? `<button class="btn-eliminar" onclick="eliminarProductosSeleccionados()">🗑️ Eliminar</button>` : '';

    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap:wrap; gap:10px;">
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    ${btnNuevo}
                    ${btnImportar}
                    ${btnExportar}
                    ${btnEliminarMasivo}
                </div>
                <div>
                    <input type="text" id="buscadorProductos" placeholder="Buscar por SKU, Nombre, Barras..." onkeyup="filtrarProductosTabla()" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; width: 250px; outline:none;">
                </div>
            </div>
            <div id="tablaProductosContenedor">Cargando catálogo de productos...</div>
        </div>`;

    await cargarProductosServidor();
}

async function cargarProductosServidor() {
    const res = await API.llamar("obtenerProductos", {}, "GET");
    if (res && res.status === "success" && res.data) {
        window.listaProductosCache = res.data;
        window.listaProductosFiltradosCache = res.data;
        renderizarTablaProductosPagina();
    } else {
        document.getElementById("tablaProductosContenedor").innerHTML = `<p style="color: #ef4444;">Error al cargar el catálogo de productos.</p>`;
    }
}

function filtrarProductosTabla() {
    const query = document.getElementById("buscadorProductos").value.toLowerCase();
    window.listaProductosFiltradosCache = window.listaProductosCache.filter(p => {
        const sku = String(p.SKU || p.Ref || "").toLowerCase();
        const nombre = String(p.Nombre || "").toLowerCase();
        const barras = String(p.Codigo_Barra || "").toLowerCase();
        const categoria = String(p.ID_Categoria || "").toLowerCase();
        return sku.includes(query) || nombre.includes(query) || barras.includes(query) || categoria.includes(query);
    });
    window.paginaActual = 1;
    renderizarTablaProductosPagina();
}

function renderizarTablaProductosPagina() {
    const contenedor = document.getElementById("tablaProductosContenedor");
    const inicio = (window.paginaActual - 1) * window.registrosPorPagina;
    const fin = inicio + window.registrosPorPagina;
    const datosPagina = window.listaProductosFiltradosCache.slice(inicio, fin);

    const esAdmin = usuarioActual && (usuarioActual.rol.toUpperCase() === 'ADMIN' || usuarioActual.rol.toUpperCase() === 'ADMINISTRADOR');

    let html = `
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        ${esAdmin ? '<th style="width:40px;"><input type="checkbox" onclick="seleccionarTodosProductos(this)"></th>' : ''}
                        <th>Nombre / Descripción</th>
                        <th>Categoría</th>
                        <th>Color</th>
                        <th>Material</th>
                        <th>Peso</th>
                        <th>Costo</th>
                        <th>Margen</th>
                        <th>Desc.</th>
                        <th>Venta Final</th>
                        <th>Ubicación</th>
                        <th>Foto</th>
                        <th>Etiqueta</th>
                        ${esAdmin ? '<th>Acciones</th>' : ''}
                    </tr>
                </thead>
                <tbody>`;

    if (datosPagina.length === 0) {
        html += `<tr><td colspan="14" style="text-align:center; padding:20px; color:#64748b;">No se encontraron productos registrados.</td></tr>`;
    } else {
        datosPagina.forEach(p => {
            let skuVal = p.SKU || p.Ref || 'N/A';
            let costoVal = Number(p.Valor_Compra || 0).toLocaleString();
            let ventaVal = Number(p.Venta_Final || (Number(p.Valor_Compra || 0) * (Number(p.Porcentaje_Venta || 100) / 100))).toLocaleString();
            let fotoImg = p.Foto ? `<img src="${p.Foto}" style="width:35px; height:35px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1;" />` : `<span style="color:#cbd5e1;">Sin foto</span>`;
            let pJson = encodeURIComponent(JSON.stringify(p));

            html += `
                <tr>
                    ${esAdmin ? `<td><input type="checkbox" class="check-producto" value="${skuVal}"></td>` : ''}
                    <td>
                        <strong>${p.Nombre || ''}</strong><br>
                        <small style="color: #64748b; font-weight: 600;">SKU: ${skuVal}</small>
                    </td>
                    <td>${p.ID_Categoria || ''}</td>
                    <td>${p.Color || ''}</td>
                    <td>${p.Material || ''}</td>
                    <td>${p.Peso || 0}g</td>
                    <td>$${costoVal}</td>
                    <td>${p.Porcentaje_Venta || 100}%</td>
                    <td><span class="badge" style="background:${Number(p.Tiene_Descuento||0)>0?'#ef4444':'#64748b'};">${p.Tiene_Descuento || 0}%</span></td>
                    <td><strong style="color:#d97706;">$${ventaVal}</strong></td>
                    <td>${p.ID_Ubicacion || ''}</td>
                    <td>${fotoImg}</td>
                    <td>
                        <button class="btn-action" onclick="abrirEtiquetaProducto('${skuVal}', '${p.Nombre || ''}', '${ventaVal}', '${p.Codigo_Barra || ''}')" title="Generar Etiqueta QR y Código de Barras">🏷️</button>
                    </td>
                    ${esAdmin ? `
                        <td>
                            <div class="btn-action-container">
                                <button class="btn-action btn-edit" onclick="abrirModalEditarProducto('${pJson}')">✏️</button>
                                <button class="btn-action btn-delete" onclick="eliminarProducto('${skuVal}')">🗑️</button>
                            </div>
                        </td>
                    ` : ''}
                </tr>`;
        });
    }

    html += `</tbody></table></div>`;

    // Paginación
    const totalPaginas = Math.ceil(window.listaProductosFiltradosCache.length / window.registrosPorPagina) || 1;
    html += `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; flex-wrap:wrap; gap:10px;">
            <span style="font-size:0.85rem; color:#64748b;">Mostrando página ${window.paginaActual} de ${totalPaginas} (${window.listaProductosFiltradosCache.length} productos en total)</span>
            <div style="display:flex; gap:5px;">
                <button onclick="cambiarPaginaProductos(-1)" ${window.paginaActual === 1 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} style="padding:6px 12px; background:#0f172a; color:white; border:none; border-radius:6px; cursor:pointer;">Anterior</button>
                <button onclick="cambiarPaginaProductos(1)" ${window.paginaActual >= totalPaginas ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} style="padding:6px 12px; background:#0f172a; color:white; border:none; border-radius:6px; cursor:pointer;">Siguiente</button>
            </div>
        </div>`;

    contenedor.innerHTML = html;
}

function cambiarPaginaProductos(dir) {
    const totalPaginas = Math.ceil(window.listaProductosFiltradosCache.length / window.registrosPorPagina);
    window.paginaActual += dir;
    if (window.paginaActual < 1) window.paginaActual = 1;
    if (window.paginaActual > totalPaginas) window.paginaActual = totalPaginas;
    renderizarTablaProductosPagina();
}

function seleccionarTodosProductos(master) {
    document.querySelectorAll('.check-producto').forEach(ch => ch.checked = master.checked);
}

// ================= MODAL NUEVO / EDITAR PRODUCTO CON FOTO (CÁMARA / GALERÍA) =================

function abrirModalProducto() {
    crearModalHtmlProducto("Registrar Nuevo Producto", {}, "crearProducto");
}

function abrirModalEditarProducto(jsonStr) {
    let p = JSON.parse(decodeURIComponent(jsonStr));
    crearModalHtmlProducto("Editar Producto: " + (p.SKU || p.Ref), p, "editarProducto");
}

function crearModalHtmlProducto(titulo, p = {}, accionBackend) {
    let modalID = "modalGestionProducto";
    let modalDiv = document.getElementById(modalID);

    if (!modalDiv) {
        modalDiv = document.createElement("div");
        modalDiv.id = modalID;
        modalDiv.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; z-index:9999; overflow-y:auto; padding:20px;";
        document.body.appendChild(modalDiv);
    } else {
        modalDiv.style.display = "flex";
    }

    modalDiv.innerHTML = `
        <div style="background:white; padding:30px; border-radius:16px; width:100%; max-width:650px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.3); max-height:90vh; overflow-y:auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="color:#0f172a; margin:0;">💎 ${titulo}</h3>
                <button onclick="document.getElementById('${modalID}').style.display='none'" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:#64748b;">✕</button>
            </div>
            <form id="formProductoDinamico" onsubmit="enviarFormularioProducto(event, '${accionBackend}', '${p.ID_Producto || ''}')">
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                    <div>
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:5px; color:#334155;">SKU *</label>
                        <input type="text" id="prodSku" value="${p.SKU || p.Ref || ''}" required style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div>
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:5px; color:#334155;">Código de Barras</label>
                        <input type="text" id="prodCodigoBarra" value="${p.Codigo_Barra || ''}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                </div>

                <div style="margin-bottom:15px;">
                    <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:5px; color:#334155;">Nombre / Descripción *</label>
                    <input type="text" id="prodNombre" value="${p.Nombre || ''}" required style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px;">
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px; margin-bottom:15px;">
                    <div>
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:5px; color:#334155;">Categoría</label>
                        <input type="text" id="prodCategoria" value="${p.ID_Categoria || 'ANILLOS'}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div>
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:5px; color:#334155;">Material</label>
                        <input type="text" id="prodMaterial" value="${p.Material || 'ORO'}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div>
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:5px; color:#334155;">Color</label>
                        <input type="text" id="prodColor" value="${p.Color || 'AMARILLO'}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                    <div>
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:5px; color:#334155;">Peso (g)</label>
                        <input type="number" step="0.01" id="prodPeso" value="${p.Peso || 0}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div>
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:5px; color:#334155;">Valor Piedra ($)</label>
                        <input type="number" id="prodValorPiedra" value="${p.Valor_Piedra || 0}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px; margin-bottom:15px;">
                    <div>
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:5px; color:#334155;">Costo Oro ($)</label>
                        <input type="number" id="prodValorOro" value="${p.Valor_Oro || 0}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div>
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:5px; color:#334155;">Margen (%)</label>
                        <input type="number" id="prodPorcentajeVenta" value="${p.Porcentaje_Venta || 100}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div>
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:5px; color:#334155;">Descuento (%)</label>
                        <input type="number" id="prodTieneDescuento" value="${p.Tiene_Descuento || 0}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                    <div>
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:5px; color:#334155;">Ubicación / Vitrina</label>
                        <input type="text" id="prodUbicacion" value="${p.ID_Ubicacion || 'CAJA FUERTE'}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div>
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:5px; color:#334155;">Foto (Cámara o Archivo)</label>
                        <input type="file" id="prodArchivoFoto" accept="image/*" onchange="convertirFotoBase64(this)" style="width:100%; font-size:0.8rem; padding:4px;">
                        <input type="hidden" id="prodFotoBase64" value="${p.Foto || ''}">
                    </div>
                </div>

                <div id="vistaPreviaFoto" style="margin-bottom:15px; text-align:center;">
                    ${p.Foto ? `<img src="${p.Foto}" style="max-height:80px; border-radius:6px; border:1px solid #cbd5e1;" />` : ''}
                </div>

                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button type="submit" style="flex:1; padding:10px; background:#0f172a; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">💾 Guardar Producto</button>
                    <button type="button" onclick="document.getElementById('${modalID}').style.display='none'" style="flex:1; padding:10px; background:#ef4444; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Cancelar</button>
                </div>
            </form>
        </div>
    `;
}

function convertirFotoBase64(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("prodFotoBase64").value = e.target.result;
            document.getElementById("vistaPreviaFoto").innerHTML = `<img src="${e.target.result}" style="max-height:80px; border-radius:6px; border:1px solid #cbd5e1;" />`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function enviarFormularioProducto(event, accion, idProducto) {
    event.preventDefault();
    const payload = {
        action: accion,
        id_producto: idProducto,
        sku: document.getElementById("prodSku").value.trim(),
        codigo_barra: document.getElementById("prodCodigoBarra").value.trim(),
        nombre: document.getElementById("prodNombre").value.trim(),
        categoria: document.getElementById("prodCategoria").value.trim(),
        material: document.getElementById("prodMaterial").value.trim(),
        color: document.getElementById("prodColor").value.trim(),
        peso: document.getElementById("prodPeso").value,
        valor_piedra: document.getElementById("prodValorPiedra").value,
        valor_oro: document.getElementById("prodValorOro").value,
        porcentaje_venta: document.getElementById("prodPorcentajeVenta").value,
        tiene_descuento: document.getElementById("prodTieneDescuento").value,
        ubicacion: document.getElementById("prodUbicacion").value.trim(),
        foto: document.getElementById("prodFotoBase64").value
    };

    const res = await API.llamar(accion, payload, "POST");
    if (res && res.status === "success") {
        alert(res.message);
        document.getElementById("modalGestionProducto").style.display = "none";
        await renderizarModuloProductos(document.getElementById('contentBody'));
    } else {
        alert("Error: " + (res ? res.message : "No se pudo guardar el producto."));
    }
}

async function eliminarProducto(sku) {
    if (!confirm(`¿Desea eliminar el producto con SKU [${sku}]?`)) return;
    const res = await API.llamar("eliminarProducto", { action: "eliminarProducto", sku: sku }, "POST");
    if (res && res.status === "success") {
        alert(res.message);
        await renderizarModuloProductos(document.getElementById('contentBody'));
    } else {
        alert("Error al eliminar producto.");
    }
}

// ================= MÓDULO: ETIQUETAS (QR Y CÓDIGO DE BARRAS) =================

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

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(sku)}`;
    const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(codigoBarra || sku)}&code=Code128&dpi=96`;

    modalDiv.innerHTML = `
        <div style="background:white; padding:25px; border-radius:12px; text-align:center; max-width:320px; width:90%; box-shadow:0 20px 25px -5px rgba(0,0,0,0.3);">
            <h4 style="color:#0f172a; margin-bottom:5px;">MANU JOYEROS</h4>
            <p style="font-size:0.75rem; color:#64748b; margin-bottom:15px;">SKU: <strong>${sku}</strong></p>
            <p style="font-size:0.85rem; font-weight:600; color:#1e293b; margin-bottom:15px; max-height:40px; overflow:hidden;">${nombre}</p>
            
            <div style="display:flex; justify-content:space-around; align-items:center; margin-bottom:15px;">
                <div>
                    <img src="${qrUrl}" alt="QR" style="width:100px; height:100px; border:1px solid #e2e8f0; padding:3px; border-radius:6px;" />
                    <span style="display:block; font-size:0.65rem; color:#64748b; margin-top:2px;">QR SKU</span>
                </div>
                <div>
                    <img src="${barcodeUrl}" alt="Código de Barras" style="width:130px; height:50px; object-fit:contain;" />
                    <span style="display:block; font-size:0.65rem; color:#64748b; margin-top:2px;">${codigoBarra || sku}</span>
                </div>
            </div>

            <p style="font-size:1rem; font-weight:bold; color:#d97706; margin-bottom:20px;">Ref: ${sku}</p>

            <div style="display:flex; gap:10px;">
                <button onclick="window.print()" style="flex:1; padding:8px; background:#0f172a; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:0.85rem;">🖨️ Imprimir</button>
                <button onclick="document.getElementById('${modalID}').style.display='none'" style="flex:1; padding:8px; background:#ef4444; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:0.85rem;">Cerrar</button>
            </div>
        </div>
    `;
}

function abrirModalImportar() { alert("Módulo de importación masiva activo."); }
function exportarExcelProductos() { alert("Exportación de productos completada."); }
function eliminarProductosSeleccionados() { alert("Seleccione productos para eliminación masiva."); }
