# Auditoría v1.23.0 · 21 de octubre de 2026

## Problemas reproducidos y corregidos

- La inclinación de natación podía persistir al caminar. Se reinicia la pose antes de calcular y suavizar cada animación; la regresión comprueba la salida erguida.
- Los clientes de golf, piscina, baile, cycling, boxeo y coworking recibían otra ropa al continuar un plan combinado. Se conserva la vestimenta de su actividad.
- El panel reconstruía el mismo HTML varias veces por actualización. Se compone una sola vez, se reutiliza si no cambia y se conserva foco/scroll. Las actualizaciones visuales esperan mientras un botón está pulsado; la simulación sigue funcionando.
- Hacer scroll podía sacar el cierre del panel fuera de pantalla. Su cabecera es fija dentro del scroll y la altura respeta el espacio superior.
- En horizontal los primeros menús tapaban controles de zoom. La navegación usa dos columnas con pantalla baja.
- Abrir una sala desde un borde visible del mapa podía dejar su panel detrás del menú abierto. Ahora vuelve al mapa antes de abrirlo.
- Cantidades grandes podían desbordar el HUD. Se muestran abreviadas y el importe exacto sigue disponible como etiqueta accesible y en la partida.
- Reformas y cambios de especialización se sumaban a costes operativos, mientras otras inversiones no lo hacían. Las nuevas compras descuentan saldo sin alterar el beneficio operativo. No se reescribe el histórico guardado.
- Canvas 2D no tenía selección ni enfoque de salas, y dejaba franjas vacías en móvil. Ahora ajusta resolución/proporciones, transforma correctamente las coordenadas táctiles, enfoca y permite zoom.
- Se corrige el nombre del botón citado por el tutorial y se redondean los tiempos visibles.

## Validación

- 155 pruebas Node, incluidas siete regresiones nuevas. Guardado, migración, importación/exportación, copias, ingresos offline, pagos únicos, reservas, rutas, animaciones, modos gráficos y worker.
- Dos escenarios de 600 segundos, semillas 1 y 37, con todo el centro, personal, reformas y especializaciones activos. Todos los servicios completan sesiones; máximos de 163 y 164 agentes; ninguna pareja solapada en las muestras cada cinco segundos y ninguna salida estacionaria en esas muestras.
- Veinte comprobaciones de interfaz: mapa, mejoras, objetivos, negocio y panel de cafetería desplazado, en 320×568, 390×844, 430×932 y 844×390. Sin desbordamiento horizontal ni controles medidos fuera de pantalla.
- Comprobación visual en Chromium de panel desplazado, navegación horizontal, Canvas 2D adaptable, enfoque de piscina y apertura del panel al tocar la sala. Sin errores de consola observados.
- Build estático con rutas relativas y despliegue GitHub Actions. La disponibilidad pública se verifica después del despliegue.

Los JSON adjuntos conservan resultados. El laboratorio local `tests/responsive.html` y el script `scripts/centre-audit.cjs` permiten repetir estas comprobaciones. El laboratorio y los fixtures no se empaquetan en producción.

## Límites y siguientes pasos

La revisión usa tamaños CSS en iframes de Chromium, sin simular Safari, zonas seguras físicas ni hardware de iPhone. El límite estático de dibujo sigue cubierto por pruebas; no se afirma una tasa de imágenes en móvil real.

Antes de un lanzamiento en App Store: probar Safari y PWA en iPhone real, suspensión/reanudación, cambio de orientación y batería con más de 150 agentes. El arte de Canvas 2D sigue siendo más sencillo que el de WebGL. Conviene evaluar retención y progresión con jugadores reales antes de añadir más salas.
