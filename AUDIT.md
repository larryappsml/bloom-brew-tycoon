# Auditoría inicial — 20 octubre 2026

## Publicación

El repositorio tenía `index.html`, `game.js`, `sw.js`, un manifest, un SVG y un flujo Pages. La API devolvía `has_pages: false`; Settings → Pages mostraba «GitHub Pages is currently disabled» y ninguna rama elegida. La primera ejecución de Actions estaba fallida. No había ningún sitio publicado que pudiera responder en la URL prevista.

Se cambió Source a **GitHub Actions** desde la configuración del repositorio y se relanzó la ejecución 39386134616. El segundo intento terminó correctamente. Peticiones HTTP independientes devolvieron 200 para la página y los cuatro recursos originales. Se abrió el juego y se verificó una venta de 0 € a 1 €.

El README original indicaba publicación desde rama, mientras el repositorio incluía despliegue mediante Actions. Se unificó la documentación con el método realmente configurado.

## Código inicial

- HTML y CSS monolíticos, ilustración SVG estática y lógica en una IIFE minificada.
- Sin dependencias de ejecución, rutas relativas correctas y sintaxis JavaScript válida.
- La producción pasiva no dependía de clientes ni pedidos; las estadísticas de clientes y clases se derivaban de dinero/tiempo.
- El impulso podía reactivarse sin descanso. No había límite de niveles ni demanda.
- El guardado y la importación no validaban suficientemente estructura, valores o versiones.
- El intervalo limitado a 5 s no compensaba correctamente pausas largas dentro de una sesión.
- El service worker eliminaba todas las cachés del origen, afectando potencialmente a otras aplicaciones de Pages.
- El botón de sonido solo cambiaba el icono.
- Sin pruebas ni separación de los archivos publicados y el resto del repositorio.

## Decisiones v1.1

Se conserva JavaScript sin librerías en producción. `core.js` separa la simulación comprobable, `scene.js` dibuja con Canvas 2D, `game.js` conecta interfaz/persistencia y `styles.css` reúne el diseño. La vista isométrica se dibuja con geometría local para evitar descargas, dependencias y texturas grandes.

Se conservan los trece tipos de inversión, el dinero, los niveles comprados y los premios reclamados de v1. La producción cambia de incremental ilimitado a servicios con capacidad y costes. Las inversiones antiguas por encima de los nuevos máximos se conservan en el guardado; su efecto se limita al máximo actual. Las cifras antiguas estimadas de clientes/clases no se inventan como servicios completados.

La expansión en esta iteración es económica: sedes satélite con margen limitado. No existe todavía un segundo mapa editable. Los perfiles de cliente son visuales; preferencias, formación especializada, decoración libre y prestigio quedan para iteraciones futuras.

## Evolución visual v1.2

Se incorpora Three.js 0.180.0 como renderizador local para responder a la dirección visual de tycoon 3D solicitada. La librería y su licencia se guardan en `vendor/`; solo se adapta la referencia relativa del módulo a la extensión `.mjs`. No se utilizan modelos, texturas ni personajes de otros videojuegos. Las mallas, materiales, composición y animaciones son propios.

La simulación y el esquema de guardado no cambian. El renderizador consume el estado y comunica selecciones de zonas a la interfaz. Si falla la carga de WebGL o su módulo, se crea un lienzo nuevo y se carga la alternativa 2D, sin interrumpir el ciclo económico. La caché incluye ambos renderizadores y los módulos locales. El servidor de desarrollo y Pages deben servir `.mjs` como JavaScript.
