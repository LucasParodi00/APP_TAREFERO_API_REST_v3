---
type: adr
id: ADR-0014
title: "Coordinación transaccional síncrona entre módulos del monolito"
status: Aceptado
scope: ["GLOBAL", "PER", "ACC"]
date: 2026-11-13
supersedes: null
---

# ADR-0014 — Coordinación transaccional síncrona entre módulos del monolito

## Contexto

`PER-BR-008` exige que inactivar un Empleado suspenda su Cuenta de Empresa y revoque sus Sesiones en ACC, y que una falla de ACC rechace la operación completa sin efectos parciales. PER y ACC son dueños de tablas y reglas distintas, pero actualmente se despliegan en el mismo monolito y PostgreSQL. La arquitectura prohíbe que un módulo importe repositorios, entidades TypeORM o Infraestructura de otro.

## Alternativas

### A — Puertos públicos y unidad transaccional en la composición

- PER orquesta el caso de uso mediante un puerto local de acceso.
- ACC publica una capacidad interna mínima para resolver, habilitar, suspender y revocar por `empresaId` y `empleadoId`.
- Una unidad transaccional técnica, suministrada por la composición, ejecuta los adaptadores de ambos módulos sobre la misma transacción sin exponer repositorios ajenos.
- **A favor:** rollback atómico, propiedad modular y ausencia de acceso cruzado a tablas.
- **En contra:** requiere formalizar contexto transaccional y composición sin ciclos.

### B — Compensación síncrona

- Cada módulo confirma por separado y el coordinador intenta deshacer el primer cambio si falla el segundo.
- **A favor:** no requiere transacción compartida.
- **En contra:** la compensación también puede fallar y dejar efectos parciales, contrario a `PER-BR-008`.

### C — Saga o evento asíncrono

- PER registra una transición pendiente y ACC reacciona posteriormente.
- **A favor:** reduce acoplamiento temporal y sirve para despliegues separados.
- **En contra:** cambia el resultado síncrono aprobado y requiere nuevos estados funcionales.

## Decisión

- **Elegida:** A mientras PER y ACC compartan despliegue y base de datos.
- **Motivo:** satisface la atomicidad funcional sin transferir propiedad de datos ni crear lecturas directas entre módulos.
- **Decidió:** Parodi Lucas — 2026-11-13.

## Consecuencias

- `src/comun` solo puede contener el contrato técnico de unidad transaccional si cumple `arquitectura.md` §6.1 y cuenta con tarea/plan CMN.
- Los contratos públicos de PER y ACC permanecen en sus respectivos módulos; no se trasladan reglas ni vocabulario funcional a `src/comun`.
- La composición conecta adaptadores y transacción sin introducir imports bidireccionales entre módulos ni ciclos en Dependency Cruiser.
- Los casos de uso unitarios usan dobles transaccionales; integración demuestra commit y rollback reales sobre PostgreSQL.
- Si los módulos se separan en despliegues, esta decisión debe revisarse y la especificación funcional deberá aceptar una estrategia distribuida.
