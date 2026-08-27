/**
 * MANU JOYEROS - Módulo de Gestión de Usuarios (usuarios.js)
 */

async function renderizarModuloUsuarios(container) {
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 20px; max-width: 1200px; margin: 0 auto;">
            
            <!-- CONTENEDOR DINÁMICO DE FORMULARIO (OCULTO POR DEFECTO) -->
            <div id="contenedorFormularioUsuario" style="display: none; background: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <h3 id="tituloFormUsuario" style="margin-top: 0; margin-bottom: 20px; color: #0f172a; font-size: 1.15rem;">✨ Nuevo Usuario</h3>
                <form id="formUsuarioCrud" onsubmit="guardarUsuarioSistema(event)">
                    <input type="hidden" id="usrModoEdicion" value="0">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 20px;">
                        <div>
                            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 5px;">Usuario (Login) *</label>
                            <input type="text" id="usrUsuario" required placeholder="Ej. JPEREZ" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 5px;">Nombre Completo *</label>
                            <input type="text" id="usrNombre" required placeholder="Ej. Juan Pérez" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 5px;">Rol *</label>
                            <select id="usrRol" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; background: white; outline: none;">
                                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                                <option value="VENDEDOR">VENDEDOR</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 5px;">Contraseña *</label>
                            <input type="password" id="usrPassword" required placeholder="••••••••" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none;">
                        </div>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button type="button" onclick="cerrarFormularioUsuarioInline()" style="background: #e2e8f0; color: #334155; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.95rem;">Cancelar</button>
                        <button type="submit" style="background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.95rem;">💾 Guardar Usuario</button>
                    </div>
                </form>
            </div>

            <!-- BARRA DE ACCIONES Y TABLA -->
            <div class="card" style="background: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                    <h3 style="margin: 0; color: #0f172a; font-size: 1.15rem;">👥 Gestión de Usuarios y Accesos</h3>
                    <div style="display: flex; gap: 10px;">
                        <button type="button" onclick="abrirFormularioNuevoUsuario()" style="background: #0f172a; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem;">+ Nuevo Usuario</button>
                        <button type="button" onclick="cargarListaUsuarios()" style="background: #475569; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem;">🔄 Actualizar</button>
                    </div>
                </div>

                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                        <thead>
                            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
                                <th style="padding: 12px;">Usuario</th>
                                <th style="padding: 12px;">Nombre Completo</th>
                                <th style="padding: 12px;">Rol</th>
                                <th style="padding: 12px;">Vencimiento</th>
                                <th style="padding: 12px;">Estado</th>
                                <th style="padding: 12px; text-align: center;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tablaUsuariosBody">
                            <tr><td colspan="6" style="text-align: center; padding: 30px; color: #64748b;">Cargando usuarios...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    `;

    await cargarListaUsuarios();
}

async function cargarListaUsuarios() {
    const tbody = document.getElementById("tablaUsuariosBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: #64748b;">Sincronizando usuarios...</td></tr>`;

    try {
        const res = await API.llamar("obtenerUsuarios", { action: "obtenerUsuarios" }, "GET");
        if (res && res.status === "success" && res.data) {
            window.listaUsuariosCache = res.data;
            let html = "";
            res.data.forEach(u => {
                let userLogin = u.Usuario || u.usuario || "-";
                let nombreComp = u.Nombre || u.nombre || "-";
                let rolUsr = u.Rol || u.rol || "VENDEDOR";
                let venc = u.Vencimiento || u.vencimiento || "-";
                let estado = u.Estado || u.estado || "ACTIVO";

                let estadoBadge = estado.toUpperCase() === 'ACTIVO' 
                    ? `<span style="background: #d1fae5; color: #065f46; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">ACTIVO</span>`
                    : `<span style="background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">INACTIVO</span>`;

                html += `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 12px; font-weight: bold; color: #0f172a;">${userLogin}</td>
                        <td style="padding: 12px;">${nombreComp}</td>
                        <td style="padding: 12px; color: #475569;">${rolUsr}</td>
                        <td style="padding: 12px; color: #64748b;">${venc}</td>
                        <td style="padding: 12px;">${estadoBadge}</td>
                        <td style="padding: 12px; text-align: center;">
                            <button type="button" onclick="prepararEdicionUsuario('${userLogin}')" style="background: #0f172a; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem;" title="Editar">✏️ Editar</button>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: #ef4444;">No se pudieron cargar los usuarios.</td></tr>`;
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: #ef4444;">Error al conectar con el servidor.</td></tr>`;
    }
}

function abrirFormularioNuevoUsuario() {
    const contenedor = document.getElementById("contenedorFormularioUsuario");
    const titulo = document.getElementById("tituloFormUsuario");
    const form = document.getElementById("formUsuarioCrud");
    
    if (contenedor && titulo && form) {
        form.reset();
        document.getElementById("usrModoEdicion").value = "0";
        document.getElementById("usrUsuario").disabled = false;
        titulo.textContent = "✨ Registrar Nuevo Usuario";
        contenedor.style.display = "block";
        contenedor.scrollIntoView({ behavior: 'smooth' });
    }
}

function cerrarFormularioUsuarioInline() {
    const contenedor = document.getElementById("contenedorFormularioUsuario");
    if (contenedor) contenedor.style.display = "none";
}

function prepararEdicionUsuario(login) {
    const usuarios = window.listaUsuariosCache || [];
    const usr = usuarios.find(u => String(u.Usuario || u.usuario || "").trim().toUpperCase() === login.toUpperCase());
    
    if (!usr) {
        alert("Usuario no encontrado.");
        return;
    }

    const contenedor = document.getElementById("contenedorFormularioUsuario");
    const titulo = document.getElementById("tituloFormUsuario");

    if (contenedor && titulo) {
        document.getElementById("usrModoEdicion").value = "1";
        document.getElementById("usrUsuario").value = usr.Usuario || usr.usuario || "";
        document.getElementById("usrUsuario").disabled = true; // No se cambia el login principal
        document.getElementById("usrNombre").value = usr.Nombre || usr.nombre || "";
        document.getElementById("usrRol").value = usr.Rol || usr.rol || "VENDEDOR";
        document.getElementById("usrPassword").value = usr.Password || usr.password || "";

        titulo.textContent = `✏️ Editando Usuario: ${login}`;
        contenedor.style.display = "block";
        contenedor.scrollIntoView({ behavior: 'smooth' });
    }
}

async function guardarUsuarioSistema(event) {
    event.preventDefault();
    const login = document.getElementById("usrUsuario").value.trim();
    const nombre = document.getElementById("usrNombre").value.trim();
    const rol = document.getElementById("usrRol").value;
    const password = document.getElementById("usrPassword").value.trim();
    const esEdicion = document.getElementById("usrModoEdicion").value === "1";

    const accionApi = esEdicion ? "actualizarUsuario" : "guardarUsuario";

    const res = await API.llamar(accionApi, {
        action: accionApi,
        usuario: login,
        nombre: nombre,
        rol: rol,
        password: password
    }, "POST");

    if (res && res.status === "success") {
        cerrarFormularioUsuarioInline();
        cargarListaUsuarios();
    } else {
        alert("Error al guardar el usuario: " + (res ? res.message : "Desconocido"));
    }
}
