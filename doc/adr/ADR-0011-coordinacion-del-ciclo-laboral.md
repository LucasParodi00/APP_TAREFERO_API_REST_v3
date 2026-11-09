---
type: adr
id: ADR-0011
title: "Coordinación del ciclo laboral con cupos y revocación de acceso"
status: Propuesto
scope: ["PER", "ACC", "SUS"]
date: 2026-11-09
supersedes: null
---

# ADR-0011 — Coordinación del ciclo laboral con cupos y revocación de acceso

## Contexto

`PER-BR-005`, `PER-BR-006` y `PER-BR-008` vinculan el estado laboral, los períodos históricos, el cupo comercial y la revocación de acceso. `PER-DEP-002` y `PER-DEP-003` definen los dueños de los datos. El alta concurrente no debe consumir dos veces el último cupo. Una inactivación que no pueda suspender la cuenta y revocar las Sesiones debe revertirse.

## Alternativas

### A — Coordinación transaccional mediante puertos en el monolito

- **Cómo funciona:** un límite transaccional coordina las escrituras de PER y ACC mediante sus contratos públicos. PER serializa los cambios que afectan el cómputo de Empleados activos por Empresa. El proveedor comercial aporta un límite vigente que se obtiene o valida dentro de esa misma coordinación.
- **A favor:** permite confirmar juntos estado laboral, período y revocación. Las pruebas pueden reproducir fallas y altas simultáneas.
- **En contra:** exige contratos transaccionales acordados y un orden común de adquisición de bloqueos.

### B — Reservas y compensaciones entre transacciones

- **Cómo funciona:** cada módulo confirma por separado y se coordinan reservas, reintentos y compensaciones.
- **A favor:** facilita separar físicamente los proveedores.
- **En contra:** introduce estados intermedios. Para la revocación laboral, requeriría revisar la garantía aprobada en `PER-BR-008`.

## Decisión

- **Recomendación de origen IA:** A. Reutilizar el entorno transaccional común y conectar los puertos en composición. La operación de ACC confirma la suspensión y revocación o que la ficha carece de acceso que revocar. Una respuesta desconocida se trata como falla de la dependencia.
- **Decidió:** pendiente de revisión del Ingeniero.

## Consecuencias si se acepta

- PER conserva el estado laboral y cuenta sus Empleados activos. El proveedor comercial conserva el límite aplicable. La asignación de `ADR-0009` por sí sola no acredita un cupo de Personal.
- Si el límite puede cambiar mientras se ejecuta un alta, el proveedor coopera mediante el bloqueo acordado o una comprobación transaccional equivalente.
- ACC conserva Cuentas y Sesiones. El adaptador ejecuta sus operaciones públicas dentro de la misma unidad de trabajo que la modificación laboral.
- La entrega integrada prueba concurrencia, revocación inmediata y rollback ante fallas. Los dobles se limitan a pruebas y no habilitan una integración operativa.
