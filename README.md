# Bloom & Brew Tycoon 🌿☕🧘

**v1.3.0** · Tycoon de cafetería y pilates con mapa 3D a pantalla completa, en español, pensado para móvil.

**[Jugar](https://larryappsml.github.io/bloom-brew-tycoon/)**

## Cómo jugar

Empiezas con 20 €, una barra y una mesa. Los clientes entran, piden y esperan. Toca **Preparar**: cada pedido tarda unos segundos y se cobra cuando termina. Si la cola tarda demasiado, los clientes se marchan y baja tu reputación.

Mejora la cafetera, añade desayunos y matcha, compra mesas y contrata baristas para automatizar la atención. El dinero mostrado por venta es el beneficio después de ingredientes y salarios por servicio. No hay ingresos infinitos por tocar ni gastos que lleven el saldo a negativo por inactividad.

El mapa ocupa toda la pantalla: arrastra para moverte, pellizca para acercar o usa +/−. El botón ⌖ centra todo el negocio. Los accesos flotantes abren Turno (pedidos, clases y tutorial), Equipo (contratación), Mejoras, Objetivos y Negocio (estadísticas y partidas). Cierra cualquier panel con × para volver al mapa. En escritorio también puedes usar la rueda para hacer zoom y Escape para cerrar menús.

El estudio cuesta 850 €. Puedes iniciar clases sin instructora; contratarla permite automatizarlas. Añade esterillas, reformers y salas de grupo. Tras completar diez clases, se desbloquean el gerente y la expansión a sedes satélite. Estas sedes producen un margen fijo limitado; aún no tienen mapa propio.

- Seis hitos con recompensas únicas y objetivo diario de 30 pedidos (día UTC).
- Hora punta de 20 s: más visitas y preparación rápida; descanso de tres minutos.
- Reputación, facturación, costes, beneficio, pedidos, abandonos y clases reales.
- Local 3D de estilo low-poly con iluminación, sombras, muebles, empleados, clientes y alumnos.
- Toca la barra, mesas o equipamiento para abrir su panel de mejora. También puedes usar Mejoras.
- Zoom y cámaras específicas de cafetería/pilates. Los cambios de equipamiento aparecen en el local.
- Sonido opcional; empieza desactivado.
- Sin anuncios, compras con dinero real ni analítica externa.

## iPhone y PWA

Abre el enlace en Safari y usa **Compartir → Añadir a pantalla de inicio**. Se respetan las zonas seguras y el botón de preparación queda sobre la navegación inferior. El juego incluye iconos PNG de 192/512 px e icono Apple de 180 px.

Después de una primera carga completa, el service worker guarda los recursos para jugar sin conexión. Las nuevas versiones se activan al cerrar todas las pestañas del juego y volver a abrirlo; evita mezclar archivos de distintas versiones. Para recibir una actualización, abre con conexión, cierra el juego y vuelve a abrirlo.

La verificación visual se realiza con navegador de escritorio a tamaños móviles. La prueba en Safari de un iPhone físico sigue siendo necesaria para certificar comportamiento específico de iOS y rendimiento real.

## Guardado

Autoguardado cada cinco segundos, al ocultar la app y al salir. El formato v2 valida las partidas y migra la clave v1 sin borrarla: conserva dinero, inversiones y recompensas. Las métricas antiguas que eran estimaciones no se convierten en clientes o clases reales. Los niveles heredados superiores a los nuevos máximos se conservan, pero su efecto se limita al máximo de compra actual.

En **Negocio** puedes exportar JSON, importar con confirmación y respaldo, o restaurar una copia local. Una partida corrupta o de una versión futura no se sobrescribe automáticamente. Los pedidos y clases en curso se reinician al recargar, sin cobrar ni descontar importes adicionales.

Los ingresos offline son una estimación conservadora: **35 % del beneficio automático estimado, hasta cuatro horas**, y solo con personal contratado o sedes. No generan pedidos ni clases ficticios. Al reanudar una pestaña oculta se aplica la misma regla. Exporta una copia antes de cambiar de dispositivo o borrar los datos del navegador.

## Desarrollo

Node.js 22 o posterior; sin instalación de dependencias para ejecutar, probar o empaquetar el juego. Three.js 0.180.0 está incluido en `vendor/` con su licencia MIT, sin solicitudes a CDN durante la partida.

```sh
npm test
npm run build
npm start
```

También puedes ejecutar directamente `node --test tests/*.test.cjs`, `node scripts/build.cjs` y `node scripts/serve.cjs`. El servidor abre `http://127.0.0.1:4173/bloom-brew-tycoon/`, exactamente bajo la subruta de producción. Admite un puerto como argumento. No registra el service worker en localhost para evitar caché de desarrollo.

| Archivo | Responsabilidad |
| --- | --- |
| `core.js` | Economía, pedidos, mejoras, clases, validación y offline; comprobable en Node |
| `scene.js` | Carga del renderizador 3D y recuperación con Canvas 2D si WebGL no está disponible |
| `scene3d.mjs` | Modelos y animaciones 3D, cámara ortográfica y selección de zonas con raycasting |
| `scene2d.js` | Alternativa gráfica 2D para dispositivos sin WebGL |
| `vendor/` | Three.js 0.180.0 y licencia MIT, servidos desde la misma subruta |
| `game.js` | Interfaz, navegación, audio, guardado y ciclo de vida |
| `styles.css` | Diseño adaptable, zonas seguras y movimiento reducido |
| `sw.js` | Caché offline limitada al juego y activación coherente por versión |
| `scripts/build.cjs` | Empaqueta exclusivamente los recursos del juego en `dist/` |
| `tests/` | Pruebas de economía, interfaz, recursos y service worker; fixtures y QA local |

`tests/harness.html` permite cargar partidas de prueba en el servidor local. No se publica. Los iconos están precompilados; su regeneración opcional con `scripts/icons.cjs` requiere `@napi-rs/canvas`.

## Publicación

Settings → Pages → Build and deployment → **Source: GitHub Actions**.

`.github/workflows/pages.yml` comprueba cada pull request y cada push a `main`. Publica `dist/` únicamente si pasan las pruebas. Usa el entorno `github-pages`, `pages: write` e `id-token: write`. No necesita tokens personales ni secretos.

Si aparece un 404: comprueba Source, revisa el último workflow y su paso Deploy, y verifica que `index.html` está dentro del artefacto. Las rutas de recursos, manifest y service worker son relativas a `/bloom-brew-tycoon/`.

Detalles de la auditoría y cambios en [AUDIT.md](AUDIT.md) y [CHANGELOG.md](CHANGELOG.md).

## Próximas iteraciones

Preferencias de clientes, formación del personal, decoración libre, un mapa jugable para cada sede y ajuste de progresión con sesiones reales. La v1.1 prioriza atención, clases, economía finita y persistencia.

La v1.2 cambia la presentación por un local 3D con modelos propios, conservando la simulación y las partidas v2. El objetivo de render es 30 FPS, con DPR máximo 1,75 y sombra de 1024 px. La geometría estática se agrupa con instancias y las animaciones se pausan cuando la pestaña o el local están ocultos. El modo de movimiento reducido limita el ritmo de dibujo y evita balanceos de cámara innecesarios. El rendimiento en un iPhone físico no queda certificado por las pruebas de escritorio.
