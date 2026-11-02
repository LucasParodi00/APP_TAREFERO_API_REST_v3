---
type: adr
id: ADR-0004
title: "JWT con sesión persistente y contexto de Empresa"
status: Reemplazado
scope: ["GLOBAL"]
date: 2026-10-30
supersedes: null
---

# ADR-0004 — JWT con sesión persistente y contexto de Empresa

## Contexto

La API debe identificar al actor, impedir accesos revocados, aplicar permisos actuales, aislar Empresas cliente y conservar información suficiente para historial y auditoría. Un token firmado no demuestra por sí solo que Usuario, Membresía o Sesión continúen activos.

## Alternativas

### A — JWT completamente autónomo

- **Cómo funciona:** cada petición confía en firma, vencimiento y permisos incluidos en el token.
- **A favor:** evita una consulta central por petición.
- **En contra:** revocaciones y cambios de permisos no se reflejan hasta renovar o vencer el token.

### B — JWT con Sesión persistente y autorización actual

- **Cómo funciona:** el JWT identifica Usuario, Sesión y Membresía; cada petición comprueba sus estados y obtiene Empresa, roles, permisos y alcance vigentes.
- **A favor:** revocación efectiva, tenant confiable y auditoría vinculada a la sesión real.
- **En contra:** aumenta el costo de autorización y requiere índices y, si se incorpora, caché con invalidación segura.

### C — Identificador de sesión opaco

- **Cómo funciona:** cada petición presenta un identificador sin claims y todo el contexto se obtiene del servidor.
- **A favor:** control central completo.
- **En contra:** no aprovecha la verificación y portabilidad del JWT elegido para los clientes.

## Decisión

- **Elegida:** B — JWT con Sesión persistente y autorización actual.
- **Por qué:** prioriza aislamiento, revocación y trazabilidad por encima de evitar consultas de autorización.
- **Decidió:** Ingeniero — 2026-10-30

## Consecuencias

- **Qué cambia:** la Sesión se crea al autenticar o renovar, no por petición; cada solicitud genera un contexto con Usuario, Membresía, Empresa, Sesión, roles, permisos, alcance e identificador de solicitud.
- **Riesgos:** consultas excesivas y fallos de aislamiento si algún caso de uso acepta `empresaId` desde el cliente.
- **Revisar si:** el volumen exige caché; cualquier caché debe invalidarse ante cambios de sesión, membresía, roles, permisos o Empresa.
