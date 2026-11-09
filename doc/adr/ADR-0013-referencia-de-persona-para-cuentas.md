---
type: adr
id: ADR-0013
title: "Referencia de Persona para Cuentas de Empresa"
status: Propuesto
scope: ["ACC","PER"]
date: 2026-11-09
supersedes: null
---

# ADR-0013 — Referencia de Persona para Cuentas de Empresa

## Contexto

`ACC-DEP-003` exige verificar a la Persona de la Empresa y reserva los datos personales a PER. `ACC-Q-015` requiere habilitar un Administrador inicial, que puede carecer de vínculo laboral. El modelo vigente de PER describe Empleados y sus períodos. Origen de las alternativas: IA.

## Alternativas

### A — Referencia de Persona emitida por PER con vínculo laboral opcional

- **Cómo funciona:** PER define en su alcance el registro o la resolución de una Persona y expone una referencia opaca para ACC. El puerto recibe `empresaId` y `personaId` y devuelve referencia verificada de esa Empresa, incompatibilidad de Empresa, Persona ausente o no verificable, o falla del proveedor. El vínculo a Empleado se resuelve en PER cuando corresponda.
- **A favor:** habilita al Administrador inicial sin requerir un Empleado y conserva a PER como dueño de la verificación y de los datos.
- **En contra:** requiere acordar cómo se registra y verifica al Administrador inicial y ajustar la entrega PER si aún no lo cubre.

### B — Proveedor provisional bajo propiedad de PER con conciliación posterior

- **Cómo funciona:** PER acepta un padrón provisional verificado para el Administrador inicial y expone el mismo puerto. Se concilia con su registro definitivo antes de reemplazarlo.
- **A favor:** permite avanzar sin esperar la implementación completa de PER.
- **En contra:** añade una migración de referencias y exige garantizar unicidad y pertenencia durante la coexistencia.

## Decisión

- **Elegida:** Pendiente. Recomendación A.
- **Por qué:** conserva una única autoridad sobre la Persona y evita conciliar dos padrones.
- **Decidió:** Pendiente de aprobación del Ingeniero.

## Consecuencias

- ACC guarda `personaId` y `empresaId` como referencias. DNI, nombre, apellido, verificación y datos laborales quedan con su dueño. El contrato evita exponer información de otra Empresa y permite aplicar las excepciones de `ACC-UC-001`.
- Probar Administrador inicial sin vínculo laboral, Empleado con vínculo, Persona de otra Empresa, Persona ausente, falla de proveedor y duplicado en una Empresa. El listado usa referencias de su Empresa.
- Cualquier alta adicional de Persona se aprueba y se registra en el módulo dueño, con su tarea y plan. El alcance de `PLAN-ACC-0002` es consumir y verificar este puerto.
