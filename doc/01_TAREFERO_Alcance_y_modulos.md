# Tarefero — 01. Visión, alcance y módulos

**Versión:** 1.0 · **Fecha:** 23 de octubre de 2026  
**Estado:** propuesta funcional consolidada para revisión y posterior especificación.  
**Proyecto:** TAREFERO_V2.

## Responsabilidad de este archivo

Define para quién se construye Tarefero, qué problemas debe resolver, sus límites, los módulos previstos y el resultado esperado. No define tablas definitivas, endpoints ni obligaciones legales. Los campos candidatos se desarrollan en el archivo 02; los procesos y estados en el 03; la arquitectura y los requisitos técnicos en el 04.

## 1. Lectura y fuentes

Este conjunto parte de `tarefero-documentacion-inicial.md` y de las definiciones de esta conversación: gestión multicultivo, utilidad operativa, personalización controlada y trazabilidad como prioridad. Se entrega como documentación nueva; no sustituye físicamente el documento original.

Orden recomendado:

1. `01_TAREFERO_Alcance_y_modulos.md`: producto, alcance y prioridades.
2. `02_TAREFERO_Modelo_de_dominio_y_campos.md`: entidades, campos, relaciones y reglas.
3. `03_TAREFERO_Flujos_y_trazabilidad.md`: funcionamiento de extremo a extremo.
4. `04_TAREFERO_Arquitectura_y_criterios_tecnicos.md`: implementación y criterios de aceptación transversales.

### 1.1 Grado de definición

| Marca | Significado |
|---|---|
| Acordado | Dirección expresada por el usuario o decisión confirmada en el documento inicial. |
| Propuesta | Diseño recomendado para concretar esa dirección; requiere validación funcional antes de desarrollar. |
| Pendiente | Alternativa que afecta el comportamiento y todavía debe resolverse. |
| Futuro | Capacidad fuera de la primera entrega, conservando una vía de evolución. |

**Acordado:** producto multicultivo; núcleo común; adaptación por cultivo; enfoque práctico; trazabilidad; separación web/campo; funcionamiento offline en Android; SaaS multiempresa; Mapbox; NestJS, Next.js y PostgreSQL/PostGIS como base tecnológica.

**Propuesta:** estructuras de entidades de este conjunto, separación operativa entre campaña y ciclo, perfiles versionados, fases y estados. Kotlin/Compose/Room/WorkManager siguen la opción recomendada del documento de origen; su adopción definitiva debe registrarse antes de iniciar la aplicación. TypeORM continúa como ORM considerado, no se convierte aquí en una decisión cerrada.

## 2. Visión del producto

Tarefero será una plataforma para administrar establecimientos agrícolas con uno o varios cultivos, especialmente yerba mate, cítricos y nuez pecán. Debe permitir conocer qué se hizo, dónde, cuándo, por quién, con qué recursos, con qué producción y con qué costo, además de seguir los movimientos de insumos, mercadería y dinero.

El sistema no requiere que el productor lleve registros científicos exhaustivos. Debe aceptar una captura básica útil y permitir mayor detalle cuando la operación lo justifique. Los datos obligatorios se justifican por integridad, trazabilidad o necesidad del proceso.

### 2.1 Resultados esperados

- Conocer chacras, lotes, implantaciones y superficie productiva.
- Consultar el historial de un lote aunque cambie de cultivo.
- Registrar labores y personas participantes, con horas individuales.
- Explicar el stock por movimientos y distinguir existencias centrales de operaciones móviles pendientes.
- Registrar cosechas, pesajes, partidas, almacenamientos y entregas.
- Seguir compras, recepciones, obligaciones y pagos sin confundirlos.
- Registrar observaciones de campo con fecha, notas y evidencia.
- Consultar costos directos y producción por implantación, campaña, lote y período.
- Corregir errores sin borrar silenciosamente los hechos anteriores.
- Trabajar durante horas o días sin conexión en las operaciones de campo habilitadas.

### 2.2 Ejemplo de una empresa multicultivo

Una empresa administra tres chacras. Una tiene yerba mate y naranja; otra pecán; la tercera combina lotes productivos y sectores de servicios. Comparte empleados, proveedores, almacenes y maquinaria. Cada implantación conserva su cultivo, variedad principal, superficie e historial. El catálogo de labores puede compartir fertilización o desmalezado; cada perfil muestra los datos pertinentes. Los informes permiten ver toda la empresa o filtrar un cultivo sin duplicar módulos.

## 3. Alcance y límites

### 3.1 Incluido en la visión completa

Gestión organizacional, territorial, agronómica operativa, laboral de gestión, inventario, compras, producción, entregas, economía administrativa, documentos, reportes y sincronización.

### 3.2 Fuera del alcance inicial

- Contabilidad formal, libros contables y estados contables.
- Liquidación legal completa de sueldos, cargas sociales y convenios.
- Facturación electrónica e integraciones fiscales.
- Prescripciones automáticas de tratamientos o recomendaciones agronómicas.
- Modelos científicos de fenología, predicción de rendimiento o diagnóstico automático.
- Seguimiento obligatorio de cada árbol.
- Procesamiento industrial completo, elaboración y transformación de productos.
- Plataforma cartográfica o meteorológica propia.
- Un editor universal que permita a cada empresa programar procesos arbitrarios.
- Aplicación iOS en la primera etapa.

Puede registrarse una factura o un recibo como comprobante adjunto sin emitir comprobantes fiscales. Puede calcularse un costo laboral gerencial sin presentarlo como liquidación legal.

### 3.3 Niveles de uso

| Nivel | Qué exige | Qué habilita |
|---|---|---|
| Básico | Identidad, fecha, ubicación pertinente, responsable y cantidad/unidad cuando aplique | Historial operativo e informes básicos. |
| Profesional | Partidas, pesajes, consumos, horas, tarifas, estados y documentos | Conciliación de recursos, costos y producción. |
| Avanzado | Muestreos, métricas adicionales, sectores, maquinaria y distribución de costos | Análisis más detallado sin cambiar el núcleo. |

## 4. Organización del dominio

### 4.1 Núcleo común

Empresas, acceso, chacras, lotes, trabajadores, cuadrillas, proveedores, compras, productos, unidades, almacenes, transferencias, pagos, archivos y auditoría.

### 4.2 Contexto agrícola

Cultivos, variedades, implantaciones, campañas, ciclos, labores, observaciones y cosechas. Estas entidades son compartidas; la información seleccionada y algunas reglas varían por perfil.

### 4.3 Personalización

Un perfil define catálogos compatibles, formularios y atributos complementarios. No cambia permisos, propiedad de empresa, integridad de movimientos, reglas monetarias ni el significado de campos históricos.

No se crean un módulo de stock o un módulo de empleados por cultivo. No se asocia cada almacén a un único cultivo. El destino productivo se conoce mediante consumos e imputaciones.

## 5. Usuarios y aplicaciones

| Perfil orientativo | Necesidad | Acciones típicas |
|---|---|---|
| Propietario/gerente | Visión general | Indicadores, costos, producción, configuración autorizada. |
| Administrador | Operación de oficina | Compras, documentos, pagos, maestros y revisión. |
| Encargado de campo/capataz | Registrar ejecución | Asistencia, labores, cosechas y observaciones. |
| Encargado de almacén | Custodia de existencias | Recepciones, transferencias, recuentos y ajustes. |
| Responsable técnico | Seguimiento agrícola | Observaciones, etapas, revisión y planificación. |
| Consulta | Acceso de lectura | Informes y fichas dentro de su alcance. |

Los perfiles son orientativos. Los permisos se definen por acción y alcance, no por comparar nombres de roles en el código. Un empleado puede existir sin usuario; un usuario puede no ser empleado.

### 5.1 Web administrativa

Gestiona configuración, usuarios, maestros, territorio, planificación, compras, inventario, economía, revisión, reportes y auditoría. También puede registrar operaciones de campo si cuenta con permisos.

### 5.2 Android de campo

Permite consultar datos asignados, registrar asistencia, labores, participaciones, consumos declarados, observaciones, cosechas, pesajes y adjuntos. Muestra pendientes, rechazos y conflictos. La gestión financiera sensible y la edición compleja de configuración quedan inicialmente en la web.

## 6. Módulos y responsabilidades

### 6.1 Plataforma y seguridad

**Objetivo:** identificar usuarios y limitar sus operaciones por empresa y recurso.  
**Incluye:** empresas, usuarios, membresías, roles, permisos, sesiones y dispositivos.  
**Resultado:** cada acción tiene un actor autorizado; una empresa no accede a información de otra.  
**Límite:** el plan comercial y la facturación del SaaS son futuros.

### 6.2 Establecimientos y lotes

**Objetivo:** representar dónde se realiza la actividad.  
**Incluye:** chacras, lotes, referencias territoriales, geometrías y superficies.  
**Resultado:** ficha e historial territorial consultables en mapa y listado.  
**Regla:** superficie cartográfica, declarada, productiva y trabajada tienen significados distintos. Los cambios importantes de delimitación no deben reescribir rendimientos pasados.

### 6.3 Cultivos e implantaciones

**Objetivo:** conservar qué cultivo estuvo establecido y durante qué período.  
**Incluye:** grupos, cultivos, variedades, implantaciones, eventos de replante/baja y perfiles.  
**Resultado:** historial productivo independiente del nombre o cultivo actual del lote.  
**Límite:** una variedad principal es suficiente inicialmente; mezcla de variedades y sectores detallados se incorporan cuando se necesitan.

### 6.4 Campañas y ciclos

**Objetivo:** organizar planificación, costos y producción.  
**Propuesta:** campaña como agrupación de gestión; ciclo como período productivo de una implantación. Una campaña agrupa ciclos y no impone fechas anuales universales.  
**Resultado:** comparaciones con alcance y fechas explícitas.  
**Regla:** cerrar una campaña no elimina las deudas, existencias ni implantaciones que continúan vigentes.

### 6.5 Personal, cuadrillas y asistencia

**Objetivo:** saber quién trabajó, cuándo y en qué.  
**Incluye:** empleados, categorías, integrantes históricos de cuadrilla, intervalos de asistencia y tarifas.  
**Resultado:** presencia y horas imputadas consultables por separado.  
**Límite:** estimación remunerativa de gestión; liquidación oficial fuera del inicio.

### 6.6 Labores

**Objetivo:** registrar ejecución y recursos.  
**Incluye:** tipos compatibles con varios cultivos, órdenes opcionales, ejecución, trabajadores, insumos y maquinaria.  
**Resultado:** historial de trabajos y costos directos.  
**Regla:** una labor general puede pertenecer a una chacra o un almacén sin exigir una implantación. Para intervenciones agrícolas productivas, el contexto debe ser preciso. La superficie efectivamente trabajada puede diferir de la superficie del lote.

### 6.7 Productos, insumos e inventario

**Objetivo:** conocer cantidades disponibles, procedencia y destino.  
**Incluye:** artículos, unidades, presentaciones, partidas, almacenes, movimientos, transferencias, recuentos y ajustes.  
**Resultado:** cualquier saldo puede explicarse por operaciones confirmadas.  
**Regla:** un artículo puede servir a varios cultivos. Una transformación con rendimiento no es una conversión de unidades.

### 6.8 Proveedores y compras

**Objetivo:** seguir adquisición, recepción y deuda.  
**Incluye:** proveedores, compras, detalles, recepciones parciales y comprobantes.  
**Resultado:** diferencias entre solicitado/comprado, recibido y pagado.  
**Límite:** órdenes formales y solicitudes de compra pueden incorporarse después de la compra directa.

### 6.9 Seguimiento de campo

**Objetivo:** registrar observaciones útiles y comparables.  
**Incluye:** observaciones generales, fenológicas y sanitarias; etapa, descripción, severidad o mediciones cuando corresponda; fotografías.  
**Resultado:** historial fechado por implantación o ubicación.  
**Regla:** no se exige una progresión fenológica automática ni una medición científica para registrar una novedad.

### 6.10 Cosechas, producción y entregas

**Objetivo:** seguir lo recolectado hasta su almacenamiento o entrega.  
**Incluye:** cosecha, partidas, producto obtenido, clasificación, pesajes, trabajadores, documentos y entregas con origen explícito.  
**Resultado:** conciliación entre cantidad estimada, pesada, almacenada, despachada y reconocida por destino.  
**Regla:** la venta o el cobro no se deducen automáticamente de la entrega.

### 6.11 Gestión económica

**Objetivo:** registrar obligaciones, movimientos de dinero y costos gerenciales.  
**Incluye:** gastos, ingresos administrativos, cuentas de dinero, pagos, cobros, medios, condiciones, imputaciones y costos directos.  
**Resultado:** pendientes y análisis económico sin duplicar compra, pago y consumo como si fueran el mismo costo.  
**Límite:** no es un sistema contable formal ni una plataforma bancaria.

### 6.12 Archivos y trazabilidad

**Objetivo:** asociar evidencia y conservar las conexiones del negocio.  
**Incluye:** documentos, tickets, imágenes, relaciones explícitas, historial de estados y auditoría.  
**Resultado:** navegación desde un hecho hacia sus antecedentes, consecuencias y correcciones.  
**Regla:** un adjunto complementa los datos estructurados; no sustituye las relaciones.

### 6.13 Reportes

**Objetivo:** convertir registros en decisiones.  
**Incluye:** producción, existencias, labores, personal, costos, pendientes y trazabilidad.  
**Resultado:** filtros por empresa, período, chacra, lote, cultivo, implantación y campaña cuando sean aplicables.  
**Regla:** mostrar unidad, estado de los datos, fuente y metodología. No sumar cantidades físicamente incomparables.

### 6.14 Maquinaria — ampliación

**Objetivo:** registrar uso, combustible y mantenimiento.  
**Resultado:** costos y disponibilidad de equipos.  
**Prioridad:** posterior, salvo necesidad comercial inmediata.

## 7. Trazabilidad mínima exigida

Todo hecho confirmado relevante debe permitir responder: qué ocurrió, cuándo ocurrió, cuándo se cargó, dónde, quién participó, quién lo registró, qué cantidades/unidades intervienen, de qué operación proviene, qué operación produjo y cómo fue corregido.

Las operaciones económicas o físicas confirmadas se anulan o compensan conforme a su módulo. La edición de un borrador puede ser libre dentro de permisos; la modificación de un hecho confirmado necesita un procedimiento explícito.

### 7.1 Tres niveles complementarios

1. **Historial de negocio:** movimientos, eventos de implantación, tarifas aplicadas, pesajes y cambios de estado.
2. **Relaciones operativas:** recepción → movimiento → consumo → labor; cosecha → partida → entrega → ingreso → cobro.
3. **Auditoría técnica:** actor, fecha del servidor, acción, recurso, origen y resultado.

## 8. Etapas propuestas

| Etapa | Entrega | Condición de salida |
|---|---|---|
| 0. Definiciones | Reglas de contexto, estados, campaña, unidades y permisos | Casos representativos de los tres cultivos resueltos en papel. |
| 1. Fundamentos | Empresa, acceso, chacras, lotes, cultivos, implantaciones, archivos y auditoría | Aislamiento e historial básico verificados. |
| 2. Campo | Personal, asistencia, labores y sincronización | Crear offline, reenviar y corregir sin duplicaciones. |
| 3. Recursos | Productos, proveedores, compras, almacenes, recepciones y consumos | Stock explicable y transferencias conciliables. |
| 4. Producción | Campañas/ciclos, observaciones, cosechas, partidas y entregas | Producción trazable desde origen a destino. |
| 5. Economía | Pagos, cobros, imputaciones, costos e indicadores | Saldos y costos sin doble contabilización gerencial. |
| 6. Extensiones | Maquinaria, métricas avanzadas e integraciones | Incorporación según demanda real. |

La sincronización se diseña desde la etapa 1; no se agrega al final. Campañas e inventario deben estar definidos antes de cerrar las integraciones que dependan de ellos.

## 9. Criterios de éxito funcional

- La misma empresa administra yerba, naranja y pecán sin duplicar módulos.
- Cambiar una variedad, una tarifa o un perfil no modifica registros anteriores.
- Puede registrarse un trabajo general y otro sobre una implantación.
- Puede recibirse parcialmente una compra y pagarla en varias ocasiones.
- Una transferencia permite explicar diferencias entre despacho y recepción.
- Una cosecha puede tener varias partidas y varias entregas; una entrega puede reunir partidas distintas.
- Un registro offline rechazado conserva datos y una explicación corregible.
- Una anulación deja visible su motivo y sus efectos relacionados.
- Los informes distinguen estimaciones de cantidades confirmadas.
- Un administrador puede reconstruir un circuito completo sin depender de notas libres.

## 10. Decisiones pendientes con impacto

| Decisión | Propuesta inicial | Debe cerrarse antes de |
|---|---|---|
| Campañas/ciclos | Campaña agrupa ciclos de implantación | Módulo productivo y costos por campaña. |
| Múltiples cultivos simultáneos en un lote | Admitirlos solo con sector/superficie diferenciable | Implantaciones. |
| Stock negativo | Bloquear confirmación por defecto; revisar excepción autorizada | Consumos y transferencias. |
| Aprobaciones | Simples y por operación sensible | Estados y permisos. |
| Valuación de existencias | Elegir un método único inicial y conservar costos aplicados | Costos de consumos. |
| Remuneración | Priorizar hora, jornal y producción, validar casos mixtos | Cálculo laboral. |
| Origen de producción laboral | Cosecha como fuente de cantidades; labor como ejecución vinculada | Integración cosecha/personal. |
| Monedas y conversiones | Moneda de empresa; documentos pueden conservar moneda original | Informes económicos. |
| Uso offline | Ventana y operaciones habilitadas por rol | App de campo. |
| Alcance del primer piloto | Seleccionar circuitos completos, no pantallas aisladas | Plan de implementación. |

## 11. Gobierno documental

Este archivo controla el alcance, no el esquema de persistencia. Toda nueva capacidad debe indicar problema resuelto, usuarios, datos mínimos, efectos de stock/dinero, trazabilidad y prioridad. Si cambia una responsabilidad, actualizar los otros tres archivos afectados. Las decisiones definitivas se registran con fecha y motivo; no se convierten propuestas en acuerdos sin validación.
