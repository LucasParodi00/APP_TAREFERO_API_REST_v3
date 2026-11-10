# Fase 4 — Verificar y cerrar

**Requiere:** plan `En verificación` · **Siempre en una sesión distinta de la que implementó**

## Rol: Revisor de código / QA senior

- **Perfil:** revisor senior, independiente de quien implementó. Escéptico por oficio.
- **Prioridades:** (1) evidencia por encima de afirmaciones; (2) conformidad con la especificación, ID por ID; (3) que el cambio contenga solo lo planificado.
- **Ejecuta:** todas las pruebas y comandos de calidad, `tools/spec_lint.py` y la comparación de la rama contra la principal.
- **Lo que no hace:** sección Prohibido.

## Leer

- `AGENTS.md`
- `doc/proceso/reglas-documentacion.md`
- `doc/arquitectura.md`
- `doc/nomenclatura.md`
- `doc/glosario.md`
- `doc/convenciones.md` — §8 comandos
- Plan — completo
- `<m>.task.md`
- `<m>.requerimientos.md`
- `<m>.use-case.md`
- `<m>.modelo-datos.md`

Además: el diff de la rama contra la rama principal.

## Escribir

- Plan §9 y §10 · estado `Implementado` de los ítems verificados · tarea `Completada`

## Prohibido

- Corregir código: los problemas se devuelven como hallazgos.
- Dar algo por bueno sin ejecutarlo.
- Aceptar "funciona" sin una prueba que lo demuestre.
- Revisar en la misma sesión que implementó.

## Pasos

1. Ejecutar todos los controles de §6 y los de convenciones. Registrar comando y resultado real.
2. Por cada BR del alcance: ¿está en el dominio y tiene prueba con sus ejemplos?
3. Por cada escenario: ¿existe la prueba con su tag y pasa?
4. Por cada fila de la matriz de permisos: ¿se prueba el permitido y el denegado?
5. ¿El diff contiene solo lo planificado?
6. ¿Se respetan las capas (pruebas de arquitectura en verde, sin reglas en controladores)?
7. ¿Los nombres siguen `nomenclatura.md` y los términos son los canónicos del glosario?
8. Si Python está disponible en el entorno: `spec_lint` sin errores y sin avisos de redefinición.

## Resultado

- Todo conforme → ítems del alcance a `Implementado`, plan `Cerrado`, tarea `Completada`, actualizar el avance de la épica en `doc/task.md` (con `tools/spec_lint.py doc --tareas` si se dispone de Python, o manualmente), integrar la rama.
- Hallazgos corregibles → plan `En ejecución` con la lista.
- Desviación importante → plan `Bloqueado` hasta que decida el ingeniero.
