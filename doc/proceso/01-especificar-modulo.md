# Fase 1 — Especificar un módulo a partir del brief

**Termina con:** especificación aprobada por el ingeniero y tareas propuestas

## Rol: Analista funcional

- **Perfil:** analista funcional / ingeniero de requerimientos senior. Piensa en el negocio, no en la tecnología.
- **Prioridades:** (1) fidelidad al brief; (2) detectar ambigüedades y huecos; (3) completitud. Ante la duda, prefiere una pregunta a una suposición.
- **Ejecuta:** `tools/nuevo_modulo.py` y `tools/spec_lint.py`. No ejecuta código del proyecto.
- **Lo que no hace:** sección Prohibido.

## Objetivo

Traducir el brief del ingeniero a reglas, requerimientos, casos de uso y modelo de datos, **sin agregar nada que el ingeniero no haya dicho** y preguntando todo lo que sea ambiguo.

## Leer

- `AGENTS.md`
- `doc/proceso/reglas-documentacion.md`
- `doc/glosario.md`
- `doc/nomenclatura.md`
- `doc/convenciones.md` — solo §1 tipos
- `doc/task.md` — solo la épica del módulo
- `<m>.brief.md`
- `<m>.preguntas.md`
- `<m>.requerimientos.md`
- `<m>.use-case.md`
- `<m>.modelo-datos.md`
- `<m>.task.md`

Además: si el brief menciona otros módulos, solo sus dependencias (`DEP`) y entidades (`ENT`).

## Escribir

- `<m>.brief.md` — solo numerar párrafos
- `<m>.preguntas.md` · `<m>.requerimientos.md` · `<m>.use-case.md` · `<m>.modelo-datos.md`
- `<m>.task.md` — tareas del módulo
- `README.md` del módulo — último paso
- `doc/glosario.md` — términos nuevos, solo con aprobación del ingeniero

## Prohibido

- Reescribir el brief.
- Elegir en silencio entre dos interpretaciones.
- Escribir endpoints, DTOs, tablas SQL, clases o pantallas.
- Marcar como `Aprobado` cualquier ítem: eso lo hace el ingeniero.
- Inventar reglas, datos o permisos que no salgan del brief o de una respuesta.
- Editar `src/` o `migraciones/`.

---

## Paso 0 — Crear la carpeta del módulo (solo si no existe)

1. Verificar que el prefijo esté registrado en `doc/arquitectura.md` §Módulos. Si no lo está, pedir al ingeniero que lo confirme y registrarlo.
2. Confirmar con el ingeniero a qué épica pertenece el módulo. Si no existe, pedirle que la cree en `doc/task.md`.
3. Ejecutar `python tools/nuevo_modulo.py <nombre> <PREFIJO> "<Nombre>" <EPIC-NNN>`. Copia todas las plantillas con los nombres y prefijos correctos y registra la tarea de especificación del módulo. No crear los archivos a mano.
4. Si el ingeniero entregó el brief en el chat, copiarlo textual en `<m>.brief.md`.

## Paso 1 — Numerar el brief

Un párrafo por idea: `B-01`, `B-02`… Sin cambiar el texto. Si un párrafo mezcla ideas, proponer al ingeniero dividirlo.

## Paso 2 — Normalizar términos

Antes de clasificar, traducir cada palabra de negocio al término canónico de `glosario.md`:

- Si es sinónimo aceptado ("admin" → Administrador), usar el canónico en toda la especificación.
- Si no está en el glosario, o está en §3 "Palabras que siempre requieren pregunta", abrir una pregunta.
- Los actores de los casos de uso solo pueden ser roles del glosario §1.

## Paso 3 — Clasificar cada frase

Cada frase del brief produce uno o más ítems según su forma:

| Si el brief dice… | Es |
|---|---|
| "Un X tiene A, B, C" | Atributos de la entidad X |
| "Un X pertenece a / tiene varios Y" | Relación entre entidades |
| "Un X siempre debe… / nunca puede… / no puede tener…" | `BR` Invariante |
| "No se puede hacer Z si…" / "Para hacer Z tiene que…" | `BR` Validación |
| "Se calcula como… / es la suma de…" | `BR` Cálculo |
| "Pasa de A a B cuando…" / "Una vez cerrado no se puede…" | `BR` Transición + estados de la entidad |
| "Solo el encargado puede…" (depende de los datos, no del rol) | `BR` Autorización de dominio + "Cond." en la matriz |
| "Como ROL debo poder VERBO" | `REQ` + `UC` + fila de la matriz de permisos |
| "Cuando pasa E, el sistema…" | `REQ` de evento |
| "Necesita / usa datos del módulo M" | `DEP` + atributo de referencia |
| "Esto no lo hace el módulo" | Fuera de alcance |
| Un término de negocio no definido | Pregunta o término nuevo del glosario |

En qué archivo se escribe cada tipo de ítem: `reglas-documentacion.md` §4. Cómo se referencia lo ya definido: §5.

## Paso 4 — Detectar lo que falta o es ambiguo

Abrir una pregunta, con interpretaciones posibles y recomendación, cuando aparezca:

- **Listas abiertas:** "etc.", "entre otros", "y demás".
- **Palabras sin significado único** en el dominio, o posibles errores de tipeo.
- **Unidades o formatos ausentes:** ¿metros o hectáreas? ¿entero o decimal?
- **Catálogos sin valores:** "tipo de suelo", "tipo de animal" sin lista.
- **Reglas sin consecuencia:** "nunca puede" sin decir qué pasa si se intenta.
- **Acciones sin actor**, o actores sin acciones.
- **Ciclo de vida incompleto:** se dice cómo se crea algo, pero no si se modifica, se da de baja o se consulta.
- **Datos que pertenecen a otro módulo:** ¿quién es dueño? ¿quién aplica la regla?
- **Contradicciones** entre párrafos.

Marcar `[[Q:PRE-Q-NNN]]` en el ítem afectado. Si la pregunta impide definir el ítem, la pregunta es bloqueante.

## Paso 5 — Redactar, en este orden

Antes de escribir cada ítem, buscar si ya existe en el módulo, en otro módulo o en un archivo raíz. Si existe, se referencia; no se redefine.

1. **Reglas (BR):** una regla atómica por ficha. Tabla de ejemplos con caso válido, límite e inválido. Código de error si se rechaza algo.
2. **Requerimientos (REQ):** formato EARS, referenciando las BR que aplica. Sin pasos.
3. **Dependencias (DEP)** y **fuera de alcance**.
4. **Casos de uso (UC):** un objetivo del actor por UC. Flujo en lenguaje de negocio, excepciones con código, escenarios Gherkin. Mínimo: éxito, uno por regla que puede fallar, uno de permiso denegado.
5. **Matriz de permisos:** después de tener todos los UC.
6. **Modelo de datos:** entidades, atributos con origen, relaciones, estados, referencias a otros módulos.

## Paso 6 — Propuestas del agente

Revisar si faltan cosas habituales y **proponerlas** con origen `IA` y estado `Propuesto`, junto con una pregunta del tipo "¿Aprobás esta propuesta?":

- Operaciones del ciclo de vida no mencionadas (consultar, modificar, dar de baja).
- Validaciones obvias de rango (medidas mayores que cero).
- Unicidad (¿dos lotes pueden llamarse igual?).
- Qué pasa con los registros asociados al dar de baja.

Nunca más de lo necesario: cada propuesta es trabajo de revisión para el ingeniero.

## Paso 7 — Verificar y generar el README

1. Ejecutar `python tools/spec_lint.py doc`. Corregir errores.
2. Comprobar con `--index` que cada párrafo del brief generó al menos un ítem, que cada REQ tiene un UC y que cada BR se usa.
3. Generar `README.md` del módulo resumiendo, sin agregar nada.

## Informe al ingeniero

1. **Cobertura:** tabla párrafo del brief → IDs generados.
2. **Preguntas bloqueantes**, con interpretaciones y recomendación.
3. **Propuestas `IA`** que necesitan un sí o un no.
4. **Preguntas no bloqueantes.**

## Aprobación

Cuando el ingeniero responde, el agente actualiza los ítems (origen: la pregunta respondida) y, con su confirmación explícita, pasa a `Aprobado` los ítems sin marcadores pendientes. Un ítem con `[[Q:...]]` abierto no puede aprobarse.

## Paso 8 — Proponer tareas

Al entregar la especificación, proponer en `<m>.task.md` las tareas de implementación:

- Una tarea por grupo de casos de uso que entrega valor por sí solo (por ejemplo: registro y modificación de lotes; registro de tareas).
- Cada tarea indica su épica (la que el ingeniero indicó para el módulo), alcance por IDs, dependencias y bloqueos.
- Estado `Lista` si todo su alcance está `Aprobado`; `Bloqueada` con el ID de la pregunta si no.
- La tarea de especificación del módulo pasa a `Completada` cuando el ingeniero aprueba la especificación.
- Ejecutar `python tools/spec_lint.py doc --tareas` para actualizar el avance en `doc/task.md`.
