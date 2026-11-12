---
type: requirements
module: "PER"
status: Aprobado
owner: "Analista"
---

# Personal — Requerimientos

## 1. Reglas de negocio

### PER-BR-001 — Aislamiento por Empresa

- **Estado:** Aprobado
- **Origen:** `B-05`, `PER-Q-002`, `PER-Q-021`
- **Tipo:** Invariante
- **Regla:** Toda entidad y registro de PER pertenece a una única Empresa cliente mediante `empresaId`; códigos, documentos, relaciones y consultas se validan dentro de esa Empresa.
- **Si se incumple:** se rechaza con `PER_TENANT_INVALIDO`.

| Situación | Resultado |
|---|---|
| Dos Empresas usan el código A01 | Se acepta; pertenecen a tenants distintos |
| Un registro referencia datos de su misma Empresa | Se acepta |
| Una Cuadrilla incorpora un Empleado de otra Empresa | Se rechaza con `PER_TENANT_INVALIDO` |

### PER-BR-002 — Documento único dentro de la Empresa

- **Estado:** Aprobado
- **Origen:** `B-01`, `PER-Q-002`, `PER-Q-036`, `PER-Q-039`
- **Tipo:** Invariante
- **Regla:** La combinación de tipo y número normalizado de documento es única dentro de una Empresa; la misma persona puede tener otro registro independiente en otra Empresa.
- **Si se incumple:** se rechaza con `PER_DOCUMENTO_DUPLICADO`.

| Situación | Resultado |
|---|---|
| DNI 12345678 no existe en la Empresa | Se acepta |
| El mismo DNI existe en otra Empresa | Se acepta |
| El mismo tipo y número ya existe en la Empresa | Se rechaza con `PER_DOCUMENTO_DUPLICADO` |

### PER-BR-003 — Datos mínimos del Empleado

- **Estado:** Aprobado
- **Origen:** `B-01`, `PER-Q-036`, `PER-Q-039`
- **Tipo:** Validación
- **Regla:** Un Empleado requiere tipo y número de documento, nombre, apellido y teléfono de contacto; los textos respetan los límites aprobados y el tipo OTRO exige detalle.
- **Si se incumple:** se rechaza con `PER_EMPLEADO_INVALIDO`.

| Situación | Resultado |
|---|---|
| Todos los datos obligatorios son válidos | Se acepta |
| Teléfono repetido en dos fichas | Se acepta; no es único |
| Falta apellido o se usa OTRO sin detalle | Se rechaza con `PER_EMPLEADO_INVALIDO` |

### PER-BR-004 — Datos opcionales estructurados

- **Estado:** Aprobado
- **Origen:** `PER-Q-005`, `PER-Q-037`, `PER-Q-039`
- **Tipo:** Validación
- **Regla:** Los datos opcionales del Empleado se registran en su estructura aprobada; los archivos se referencian desde ARC y no se copian en PER.
- **Si se incumple:** se rechaza con `PER_DATO_PERSONAL_INVALIDO`.

| Situación | Resultado |
|---|---|
| Licencia con tipo y vencimiento válidos | Se acepta |
| Empleado sin dato de sangre | Se acepta |
| Contacto de emergencia sin teléfono | Se rechaza con `PER_DATO_PERSONAL_INVALIDO` |

### PER-BR-005 — Ciclo laboral e historia

- **Estado:** Aprobado
- **Origen:** `PER-Q-003`, `PER-Q-007`
- **Tipo:** Transición
- **Regla:** El Empleado alterna entre ACTIVO e INACTIVO sin borrado físico; cada alta, inactivación y reactivación conserva fecha, motivo y períodos laborales en la misma ficha.
- **Si se incumple:** se rechaza con `PER_TRANSICION_EMPLEADO_INVALIDA`.

| Situación | Resultado |
|---|---|
| Empleado INACTIVO reingresa | Se reactiva y se abre otro período |
| Se consulta un período anterior | Se conserva |
| Se solicita borrar físicamente la ficha | Se rechaza con `PER_TRANSICION_EMPLEADO_INVALIDA` |

### PER-BR-006 — Cupo de Empleados activos

- **Estado:** Aprobado
- **Origen:** `B-01`, `PER-Q-004`
- **Tipo:** Validación
- **Regla:** Crear o reactivar un Empleado requiere cupo de Empleados activos en la Suscripción de Empresa; los registros INACTIVOS no consumen cupo.
- **Si se incumple:** se rechaza con `PER_LIMITE_EMPLEADOS_ALCANZADO`.

| Situación | Resultado |
|---|---|
| Existe cupo y se crea un Empleado activo | Se acepta |
| Se consulta historia por encima del cupo actual | Se acepta |
| No existe cupo para crear o reactivar | Se rechaza con `PER_LIMITE_EMPLEADOS_ALCANZADO` |

### PER-BR-007 — Acceso separado de la ficha laboral

- **Estado:** Aprobado
- **Origen:** `B-01`, `PER-Q-001`, `ACC-Q-019`
- **Tipo:** Invariante
- **Regla:** La ficha de Empleado no concede acceso; Capataz y Empleado con acceso requieren una ficha activa vinculada mediante `empleadoId`, mientras un Administrador puede tener una Cuenta de Empresa sin ser Empleado.
- **Si se incumple:** se rechaza con `PER_ACCESO_EMPLEADO_INVALIDO`.

| Situación | Resultado |
|---|---|
| Empleado activo sin Cuenta de Empresa | Se acepta |
| Empleado activo se vincula con acceso | Se coordina con ACC |
| Se intenta vincular como Capataz a una ficha INACTIVA | Se rechaza con `PER_ACCESO_EMPLEADO_INVALIDO` |

### PER-BR-008 — Inactivación laboral revoca acceso

- **Estado:** Aprobado
- **Origen:** `PER-Q-035`
- **Tipo:** Transición
- **Regla:** Al inactivar un Empleado con acceso, PER solicita a ACC suspender su Cuenta de Empresa y revocar sus Sesiones; reactivar la ficha no reactiva el acceso automáticamente.
- **Si se incumple:** se rechaza la inactivación completa con `PER_SUSPENSION_ACCESO_FALLIDA` sin dejar efectos parciales.

| Situación | Resultado |
|---|---|
| Empleado sin acceso se inactiva | Se inactiva la ficha |
| Empleado con acceso se inactiva y ACC confirma | Se inactiva y se revoca el acceso |
| ACC no puede suspender la cuenta | Se rechaza con `PER_SUSPENSION_ACCESO_FALLIDA` |

### PER-BR-009 — Código de Cuadrilla

- **Estado:** Aprobado
- **Origen:** `B-02`, `B-07`, `PER-Q-009`, `PER-Q-039`
- **Tipo:** Invariante
- **Regla:** Cada Cuadrilla recibe automáticamente un código inmutable y no reutilizable entre A01 y Z99, único dentro de su Empresa.
- **Si se incumple:** se rechaza con `PER_CODIGO_CUADRILLA_INVALIDO` o `PER_CODIGOS_CUADRILLA_AGOTADOS`.

| Situación | Resultado |
|---|---|
| A01 está libre en la Empresa | Se asigna automáticamente |
| A01 existe en otra Empresa | No impide asignarlo |
| Se agotaron A01 a Z99 | Se rechaza con `PER_CODIGOS_CUADRILLA_AGOTADOS` |

### PER-BR-010 — Ciclo de vida de Cuadrilla

- **Estado:** Aprobado
- **Origen:** `B-02`, `PER-Q-026`, `PER-Q-039`
- **Tipo:** Transición
- **Regla:** Una Cuadrilla usa estados ACTIVA e INACTIVA, no se elimina físicamente, admite nombres repetidos y conserva sus cambios; solo una Cuadrilla ACTIVA puede incorporar integrantes u operar.
- **Si se incumple:** se rechaza con `PER_TRANSICION_CUADRILLA_INVALIDA`.

| Situación | Resultado |
|---|---|
| Dos Cuadrillas activas tienen igual nombre y distinto código | Se acepta |
| Se reactiva una Cuadrilla histórica | Se acepta si satisface las reglas vigentes |
| Se incorpora un integrante a una Cuadrilla INACTIVA | Se rechaza con `PER_TRANSICION_CUADRILLA_INVALIDA` |

### PER-BR-011 — Responsabilidad operativa de Cuadrilla

- **Estado:** Aprobado
- **Origen:** `PER-Q-011`, `PER-Q-022`, `PER-Q-026`
- **Tipo:** Autorización de dominio
- **Regla:** El Capataz creador administra y opera la Cuadrilla mientras sea responsable vigente; el Administrador puede reasignar esa responsabilidad conservando al creador y las asignaciones anteriores en la historia.
- **Si se incumple:** se rechaza con `PER_CAPATAZ_NO_RESPONSABLE`.

| Situación | Resultado |
|---|---|
| Capataz responsable modifica su Cuadrilla | Se acepta |
| Administrador reasigna una Cuadrilla huérfana | Se acepta y conserva historia |
| Otro Capataz intenta administrarla | Se rechaza con `PER_CAPATAZ_NO_RESPONSABLE` |

### PER-BR-012 — Cuadrilla sin territorio propio

- **Estado:** Aprobado
- **Origen:** `PER-Q-023`
- **Tipo:** Invariante
- **Regla:** Una Cuadrilla no pertenece a una Chacra ni a un Lote; LAB determina la ubicación de cada trabajo efectivo.
- **Si se incumple:** se rechaza con `PER_TERRITORIO_CUADRILLA_NO_PERMITIDO`.

| Situación | Resultado |
|---|---|
| Cuadrilla trabaja hoy en un Lote indicado por LAB | Se acepta |
| La misma Cuadrilla trabaja luego en otra Chacra | Se acepta |
| Se intenta fijar un loteId permanente en la Cuadrilla | Se rechaza con `PER_TERRITORIO_CUADRILLA_NO_PERMITIDO` |

### PER-BR-013 — Pertenencia simultánea a Cuadrillas

- **Estado:** Aprobado
- **Origen:** `B-02`, `B-06`, `PER-Q-008`
- **Tipo:** Invariante
- **Regla:** Un Empleado activo puede integrar simultáneamente varias Cuadrillas activas de su Empresa, sin designar una Cuadrilla principal.
- **Si se incumple:** se rechaza con `PER_MEMBRESIA_CUADRILLA_INVALIDA`.

| Situación | Resultado |
|---|---|
| Empleado integra dos Cuadrillas de su Empresa | Se acepta |
| Empleado no integra ninguna Cuadrilla | Se acepta |
| Se incorpora una ficha INACTIVA | Se rechaza con `PER_MEMBRESIA_CUADRILLA_INVALIDA` |

### PER-BR-014 — Vigencia de integrantes y líder

- **Estado:** Aprobado
- **Origen:** `B-02`, `B-08`, `PER-Q-010`, `PER-Q-027`
- **Tipo:** Temporal
- **Regla:** Cada membresía conserva inicio y fin opcional sin superponerse consigo misma en la misma Cuadrilla; una reincorporación abre otro período y el líder opcional debe ser un integrante activo.
- **Si se incumple:** se rechaza con `PER_MEMBRESIA_SUPERPUESTA` o `PER_LIDER_INVALIDO`.

| Situación | Resultado |
|---|---|
| Empleado finaliza y luego reingresa | Se crean dos períodos históricos |
| Integrante activo es elegido líder sin acceso | Se acepta |
| Líder deja la Cuadrilla | El liderazgo queda vacante |

### PER-BR-015 — Alcance del Capataz sobre asistencia

- **Estado:** Aprobado
- **Origen:** `B-03`, `PER-Q-028`, `PER-Q-034`
- **Tipo:** Autorización de dominio
- **Regla:** Un Capataz puede iniciar asistencia de cualquier Empleado ACTIVO de su Empresa y solo ve los datos operativos aprobados para esa acción.
- **Si se incumple:** se rechaza con `PER_ASISTENCIA_FUERA_DE_ALCANCE`.

| Situación | Resultado |
|---|---|
| Capataz registra a un Empleado sin Cuadrilla de su Empresa | Se acepta |
| Capataz consulta teléfono y disponibilidad para asistencia | Se acepta |
| Capataz intenta registrar a un Empleado de otro tenant | Se rechaza con `PER_ASISTENCIA_FUERA_DE_ALCANCE` |

### PER-BR-016 — Asistencia única por día

- **Estado:** Aprobado
- **Origen:** `PER-Q-008`, `PER-Q-024`
- **Tipo:** Invariante
- **Regla:** Existe una única Asistencia por Empleado y fecha local de Empresa; el primer Capataz autorizado que la inicia queda responsable de completarla y confirmarla.
- **Si se incumple:** se rechaza con `PER_ASISTENCIA_DUPLICADA` o `PER_CAPATAZ_ASISTENCIA_INVALIDO`.

| Situación | Resultado |
|---|---|
| Primer Capataz inicia la asistencia del día | Se crea y queda responsable |
| Otro Capataz consulta el estado | Lo ve sin duplicarlo |
| Otro Capataz intenta confirmar otra asistencia | Se rechaza con `PER_ASISTENCIA_DUPLICADA` |

### PER-BR-017 — Resultado diario explícito

- **Estado:** Aprobado
- **Origen:** `PER-Q-012`, `PER-Q-033`
- **Tipo:** Validación
- **Regla:** La Asistencia confirmada usa PRESENTE, AUSENTE o AUSENCIA_JUSTIFICADA; la falta de registro significa pendiente y una indisponibilidad vigente impide PRESENTE e intervalos.
- **Si se incumple:** se rechaza con `PER_RESULTADO_ASISTENCIA_INVALIDO`.

| Situación | Resultado |
|---|---|
| Empleado disponible se marca PRESENTE | Se acepta |
| Empleado sin carga | Permanece pendiente, no AUSENTE |
| Empleado de vacaciones se marca PRESENTE | Se rechaza con `PER_RESULTADO_ASISTENCIA_INVALIDO` |

### PER-BR-018 — Intervalos válidos

- **Estado:** Aprobado
- **Origen:** `B-03`, `B-09`, `PER-Q-013`, `PER-Q-014`, `PER-Q-030`, `PER-Q-039`
- **Tipo:** Validación
- **Regla:** Los intervalos usan precisión de minuto, no se superponen, el ingreso precede al egreso, no cruzan medianoche y cada marca admite una nota opcional; una fecha futura no puede confirmarse.
- **Si se incumple:** se rechaza con `PER_INTERVALO_ASISTENCIA_INVALIDO`.

| Situación | Resultado |
|---|---|
| Dos intervalos cerrados y no superpuestos | Se acepta |
| Jornada cruza medianoche y se divide por fecha | Se acepta |
| Egreso anterior al ingreso o fecha futura confirmada | Se rechaza con `PER_INTERVALO_ASISTENCIA_INVALIDO` |

### PER-BR-019 — Horas requeridas para POR_HORA

- **Estado:** Aprobado
- **Origen:** `B-03`, `PER-Q-013`, `PER-Q-030`
- **Tipo:** Validación
- **Regla:** Cuando el Empleado usa modalidad POR_HORA, todos los intervalos deben estar cerrados antes de confirmar PRESENTE; en otras modalidades los horarios son opcionales.
- **Si se incumple:** se rechaza con `PER_HORAS_REQUERIDAS`.

| Situación | Resultado |
|---|---|
| POR_HORA con intervalos cerrados | Se acepta |
| MENSUAL marcado PRESENTE sin horarios | Se acepta |
| POR_HORA sin egreso | Se rechaza con `PER_HORAS_REQUERIDAS` |

### PER-BR-020 — Confirmación y corrección auditada

- **Estado:** Aprobado
- **Origen:** `PER-Q-015`
- **Tipo:** Transición
- **Regla:** El Capataz responsable puede modificar antes de confirmar; después de confirmada, solo el Administrador corrige con motivo y conserva la versión anterior.
- **Si se incumple:** se rechaza con `PER_ASISTENCIA_CONFIRMADA`.

| Situación | Resultado |
|---|---|
| Capataz corrige antes de confirmar | Se acepta |
| Administrador corrige con motivo | Se crea una nueva versión |
| Capataz modifica después de confirmar | Se rechaza con `PER_ASISTENCIA_CONFIRMADA` |

### PER-BR-021 — Restricción operativa y privacidad

- **Estado:** Aprobado
- **Origen:** `B-03`, `B-10`, `PER-Q-006`, `PER-Q-029`, `PER-Q-034`
- **Tipo:** Invariante
- **Regla:** Una restricción conserva tipo, vigencia e indicación operativa, no vuelve incompatible una Labor y expone al Capataz solo el mensaje necesario, nunca diagnóstico ni evidencia sensible.
- **Si se incumple:** se rechaza con `PER_RESTRICCION_INVALIDA`.

| Situación | Resultado |
|---|---|
| Capataz ve “requiere tarea liviana” | Se acepta |
| LAB consulta la indicación sin bloquear por incompatibilidad | Se acepta |
| Se expone diagnóstico al Capataz | Se rechaza con `PER_RESTRICCION_INVALIDA` |

### PER-BR-022 — Indisponibilidad justificada

- **Estado:** Aprobado
- **Origen:** `PER-Q-029`, `PER-Q-033`, `PER-Q-038`
- **Tipo:** Temporal
- **Regla:** VACACIONES, LICENCIA_MEDICA, LICENCIA_ESPECIAL, SUSPENSION y OTRA_JUSTIFICADA tienen vigencia; solo el Administrador las administra y durante su vigencia generan AUSENCIA_JUSTIFICADA e impiden PRESENTE.
- **Si se incumple:** se rechaza con `PER_INDISPONIBILIDAD_INVALIDA`.

| Situación | Resultado |
|---|---|
| Administrador registra vacaciones con vigencia | Se acepta |
| Capataz consulta el estado operativo | Se acepta sin ver evidencia |
| Capataz crea una licencia o marca PRESENTE durante ella | Se rechaza con `PER_INDISPONIBILIDAD_INVALIDA` |

### PER-BR-023 — Modalidades de remuneración

- **Estado:** Aprobado
- **Origen:** `B-04`, `B-11`, `PER-Q-016`
- **Tipo:** Invariante
- **Regla:** Las modalidades admitidas son MENSUAL, JORNAL, POR_HORA, POR_LABOR, POR_PRODUCCION y MIXTA; la Empresa define una configuración general y puede especializarla por Empleado.
- **Si se incumple:** se rechaza con `PER_MODALIDAD_REMUNERACION_INVALIDA`.

| Situación | Resultado |
|---|---|
| Empresa usa JORNAL como valor general | Se acepta |
| Un Empleado usa POR_HORA como excepción | Se acepta |
| Se informa una modalidad fuera del catálogo | Se rechaza con `PER_MODALIDAD_REMUNERACION_INVALIDA` |

### PER-BR-024 — Precedencia de remuneración

- **Estado:** Aprobado
- **Origen:** `B-04`, `B-11`, `PER-Q-017`
- **Tipo:** Cálculo
- **Regla:** La resolución aplica, de mayor a menor especificidad: Empleado más Labor o unidad, Labor o unidad de Empresa, Empleado y configuración general de Empresa.
- **Si se incumple:** no aplica; si ninguna configuración es resoluble se rechaza con `PER_CONFIGURACION_REMUNERACION_INEXISTENTE`.

| Situación | Resultado |
|---|---|
| Existe tarifa específica para Empleado y Labor | Se aplica esa tarifa |
| Solo existe configuración general | Se aplica la general |
| No existe configuración aplicable | Se rechaza con `PER_CONFIGURACION_REMUNERACION_INEXISTENTE` |

### PER-BR-025 — Vigencia y valor histórico aplicado

- **Estado:** Aprobado
- **Origen:** `PER-Q-018`
- **Tipo:** Temporal
- **Regla:** Toda tarifa posee vigencia y el valor aplicado queda fijado al confirmar el hecho que origina el devengo; un cambio posterior no recalcula automáticamente hechos anteriores.
- **Si se incumple:** se rechaza con `PER_TARIFA_HISTORICA_INMUTABLE`.

| Situación | Resultado |
|---|---|
| Se confirma un hecho con tarifa vigente | Se fija el valor aplicado |
| Mañana cambia la tarifa | Los hechos anteriores no cambian |
| Se intenta recalcular automáticamente historia confirmada | Se rechaza con `PER_TARIFA_HISTORICA_INMUTABLE` |

### PER-BR-026 — Cálculo bruto por modalidad

- **Estado:** Aprobado
- **Origen:** `PER-Q-019`, `PER-Q-031`
- **Tipo:** Cálculo
- **Regla:** MENSUAL usa importe fijo sin prorrateo automático; JORNAL multiplica días PRESENTE; POR_HORA multiplica horas válidas; POR_LABOR y POR_PRODUCCION multiplican la cantidad individual confirmada para cada Empleado; MIXTA suma base y componentes variables.
- **Si se incumple:** se rechaza con `PER_CALCULO_REMUNERACION_INVALIDO`.

| Situación | Resultado |
|---|---|
| POR_HORA tiene horas y tarifa confirmadas | Se calcula el bruto |
| MENSUAL tiene ausencias | No se prorratea automáticamente |
| Falta cantidad confirmada para POR_PRODUCCION | Se rechaza con `PER_CALCULO_REMUNERACION_INVALIDO` |

### PER-BR-027 — Propiedad de tarifas de remuneración

- **Estado:** Aprobado
- **Origen:** `B-04`, `PER-Q-032`
- **Tipo:** Invariante
- **Regla:** PER es el único módulo dueño de las tarifas de remuneración, incluidas las que referencian un tipo de Labor o una unidad productiva; LAB y COS son dueños de sus catálogos, hechos y cantidades confirmadas.
- **Si se incumple:** no se admite definir o resolver una fuente de tarifas de remuneración fuera de PER.

| Situación | Resultado |
|---|---|
| Tarifa general o específica por Empleado | PER la conserva y resuelve |
| Tarifa por hora de un tipo de Labor | PER conserva la tarifa y referencia la Labor definida por LAB |
| Tarifa por unidad productiva | PER conserva la tarifa y COS aporta la cantidad confirmada |
| LAB o COS intenta ser dueño de la tarifa de remuneración | No se admite; la propiedad permanece en PER |

## 2. Requerimientos funcionales

### PER-REQ-001 — Administrar Empleados
- **Estado:** Aprobado
- **Origen:** `B-01`, `PER-Q-003`, `PER-Q-007`, `PER-Q-025`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir al Administrador crear, consultar, modificar, inactivar y reactivar Empleados de su Empresa conservando su historia laboral.
- **Reglas que aplica:** `PER-BR-001` a `PER-BR-006`.

### PER-REQ-002 — Administrar datos personales y laborales
- **Estado:** Aprobado
- **Origen:** `PER-Q-005`, `PER-Q-037`, `PER-Q-039`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir al Administrador mantener datos opcionales estructurados, contactos, especialidades, licencias y referencias de archivos del Empleado.
- **Reglas que aplica:** `PER-BR-003`, `PER-BR-004`, `PER-BR-021`.

### PER-REQ-003 — Habilitar acceso de un Empleado
- **Estado:** Aprobado
- **Origen:** `B-01`, `PER-Q-001`, `PER-Q-035`, `ACC-Q-019`
- **Prioridad:** Must
- **Requerimiento:** Cuando el Administrador habilite acceso a un Empleado, PER debe validar la ficha activa y coordinar con ACC la creación de la Cuenta de Empresa vinculada mediante `empleadoId`, sin copiar credenciales, roles, permisos ni la referencia de vinculación en PER.
- **Reglas que aplica:** `PER-BR-007`, `PER-BR-008`.

### PER-REQ-004 — Administrar restricciones e indisponibilidades
- **Estado:** Aprobado
- **Origen:** `B-03`, `B-10`, `PER-Q-006`, `PER-Q-033`, `PER-Q-038`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir al Administrador mantener restricciones operativas e indisponibilidades con vigencia y evidencia referenciada.
- **Reglas que aplica:** `PER-BR-021`, `PER-BR-022`.

### PER-REQ-005 — Crear y mantener Cuadrillas
- **Estado:** Aprobado
- **Origen:** `B-02`, `B-07`, `PER-Q-009`, `PER-Q-011`, `PER-Q-026`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir al Capataz crear y administrar sus Cuadrillas y al Administrador supervisar su ciclo de vida y reasignar responsables.
- **Reglas que aplica:** `PER-BR-001`, `PER-BR-009` a `PER-BR-012`.

### PER-REQ-006 — Mantener integrantes y líder
- **Estado:** Aprobado
- **Origen:** `B-02`, `B-06`, `B-08`, `PER-Q-027`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir al Capataz responsable incorporar y retirar integrantes y designar o quitar un líder conservando las vigencias históricas.
- **Reglas que aplica:** `PER-BR-013`, `PER-BR-014`.

### PER-REQ-007 — Consultar Cuadrillas e historia
- **Estado:** Aprobado
- **Origen:** `B-02`, `PER-Q-011`, `PER-Q-022`, `PER-Q-026`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe mostrar al Capataz la composición actual de sus Cuadrillas y al Administrador la composición actual, responsables e historia completa.
- **Reglas que aplica:** `PER-BR-010`, `PER-BR-011`, `PER-BR-014`.

### PER-REQ-008 — Registrar y confirmar asistencia
- **Estado:** Aprobado
- **Origen:** `B-03`, `B-09`, `PER-Q-012`, `PER-Q-013`, `PER-Q-024`, `PER-Q-028`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir al Capataz iniciar, completar y confirmar una única Asistencia diaria por Empleado activo de su Empresa con resultado, intervalos y notas opcionales.
- **Reglas que aplica:** `PER-BR-015`, `PER-BR-016`, `PER-BR-017`, `PER-BR-018`, `PER-BR-019`, `PER-BR-022`.

### PER-REQ-009 — Corregir asistencia confirmada
- **Estado:** Aprobado
- **Origen:** `PER-Q-015`
- **Prioridad:** Must
- **Requerimiento:** Cuando una Asistencia confirmada sea incorrecta, el sistema debe permitir al Administrador corregirla con motivo conservando las versiones anteriores.
- **Reglas que aplica:** `PER-BR-020`.

### PER-REQ-010 — Consultar información propia
- **Estado:** Aprobado
- **Origen:** `PER-Q-020`, `PER-Q-038`
- **Prioridad:** Should
- **Requerimiento:** El sistema debe permitir al Empleado con acceso consultar en solo lectura su ficha, asistencia e indisponibilidades propias sin datos administrativos internos.
- **Reglas que aplica:** `PER-BR-007`, `PER-BR-017`, `PER-BR-021`, `PER-BR-022`.

### PER-REQ-011 — Configurar modalidades de remuneración
- **Estado:** Aprobado
- **Origen:** `B-04`, `B-11`, `PER-Q-016`, `PER-Q-017`, `PER-Q-018`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir al Administrador configurar modalidades y valores generales y por Empleado con vigencia y precedencia verificables.
- **Reglas que aplica:** `PER-BR-023` a `PER-BR-025`.

### PER-REQ-012 — Calcular remuneración bruta devengada
- **Estado:** Aprobado
- **Origen:** `PER-Q-019`, `PER-Q-031`
- **Prioridad:** Must
- **Requerimiento:** Cuando existan hechos y valores confirmados, el sistema debe calcular el importe bruto devengado según la modalidad aplicable y conservar su composición, usando para cada Empleado la cantidad individual que LAB o COS le haya atribuido.
- **Reglas que aplica:** `PER-BR-024` a `PER-BR-026`.

### PER-REQ-013 — Resolver tarifas específicas
- **Estado:** Aprobado
- **Origen:** `B-04`, `PER-Q-032`
- **Prioridad:** Must
- **Requerimiento:** Cuando la remuneración dependa de una Labor o de una unidad productiva, el sistema debe resolver en PER la tarifa vigente y utilizar los hechos o cantidades confirmados por LAB o COS para calcular el devengo.
- **Reglas que aplica:** `PER-BR-024` a `PER-BR-027`.

### PER-REQ-014 — Proveer contexto de Personal
- **Estado:** Aprobado
- **Origen:** `B-01`, `B-03`, `B-04`, `PER-Q-001`, `PER-Q-019`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe proveer a los módulos autorizados identidad laboral, estado, disponibilidad, composición de Cuadrilla y contexto de remuneración sin exponer datos innecesarios.
- **Reglas que aplica:** `PER-BR-001`, `PER-BR-007`, `PER-BR-021` a `PER-BR-027`.

## 3. Dependencias con otros módulos

### PER-DEP-001 — Empresas — Identidad y vigencia
- **Estado:** Aprobado
- **Origen:** `B-01`, `B-05`, `PER-Q-021`
- **Módulo:** `EMP` (Empresas)
- **Dirección:** Este módulo consume
- **Qué:** Empresa propietaria y vigencia; cada registro PER conserva `empresaId` sin copiar datos administrativos.
- **Para qué:** `PER-BR-001`, `PER-REQ-001` a `PER-REQ-014`.

### PER-DEP-002 — Suscripciones — Cupo de Empleados
- **Estado:** Aprobado
- **Origen:** `B-01`, `PER-Q-004`
- **Módulo:** `SUS` (Suscripciones)
- **Dirección:** Este módulo consume
- **Qué:** límite vigente y disponibilidad de cupo de Empleados activos de la Empresa.
- **Para qué:** `PER-BR-006`, `PER-REQ-001`.

### PER-DEP-003 — Identidad y acceso — Cuenta y contexto autorizado
- **Estado:** Aprobado
- **Origen:** `B-01`, `PER-Q-001`, `PER-Q-035`, `ACC-Q-019`
- **Módulo:** `ACC` (Identidad y acceso)
- **Dirección:** Este módulo consume y provee
- **Qué:** PER provee `empleadoId`, Empresa y estado laboral para que ACC conserve el vínculo opcional; consume contexto, roles, permisos, suspensión y revocación de Sesiones, sin conservar Cuenta de Empresa, credenciales ni la vinculación.
- **Para qué:** `PER-BR-007`, `PER-BR-008`, `PER-BR-011`, `PER-BR-015`, `PER-REQ-003`, `PER-REQ-010`.

### PER-DEP-004 — Archivos — Evidencias privadas
- **Estado:** Aprobado
- **Origen:** `PER-Q-005`, `PER-Q-037`, `PER-Q-038`
- **Módulo:** `ARC` (Archivos)
- **Dirección:** Este módulo consume
- **Qué:** referencias a CV, licencias, certificados y evidencias privadas; los binarios permanecen bajo ARC.
- **Para qué:** `PER-BR-004`, `PER-BR-022`, `PER-REQ-002`, `PER-REQ-004`.

### PER-DEP-005 — Labores — Trabajo, ubicación y cantidades
- **Estado:** Aprobado
- **Origen:** `B-04`, `PER-Q-019`, `PER-Q-023`, `PER-Q-029`, `PER-Q-032`
- **Módulo:** `LAB` (Labores)
- **Dirección:** Este módulo consume y provee
- **Qué:** LAB define las Labores y determina Chacra/Lote, unidad, hechos y cantidades de trabajo confirmados; PER conserva las tarifas de remuneración que las referencian.
- **Para qué:** `PER-BR-012`, `PER-BR-025` a `PER-BR-027`, `PER-REQ-012` a `PER-REQ-014`.

### PER-DEP-006 — Cosechas — Cantidad productiva
- **Estado:** Aprobado
- **Origen:** `PER-Q-019`, `PER-Q-032`
- **Módulo:** `COS` (Cosechas)
- **Dirección:** Este módulo consume
- **Qué:** COS aporta las cantidades de producción confirmadas para POR_PRODUCCION; PER conserva y resuelve sus tarifas de remuneración.
- **Para qué:** `PER-BR-025` a `PER-BR-027`, `PER-REQ-012`, `PER-REQ-013`.

### PER-DEP-007 — Economía — Obligación y pago
- **Estado:** Aprobado
- **Origen:** `PER-Q-019`, `PER-Q-031`
- **Módulo:** `ECO` (Economía)
- **Dirección:** Este módulo provee
- **Qué:** composición e importe bruto devengado para que ECO registre la obligación y el pago.
- **Para qué:** `PER-BR-026`, `PER-REQ-012`, `PER-REQ-014`.

## 4. Fuera de alcance

- Credenciales, Cuenta de Empresa, roles, permisos y Sesiones — `ACC`, origen: `B-01`, `PER-Q-001`, `PER-Q-035`.
- Territorio permanente de una Cuadrilla y ubicación del trabajo — `TER` y `LAB`, origen: `PER-Q-023`.
- Ejecución de Labores y horas imputadas a cada trabajo — `LAB`, origen: `PER-Q-023`, `PER-Q-024`.
- Cosechas y cantidades productivas — `COS`, origen: `PER-Q-019`.
- Obligaciones, pagos, impuestos, descuentos legales y recibos de sueldo — `ECO`, origen: `PER-Q-019`, `PER-Q-031`.
- Binarios de CV, licencias y certificados — `ARC`, origen: `PER-Q-005`, `PER-Q-038`.
- Incompatibilidad automática entre restricción y Labor — excluida por `PER-Q-029`.
