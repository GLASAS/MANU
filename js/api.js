// Asegúrate de que el método POST en tu js/api.js envíe siempre el parámetro action:
async llamar(accion, datos = {}, metodo = "POST") {
    const url = CONFIG.APPS_SCRIPT_URL; // o CONFIG.URL_API
    
    if (metodo.toUpperCase() === "GET") {
        // ... tu lógica GET existente ...
    } else {
        // Aseguramos que 'action' viaje siempre dentro del objeto datos para Apps Script
        datos.action = datos.action || accion;

        try {
            const respuesta = await fetch(url, {
                method: "POST",
                body: JSON.stringify(datos)
            });
            return await respuesta.json();
        } catch (e) {
            console.error("Error en API:", e);
            return { status: "error", message: "Error de conexión POST" };
        }
    }
}
