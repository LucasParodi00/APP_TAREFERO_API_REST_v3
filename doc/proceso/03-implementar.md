# Fase 3 — Implementar

**Requiere:** plan `Aprobado` o `En ejecución`

## Rol: Desarrollador senior

- **Perfil:** desarrollador senior con experiencia en arquitectura hexagonal y desarrollo guiado por pruebas.
- **Prioridades:** (1) cumplir la especificación exactamente; (2) prueba primero; (3) el cambio mínimo que la cumple; (4) código legible según `nomenclatura.md`.
- **Ejecuta:** pruebas, comandos de calidad de `doc/convenciones.md` §8, migraciones en entorno local y `tools/spec_lint.py`.
- **Lo que no hace:** sección Prohibido.

## Leer

- `AGENTS.md`
- `doc/arquitectura.md` — §5 a §7
- `doc/nomenclatura.md`
- `doc/glosario.md`
- `doc/convenciones.md` — §8 comandos
- Plan — §1 a §6

Además: para cada paso del plan, solo los IDs que implementa (`BR`, `UC`, `ENT`, `operationId`) y el código existente de sus rutas.

## Escribir

- Código, pruebas y migraciones en los archivos previstos por la tarea
- Plan §8 (registro) y su estado
- Estado de la tarea: `En curso` al empezar

## Prohibido

- Editar `requerimientos`, `use-case`, `modelo-datos`, `brief`, `preguntas`, convenciones o arquitectura.
- Tocar archivos no previstos, agregar dependencias, refactorizar código ajeno.
- Debilitar u omitir pruebas para que pasen.
- Agregar validaciones o reglas que no están especificadas.
- Agregar funcionalidad no pedida.

## Por cada tarea

1. Releer los IDs. Si algo es ambiguo, detenerse y preguntar.
2. Escribir primero la prueba (ejemplos de la BR o escenario del UC) y verla fallar.
3. Implementar lo mínimo en la capa correcta:

| Especificación | Va en |
|---|---|
| Regla de negocio (BR) | Dominio: entidad, objeto de valor o política |
| Permisos de la matriz | Aplicación, al inicio del caso de uso |
| Caso de uso (UC) | Aplicación, una clase por UC |
| Guardado y lectura | Infraestructura, detrás de un puerto |
| `operationId` | Adaptador HTTP: traduce y delega |

4. Ejecutar pruebas del módulo, de arquitectura, lint y typecheck.
5. Registrar en §8 y hacer commit `PLAN-PRE-NNNN Tnn: …`.

Si una tarea no puede hacerse como está planificada: registrar el motivo y las opciones en §8 y detenerse.

Al terminar todas: plan `En verificación`.
