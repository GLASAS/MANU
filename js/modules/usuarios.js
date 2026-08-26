/**
 * MANU JOYEROS - Módulo de Usuarios (usuarios.js)
 */

async function renderizarModuloUsuarios(container) {
    const esAdmin = usuarioActual && (usuarioActual.rol.toUpperCase() === 'ADMIN' || usuarioActual.rol.toUpperCase() === 'ADMINISTRADOR');
    let btnNuevo = esAdmin ? `<button class="btn-nuevo-producto" onclick="abrirFormularioNuevoUsuario()">👤 + Nuevo Usuario</button>` : '';

    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="color: #0f172a; margin: 0;">👤 Gestión de Usuarios y Accesos</h3>
                ${btnNuevo}
            </div>
            <div id="vistaUsuariosInterna">Cargando usuarios...</div>
        </div>`;

    const res = await API.llamar("obtenerUsuarios", {}, "GET");
    const contenedor = document.getElementById("vistaUsuariosInterna");
    if (res && res.status === "success") {
        let html = `<div class="table-container"><table class="data-table"><thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Vencimiento</th><th>Estado</th>`;
        if (esAdmin) html += `<th>Acciones</th>`;
        html += `</tr></thead><tbody>`;

        res.data.forEach(u => {
            let uJson = encodeURIComponent(JSON.stringify(u));
            html += `<tr><td><strong>${u.Usuario}</strong></td><td>${u.Nombre}</td><td>${u.Rol}</td><td>${String(u.Fecha_Vencimiento||'').split('T')[0]}</td><td><span class="badge" style="background:${u.Estado==='ACTIVO'?'#10b981':'#ef4444'};">${u.Estado}</span></td>`;
            if (esAdmin) {
                html += `<td><div class="btn-action-container"><button class="btn-action btn-edit" onclick="abrirFormularioEditarUsuario('${uJson}')">✏️</button><button class="btn-action btn-delete" onclick="eliminarUsuario('${u.Usuario}')">🗑️</button></div></td>`;
            }
            html += `</tr>`;
        });
        html += `</tbody></table></div>`;
        contenedor.innerHTML = html;
    } else {
        contenedor.innerHTML = `<p style="color: #ef4444;">Error al cargar usuarios.</p>`;
    }
}

async function eliminarUsuario(usu) {
    if (usu.toLowerCase() === usuarioActual.usuario.toLowerCase()) { alert("No puedes eliminar tu propio usuario activo."); return; }
    if (!confirm(`¿Eliminar usuario [${usu}]?`)) return;
    const res = await API.llamar("eliminarUsuario", { action: "eliminarUsuario", usuario: usu }, "POST");
    if (res && res.status === "success") { alert(res.message); renderizarModuloUsuarios(document.getElementById('contentBody')); }
    else { alert("Error al eliminar."); }
}