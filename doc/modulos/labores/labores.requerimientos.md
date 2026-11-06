---
type: requirements
module: "LAB"
status: Aprobado
owner: "Analista"
---

# Labores — Requerimientos

## 1. Reglas de negocio

### LAB-BR-001 — Aislamiento por Empresa

- **Estado:** Aprobado
- **Origen:** `B-01`; arquitectura multiempresa aprobada
- **Tipo:** Invariante
- **Regla:** Todo Tipo de Labor, Orden, ejecución, participación y recurso declarado pertenece a una única Empresa mediante `empresaId`; todas sus referencias deben pertenecer a esa misma Empresa.
- **Si se incumple:** se rechaza con `LAB_TENANT_INVALIDO`.

| Situación | Resultado |
|---|---|
| Una Orden referencia un Tipo de Labor de su Empresa | Se acepta |
| Dos Empresas usan el código PODA | Se acepta |
| Una ejecución incorpora un Empleado de otra Empresa | Se rechaza con `LAB_TENANT_INVALIDO` |

### LAB-BR-002 — Identidad del Tipo de Labor

- **Estado:** Aprobado
- **Origen:** `B-01`, `LAB-Q-017`
- **Tipo:** Invariante
- **Regla:** Cada Tipo de Labor tiene código inmutable y nombre obligatorios, únicos dentro de la Empresa; puede cambiar entre ACTIVO e INACTIVO, no se elimina físicamente y sus usos históricos permanecen consultables.
- **Si se incumple:** se rechaza con `LAB_TIPO_LABOR_INVALIDO`.

| Situación | Resultado |
|---|---|
| Código nuevo y nombre nuevo dentro de la Empresa | Se acepta |
| Otra Empresa usa el mismo código | Se acepta |
| Se repite código o se intenta borrar un Tipo usado | Se rechaza con `LAB_TIPO_LABOR_INVALIDO` |

### LAB-BR-003 — Catálogo reutilizable entre Campañas

- **Estado:** Aprobado
- **Origen:** `B-01`, `B-04`, `LAB-Q-002`
- **Tipo:** Invariante
- **Regla:** Los Tipos de Labor pertenecen a la Empresa y pueden reutilizarse entre Campañas; no pertenecen a una Campaña ni reinician con ella.
- **Si se incumple:** se rechaza con `LAB_CATALOGO_CAMPANIA_INVALIDO`.

| Situación | Resultado |
|---|---|
| La Campaña nueva usa el Tipo Cortar pasto existente | Se acepta |
| Se inactiva un Tipo después de usarlo | La historia permanece |
| Se intenta trasladar una ejecución histórica a otra Campaña | Se rechaza con `LAB_CATALOGO_CAMPANIA_INVALIDO` |

### LAB-BR-004 — Campaña obligatoria e inmutable

- **Estado:** Aprobado
- **Origen:** `B-04`, `LAB-Q-003`, `LAB-Q-016`; `CUL-BR-016`, `CUL-BR-018`
- **Tipo:** Invariante
- **Regla:** Toda Orden y ejecución referencia una Campaña válida de su Empresa; esa referencia no cambia después de crear el registro y una Campaña CERRADA no admite nuevos hechos.
- **Si se incumple:** se rechaza con `LAB_CAMPANIA_INVALIDA`.

| Situación | Resultado |
|---|---|
| Reparación general asociada a una Campaña válida | Se acepta |
| Consultar una ejecución de una Campaña anterior | Se acepta |
| Crear un hecho en Campaña CERRADA o cambiar su Campaña | Se rechaza con `LAB_CAMPANIA_INVALIDA` |

### LAB-BR-005 — Separación al cambiar de Campaña

- **Estado:** Aprobado
- **Origen:** `B-04`, `LAB-Q-016`; `CUL-BR-016`
- **Tipo:** Temporal
- **Regla:** El trabajo que deba imputarse a otra Campaña se registra en otra Orden o ejecución; nunca se reasignan a la nueva Campaña hechos, tiempos, recursos o costos de la anterior.
- **Si se incumple:** se rechaza con `LAB_CRUCE_CAMPANIA_INVALIDO`.

| Situación | Resultado |
|---|---|
| Se cierra una parte y se crea otra en la Campaña nueva | Se acepta |
| Ambas partes quedan vinculadas para consulta | Se acepta |
| Se cambia `campaniaId` de la ejecución anterior | Se rechaza con `LAB_CRUCE_CAMPANIA_INVALIDO` |

### LAB-BR-006 — Contexto exigido por Tipo de Labor

- **Estado:** Aprobado
- **Origen:** `B-01`, `B-04`, `LAB-Q-018`; `TER-DEP-004`, `CUL-DEP-004`
- **Tipo:** Validación
- **Regla:** Cada Tipo de Labor declara el contexto territorial y productivo que exige; toda Labor requiere Campaña y puede requerir Chacra, Lote, Implantación, Ciclo o instalación según su naturaleza, sin inventar referencias no aplicables.
- **Si se incumple:** se rechaza con `LAB_CONTEXTO_INVALIDO`.

| Situación | Resultado |
|---|---|
| Reparar un alambrado con Campaña y Chacra | Se acepta |
| Poda productiva con Lote, Implantación y Ciclo compatibles | Se acepta |
| Intervención productiva sin el contexto exigido | Se rechaza con `LAB_CONTEXTO_INVALIDO` |

### LAB-BR-007 — Orden y ejecuciones reales

- **Estado:** Aprobado
- **Origen:** `B-01`, `LAB-Q-004`, `LAB-Q-005`
- **Tipo:** Invariante
- **Regla:** Una Orden conserva la planificación y puede originar una o varias ejecuciones reales; cada ejecución conserva sus propios participantes, tiempos, cantidades y recursos.
- **Si se incumple:** se rechaza con `LAB_EJECUCION_ORDEN_INVALIDA`.

| Situación | Resultado |
|---|---|
| Una Orden se ejecuta durante tres jornadas | Se registran tres ejecuciones |
| Una ejecución difiere de la superficie planificada | Se conserva la diferencia |
| Se reemplazan ejecuciones reales por los datos de la Orden | Se rechaza con `LAB_EJECUCION_ORDEN_INVALIDA` |

### LAB-BR-008 — Ejecución directa

- **Estado:** Aprobado
- **Origen:** `LAB-Q-004`
- **Tipo:** Invariante
- **Regla:** Una ejecución imprevista puede registrarse sin Orden previa, pero debe cumplir las mismas reglas de Empresa, Campaña, contexto, participantes y trazabilidad.
- **Si se incumple:** se rechaza con el código de la regla incumplida.

| Situación | Resultado |
|---|---|
| Reparación urgente sin planificación | Se acepta como ejecución directa |
| Ejecución directa con todos los datos exigidos | Se acepta |
| Ejecución directa sin Campaña | Se rechaza con `LAB_CAMPANIA_INVALIDA` |

### LAB-BR-009 — Ciclo de la Orden

- **Estado:** Aprobado
- **Origen:** `B-01`, `LAB-Q-005`, `LAB-Q-006`, `LAB-Q-022`
- **Tipo:** Transición
- **Regla:** Una Orden pasa de BORRADOR a PLANIFICADA, de PLANIFICADA a EN_EJECUCION cuando comienza su primera ejecución y a COMPLETADA cuando se declara cumplida; el Administrador o el Capataz pueden gestionar esas transiciones, puede CANCELARSE con motivo y nunca elimina ejecuciones existentes.
- **Si se incumple:** se rechaza con `LAB_TRANSICION_ORDEN_INVALIDA`.

| Situación | Resultado |
|---|---|
| Planificar una Orden BORRADOR válida | Pasa a PLANIFICADA |
| Completar una Orden con sus ejecuciones conservadas | Se acepta |
| Cancelar y borrar una ejecución realizada | Se rechaza con `LAB_TRANSICION_ORDEN_INVALIDA` |

### LAB-BR-010 — Ciclo de la ejecución

- **Estado:** Aprobado
- **Origen:** `B-01`, `LAB-Q-006`, `LAB-Q-014`, `LAB-Q-022`
- **Tipo:** Transición
- **Regla:** Una ejecución usa BORRADOR, EN_CURSO, PAUSADA, FINALIZADA, CONFIRMADA, CANCELADA o ANULADA; el Capataz puede gestionar el ciclo cotidiano hasta FINALIZADA y esta requiere revisión del Administrador antes de CONFIRMADA.
- **Si se incumple:** se rechaza con `LAB_TRANSICION_EJECUCION_INVALIDA`.

| Situación | Resultado |
|---|---|
| Pausar y luego reanudar una ejecución | Se acepta |
| Finalizar y luego confirmar | Se acepta |
| Volver una ejecución CONFIRMADA a EN_CURSO | Se rechaza con `LAB_TRANSICION_EJECUCION_INVALIDA` |

### LAB-BR-011 — Cancelación con hechos parciales

- **Estado:** Aprobado
- **Origen:** `B-01`, `LAB-Q-014`
- **Tipo:** Transición
- **Regla:** Cancelar una ejecución iniciada exige motivo y conserva participantes, tiempos, cantidades, notas y recursos efectivamente utilizados; no revierte automáticamente sus efectos reales.
- **Si se incumple:** se rechaza con `LAB_CANCELACION_INVALIDA`.

| Situación | Resultado |
|---|---|
| Cancelar antes de iniciar | Se conserva la cancelación y su motivo |
| Cancelar después de consumir un Insumo | Se conserva el consumo real |
| Cancelar intentando borrar la actividad parcial | Se rechaza con `LAB_CANCELACION_INVALIDA` |

### LAB-BR-012 — Participación individual histórica

- **Estado:** Aprobado
- **Origen:** `B-01`, `LAB-Q-008`; `PER-BR-013`, `PER-BR-014`
- **Tipo:** Invariante
- **Regla:** Toda ejecución conserva los Empleados que participaron realmente; una Cuadrilla asignada es una referencia operativa y nunca sustituye el detalle individual ni se reconstruye desde su composición futura.
- **Si se incumple:** se rechaza con `LAB_PARTICIPACION_INVALIDA`.

| Situación | Resultado |
|---|---|
| Participan dos integrantes y uno ajeno a la Cuadrilla | Se conservan los tres Empleados reales |
| La Cuadrilla cambia después | La ejecución no cambia |
| Se confirma solo con `cuadrillaId` y sin participantes | Se rechaza con `LAB_PARTICIPACION_INVALIDA` |

### LAB-BR-013 — Tiempo y cantidad individual

- **Estado:** Aprobado
- **Origen:** `B-01`, `B-03`, `LAB-Q-008`, `LAB-Q-010`
- **Tipo:** Validación
- **Regla:** Cada participación puede conservar intervalos, minutos y cantidad atribuida individualmente; los valores deben ser no negativos, usar la unidad exigida y corresponder a la ejecución.
- **Si se incumple:** se rechaza con `LAB_APORTE_INDIVIDUAL_INVALIDO`.

| Situación | Resultado |
|---|---|
| Una persona participa seis horas y otra tres | Se conservan nueve horas-persona |
| Un participante no recibe cantidad porque solo se registran horas | Se acepta cuando el Tipo lo permite |
| Cantidad negativa o unidad incompatible | Se rechaza con `LAB_APORTE_INDIVIDUAL_INVALIDO` |

### LAB-BR-014 — Sin superposición individual

- **Estado:** Aprobado
- **Origen:** `LAB-Q-012`
- **Tipo:** Temporal
- **Regla:** Un Empleado no puede tener intervalos confirmados que se superpongan entre ejecuciones de Labor de la misma Empresa.
- **Si se incumple:** se rechaza con `LAB_INTERVALO_SUPERPUESTO`.

| Situación | Resultado |
|---|---|
| Dos intervalos consecutivos | Se acepta |
| Intervalos borrador todavía no confirmados | Se muestran para revisión |
| Dos intervalos confirmados superpuestos | Se rechaza con `LAB_INTERVALO_SUPERPUESTO` |

### LAB-BR-015 — Diferencia respecto de asistencia

- **Estado:** Aprobado
- **Origen:** `B-03`, `LAB-Q-012`
- **Tipo:** Validación
- **Regla:** La diferencia entre tiempo de asistencia y tiempo imputado a Labores se informa para revisión, pero no bloquea automáticamente una ejecución; asistencia e imputación conservan fuentes independientes.
- **Si se incumple:** no aplica; se informa la diferencia.

| Situación | Resultado |
|---|---|
| Ocho horas de asistencia y ocho imputadas | Se informa coincidencia |
| Ocho horas de asistencia y siete imputadas | Se informa una hora no imputada |
| No existe asistencia confirmada | La Labor conserva su propio registro y se informa la ausencia de contraste |

### LAB-BR-016 — Participación distribuible

- **Estado:** Aprobado
- **Origen:** `B-03`, `B-05`, `LAB-Q-010`
- **Tipo:** Cálculo
- **Regla:** Cuando una Labor usa monto total distribuible, todos los participantes reales reciben un porcentaje de contribución que suma 100 %; la propuesta inicial reparte en partes iguales y el Administrador puede modificarla con motivo.
- **Si se incumple:** se rechaza con `LAB_DISTRIBUCION_INVALIDA`.

| Situación | Resultado |
|---|---|
| Dos participantes sin ajuste | Se propone 50 % para cada uno |
| El Administrador justifica 20 % y 80 % | Se acepta |
| Los porcentajes suman 90 % | Se rechaza con `LAB_DISTRIBUCION_INVALIDA` |

### LAB-BR-017 — Separación de hechos y remuneración

- **Estado:** Aprobado
- **Origen:** `B-03`, `LAB-Q-009`, `LAB-Q-010`; `PER-Q-032`
- **Tipo:** Invariante
- **Regla:** LAB conserva participantes, tiempos, cantidades y porcentajes; PER es dueño de modalidades, tarifas, propuestas monetarias y devengos, y decide si una participación mensual genera o no un adicional.
- **Si se incumple:** se rechaza con `LAB_REMUNERACION_FUERA_DE_MODULO`.

| Situación | Resultado |
|---|---|
| LAB entrega 80 % de participación de Pedro | Se acepta |
| PER determina el importe variable de Pedro | Se acepta |
| LAB registra el pago final del Empleado | Se rechaza con `LAB_REMUNERACION_FUERA_DE_MODULO` |

### LAB-BR-018 — Ajuste remunerativo trazable

- **Estado:** Aprobado
- **Origen:** `B-03`, `LAB-Q-011`
- **Tipo:** Invariante
- **Regla:** Cuando el Administrador modifica para una Labor el monto sugerido por PER, se conservan el valor sugerido, el valor ajustado, el actor y el motivo bajo propiedad de PER y con referencia a la ejecución.
- **Si se incumple:** se rechaza con `LAB_AJUSTE_REMUNERACION_INVALIDO`.

| Situación | Resultado |
|---|---|
| Se acepta el valor sugerido sin cambio | Se conserva la aceptación |
| Se ajusta con motivo | Se conserva la diferencia en PER |
| Se reemplaza el valor sin motivo | Se rechaza con `LAB_AJUSTE_REMUNERACION_INVALIDO` |

### LAB-BR-019 — Magnitud exigida por Tipo de Labor

- **Estado:** Aprobado
- **Origen:** `B-01`, `B-03`, `LAB-Q-018`
- **Tipo:** Validación
- **Regla:** El Tipo de Labor define si exige superficie, tiempo, cantidad u otra unidad controlada; una ejecución no se confirma sin la magnitud requerida y su unidad compatible.
- **Si se incumple:** se rechaza con `LAB_MAGNITUD_REQUERIDA`.

| Situación | Resultado |
|---|---|
| Cortar pasto exige horas y se informan intervalos | Se acepta |
| Cosechar exige hectáreas y se informa una superficie positiva | Se acepta |
| Falta la cantidad exigida | Se rechaza con `LAB_MAGNITUD_REQUERIDA` |

### LAB-BR-020 — Superficie realmente trabajada

- **Estado:** Aprobado
- **Origen:** `B-01`, `B-05`, `LAB-Q-018`
- **Tipo:** Validación
- **Regla:** La superficie ejecutada es positiva cuando se exige y puede diferir de la superficie del Lote o de la planificada; nunca modifica la geometría territorial.
- **Si se incumple:** se rechaza con `LAB_SUPERFICIE_INVALIDA`.

| Situación | Resultado |
|---|---|
| Se trabajan 2 ha de un Lote de 5 ha | Se acepta |
| Se ejecuta menos que lo planificado | Se conserva la diferencia |
| Se informa superficie negativa | Se rechaza con `LAB_SUPERFICIE_INVALIDA` |

### LAB-BR-021 — Consumo declarado

- **Estado:** Aprobado
- **Origen:** `B-02`, `LAB-Q-013`
- **Tipo:** Validación
- **Regla:** Cada consumo declarado identifica Artículo, Almacén de origen, cantidad positiva y unidad; cuando INV exija partida también debe identificarla.
- **Si se incumple:** se rechaza con `LAB_CONSUMO_INVALIDO`.

| Situación | Resultado |
|---|---|
| Insumo con Almacén, cantidad y unidad | Se acepta como declarado |
| Artículo con partida obligatoria y partida informada | Se acepta |
| Cantidad cero o Almacén ajeno | Se rechaza con `LAB_CONSUMO_INVALIDO` |

### LAB-BR-022 — Confirmación independiente de consumos

- **Estado:** Aprobado
- **Origen:** `B-02`, `LAB-Q-013`
- **Tipo:** Transición
- **Regla:** Cada consumo pasa de DECLARADO a CONFIRMADO o RECHAZADO por INV; un rechazo no oculta ni revierte otros consumos y la ejecución puede confirmarse mostrando explícitamente sus líneas no confirmadas.
- **Si se incumple:** se rechaza con `LAB_ESTADO_CONSUMO_INVALIDO`.

| Situación | Resultado |
|---|---|
| Dos consumos confirmados y uno rechazado | Se conservan los tres estados |
| La ejecución se consulta | Muestra el efecto parcial |
| Se presenta como totalmente consumido lo rechazado | Se rechaza con `LAB_ESTADO_CONSUMO_INVALIDO` |

### LAB-BR-023 — Evidencia referenciada

- **Estado:** Aprobado
- **Origen:** `B-02`, `LAB-Q-015`
- **Tipo:** Invariante
- **Regla:** Órdenes y ejecuciones pueden conservar notas y referencias a imágenes o informes; los binarios pertenecen a ARC y no se copian en LAB.
- **Si se incumple:** se rechaza con `LAB_EVIDENCIA_INVALIDA`.

| Situación | Resultado |
|---|---|
| Ejecución con nota y referencia de imagen | Se acepta |
| Ejecución sin adjuntos | Se acepta |
| LAB intenta guardar el binario | Se rechaza con `LAB_EVIDENCIA_INVALIDA` |

### LAB-BR-024 — Finalización y confirmación separadas

- **Estado:** Aprobado
- **Origen:** `B-01`, `B-05`, `LAB-Q-006`, `LAB-Q-007`, `LAB-Q-022`
- **Tipo:** Transición
- **Regla:** El Capataz FINALIZA la ejecución cuando termina el trabajo; el Administrador la CONFIRMA después de revisar contexto, participantes, magnitudes, distribución y recursos.
- **Si se incumple:** se rechaza con `LAB_CONFIRMACION_INVALIDA`.

| Situación | Resultado |
|---|---|
| Capataz finaliza con datos completos | Pasa a FINALIZADA |
| Administrador revisa y confirma | Pasa a CONFIRMADA |
| Capataz intenta confirmar administrativamente | Se rechaza con `LAB_CONFIRMACION_INVALIDA` |

### LAB-BR-025 — Corrección y anulación auditadas

- **Estado:** Aprobado
- **Origen:** `B-02`, `B-05`; propuesta IA aceptada mediante `LAB-Q-006`
- **Tipo:** Transición
- **Regla:** Una ejecución CONFIRMADA no se edita ni elimina en lugar; el Administrador corrige mediante una nueva versión o ANULA con motivo, conservando actor, fecha y versión anterior.
- **Si se incumple:** se rechaza con `LAB_HECHO_CONFIRMADO_INMUTABLE`.

| Situación | Resultado |
|---|---|
| Corregir participantes con motivo | Se crea una nueva versión |
| Anular conservando la versión confirmada | Se acepta |
| Sobrescribir una ejecución confirmada | Se rechaza con `LAB_HECHO_CONFIRMADO_INMUTABLE` |

### LAB-BR-026 — Trabajo y producción separados

- **Estado:** Aprobado
- **Origen:** `B-01`, `B-03`, `LAB-Q-019`
- **Tipo:** Invariante
- **Regla:** LAB registra el trabajo de cosechar y sus participantes; COS registra producción, pesajes y cantidades obtenidas. Cuando corresponda se vinculan, pero no duplican la misma cantidad como dos fuentes productivas.
- **Si se incumple:** se rechaza con `LAB_PRODUCCION_DUPLICADA`.

| Situación | Resultado |
|---|---|
| Labor de cosecha vinculada con una Cosecha | Se acepta |
| Labor conserva horas y COS conserva kilogramos obtenidos | Se acepta |
| LAB vuelve a contabilizar la producción de COS | Se rechaza con `LAB_PRODUCCION_DUPLICADA` |

### LAB-BR-027 — Historia y reportes por Campaña

- **Estado:** Aprobado
- **Origen:** `B-04`, `LAB-Q-020`; `CUL-BR-016`, `CUL-BR-019`
- **Tipo:** Invariante
- **Regla:** LAB conserva cada hecho con su Campaña y REP calcula indicadores y acumulados desde esos hechos; iniciar otra Campaña no reinicia, elimina ni reasigna historia.
- **Si se incumple:** se rechaza con `LAB_HISTORIA_CAMPANIA_INALTERABLE`.

| Situación | Resultado |
|---|---|
| Consultar una Campaña nueva | No contiene ejecuciones propias todavía |
| Consultar una Campaña anterior | Conserva Labores y costos relacionados |
| Mover ejecuciones anteriores para reiniciar totales | Se rechaza con `LAB_HISTORIA_CAMPANIA_INALTERABLE` |

## 2. Requerimientos funcionales

### LAB-REQ-001 — Administrar Tipos de Labor
- **Estado:** Aprobado
- **Origen:** `B-01`, `LAB-Q-001`, `LAB-Q-002`, `LAB-Q-017`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir al Administrador crear, consultar, modificar, inactivar y reactivar Tipos de Labor de su Empresa conservando sus usos históricos.
- **Reglas que aplica:** `LAB-BR-001` a `LAB-BR-003`.

### LAB-REQ-002 — Configurar contexto y magnitudes
- **Estado:** Aprobado
- **Origen:** `B-01`, `LAB-Q-018`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir al Administrador definir para cada Tipo de Labor el contexto requerido y las magnitudes o unidades exigidas para confirmar su ejecución.
- **Reglas que aplica:** `LAB-BR-006`, `LAB-BR-019`, `LAB-BR-020`.

### LAB-REQ-003 — Asociar configuración remunerativa
- **Estado:** Aprobado
- **Origen:** `B-01`, `B-03`, `LAB-Q-009`, `LAB-Q-011`
- **Prioridad:** Must
- **Requerimiento:** Cuando el Administrador configure remuneración para un Tipo de Labor, el sistema debe coordinar con PER la modalidad, tarifa o monto sugerido sin copiar su propiedad monetaria en LAB.
- **Reglas que aplica:** `LAB-BR-017`, `LAB-BR-018`.

### LAB-REQ-004 — Planificar una Orden
- **Estado:** Aprobado
- **Origen:** `B-01`, `B-04`, `LAB-Q-003` a `LAB-Q-005`, `LAB-Q-021`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir al Administrador o al Capataz crear y planificar una Orden indicando Campaña, Tipo de Labor, contexto, fecha, alcance y participantes o Cuadrilla previstos.
- **Reglas que aplica:** `LAB-BR-001`, `LAB-BR-004`, `LAB-BR-006`, `LAB-BR-007`, `LAB-BR-009`.

### LAB-REQ-005 — Mantener el ciclo de una Orden
- **Estado:** Aprobado
- **Origen:** `B-01`, `LAB-Q-005`, `LAB-Q-006`, `LAB-Q-022`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir al Administrador o al Capataz modificar, completar o cancelar una Orden conservando las ejecuciones originadas y el motivo de cancelación.
- **Reglas que aplica:** `LAB-BR-007`, `LAB-BR-009`.

### LAB-REQ-006 — Registrar una ejecución
- **Estado:** Aprobado
- **Origen:** `B-01`, `LAB-Q-004`, `LAB-Q-005`, `LAB-Q-007`, `LAB-Q-021`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir al Administrador o al Capataz crear e iniciar una ejecución desde una Orden o registrarla directamente cuando no exista planificación previa.
- **Reglas que aplica:** `LAB-BR-004`, `LAB-BR-006` a `LAB-BR-010`.

### LAB-REQ-007 — Operar una ejecución
- **Estado:** Aprobado
- **Origen:** `B-01`, `LAB-Q-006`, `LAB-Q-014`, `LAB-Q-022`
- **Prioridad:** Must
- **Requerimiento:** Mientras una ejecución no esté confirmada, el sistema debe permitir al Capataz modificarla, pausarla, reanudarla, finalizarla o cancelarla con motivo y conservación de hechos parciales.
- **Reglas que aplica:** `LAB-BR-010`, `LAB-BR-011`, `LAB-BR-024`.

### LAB-REQ-008 — Registrar participación individual
- **Estado:** Aprobado
- **Origen:** `B-01`, `B-03`, `LAB-Q-008`, `LAB-Q-010`, `LAB-Q-012`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir al Capataz registrar los Empleados reales, intervalos, cantidades y contribución individual de cada participante en una ejecución.
- **Reglas que aplica:** `LAB-BR-012` a `LAB-BR-016`.

### LAB-REQ-009 — Registrar recursos utilizados
- **Estado:** Aprobado
- **Origen:** `B-02`, `LAB-Q-013`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir al Capataz declarar por ejecución los Artículos utilizados, sus cantidades, unidades, partidas requeridas y Almacenes de origen.
- **Reglas que aplica:** `LAB-BR-021`, `LAB-BR-022`.

### LAB-REQ-010 — Adjuntar notas y evidencias
- **Estado:** Aprobado
- **Origen:** `B-02`, `LAB-Q-015`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir agregar notas y referencias a imágenes o informes en Órdenes y ejecuciones sin almacenar binarios en LAB.
- **Reglas que aplica:** `LAB-BR-023`.

### LAB-REQ-011 — Confirmar una ejecución
- **Estado:** Aprobado
- **Origen:** `B-01` a `B-03`, `LAB-Q-006`, `LAB-Q-007`, `LAB-Q-013`
- **Prioridad:** Must
- **Requerimiento:** Cuando una ejecución esté FINALIZADA, el sistema debe permitir al Administrador revisar sus datos, ajustar la contribución con motivo y confirmarla mostrando el estado individual de cada consumo.
- **Reglas que aplica:** `LAB-BR-013` a `LAB-BR-024`.

### LAB-REQ-012 — Corregir o anular una ejecución
- **Estado:** Aprobado
- **Origen:** `B-02`, `B-05`, `LAB-Q-006`
- **Prioridad:** Must
- **Requerimiento:** Cuando una ejecución confirmada sea incorrecta, el sistema debe permitir al Administrador corregirla mediante otra versión o anularla con motivo sin perder historia.
- **Reglas que aplica:** `LAB-BR-025`.

### LAB-REQ-013 — Revisar remuneración por Labor
- **Estado:** Aprobado
- **Origen:** `B-03`, `LAB-Q-009` a `LAB-Q-011`
- **Prioridad:** Must
- **Requerimiento:** Cuando una ejecución confirmada tenga participantes, el sistema debe proveer a PER sus tiempos, cantidades y porcentajes para que proponga los devengos y permita al Administrador confirmarlos o ajustarlos con motivo.
- **Reglas que aplica:** `LAB-BR-013`, `LAB-BR-016` a `LAB-BR-018`.

### LAB-REQ-014 — Comparar asistencia e imputación
- **Estado:** Aprobado
- **Origen:** `B-03`, `LAB-Q-012`
- **Prioridad:** Should
- **Requerimiento:** El sistema debe mostrar al Administrador las diferencias entre asistencia confirmada y tiempo imputado a Labores sin modificar ninguna de las fuentes.
- **Reglas que aplica:** `LAB-BR-014`, `LAB-BR-015`.

### LAB-REQ-015 — Consultar historia de Labores
- **Estado:** Aprobado
- **Origen:** `B-02`, `B-04`, `LAB-Q-020`, `LAB-Q-022`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir al Administrador y al Capataz consultar Órdenes y ejecuciones por Campaña, fechas, Tipo de Labor, contexto, estado, participantes y recursos conservando versiones y anulaciones.
- **Reglas que aplica:** `LAB-BR-003` a `LAB-BR-005`, `LAB-BR-025`, `LAB-BR-027`.

### LAB-REQ-016 — Proveer hechos de Labor
- **Estado:** Aprobado
- **Origen:** `B-02` a `B-04`, `LAB-Q-009`, `LAB-Q-019`, `LAB-Q-020`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe proveer a módulos autorizados hechos confirmados de ejecución, participación, cantidades, recursos y Campaña sin copiar datos ajenos ni importes monetarios de PER.
- **Reglas que aplica:** `LAB-BR-017`, `LAB-BR-021`, `LAB-BR-022`, `LAB-BR-026`, `LAB-BR-027`.

## 3. Dependencias con otros módulos

### LAB-DEP-001 — Empresas — Identidad y vigencia
- **Estado:** Aprobado
- **Origen:** `B-01`; arquitectura multiempresa
- **Módulo:** `EMP` (Empresas)
- **Dirección:** Este módulo consume
- **Qué:** Empresa propietaria y vigencia; todos los registros LAB conservan `empresaId`.
- **Para qué:** `LAB-BR-001`, todos los requerimientos.

### LAB-DEP-002 — Contexto productivo — Campaña, Ciclo e Implantación
- **Estado:** Aprobado
- **Origen:** `B-04`, `LAB-Q-002`, `LAB-Q-003`, `LAB-Q-016`, `LAB-Q-018`
- **Módulo:** `CUL` (Contexto productivo)
- **Dirección:** Este módulo consume y provee
- **Qué:** Consume Campaña, Ciclo productivo e Implantación con estado y compatibilidad; provee referencias de hechos para historia por Campaña.
- **Para qué:** `LAB-BR-003` a `LAB-BR-006`, `LAB-BR-027`, `LAB-REQ-004`, `LAB-REQ-006`, `LAB-REQ-015`.

### LAB-DEP-003 — Territorio — Chacra y Lote
- **Estado:** Aprobado
- **Origen:** `B-01`, `LAB-Q-018`; `TER-DEP-004`
- **Módulo:** `TER` (Territorio)
- **Dirección:** Este módulo consume y provee
- **Qué:** Consume identidad, pertenencia y estado de Chacras y Lotes; provee operaciones pendientes e historia de Labores referenciada.
- **Para qué:** `LAB-BR-006`, `LAB-BR-020`, `LAB-REQ-002`, `LAB-REQ-004`, `LAB-REQ-006`.

### LAB-DEP-004 — Personal — Empleados, Cuadrillas, asistencia y remuneración
- **Estado:** Aprobado
- **Origen:** `B-01`, `B-03`, `LAB-Q-008` a `LAB-Q-012`
- **Módulo:** `PER` (Personal)
- **Dirección:** Este módulo consume y provee
- **Qué:** Consume Empleados, Cuadrillas y asistencia; provee participación, tiempo, cantidad y porcentaje para que PER resuelva tarifas y devengos. Requiere ampliar la especificación aprobada de PER para admitir monto total distribuible y ajustes confirmados por el Administrador.
- **Para qué:** `LAB-BR-012` a `LAB-BR-018`, `LAB-REQ-008`, `LAB-REQ-011`, `LAB-REQ-013`, `LAB-REQ-014`.

### LAB-DEP-005 — Inventario — Artículos, Almacenes y movimientos
- **Estado:** Aprobado
- **Origen:** `B-02`, `LAB-Q-013`
- **Módulo:** `INV` (Inventario)
- **Dirección:** Este módulo consume y provee
- **Qué:** Consume Artículos, unidades, Almacenes, partidas y Existencia; provee declaraciones de consumo para que INV confirme una única salida por línea.
- **Para qué:** `LAB-BR-021`, `LAB-BR-022`, `LAB-REQ-009`, `LAB-REQ-011`, `LAB-REQ-016`.

### LAB-DEP-006 — Archivos — Imágenes e informes
- **Estado:** Aprobado
- **Origen:** `B-02`, `LAB-Q-015`
- **Módulo:** `ARC` (Archivos)
- **Dirección:** Este módulo consume
- **Qué:** referencias a imágenes e informes privados; los binarios permanecen en ARC.
- **Para qué:** `LAB-BR-023`, `LAB-REQ-010`.

### LAB-DEP-007 — Cosechas — Producción obtenida
- **Estado:** Aprobado
- **Origen:** `B-01`, `B-03`, `LAB-Q-019`
- **Módulo:** `COS` (Cosechas)
- **Dirección:** Este módulo consume y provee
- **Qué:** LAB provee el trabajo de cosecha y COS provee la producción, los pesajes y las cantidades obtenidas para vincular ambos hechos sin duplicarlos.
- **Para qué:** `LAB-BR-026`, `LAB-REQ-016`.

### LAB-DEP-008 — Identidad y acceso — Contexto autorizado
- **Estado:** Aprobado
- **Origen:** `LAB-Q-007`
- **Módulo:** `ACC` (Identidad y acceso)
- **Dirección:** Este módulo consume
- **Qué:** Cuenta de Empresa, roles, permisos y alcance autorizado del Administrador o Capataz.
- **Para qué:** todos los casos de uso.

### LAB-DEP-009 — Reportes — Indicadores por Campaña
- **Estado:** Aprobado
- **Origen:** `B-04`, `LAB-Q-020`
- **Módulo:** `REP` (Reportes)
- **Dirección:** Este módulo provee
- **Qué:** hechos confirmados con Campaña, contexto, participantes, cantidades y recursos para construir indicadores sin copiar ni modificar LAB.
- **Para qué:** `LAB-BR-027`, `LAB-REQ-015`, `LAB-REQ-016`.

### LAB-DEP-010 — Maquinaria — Equipos utilizados
- **Estado:** Aprobado
- **Origen:** `B-05`; `IA` aprobada por el Ingeniero
- **Módulo:** `MAQ` (Maquinaria)
- **Dirección:** Este módulo consume y provee
- **Qué:** referencias a equipos disponibles y hechos de utilización; la implementación queda condicionada a la activación del módulo futuro MAQ.
- **Para qué:** ampliar `LAB-REQ-009` sin copiar maquinaria en LAB.

## 4. Fuera de alcance

- Ficha, estado, Cuadrilla y asistencia de Empleados — `PER`, origen: `B-01`, `B-03`, `LAB-Q-008`, `LAB-Q-012`.
- Modalidades, tarifas, importes devengados y pagos — `PER` y `ECO`, origen: `B-03`, `LAB-Q-009` a `LAB-Q-011`.
- Identidad y geometría de Chacras y Lotes — `TER`, origen: `LAB-Q-018`.
- Campañas, Ciclos e Implantaciones — `CUL`, origen: `B-04`, `LAB-Q-003`.
- Existencias, partidas y movimientos de stock — `INV`, origen: `B-02`, `LAB-Q-013`.
- Binarios de imágenes e informes — `ARC`, origen: `B-02`, `LAB-Q-015`.
- Producción, pesajes y entregas de Cosecha — `COS`, origen: `LAB-Q-019`.
- Cálculo y almacenamiento de reportes gerenciales — `REP`, origen: `B-04`, `LAB-Q-020`.
- Datos maestros y mantenimiento de Maquinaria — `MAQ`, origen: `LAB-DEP-010`.
- Catálogo maestro de instalaciones, calles, alambrados o cercos — no existe un módulo dueño activo; LAB solo conserva la ubicación operativa descripta, origen: `B-01`, `LAB-Q-018`.
