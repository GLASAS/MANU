/**
 * MANU JOYEROS - Módulo de Gestión de Proveedores (proveedores.js)
 */

async function renderizarModuloProveedores(container) {
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 20px; max-width: 1200px; margin: 0 auto;">
            
            <!-- FORMULARIO INTEGRADO (OCULTO POR DEFECTO) -->
            <div id="contenedorFormularioProveedor" style="display: none; background: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <h3 id="tituloFormProveedor" style="margin-top: 0; margin-bottom: 20px; color: #0f172a; font-size: 1.15rem;">✨ Nuevo Proveedor</h3>
                <form id="formProveedorCrud" onsubmit="guardarProveedorSistema(event)">
                    <input type="hidden" id="provNitOriginal">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 20px;">
                        <div>
                            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 5px;">NIT / Identificación *</label>
                            <input type="text" id="provNit" required placeholder="Ej. 900123456-1" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 5px;">Nombre / Empresa *</label>
                            <input type="text" id="provNombre" required placeholder="Ej. Joyas S.A.S." style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 5px;">Contacto</label>
                            <input type="text" id="provContacto" placeholder="Nombre del contacto" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 5px;">Teléfono</label>
                            <input type="text" id="provTelefono" placeholder="Ej. 3101234567" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 5px;">Correo Electrónico</label>
                            <input type="email" id="provEmail" placeholder="correo@empresa.com" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 5px;">Especialidad</label>
                            <input type="text" id="provEspecialidad" placeholder="Ej. Oro, Insumos" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none;">
                        </div>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button type="button" onclick="cerrarFormularioProveedorInline()" style="background: #e2e8f0; color: #334155; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.95rem;">Cancelar</button>
                        <button type="submit" style="background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.95rem;">💾 Guardar Proveedor</button>
                    </div>
                </form>
            </div>

            <!-- TABLA DE PROVEEDORES -->
            <div class="card" style="background: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                    <h3 style="margin: 0; color: #0f172a; font-size: 1.15rem;">📦 Gestión de Proveedores y Talleres</h3>
                    <div style="display: flex; gap: 10px;">
                        <button type="button" onclick="abrirFormularioNuevoProveedor()" style="background: #0f172a; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem;">+ Nuevo Proveedor</button>
                        <button type="button" onclick="cargarListaProveedores()" style="background: #475569; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem;">🔄 Actualizar</button>
                    </div>
                </div>

                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                        <thead>
                            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
                                <th style="padding: 12px;">NIT</th>
                                <th style="padding: 12px;">Nombre</th>
                                <th style="padding: 12px;">Contacto</th>
                                <th style="padding: 12px;">Teléfono</th>
                                <th style="padding: 12px;">Email</th>
                                <th style="padding: 12px;">Especialidad</th>
                                <th style="padding: 12px; text-align: center;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tablaProveedoresBody">
                            <tr><td colspan="7" style="text-align: center; padding: 30px; color: #64748b;">Cargando proveedores...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    `;

    await cargarListaProveedores();
}

async function cargarListaProveedores() {
    const tbody = document.getElementById("tablaProveedoresBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; color: #64748b;">Sincronizando proveedores...</td></tr>`;

    try {
        const res = await API.llamar("obtenerProveedores", { action: "obtenerProveedores" }, "GET");
        if (res && res.status === "success" && res.data) {
            window.listaProveedoresCache = res.data;
            let html = "";
            res.data.forEach(p => {
                let nit = p.NIT || p.nit || "-";
                let nombre = p.Nombre || p.nombre || "-";
                let contacto = p.Contacto || p.contacto || "-";
                let telefono = p.Telefono || p.telefono || "-";
                let email = p.Email || p.email || "-";
                let especialidad = p.Especialidad || p.especialidad || "-";

                html += `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 12px; font-weight: bold; color: #0f172a;">${nit}</td>
                        <td style="padding: 12px;">${nombre}</td>
                        <td style="padding: 12px; color: #475569;">${contacto}</td>
                        <td style="padding: 12px; color: #64748b;">${telefono}</td>
                        <td style="padding: 12px; color: #64748b;">${email}</td>
                        <td style="padding: 12px; color: #475569;">${especialidad}</td>
                        <td style="padding: 12px; text-align: center;">
                            <button type="button" onclick="prepararEdicionProveedor('${nit}')" style="background: #0f172a; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem;" title="Editar">✏️ Editar</button>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        } else {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; color: #ef4444;">No se pudieron cargar los proveedores.</td></tr>`;
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; color: #ef4444;">Error al conectar con el servidor.</td></tr>`;
    }
}

function abrirFormularioNuevoProveedor() {
    const contenedor = document.getElementById("contenedorFormularioProveedor");
    const titulo = document.getElementById("tituloFormProveedor");
    const form = document.getElementById("formProveedorCrud");
    
    if (contenedor && titulo && form) {
        form.reset();
        document.getElementById("provNitOriginal").value = "";
        document.getElementById("provNit").disabled = false;
        titulo.textContent = "✨ Registrar Nuevo Proveedor";
        contenedor.style.display = "block";
        contenedor.scrollIntoView({ behavior: 'smooth' });
    }
}

function cerrarFormularioProveedorInline() {
    const contenedor = document.getElementById("contenedorFormularioProveedor");
    if (contenedor) contenedor.style.display = "none";
}

function prepararEdicionProveedor(nit) {
    const proveedores = window.listaProveedoresCache || [];
    const prov = proveedores.find(p => String(p.NIT || p.nit || "").trim().toUpperCase() === nit.toUpperCase());
    
    if (!prov) {
        alert("Proveedor no encontrado.");
        return;
    }

    const contenedor = document.getElementById("contenedorFormularioProveedor");
    const titulo = document.getElementById("tituloFormProveedor");

    if (contenedor && titulo) {
        document.getElementById("provNitOriginal").value = nit;
        document.getElementById("provNit").value = prov.NIT || prov.nit || "";
        document.getElementById("provNit").disabled = true;
        document.getElementById("provNombre").value = prov.Nombre || prov.nombre || "";
        document.getElementById("provContacto").value = prov.Contacto || prov.contacto || "";
        document.getElementById("provTelefono").value = prov.Telefono || prov.telefono || "";
        document.getElementById("provEmail").value = prov.Email || prov.email || "";
        document.getElementById("provEspecialidad").value = prov.Especialidad || prov.especialidad || "";

        titulo.textContent = `✏️ Editando Proveedor: ${nit}`;
        contenedor.style.display = "block";
        contenedor.scrollIntoView({ behavior: 'smooth' });
    }
}

async function guardarProveedorSistema(event) {
    event.preventDefault();
    const nitOriginal = document.getElementById("provNitOriginal").value.trim();
    const nit = document.getElementById("provNit").value.trim();
    const nombre = document.getElementById("provNombre").value.trim();
    const contacto = document.getElementById("provContacto").value.trim();
    const telefono = document.getElementById("provTelefono").value.trim();
    const email = document.getElementById("provEmail").value.trim();
    const especialidad = document.getElementById("provEspecialidad").value.trim();

    const esEdicion = Boolean(nitOriginal);
    const accionApi = esEdicion ? "actualizarProveedor" : "guardarProveedor";

    const res = await API.llamar(accionApi, {
        action: accionApi,
        nit_original: nitOriginal,
        nit: nit,
        nombre: nombre,
        contacto: contacto,
        telefono: telefono,
        email: email,
        especialidad: especialidad
    }, "POST");

    if (res && res.status === "success") {
        cerrarFormularioProveedorInline();
        cargarListaProveedores();
    } else {
        alert("Error al guardar el proveedor: " + (res ? res.message : "Desconocido"));
    }
}
