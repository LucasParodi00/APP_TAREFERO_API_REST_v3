---
type: use-cases
module: "CUL"
status: Aprobado
owner: "Analista"
---

# Contexto productivo — Casos de uso

## 1. Actores

| Actor | Tipo | Origen |
|---|---|---|
| SuperAdministrador | Rol | `CUL-Q-010`, `CUL-Q-015` |
| Administrador | Rol | `CUL-Q-002`, `CUL-Q-010` |
| Capataz | Rol | `CUL-Q-010` |
| Empleado | Rol | `CUL-Q-010` |
| LAB, OBS, COS, REP o TER | Sistema | `CUL-Q-004`, `CUL-Q-008`, `CUL-Q-021` |

## 2. Permisos

| Caso de uso | SuperAdministrador | Administrador | Capataz | Empleado | Condición |
|---|:---:|:---:|:---:|:---:|---|
| `CUL-UC-001` | Sí | No | No | No | Catálogo global |
| `CUL-UC-002` | Cond. | Sí | No | No | SuperAdministrador: Perfil base; Administrador: Empresa/Lote |
| `CUL-UC-003` | No | Sí | No | No | Empresa y Lote autorizados |
| `CUL-UC-004` | No | Sí | No | No | Implantación de su Empresa |
| `CUL-UC-005` | No | Sí | No | No | Campaña de su Empresa |
| `CUL-UC-006` | No | Sí | No | No | Campaña de su Empresa |
| `CUL-UC-007` | No | Sí | No | No | Campaña ACTIVA de su Empresa |
| `CUL-UC-008` | No | Sí | No | No | Ciclo de su Empresa |
| `CUL-UC-009` | No | Sí | No | No | Campaña de su Empresa |
| `CUL-UC-010` | No | Sí | Sí | No | Capataz: solo consulta autorizada |
| `CUL-UC-011` | No | No | No | No | Invocación del módulo dueño |

## 3. Casos de uso

### CUL-UC-001 — Administrar el catálogo productivo
- **Estado:** Aprobado
- **Actor:** SuperAdministrador.
- **Objetivo:** Crear, consultar o inactivar Cultivos y Variedades.
- **Requerimientos:** `CUL-REQ-001`.
- **Reglas:** `CUL-BR-001`, `CUL-BR-002`, `CUL-BR-022`.

**Precondiciones:** actor autenticado con contexto de plataforma.

**Flujo principal**
1. El actor solicita mantener un Cultivo o Variedad.
2. El sistema verifica el permiso.
3. El sistema valida las reglas aplicables.
4. El sistema conserva el cambio y su auditoría.
5. El sistema informa el resultado.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza | `CUL_ACCESO_DENEGADO` |
| No se cumple `CUL-BR-001` | 3 | Se rechaza | `CUL_CULTIVO_DUPLICADO` |
| No se cumple `CUL-BR-002` | 3 | Se rechaza | `CUL_VARIEDAD_INVALIDA` |
| No se cumple `CUL-BR-022` | 3 | Se rechaza | `CUL_REGISTRO_HISTORICO_EN_USO` |

**Postcondiciones:** catálogo actualizado sin perder referencias históricas.

```gherkin
@CUL-UC-001 @AC-01
Escenario: Crear un Cultivo global
  Dado un SuperAdministrador autorizado
  Cuando registra un Cultivo canónico no duplicado
  Entonces el Cultivo queda disponible en el catálogo global

@CUL-UC-001 @AC-02
Escenario: Rechazar un duplicado
  Dado un nombre normalizado ya utilizado
  Cuando intenta registrar el Cultivo
  Entonces se rechaza con CUL_CULTIVO_DUPLICADO

@CUL-UC-001 @AC-03
Escenario: Rechazar actor sin permiso
  Dado un Administrador
  Cuando intenta modificar el catálogo global
  Entonces se rechaza con CUL_ACCESO_DENEGADO
```

### CUL-UC-002 — Configurar un Perfil de cultivo
- **Estado:** Aprobado
- **Actor:** SuperAdministrador o Administrador.
- **Objetivo:** Mantener una versión de Perfil en el alcance autorizado.
- **Requerimientos:** `CUL-REQ-002`.
- **Reglas:** `CUL-BR-003` a `CUL-BR-006`, `CUL-BR-022`.

**Precondiciones:** Cultivo existente y actor autorizado para el alcance.

**Flujo principal**
1. El actor selecciona Cultivo, alcance y versión base.
2. El sistema verifica el permiso y `CUL-BR-003`.
3. El actor define campos tipados.
4. El sistema valida `CUL-BR-004` a `CUL-BR-006`.
5. El sistema guarda el BORRADOR o publica una versión nueva.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso para el alcance | 2 | Se rechaza | `CUL_ACCESO_DENEGADO` |
| Cultivo no habilitado | 2 | Se rechaza | `CUL_CULTIVO_NO_HABILITADO` |
| Campo o precedencia inválidos | 4 | Se rechaza | `CUL_CAMPO_PERFIL_INVALIDO` |
| Modificar versión publicada | 4 | Se rechaza | `CUL_VERSION_PERFIL_INMUTABLE` |

**Postcondiciones:** versión conservada sin alterar las anteriores.

```gherkin
@CUL-UC-002 @AC-01
Escenario: Publicar una especialización válida
  Dado un Administrador y un Cultivo habilitado
  Cuando publica un Perfil compatible para un Lote
  Entonces se conserva una nueva versión

@CUL-UC-002 @AC-02
Escenario: Rechazar código ejecutable
  Dado un campo con una fórmula libre
  Cuando intenta publicar el Perfil
  Entonces se rechaza con CUL_CAMPO_PERFIL_INVALIDO

@CUL-UC-002 @AC-03
Escenario: Rechazar cambio histórico
  Dado una versión PUBLICADA
  Cuando intenta modificarla
  Entonces se rechaza con CUL_VERSION_PERFIL_INMUTABLE
```

### CUL-UC-003 — Registrar una Implantación
- **Estado:** Aprobado
- **Actor:** Administrador.
- **Objetivo:** Registrar qué se cultiva en un Lote.
- **Requerimientos:** `CUL-REQ-003`, `CUL-REQ-012`.
- **Reglas:** `CUL-BR-003`, `CUL-BR-008`, `CUL-BR-009`.

**Precondiciones:** Empresa, Lote y Cultivo existentes.

**Flujo principal**
1. El actor informa Lote, Cultivo, fecha, superficie o sector y Variedad opcional.
2. El sistema verifica permiso y disponibilidad territorial.
3. El sistema valida las reglas de Implantación.
4. El sistema registra la Implantación ACTIVA.
5. El sistema informa el resultado.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza | `CUL_ACCESO_DENEGADO` |
| Lote inactivo o datos inválidos | 2-3 | Se rechaza | `CUL_IMPLANTACION_INVALIDA` |
| Superficie superpuesta o excedida | 3 | Se rechaza | `CUL_SUPERFICIE_IMPLANTADA_INVALIDA` |

**Postcondiciones:** Implantación ACTIVA vinculada al Lote.

```gherkin
@CUL-UC-003 @AC-01
Escenario: Registrar una Implantación válida
  Dado un Lote ACTIVO con superficie disponible
  Cuando el Administrador registra la Implantación
  Entonces queda ACTIVA en ese Lote

@CUL-UC-003 @AC-02
Escenario: Rechazar superficie superpuesta
  Dado un sector ya implantado
  Cuando registra otra Implantación sobre el mismo sector
  Entonces se rechaza con CUL_SUPERFICIE_IMPLANTADA_INVALIDA

@CUL-UC-003 @AC-03
Escenario: Rechazar actor sin permiso
  Dado un Capataz
  Cuando intenta registrar una Implantación
  Entonces se rechaza con CUL_ACCESO_DENEGADO
```

### CUL-UC-004 — Finalizar una Implantación
- **Estado:** Aprobado
- **Actor:** Administrador.
- **Objetivo:** Finalizar una Implantación preservando su historia.
- **Requerimientos:** `CUL-REQ-004`.
- **Reglas:** `CUL-BR-010`, `CUL-BR-022`.

**Flujo principal**
1. El actor selecciona una Implantación ACTIVA e informa la fecha final.
2. El sistema verifica permiso y `CUL-BR-010`.
3. El sistema la marca FINALIZADA sin borrar relaciones.
4. El sistema informa el resultado.

**Excepciones:** sin permiso: `CUL_ACCESO_DENEGADO`; transición inválida: `CUL_TRANSICION_IMPLANTACION_INVALIDA`.

**Postcondiciones:** Implantación FINALIZADA y consultable.

```gherkin
@CUL-UC-004 @AC-01
Escenario: Finalizar una Implantación activa
  Dado una Implantación ACTIVA
  Cuando el Administrador informa una fecha válida
  Entonces queda FINALIZADA y conserva su historia

@CUL-UC-004 @AC-02
Escenario: Rechazar fecha anterior
  Dado una fecha final anterior al inicio
  Cuando intenta finalizar
  Entonces se rechaza con CUL_TRANSICION_IMPLANTACION_INVALIDA

@CUL-UC-004 @AC-03
Escenario: Rechazar actor sin permiso
  Dado un Capataz
  Cuando intenta finalizar
  Entonces se rechaza con CUL_ACCESO_DENEGADO
```

### CUL-UC-005 — Preparar una Campaña
- **Estado:** Aprobado
- **Actor:** Administrador.
- **Objetivo:** Crear o modificar una Campaña en BORRADOR.
- **Requerimientos:** `CUL-REQ-005`.
- **Reglas:** `CUL-BR-007`, `CUL-BR-011`, `CUL-BR-013`, `CUL-BR-015`, `CUL-BR-020`, `CUL-BR-021`.

**Flujo principal**
1. El actor informa datos, fecha inicial, fecha tentativa de finalización y alcance territorial.
2. El sistema verifica permiso, Empresa y datos.
3. El actor agrega Ciclos, Implantaciones y Perfiles.
4. El sistema valida compatibilidad y ausencia de duplicados.
5. El sistema conserva la Campaña en BORRADOR.

**Excepciones:** sin permiso: `CUL_ACCESO_DENEGADO`; alcance inválido: `CUL_ALCANCE_CAMPANIA_INVALIDO`; datos inválidos: `CUL_CAMPANIA_INVALIDA`; Perfil o Ciclo inválido: `CUL_PERFIL_CICLO_INVALIDO`.

**Postcondiciones:** BORRADOR editable sin hechos operativos propios.

```gherkin
@CUL-UC-005 @AC-01
Escenario: Preparar una Campaña multicultivo
  Dado alcance y Ciclos válidos
  Cuando el Administrador guarda el BORRADOR
  Entonces la Campaña conserva sus Ciclos separados por Implantación

@CUL-UC-005 @AC-02
Escenario: Rechazar alcance de otra Empresa
  Dado un Lote de otra Empresa
  Cuando intenta incluirlo
  Entonces se rechaza con CUL_ALCANCE_CAMPANIA_INVALIDO

@CUL-UC-005 @AC-03
Escenario: Rechazar actor sin permiso
  Dado un Capataz
  Cuando intenta preparar una Campaña
  Entonces se rechaza con CUL_ACCESO_DENEGADO
```

### CUL-UC-006 — Activar una Campaña
- **Estado:** Aprobado
- **Actor:** Administrador.
- **Objetivo:** Iniciar una Campaña y sus Ciclos.
- **Requerimientos:** `CUL-REQ-006`.
- **Reglas:** `CUL-BR-007`, `CUL-BR-012`, `CUL-BR-014`, `CUL-BR-020`, `CUL-BR-021`.

**Flujo principal**
1. El actor solicita activar el BORRADOR.
2. El sistema verifica permiso, alcance, Implantaciones y Perfiles.
3. El sistema fija los Lotes incluidos, la fecha tentativa y las versiones de Perfil.
4. El sistema pasa Campaña y Ciclos a ACTIVA/ACTIVO.
5. El sistema registra la activación.

**Excepciones:** sin permiso: `CUL_ACCESO_DENEGADO`; Perfil inválido: `CUL_PERFIL_CICLO_INVALIDO`; transición inválida: `CUL_TRANSICION_CAMPANIA_INVALIDA`.

**Postcondiciones:** Campaña ACTIVA con alcance inicial auditable.

```gherkin
@CUL-UC-006 @AC-01
Escenario: Activar una Campaña válida
  Dado un BORRADOR completo
  Cuando el Administrador lo activa
  Entonces se fijan Lotes y Perfiles y los Ciclos quedan ACTIVOS

@CUL-UC-006 @AC-02
Escenario: Rechazar Ciclo sin Perfil
  Dado un Ciclo sin versión PUBLICADA
  Cuando intenta activar
  Entonces se rechaza con CUL_PERFIL_CICLO_INVALIDO

@CUL-UC-006 @AC-03
Escenario: Rechazar actor sin permiso
  Dado un Capataz
  Cuando intenta activar
  Entonces se rechaza con CUL_ACCESO_DENEGADO
```

### CUL-UC-007 — Ampliar una Campaña activa
- **Estado:** Aprobado
- **Actor:** Administrador.
- **Objetivo:** Incorporar explícitamente un Lote nuevo.
- **Requerimientos:** `CUL-REQ-007`.
- **Reglas:** `CUL-BR-012`, `CUL-BR-013`.

**Flujo principal**
1. El actor selecciona Campaña ACTIVA y Lote.
2. El sistema verifica permiso y pertenencia.
3. El actor configura Ciclos y Perfiles aplicables.
4. El sistema incorpora y audita el Lote.
5. El sistema informa el alcance actualizado.

**Excepciones:** sin permiso: `CUL_ACCESO_DENEGADO`; retiro o cambio inválido: `CUL_ALCANCE_ACTIVO_INMUTABLE`; Lote inválido: `CUL_LOTE_NO_INCLUIDO`.

**Postcondiciones:** alcance ampliado sin alterar la lista histórica anterior.

```gherkin
@CUL-UC-007 @AC-01
Escenario: Agregar un Lote posterior
  Dado un Lote nuevo de la Empresa
  Cuando el Administrador lo incorpora
  Entonces queda incluido y el cambio se audita

@CUL-UC-007 @AC-02
Escenario: Rechazar retiro de alcance activo
  Dado una Campaña ACTIVA
  Cuando intenta retirar un Lote
  Entonces se rechaza con CUL_ALCANCE_ACTIVO_INMUTABLE

@CUL-UC-007 @AC-03
Escenario: Rechazar actor sin permiso
  Dado un Capataz
  Cuando intenta ampliar
  Entonces se rechaza con CUL_ACCESO_DENEGADO
```

### CUL-UC-008 — Finalizar un Ciclo productivo
- **Estado:** Aprobado
- **Actor:** Administrador.
- **Objetivo:** Dar por terminado un Ciclo.
- **Requerimientos:** `CUL-REQ-008`.
- **Reglas:** `CUL-BR-021`.

**Flujo principal**
1. El actor selecciona un Ciclo ACTIVO.
2. El sistema verifica permiso y transición.
3. El sistema lo marca FINALIZADO conservando Perfil e historia.
4. El sistema informa el resultado.

**Excepciones:** sin permiso: `CUL_ACCESO_DENEGADO`; transición inválida: `CUL_TRANSICION_CICLO_INVALIDA`.

**Postcondiciones:** Ciclo FINALIZADO.

```gherkin
@CUL-UC-008 @AC-01
Escenario: Finalizar un Ciclo activo
  Dado un Ciclo ACTIVO
  Cuando el Administrador lo finaliza
  Entonces queda FINALIZADO

@CUL-UC-008 @AC-02
Escenario: Rechazar transición inválida
  Dado un Ciclo ya FINALIZADO
  Cuando intenta finalizarlo nuevamente
  Entonces se rechaza con CUL_TRANSICION_CICLO_INVALIDA

@CUL-UC-008 @AC-03
Escenario: Rechazar actor sin permiso
  Dado un Capataz
  Cuando intenta finalizar
  Entonces se rechaza con CUL_ACCESO_DENEGADO
```

### CUL-UC-009 — Cerrar o reabrir una Campaña
- **Estado:** Aprobado
- **Actor:** Administrador.
- **Objetivo:** Cerrar una Campaña o reabrirla excepcionalmente.
- **Requerimientos:** `CUL-REQ-009`.
- **Reglas:** `CUL-BR-014`, `CUL-BR-017`, `CUL-BR-018`, `CUL-BR-021`.

**Flujo principal**
1. El actor solicita cerrar una Campaña ACTIVA e informa la fecha real de finalización.
2. El sistema verifica permiso y que todos los Ciclos estén FINALIZADOS.
3. El sistema pasa la Campaña a CERRADA y audita.
4. Para reabrir, el actor solicita la excepción y el sistema vuelve a ACTIVA sin reactivar Ciclos.
5. El sistema informa el resultado.

**Excepciones:** sin permiso: `CUL_ACCESO_DENEGADO`; Ciclos activos: `CUL_CAMPANIA_CON_CICLOS_ACTIVOS`; transición inválida: `CUL_TRANSICION_CAMPANIA_INVALIDA`.

**Postcondiciones:** estado y fecha coherentes; los Ciclos conservan su estado.

```gherkin
@CUL-UC-009 @AC-01
Escenario: Cerrar con Ciclos finalizados
  Dado todos los Ciclos FINALIZADOS
  Cuando el Administrador cierra informando la fecha real
  Entonces la Campaña queda CERRADA y conserva las fechas tentativa y real

@CUL-UC-009 @AC-02
Escenario: Rechazar cierre prematuro
  Dado un Ciclo ACTIVO
  Cuando intenta cerrar
  Entonces se rechaza con CUL_CAMPANIA_CON_CICLOS_ACTIVOS

@CUL-UC-009 @AC-03
Escenario: Reabrir sin reactivar Ciclos
  Dado una Campaña CERRADA
  Cuando el Administrador la reabre
  Entonces queda ACTIVA y sus Ciclos continúan FINALIZADOS
```

### CUL-UC-010 — Consultar contexto productivo
- **Estado:** Aprobado
- **Actor:** Administrador o Capataz.
- **Objetivo:** Consultar contexto vigente o histórico.
- **Requerimientos:** `CUL-REQ-010`.
- **Reglas:** `CUL-BR-015`, `CUL-BR-016`, `CUL-BR-018`, `CUL-BR-022`.

**Flujo principal**
1. El actor solicita contexto con filtros autorizados.
2. El sistema verifica permiso y Empresa.
3. El sistema resuelve Campañas, Ciclos, Implantaciones y Perfiles.
4. El sistema informa datos vigentes o históricos sin mezclar Campañas.

**Excepciones:** sin permiso: `CUL_ACCESO_DENEGADO`; contexto inexistente: `CUL_CONTEXTO_NO_ENCONTRADO`.

**Postcondiciones:** ninguna modificación.

```gherkin
@CUL-UC-010 @AC-01
Escenario: Consultar una Campaña anterior
  Dado una Campaña CERRADA autorizada
  Cuando el actor consulta su contexto
  Entonces obtiene su historia sin datos de Campañas posteriores

@CUL-UC-010 @AC-02
Escenario: Nueva Campaña en cero
  Dado una Campaña nueva
  Cuando consulta sus indicadores
  Entonces no hereda hechos de la anterior

@CUL-UC-010 @AC-03
Escenario: Rechazar actor sin permiso
  Dado un Empleado sin capacidad directa de consulta
  Cuando consulta el contexto
  Entonces se rechaza con CUL_ACCESO_DENEGADO
```

### CUL-UC-011 — Resolver contexto para un módulo operativo
- **Estado:** Aprobado
- **Actor:** LAB, OBS, COS, REP o TER.
- **Objetivo:** Obtener o validar el contexto productivo correspondiente.
- **Requerimientos:** `CUL-REQ-011`, `CUL-REQ-012`.
- **Reglas:** `CUL-BR-008` a `CUL-BR-010`, `CUL-BR-016`, `CUL-BR-018`, `CUL-BR-019`.

**Flujo principal**
1. El módulo dueño informa Empresa, Lote y referencia productiva.
2. CUL valida vigencia territorial, Campaña, Ciclo, Implantación y Perfil.
3. CUL informa referencias y restricciones, sin copiar el hecho.
4. El módulo dueño conserva o proyecta su propio dato.

**Excepciones:** Lote inactivo: `TER_LOTE_INACTIVO`; Campaña cerrada: `CUL_CAMPANIA_CERRADA`; contexto incompatible: `CUL_CONTEXTO_INVALIDO`.

**Postcondiciones:** CUL no incorpora el hecho externo.

```gherkin
@CUL-UC-011 @AC-01
Escenario: Resolver contexto operativo válido
  Dado una Campaña ACTIVA y un Ciclo ACTIVO
  Cuando un módulo dueño solicita el contexto
  Entonces recibe Implantación, Perfil y referencias aplicables

@CUL-UC-011 @AC-02
Escenario: Rechazar hecho en Campaña cerrada
  Dado una Campaña CERRADA
  Cuando un módulo intenta registrar un hecho nuevo
  Entonces se rechaza con CUL_CAMPANIA_CERRADA

@CUL-UC-011 @AC-03
Escenario: No copiar el hecho externo
  Dado una Cosecha válida
  Cuando COS la registra con el contexto resuelto
  Entonces CUL conserva solo sus referencias y COS conserva la Cosecha
```
