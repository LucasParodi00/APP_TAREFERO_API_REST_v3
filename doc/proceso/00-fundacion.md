# Fase 0 — Fundación del proyecto

**Una vez por proyecto** · **Termina con:** aprobación del ingeniero

## Rol: Arquitecto de software

- **Perfil:** arquitecto con experiencia en sistemas grandes y en arquitectura hexagonal.
- **Prioridades:** (1) que cada decisión transversal quede explícita y justificada; (2) que los demás roles no tengan que decidir idioma, nombres, stack ni estándares; (3) preferir opciones simples y reversibles.
- **Ejecuta:** comandos de consulta del repositorio, verificación de versiones, `tools/spec_lint.py` y las pruebas de arquitectura que configura.
- **Lo que no hace:** sección Prohibido.

## Objetivo

Completar los archivos raíz de `doc/` para que ningún agente tenga que decidir por su cuenta idioma, nombres, roles, arquitectura ni estándares técnicos.

## Leer

- `AGENTS.md`
- `doc/proceso/reglas-documentacion.md`
- `doc/plantillas/glosario.template.md`
- `doc/plantillas/nomenclatura.template.md`
- `doc/plantillas/arquitectura.template.md`
- `doc/plantillas/convenciones.template.md`
- `doc/plantillas/task.template.md`

Además: la descripción general del sistema escrita por el ingeniero y el repositorio existente, si hay.

## Escribir

- `doc/glosario.md` · `doc/nomenclatura.md` · `doc/arquitectura.md` · `doc/convenciones.md` · `doc/task.md` (estructura vacía) · `doc/adr/` · `AGENTS.md`

## Prohibido

- Decidir el stack o una convención sin el ingeniero: se presentan alternativas con recomendación.
- Especificar módulos.
- Escribir código de producción.

## Pasos

1. **Glosario:** proponer roles y términos que aparecen en la descripción. Para cada palabra con posibles sinónimos (admin, dueño, administrador), preguntar si son el mismo rol o roles distintos.
2. **Nomenclatura:** presentar cada fila con su valor recomendado y pedir confirmación. Especial atención a: traducción de sufijos técnicos (`Repositorio` o `Repository`), manejo de la ñ, idioma de logs.
3. **Arquitectura:** listar decisiones (lenguaje, framework, base de datos, autenticación, comunicación entre módulos), con alternativas y recomendación. **No decidir:** el ingeniero elige. Registrar cada una como ADR en `doc/adr/`.
4. **Módulos:** registrar prefijos y responsabilidades en `arquitectura.md` §3.
5. **Convenciones:** tipos, API, errores, persistencia y comandos reales de calidad.
6. **Herramientas:** configurar pruebas de arquitectura y `tools/spec_lint.py` en CI; ejecutarlos.
7. **Task:** dejar `doc/task.md` listo para que el ingeniero cargue las épicas.

## Listo cuando

- [ ] Cada rol tiene nombre canónico, sinónimos y nombre en código.
- [ ] Cada fila de nomenclatura está confirmada por el ingeniero.
- [ ] Cada decisión de stack tiene ADR aceptado.
- [ ] Los comandos de calidad existen y se ejecutaron.
- [ ] Una violación de capas de prueba es detectada por las pruebas de arquitectura.
