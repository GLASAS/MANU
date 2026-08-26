/**
 * MANU JOYEROS - Módulo de Productos (productos.js)
 */

async function renderizarModuloProductos(container) {
    await cargarCategoriasDinamicas();
    await cargarMaterialesDinamicos();
    await cargarColoresDinamicos();
    await cargarValorOroDia();

    const esAdmin = usuarioActual && (usuarioActual.rol.toUpperCase() === 'ADMIN' || usuarioActual.rol.toUpperCase() === 'ADMINISTRADOR');
    let botonesAccionHtml = esAdmin ? `
        <button class="btn-nuevo-producto" onclick="abrirFormularioNuevoProducto()">✨ + Nuevo</button>
        <button class="btn-nuevo-producto" style="background: linear-gradient(135deg, #059669 0%, #047857 100%);" onclick="abrirModalImportarCSV()">📂 Importar CSV</button>
        <button class="btn-nuevo-producto" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);" onclick="exportarCatalogoCSV()">📥 Exportar Todo</button>
        <a href="https://glasas.github.io/MANU_JOYEROS/catalogomanu" target="_blank" class="btn-nuevo-producto" style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); text-decoration: none;">🌐 Catálogo Web</a>
        <button class="btn-nuevo-producto" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);" onclick="abrirModalQrCatalogo()">📱 QR Catálogo</button>
        <button class="btn-nuevo-producto" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);" onclick="eliminarProductosSeleccionados()">🗑️ Eliminar</button>
    ` : `
        <a href="https://glasas.github.io/MANU_JOYEROS/catalogomanu" target="_blank" class="btn-nuevo-producto" style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); text-decoration: none;">🌐 Catálogo Web</a>
        <button class="btn-nuevo-producto" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);" onclick="abrirModalQrCatalogo()">📱 QR Catálogo</button>
    `;

    container.innerHTML = `
        <div class="card">
            <h3 style="color: #0f172a; margin-bottom: 0.5rem;">Catálogo de Productos y Joyas</h3>
            <div class="catalog-toolbar">
                ${botonesAccionHtml}
                <button class="btn-discreet-refresh" onclick="forzarRecargaCatalogo()" title="Actualizar Datos">🔄</button>
                <div class="search-expandable-box" id="searchExpandableBox" onclick="expandirBuscador()">
                    <button type="button" class="search-expandable-icon" title="Buscar en catálogo">🔍</button>
                    <input type="text" id="inputBuscadorCatalogo" class="search-expandable-input" placeholder="Buscar por SKU, Código de Barras, Nombre..." oninput="filtrarCatalogoEnVivo()">
                </div>
            </div>
            <div id="vistaProductosInterna"><p style="text-align: center; color: #64748b; padding: 2rem;">Cargando inventario...</p></div>
        </div>`;
    await cargarListaProductos(false);
}

function exportarCatalogoCSV() {
    if (!listaProductosFiltradosCache || listaProductosFiltradosCache.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "SKU;Nombre;Categoria;Color;Material;Peso;Valor_Oro;Valor_Piedra;Porcentaje_Venta;Tiene_Descuento;Ubicacion;Codigo_Barra;Estado\n";

    listaProductosFiltradosCache.forEach(p => {
        let sku = p.SKU || "";
        let nombre = `"${(p.Nombre || "").replace(/"/g, '""')}"`;
        let cat = p.ID_Categoria || "";
        let color = p.Color || p.ID_Subcategoria || "";
        let mat = p.Material_Oro || p.Material || p.material || p.ID_Proveedor || "";
        let peso = p.Peso || p.peso || "0";
        let vOro = p.Valor_Oro || "0";
        let vPiedra = p.Valor_Piedra || "0";
        let margen = p.Porcentaje_Venta || "100";
        let desc = p.Tiene_Descuento || "0";
        let ubicacion = p.ID_Ubicacion || "";
        let codigoBarra = p.Codigo_Barra || "";
        let estadoItem = p.Estado || p.estado || "DISPONIBLE";

        csvContent += [sku, nombre, cat, color, mat, peso, vOro, vPiedra, margen, desc, ubicacion, codigoBarra, estadoItem].join(";") + "\n";
    });

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "catalogo_manu_joyeros_exportado.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function abrirModalImportarCSV() {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = e => {
        let archivo = e.target.files[0];
        let lector = new FileReader();
        lector.onload = async function(event) {
            let texto = event.target.result;
            let lineas = texto.split(/\r\n|\n/);
            let productosArray = [];

            for (let i = 1; i < lineas.length; i++) {
                let linea = lineas[i].trim();
                if (!linea) continue;
                let cols = linea.split(';');
                if (cols.length >= 2) {
                    let matCSV = cols[2] ? cols[2].replace(/"/g, '').trim() : 'ORO';
                    let piedraCSV = cols[3] ? cols[3].trim() : '';
                    let colorCSV = cols[4] ? cols[4].trim() : 'AMARILLO';
                    let pesoCSV = cols[5] && cols[5].trim() !== "" ? cols[5].trim() : '0';
                    
                    let limpiarValor = (val) => {
                        if (!val) return 0;
                        let s = String(val).replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.').trim();
                        return parseFloat(s) || 0;
                    };

                    let valOroCSV = limpiarValor(cols[6]);
                    let valPiedraCSV = limpiarValor(cols[7]);
                    let costoTotalCSV = valOroCSV + valPiedraCSV;

                    productosArray.push({
                        nombre: cols[0] ? cols[0].replace(/"/g, '').trim() : '',
                        categoria: cols[1] ? cols[1].trim() : 'ANILLOS',
                        material: matCSV,
                        Material_Oro: matCSV,
                        Material: matCSV,
                        ID_Proveedor: matCSV,
                        piedra: piedraCSV,
                        color: colorCSV,
                        ID_Subcategoria: colorCSV,
                        peso: pesoCSV,
                        valor_oro: valOroCSV,
                        valor_piedra: valPiedraCSV,
                        valor_compra: costoTotalCSV,
                        porcentaje_venta: cols[8] && cols[8].trim() !== "" ? parseFloat(cols[8]) || 100 : 100,
                        tiene_descuento: cols[9] && cols[9].trim() !== "" ? parseFloat(cols[9]) || 0 : 0,
                        ubicacion: cols[10] ? cols[10].trim() : 'VITRINA 1',
                        estado: 'DISPONIBLE'
                    });
                }
            }

            if (productosArray.length === 0) {
                alert("El archivo CSV no contiene registros válidos.");
                return;
            }

            if (confirm(`Se detectaron ${productosArray.length} productos. ¿Desea importarlos masivamente?`)) {
                document.getElementById("vistaProductosInterna").innerHTML = `<div style="text-align: center; padding: 3rem;"><h3 style="color: #3b82f6;">⏳ Importando ${productosArray.length} productos masivamente...</h3></div>`;
                const res = await API.llamar("importarMasivoProductos", { action: "importarMasivoProductos", productos: productosArray }, "POST");
                if (res && res.status === "success") {
                    alert(res.message);
                    localStorage.removeItem("cache_productos_manu");
                    renderizarModuloProductos(document.getElementById('contentBody'));
                } else {
                    alert("Error en la importación: " + (res ? res.message : "Desconocido"));
                    renderizarModuloProductos(document.getElementById('contentBody'));
                }
            }
        };
        lector.readAsText(archivo, 'ISO-8859-1');
    };
    input.click();
}

function seleccionarTodosCheckboxes(source) {
    const checkboxes = document.querySelectorAll('.sku-checkbox');
    checkboxes.forEach(cb => cb.checked = source.checked);
}

async function eliminarProductosSeleccionados() {
    const checkboxes = document.querySelectorAll('.sku-checkbox:checked');
    if (checkboxes.length === 0) {
        alert("Por favor seleccione al menos un producto para eliminar.");
        return;
    }
    if (!confirm(`¿Está seguro de eliminar los ${checkboxes.length} productos seleccionados?`)) return;

    let skusAEliminar = Array.from(checkboxes).map(cb => cb.value);
    const res = await API.llamar("eliminarMasivoProductos", { action: "eliminarMasivoProductos", skus: skusAEliminar }, "POST");
    if (res && res.status === "success") {
        alert(res.message);
        localStorage.removeItem("cache_productos_manu");
        renderizarModuloProductos(document.getElementById('contentBody'));
    } else {
        alert("Error al eliminar.");
    }
}

function expandirBuscador() {
    const box = document.getElementById("searchExpandableBox");
    box.classList.add("expanded");
    document.getElementById("inputBuscadorCatalogo").focus();
}

async function forzarRecargaCatalogo() {
    localStorage.removeItem("cache_productos_manu");
    localStorage.removeItem("cache_productos_tiempo");
    await cargarListaProductos(true);
}

async function cargarListaProductos(forzarRed = false) {
    const contenedor = document.getElementById("vistaProductosInterna");
    let productos = null;
    const cacheGuardada = localStorage.getItem("cache_productos_manu");
    const tiempoCache = localStorage.getItem("cache_productos_tiempo");
    const ahora = new Date().getTime();

    if (!forzarRed && cacheGuardada && tiempoCache && (ahora - tiempoCache < 300000)) {
        try { productos = JSON.parse(cacheGuardada); } catch(e) { productos = null; }
    }

    if (!productos) {
        const res = await API.llamar("obtenerProductos", {}, "GET");
        if (res && res.status === "success") {
            productos = res.data;
            localStorage.setItem("cache_productos_manu", JSON.stringify(productos));
            localStorage.setItem("cache_productos_tiempo", ahora);
        } else {
            contenedor.innerHTML = `<p style="color: #ef4444; text-align: center;">Error al cargar el inventario.</p>`;
            return;
        }
    }

    listaProductosCache = (productos || []).filter(p => {
        let estadoProd = String(p.Estado || p.estado || "DISPONIBLE").trim().toUpperCase();
        return estadoProd.includes("DISPONIBLE");
    });

    listaProductosFiltradosCache = listaProductosCache;
    paginaActual = 1;
    renderizarTablaProductosPaginada();
}

function filtrarCatalogoEnVivo() {
    const query = document.getElementById("inputBuscadorCatalogo").value.toLowerCase().trim();
    if (!query) {
        listaProductosFiltradosCache = listaProductosCache;
        paginaActual = 1;
        renderizarTablaProductosPaginada();
        return;
    }
    const terminos = query.split(/\s+/);
    listaProductosFiltradosCache = listaProductosCache.filter(p => {
        const sku = String(p.SKU || p.sku || "").toLowerCase();
        const nombre = String(p.Nombre || p.nombre || "").toLowerCase();
        const categoria = String(p.ID_Categoria || "").toLowerCase();
        const material = String(p.Material_Oro || p.Material || "").toLowerCase();
        const color = String(p.Color || "").toLowerCase();
        const ubicacion = String(p.ID_Ubicacion || "").toLowerCase();
        const codigoBarra = String(p.Codigo_Barra || "").toLowerCase();
        return terminos.every(t => sku.includes(t) || codigoBarra.includes(t) || nombre.includes(t) || categoria.includes(t) || material.includes(t) || color.includes(t) || ubicacion.includes(t));
    });
    paginaActual = 1;
    renderizarTablaProductosPaginada();
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
        html += `<th><input type="checkbox" onclick="seleccionarTodosCheckboxes(this)"></th><th>Fecha</th><th>SKU</th><th>Producto</th><th>Categoría</th><th>Color</th><th>Material</th><th>Peso</th><th>Costo</th><th>Margen</th><th>Desc.</th><th>Venta Final</th><th>Ubicación</th><th>Foto</th><th>Etiqueta</th><th>Acciones</th>`;
    } else {
        html += `<th>SKU</th><th>Producto</th><th>Color</th><th>Material</th><th>Peso</th><th>Venta Final</th><th>Ubicación</th><th>Foto</th>`;
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
        let codigoBarraVal = p.Codigo_Barra || '7700000000000';
        let fotoVal = p.Foto || '';

        let fechaArqueoLink = document.getElementById("arqFechaInput") ? document.getElementById("arqFechaInput").value : new Date().toISOString().split('T')[0];
        let respArqueoLink = document.getElementById("arqResponsableInput") ? document.getElementById("arqResponsableInput").value : (usuarioActual ? usuarioActual.nombre : '');
        let auditadoALink = document.getElementById("arqAuditadoAInput") ? document.getElementById("arqAuditadoAInput").value : '';
        let metaArq = `&fecha_arq=${encodeURIComponent(fechaArqueoLink)}&resp_arq=${encodeURIComponent(respArqueoLink)}&auditado_a=${encodeURIComponent(auditadoALink)}`;

        let btnQr = `<td><button class="btn-action btn-qr" onclick="abrirModalEtiqueta('${p.SKU}', '${encodeURIComponent(p.Nombre || '')}', '${codigoBarraVal}', '${encodeURIComponent(fotoVal)}', '${valorVenta}', '${encodeURIComponent(metaArq)}')">🏷️</button></td>`;

        html += `<tr>`;
        if (esAdmin) {
            let fechaLimpia = p.Fecha_Creacion ? String(p.Fecha_Creacion).split('T')[0] : '-';
            let descBadge = descPct > 0 ? `<span class="badge" style="background-color: #ef4444;">${descPct}%</span>` : `0%`;
            let acciones = `<td><div class="btn-action-container"><button class="btn-action btn-edit" onclick="abrirFormularioEditarProducto('${encodeURIComponent(JSON.stringify(p))}')">✏️</button><button class="btn-action btn-delete" onclick="eliminarProducto('${p.SKU}')">🗑️</button></div></td>`;
            html += `<td><input type="checkbox" class="sku-checkbox" value="${p.SKU}"></td><td>${fechaLimpia}</td><td><strong>${p.SKU}</strong></td><td>${p.Nombre}</td><td>${p.ID_Categoria}</td><td>${colorTabla}</td><td>${materialTabla}</td><td>${pesoItem}g</td><td>$${costo.toLocaleString()}</td><td>${margen}%</td><td>${descBadge}</td><td><strong style="color: #10b981;">$${valorVenta.toLocaleString()}</strong></td><td>${p.ID_Ubicacion}</td><td>${fotoHtml}</td>${btnQr}${acciones}`;
        } else {
            html += `<td><strong>${p.SKU}</strong></td><td>${p.Nombre}</td><td>${colorTabla}</td><td>${materialTabla}</td><td>${pesoItem}g</td><td><strong style="color: #10b981;">$${valorVenta.toLocaleString()}</strong></td><td>${p.ID_Ubicacion}</td><td>${fotoHtml}</td>`;
        }
        html += `</tr>`;
    });
    html += `</tbody></table></div>`;
    html += pagHtml('bottom-pagination');
    contenedor.innerHTML = html;
}

function abrirModalEtiqueta(sku, nombreEncoded, codigoBarra, fotoEncoded, valorVentaStr, metaEncoded) {
    let metadataArqueo = decodeURIComponent(metaEncoded || '');
    document.getElementById("modalSkuLabel").textContent = `SKU: ${sku}`;
    let certUrl = `https://glasas.github.io/MANU_JOYEROS/cert.html?token=${btoa(sku)}${metadataArqueo}`;
    document.getElementById("imgQrGenerado").src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(certUrl)}`;
    document.getElementById("modalQrBarra").classList.add("active");
}

function abrirZoomImagen(url) { document.getElementById("imgModalSrc").src = url; document.getElementById("imageModal").classList.add("active"); }
function cerrarZoomImagen() { document.getElementById("imageModal").classList.remove("active"); }
function cerrarModalQr() { document.getElementById("modalQrBarra").classList.remove("active"); }