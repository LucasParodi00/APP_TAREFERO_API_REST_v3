---
type: adr
id: ADR-TER-0001
title: "Coordinación transaccional entre Chacras y Lotes"
status: Propuesto
scope: ["TER"]
date: 2026-11-09
supersedes: null
---

# ADR-TER-0001 — Coordinación transaccional entre Chacras y Lotes

## Contexto

`TER-Q-022` y `TER-BR-023` coordinan `TER-UC-005`, `TER-UC-006` y `TER-UC-012`. Dos transacciones independientes podrían comprobar simultáneamente que una Chacra está activa y que no tiene Lotes activos. Ambas comprobaciones serían válidas antes de escribir, aunque la combinación de las escrituras deje un estado inválido.

## Alternativas

### A — Bloquear la Chacra propietaria antes de validar y escribir

- **Cómo funciona:** las tres operaciones bloquean primero la misma fila de Chacra, dentro de su Empresa y de la transacción que hará el cambio. Después comprueban estado y, cuando corresponda, si existen Lotes activos. La migración de Lotes pertenece a su entrega.
- **A favor:** la coordinación queda explícita en los repositorios y se puede demostrar con dos transacciones concurrentes.
- **En contra:** introduce espera cuando varias operaciones escriben sobre la misma Chacra. Los caminos futuros que activen Lotes deben respetar el mismo protocolo.

### B — Aislamiento serializable con reintentos

- **Cómo funciona:** cada operación usa una transacción serializable y reintenta los conflictos de serialización dentro de un límite.
- **A favor:** expresa la consistencia mediante el aislamiento de la transacción.
- **En contra:** exige definir reintentos y asegurar que los efectos de la transacción sean seguros al repetirla.

## Decisión

- **Recomendación de origen IA:** A. Bloquear por Empresa y Chacra, mantener el control optimista de versión para la solicitud HTTP y comprobar `TER-BR-023` dentro de la transacción.
- **Decidió:** pendiente de revisión del Ingeniero.

## Consecuencias si se acepta

- La migración de Chacras precede a la migración de Lotes. `TER-TASK-002` y `TER-TASK-005` pueden prepararse por separado y deben integrarse para verificar la inactivación con datos reales.
- La exposición de la inactivación requiere el esquema real de Lotes y el protocolo común. Una falla de lectura o un esquema ausente impiden confirmar la operación.
- Las pruebas cubren ambas secuencias de una inactivación concurrente con el registro o reactivación de un Lote. Se comprueba también que la operación no modifica los Lotes.
