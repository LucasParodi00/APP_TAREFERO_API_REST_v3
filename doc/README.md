# Desarrollo dirigido por especificaciones con agentes de IA

Se instala como `doc/README.md`. Explica cómo se organiza la documentación del proyecto, qué contiene cada archivo y cómo trabajan los agentes desde el texto del ingeniero hasta el código verificado.

## 1. Idea central

El ingeniero define **qué** se construye y **toma las decisiones**. Los agentes traducen, preguntan, planifican, implementan y verifican, siempre con origen trazable.

```text
 Ingeniero               Agente analista              Ingeniero          Agente planificador     Agentes
 épica + brief  ──►      especificación + preguntas ──► responde y  ──►   plan (+ ADR si hace ──► implementan
                         + tareas del módulo            aprueba           falta)                  y verifican
                                                                                                      │
 doc/task.md  ◄────────────── el avance de la épica se actualiza al completarse cada tarea ◄──────────┘
```

## 2. Distribución de carpetas

```text
proyecto/
├── AGENTS.md                         # Enrutador para agentes (corto, siempre se lee)
├── CLAUDE.md                         # Solo "@AGENTS.md" si se usa Claude Code
├── doc/
│   ├── README.md                     # Este documento
│   ├── task.md                       # Épicas del proyecto y su avance
│   ├── glosario.md                   # Roles (con sinónimos) y términos del dominio
│   ├── nomenclatura.md               # Idioma y cómo se nombra todo
│   ├── arquitectura.md               # Stack, módulos, capas hexagonales, especificación → código
│   ├── convenciones.md               # API, errores, datos, persistencia, comandos de calidad
│   ├── adr/                          # Decisiones que afectan a varios módulos o a todo el sistema
│   │   └── ADR-0001-[slug].md
│   ├── proceso/                      # Reglas de documentación y qué hace el agente en cada fase
│   │   ├── reglas-documentacion.md
│   │   ├── 00-fundacion.md
│   │   ├── 01-especificar-modulo.md
│   │   ├── 02-planificar.md
│   │   ├── 03-implementar.md
│   │   └── 04-verificar.md
│   ├── plantillas/
│   └── modulos/
│       └── lotes/
│           ├── README.md                     # Descriptivo, NO normativo
│           ├── lotes.brief.md                # Texto del ingeniero
│           ├── lotes.preguntas.md
│           ├── lotes.requerimientos.md       # Reglas de negocio y requerimientos
│           ├── lotes.use-case.md             # Actores, permisos, casos de uso
│           ├── lotes.modelo-datos.md         # Entidades y relaciones
│           ├── lotes.task.md                 # Tareas del módulo, vinculadas a épicas
│           ├── contratos/openapi.yaml
│           ├── adr/ADR-LOT-0001-[slug].md    # Decisiones solo de este módulo
│           └── planes/PLAN-LOT-0001-[slug].md
├── src/
│   └── modulos/
│       └── lotes/                    # dominio/ aplicacion/ infraestructura/ entrada/ publico/ pruebas/
├── migraciones/
│   └── lotes/
└── tools/
    ├── contexto.py
    ├── nuevo_modulo.py
    └── spec_lint.py
```

Cada módulo es autocontenido: otro analista (humano o agente) puede trabajarlo de forma independiente. Las carpetas `adr/` y `planes/` existen desde el inicio (con `.gitkeep` si están vacías). `contratos/` se crea en la primera planificación.

## 3. Reglas de documentación

Qué define cada archivo, qué tiene prohibido, el orden de autoridad, cómo se referencia lo ya definido, los identificadores y los estados están en **un solo lugar**: `doc/proceso/reglas-documentacion.md`. Este README no los repite.

Resumen en una línea: cada cosa se define en un único archivo; los demás la referencian por ID, aunque fueran a escribir lo mismo.

## 4. Cómo sabe el agente qué hacer

```text
AGENTS.md  ──►  identifica el pedido  ──►  lee reglas-documentacion.md + el procedimiento de la fase
(siempre)       (tabla "Qué leer")         (solo lo necesario para ese pedido)
```

| Archivo | Rol | Cuándo se lee |
|---|---|---|
| `AGENTS.md` | Enrutador: qué fase y rol según el pedido + reglas innegociables | Siempre (lo cargan las herramientas automáticamente) |
| `doc/proceso/reglas-documentacion.md` | Qué va en cada archivo y cómo se relacionan | Al escribir o revisar documentación |
| `doc/proceso/NN-<fase>.md` | Rol, qué leer, dónde escribir, prohibiciones y pasos de una fase | Solo el de la fase activa |
| `doc/plantillas/` | Estructura de cada archivo | Las copia `tools/nuevo_modulo.py` |

Para un módulo nuevo, el agente ejecuta `python tools/nuevo_modulo.py <nombre> <PREFIJO> "<Nombre>" <EPIC-NNN>`, que copia todas las plantillas con nombres y prefijos correctos, y después sigue la fase 1.

## 5. Épicas y tareas

| Nivel | Dónde | Quién lo crea | Qué es |
|---|---|---|---|
| Épica `EPIC-001` | `doc/task.md` | Ingeniero | Resultado de negocio grande: "Gestión de lotes operativa" |
| Tarea `LOT-TASK-002` | `doc/modulos/lotes/lotes.task.md` | Agente analista (lo aprueba el ingeniero) | Unidad de trabajo de un módulo, vinculada a una épica |
| Plan `PLAN-LOT-0001` | `doc/modulos/lotes/planes/` | Agente planificador | Cómo se implementa una tarea y qué pasó |
| Pasos `T01`, `T02` | Dentro del plan | Agente planificador | Pasos técnicos del plan |

El plan declara su tarea y la tarea declara su épica. `doc/task.md` **no se edita a mano** en la sección de avance: `python tools/spec_lint.py doc --tareas` la regenera leyendo las tareas de todos los módulos.

Una épica puede abarcar varios módulos.

## 6. Fases y roles

Cada fase tiene un rol. El rol (perfil, prioridades, qué ejecuta) está al inicio de su procedimiento.

| Fase | Rol | Disparador | Procedimiento | Termina con |
|---|---|---|---|---|
| 0. Fundación | Arquitecto de software | Inicio del proyecto | `proceso/00-fundacion.md` | Archivos raíz aprobados |
| 1. Especificar módulo | Analista funcional | "Creemos el módulo Lotes" | `proceso/01-especificar-modulo.md` | Especificación aprobada y tareas propuestas |
| 2. Planificar | Arquitecto / líder técnico | "Implementemos LOT-TASK-002" | `proceso/02-planificar.md` | Plan aprobado |
| 3. Implementar | Desarrollador senior | "Ejecutá el plan PLAN-LOT-0001" | `proceso/03-implementar.md` | Plan en verificación |
| 4. Verificar | Revisor de código / QA senior (otra sesión) | "Verificá el plan PLAN-LOT-0001" | `proceso/04-verificar.md` | Tarea completada y épica actualizada |

¿Por qué la especificación la hace un analista y no un arquitecto? Porque la especificación describe el *qué*; un perfil técnico tiende a saltar al *cómo* (tablas, endpoints), y eso es justo lo que la fase 1 prohíbe. Las decisiones técnicas llegan en la fase 2.

## 7. Scripts (`tools/`)

Son programas en Python 3, sin dependencias. No usan IA y no se ejecutan solos: los ejecuta **el agente**, cuando el procedimiento lo indica, si la herramienta tiene acceso a la terminal (Claude Code, Codex, Cursor en modo agente). Si trabajás en un chat sin terminal o por API, los ejecutás vos. `spec_lint.py` además debería correr en el CI en cada cambio.

| Script | Qué hace | Quién lo ejecuta |
|---|---|---|
| `nuevo_modulo.py` | Crea la carpeta de un módulo desde las plantillas y registra su tarea de especificación | Agente, fase 1 paso 0 |
| `spec_lint.py` | Valida la documentación; con `--tareas` regenera el avance de las épicas; con `--index` muestra referencias y cobertura | Agente al terminar cada fase · CI |
| `contexto.py` | Junta en un solo texto lo que una fase necesita leer, según la sección "Leer" de su procedimiento | Vos, para herramientas que no leen el repositorio (chat web, API) |

Ejemplo con una API o un chat web:

```bash
python tools/contexto.py 1 --modulo lotes --pedido "Especificá el módulo a partir del brief" --salida contexto.md
```

y se pega o adjunta `contexto.md`. Como el modelo no puede escribir en el repositorio, sus resultados se copian a mano.

## 8. Validación automática

`python tools/spec_lint.py doc` (en CI) falla si:

- Un ID está duplicado o se referencia un ID inexistente.
- Una regla o requerimiento no tiene origen, o cita un párrafo inexistente del brief.
- Un ítem `Aprobado` tiene marcadores `[[Q:...]]` o preguntas bloqueantes abiertas.
- Un README de módulo define IDs.
- Un actor de caso de uso no es un rol del glosario.
- Una tarea no tiene épica, o los estados de tarea, plan y épica no son coherentes.

Y avisa cuando el enunciado de una regla aparece copiado en otro archivo (redefinición).

`--index` muestra quién referencia cada ID y la cobertura del brief. `--tareas` regenera el avance de `doc/task.md`.

## 9. Cómo empezar

1. **Fase 0 — Fundación.** Pedirle a un agente: «Fase 0: completemos la fundación del proyecto», junto con una descripción general del sistema. El agente crea desde `doc/plantillas/`:
   - `doc/glosario.md`, `doc/nomenclatura.md`, `doc/arquitectura.md`, `doc/convenciones.md` y `doc/task.md`;
   - las decisiones de stack como ADR en `doc/adr/`;
   - completa la sección "Proyecto" de `AGENTS.md`.

   El ingeniero responde las preguntas y aprueba.
2. **Épicas.** El ingeniero carga las épicas en `doc/task.md`.
3. **Primer módulo.** Registrar el prefijo en `doc/arquitectura.md`, escribir el brief y pedir: «Creemos el módulo X» indicando la épica. El agente ejecuta `tools/nuevo_modulo.py` y sigue la fase 1.
4. **Implementación.** «Implementemos PRE-TASK-NNN» → plan → aprobación → «Ejecutá el plan» → «Verificá el plan» en otra sesión.
5. **CI.** Ejecutar `python tools/spec_lint.py doc` en cada cambio.

## 10. Contenido de esta guía

| Ruta | Qué es |
|---|---|
| `AGENTS.md` | Enrutador para agentes. Completar la sección "Proyecto" en la fase 0 |
| `CLAUDE.md` | Importa `AGENTS.md` para Claude Code |
| `doc/README.md` | Este documento |
| `doc/proceso/reglas-documentacion.md` | Qué define cada archivo, autoridad, referencias, IDs, estados |
| `doc/proceso/00` a `04` | Rol y procedimiento de cada fase |
| `doc/plantillas/` | Plantillas de los archivos raíz, de cada módulo, de planes y de ADR |
| `tools/nuevo_modulo.py` | Crea la carpeta de un módulo a partir de las plantillas |
| `tools/spec_lint.py` | Valida la documentación y regenera el avance de las épicas |
| `tools/contexto.py` | Arma el contexto de una fase para herramientas sin acceso al repositorio |

Los archivos raíz (`glosario`, `nomenclatura`, `arquitectura`, `convenciones`, `task`) y la carpeta `doc/adr/` no vienen creados: se generan en la fase 0 a partir de las plantillas, con las decisiones reales del proyecto.
