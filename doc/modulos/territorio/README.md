---
type: module-readme
module: "TER"
normative: false
---

# Territorio — Primera entrega: Chacras

> Documento descriptivo. Las reglas, permisos y atributos pertenecen a los archivos normativos del módulo.

## De qué se trata

Esta entrega especifica la administración descriptiva de Chacras dentro del módulo Territorio. Parte del texto literal del Ingeniero en `territorio.brief.md` y de las seis respuestas registradas en `territorio.preguntas.md`.

La representación de Lotes, delimitación, superficies y contexto productivo se tratará después. El alcance actual no exige completar esa información para registrar una Chacra; referencia `TER-Q-004`.

## Qué se puede hacer

| Capacidad | Referencia |
|---|---|
| Registrar Chacra | `TER-UC-001` |
| Consultar ficha | `TER-UC-002` |
| Listar Chacras autorizadas | `TER-UC-003` |
| Modificar datos descriptivos | `TER-UC-004` |
| Inactivar conservando historial | `TER-UC-005` |

Los permisos se consultan únicamente en la matriz de `territorio.use-case.md`. Los datos y sus límites están en `TER-ENT-001`; las reglas de validación y ciclo de vida están en `territorio.requerimientos.md`.

## Relación con otros módulos

- Empresas: contexto de la Empresa propietaria, `TER-DEP-001`.
- Identidad y acceso: actor, permisos, alcance de Chacras y soporte, `TER-DEP-002`.

## Estado

Se redactaron siete reglas, cinco requerimientos, dos dependencias, cinco casos de uso con escenarios y una entidad lógica. Las seis preguntas tienen respuesta; no hay preguntas bloqueantes abiertas para esta redacción.

Los ítems siguen Propuesto hasta revisar y aprobar la especificación redactada. Antes de planificar deben concretarse la normalización del nombre corto y el contrato de asignaciones del Capataz; no se los considera definidos por omisión. Las tareas de implementación permanecen bloqueadas por aprobación o preparación pendiente, no por preguntas ya respondidas.

## Archivos

| Archivo | Contenido |
|---|---|
| `territorio.brief.md` | Texto literal del Ingeniero |
| `territorio.preguntas.md` | Preguntas y respuestas |
| `territorio.requerimientos.md` | Reglas, capacidades, dependencias y exclusiones |
| `territorio.use-case.md` | Actores, permisos, flujos y escenarios |
| `territorio.modelo-datos.md` | Modelo lógico de Chacra |
| `territorio.task.md` | Trabajo y preparación pendientes |
