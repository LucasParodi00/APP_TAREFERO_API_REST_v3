---
type: adr
id: ADR-0010
title: "Cuenta de Empresa tenant-scoped con vínculo laboral opcional"
status: Aceptado
scope: ["ACC", "PER", "GLOBAL"]
date: 2026-11-11
supersedes: null
---

# ADR-0010 — Cuenta de Empresa tenant-scoped con vínculo laboral opcional

## Contexto

La especificación de ACC exigía `personaId` para toda Cuenta de Empresa, pero PER no define una entidad Persona: su entidad laboral es Empleado. El flujo SaaS aprobado necesita crear un Administrador inicial para la Empresa aunque esa persona no sea Empleado, y también permite registrar Empleados que nunca acceden al sistema.

## Alternativas

### A — Cuenta de Empresa con `empleadoId` opcional

- **Cómo funciona:** la Cuenta de Empresa es la identidad de acceso dentro del tenant. Puede no tener vínculo laboral, como el Administrador inicial, o referenciar opcionalmente un Empleado de la misma Empresa. Los roles Capataz y Empleado exigen un Empleado activo.
- **A favor:** representa el flujo SaaS, evita una entidad Persona artificial, mantiene separado el acceso de la ficha laboral y no comparte credenciales entre Empresas.
- **En contra:** las operaciones que necesiten información laboral deben integrarse expresamente con PER.

### B — Persona global o tenant-scoped obligatoria

- **Cómo funciona:** toda Cuenta de Empresa referencia una entidad Persona adicional, aunque no exista relación laboral.
- **A favor:** ofrece una identidad humana separada de la cuenta y del empleo.
- **En contra:** agrega una entidad sin dueño funcional, duplica datos y no surge del flujo aprobado por el Ingeniero.

## Decisión

- **Elegida:** A — Cuenta de Empresa con `empleadoId` opcional.
- **Por qué:** la suscripción pertenece a la Empresa, el acceso pertenece a la Cuenta de Empresa y la relación laboral pertenece al Empleado. El Administrador inicial puede existir sin ficha laboral; un Empleado solo consume cupo de acceso cuando se crea su Cuenta de Empresa.
- **Decidió:** Ingeniero — 2026-11-11

## Consecuencias

- No se crea una entidad Persona ni se utiliza `personaId` en ACC.
- ACC conserva `empleadoId` opcional y no duplica DNI ni datos laborales.
- PER inicia la habilitación de acceso para un Empleado activo y entrega su referencia; ACC conserva el vínculo.
- Capataz y Empleado con acceso requieren un Empleado activo de la misma Empresa; Administrador puede existir sin ese vínculo.
- La misma persona en otra Empresa utiliza otra Cuenta de Empresa con credenciales y autorización independientes.
- El SuperAdministrador continúa como identidad de plataforma separada y sin Empresa ficticia.
