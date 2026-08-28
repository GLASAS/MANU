/**
 * MANU JOYEROS - Módulo Independiente de Proveedores (proveedores.js)
 * Versión Completa e Íntegra con soporte para Dirección y mapeo exacto - 2026
 */

let listaProveedoresCache = [];
let proveedorEditandoNit = null;

async function renderizarModuloProveedores(container) {
    if (!container) {
        container = document.getElementById("contentBody") || document.querySelector("main");
    }

    container.innerHTML = `
        <div id="seccionFormProveedor" class="card" style="margin-bottom: 25px; background: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <h3 id="tituloFormProveedor" style="margin-top: 0; color: #0f172a; font-size: 1.2rem; margin-bottom: 5px;">➕ Registrar Nuevo Proveedor / Taller</h3>
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 20px;">Complete los datos del proveedor o taller externo de joyería.</p>
            
            <form id="formProveedor" onsubmit="enviarGuardarProveedor(event)">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">NIT / Identificación *</label>
                        <input type="text" id="provNit" required placeholder="Ej: 900123456" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Nombre / Empresa *</label>
                        <input type="text" id="provNombre" required placeholder="Ej: Joyería Fina S.A.S." style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Contacto</label>
                        <input type="text" id="provContacto" placeholder="Nombre de la persona" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Teléfono *</label>
                        <input type="text" id="provTelefono" required placeholder="Ej: 3001234567" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Correo Electrónico</label>
                        <input type="email" id="provEmail" placeholder="correo@empresa.com" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Dirección</label>
                        <input type="text" id="provDireccion" placeholder="Ej: Calle 100 # 15-20" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                    </div>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #334155; margin-bottom: 4px;">Especialidad / Servicios</label>
                    <input type="text" id="provEspecialidad" placeholder="Ej: Fabricación de anillos, engaste, cadenas..." style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" id="btnCancelarEdicionProv" onclick="cancelarEdicionProveedor()" style="display: none; background: #e2e8f0; color: #334155; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">Cancelar</button>
                    <button type="submit" id="btnSubmitProveedor" style="background: #0f172a; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer;">Guardar Proveedor</button>
                </div>
            </form>
        </div>

        <div class="card" style="background: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #0f172a; font-size: 1.1rem;">Gestión de Proveedores y Talleres</h3>
                <button type="button" onclick="cargarListaProveedores()" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">🔄 Actualizar Lista</button>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
                            <th style="padding: 10px;">NIT</th>
                            <th style="padding: 10px;">Nombre</th>
                            <th style="padding: 10px;">Contacto</th>
                            <th style="padding: 10px;">Teléfono</th>
                            <th style="padding: 10px;">Dirección</th>
                            <th style="padding: 10px;">Email</th>
                            <th style="padding: 10px;">Especialidad</th>
                            <th style="padding: 10px; text-align: center;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tablaProveedoresBody">
                        <tr><td colspan="8" style="text-align: center; padding: 20px; color: #64748b;">Cargando proveedores...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    await cargarListaProveedores();
}

async function cargarListaProveedores() {
    const tbody = document.getElementById("tablaProveedoresBody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: #64748b;">Sincronizando proveedores...</td></tr>`;

    try {
        const res = await API.llamar("obtenerProveedores", {}, "GET");
        if (res && res.status === "success" && res.data) {
            listaProveedoresCache = res.data;
            if (listaProveedoresCache.length > 0) {
                let html = "";
                listaProveedoresCache.forEach(p => {
                    let nit = p.NIT || p.nit || "-";
                    let nombre = p.Nombre || p.nombre || "-";
                    let contacto = p.Contacto || p.contacto || "-";
                    let telefono = p.Telefono || p.telefono || "-";
                    let direccion = p.Direccion || p.direccion || "-";
                    let email = p.Correo || p.correo || p.Email || p.email || "-";
                    let especialidad = p.Especialidad || p.especialidad || "-";

                    html += `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 10px; font-weight: bold; color: #0f172a;">${nit}</td>
                            <td style="padding: 10px; font-weight: bold; color: #2563eb;">${nombre}</td>
                            <td style="padding: 10px; color: #334155;">${contacto}</td>
                            <td style="padding: 10px; color: #475569;">${telefono}</td>
                            <td style="padding: 10px; color: #475569;">${direccion}</td>
                            <td style="padding: 10px; color: #475569;">${email}</td>
                            <td style="padding: 10px; color: #64748b;">${especialidad}</td>
                            <td style="padding: 10px; text-align: center;">
                                <button onclick="prepararEdicionProveedor('${nit}')" style="background: #e0f2fe; color: #0369a1; border: none; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.78rem; font-weight: bold;">Editar</button>
                                <button onclick="eliminarProveedor('${nit}')" style="background: #fee2e2; color: #991b1b; border: none; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.78rem; font-weight: bold; margin-left: 4px;">Eliminar</button>
                            </td>
                        </tr>
                    `;
                });
                tbody.innerHTML = html;
            } else {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: #64748b;">No hay proveedores registrados.</td></tr>`;
            }
        } else {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ef4444;">Error al cargar proveedores.</td></tr>`;
        }
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ef4444;">Error de conexión.</td></tr>`;
    }
}

function prepararEdicionProveedor(nit) {
    let p = listaProveedoresCache.find(x => String(x.NIT || x.nit).trim() === String(nit).trim());
    if (!p) return;

    proveedorEditandoNit = nit;
    document.getElementById("provNit").value = p.NIT || p.nit || "";
    document.getElementById("provNombre").value = p.Nombre || p.nombre || "";
    document.getElementById("provContacto").value = p.Contacto || p.contacto || "";
    document.getElementById("provTelefono").value = p.Telefono || p.telefono || "";
    document.getElementById("provEmail").value = p.Correo || p.correo || p.Email || p.email || "";
    document.getElementById("provDireccion").value = p.Direccion || p.direccion || "";
    document.getElementById("provEspecialidad").value = p.Especialidad || p.especialidad || "";

    document.getElementById("tituloFormProveedor").textContent = `✏️ Editando Proveedor: ${nit}`;
    document.getElementById("btnSubmitProveedor").textContent = "Actualizar Proveedor";
    document.getElementById("btnCancelarEdicionProv").style.display = "inline-block";

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicionProveedor() {
    proveedorEditandoNit = null;
    document.getElementById("formProveedor").reset();
    document.getElementById("tituloFormProveedor").textContent = "➕ Registrar Nuevo Proveedor / Taller";
    document.getElementById("btnSubmitProveedor").textContent = "Guardar Proveedor";
    document.getElementById("btnCancelarEdicionProv").style.display = "none";
}

async function enviarGuardarProveedor(event) {
    event.preventDefault();
    if (typeof mostrarSpinner === "function") mostrarSpinner("Guardando proveedor...");

    const nit = document.getElementById("provNit").value.trim();
    const nombre = document.getElementById("provNombre").value.trim();
    const contacto = document.getElementById("provContacto").value.trim();
    const telefono = document.getElementById("provTelefono").value.trim();
    const email = document.getElementById("provEmail").value.trim();
    const direccion = document.getElementById("provDireccion").value.trim();
    const especialidad = document.getElementById("provEspecialidad").value.trim();

    const accion = proveedorEditandoNit ? "editarProveedor" : "crearProveedor";

    try {
        const res = await API.llamar(accion, {
            action: accion,
            nit_original: proveedorEditandoNit,
            nit: nit,
            nombre: nombre,
            contacto: contacto,
            telefono: telefono,
            email: email,
            direccion: direccion,
            especialidad: especialidad
        }, "POST");

        if (typeof ocultarSpinner === "function") ocultarSpinner();

        if (res && res.status === "success") {
            alert(res.message);
            cancelarEdicionProveedor();
            cargarListaProveedores();
        } else {
            alert("Error: " + (res ? res.message : "No se pudo guardar el proveedor."));
        }
    } catch (e) {
        if (typeof ocultarSpinner === "function") ocultarSpinner();
        console.error(e);
        alert("⚠️ Error de conexión al guardar el proveedor.");
    }
}

async function eliminarProveedor(nit) {
    if (!confirm(`¿Está seguro de eliminar el proveedor con NIT ${nit}?`)) return;
    if (typeof mostrarSpinner === "function") mostrarSpinner("Eliminando proveedor...");

    try {
        const res = await API.llamar("eliminarProveedor", {
            action: "eliminarProveedor",
            nit: nit
        }, "POST");

        if (typeof ocultarSpinner === "function") ocultarSpinner();

        if (res && res.status === "success") {
            alert(res.message);
            cargarListaProveedores();
        } else {
            alert("Error: " + (res ? res.message : "No se pudo eliminar."));
        }
    } catch (e) {
        if (typeof ocultarSpinner === "function") ocultarSpinner();
        console.error(e);
        alert("⚠️ Error de conexión al eliminar.");
    }
}
