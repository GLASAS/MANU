/**
 * MANU JOYEROS - Módulo de Usuarios (usuarios.js)
 */

async function renderizarModuloUsuarios(container) {
    const esAdmin = usuarioActual && (usuarioActual.rol.toUpperCase() === 'ADMIN' || usuarioActual.rol.toUpperCase() === 'ADMINISTRADOR');
    let btnNuevo = esAdmin ? `<button class="btn-nuevo-producto" onclick="abrirFormularioNuevoUsuario()">👤 + Nuevo Usuario</button>` : '';

    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap:wrap; gap:10px;">
                <h3 style="color: #0f172a; margin: 0;">👤 Gestión de Usuarios y Accesos</h3>
                ${btnNuevo}
            </div>
            <div id="vistaUsuariosInterna">Cargando usuarios...</div>
        </div>`;

    const res = await API.llamar("obtenerUsuarios", {}, "GET");
    const contenedor = document.getElementById("vistaUsuariosInterna");
    if (res && res.status === "success" && res.data) {
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

function abrirFormularioNuevoUsuario() {
    let usu = prompt("Nombre de Usuario (Login):");
    if (!usu) return;
    let nom = prompt("Nombre Completo:");
    if (!nom) return;
    let pass = prompt("Contraseña:");
    if (!pass) return;
    let rol = prompt("Rol (ADMINISTRADOR / VENDEDOR):", "VENDEDOR").toUpperCase();
    let venc = prompt("Fecha de Vencimiento (YYYY-MM-DD):", "2100-12-31");

    guardarUsuarioServidor({ action: "guardarUsuario", usuario: usu.trim().toUpperCase(), nombre: nom, password: pass, rol: rol, fecha_vencimiento: venc, estado: "ACTIVO" });
}

function abrirFormularioEditarUsuario(jsonStr) {
    let u = JSON.parse(decodeURIComponent(jsonStr));
    let nom = prompt("Editar Nombre Completo:", u.Nombre);
    if (!nom) return;
    let pass = prompt("Nueva Contraseña (dejar en blanco para no cambiar):", "") || "";
    let rol = prompt("Editar Rol (ADMINISTRADOR / VENDEDOR):", u.Rol).toUpperCase();
    let estado = prompt("Estado (ACTIVO / INACTIVO):", u.Estado || "ACTIVO").toUpperCase();

    let payload = { action: "guardarUsuario", usuario: u.Usuario, nombre: nom, rol: rol, estado: estado, fecha_vencimiento: u.Fecha_Vencimiento || "2100-12-31" };
    if (pass) payload.password = pass;

    guardarUsuarioServidor(payload);
}

async function guardarUsuarioServidor(data) {
    const res = await API.llamar("guardarUsuario", data, "POST");
    if (res && res.status === "success") {
        alert(res.message);
        renderizarModuloUsuarios(document.getElementById('contentBody'));
    } else {
        alert("Error al guardar usuario: " + (res ? res.message : ""));
    }
}

async function eliminarUsuario(usu) {
    if (usu.toLowerCase() === usuarioActual.usuario.toLowerCase()) { alert("No puedes eliminar tu propio usuario activo."); return; }
    if (!confirm(`¿Eliminar usuario [${usu}]?`)) return;
    const res = await API.llamar("eliminarUsuario", { action: "eliminarUsuario", usuario: usu }, "POST");
    if (res && res.status === "success") { alert(res.message); renderizarModuloUsuarios(document.getElementById('contentBody')); }
    else { alert("Error al eliminar."); }
}

// Módulo Cambiar Contraseña autónomo
async function renderizarModuloCambiarPassword(container) {
    container.innerHTML = `
        <div class="card" style="max-width: 480px; margin: 0 auto;">
            <h3 style="margin-bottom: 0.5rem; color: #0f172a;">🔑 Cambiar Contraseña</h3>
            <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 1.5rem;">Actualice su contraseña de acceso al sistema.</p>
            <form onsubmit="ejecutarCambioPassword(event)">
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label style="font-weight:600; color:#334155; display:block; margin-bottom:5px;">Contraseña Actual *</label>
                    <input type="password" id="passActual" required style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
                </div>
                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label style="font-weight:600; color:#334155; display:block; margin-bottom:5px;">Nueva Contraseña *</label>
                    <input type="password" id="passNueva" required style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
                </div>
                <button type="submit" style="width:100%; padding:12px; background:#0f172a; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">💾 Actualizar Contraseña</button>
            </form>
        </div>`;
}

async function ejecutarCambioPassword(e) {
    e.preventDefault();
    let actual = document.getElementById("passActual").value;
    let nueva = document.getElementById("passNueva").value;
    if (!actual || !nueva) { alert("Complete todos los campos."); return; }

    const res = await API.llamar("cambiarPassword", { action: "cambiarPassword", usuario: usuarioActual.usuario, password_actual: actual, password_nueva: nueva }, "POST");
    if (res && res.status === "success") {
        alert(res.message);
        document.getElementById("passActual").value = "";
        document.getElementById("passNueva").value = "";
    } else {
        alert("Error: " + (res ? res.message : "No se pudo cambiar la contraseña"));
    }
}
