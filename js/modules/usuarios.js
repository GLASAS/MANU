/**
 * MANU JOYEROS - Módulo de Usuarios (usuarios.js)
 */

async function renderizarModuloUsuarios(container) {
    container.innerHTML = `
        <div class="card">
            <h3 style="color: #0f172a; margin-bottom: 0.5rem; font-size: 1.1rem;">👤 Control de Usuarios y Accesos</h3>
            <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 1.25rem;">Administre los permisos, roles y fechas de vencimiento de las cuentas del sistema.</p>
            
            <div style="display: flex; gap: 10px; margin-bottom: 1.25rem;">
                <button class="btn-modern btn-primary-action" onclick="abrirModalUsuario()">➕ Nuevo Usuario</button>
            </div>

            <div id="tablaUsuariosContainer"><p style="text-align: center; color: #64748b; padding: 2rem;">Cargando usuarios...</p></div>
        </div>

        <!-- MODAL USUARIO -->
        <div class="image-modal" id="modalUsuario" onclick="cerrarModalUsuario()">
            <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 450px; width: 95%; color: #0f172a;" onclick="event.stopPropagation()">
                <h3 id="tituloModalUsr" style="margin-bottom: 1rem;">👤 Registrar Nuevo Usuario</h3>
                <form onsubmit="guardarUsuarioSistema(event)">
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="display:block; font-size:0.85rem; font-weight:500; margin-bottom:4px;">Usuario (Login) *</label>
                        <input type="text" id="usrLogin" required style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="display:block; font-size:0.85rem; font-weight:500; margin-bottom:4px;">Nombre Completo *</label>
                        <input type="text" id="usrNombre" required style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="display:block; font-size:0.85rem; font-weight:500; margin-bottom:4px;">Contraseña *</label>
                        <input type="password" id="usrPass" required style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="display:block; font-size:0.85rem; font-weight:500; margin-bottom:4px;">Rol *</label>
                        <select id="usrRol" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
                            <option value="ADMIN">ADMIN</option>
                            <option value="USUARIO">USUARIO</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <label style="display:block; font-size:0.85rem; font-weight:500; margin-bottom:4px;">Fecha de Vencimiento *</label>
                        <input type="date" id="usrVencimiento" required style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" style="flex: 1; background-color: #0f172a; color: white; border: none; padding: 0.75rem; border-radius: 8px; font-weight: 500; cursor: pointer;">Guardar</button>
                        <button type="button" onclick="cerrarModalUsuario()" style="flex: 1; background-color: #ef4444; color: white; border: none; padding: 0.75rem; border-radius: 8px; font-weight: 500; cursor: pointer;">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>`;

    await cargarListaUsuarios();
}

async function cargarListaUsuarios() {
    const contenedor = document.getElementById("tablaUsuariosContainer");
    const res = await API.llamar("obtenerUsuarios", {}, "GET");
    if (res && res.status === "success") {
        renderizarTablaUsuarios(res.data || []);
    } else {
        contenedor.innerHTML = `<p style="color: #ef4444; text-align: center;">No hay usuarios registrados.</p>`;
    }
}

function renderizarTablaUsuarios(data) {
    const contenedor = document.getElementById("tablaUsuariosContainer");
    if (!data || data.length === 0) {
        contenedor.innerHTML = `<p style="color: #64748b; text-align: center; padding: 2rem;">No hay registros.</p>`;
        return;
    }

    let html = `<div class="table-container"><table class="data-table"><thead><tr>
        <th>Usuario</th><th>Nombre</th><th>Rol</th><th>Vencimiento</th><th>Acciones</th>
    </tr></thead><tbody>`;

    data.forEach(u => {
        let login = u.Usuario || u.usuario || '';
        let nombre = u.Nombre || u.nombre || '';
        let rol = u.Rol || u.rol || '';
        let venci = u.Vencimiento || u.vencimiento || '';

        html += `<tr>
            <td><strong>${login}</strong></td>
            <td>${nombre}</td>
            <td><span class="badge" style="background:#0f172a; color:white;">${rol}</span></td>
            <td>${venci}</td>
            <td><button class="btn-action" onclick="eliminarUsuarioSistema('${login}')" style="background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Eliminar</button></td>
        </tr>`;
    });

    html += `</tbody></table></div>`;
    contenedor.innerHTML = html;
}

function abrirModalUsuario() {
    document.getElementById("usrLogin").value = "";
    document.getElementById("usrNombre").value = "";
    document.getElementById("usrPass").value = "";
    document.getElementById("usrRol").value = "USUARIO";
    document.getElementById("usrVencimiento").value = new Date().toISOString().split('T')[0];
    document.getElementById("modalUsuario").classList.add("active");
}

function cerrarModalUsuario() {
    document.getElementById("modalUsuario").classList.remove("active");
}

async function guardarUsuarioSistema(e) {
    e.preventDefault();
    let usuario = document.getElementById("usrLogin").value.trim().toUpperCase();
    let nombre = document.getElementById("usrNombre").value.trim();
    let password = document.getElementById("usrPass").value.trim();
    let rol = document.getElementById("usrRol").value;
    let vencimiento = document.getElementById("usrVencimiento").value;

    cerrarModalUsuario();

    const res = await API.llamar("crearUsuario", {
        action: "crearUsuario",
        usuario: usuario,
        nombre: nombre,
        password: password,
        rol: rol,
        vencimiento: vencimiento
    }, "POST");

    if (res && res.status === "success") {
        alert(res.message);
        await cargarListaUsuarios();
    } else {
        alert("Error al registrar usuario.");
    }
}

async function eliminarUsuarioSistema(usuario) {
    if (!confirm(`¿Está seguro de eliminar al usuario [${usuario}]?`)) return;
    const res = await API.llamar("eliminarUsuario", { action: "eliminarUsuario", usuario: usuario }, "POST");
    if (res && res.status === "success") {
        alert(res.message);
        await cargarListaUsuarios();
    } else {
        alert("Error al eliminar usuario.");
    }
}
