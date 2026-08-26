/**
 * MANU JOYEROS - Módulo de Proveedores (proveedores.js)
 */

async function renderizarModuloProveedores(container) {
    const esAdmin = usuarioActual && (usuarioActual.rol.toUpperCase() === 'ADMIN' || usuarioActual.rol.toUpperCase() === 'ADMINISTRADOR');
    let btnNuevo = esAdmin ? `<button class="btn-nuevo-producto" onclick="abrirFormularioNuevoProveedor()">🏢 + Nuevo Proveedor</button>` : '';

    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="color: #0f172a; margin: 0;">🏢 Gestión de Proveedores y Talleres</h3>
                ${btnNuevo}
            </div>
            <div id="tablaProveedoresContenedor">Cargando proveedores...</div>
        </div>`;

    const res = await API.llamar("obtenerProveedores", {}, "GET");
    const contenedor = document.getElementById("tablaProveedoresContenedor");
    if (res && res.status === "success") {
        let html = `<div class="table-container"><table class="data-table"><thead><tr><th>NIT</th><th>Nombre</th><th>Contacto</th><th>Teléfono</th><th>Email</th><th>Especialidad</th>`;
        if (esAdmin) html += `<th>Acciones</th>`;
        html += `</tr></thead><tbody>`;

        res.data.forEach(p => {
            let provJson = encodeURIComponent(JSON.stringify(p));
            html += `<tr><td><strong>${p.NIT}</strong></td><td><strong style="color: #d97706;">${p.Nombre}</strong></td><td>${p.Contacto||'-'}</td><td>${p.Telefono}</td><td>${p.Email||'-'}</td><td>${p.Especialidad}</td>`;
            if (esAdmin) {
                html += `<td><div class="btn-action-container"><button class="btn-action btn-edit" onclick="abrirFormularioEditarProveedor('${provJson}')">✏️</button><button class="btn-action btn-delete" onclick="eliminarProveedor('${p.NIT}')">🗑️</button></div></td>`;
            }
            html += `</tr>`;
        });
        html += `</tbody></table></div>`;
        contenedor.innerHTML = html;
    } else {
        contenedor.innerHTML = `<p style="color: #ef4444;">Error al cargar proveedores.</p>`;
    }
}

async function eliminarProveedor(nit) {
    if (!confirm(`¿Eliminar proveedor NIT [${nit}]?`)) return;
    const res = await API.llamar("eliminarProveedor", { action: "eliminarProveedor", nit: nit }, "POST");
    if (res && res.status === "success") { alert(res.message); cambiarVista('proveedores'); }
    else { alert("Error al eliminar."); }
}