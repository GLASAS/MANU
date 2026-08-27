/**
 * MANU JOYEROS - Conector API (api.js)
 */
const API = {
    async llamar(accion, datos = {}, metodo = "POST") {
        try {
            let url = CONFIG.APPS_SCRIPT_URL;
            let opciones = { method: metodo };

            if (metodo === "GET") {
                url += "?action=" + encodeURIComponent(accion);
            } else {
                opciones.body = JSON.stringify({ action: accion, ...datos });
            }

            const respuesta = await fetch(url, opciones);
            const resultado = await respuesta.json();
            return resultado;
        } catch (error) {
            console.error("Error en llamada API:", error);
            return { status: "error", message: "Error de conexión con el servidor." };
        }
    }
};
