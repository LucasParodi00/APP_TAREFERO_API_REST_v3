# Reglas de documentación

> Documento normativo. Es la **única** fuente de: qué define cada archivo, el orden de autoridad, la dirección de las referencias, los identificadores y los estados. `AGENTS.md`, `doc/README.md` y los procedimientos de cada fase remiten aquí; no repiten estas reglas.

## 1. Principio: una cosa se define una sola vez

Cada dato del proyecto (una regla, un permiso, un atributo, un término, una convención) tiene **un único archivo dueño**. Los demás archivos lo **referencian por ID o por nombre**, nunca lo vuelven a escribir, **aunque lo escriban igual**.

Motivo: dos textos iguales hoy son dos textos distintos mañana, cuando alguien actualiza uno solo. Una referencia no puede desactualizarse.

## 2. Orden de autoridad

Si dos archivos no coinciden, manda el de arriba. Un archivo de abajo nunca contradice ni amplía a uno de arriba; si lo necesita, el agente se detiene y pregunta.

| Nivel | Archivos | Decide |
|---|---|---|
| 1 | `<m>.brief.md` · respuestas en `<m>.preguntas.md` | Intención del ingeniero |
| 2 | `glosario.md` · `nomenclatura.md` · `arquitectura.md` · `convenciones.md` · ADR `Aceptado` | Lenguaje, nombres y restricciones técnicas |
| 3 | `<m>.requerimientos.md` | Reglas y obligaciones |
| 4 | `<m>.use-case.md` | Actores, permisos y flujos |
| 5 | `<m>.modelo-datos.md` · `contratos/` | Estructura de datos y forma de la API |
| 6 | `task.md` · `<m>.task.md` · `planes/` | Trabajo y entregas |
| 7 | Código, migraciones, pruebas | Implementación |
| — | `README.md` de cada módulo | **Nada.** Es descriptivo |

El nivel 2 restringe la *forma* (cómo se nombra, qué tecnología, qué formato); el nivel 1 decide el *contenido* del negocio. Si un brief pide algo que contradice un archivo de nivel 2, se pregunta al ingeniero.

## 3. Responsabilidad de cada archivo

### Raíz de `doc/`

| Archivo | Define (es dueño) | Prohibido |
|---|---|---|
| `glosario.md` | Roles (nombre canónico, sinónimos, nombre en código); términos del dominio; palabras ambiguas | Reglas de negocio, permisos |
| `nomenclatura.md` | Idioma por ámbito; regla de nombre de cada elemento; traducción de términos técnicos | Términos del dominio (están en el glosario) |
| `arquitectura.md` | Stack; registro de módulos y prefijos; reglas entre módulos; capas; ubicación de cada elemento en el código | Convenciones de API o datos |
| `convenciones.md` | Tipos de datos; API; formato de errores; eventos; persistencia; protección de datos; NFR globales; comandos de calidad | Roles, nombres, módulos |
| `task.md` | Épicas: objetivo, prioridad, estado, condición de cierre | Tareas y su estado (se generan) |
| `adr/` | Decisiones transversales y su porqué | — |

### Carpeta de cada módulo

| Archivo | Define (es dueño) | Referencia | Prohibido |
|---|---|---|---|
| `brief` | Párrafos `B-NN` | — | Que el agente lo reescriba |
| `preguntas` | Preguntas `Q`, interpretaciones, respuestas | Párrafos e ítems afectados | Decisiones técnicas grandes (van a ADR) |
| `requerimientos` | Reglas `BR` (enunciado, tipo, ejemplos, código de error); requerimientos `REQ`; no funcionales `NFR`; dependencias `DEP`; fuera de alcance | `B-NN`, `Q` | Pasos de flujo, permisos por rol, atributos, campos de API, tablas |
| `use-case` | Actores del módulo; **matriz de permisos**; casos de uso `UC` (flujo, alternativas, excepciones); escenarios Gherkin | `REQ`, `BR`, roles del glosario | Enunciado de reglas, atributos, campos, pantallas |
| `modelo-datos` | Entidades `ENT`; atributos y tipos; relaciones; estados y transiciones; índices necesarios | `BR` (en restricciones), `UC` (en transiciones), `DEP` | Enunciado de reglas, DTOs, DDL completo |
| `contratos/openapi.yaml` | Rutas, campos, obligatoriedad, códigos HTTP | `UC` (`x-use-case`), `BR` (`x-business-rules`) | Reglas de negocio en descripciones |
| `contratos/README.md` | Semántica que OpenAPI no puede expresar | `UC`, `DEP` | Copia de campos o rutas |
| `task` | Tareas `TASK`: tipo, estado, alcance, dependencias, bloqueos | `EPIC`, `UC`, `PLAN`, `Q` | Especificación |
| `planes/` | Alcance de la entrega, decisiones locales, pasos técnicos, verificación, registro, evidencia | `TASK`, `UC`, `BR`, `ENT` | Reglas o requerimientos nuevos |
| `adr/` | Decisiones del módulo y su porqué | Ítems que la originan | — |
| `README.md` | Nada | Cualquier ID, solo para enlazar | Definir IDs, reglas, permisos o datos |

## 4. Dónde va cada cosa

| Si hay que escribir… | Va en | Como |
|---|---|---|
| Qué significa una palabra | `glosario.md` | Término |
| Que "admin" es lo mismo que Administrador | `glosario.md` | Sinónimo del rol |
| Cómo se llama una tabla o una clase | `nomenclatura.md` | Regla por elemento |
| Un prefijo de módulo nuevo | `arquitectura.md` §módulos | Fila |
| El formato de los errores de la API | `convenciones.md` | Sección errores |
| "Un lote siempre debe tener encargado" | `requerimientos` | `BR` invariante |
| "El ancho debe ser mayor que cero" | `requerimientos` | `BR` validación |
| "El sistema debe permitir registrar lotes" | `requerimientos` | `REQ` |
| "Solo el administrador registra lotes" | `use-case` | Fila de la matriz de permisos |
| "Solo el encargado del lote puede…" (depende de los datos) | `requerimientos` + `use-case` | `BR` de autorización de dominio, y "Cond." en la matriz que la referencia |
| Pasos para registrar un lote | `use-case` | Flujo del `UC` |
| Qué pasa si falla una regla durante el flujo | `use-case` | Excepción del `UC` que referencia la `BR` y su código |
| Ejemplos de prueba de una regla | `requerimientos` | Tabla de ejemplos de la `BR` |
| Ejemplos de prueba de un flujo | `use-case` | Escenarios Gherkin |
| Que un lote tiene ancho y largo | `modelo-datos` | Atributos de la `ENT` |
| Que un lote tiene muchos registros de tarea | `modelo-datos` | Relación |
| Que necesitamos los empleados del módulo Personal | `requerimientos` + `modelo-datos` | `DEP`, y atributo que la referencia |
| Ruta y campos de la API | `contratos/openapi.yaml` | Operación |
| Por qué se eligió una opción con alternativas | `adr/` | ADR |
| Un trabajo a realizar | `<m>.task.md` | `TASK` |
| Cómo se implementa una tarea | `planes/` | Plan |

## 5. Referenciar, no repetir

Cuando un archivo necesita algo que otro define, escribe la **referencia** y, como mucho, un **título corto** para orientar. Nunca el contenido.

| Archivo | Incorrecto (redefine) | Correcto (referencia) |
|---|---|---|
| `use-case` | "3. El sistema valida que el ancho sea mayor que cero." | "3. El sistema valida `LOT-BR-005`." |
| `use-case` | Excepción: "Ancho menor o igual a cero" | Excepción: "No se cumple `LOT-BR-005`" |
| `modelo-datos` | Restricción del ancho: "> 0" | Restricción del ancho: `LOT-BR-005` |
| `requerimientos` | `REQ` con "solo el administrador puede…" | El permiso va solo en la matriz de `use-case` |
| `requerimientos` | `REQ` con criterios de aceptación | Los escenarios están en el `UC` que lo realiza |
| `openapi.yaml` | `description: "El ancho debe ser positivo"` | `x-business-rules: [LOT-BR-005]` |
| `plan` | Copia de los escenarios a verificar | "Aceptación: `@LOT-UC-001`" |
| `README` del módulo | "Regla: el ancho debe ser mayor que cero" | "Reglas de medidas (`LOT-BR-005`)" |
| Cualquier archivo | "admin" | "Administrador" (término canónico) |

Excepción única: el título de un ítem puede citarse junto a su ID para que se lea fácil ("`LOT-BR-001` Encargado obligatorio").

`spec_lint` avisa cuando el enunciado de una regla aparece copiado en otro archivo.

## 6. Dirección de las referencias

Lo derivado apunta a su origen. El vínculo inverso no se escribe: lo genera `spec_lint --index`.

```text
BR, REQ, NFR, DEP → B-NN / Q          REQ → BR          UC → REQ, BR
ENT → BR, UC, DEP                     openapi → UC, BR
TASK → EPIC, UC                       PLAN → TASK
```

Ejemplos de lo que **no** se escribe: un `REQ` no lista sus `UC`; una `ENT` no lista sus `REQ`; una épica no lista sus tareas (su avance se genera).

Única excepción: el campo `Plan` de una tarea, que `spec_lint` verifica contra el campo `task` del plan.

## 7. Identificadores

| Elemento | Formato | Archivo |
|---|---|---|
| Épica | `EPIC-001` | `doc/task.md` |
| ADR transversal | `ADR-0001` | `doc/adr/` |
| Párrafo del brief | `B-01` (local al módulo) | brief |
| Pregunta | `PRE-Q-001` | preguntas |
| Regla / Requerimiento / No funcional / Dependencia | `PRE-BR-001` / `PRE-REQ-001` / `PRE-NFR-001` / `PRE-DEP-001` | requerimientos |
| Caso de uso / Escenario | `PRE-UC-001` / `@PRE-UC-001 @AC-01` | use-case |
| Entidad | `PRE-ENT-001` | modelo-datos |
| Tarea | `PRE-TASK-001` | task del módulo |
| Plan / ADR del módulo | `PLAN-PRE-0001` / `ADR-PRE-0001` | planes / adr del módulo |

`PRE` es el prefijo del módulo registrado en `arquitectura.md`. Los IDs no se reutilizan ni se renumeran; lo retirado conserva su ID con estado `Retirado`.

## 8. Origen obligatorio

Todo `BR`, `REQ`, `NFR`, `DEP`, atributo y actor indica su origen:

| Origen | Significa |
|---|---|
| `B-03` | Párrafo del brief |
| `PRE-Q-004` | Respuesta del ingeniero |
| `IA` | Propuesta del agente: requiere un sí explícito del ingeniero, ítem por ítem |

Un ítem sin origen no puede existir.

## 9. Estados

| Elemento | Estados |
|---|---|
| Épica | `Propuesta` → `En curso` → `Completada` · `Cancelada` |
| Tarea | `Pendiente` → `Lista` → `Planificada` → `En curso` → `Completada` · `Bloqueada` · `Cancelada` |
| Ítems de especificación | `Propuesto` → `Aprobado` → `Implementado` · `Obsoleto` · `Retirado` |
| Pregunta | `Abierta` → `Respondida` · `Descartada` |
| Plan | `Borrador` → `En revisión` → `Aprobado` → `En ejecución` → `En verificación` → `Cerrado` · `Bloqueado` · `Cancelado` |
| ADR | `Propuesto` → `Aceptado` · `Rechazado` → `Reemplazado` |

Solo el ingeniero pasa algo a `Aprobado` o `Aceptado`, y solo el ingeniero completa o cancela una épica.

## 10. Cambios sobre lo aprobado

- `Propuesto`: se edita libremente.
- `Aprobado` o `Implementado`: cualquier cambio de significado se declara en la sección "Cambios de especificación" de un plan y necesita aprobación del ingeniero. Las correcciones de redacción sin cambio de significado se permiten.
- Nunca se borra un ítem: pasa a `Obsoleto` o `Retirado`.

## 11. Cuándo se crea un ADR

| Situación | Dónde |
|---|---|
| Costosa de revertir y afecta cómo se construye todo un módulo | `modulos/<m>/adr/ADR-PRE-NNNN` |
| Afecta a dos o más módulos | `doc/adr/ADR-NNNN` |
| Fija un estándar del sistema | `doc/adr/ADR-NNNN` y se refleja en el archivo raíz que corresponda |
| Local y reversible | Sección de decisiones del plan |

Prueba: si en seis meses alguien preguntaría "¿por qué está hecho así?" y el código no lo explica, es un ADR.

## 12. Conflictos

Cuando el agente encuentra dos fuentes que no coinciden:

1. No elige una en silencio.
2. Identifica cuál es la dueña según §3 y cuál manda según §2.
3. Si la diferencia está en un archivo que el agente puede corregir en su fase, corrige el que **no** es dueño para que referencie al dueño.
4. Si la diferencia está en el brief, en una respuesta o en un ítem `Aprobado`, abre una pregunta y se detiene.
