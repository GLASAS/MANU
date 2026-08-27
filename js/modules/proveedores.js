/**
 * MANU JOYEROS - Módulo de Proveedores (proveedores.js)
 */

async function renderizarModuloProveedores(container) {
    container.innerHTML = `
        <div class="card">
            <h3 style="color: #0f172a; margin-bottom: 0.5rem; font-size: 1.1rem;">🏢 Gestión de Proveedores</h3>
            <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 1.25rem;">Administre los proveedores de oro y suministros para la alta joyería.</p>
            
            <div style="display: flex; gap: 10px; margin-bottom: 1.25rem;">
                <button class="btn-modern btn-primary-action" onclick="abrirModalProveedor()">➕ Nuevo Proveedor</button>
            </div>

            <div id="tablaProveedoresContainer"><p style="text-align: center; color: #64748b; padding: 2rem;">Cargando proveedores...</p></div>
        </div>

        <!-- MODAL PROVEEDOR -->
        <div class="image-modal" id="modalProveedor" onclick="cerrarModalProveedor()">
            <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 450px; width: 95%; color: #0f172a;" onclick="event.stopPropagation()">
                <h3 id="tituloModalProv" style="margin-bottom: 1rem;">🏢 Registrar Proveedor</h3>
                <form onsubmit="guardarProveedor(event)">
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="display:block; font-size:0.85rem; font-weight:500; margin-bottom:4px;">Nombre / Empresa *</label>
                        <input type="text" id="provNombre" required style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="display:block; font-size:0.85rem; font-weight:500; margin-bottom:4px;">Contacto / Teléfono</label>
                        <input type="text" id="provTelefono" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <label style="display:block; font-size:0.85rem; font-weight:500; margin-bottom:4px;">Dirección / Ciudad</label>
                        <input type="text" id="provDireccion" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" style="flex: 1; background-color: #0f172a; color: white; border: none; padding: 0.75rem; border-radius: 8px; font-weight: 500; cursor: pointer;">Guardar</button>
                        <button type="button" onclick="cerrarModalProveedor()" style="flex: 1; background-color: #ef4444; color: white; border: none; padding: 0.75rem; border-radius: 8px; font-weight: 500; cursor: pointer;">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>`;

    await cargarListaProveedores();
}

let listaProveedoresCache = [];

async function cargarListaProveedores() {
    const contenedor = document.getElementById("tablaProveedoresContainer");
    const res = await API.llamar("obtenerProveedores", {}, "GET");
    if (res && res.status === "success") {
        listaProveedoresCache = res.data || [];
        renderizarTablaProveedores(listaProveedoresCache);
    } else {
        contenedor.innerHTML = `<p style="color: #ef4444; text-align: center;">No hay proveedores registrados.</p>`;
    }
}

function renderizarTablaProveedores(data) {
    const contenedor = document.getElementById("tablaProveedoresContainer");
    if (!data || data.length === 0) {
        contenedor.innerHTML = `<p style="color: #64748b; text-align: center; padding: 2rem;">No hay registros de proveedores.</p>`;
        return;
    }

    let html = `<div class="table-container"><table class="data-table"><thead><tr>
        <th>ID</th><th>Nombre / Empresa</th><th>Teléfono</th><th>Dirección</th><th>Acciones</th>
    </tr></thead><tbody>`;

    data.forEach(p => {
        let idProv = p.ID || p.id || '';
        let nombreProv = p.Nombre || p.nombre || '';
        let telProv = p.Telefono || p.telefono || '';
        let dirProv = p.Direccion || p.direccion || '';

        html += `<tr>
            <td>${idProv}</td>
            <td><strong>${nombreProv}</strong></td>
            <td>${telProv}</td>
            <td>${dirProv}</td>
            <td><button class="btn-action" onclick="eliminarProveedor('${idProv}')" style="background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Eliminar</button></td>
        </tr>`;
    });

    html += `</tbody></table></div>`;
    contenedor.innerHTML = html;
}

function abrirModalProveedor() {
    document.getElementById("provNombre").value = "";
    document.getElementById("provTelefono").value = "";
    document.getElementById("provDireccion").value = "";
    document.getElementById("modalProveedor").classList.add("active");
}

function cerrarModalProveedor() {
    document.getElementById("modalProveedor").classList.remove("active");
}

async function guardarProveedor(e) {
    e.preventDefault();
    let nombre = document.getElementById("provNombre").value.trim();
    let telefono = document.getElementById("provTelefono").value.trim();
    let direccion = document.getElementById("provDireccion").value.trim();

    cerrarModalProveedor();

    const res = await API.llamar("crearProveedor", {
        action: "crearProveedor",
        nombre: nombre,
        telefono: telefono,
        direccion: direccion
    }, "POST");

    if (res && res.status === "success") {
        alert(res.message);
        await cargarListaProveedores();
    } else {
        alert("Error al registrar proveedor.");
    }
}

async function eliminarProveedor(id) {
    if (!confirm("¿Está seguro de eliminar este proveedor?")) return;
    const res = await API.llamar("eliminarProveedor", { action: "eliminarProveedor", id: id }, "POST");
    if (res && res.status === "success") {
        alert(res.message);
        await cargarListaProveedores();
    } else {
        alert("Error al eliminar.");
    }
}
