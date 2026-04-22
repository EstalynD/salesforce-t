# AcmeProject

## 1. Resumen del Proyecto y Supuestos

He desarrollado un sistema de gestión de contratos para consultores dentro de Salesforce para optimizar el ciclo de vida de los "Engagements".

### Supuestos

- La etapa "Negotiation/Review" es el disparador principal para la preparación de propuestas.
- El término "Días hábiles" excluye sábados y domingos para el cálculo de fechas de vencimiento.
- Se utilizan Page Layouts estándar para la visualización inicial de los componentes.

## 2. Implementación Funcional y Pruebas (#3-#8)

### #3 Objeto Personalizado y #4 Campos

Se creó el objeto `Engagement__c` con relaciones (Lookups) a `Account` y `Opportunity`, y campos de negocio como estado, presupuesto y fechas.

Prueba:

Crear un registro de Engagement y verificar que todos los campos estén disponibles y operativos.

### #5 Vista de Lista (List View)

Se configuró la vista `Recent Engagements` con un gráfico de dona agrupado por estado.

Prueba:

Ir a la pestaña Engagements y seleccionar la vista `Recent Engagements`.

### #6 LWC y Apex

Se desarrolló el componente `engagementSummary` y la clase `EngagementController`.

Prueba:

Abrir un registro de Engagement. Verificar el monto de la oportunidad y los contadores de actividad. Hacer clic en `Quick Follow-Up Call` para generar una tarea para el día siguiente.

### #7 Flujo de Automatización (Flow)

Flow activado por registro en `Opportunity`.

Prueba:

Cambiar la etapa de una oportunidad a `Negotiation/Review`. Revisar el Engagement relacionado para confirmar la creación de la tarea `Prepare proposal` con vencimiento `Hoy + 2 días hábiles`.

### #8 Reportes

Se creó el `Report Type` `Engagements with Opportunities` y el reporte `Engagement Pipeline`.

Prueba:

Abrir el reporte `Engagement Pipeline` para visualizar el gráfico de barras y el resumen financiero.

## 3. Activos Técnicos (Rutas de Código Fuente)

- Apex Controller: `force-app/main/default/classes/EngagementController.cls`
- Apex Metadata: `force-app/main/default/classes/EngagementController.cls-meta.xml`
- LWC Bundle: `force-app/main/default/lwc/engagementSummary/`
- `engagementSummary.html`
- `engagementSummary.js`
- `engagementSummary.js-meta.xml`
- LWC Test: `force-app/main/default/lwc/engagementSummary/__tests__/engagementSummary.test.js`
