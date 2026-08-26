/**
 * MANU JOYEROS - Módulo de Productos (productos.js)
 */

let fotoBase64Temporal = "";
let timeoutBuscador = null;

async function renderizarModuloProductos(container) {
    await cargarCategoriasDinamicas();
    await cargarMaterialesDinamicos();
    await cargarColoresDinamicos();
    await cargarValorOroDia();

    const esAdmin = usuarioActual && (usuarioActual.rol.toUpperCase() === 'ADMIN' || usuarioActual.rol.toUpperCase() === 'ADMINISTRADOR');
    let botonesAccionHtml = esAdmin ? `
        <div class="toolbar-group-actions">
            <button class="btn-modern btn-primary-action" onclick="abrirFormularioCrearProducto()">✨ Nuevo</button>
            <button class="btn-modern btn-success-action" onclick="abrirModalImportarCSV()">📂 Importar</button>
            <button class="btn-modern btn-info-action" onclick="exportarCatalogoCSV()">📥 Exportar</button>
            <a href="https://glasas.github.io/MANU/catalogomanu" target="_blank" class="btn-modern btn-warning-action">🌐 Catálogo Web</a>
            <button class="btn-modern btn-purple-action" onclick="abrirModalQrCatalogo()">📱 QR Web</button>
            <button class="btn-modern btn-danger-action" onclick="eliminarProductosSeleccionados()">🗑️ Eliminar</button>
        </div>
        <div class="toolbar-group-actions">
            <button class="btn-modern btn-refresh-action" onclick="forzarRecargaCatalogo()" title="Actualizar Datos">🔄</button>
            <div class="toolbar-search-box">
                <span>🔍</span>
                <input type="text" id="inputBuscadorCatalogo" placeholder="SKU, Barras, Nombre..." oninput="filtrarCatalogoEnVivoOptimizado()">
            </div>
        </div>
    ` : `
        <div class="toolbar-group-actions">
            <a href="https://glasas.github.io/MANU/catalogomanu" target="_blank" class="btn-modern btn-warning-action">🌐 Catálogo Web</a>
            <button class="btn-modern btn-purple-action" onclick="abrirModalQrCatalogo()">📱 QR Web</button>
        </div>
        <div class="toolbar-group-actions">
            <button class="btn-modern btn-refresh-action" onclick="forzarRecargaCatalogo()" title="Actualizar Datos">🔄</button>
            <div class="toolbar-search-box">
                <span>🔍</span>
                <input type="text" id="inputBuscadorCatalogo" placeholder="SKU, Barras, Nombre..." oninput="filtrarCatalogoEnVivoOptimizado()">
            </div>
        </div>
    `;

    container.innerHTML = `
        <div class="card">
            <h3 style="color: #0f172a; margin-bottom: 0.75rem; font-size: 1.1rem;">Catálogo de Productos y Joyas</h3>
            <div class="catalog-toolbar">${botonesAccionHtml}</div>
            <div id="vistaProductosInterna"><p style="text-align: center; color: #64748b; padding: 2rem;">Cargando inventario...</p></div>
        </div>

        <div class="image-modal" id="modalFormularioProducto" onclick="cerrarModalProducto()">
            <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; color: #0f172a;" onclick="event.stopPropagation()">
                <h3 id="modalProductoTitulo" style="margin-bottom: 1rem; color: #0f172a;">✨ Registrar Nuevo Producto</h3>
                <form id="formProductoReal" onsubmit="guardarProductoServidor(event)">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;">
                        <div class="form-group"><label>SKU *</label><input type="text" id="prodSku" required style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;"></div>
                        <div class="form-group"><label>Código de Barras</label><input type="text" id="prodCodigoBarra" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;"></div>
                    </div>
                    <div class="form-group"><label>Nombre / Descripción *</label><input type="text" id="prodNombre" required style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;"></div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                        <div class="form-group"><label>Categoría</label><input type="text" id="prodCategoria" value="ANILLOS" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;"></div>
                        <div class="form-group"><label>Color</label><input type="text" id="prodColor" value="AMARILLO" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;"></div>
                        <div class="form-group"><label>Material</label><input type="text" id="prodMaterial" value="ORO" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;"></div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
                        <div class="form-group"><label>Peso (g)</label><input type="number" step="0.01" id="prodPeso" value="0" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;"></div>
                        <div class="form-group"><label>Valor Oro ($)</label><input type="number" id="prodValorOro" value="0" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;"></div>
                        <div class="form-group"><label>Valor Piedra ($)</label><input type="number" id="prodValorPiedra" value="0" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;"></div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                        <div class="form-group"><label>Margen Venta (%)</label><input type="number" id="prodMargen" value="100" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;"></div>
                        <div class="form-group"><label>Descuento (%)</label><input type="number" id="prodDescuento" value="0" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;"></div>
                        <div class="form-group"><label>Ubicación</label><input type="text" id="prodUbicacion" value="CAJA FUERTE" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;"></div>
                    </div>
                    
                    <div class="form-group">
                        <label>📸 Fotografía de la Joya</label>
                        <input type="file" accept="image/*" capture="environment" id="prodArchivoFoto" onchange="procesarImagenModulo(event, 'previewProdModulo')" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; background:#f8fafc;">
                        <div style="margin-top: 10px; text-align: center;">
                            <img id="previewProdModulo" src="" style="max-width: 150px; max-height: 150px; display: none; border-radius: 8px; border: 1px solid #cbd5e1; object-fit: cover; margin: 0 auto;">
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; margin-top: 1rem;">
                        <button type="submit" style="flex: 1; background-color: #0f172a; color: #ffffff; border: none; padding: 0.75rem; border-radius: 8px; font-weight: 500; cursor: pointer;">💾 Guardar</button>
                        <button type="button" onclick="cerrarModalProducto()" style="flex: 1; background-color: #ef4444; color: #ffffff; border: none; padding: 0.75rem; border-radius: 8px; font-weight: 500; cursor: pointer;">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>`;
    await cargarListaProductos(false);
}

function procesarImagenModulo(event, previewId) {
    const archivo = event.target.files[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let width = img.width, height = img.height;
            const MAX = 400;
            if (width > height) { if (width > MAX) { height *= MAX / width; width = MAX; } }
            else { if (height > MAX) { width *= MAX / height; height = MAX; } }
            canvas.width = width; canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            fotoBase64Temporal = canvas.toDataURL('image/jpeg', 0.5);
            const preview = document.getElementById(previewId);
            if (preview) { preview.src = fotoBase64Temporal; preview.style.display = 'block'; }
        };
        img.src = e.target.result;
    };
    lector.readAsDataURL(archivo);
}

function abrirFormularioCrearProducto() {
    fotoBase64Temporal = "";
    document.getElementById("modalProductoTitulo").textContent = "✨ Registrar Nuevo Producto";
    document.getElementById("prodSku").value = "";
    document.getElementById("prodSku").readOnly = false;
    document.getElementById("prodCodigoBarra").value = "";
    document.getElementById("prodNombre").value = "";
    document.getElementById("prodPeso").value = "0";
    document.getElementById("prodValorOro").value = "0";
    document.getElementById("prodValorPiedra").value = "0";
    document.getElementById("prodMargen").value = "100";
    document.getElementById("prodDescuento").value = "0";
    document.getElementById("prodUbicacion").value = "CAJA FUERTE";
    document.getElementById("prodArchivoFoto").value = "";
    const preview = document.getElementById("previewProdModulo");
    if (preview) { preview.src = ""; preview.style.display = "none"; }
    document.getElementById("modalFormularioProducto").classList.add("active");
}

function abrirFormularioEditarProducto(jsonEncoded) {
    let p = JSON.parse(decodeURIComponent(jsonEncoded));
    fotoBase64Temporal = p.Foto || "";
    document.getElementById("modalProductoTitulo").textContent = `✏️ Modificar Producto [${p.SKU}]`;
    document.getElementById("prodSku").value = p.SKU || "";
    document.getElementById("prodSku").readOnly = true;
    document.getElementById("prodCodigoBarra").value = p.Codigo_Barra || p.codigo_barra || "";
    document.getElementById("prodNombre").value = p.Nombre || "";
    document.getElementById("prodCategoria").value = p.ID_Categoria || "ANILLOS";
    document.getElementById("prodColor").value = p.Color || p.ID_Subcategoria || "AMARILLO";
    document.getElementById("prodMaterial").value = p.Material_Oro || p.Material || "ORO";
    document.getElementById("prodPeso").value = p.Peso || 0;
    document.getElementById("prodValorOro").value = p.Valor_Oro || 0;
    document.getElementById("prodValorPiedra").value = p.Valor_Piedra || 0;
    document.getElementById("prodMargen").value = p.Porcentaje_Venta || 100;
    document.getElementById("prodDescuento").value = p.Tiene_Descuento || 0;
    document.getElementById("prodUbicacion").value = p.ID_Ubicacion || "CAJA FUERTE";
    document.getElementById("prodArchivoFoto").value = "";
    const preview = document.getElementById("previewProdModulo");
    if (preview) {
        if (fotoBase64Temporal) { preview.src = fotoBase64Temporal; preview.style.display = "block"; }
        else { preview.src = ""; preview.style.display = "none"; }
    }
    document.getElementById("modalFormularioProducto").classList.add("active");
}

function cerrarModalProducto() { document.getElementById("modalFormularioProducto").classList.remove("active"); }

async function guardarProductoServidor(e) {
    e.preventDefault();
    const esEdicion = document.getElementById("prodSku").readOnly;
    const accionServidor = esEdicion ? "editarProducto" : "crearProducto";

    let payload = {
        action: accionServidor,
        sku: document.getElementById("prodSku").value.trim().toUpperCase(),
        codigo_barra: document.getElementById("prodCodigoBarra").value.trim(),
        nombre: document.getElementById("prodNombre").value.trim(),
        categoria: document.getElementById("prodCategoria").value.trim().toUpperCase(),
        color: document.getElementById("prodColor").value.trim().toUpperCase(),
        material: document.getElementById("prodMaterial").value.trim().toUpperCase(),
        peso: parseFloat(document.getElementById("prodPeso").value) || 0,
        valor_oro: parseFloat(document.getElementById("prodValorOro").value) || 0,
        valor_piedra: parseFloat(document.getElementById("prodValorPiedra").value) || 0,
        porcentaje_venta: parseFloat(document.getElementById("prodMargen").value) || 100,
        tiene_descuento: parseFloat(document.getElementById("prodDescuento").value) || 0,
        ubicacion: document.getElementById("prodUbicacion").value.trim().toUpperCase(),
        foto: fotoBase64Temporal || "",
        estado: "DISPONIBLE"
    };

    const res = await API.llamar(accionServidor, payload, "POST");
    if (res && res.status === "success") {
        alert(res.message);
        cerrarModalProducto();
        localStorage.removeItem("cache_productos_manu");
        renderizarModuloProductos(document.getElementById('contentBody'));
    } else {
        alert("Error al guardar: " + (res ? res.message : "Desconocido"));
    }
}

function exportarCatalogoCSV() {
    if (!listaProductosFiltradosCache || listaProductosFiltradosCache.length === 0) { alert("No hay datos."); return; }
    let csv = "SKU;Codigo_Barra;Nombre;Categoria;Color;Material;Peso;Valor_Oro;Valor_Piedra;Porcentaje_Venta;Tiene_Descuento;Ubicacion;Estado\n";
    listaProductosFiltradosCache.forEach(p => {
        csv += [p.SKU, p.Codigo_Barra || "", `"${(p.Nombre || "").replace(/"/g, '""')}"`, p.ID_Categoria, p.Color || "", p.Material_Oro || "", p.Peso || 0, p.Valor_Oro || 0, p.Valor_Piedra || 0, p.Porcentaje_Venta || 100, p.Tiene_Descuento || 0, p.ID_Ubicacion || "", "DISPONIBLE"].join(";") + "\n";
    });
    let link = document.createElement("a");
    link.href = encodeURI("data:text/csv;charset=utf-8," + csv);
    link.download = "catalogo_manu.csv";
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

function abrirModalImportarCSV() {
    let input = document.createElement('input');
    input.type = 'file'; input.accept = '.csv';
    input.onchange = e => {
        let archivo = e.target.files[0];
        let lector = new FileReader();
        lector.onload = async function(event) {
            let lineas = event.target.result.split(/\r\n|\n/);
            let arr = [];
            for (let i = 1; i < lineas.length; i++) {
                let l = lineas[i].trim();
                if (!l) continue;
                let c = l.split(';');
                if (c.length >= 3) {
                    arr.push({ sku: c[0], codigo_barra: c[1], nombre: c[2].replace(/"/g, ''), categoria: c[3], color: c[4], material: c[5], peso: c[6], valor_oro: c[7], valor_piedra: c[8], porcentaje_venta: c[9], tiene_descuento: c[10], ubicacion: c[11], estado: 'DISPONIBLE' });
                }
            }
            if (arr.length > 0 && confirm(`¿Importar ${arr.length} productos?`)) {
                const res = await API.llamar("importarMasivoProductos", { action: "importarMasivoProductos", productos: arr }, "POST");
                if (res && res.status === "success") { alert(res.message); localStorage.removeItem("cache_productos_manu"); renderizarModuloProductos(document.getElementById('contentBody')); }
            }
        };
        lector.readAsText(archivo, 'ISO-8859-1');
    };
    input.click();
}

function seleccionarTodosCheckboxes(source) {
    document.querySelectorAll('.sku-checkbox').forEach(cb => cb.checked = source.checked);
}

async function eliminarProductosSeleccionados() {
    let checkboxes = document.querySelectorAll('.sku-checkbox:checked');
    if (checkboxes.length === 0) { alert("Seleccione al menos uno."); return; }
    if (confirm(`¿Eliminar ${checkboxes.length} productos?`)) {
        let skus = Array.from(checkboxes).map(cb => cb.value);
        const res = await API.llamar("eliminarMasivoProductos", { action: "eliminarMasivoProductos", skus: skus }, "POST");
        if (res && res.status === "success") { alert(res.message); localStorage.removeItem("cache_productos_manu"); renderizarModuloProductos(document.getElementById('contentBody')); }
    }
}

async function forzarRecargaCatalogo() {
    localStorage.removeItem("cache_productos_manu");
    localStorage.removeItem("cache_productos_tiempo");
    await cargarListaProductos(true);
}

async function cargarListaProductos(forzarRed = false) {
    const contenedor = document.getElementById("vistaProductosInterna");
    let productos = null;
    let cache = localStorage.getItem("cache_productos_manu");
    let tiempo = localStorage.getItem("cache_productos_tiempo");
    let ahora = new Date().getTime();

    if (!forzarRed && cache && tiempo && (ahora - tiempo < 300000)) {
        try { productos = JSON.parse(cache); } catch(e) {}
    }

    if (!productos) {
        const res = await API.llamar("obtenerProductos", {}, "GET");
        if (res && res.status === "success") {
            productos = res.data;
            localStorage.setItem("cache_productos_manu", JSON.stringify(productos));
            localStorage.setItem("cache_productos_tiempo", ahora);
        } else {
            contenedor.innerHTML = `<p style="color: #ef4444; text-align: center;">Error al cargar inventario.</p>`;
            return;
        }
    }

    listaProductosCache = (productos || []).filter(p => String(p.Estado || p.estado || "DISPONIBLE").trim().toUpperCase().includes("DISPONIBLE"));
    listaProductosFiltradosCache = listaProductosCache;
    paginaActual = 1;
    renderizarTablaProductosPaginada();
}

function filtrarCatalogoEnVivoOptimizado() {
    clearTimeout(timeoutBuscador);
    timeoutBuscador = setTimeout(() => {
        const query = document.getElementById("inputBuscadorCatalogo").value.toLowerCase().trim();
        if (!query) {
            listaProductosFiltradosCache = listaProductosCache;
        } else {
            const terminos = query.split(/\s+/);
            listaProductosFiltradosCache = listaProductosCache.filter(p => {
                const sku = String(p.SKU || "").toLowerCase();
                const nombre = String(p.Nombre || "").toLowerCase();
                const codigoBarra = String(p.Codigo_Barra || "").toLowerCase();
                const categoria = String(p.ID_Categoria || "").toLowerCase();
                const material = String(p.Material_Oro || "").toLowerCase();
                const color = String(p.Color || "").toLowerCase();
                const ubicacion = String(p.ID_Ubicacion || "").toLowerCase();
                
                return terminos.every(t => sku.includes(t) || codigoBarra.includes(t) || nombre.includes(t) || categoria.includes(t) || material.includes(t) || color.includes(t) || ubicacion.includes(t));
            });
        }
        paginaActual = 1;
        renderizarTablaProductosPaginada();
    }, 150);
}

function cambiarPagina(delta) {
    const totalPaginas = Math.ceil(listaProductosFiltradosCache.length / registrosPorPagina) || 1;
    paginaActual += delta;
    if (paginaActual < 1) paginaActual = 1;
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    renderizarTablaProductosPaginada();
}

function renderizarTablaProductosPaginada() {
    const contenedor = document.getElementById("vistaProductosInterna");
    const esAdmin = usuarioActual && (usuarioActual.rol.toUpperCase() === 'ADMIN' || usuarioActual.rol.toUpperCase() === 'ADMINISTRADOR');

    if (listaProductosFiltradosCache.length === 0) { 
        contenedor.innerHTML = `<p style="color: #64748b; text-align: center; padding: 2rem;">No se encontraron joyas disponibles.</p>`;
        return; 
    }

    const totalRegistros = listaProductosFiltradosCache.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina) || 1;
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const productosPagina = listaProductosFiltradosCache.slice(inicio, fin);

    const pagHtml = (pos) => `
        <div class="pagination-container ${pos}">
            <span>Mostrando <strong>${inicio + 1}</strong> a <strong>${Math.min(fin, totalRegistros)}</strong> de <strong>${totalRegistros}</strong></span>
            <div class="pagination-buttons">
                <button class="btn-page" onclick="cambiarPagina(-1)" ${paginaActual === 1 ? 'disabled' : ''}>◀ Anterior</button>
                <span>Página ${paginaActual} de ${totalPaginas}</span>
                <button class="btn-page" onclick="cambiarPagina(1)" ${paginaActual === totalPaginas ? 'disabled' : ''}>Siguiente ▶</button>
            </div>
        </div>`;

    let html = pagHtml('top-pagination');
    html += `<div class="table-container"><table class="data-table"><thead><tr>`;
    if (esAdmin) {
        html += `<th><input type="checkbox" onclick="seleccionarTodosCheckboxes(this)"></th><th>Fecha</th><th>SKU</th><th>Código de Barras</th><th>Producto</th><th>Categoría</th><th>Color</th><th>Material</th><th>Peso</th><th>Costo</th><th>Margen</th><th>Desc.</th><th>Venta Final</th><th>Ubicación</th><th>Foto</th><th>Etiqueta</th><th>Acciones</th>`;
    } else {
        html += `<th>SKU</th><th>Código de Barras</th><th>Producto</th><th>Color</th><th>Material</th><th>Peso</th><th>Venta Final</th><th>Ubicación</th><th>Foto</th>`;
    }
    html += `</tr></thead><tbody>`;

    productosPagina.forEach(p => {
        let fotoHtml = p.Foto ? `<div class="img-thumbnail-container" onclick="abrirZoomImagen('${p.Foto}')"><img src="${p.Foto}" loading="lazy"></div>` : `💍`;
        let costo = Number(p.Valor_Compra || (Number(p.Valor_Oro || 0) + Number(p.Valor_Piedra || 0))) || 0;
        let margen = Number(p.Porcentaje_Venta || 100);
        let descPct = Number(p.Tiene_Descuento || 0);
        let pesoItem = parseFloat(String(p.Peso || 0).replace(',', '.')) || 0;
        let baseVenta = Number(p.Valor_Piedra || 0) + (pesoItem * valorOroDelDiaCache);
        let precioBase = baseVenta * (1 + (margen / 100));
        let valorVenta = Math.round(precioBase - (precioBase * (descPct / 100)));

        let colorTabla = p.Color || p.ID_Subcategoria || '-';
        let materialTabla = p.Material_Oro || p.Material || '-';
        let codigoBarraVal = p.Codigo_Barra || p.codigo_barra || '-';
        let fotoVal = p.Foto || '';

        let metaArq = `&fecha_arq=${new Date().toISOString().split('T')[0]}&resp_arq=${encodeURIComponent(usuarioActual ? usuarioActual.nombre : '')}`;
        let btnQr = `<td><button class="btn-action btn-qr" onclick="abrirModalEtiqueta('${p.SKU}', '${encodeURIComponent(p.Nombre || '')}', '${codigoBarraVal}', '${encodeURIComponent(fotoVal)}', '${valorVenta}', '${encodeURIComponent(metaArq)}')">🏷️</button></td>`;

        html += `<tr>`;
        if (esAdmin) {
            let fechaLimpia = p.Fecha_Creacion ? String(p.Fecha_Creacion).split('T')[0] : '-';
            let descBadge = descPct > 0 ? `<span class="badge" style="background-color: #ef4444;">${descPct}%</span>` : `0%`;
            let acciones = `<td><div class="btn-action-container"><button class="btn-action btn-edit" onclick="abrirFormularioEditarProducto('${encodeURIComponent(JSON.stringify(p))}')">✏️</button><button class="btn-action btn-delete" onclick="eliminarProducto('${p.SKU}')">🗑️</button></div></td>`;
            html += `<td><input type="checkbox" class="sku-checkbox" value="${p.SKU}"></td><td>${fechaLimpia}</td><td><strong>${p.SKU}</strong></td><td><code>${codigoBarraVal}</code></td><td>${p.Nombre}</td><td>${p.ID_Categoria}</td><td>${colorTabla}</td><td>${materialTabla}</td><td>${pesoItem}g</td><td>$${costo.toLocaleString()}</td><td>${margen}%</td><td>${descBadge}</td><td><strong style="color: #10b981;">$${valorVenta.toLocaleString()}</strong></td><td>${p.ID_Ubicacion}</td><td>${fotoHtml}</td>${btnQr}${acciones}`;
        } else {
            html += `<td><strong>${p.SKU}</strong></td><td><code>${codigoBarraVal}</code></td><td>${p.Nombre}</td><td>${colorTabla}</td><td>${materialTabla}</td><td>${pesoItem}g</td><td><strong style="color: #10b981;">$${valorVenta.toLocaleString()}</strong></td><td>${p.ID_Ubicacion}</td><td>${fotoHtml}</td>`;
        }
        html += `</tr>`;
    });
    html += `</tbody></table></div>`;
    html += pagHtml('bottom-pagination');
    contenedor.innerHTML = html;
}

function abrirModalEtiqueta(sku, nombreEncoded, codigoBarra, fotoEncoded, valorVentaStr, metaEncoded) {
    let metadataArqueo = decodeURIComponent(metaEncoded || '');
    document.getElementById("modalSkuLabel").textContent = `SKU: ${sku} | Barras: ${codigoBarra}`;
    let certUrl = `https://glasas.github.io/MANU/catalogomanu?token=${btoa(sku)}${metadataArqueo}`;
    document.getElementById("imgQrGenerado").src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(certUrl)}`;
    
    try {
        JsBarcode("#barcodeElement", codigoBarra && codigoBarra !== '-' ? codigoBarra : sku, {
            format: "CODE128", lineColor: "#0f172a", width: 1.5, height: 40, displayValue: true, fontSize: 12, margin: 2
        });
    } catch(e) {}

    document.getElementById("modalQrBarra").classList.add("active");
}

function abrirZoomImagen(url) { document.getElementById("imgModalSrc").src = url; document.getElementById("imageModal").classList.add("active"); }
function cerrarZoomImagen() { document.getElementById("imageModal").classList.remove("active"); }
function cerrarModalQr() { document.getElementById("modalQrBarra").classList.remove("active"); }

function descargarQrPNG() {
    let img = document.getElementById("imgQrGenerado");
    if (!img || !img.src) return;
    let a = document.createElement('a'); a.href = img.src; a.download = 'etiqueta_qr_manu.png';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function descargarBarcodePNG() {
    let svg = document.getElementById("barcodeElement");
    if (!svg) return;
    let svgData = new XMLSerializer().serializeToString(svg);
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    let img = new Image();
    img.onload = function() {
        canvas.width = img.width || 300; canvas.height = img.height || 100;
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        let link = document.createElement("a");
        link.href = canvas.toDataURL("image/png"); link.download = "codigo_barras_manu.png";
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
}

async function eliminarProducto(sku) {
    if (!confirm(`¿Eliminar producto SKU [${sku}]?`)) return;
    const res = await API.llamar("eliminarProducto", { action: "eliminarProducto", sku: sku }, "POST");
    if (res && res.status === "success") {
        alert(res.message);
        localStorage.removeItem("cache_productos_manu");
        renderizarModuloProductos(document.getElementById('contentBody'));
    } else {
        alert("Error al eliminar producto.");
    }
}
