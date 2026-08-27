/**
 * MANU JOYEROS - Módulo de Gestión de Productos (productos.js)
 * Versión Íntegra y Completa con SKU Correctamente Codificado para URL
 */

async function renderizarModuloProductos(container) {
    container.innerHTML = `
        <div class="card" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; background: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button type="button" class="btn-action" onclick="abrirModalNuevoProducto()" style="background: #0f172a; color: white; padding: 8px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;">✨ Nuevo Producto</button>
                <button type="button" class="btn-action" onclick="abrirModalImportarExcel()" style="background: #059669; color: white; padding: 8px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;">📁 Importar</button>
                <button type="button" class="btn-action" onclick="exportarProductosCSV()" style="background: #2563eb; color: white; padding: 8px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;">📤 Exportar</button>
                <button type="button" class="btn-action" onclick="window.open('https://glasas.github.io/MANU/catalogomanu', '_blank')" style="background: #d97706; color: white; padding: 8px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;">🌐 Catálogo Web</button>
                <button type="button" class="btn-action" onclick="abrirModalQrCatalogoAdmin()" style="background: #7c3aed; color: white; padding: 8px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;">📱 QR Web</button>
                <button type="button" class="btn-action text-danger" onclick="eliminarProductosSeleccionados()" style="background: #ef4444; color: white; padding: 8px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;">🗑️ Eliminar</button>
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
                            <th style="padding: 10px; width: 30px;"><input type="checkbox" id="selectAllProductos" onclick="toggleSelectAllProductos(this)"></th>
                            <th style="padding: 10px;">Nombre / Descripción</th>
                            <th style="padding: 10px;">Categoría</th>
                            <th style="padding: 10px;">Color</th>
                            <th style="padding: 10px;">Material</th>
                            <th style="padding: 10px;">Peso</th>
                            <th style="padding: 10px;">Costo</th>
                            <th style="padding: 10px;">Margen</th>
                            <th style="padding: 10px;">Desc.</th>
                            <th style="padding: 10px;">Venta Final</th>
                            <th style="padding: 10px;">Ubicación</th>
                            <th style="padding: 10px;">Foto</th>
                            <th style="padding: 10px; text-align: center;">Etiqueta</th>
                            <th style="padding: 10px; text-align: center;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tablaProductosBody">
                        <tr><td colspan="14" style="text-align: center; padding: 30px; color: #64748b;">Cargando inventario...</td></tr>
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
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">SKU *</label>
                            <input type="text" id="prodSku" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Código de Barras</label>
                            <input type="text" id="prodCodigoBarra" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
                        </div>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Nombre / Descripción de la Joya *</label>
                        <input type="text" id="prodNombre" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Categoría</label>
                            <input type="text" id="prodCategoria" placeholder="ANILLOS" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
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
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Costo ($)</label>
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
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">URL Foto</label>
                            <input type="text" id="prodFoto" placeholder="https://..." style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
                        </div>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button type="button" onclick="cerrarModalFormularioProducto()" style="padding: 8px 16px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer;">Cancelar</button>
                        <button type="submit" style="padding: 8px 20px; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">💾 Guardar Producto</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- MODAL ZOOM IMAGEN CON BOTÓN DE CERRAR ROJO ABAJO Y CENTRADO -->
        <div id="imageModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 9999; justify-content: center; align-items: center;" onclick="cerrarZoomImagen()">
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; max-width: 90%; max-height: 90%;" onclick="event.stopPropagation()">
                <img id="imgModalSrc" src="" style="max-width: 100%; max-height: 80vh; border-radius: 8px; border: 2px solid white; object-fit: contain; margin-bottom: 15px;">
                <button type="button" onclick="cerrarZoomImagen()" style="background: #ef4444; color: white; border: none; padding: 10px 25px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.95rem; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">✕ Cerrar</button>
            </div>
        </div>
    `;

    await cargarListaProductos();
}

async function cargarListaProductos() {
    const tbody = document.getElementById("tablaProductosBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="14" style="text-align: center; padding: 30px; color: #64748b;">Sincronizando inventario y valor del oro...</td></tr>`;

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
            tbody.innerHTML = `<tr><td colspan="14" style="text-align: center; padding: 30px; color: #ef4444;">No se pudieron cargar los productos.</td></tr>`;
        }
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="14" style="text-align: center; padding: 30px; color: #ef4444;">Error de conexión con el servidor.</td></tr>`;
    }
}

function renderizarTablaProductosAdmin() {
    const tbody = document.getElementById("tablaProductosBody");
    if (!tbody) return;

    const lista = window.listaProductosFiltradosCache || [];
    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="14" style="text-align: center; padding: 30px; color: #64748b;">No hay productos registrados o coincidentes.</td></tr>`;
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
        let material = p.Material_Oro || p.Material || p.material || "ORO";
        
        let pesoCrudo = p.Peso || p.peso || 0;
        let pesoItem = parseFloat(String(pesoCrudo).replace(',', '.')) || 0;

        let costoItem = Number(p.Costo || p.costo) || 0;
        let valPiedra = Number(p.Valor_Piedra) || 0;
        let margen = Number(p.Porcentaje_Venta) || 100;
        let descPct = Number(p.Tiene_Descuento) || 0;
        let ubicacion = p.ID_Ubicacion || p.ubicacion || "VITRINA";
        let foto = p.Foto || p.foto || "";

        let baseVentaCalculada = valPiedra + (pesoItem * valorOroActual);
        let precioBase = baseVentaCalculada * (1 + (margen / 100));
        let valorVentaFinal = Math.round(precioBase - (precioBase * (descPct / 100)));

        let fotoHtml = foto ? `<img src="${foto}" style="width: 38px; height: 38px; object-fit: cover; border-radius: 6px; cursor: pointer;" onclick="abrirZoomImagenSrc('${foto}')">` : `💍`;
        let descBadge = descPct > 0 ? `<span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">${descPct}%</span>` : `0%`;

        html += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px;"><input type="checkbox" class="check-producto-item" value="${sku}"></td>
                <td style="padding: 10px; max-width: 220px;">
                    <div style="font-weight: 500; color: #0f172a;">${nombre}</div>
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 600; margin-top: 2px;">SKU: ${sku}</div>
                </td>
                <td style="padding: 10px; color: #475569;">${categoria}</td>
                <td style="padding: 10px; color: #475569;">${color}</td>
                <td style="padding: 10px; color: #475569;">${material}</td>
                <td style="padding: 10px;">${pesoItem}g</td>
                <td style="padding: 10px;">$${costoItem.toLocaleString()}</td>
                <td style="padding: 10px;">${margen}%</td>
                <td style="padding: 10px;">${descBadge}</td>
                <td style="padding: 10px; font-weight: bold; color: #059669;">$${valorVentaFinal.toLocaleString()}</td>
                <td style="padding: 10px; color: #64748b;">${ubicacion}</td>
                <td style="padding: 10px;">${fotoHtml}</td>
                <td style="padding: 10px; text-align: center;">
                    <button type="button" onclick="abrirEtiquetaProducto('${sku}', '${nombre.replace(/'/g, "\\'")}', '${valorVentaFinal.toLocaleString()}', '${codigoBarra}')" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 6px; cursor: pointer;" title="Generar Etiqueta QR y Código de Barras">🏷️</button>
                </td>
                <td style="padding: 10px; text-align: center;">
                    <button type="button" onclick="editarProducto('${sku}')" style="background: #0f172a; color: white; border: none; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem;" title="Editar">✏️</button>
                </td>
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
    document.getElementById("modalFormularioProducto").style.display = "flex";
}

function cerrarModalFormularioProducto() {
    document.getElementById("modalFormularioProducto").style.display = "none";
}

async function guardarProductoInventario(event) {
    event.preventDefault();
    const skuOriginal = document.getElementById("prodSkuOriginal").value.trim();
    const sku = document.getElementById("prodSku").value.trim();
    const codigo_barra = document.getElementById("prodCodigoBarra").value.trim();
    const nombre = document.getElementById("prodNombre").value.trim();
    const categoria = document.getElementById("prodCategoria").value.trim();
    const material = document.getElementById("prodMaterial").value.trim();
    const color = document.getElementById("prodColor").value.trim();
    const peso = Number(document.getElementById("prodPeso").value) || 0;
    const valor_piedra = Number(document.getElementById("prodValorPiedra").value) || 0;
    const costo = Number(document.getElementById("prodCosto").value) || 0;
    const porcentaje_venta = Number(document.getElementById("prodMargen").value) || 100;
    const tiene_descuento = Number(document.getElementById("prodDescuento").value) || 0;
    const ubicacion = document.getElementById("prodUbicacion").value.trim();
    const foto = document.getElementById("prodFoto").value.trim();
    const usuario = (typeof usuarioActual !== 'undefined' && usuarioActual) ? usuarioActual.usuario : 'Admin';

    const accionApi = skuOriginal ? "actualizarProducto" : "guardarProducto";

    const res = await API.llamar(accionApi, {
        action: accionApi,
        sku_original: skuOriginal,
        sku: sku,
        codigo_barra: codigo_barra,
        nombre: nombre,
        categoria: categoria,
        material: material,
        color: color,
        peso: peso,
        valor_piedra: valor_piedra,
        costo: costo,
        porcentaje_venta: porcentaje_venta,
        tiene_descuento: tiene_descuento,
        ubicacion: ubicacion,
        foto: foto,
        usuario: usuario
    }, "POST");

    if (res && res.status === "success") {
        alert(res.message || "Operación realizada con éxito.");
        cerrarModalFormularioProducto();
        cargarListaProductos();
    } else {
        alert("Error: " + (res ? res.message : "No se pudo guardar el producto."));
    }
}

function editarProducto(sku) {
    const prod = (window.listaProductosCache || []).find(p => String(p.SKU || p.sku || "").trim().toUpperCase() === sku.toUpperCase());
    if (!prod) {
        alert("No se encontró el producto para editar.");
        return;
    }

    document.getElementById("modalProductoTitulo").textContent = `Editar Producto: ${sku}`;
    document.getElementById("prodSkuOriginal").value = sku;
    document.getElementById("prodSku").value = prod.SKU || prod.sku || "";
    document.getElementById("prodCodigoBarra").value = prod.Codigo_Barra || prod.codigo_barra || "";
    document.getElementById("prodNombre").value = prod.Nombre || prod.nombre || "";
    document.getElementById("prodCategoria").value = prod.ID_Categoria || prod.categoria || "";
    document.getElementById("prodMaterial").value = prod.Material_Oro || prod.Material || prod.material || "";
    document.getElementById("prodColor").value = prod.Color || prod.color || "";
    document.getElementById("prodPeso").value = prod.Peso || prod.peso || 0;
    document.getElementById("prodValorPiedra").value = prod.Valor_Piedra || prod.valor_piedra || 0;
    document.getElementById("prodCosto").value = prod.Costo || prod.costo || 0;
    document.getElementById("prodMargen").value = prod.Porcentaje_Venta || prod.porcentaje_venta || 100;
    document.getElementById("prodDescuento").value = prod.Tiene_Descuento || prod.tiene_descuento || 0;
    document.getElementById("prodUbicacion").value = prod.ID_Ubicacion || prod.ubicacion || "";
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

    let skusAEliminar = Array.from(checks).map(cb => cb.value);
    
    for (let sku of skusAEliminar) {
        await API.llamar("eliminarProducto", { action: "eliminarProducto", sku: sku }, "POST");
    }

    alert("Productos eliminados correctamente.");
    cargarListaProductos();
}

function exportarProductosCSV() {
    alert("Función de exportación CSV activa.");
}

function abrirModalImportarExcel() {
    alert("Módulo de importación activo.");
}

function abrirModalQrCatalogoAdmin() {
    alert("Módulo QR de Catálogo activo.");
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

// ================= MÓDULO: ETIQUETAS (QR CON LINK WEB CODIFICADO Y BARRAS) =================

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
    
    // URL del catálogo web con el SKU debidamente codificado mediante encodeURIComponent
    const linkWebProducto = `https://glasas.github.io/MANU/catalogomanu?sku=${encodeURIComponent(sku)}`;
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(linkWebProducto)}`;
    const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(valorBarras)}&scale=3&height=12&includetext=true`;

    modalDiv.innerHTML = `
        <div style="background:white; padding:25px; border-radius:12px; text-align:center; max-width:360px; width:90%; box-shadow:0 20px 25px -5px rgba(0,0,0,0.3);">
            <h4 style="color:#0f172a; margin-bottom:5px;">MANU JOYEROS</h4>
            <p style="font-size:0.75rem; color:#64748b; margin-bottom:15px;">SKU: <strong id="lblSkuEtiqueta">${sku}</strong></p>
            <p style="font-size:0.85rem; font-weight:600; color:#1e293b; margin-bottom:15px; max-height:40px; overflow:hidden;">${nombre}</p>
            
            <div style="display:flex; justify-content:space-around; align-items:center; margin-bottom:15px;">
                <div>
                    <img id="imgQrCanvas" src="${qrUrl}" crossorigin="anonymous" alt="QR Web" style="width:110px; height:110px; border:1px solid #e2e8f0; padding:3px; border-radius:6px;" />
                    <span style="display:block; font-size:0.65rem; color:#64748b; margin-top:2px;">QR Catálogo Web</span>
                </div>
                <div>
                    <img id="imgBarcodeCanvas" src="${barcodeUrl}" crossorigin="anonymous" alt="Código de Barras" style="width:140px; height:60px; object-fit:contain;" />
                    <span style="display:block; font-size:0.65rem; color:#64748b; margin-top:2px;">${valorBarras}</span>
                </div>
            </div>

            <p style="font-size:1rem; font-weight:bold; color:#d97706; margin-bottom:15px;">Ref: ${sku}</p>

            <div style="display:flex; flex-direction:column; gap:8px;">
                <div style="display:flex; gap:8px;">
                    <button onclick="descargarImagenPng('imgQrCanvas', 'QR_Web_${sku}.png')" style="flex:1; padding:8px; background:#0284c7; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:0.8rem;">📥 Descargar QR</button>
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

function generarQrBarraAdmin(sku) {
    const prod = (window.listaProductosCache || []).find(p => String(p.SKU || p.sku || "").trim().toUpperCase() === sku.toUpperCase());
    if (prod) {
        let nombre = prod.Nombre || prod.nombre || "";
        let codigoBarra = prod.Codigo_Barra || prod.codigo_barra || sku;
        let costo = Number(prod.Costo || prod.costo) || 0;
        abrirEtiquetaProducto(sku, nombre, costo.toLocaleString(), codigoBarra);
    } else {
        abrirEtiquetaProducto(sku, "Joya MANU JOYEROS", "0", sku);
    }
}
