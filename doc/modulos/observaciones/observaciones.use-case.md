---
type: use-cases
module: "OBS"
status: Propuesto
owner: "Analista"
---

# Observaciones — Casos de uso

## 1. Actores

| Actor | Tipo | Origen |
|---|---|---|
| Administrador | Rol | `IA`, `OBS-Q-016` |
| Capataz | Rol | `B-01`, `B-02`, glosario, `OBS-Q-016` |
| ACC | Sistema | `OBS-DEP-002` |
| CUL | Sistema | `OBS-DEP-003` |
| TER | Sistema | `OBS-DEP-004` |
| ARC | Sistema | `OBS-DEP-005` |
| LAB | Sistema | `OBS-DEP-006` |
| PER | Sistema | `OBS-DEP-007` |

## 2. Permisos

La distribución fue aprobada mediante `OBS-Q-016`.

| Caso de uso | Administrador | Capataz | Sistema | Condición |
|---|:---:|:---:|:---:|---|
| `OBS-UC-001` | Sí | No | No | Configuración de su Empresa |
| `OBS-UC-002` | Sí | Sí | Cond. | CUL valida la Implantación y el estado |
| `OBS-UC-003` | Sí | Sí | Cond. | CUL valida la Implantación y el estado |
| `OBS-UC-004` | Sí | No | No | Historia de su Empresa |
| `OBS-UC-005` | Sí | Sí | Cond. | Alcance autorizado por ACC |
| `OBS-UC-006` | Sí | Sí | Cond. | CUL y TER validan referencias |
| `OBS-UC-007` | Sí | Sí | Cond. | Confirmación sujeta a `OBS-BR-017` |
| `OBS-UC-008` | Sí | Sí | Cond. | ARC valida la evidencia |
| `OBS-UC-009` | Sí | Sí | Cond. | Alcance autorizado por ACC |
| `OBS-UC-010` | Sí | Sí | Cond. | Alcance autorizado por ACC |
| `OBS-UC-011` | Sí | No | No | Observación de su Empresa |
| `OBS-UC-012` | Sí | Sí | Cond. | LAB valida la Orden |
| `OBS-UC-013` | Sí | Sí | Cond. | Confirmación expresa dentro de su alcance |

## 3. Casos de uso

### OBS-UC-001 — Administrar Tipos de Observación

- **Estado:** Propuesto
- **Actor:** Administrador.
- **Objetivo:** Mantener los tipos configurables que utiliza su Empresa cliente.
- **Requerimientos:** `OBS-REQ-005`.
- **Reglas:** `OBS-BR-006` a `OBS-BR-008`, `OBS-BR-014`.

**Precondiciones**

- El Administrador opera en una Empresa vigente.

**Flujo principal**

1. El Administrador informa la identidad, clasificación y aplicabilidad del Tipo.
2. El sistema verifica permiso y `OBS-BR-006` a `OBS-BR-008`.
3. Si corresponde a un problema sanitario, valida `OBS-BR-014`.
4. El sistema conserva el Tipo para su uso posterior.

**Flujos alternativos**

- **A1 — Inactivación:** el Administrador solicita dejar de ofrecer un Tipo y se aplica `OBS-BR-007`.
- **A2 — Reactivación:** el mismo Tipo vuelve a estar disponible sin duplicar su identidad.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza sin cambios | `OBS_ACCESO_DENEGADO` |
| No se cumple `OBS-BR-006` | 2 | Se rechaza sin cambios | `OBS_TIPO_OBSERVACION_INVALIDO` |
| No se cumple `OBS-BR-014` | 3 | Se rechaza sin cambios | `OBS_PROBLEMA_SANITARIO_INVALIDO` |

**Postcondiciones**

- El catálogo conserva identidad, Empresa y vigencia.

**Escenarios de aceptación**

```gherkin
@OBS-UC-001 @AC-01
Escenario: Crear un Tipo de Observación
  Dado un Administrador autorizado en una Empresa vigente
  Cuando configura un Tipo válido para esa Empresa
  Entonces el Tipo queda disponible para nuevas Observaciones

@OBS-UC-001 @AC-02
Escenario: Usar un catálogo de otra Empresa
  Dado un Tipo perteneciente a otra Empresa
  Cuando el Administrador intenta mantenerlo
  Entonces se rechaza con OBS_TIPO_OBSERVACION_INVALIDO

@OBS-UC-001 @AC-03
Escenario: Capataz sin permiso de configuración
  Dado un Capataz autenticado
  Cuando intenta administrar Tipos de Observación
  Entonces se rechaza con OBS_ACCESO_DENEGADO
```

### OBS-UC-002 — Iniciar historial fenológico

- **Estado:** Propuesto
- **Actor:** Administrador o Capataz; CUL como sistema participante.
- **Objetivo:** Registrar el primer estado conocido de una Implantación.
- **Requerimientos:** `OBS-REQ-001`.
- **Reglas:** `OBS-BR-001` a `OBS-BR-004`, `OBS-BR-008`.

**Precondiciones**

- La Implantación existe y pertenece a la Empresa del actor.
- La Implantación no tiene un período vigente.

**Flujo principal**

1. El actor selecciona la Implantación, el estado fenológico y la fecha inicial.
2. El sistema verifica permiso y pertenencia.
3. CUL valida `OBS-BR-002`.
4. El sistema valida `OBS-BR-001`, `OBS-BR-003` y `OBS-BR-004`.
5. El sistema inicia el primer período fenológico.

**Flujos alternativos**

- **A1 — Sin evaluación:** el período se inicia sin nota ni evaluación.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza sin cambios | `OBS_ACCESO_DENEGADO` |
| Estado incompatible | 3 | Se rechaza sin cambios | `OBS_ESTADO_FENOLOGICO_INVALIDO` |
| Ya existe un período vigente | 4 | Se rechaza sin cambios | `OBS_PERIODO_FENOLOGICO_SUPERPUESTO` |

**Postcondiciones**

- La Implantación tiene un único período fenológico vigente.

**Escenarios de aceptación**

```gherkin
@OBS-UC-002 @AC-01
Escenario: Iniciar el historial de una Implantación
  Dado una Implantación sin historial y un estado compatible
  Cuando un actor autorizado informa la fecha inicial
  Entonces queda un único período vigente

@OBS-UC-002 @AC-02
Escenario: Estado de otro Cultivo
  Dado una Implantación de Yerba mate
  Cuando se intenta iniciar con un estado exclusivo de Citrus
  Entonces se rechaza con OBS_ESTADO_FENOLOGICO_INVALIDO

@OBS-UC-002 @AC-03
Escenario: Actor sin permiso
  Dado un actor sin autorización sobre la Implantación
  Cuando intenta iniciar el historial
  Entonces se rechaza con OBS_ACCESO_DENEGADO
```

### OBS-UC-003 — Registrar transición fenológica

- **Estado:** Propuesto
- **Actor:** Administrador o Capataz; CUL como sistema participante.
- **Objetivo:** Registrar el cambio de estado de una Implantación.
- **Requerimientos:** `OBS-REQ-002`.
- **Reglas:** `OBS-BR-001` a `OBS-BR-004`, `OBS-BR-008`.

**Precondiciones**

- La Implantación tiene un período fenológico vigente.

**Flujo principal**

1. El actor informa el nuevo estado, la fecha, la nota opcional y la evaluación cuando corresponda.
2. El sistema verifica permiso y pertenencia.
3. CUL valida `OBS-BR-002`.
4. El sistema valida `OBS-BR-003` y `OBS-BR-004`.
5. El sistema finaliza el período vigente e inicia el siguiente.

**Flujos alternativos**

- **A1 — Primera etapa:** si no existe historial, se deriva a `OBS-UC-002`.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza sin cambios | `OBS_ACCESO_DENEGADO` |
| Estado incompatible | 3 | Se rechaza sin cambios | `OBS_ESTADO_FENOLOGICO_INVALIDO` |
| Fecha no posterior | 4 | Se rechaza sin cambios | `OBS_TRANSICION_FENOLOGICA_NO_CRONOLOGICA` |
| Evaluación inválida | 4 | Se rechaza sin cambios | `OBS_EVALUACION_FENOLOGICA_INVALIDA` |

**Postcondiciones**

- El período anterior queda finalizado y existe uno nuevo vigente sin superposición.

**Escenarios de aceptación**

```gherkin
@OBS-UC-003 @AC-01
Escenario: Cambiar el estado fenológico
  Dado una Implantación con un período vigente
  Cuando se registra un estado compatible con fecha posterior
  Entonces el período anterior finaliza y el nuevo queda vigente

@OBS-UC-003 @AC-02
Escenario: Insertar una transición retroactiva
  Dado un período fenológico vigente
  Cuando se informa una fecha anterior a su inicio
  Entonces se rechaza con OBS_TRANSICION_FENOLOGICA_NO_CRONOLOGICA

@OBS-UC-003 @AC-03
Escenario: Actor sin permiso
  Dado un actor sin autorización sobre la Implantación
  Cuando intenta registrar la transición
  Entonces se rechaza con OBS_ACCESO_DENEGADO
```

### OBS-UC-004 — Corregir historial fenológico

- **Estado:** Propuesto
- **Actor:** Administrador.
- **Objetivo:** Corregir un error sin perder el historial anterior.
- **Requerimientos:** `OBS-REQ-003`.
- **Reglas:** `OBS-BR-001`, `OBS-BR-002`, `OBS-BR-005`, `OBS-BR-008`.

**Precondiciones**

- Existe un período fenológico de la Empresa.

**Flujo principal**

1. El Administrador selecciona el período e informa la corrección y su motivo.
2. El sistema verifica permiso y pertenencia.
3. El sistema valida la consistencia del historial resultante.
4. El sistema conserva la versión anterior y publica la corrección.

**Flujos alternativos**

- **A1 — Desistimiento:** no se modifica ninguna versión.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza sin cambios | `OBS_ACCESO_DENEGADO` |
| Historial resultante inconsistente | 3 | Se rechaza sin cambios | `OBS_CORRECCION_FENOLOGICA_INVALIDA` |

**Postcondiciones**

- La corrección y la versión reemplazada permanecen trazables.

**Escenarios de aceptación**

```gherkin
@OBS-UC-004 @AC-01
Escenario: Corregir conservando la versión anterior
  Dado un período con un dato incorrecto
  Cuando el Administrador informa la corrección y el motivo
  Entonces la versión anterior permanece consultable

@OBS-UC-004 @AC-02
Escenario: Corrección que superpone períodos
  Dado un historial cronológico
  Cuando la corrección produce una superposición
  Entonces se rechaza con OBS_CORRECCION_FENOLOGICA_INVALIDA

@OBS-UC-004 @AC-03
Escenario: Capataz sin permiso de corrección
  Dado un Capataz autenticado
  Cuando intenta corregir el historial
  Entonces se rechaza con OBS_ACCESO_DENEGADO
```

### OBS-UC-005 — Consultar historial fenológico

- **Estado:** Propuesto
- **Actor:** Administrador o Capataz; CUL y LAB como sistemas participantes.
- **Objetivo:** Comprender la evolución de una Implantación en relación con sus Labores.
- **Requerimientos:** `OBS-REQ-004`.
- **Reglas:** `OBS-BR-001`, `OBS-BR-005`, `OBS-BR-008`.

**Precondiciones**

- El actor tiene alcance sobre la Implantación.

**Flujo principal**

1. El actor solicita el historial de una Implantación.
2. El sistema verifica permiso y pertenencia.
3. El sistema presenta los períodos y sus correcciones en orden cronológico.
4. LAB aporta referencias de Labores del mismo contexto para su análisis temporal.

**Flujos alternativos**

- **A1 — Sin Labores:** se presenta el historial sin asociaciones operativas.
- **A2 — Sin historial:** se informa que aún no existen períodos.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza | `OBS_ACCESO_DENEGADO` |
| Implantación de otra Empresa | 2 | Se rechaza | `OBS_EMPRESA_INCONSISTENTE` |

**Postcondiciones**

- La consulta no modifica el historial ni las Labores.

**Escenarios de aceptación**

```gherkin
@OBS-UC-005 @AC-01
Escenario: Consultar períodos y Labores relacionadas
  Dado una Implantación con historial y Labores
  Cuando un actor autorizado consulta su evolución
  Entonces recibe los períodos y referencias operativas ordenadas temporalmente

@OBS-UC-005 @AC-02
Escenario: Consultar una Implantación de otra Empresa
  Dado una Implantación ajena
  Cuando el actor solicita su historial
  Entonces se rechaza con OBS_EMPRESA_INCONSISTENTE

@OBS-UC-005 @AC-03
Escenario: Actor sin permiso
  Dado un actor sin alcance sobre la Implantación
  Cuando consulta el historial
  Entonces se rechaza con OBS_ACCESO_DENEGADO
```

### OBS-UC-006 — Registrar una Observación

- **Estado:** Propuesto
- **Actor:** Administrador o Capataz; CUL, TER y PER como sistemas participantes.
- **Objetivo:** Registrar un hallazgo general u operativo con su contexto disponible.
- **Requerimientos:** `OBS-REQ-006`.
- **Reglas:** `OBS-BR-006` a `OBS-BR-013`, `OBS-BR-019`, `OBS-BR-023`.

**Precondiciones**

- El Tipo de Observación existe para la Empresa.

**Flujo principal**

1. El actor informa Tipo, nota, urgencia, contexto opcional, ubicación opcional y momento observado cuando corresponda.
2. El sistema verifica permiso y `OBS-BR-006` a `OBS-BR-009`.
3. Si existe Implantación, CUL resuelve `OBS-BR-010`.
4. El sistema valida `OBS-BR-011` y el ciclo aplicable.
5. El sistema registra la Observación sin crear efectos automáticos.

**Flujos alternativos**

- **A1 — Fuera de una Chacra:** se conserva el punto o la descripción disponible sin exigir Lote.
- **A2 — Observador material:** se referencia un Empleado de PER distinto de la Cuenta registrante.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza sin cambios | `OBS_ACCESO_DENEGADO` |
| Contexto incompatible | 2 | Se rechaza sin cambios | `OBS_UBICACION_INCONSISTENTE` |
| Urgencia inválida | 4 | Se rechaza sin cambios | `OBS_URGENCIA_INVALIDA` |

**Postcondiciones**

- La Observación queda trazable dentro de su Empresa sin crear una Orden automática.

**Escenarios de aceptación**

```gherkin
@OBS-UC-006 @AC-01
Escenario: Registrar un caño roto fuera de una Chacra
  Dado un Tipo general activo
  Cuando un actor autorizado registra el hallazgo con urgencia válida
  Entonces la Observación queda registrada sin exigir Lote

@OBS-UC-006 @AC-02
Escenario: Informar Lote de otra Chacra
  Dado una Chacra y un Lote incompatibles
  Cuando se intenta registrar la Observación
  Entonces se rechaza con OBS_UBICACION_INCONSISTENTE

@OBS-UC-006 @AC-03
Escenario: Actor sin permiso
  Dado un actor sin autorización
  Cuando intenta registrar una Observación
  Entonces se rechaza con OBS_ACCESO_DENEGADO
```

### OBS-UC-007 — Registrar una Observación sanitaria

- **Estado:** Propuesto
- **Actor:** Administrador o Capataz; CUL como sistema participante.
- **Objetivo:** Registrar un signo, daño o condición anormal de las plantas sin confundir sospecha con diagnóstico.
- **Requerimientos:** `OBS-REQ-007`.
- **Reglas:** `OBS-BR-008` a `OBS-BR-017`, `OBS-BR-023`.

**Precondiciones**

- Existe una Implantación y un Tipo sanitario aplicable.

**Flujo principal**

1. El actor informa el síntoma, severidad, extensión, nivel de certeza y causa cuando corresponda.
2. El sistema verifica permiso, Empresa e Implantación.
3. El sistema valida `OBS-BR-014` a `OBS-BR-016`.
4. Si se confirma una causa, valida `OBS-BR-017`.
5. El sistema registra el hallazgo sin generar tratamientos ni Labores automáticas.

**Flujos alternativos**

- **A1 — Solo hallazgo:** se registra sin causa identificada.
- **A2 — Sospecha:** se informa una posible causa sin presentarla como confirmada.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza sin cambios | `OBS_ACCESO_DENEGADO` |
| Falta Implantación | 2 | Se rechaza sin cambios | `OBS_IMPLANTACION_REQUERIDA` |
| Problema no aplicable | 3 | Se rechaza sin cambios | `OBS_PROBLEMA_SANITARIO_INVALIDO` |
| Confirmación no autorizada | 4 | Se rechaza sin cambios | `OBS_CONFIRMACION_SANITARIA_NO_AUTORIZADA` |

**Postcondiciones**

- El hallazgo conserva certeza, severidad y contexto sin producir efectos productivos.

**Escenarios de aceptación**

```gherkin
@OBS-UC-007 @AC-01
Escenario: Registrar una causa sospechada
  Dado una Implantación y un problema aplicable
  Cuando un actor autorizado registra síntomas y una sospecha
  Entonces la causa queda identificada como sospechada

@OBS-UC-007 @AC-02
Escenario: Usar un problema de otro Cultivo
  Dado un problema no aplicable a la Implantación
  Cuando se intenta registrar el hallazgo
  Entonces se rechaza con OBS_PROBLEMA_SANITARIO_INVALIDO

@OBS-UC-007 @AC-03
Escenario: Actor sin autorización para confirmar
  Dado un actor sin el permiso definido por OBS-BR-017
  Cuando intenta confirmar una causa
  Entonces se rechaza con OBS_CONFIRMACION_SANITARIA_NO_AUTORIZADA
```

### OBS-UC-008 — Vincular evidencias

- **Estado:** Propuesto
- **Actor:** Administrador o Capataz; ARC como sistema participante.
- **Objetivo:** Incorporar imágenes u otros Archivos privados al historial del hallazgo.
- **Requerimientos:** `OBS-REQ-008`.
- **Reglas:** `OBS-BR-008`, `OBS-BR-013`.

**Precondiciones**

- Existe una Observación de la Empresa.

**Flujo principal**

1. El actor selecciona una o más evidencias disponibles en ARC.
2. El sistema verifica permiso y pertenencia.
3. ARC valida cada Archivo privado.
4. OBS conserva las referencias válidas.

**Flujos alternativos**

- **A1 — Sin descripción:** se resuelve según `OBS-Q-018`.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza sin cambios | `OBS_ACCESO_DENEGADO` |
| Archivo de otra Empresa | 3 | Se rechaza sin cambios | `OBS_EVIDENCIA_INVALIDA` |

**Postcondiciones**

- La evidencia queda vinculada sin copiar el binario dentro de OBS.

**Escenarios de aceptación**

```gherkin
@OBS-UC-008 @AC-01
Escenario: Vincular una imagen privada
  Dado una Observación y una imagen válida de la misma Empresa
  Cuando un actor autorizado la vincula
  Entonces OBS conserva su referencia

@OBS-UC-008 @AC-02
Escenario: Vincular un Archivo de otra Empresa
  Dado un Archivo ajeno
  Cuando se intenta vincularlo
  Entonces se rechaza con OBS_EVIDENCIA_INVALIDA

@OBS-UC-008 @AC-03
Escenario: Actor sin permiso
  Dado un actor sin autorización sobre la Observación
  Cuando intenta vincular evidencia
  Entonces se rechaza con OBS_ACCESO_DENEGADO
```

### OBS-UC-009 — Registrar seguimiento sanitario

- **Estado:** Propuesto
- **Actor:** Administrador o Capataz.
- **Objetivo:** Registrar la evolución posterior de un hallazgo sanitario.
- **Requerimientos:** `OBS-REQ-009`.
- **Reglas:** `OBS-BR-008`, `OBS-BR-013` a `OBS-BR-018`.

**Precondiciones**

- Existe una Observación sanitaria accesible para el actor.

**Flujo principal**

1. El actor informa fecha, evolución, severidad, certeza y evidencias disponibles.
2. El sistema verifica permiso y pertenencia.
3. El sistema valida `OBS-BR-015` a `OBS-BR-018`.
4. El sistema agrega el seguimiento al historial.

**Flujos alternativos**

- **A1 — Sin cambio:** se conserva que la condición continúa sin modificar el hallazgo original.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza sin cambios | `OBS_ACCESO_DENEGADO` |
| Seguimiento intenta sobrescribir el original | 3 | Se rechaza sin cambios | `OBS_SEGUIMIENTO_SANITARIO_INVALIDO` |

**Postcondiciones**

- El nuevo seguimiento y el hallazgo original permanecen consultables.

**Escenarios de aceptación**

```gherkin
@OBS-UC-009 @AC-01
Escenario: Agregar evolución sanitaria
  Dado una Observación sanitaria registrada
  Cuando un actor autorizado informa un nuevo seguimiento
  Entonces el seguimiento se agrega sin modificar el hallazgo original

@OBS-UC-009 @AC-02
Escenario: Sobrescribir el hallazgo inicial
  Dado una Observación sanitaria registrada
  Cuando el seguimiento intenta reemplazarla
  Entonces se rechaza con OBS_SEGUIMIENTO_SANITARIO_INVALIDO

@OBS-UC-009 @AC-03
Escenario: Actor sin permiso
  Dado un actor sin autorización
  Cuando intenta agregar seguimiento
  Entonces se rechaza con OBS_ACCESO_DENEGADO
```

### OBS-UC-010 — Consultar Observaciones

- **Estado:** Propuesto
- **Actor:** Administrador o Capataz; CUL, TER, ARC y LAB como sistemas participantes.
- **Objetivo:** Consultar hallazgos y su historia dentro del contexto autorizado.
- **Requerimientos:** `OBS-REQ-010`.
- **Reglas:** `OBS-BR-006` a `OBS-BR-024`.

**Precondiciones**

- El actor opera dentro de una Empresa vigente.

**Flujo principal**

1. El actor solicita Observaciones con los filtros disponibles.
2. El sistema verifica permiso y alcance.
3. El sistema presenta los hallazgos con contexto, evidencia, seguimientos, correcciones y Órdenes relacionadas.

**Flujos alternativos**

- **A1 — Sin resultados:** se devuelve una colección vacía.
- **A2 — Elemento histórico inactivo:** se muestra con su identidad conservada.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza | `OBS_ACCESO_DENEGADO` |
| Referencia de otra Empresa | 2 | Se rechaza | `OBS_EMPRESA_INCONSISTENTE` |

**Postcondiciones**

- La consulta no modifica ningún hecho.

**Escenarios de aceptación**

```gherkin
@OBS-UC-010 @AC-01
Escenario: Consultar Observaciones por urgencia
  Dado varias Observaciones de la Empresa
  Cuando un actor autorizado filtra por urgencia ALTA
  Entonces recibe solamente los hallazgos visibles que coinciden

@OBS-UC-010 @AC-02
Escenario: Consultar referencias de otra Empresa
  Dado una referencia ajena
  Cuando se utiliza como filtro
  Entonces se rechaza con OBS_EMPRESA_INCONSISTENTE

@OBS-UC-010 @AC-03
Escenario: Actor sin permiso
  Dado un actor sin alcance autorizado
  Cuando intenta consultar Observaciones
  Entonces se rechaza con OBS_ACCESO_DENEGADO
```

### OBS-UC-011 — Corregir o anular una Observación

- **Estado:** Propuesto
- **Actor:** Administrador.
- **Objetivo:** Rectificar un hallazgo conservando su historia.
- **Requerimientos:** `OBS-REQ-011`.
- **Reglas:** `OBS-BR-008`, `OBS-BR-019`, `OBS-BR-024`.

**Precondiciones**

- Existe una Observación de la Empresa.

**Flujo principal**

1. El Administrador selecciona la Observación e informa corrección o anulación y motivo.
2. El sistema verifica permiso y pertenencia.
3. El sistema valida la transición y la trazabilidad.
4. El sistema conserva el contenido anterior y registra el cambio.

**Flujos alternativos**

- **A1 — Borrador:** su editabilidad se resuelve con `OBS-Q-017`.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza sin cambios | `OBS_ACCESO_DENEGADO` |
| Transición inválida | 3 | Se rechaza sin cambios | `OBS_TRANSICION_INVALIDA` |
| Pérdida de la versión anterior | 3 | Se rechaza sin cambios | `OBS_CORRECCION_INVALIDA` |

**Postcondiciones**

- La versión anterior, el motivo y el actor permanecen trazables.

**Escenarios de aceptación**

```gherkin
@OBS-UC-011 @AC-01
Escenario: Corregir una Observación registrada
  Dado una Observación con un dato incorrecto
  Cuando el Administrador corrige e informa el motivo
  Entonces ambas versiones permanecen consultables

@OBS-UC-011 @AC-02
Escenario: Eliminar la versión anterior
  Dado una Observación registrada
  Cuando la corrección intenta reemplazarla sin historial
  Entonces se rechaza con OBS_CORRECCION_INVALIDA

@OBS-UC-011 @AC-03
Escenario: Capataz sin permiso de corrección
  Dado un Capataz autenticado
  Cuando intenta corregir una Observación registrada
  Entonces se rechaza con OBS_ACCESO_DENEGADO
```

### OBS-UC-012 — Generar una Orden de Labor

- **Estado:** Propuesto
- **Actor:** Administrador o Capataz; LAB como sistema participante.
- **Objetivo:** Convertir un hallazgo en trabajo pendiente sin duplicar la Orden dentro de OBS.
- **Requerimientos:** `OBS-REQ-012`.
- **Reglas:** `OBS-BR-008`, `OBS-BR-019` a `OBS-BR-023`.

**Precondiciones**

- Existe una Observación operable dentro del alcance del actor.

**Flujo principal**

1. El actor solicita generar una Orden desde la Observación y elige el Tipo de Labor.
2. El sistema verifica permiso y pertenencia.
3. OBS propone a LAB origen, prioridad, contexto, ubicación y descripción disponibles.
4. LAB valida y crea la Orden con sus propias reglas.
5. OBS permite consultar la Orden relacionada sin copiarla.

**Flujos alternativos**

- **A1 — Varias acciones:** el actor repite el caso de uso y crea otra Orden para la misma Observación.
- **A2 — Sin Campaña:** LAB aplica la ampliación aprobada en `OBS-Q-008` para una Orden operativa.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza sin cambios | `OBS_ACCESO_DENEGADO` |
| Contexto de otra Empresa | 2 | Se rechaza sin cambios | `OBS_EMPRESA_INCONSISTENTE` |
| LAB rechaza los datos de la Orden | 4 | No se crea vínculo ni Orden | `OBS_ORDEN_LABOR_INVALIDA` |

**Postcondiciones**

- LAB conserva la Orden con una única Observación de origen.

**Escenarios de aceptación**

```gherkin
@OBS-UC-012 @AC-01
Escenario: Generar una Orden urgente desde un hallazgo
  Dado una Observación con urgencia ALTA
  Cuando un actor autorizado solicita una Orden válida
  Entonces LAB crea la Orden con prioridad ALTA y origen en la Observación

@OBS-UC-012 @AC-02
Escenario: LAB rechaza el contexto requerido
  Dado una Observación sin los datos exigidos por el Tipo de Labor
  Cuando se solicita crear la Orden
  Entonces se rechaza con OBS_ORDEN_LABOR_INVALIDA

@OBS-UC-012 @AC-03
Escenario: Actor sin permiso
  Dado un actor sin autorización sobre la Observación
  Cuando intenta generar una Orden
  Entonces se rechaza con OBS_ACCESO_DENEGADO
```

### OBS-UC-013 — Resolver una Observación

- **Estado:** Propuesto
- **Actor:** Administrador o Capataz; LAB como sistema participante.
- **Objetivo:** Confirmar que el hallazgo dejó de requerir atención.
- **Requerimientos:** `OBS-REQ-013`.
- **Reglas:** `OBS-BR-019`, `OBS-BR-022`, `OBS-BR-024`.

**Precondiciones**

- Existe una Observación no resuelta dentro del alcance del actor.

**Flujo principal**

1. El actor solicita resolver la Observación e informa la confirmación correspondiente.
2. El sistema verifica permiso y estado.
3. El sistema muestra las Órdenes relacionadas y su estado sin inferir el cierre.
4. El actor confirma la resolución.
5. El sistema aplica la transición definida por `OBS-BR-019`.

**Flujos alternativos**

- **A1 — Persistencia del problema:** el actor no confirma y la Observación permanece sin resolver.
- **A2 — Sin Órdenes:** puede resolverse si el actor confirma que no requiere trabajo pendiente.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza sin cambios | `OBS_ACCESO_DENEGADO` |
| Transición inválida | 2 | Se rechaza sin cambios | `OBS_TRANSICION_INVALIDA` |
| LAB intenta cerrar sin confirmación | 4 | Se conserva el estado | `OBS_CIERRE_NO_CONFIRMADO` |

**Postcondiciones**

- La resolución queda confirmada y trazable o el estado permanece sin cambios.

**Escenarios de aceptación**

```gherkin
@OBS-UC-013 @AC-01
Escenario: Confirmar resolución después de una Orden
  Dado una Observación con una Orden completada
  Cuando un actor autorizado confirma que el hallazgo terminó
  Entonces la Observación queda resuelta

@OBS-UC-013 @AC-02
Escenario: Intentar cierre automático
  Dado una Orden completada
  Cuando LAB informa su finalización sin confirmación del actor
  Entonces se rechaza con OBS_CIERRE_NO_CONFIRMADO

@OBS-UC-013 @AC-03
Escenario: Actor sin permiso
  Dado un actor sin autorización sobre la Observación
  Cuando intenta resolverla
  Entonces se rechaza con OBS_ACCESO_DENEGADO
```
