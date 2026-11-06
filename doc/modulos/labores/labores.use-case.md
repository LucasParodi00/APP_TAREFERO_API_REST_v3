---
type: use-cases
module: "LAB"
status: Aprobado
owner: "Analista"
---

# Labores — Casos de uso

## 1. Actores

| Actor | Tipo | Origen |
|---|---|---|
| Administrador | Rol | `B-01` a `B-05`, `LAB-Q-007`, `LAB-Q-021` |
| Capataz | Rol | `B-01`, `B-02`, `LAB-Q-007`, `LAB-Q-021` |
| ACC | Sistema | `LAB-Q-007`, `LAB-DEP-008` |
| CUL | Sistema | `B-04`, `LAB-Q-003`, `LAB-Q-018` |
| TER | Sistema | `B-01`, `LAB-Q-018` |
| PER | Sistema | `B-01`, `B-03`, `LAB-Q-008` a `LAB-Q-012` |
| INV | Sistema | `B-02`, `LAB-Q-013` |
| ARC | Sistema | `B-02`, `LAB-Q-015` |
| COS | Sistema | `B-01`, `LAB-Q-019` |
| REP | Sistema | `B-04`, `LAB-Q-020` |

## 2. Permisos

| Caso de uso | Administrador | Capataz | Sistema | Condición |
|---|:---:|:---:|:---:|---|
| `LAB-UC-001` | Sí | No | No | Empresa del contexto |
| `LAB-UC-002` | Sí | No | Cond. | PER conserva la configuración monetaria |
| `LAB-UC-003` | Sí | Sí | Cond. | CUL, TER y PER validan referencias |
| `LAB-UC-004` | Sí | Sí | No | Orden de su Empresa |
| `LAB-UC-005` | Sí | Sí | Cond. | Desde una Orden o como ejecución directa |
| `LAB-UC-006` | No | Sí | Cond. | PER provee Empleados y Cuadrillas vigentes |
| `LAB-UC-007` | No | Sí | Cond. | INV y ARC reciben referencias declaradas |
| `LAB-UC-008` | No | Sí | No | Ejecución operable de su Empresa |
| `LAB-UC-009` | Sí | No | Cond. | INV informa el estado de cada consumo |
| `LAB-UC-010` | Sí | No | Cond. | Los módulos afectados reciben la nueva versión o anulación |
| `LAB-UC-011` | Sí | No | Cond. | PER calcula y conserva los importes |
| `LAB-UC-012` | Sí | No | Cond. | PER aporta asistencia confirmada |
| `LAB-UC-013` | Sí | Sí | Cond. | Historia operativa visible según autorización de ACC |
| `LAB-UC-014` | No | No | Sí | Solo módulos consumidores autorizados |

## 3. Casos de uso

### LAB-UC-001 — Administrar Tipos de Labor

- **Estado:** Aprobado
- **Actor:** Administrador o Capataz.
- **Objetivo:** Crear y mantener el catálogo reutilizable de trabajos de la Empresa.
- **Requerimientos:** `LAB-REQ-001`, `LAB-REQ-002`.
- **Reglas:** `LAB-BR-001` a `LAB-BR-003`, `LAB-BR-006`, `LAB-BR-019`, `LAB-BR-020`.

**Precondiciones**

- El Administrador opera en una Empresa vigente.

**Flujo principal**

1. El Administrador informa código, nombre, descripción, contexto requerido y magnitudes del Tipo de Labor.
2. El sistema verifica permiso, Empresa, unicidad y validez de la configuración.
3. El sistema crea el Tipo de Labor ACTIVO.
4. El Administrador puede modificar su configuración no identificatoria o cambiarlo entre ACTIVO e INACTIVO.
5. El sistema conserva todos sus usos históricos.

**Flujos alternativos**

- **A1 — Reactivación:** se reactiva el mismo Tipo de Labor sin duplicar su identidad.
- **A2 — Consulta:** se muestran tipos activos e inactivos sin depender de una Campaña.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza sin cambios | `LAB_ACCESO_DENEGADO` |
| Código o nombre repetido | 2 | Se rechaza | `LAB_TIPO_LABOR_INVALIDO` |
| Contexto o magnitud inválidos | 2 | Se rechaza | `LAB_CONTEXTO_INVALIDO` |
| Intento de eliminación física | 4 | Se rechaza | `LAB_TIPO_LABOR_INVALIDO` |

**Postcondiciones**

- El catálogo queda disponible para futuras Campañas y conserva su historia.

**Escenarios de aceptación**

```gherkin
@LAB-UC-001 @AC-01
Escenario: Crear un Tipo de Labor reutilizable
  Dado un Administrador de una Empresa
  Cuando crea el Tipo de Labor COSECHA que exige superficie
  Entonces queda ACTIVO y disponible para las Campañas de esa Empresa

@LAB-UC-001 @AC-02
Escenario: Inactivar sin perder historia
  Dado un Tipo de Labor utilizado en ejecuciones anteriores
  Cuando el Administrador lo inactiva
  Entonces no se usa en nuevas Órdenes y sus ejecuciones siguen consultables

@LAB-UC-001 @AC-03
Escenario: Rechazar un código repetido
  Dado un Tipo de Labor con código PODA en la Empresa
  Cuando el Administrador intenta crear otro con el mismo código
  Entonces se rechaza con LAB_TIPO_LABOR_INVALIDO

@LAB-UC-001 @AC-04
Escenario: Denegar la administración al Capataz
  Dado un Capataz autenticado
  Cuando intenta modificar un Tipo de Labor
  Entonces se rechaza con LAB_ACCESO_DENEGADO
```

### LAB-UC-002 — Configurar remuneración de un Tipo de Labor

- **Estado:** Aprobado
- **Actor:** Administrador; PER como sistema participante.
- **Objetivo:** Asociar un Tipo de Labor con una modalidad, tarifa o monto sugerido bajo propiedad de PER.
- **Requerimientos:** `LAB-REQ-003`.
- **Reglas:** `LAB-BR-017`, `LAB-BR-018`.

**Precondiciones**

- Existe un Tipo de Labor de la Empresa.

**Flujo principal**

1. El Administrador selecciona el Tipo de Labor y solicita configurar su remuneración.
2. LAB entrega a PER la identidad y las magnitudes admitidas por el Tipo.
3. PER valida y conserva la modalidad, unidad, tarifa o monto con su vigencia.
4. LAB conserva únicamente la referencia necesaria para usar esa configuración.

**Flujos alternativos**

- **A1 — Sin remuneración variable:** el Tipo puede utilizarse operativamente sin tarifa asociada.
- **A2 — Nueva vigencia:** PER conserva el valor anterior y abre una nueva vigencia.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 1 | Se rechaza | `LAB_ACCESO_DENEGADO` |
| Tipo de otra Empresa | 2 | Se rechaza | `LAB_TENANT_INVALIDO` |
| Modalidad incompatible | 3 | PER rechaza conforme a sus reglas | Código de PER |

**Postcondiciones**

- La configuración monetaria permanece en PER y el catálogo operativo en LAB.

**Escenarios de aceptación**

```gherkin
@LAB-UC-002 @AC-01
Escenario: Configurar pago por hectárea
  Dado un Tipo de Labor Cosechar que admite superficie
  Cuando el Administrador configura en PER una tarifa por hectárea
  Entonces PER conserva la tarifa y LAB su referencia

@LAB-UC-002 @AC-02
Escenario: Usar un Tipo sin tarifa
  Dado un Tipo de Labor de mantenimiento
  Cuando no tiene remuneración variable asociada
  Entonces puede utilizarse igualmente para planificar trabajo

@LAB-UC-002 @AC-03
Escenario: Denegar configuración al Capataz
  Dado un Capataz autenticado
  Cuando intenta cambiar la tarifa de un Tipo de Labor
  Entonces se rechaza con LAB_ACCESO_DENEGADO
```

### LAB-UC-003 — Crear y planificar una Orden de Labor

- **Estado:** Aprobado
- **Actor:** Administrador o Capataz; CUL, TER y PER como sistemas participantes.
- **Objetivo:** Programar trabajo para una Campaña con contexto, fecha y personas previstas.
- **Requerimientos:** `LAB-REQ-004`.
- **Reglas:** `LAB-BR-001`, `LAB-BR-004`, `LAB-BR-006`, `LAB-BR-007`, `LAB-BR-009`.

**Precondiciones**

- El Tipo de Labor está ACTIVO.
- La Campaña admite nuevos hechos.

**Flujo principal**

1. El Administrador o el Capataz selecciona Campaña y Tipo de Labor.
2. Informa contexto, fecha prevista, alcance, notas y asignaciones individuales o de Cuadrilla.
3. El sistema valida Empresa, Campaña, contexto y referencias.
4. El sistema crea la Orden en BORRADOR.
5. El actor la planifica y queda disponible para ejecución.

**Flujos alternativos**

- **A1 — Sin asignación anticipada:** la Orden se planifica y los participantes reales se informan al ejecutarla.
- **A2 — Con evidencia:** ARC conserva los archivos y LAB sus referencias.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 1 | Se rechaza | `LAB_ACCESO_DENEGADO` |
| Campaña cerrada o ajena | 3 | Se rechaza | `LAB_CAMPANIA_INVALIDA` |
| Contexto incompleto o incompatible | 3 | Se rechaza | `LAB_CONTEXTO_INVALIDO` |
| Transición inválida | 5 | Se rechaza | `LAB_TRANSICION_ORDEN_INVALIDA` |

**Postcondiciones**

- Existe una Orden PLANIFICADA sin crear todavía hechos de ejecución.

**Escenarios de aceptación**

```gherkin
@LAB-UC-003 @AC-01
Escenario: Planificar corte de pasto
  Dado un Tipo activo y una Campaña válida
  Cuando el Administrador programa el trabajo con su contexto y una Cuadrilla
  Entonces se crea una Orden PLANIFICADA

@LAB-UC-003 @AC-02
Escenario: Planificar sin participantes anticipados
  Dado una Orden con contexto válido
  Cuando el Administrador no conoce todavía a los participantes
  Entonces puede planificarla y registrarlos durante la ejecución

@LAB-UC-003 @AC-03
Escenario: Rechazar Campaña cerrada
  Dado una Campaña CERRADA
  Cuando se intenta planificar una Orden en ella
  Entonces se rechaza con LAB_CAMPANIA_INVALIDA

@LAB-UC-003 @AC-04
Escenario: Permitir planificación al Capataz
  Dado un Capataz autenticado en la Empresa
  Cuando crea y planifica una Orden desde el campo
  Entonces la Orden queda PLANIFICADA con el Capataz como creador

@LAB-UC-003 @AC-05
Escenario: Denegar planificación sin rol autorizado
  Dado una Cuenta de Empresa que no es Administrador ni Capataz
  Cuando intenta crear una Orden
  Entonces se rechaza con LAB_ACCESO_DENEGADO
```

### LAB-UC-004 — Mantener una Orden de Labor

- **Estado:** Aprobado
- **Actor:** Administrador.
- **Objetivo:** Modificar, completar o cancelar la planificación sin alterar sus ejecuciones reales.
- **Requerimientos:** `LAB-REQ-005`.
- **Reglas:** `LAB-BR-007`, `LAB-BR-009`.

**Precondiciones**

- Existe una Orden de la Empresa.

**Flujo principal**

1. El Administrador o el Capataz consulta la Orden y sus ejecuciones vinculadas.
2. Selecciona modificar datos todavía editables, declararla COMPLETADA o CANCELARLA con motivo.
3. El sistema valida la transición.
4. El sistema conserva la Orden y todas sus ejecuciones.

**Flujos alternativos**

- **A1 — Ejecución parcial:** se cancela el trabajo restante sin borrar lo ya realizado.
- **A2 — Cumplimiento distribuido:** varias ejecuciones reales completan una misma Orden.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 1 | Se rechaza | `LAB_ACCESO_DENEGADO` |
| Transición inválida | 3 | Se rechaza | `LAB_TRANSICION_ORDEN_INVALIDA` |
| Intento de borrar una ejecución | 4 | Se rechaza | `LAB_EJECUCION_ORDEN_INVALIDA` |

**Postcondiciones**

- El estado de la Orden refleja la decisión y los hechos reales permanecen intactos.

**Escenarios de aceptación**

```gherkin
@LAB-UC-004 @AC-01
Escenario: Completar una Orden con varias jornadas
  Dado una Orden con tres ejecuciones
  Cuando el Administrador declara cumplido el alcance
  Entonces la Orden pasa a COMPLETADA y conserva las tres ejecuciones

@LAB-UC-004 @AC-02
Escenario: Cancelar el remanente
  Dado una Orden parcialmente ejecutada
  Cuando el Administrador la cancela con motivo
  Entonces se conservan las ejecuciones y se cancela lo pendiente

@LAB-UC-004 @AC-03
Escenario: Permitir completar una Orden al Capataz
  Dado un Capataz autenticado y una Orden ejecutada
  Cuando declara cumplido su alcance
  Entonces la Orden pasa a COMPLETADA y conserva sus ejecuciones

@LAB-UC-004 @AC-04
Escenario: Denegar mantenimiento sin rol autorizado
  Dado una Cuenta de Empresa que no es Administrador ni Capataz
  Cuando intenta modificar una Orden
  Entonces se rechaza con LAB_ACCESO_DENEGADO
```

### LAB-UC-005 — Crear e iniciar una ejecución de Labor

- **Estado:** Aprobado
- **Actor:** Administrador o Capataz; CUL y TER como sistemas participantes.
- **Objetivo:** Comenzar el registro del trabajo real desde una Orden o ante una necesidad imprevista.
- **Requerimientos:** `LAB-REQ-006`.
- **Reglas:** `LAB-BR-004` a `LAB-BR-010`.

**Precondiciones**

- El Administrador o el Capataz opera en la Empresa de la ejecución.

**Flujo principal**

1. El Administrador o el Capataz selecciona una Orden PLANIFICADA.
2. El sistema copia como referencia Campaña, Tipo de Labor y contexto planificados.
3. El actor confirma o completa los datos reales iniciales.
4. El sistema crea la ejecución y la pasa a EN_CURSO.
5. La Orden pasa a EN_EJECUCION si era su primera ejecución.

**Flujos alternativos**

- **A1 — Ejecución directa:** el Administrador o el Capataz informa Campaña, Tipo y contexto válidos sin Orden previa.
- **A2 — Nueva jornada:** se crea otra ejecución vinculada con la misma Orden.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso operativo | 1 | Se rechaza | `LAB_ACCESO_DENEGADO` |
| Campaña inválida | 2 o A1 | Se rechaza | `LAB_CAMPANIA_INVALIDA` |
| Contexto inválido | 3 o A1 | Se rechaza | `LAB_CONTEXTO_INVALIDO` |
| Orden cancelada o completada | 4 | Se rechaza | `LAB_TRANSICION_ORDEN_INVALIDA` |

**Postcondiciones**

- Existe una ejecución EN_CURSO con Campaña inmutable.

**Escenarios de aceptación**

```gherkin
@LAB-UC-005 @AC-01
Escenario: Iniciar desde una Orden
  Dado una Orden PLANIFICADA
  Cuando el Capataz inicia el trabajo
  Entonces se crea una ejecución EN_CURSO vinculada con la Orden

@LAB-UC-005 @AC-02
Escenario: Registrar una reparación urgente
  Dado una Campaña y un contexto válidos
  Cuando el Capataz inicia una reparación sin Orden
  Entonces se crea una ejecución directa EN_CURSO

@LAB-UC-005 @AC-03
Escenario: Rechazar una ejecución sin Campaña
  Dado un Capataz autorizado
  Cuando intenta iniciar una ejecución directa sin Campaña
  Entonces se rechaza con LAB_CAMPANIA_INVALIDA

@LAB-UC-005 @AC-04
Escenario: Permitir creación directa al Administrador
  Dado un Administrador autenticado en la Empresa
  Cuando crea e inicia una ejecución imprevista con datos válidos
  Entonces se crea una ejecución directa EN_CURSO

@LAB-UC-005 @AC-05
Escenario: Denegar creación sin rol autorizado
  Dado una Cuenta de Empresa que no es Administrador ni Capataz
  Cuando intenta crear una ejecución
  Entonces se rechaza con LAB_ACCESO_DENEGADO
```

### LAB-UC-006 — Registrar participación real

- **Estado:** Aprobado
- **Actor:** Capataz; PER como sistema participante.
- **Objetivo:** Conservar quién trabajó, durante cuánto tiempo, qué cantidad realizó y cuál fue su contribución.
- **Requerimientos:** `LAB-REQ-008`.
- **Reglas:** `LAB-BR-012` a `LAB-BR-016`, `LAB-BR-019`.

**Precondiciones**

- La ejecución está EN_CURSO o PAUSADA.

**Flujo principal**

1. El Capataz selecciona los Empleados que participaron realmente.
2. Registra sus intervalos y, cuando corresponde, cantidades individuales.
3. El sistema valida Empresa, unidad, valores y superposiciones confirmadas existentes.
4. Si la remuneración usa monto total distribuible, el sistema propone partes iguales.
5. El sistema conserva los participantes reales aun cuando provengan de una Cuadrilla.

**Flujos alternativos**

- **A1 — Composición distinta:** se agregan o quitan participantes respecto de la Cuadrilla planificada.
- **A2 — Sin cantidad individual:** el Tipo permite registrar solo tiempo y contribución.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 1 | Se rechaza | `LAB_ACCESO_DENEGADO` |
| Empleado de otra Empresa | 3 | Se rechaza | `LAB_TENANT_INVALIDO` |
| Valor o unidad inválidos | 3 | Se rechaza | `LAB_APORTE_INDIVIDUAL_INVALIDO` |
| Superposición confirmada | 3 | Se rechaza | `LAB_INTERVALO_SUPERPUESTO` |

**Postcondiciones**

- La ejecución conserva un detalle individual independiente de la composición futura de la Cuadrilla.

**Escenarios de aceptación**

```gherkin
@LAB-UC-006 @AC-01
Escenario: Registrar participantes reales
  Dado una ejecución asignada a una Cuadrilla
  Cuando trabajan dos integrantes y un Empleado adicional
  Entonces se conservan los tres participantes reales

@LAB-UC-006 @AC-02
Escenario: Proponer distribución igual
  Dado una Labor con monto total distribuible y dos participantes
  Cuando se registra su participación
  Entonces se propone 50 por ciento para cada uno

@LAB-UC-006 @AC-03
Escenario: Rechazar una cantidad negativa
  Dado un participante de la ejecución
  Cuando se informa una cantidad negativa
  Entonces se rechaza con LAB_APORTE_INDIVIDUAL_INVALIDO

@LAB-UC-006 @AC-04
Escenario: Denegar registro al Administrador
  Dado un Administrador que no actúa como Capataz
  Cuando intenta registrar la participación operativa
  Entonces se rechaza con LAB_ACCESO_DENEGADO
```

### LAB-UC-007 — Registrar recursos y evidencias

- **Estado:** Aprobado
- **Actor:** Capataz; INV y ARC como sistemas participantes.
- **Objetivo:** Declarar los recursos usados y documentar el trabajo realizado.
- **Requerimientos:** `LAB-REQ-009`, `LAB-REQ-010`.
- **Reglas:** `LAB-BR-021` a `LAB-BR-023`.

**Precondiciones**

- La ejecución no está CONFIRMADA ni ANULADA.

**Flujo principal**

1. El Capataz registra notas sobre la ejecución.
2. Por cada consumo informa Artículo, Almacén, cantidad, unidad y partida cuando sea exigida.
3. El sistema conserva cada línea como DECLARADA y la entrega a INV.
4. El Capataz adjunta imágenes o informes mediante ARC.
5. LAB conserva las referencias y estados, no los binarios ni el movimiento de stock.

**Flujos alternativos**

- **A1 — Sin consumo:** se documenta una ejecución que no utilizó Artículos.
- **A2 — Efecto parcial:** INV confirma unas líneas y rechaza otras, conservando ambas respuestas.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 1 | Se rechaza | `LAB_ACCESO_DENEGADO` |
| Cantidad, Almacén o partida inválidos | 2 | Se rechaza | `LAB_CONSUMO_INVALIDO` |
| Transición de consumo inválida | 3 | Se rechaza | `LAB_ESTADO_CONSUMO_INVALIDO` |
| Referencia de archivo inválida | 4 | Se rechaza | `LAB_EVIDENCIA_INVALIDA` |

**Postcondiciones**

- Los recursos declarados y la evidencia quedan trazados por ejecución.

**Escenarios de aceptación**

```gherkin
@LAB-UC-007 @AC-01
Escenario: Declarar un consumo con origen
  Dado una ejecución operable
  Cuando el Capataz informa Artículo, Almacén, cantidad y unidad
  Entonces la línea queda DECLARADA para validación de INV

@LAB-UC-007 @AC-02
Escenario: Conservar respuestas parciales de Inventario
  Dado tres consumos declarados
  Cuando INV confirma dos y rechaza uno
  Entonces LAB conserva el estado individual de las tres líneas

@LAB-UC-007 @AC-03
Escenario: Rechazar consumo sin Almacén
  Dado un Artículo utilizado
  Cuando se declara sin Almacén de origen
  Entonces se rechaza con LAB_CONSUMO_INVALIDO

@LAB-UC-007 @AC-04
Escenario: Denegar declaración al Administrador
  Dado un Administrador que no actúa como Capataz
  Cuando intenta registrar recursos operativos
  Entonces se rechaza con LAB_ACCESO_DENEGADO
```

### LAB-UC-008 — Cambiar el estado operativo de una ejecución

- **Estado:** Aprobado
- **Actor:** Capataz.
- **Objetivo:** Modificar y conducir el trabajo real hasta dejarlo finalizado para revisión administrativa.
- **Requerimientos:** `LAB-REQ-007`.
- **Reglas:** `LAB-BR-010`, `LAB-BR-011`, `LAB-BR-024`.

**Precondiciones**

- La ejecución está BORRADOR, EN_CURSO o PAUSADA.

**Flujo principal**

1. El Capataz consulta el estado actual.
2. Modifica los datos operativos permitidos o selecciona una transición operativa.
3. Para cancelar informa el motivo.
4. Para finalizar completa los datos exigidos y deja el trabajo listo para el control del Administrador.
5. El sistema registra estado, actor y fecha sin eliminar hechos parciales.

**Flujos alternativos**

- **A1 — Pausa y reanudación:** la ejecución alterna entre PAUSADA y EN_CURSO.
- **A2 — Cancelación parcial:** se conserva todo lo realizado y queda pendiente la revisión administrativa de sus efectos.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 1 | Se rechaza | `LAB_ACCESO_DENEGADO` |
| Transición inválida | 2 | Se rechaza | `LAB_TRANSICION_EJECUCION_INVALIDA` |
| Cancelación sin motivo | 3 | Se rechaza | `LAB_CANCELACION_INVALIDA` |
| Magnitud requerida ausente | 4 | No se finaliza | `LAB_MAGNITUD_REQUERIDA` |

**Postcondiciones**

- La ejecución refleja su estado operativo y, cuando queda FINALIZADA, espera la confirmación del Administrador.

**Escenarios de aceptación**

```gherkin
@LAB-UC-008 @AC-01
Escenario: Pausar y reanudar
  Dado una ejecución EN_CURSO
  Cuando el Capataz la pausa y luego la reanuda
  Entonces queda EN_CURSO y conserva ambos eventos

@LAB-UC-008 @AC-02
Escenario: Cancelar después de trabajo parcial
  Dado una ejecución con participantes y consumos
  Cuando el Capataz la cancela con motivo
  Entonces queda CANCELADA y conserva los hechos registrados

@LAB-UC-008 @AC-03
Escenario: Rechazar finalización incompleta
  Dado un Tipo que exige superficie
  Cuando el Capataz finaliza sin informarla
  Entonces se rechaza con LAB_MAGNITUD_REQUERIDA

@LAB-UC-008 @AC-04
Escenario: Denegar operación al Administrador
  Dado un Administrador que no actúa como Capataz
  Cuando intenta finalizar la ejecución
  Entonces se rechaza con LAB_ACCESO_DENEGADO
```

### LAB-UC-009 — Revisar y confirmar una ejecución

- **Estado:** Aprobado
- **Actor:** Administrador; INV como sistema participante.
- **Objetivo:** Validar el hecho completo y convertirlo en fuente confirmada para los demás módulos.
- **Requerimientos:** `LAB-REQ-011`.
- **Reglas:** `LAB-BR-012` a `LAB-BR-024`.

**Precondiciones**

- La ejecución está FINALIZADA.

**Flujo principal**

1. El Administrador revisa contexto, participantes, tiempos, magnitudes, distribución, notas y recursos.
2. El sistema muestra el estado individual de cada consumo informado por INV.
3. El Administrador puede ajustar los porcentajes de contribución e informa el motivo.
4. El sistema valida que los participantes y magnitudes estén completos y que la distribución sume 100 % cuando aplique.
5. El Administrador confirma la ejecución.
6. El sistema la deja CONFIRMADA e informa a los módulos consumidores.

**Flujos alternativos**

- **A1 — Consumo pendiente o rechazado:** se confirma mostrando expresamente su efecto parcial.
- **A2 — Sin monto distribuible:** no se exige una distribución porcentual remunerativa.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 1 | Se rechaza | `LAB_ACCESO_DENEGADO` |
| Faltan participantes reales | 4 | Se rechaza | `LAB_PARTICIPACION_INVALIDA` |
| Distribución no suma 100 % | 4 | Se rechaza | `LAB_DISTRIBUCION_INVALIDA` |
| Superposición confirmada | 4 | Se rechaza | `LAB_INTERVALO_SUPERPUESTO` |
| Estado distinto de FINALIZADA | 5 | Se rechaza | `LAB_CONFIRMACION_INVALIDA` |

**Postcondiciones**

- La versión confirmada queda inmutable y disponible como hecho de Labor.

**Escenarios de aceptación**

```gherkin
@LAB-UC-009 @AC-01
Escenario: Confirmar una ejecución completa
  Dado una ejecución FINALIZADA con datos válidos
  Cuando el Administrador la revisa y confirma
  Entonces queda CONFIRMADA y disponible para los módulos consumidores

@LAB-UC-009 @AC-02
Escenario: Ajustar la contribución
  Dado una propuesta de 50 y 50 por ciento
  Cuando el Administrador registra 20 y 80 por ciento con motivo
  Entonces la distribución ajustada queda trazada

@LAB-UC-009 @AC-03
Escenario: Confirmar con un consumo rechazado
  Dado una ejecución con una línea rechazada por INV
  Cuando el Administrador confirma con conocimiento de ese estado
  Entonces la ejecución queda CONFIRMADA y la línea sigue RECHAZADA

@LAB-UC-009 @AC-04
Escenario: Denegar confirmación al Capataz
  Dado un Capataz que finalizó el trabajo
  Cuando intenta confirmarlo administrativamente
  Entonces se rechaza con LAB_ACCESO_DENEGADO
```

### LAB-UC-010 — Corregir o anular una ejecución confirmada

- **Estado:** Aprobado
- **Actor:** Administrador o Capataz.
- **Objetivo:** Rectificar un hecho confirmado sin sobrescribir ni perder la versión anterior.
- **Requerimientos:** `LAB-REQ-012`.
- **Reglas:** `LAB-BR-025`.

**Precondiciones**

- Existe una ejecución CONFIRMADA de la Empresa.

**Flujo principal**

1. El Administrador selecciona corregir e informa el motivo.
2. El sistema crea una versión editable basada en la versión confirmada.
3. El Administrador corrige los datos permitidos y la confirma mediante `LAB-UC-009`.
4. El sistema conserva ambas versiones e identifica cuál está vigente.
5. Los módulos consumidores reciben la sustitución trazable.

**Flujos alternativos**

- **A1 — Anulación:** el Administrador anula con motivo y no crea una versión sustituta.
- **A2 — Corrección rechazada:** la versión anterior continúa vigente.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 1 | Se rechaza | `LAB_ACCESO_DENEGADO` |
| Motivo ausente | 1 | Se rechaza | `LAB_HECHO_CONFIRMADO_INMUTABLE` |
| Intento de editar en lugar | 2 | Se rechaza | `LAB_HECHO_CONFIRMADO_INMUTABLE` |

**Postcondiciones**

- La cadena de versiones y anulaciones permanece auditable.

**Escenarios de aceptación**

```gherkin
@LAB-UC-010 @AC-01
Escenario: Corregir participantes
  Dado una ejecución CONFIRMADA con un participante incorrecto
  Cuando el Administrador crea y confirma una corrección con motivo
  Entonces la nueva versión queda vigente y la anterior permanece consultable

@LAB-UC-010 @AC-02
Escenario: Anular un hecho
  Dado una ejecución confirmada que no debió registrarse
  Cuando el Administrador la anula con motivo
  Entonces queda ANULADA sin eliminar su historia

@LAB-UC-010 @AC-03
Escenario: Rechazar edición directa
  Dado una ejecución CONFIRMADA
  Cuando se intenta sobrescribir su cantidad
  Entonces se rechaza con LAB_HECHO_CONFIRMADO_INMUTABLE

@LAB-UC-010 @AC-04
Escenario: Denegar corrección al Capataz
  Dado un Capataz autenticado
  Cuando intenta corregir una ejecución confirmada
  Entonces se rechaza con LAB_ACCESO_DENEGADO
```

### LAB-UC-011 — Revisar remuneración originada por una Labor

- **Estado:** Aprobado
- **Actor:** Administrador; PER como sistema participante.
- **Objetivo:** Usar los hechos confirmados para revisar el importe que corresponda a cada participante.
- **Requerimientos:** `LAB-REQ-013`.
- **Reglas:** `LAB-BR-013`, `LAB-BR-016` a `LAB-BR-018`.

**Precondiciones**

- La ejecución está CONFIRMADA y tiene participantes reales.

**Flujo principal**

1. LAB entrega a PER Tipo de Labor, ejecución, participantes, tiempos, cantidades y porcentajes confirmados.
2. PER consulta la modalidad y tarifa vigente de cada Empleado.
3. PER propone los devengos que correspondan.
4. El Administrador revisa la propuesta.
5. El Administrador confirma o ajusta un importe con motivo.
6. PER conserva el valor sugerido, el valor confirmado y su trazabilidad.

**Flujos alternativos**

- **A1 — Empleado mensual:** PER no genera adicional automático aunque LAB conserve su participación.
- **A2 — Distribución desigual:** PER aplica el porcentaje confirmado para quien cobre por Labor.
- **A3 — Sin tarifa:** PER informa que no puede proponer un importe hasta resolver su configuración.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 4 | Se rechaza | `LAB_ACCESO_DENEGADO` |
| Ejecución no confirmada | 1 | No se genera propuesta | `LAB_CONFIRMACION_INVALIDA` |
| Ajuste sin motivo | 5 | PER rechaza conforme a sus reglas | Código de PER |

**Postcondiciones**

- LAB no conserva importes; PER conserva la decisión remunerativa referenciada a la ejecución.

**Escenarios de aceptación**

```gherkin
@LAB-UC-011 @AC-01
Escenario: Resolver participantes con modalidades distintas
  Dado Juan mensual y Pedro remunerado por Labor en una ejecución confirmada
  Cuando PER procesa la participación de ambos
  Entonces conserva el hecho de Juan sin adicional automático y propone el importe de Pedro

@LAB-UC-011 @AC-02
Escenario: Aplicar contribución del 80 por ciento
  Dado Pedro con 80 por ciento confirmado en una Labor de monto total distribuible
  Cuando PER calcula su propuesta
  Entonces usa ese porcentaje conforme a la configuración vigente

@LAB-UC-011 @AC-03
Escenario: Ajustar un importe con trazabilidad
  Dado una propuesta monetaria de PER
  Cuando el Administrador la modifica con motivo
  Entonces PER conserva el valor sugerido y el ajustado

@LAB-UC-011 @AC-04
Escenario: Denegar revisión al Capataz
  Dado un Capataz autenticado
  Cuando intenta confirmar un importe
  Entonces se rechaza con LAB_ACCESO_DENEGADO
```

### LAB-UC-012 — Comparar asistencia e imputación

- **Estado:** Aprobado
- **Actor:** Administrador; PER como sistema participante.
- **Objetivo:** Detectar diferencias entre presencia registrada y tiempo atribuido a Labores.
- **Requerimientos:** `LAB-REQ-014`.
- **Reglas:** `LAB-BR-014`, `LAB-BR-015`.

**Precondiciones**

- Existe al menos una fuente de tiempo para el Empleado y período consultado.

**Flujo principal**

1. El Administrador selecciona Campaña, período o Empleado.
2. LAB reúne los intervalos de ejecuciones confirmadas.
3. PER aporta la asistencia confirmada disponible.
4. El sistema muestra coincidencias, tiempo no imputado, exceso imputado y ausencia de contraste.
5. Ninguna fuente es modificada por la comparación.

**Flujos alternativos**

- **A1 — Sin asistencia:** se muestran las Labores y se informa que no existe contraste.
- **A2 — Sin Labores:** se muestra el tiempo asistido no imputado.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 1 | Se rechaza | `LAB_ACCESO_DENEGADO` |
| Intervalos de Labor superpuestos | 2 | Se informa inconsistencia y se impide su confirmación | `LAB_INTERVALO_SUPERPUESTO` |

**Postcondiciones**

- La diferencia queda disponible para revisión sin alterar asistencia ni Labores.

**Escenarios de aceptación**

```gherkin
@LAB-UC-012 @AC-01
Escenario: Mostrar tiempo no imputado
  Dado ocho horas de asistencia y siete horas de Labores
  Cuando el Administrador compara ambas fuentes
  Entonces se informa una hora no imputada

@LAB-UC-012 @AC-02
Escenario: Comparar sin asistencia
  Dado una Labor confirmada sin asistencia disponible
  Cuando se ejecuta la comparación
  Entonces se conserva la Labor y se informa la ausencia de contraste

@LAB-UC-012 @AC-03
Escenario: Denegar comparación al Capataz
  Dado un Capataz autenticado
  Cuando intenta comparar información global de Empleados
  Entonces se rechaza con LAB_ACCESO_DENEGADO
```

### LAB-UC-013 — Consultar historia de Labores

- **Estado:** Aprobado
- **Actor:** Administrador.
- **Objetivo:** Reconstruir qué se planificó, realizó y utilizó dentro de cada Campaña.
- **Requerimientos:** `LAB-REQ-015`.
- **Reglas:** `LAB-BR-003` a `LAB-BR-005`, `LAB-BR-025`, `LAB-BR-027`.

**Precondiciones**

- El Administrador o el Capataz opera en la Empresa consultada.

**Flujo principal**

1. El Administrador o el Capataz selecciona una Campaña o aplica filtros por fecha, Tipo, contexto, estado, participante o recurso.
2. El sistema devuelve Órdenes y ejecuciones de esa Empresa y Campaña.
3. El actor abre una ejecución y consulta participantes, tiempos, magnitudes, consumos, evidencias y eventos.
4. Si hubo correcciones o anulación, el sistema muestra la cadena completa y cuál versión está vigente.

**Flujos alternativos**

- **A1 — Campaña nueva:** la consulta comienza sin hechos propios.
- **A2 — Campaña anterior:** su historia permanece sin reasignarse a la actual.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 1 | Se rechaza | `LAB_ACCESO_DENEGADO` |
| Campaña de otra Empresa | 2 | Se rechaza | `LAB_TENANT_INVALIDO` |

**Postcondiciones**

- La consulta no modifica los hechos ni sus referencias de Campaña.

**Escenarios de aceptación**

```gherkin
@LAB-UC-013 @AC-01
Escenario: Consultar una Campaña anterior
  Dado una Campaña con ejecuciones confirmadas
  Cuando el Administrador consulta su historia
  Entonces ve sus Labores, participantes, recursos y versiones

@LAB-UC-013 @AC-02
Escenario: Empezar una Campaña sin hechos propios
  Dado una Campaña recién creada
  Cuando el Administrador consulta sus Labores
  Entonces obtiene una lista vacía sin perder la historia anterior

@LAB-UC-013 @AC-03
Escenario: Denegar consulta de otra Empresa
  Dado una Campaña perteneciente a otra Empresa
  Cuando se intenta consultar desde el contexto actual
  Entonces se rechaza con LAB_TENANT_INVALIDO

@LAB-UC-013 @AC-04
Escenario: Permitir consulta operativa al Capataz
  Dado un Capataz autenticado en la Empresa
  Cuando consulta la historia de Labores de una Campaña
  Entonces obtiene sus Órdenes, ejecuciones, participantes y recursos

@LAB-UC-013 @AC-05
Escenario: Denegar consulta sin rol autorizado
  Dado una Cuenta de Empresa que no es Administrador ni Capataz
  Cuando intenta consultar la historia de Labores
  Entonces se rechaza con LAB_ACCESO_DENEGADO
```

### LAB-UC-014 — Proveer hechos confirmados de Labor

- **Estado:** Aprobado
- **Actor:** PER, INV, COS o REP como sistema consumidor autorizado.
- **Objetivo:** Entregar hechos trazables para remuneración, stock, producción y reportes sin transferir su propiedad.
- **Requerimientos:** `LAB-REQ-016`.
- **Reglas:** `LAB-BR-017`, `LAB-BR-021`, `LAB-BR-022`, `LAB-BR-025` a `LAB-BR-027`.

**Precondiciones**

- El consumidor está autorizado por ACC y solicita datos de una Empresa concreta.

**Flujo principal**

1. El sistema consumidor solicita hechos por Empresa, Campaña o ejecución.
2. LAB verifica autorización, pertenencia y alcance.
3. LAB entrega la versión vigente de las ejecuciones confirmadas con sus referencias, participación y recursos aplicables.
4. El consumidor procesa los hechos bajo las reglas de su módulo.

**Flujos alternativos**

- **A1 — Corrección:** LAB identifica la versión sustituida y la vigente.
- **A2 — Anulación:** LAB informa el hecho anulado para que el consumidor revierta o ajuste conforme a sus reglas.
- **A3 — Cosecha:** COS recibe el vínculo con el trabajo, pero conserva la producción obtenida.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Consumidor no autorizado | 2 | Se rechaza sin datos | `LAB_ACCESO_DENEGADO` |
| Empresa cruzada | 2 | Se rechaza | `LAB_TENANT_INVALIDO` |
| Solicitud de importes de PER | 3 | LAB no los provee | `LAB_REMUNERACION_FUERA_DE_MODULO` |

**Postcondiciones**

- LAB conserva la fuente operativa y cada consumidor mantiene únicamente los efectos que le pertenecen.

**Escenarios de aceptación**

```gherkin
@LAB-UC-014 @AC-01
Escenario: Proveer participación a Personal
  Dado una ejecución CONFIRMADA
  Cuando PER solicita sus hechos
  Entonces LAB entrega participantes, tiempos, cantidades y porcentajes sin importes

@LAB-UC-014 @AC-02
Escenario: Proveer hechos por Campaña a Reportes
  Dado una Campaña con ejecuciones vigentes
  Cuando REP solicita sus hechos confirmados
  Entonces LAB los entrega con su Campaña y contexto originales

@LAB-UC-014 @AC-03
Escenario: Informar una anulación
  Dado una ejecución confirmada que fue anulada
  Cuando un consumidor sincroniza sus hechos
  Entonces LAB informa la anulación sin eliminar la versión histórica

@LAB-UC-014 @AC-04
Escenario: Denegar datos a un consumidor no autorizado
  Dado un sistema sin alcance sobre la Empresa
  Cuando solicita ejecuciones confirmadas
  Entonces se rechaza con LAB_ACCESO_DENEGADO
```
