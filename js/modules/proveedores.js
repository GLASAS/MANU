/**
 * MANU JOYEROS - Módulo de Proveedores (proveedores.js)
 */

async function renderizarModuloProveedores(container) {
    const esAdmin = usuarioActual && (usuarioActual.rol.toUpperCase() === 'ADMIN' || usuarioActual.rol.toUpperCase() === 'ADMINISTRADOR');
    let btnNuevo = esAdmin ? `<button class="btn-nuevo-producto" onclick="abrirFormularioNuevoProveedor()">🏢 + Nuevo Proveedor</button>` : '';

    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap:wrap; gap:10px;">
                <h3 style="color: #0f172a; margin: 0;">🏢 Gestión de Proveedores y Talleres</h3>
                ${btnNuevo}
            </div>
            <div id="tablaProveedoresContenedor">Cargando proveedores...</div>
        </div>`;

    const res = await API.llamar("obtenerProveedores", {}, "GET");
    const contenedor = document.getElementById("tablaProveedoresContenedor");
    if (res && res.status === "success" && res.data) {
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
        contenedor.innerHTML = `<p style="color: #64748b; text-align: center; padding: 2rem;">No hay proveedores registrados.</p>`;
    }
}

function abrirFormularioNuevoProveedor() {
    let nit = prompt("NIT del Proveedor / Taller:");
    if (!nit) return;
    let nombre = prompt("Nombre de la Empresa o Taller:");
    if (!nombre) return;
    let contacto = prompt("Nombre del Contacto:", "") || "";
    let tel = prompt("Teléfono:", "") || "";
    let email = prompt("Email:", "") || "";
    let esp = prompt("Especialidad (Ej: Fundición, Engaste, Montura):", "Joyería General") || "";

    guardarProveedorServidor({ action: "guardarProveedor", nit: nit.trim(), nombre: nombre.trim(), contacto: contacto, telefono: tel, email: email, especialidad: esp });
}

function abrirFormularioEditarProveedor(jsonStr) {
    let p = JSON.parse(decodeURIComponent(jsonStr));
    let nombre = prompt("Editar Nombre:", p.Nombre);
    if (!nombre) return;
    let contacto = prompt("Editar Contacto:", p.Contacto || "") || "";
    let tel = prompt("Editar Teléfono:", p.Telefono || "") || "";
    let email = prompt("Editar Email:", p.Email || "") || "";
    let esp = prompt("Editar Especialidad:", p.Especialidad || "") || "";

    guardarProveedorServidor({ action: "guardarProveedor", nit: p.NIT, nombre: nombre.trim(), contacto: contacto, telefono: tel, email: email, especialidad: esp });
}

async function guardarProveedorServidor(data) {
    const res = await API.llamar("guardarProveedor", data, "POST");
    if (res && res.status === "success") {
        alert(res.message);
        renderizarModuloProveedores(document.getElementById('contentBody'));
    } else {
        alert("Error al guardar proveedor.");
    }
}

async function eliminarProveedor(nit) {
    if (!confirm(`¿Eliminar proveedor NIT [${nit}]?`)) return;
    const res = await API.llamar("eliminarProveedor", { action: "eliminarProveedor", nit: nit }, "POST");
    if (res && res.status === "success") { alert(res.message); renderizarModuloProveedores(document.getElementById('contentBody')); }
    else { alert("Error al eliminar."); }
}
