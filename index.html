<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - MANU JOYEROS</title>
    <link rel="stylesheet" href="./css/styles.css">
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
</head>
<body class="app-body">
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

    <!-- MODAL DE IMÁGENES / ZOOM -->
    <div class="image-modal" id="imageModal" onclick="cerrarZoomImagen()">
        <img class="image-modal-content" id="imgModalSrc">
        <button class="image-modal-close" onclick="cerrarZoomImagen()">Cerrar ✕</button>
    </div>

    <!-- MODAL DE QR Y CÓDIGO DE BARRAS (SOLO DESCARGA PNG) -->
    <div class="image-modal" id="modalQrBarra" onclick="cerrarModalQr()">
        <div style="background: white; padding: 18px; border-radius: 12px; text-align: center; max-width: 380px; width: 90%; color: #0f172a;" onclick="event.stopPropagation()">
            <div style="font-size: 0.75rem; font-weight: bold; color: #64748b; letter-spacing: 1px; margin-bottom: 2px;" id="lblModalEmpresaTitle">MANU JOYEROS</div>
            <div id="printSectionQr" style="background: #fff; padding: 10px; border: 1.5px dashed #cbd5e1; border-radius: 8px; margin-bottom: 12px;">
                <div id="modalSkuLabel" style="font-size: 0.95rem; font-weight: bold; color: #0f172a; margin-bottom: 6px;">SKU</div>
                
                <!-- Código QR del Certificado -->
                <div style="display: inline-block; background: #f8fafc; padding: 4px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 6px;">
                    <img id="imgQrGenerado" src="" alt="QR" style="width: 120px; height: 120px; display: block; margin: 0 auto;">
                </div>

                <!-- Código de Barras Escaneable (JsBarcode) -->
                <div style="background: #f8fafc; padding: 4px; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 4px;">
                    <svg id="barcodeElement" style="max-width: 100%; height: 50px; display: block; margin: 0 auto;"></svg>
                </div>

                <div id="modalDescLabel" style="font-size: 0.72rem; color: #475569; margin-top: 4px;">Certificado Digital y Trazabilidad</div>
                
                <!-- Botones exclusivos de Descarga en PNG -->
                <div class="no-print" style="margin-top: 8px; display: flex; gap: 8px; justify-content: center;">
                    <button type="button" class="btn-action" onclick="descargarQrPNG()" style="background: #0f172a; color: white;">📥 Descargar QR</button>
                    <button type="button" class="btn-action" onclick="descargarBarcodePNG()" style="background: #059669; color: white;">📥 Descargar Barras</button>
                </div>
            </div>
            <button class="image-modal-close no-print" onclick="cerrarModalQr()" style="background:#ef4444; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold;">Cerrar Ventana</button>
        </div>
    </div>

    <!-- MENÚ LATERAL (SIDEBAR) -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <div class="sidebar-logo-container">
                <img src="./manu_joyeros.jpg" alt="MANU JOYEROS" class="sidebar-logo-img">
            </div>
            <div style="margin-top: 8px;"><span id="userRoleBadge" class="badge">Rol</span></div>
        </div>
        <nav class="sidebar-nav" id="sidebarNavContainer">
            <a href="#" class="nav-link active" onclick="cambiarVista('dashboard', event)">📊 Dashboard</a>
            <a href="#" class="nav-link" onclick="cambiarVista('productos', event)">💍 Productos</a>
            <a href="https://glasas.github.io/MANU/catalogomanu" target="_blank" class="nav-link">🌐 Catálogo Web</a>
            <a href="#" class="nav-link" onclick="abrirModalQrCatalogo()">📱 QR Catálogo Web</a>
            <a href="#" class="nav-link nav-admin-only" onclick="cambiarVista('inventario', event)">📦 Inventario / Arqueo</a>
            <a href="#" class="nav-link nav-admin-only" onclick="cambiarVista('actualizacion_oro', event)">🪙 Actualización Oro</a>
            <a href="#" class="nav-link nav-admin-only" onclick="cambiarVista('entradas', event)">📥 Entradas</a>
            <a href="#" class="nav-link nav-admin-only" onclick="cambiarVista('salidas', event)">📤 Salidas</a>
            <a href="#" class="nav-link nav-admin-only" onclick="cambiarVista('kardex', event)">📑 Kardex</a>
            <a href="#" class="nav-link nav-admin-only" onclick="cambiarVista('proveedores', event)">🏢 Proveedores</a>
            <a href="#" class="nav-link nav-admin-only" onclick="cambiarVista('usuarios', event)">👤 Usuarios</a>
            <a href="#" class="nav-link" onclick="cambiarVista('cambiar_password', event)">🔑 Cambiar Contraseña</a>
            <a href="#" class="nav-link text-danger" onclick="cerrarSesion()">🚪 Cerrar Sesión</a>
        </nav>
        <div class="sidebar-footer-version" id="versionSidebarLabel">MANU JOYEROS V1.1543</div>
    </aside>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="main-content">
        <header class="top-bar">
            <button class="menu-toggle" onclick="toggleSidebar()">☰</button>
            <h1 id="viewTitle" style="font-size: 1.25rem;">Dashboard General</h1>
            <div class="user-info"><span id="userNameLabel">Usuario</span></div>
        </header>

        <div class="content-body" id="contentBody">
            <div class="welcome-banner">
                <div class="welcome-text">
                    <h1>Bienvenido, <span id="userNameBanner">Administrador</span> 👋</h1>
                    <p>Sistema profesional de inventario — <em>🪙 ¡Joyas que trascienden el tiempo!</em></p>
                </div>
            </div>
        </div>
    </main>

    <!-- SCRIPTS ENLAZADOS -->
    <script src="./js/config.js"></script>
    <script src="./js/api.js"></script>
    <script src="./js/modules/productos.js"></script>
    <script src="./js/modules/inventario.js"></script>
    <script src="./js/modules/movimientos.js"></script>
    <script src="./js/modules/proveedores.js"></script>
    <script src="./js/modules/usuarios.js"></script>
</body>
</html>
