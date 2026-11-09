---
type: adr
id: ADR-0012
title: "Habilitación comercial y cupo de acceso de Empresa"
status: Propuesto
scope: ["ACC","EMP","SUS"]
date: 2026-11-09
supersedes: null
---

# ADR-0012 — Habilitación comercial y cupo de acceso de Empresa

## Contexto

`ACC-DEP-002` requiere la habilitación comercial vigente para autenticación y renovación, y el cupo de `ACC-BR-006` para habilitar cuentas. `ADR-0009` cubre la asignación provisional para el alta de EMP. Arquitectura §13.1 prevé un contrato provisional mientras SUS sea futuro. Origen de las alternativas: IA.

## Alternativas

### A — Proveedor provisional administrado por plataforma

- **Cómo funciona:** un puerto consulta por `empresaId` y devuelve habilitación vigente, cupo de cuentas activas, revisión y referencia de la asignación. Distingue asignación ausente, inhabilitación comercial y falla técnica. La plataforma concilia el alias preaprobado de `ADR-0009` con el identificador estable creado por EMP. La consulta de login y renovación usa habilitación; la de altas y reactivaciones usa también cupo. EMP mantiene el puerto de alta y ACC el suyo de acceso.
- **A favor:** admite el circuito SaaS antes de SUS, con asignaciones explícitas y migrables.
- **En contra:** requiere proveedor operativo y una tarea de entrega, gestión autorizada y coordinación entre cambios de cupo y de cuentas.

### B — Integrar SUS antes de habilitar el circuito

- **Cómo funciona:** el módulo dueño provee las consultas y una garantía de capacidad vigente. Se usan dobles acordados solo para desarrollo aislado.
- **A favor:** evita una persistencia provisional.
- **En contra:** aplaza la aceptación operativa hasta que SUS disponga de la funcionalidad.

## Decisión

- **Elegida:** Pendiente. Recomendación A para el alcance actual.
- **Por qué:** separa la política comercial del uso de cupo en ACC y habilita una transición con referencias trazables.
- **Decidió:** Pendiente de aprobación del Ingeniero.

## Consecuencias

- La ausencia, inhabilitación o falla técnica impiden habilitar acceso. Plataforma registra valores explícitos; ningún plan o límite se infiere desde código. Las consultas de ACC identifican la causa internamente y la exponen según el caso de uso.
- ACC cuenta una vez cada Cuenta de Empresa activa conforme a `ACC-BR-006`. En el proveedor provisional, los cambios de cupo y las altas o reactivaciones se coordinan con el mismo bloqueo por Empresa en la transacción de PostgreSQL, sin acceso directo de ACC a tablas del proveedor. Si SUS cambia esta topología, se conserva la garantía con su mecanismo transaccional acordado antes del reemplazo.
- Los cambios de asignación quedan auditados. Para el reemplazo, conciliar Empresa, revisión y cupo con SUS. Verificar alias vinculados, ausencia de cupo implícito, fallas del proveedor y concurrencia por el último lugar.
- El Ingeniero aprueba el proveedor y su tarea de entrega. `PLAN-ACC-0002` y `PLAN-ACC-0003` consumen el contrato; el alta de EMP conserva la decisión de `ADR-0009`.
