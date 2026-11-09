---
type: adr
id: ADR-0010
title: "Contexto de soporte de plataforma por operación"
status: Propuesto
scope: ["ACC", "EMP", "GLOBAL"]
date: 2026-11-09
supersedes: null
---

# ADR-0010 — Contexto de soporte de plataforma por operación

## Contexto

`ACC-UC-007` y `ACC-DEP-004` requieren transmitir una autorización de soporte acotada a los módulos dueños. `EMP-DEP-001` es uno de los consumidores del contexto. Esta propuesta concreta el intercambio de `ADR-0008` dentro del alcance de `ACC-Q-017`.

## Alternativas

### A — Contexto interno para una sola solicitud

- **Cómo funciona:** el punto de composición conecta un puerto de ACC con la entrada autorizada del módulo dueño. ACC valida el actor, la Sesión, el destino y el motivo. El consumidor recibe una autorización vinculada a la operación y solicitud concretas, junto con la referencia de auditoría.
- **A favor:** el alcance se comprueba con cada acción. El cliente no administra un permiso de soporte reutilizable.
- **En contra:** cada operación consumidora necesita integración y pruebas propias.

### B — Contexto de soporte solicitado por separado

- **Cómo funciona:** el actor pide iniciar una intervención y el cliente presenta una referencia en solicitudes posteriores.
- **A favor:** permite agrupar varias acciones en una intervención visible en el cliente.
- **En contra:** exige definir vigencia, revocación, reenvío y límites de uso del contexto entre solicitudes.

## Decisión

- **Recomendación de origen IA:** A. Separar administración de plataforma, operación con Cuenta de Empresa y soporte. Aplicar `ACC-BR-002`, `ACC-BR-011` y `ACC-BR-020` mediante los puertos del dueño.
- **Decidió:** pendiente de revisión del Ingeniero.

## Consecuencias si se acepta

- La autenticación operativa entrega a ACC una identidad de plataforma y Sesión verificadas. El diseño del mecanismo sigue bajo `ACC-Q-017`.
- La auditoría registra la intervención iniciada y el resultado. La mutación del dueño conserva la referencia en la misma transacción que el cambio o en su registro durable de salida.
- Los consumidores conservan sus permisos, restricciones e historial funcional. La integración y sus verificaciones se incorporan al plan del consumidor correspondiente.
- La composición acopla puertos públicos sin dependencias recíprocas entre los internos de ACC y EMP.
