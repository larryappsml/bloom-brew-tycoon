# Auditoría económica v1.14.0

Se comparan dos semillas deterministas (1 y 37), con 90 segundos de calentamiento y ocho minutos de medición por escenario. Paso de simulación: 0,25 s. Personal automático, especialidad equilibrada y reputación inicial 90; sin hora punta ni retos. Se cuentan los eventos de servicios terminados, descontando materiales y salarios. Se excluyen propinas, premios y ganancias offline. Los importes son promedios de simulación, no promesas de ingresos constantes.

Los escenarios reproducibles y el coste directo por área están en los JSON adjuntos. La instructora compartida se asigna a pilates; yoga reutiliza ese personal. Las inversiones no vuelven a cargar los prerrequisitos de otras áreas.

| Área | Apertura antes €/min | Apertura ahora €/min | Máximo antes €/min | Máximo ahora €/min | Amortización apertura ahora (min) |
|---|---:|---:|---:|---:|---:|
| Cafetería | 72 | 79 | 626 | 855 | 29 |
| Pilates | 21 | 105 | 446 | 1063 | 14 |
| Yoga | 28 | 132 | 268 | 899 | 27 |
| Recuperación | 55 | 214 | 343 | 1101 | 34 |
| Crossfit | 20 | 285 | 128 | 1200 | 30 |
| Pádel | 44 | 440 | 88 | 1775 | 30 |
| Sedes satélite (2) | 0 | 0 | 126 | 1260 | — |

## Criterios y cambios

- La cafetería inicial conserva su economía manual. Nuevas recetas aportan calidad y los niveles avanzados de receta suben sus tarifas. Se rebajan mejoras cuyo incremento no justificaba el coste.
- Pilates, wellness, yoga y deportes aumentan sus tarifas y los beneficios de equipamiento; conservan aforo y tiempos. Salarios y materiales siguen descontándose. Crossfit paga 12 €/participante de salario, pádel 16 €, tratamientos 8 € y yoga 3 €.
- Las áreas básicas avanzadas recuperan su inversión directa en aproximadamente 14–34 minutos de producción continua en estos escenarios. El equipamiento mejora su producción; algunas compras de capacidad no elevan el neto si ya limita la demanda o la cola, y el panel lo explica.
- Se calibra la estimación con preparación, cola y ocupación del café, tamaño esperado de clases y relevo de tratamientos y grupos. Las sedes satélite aportan 630 €/min cada una tras gastos.
- Las mejoras muestran su incremento automático previsto para el centro y el plazo de amortización incremental. Es una previsión estacionaria; no acelera clases o sesiones ya contratadas.
- Se mantienen límites de mejoras, aforo, pago único por servicio, espera y satisfacción, especialidades, horarios de propina, 35 % offline con un máximo de cuatro horas y guardados v1/v2. No se alteran saldos ni estadísticas históricos.

## Reproducción y regresión

`node scripts/economy-audit.cjs docs/economy-after-v1.14.json`

`node --test tests/economy-balance.test.cjs` comprueba progresión por áreas, retorno de inversión, crecimiento acotado, ausencia de disminuciones al mejorar en dos configuraciones, la previsión de inversión sin mutar la partida y costes de tratamiento fijados al empezar. La suite completa añade simulaciones de una hora, tráfico, capacidad, guardado y pagos únicos.
