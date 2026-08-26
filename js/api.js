/**
 * MANU JOYEROS - Capa de Comunicación API
 */
const API = {
  async llamar(action, data = {}, method = "POST") {
    try {
      let url = CONFIG.APPS_SCRIPT_URL;
      let opciones = {
        method: method,
        mode: "cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" }
      };

      if (method === "GET") {
        url += `?action=${action}`;
      } else {
        opciones.body = JSON.stringify({ action: action, ...data });
      }

      const respuesta = await fetch(url, opciones);
      const resultado = await respuesta.json();
      return resultado;
    } catch (error) {
      console.error("Error en comunicación con la API:", error);
      return { status: "error", message: "Error de conexión con el servidor." };
    }
  }
};
