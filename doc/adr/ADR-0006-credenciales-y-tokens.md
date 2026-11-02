---
type: adr
id: ADR-0006
title: "Protección de credenciales y ciclo de tokens"
status: Aceptado
scope: ["GLOBAL"]
date: 2026-10-30
supersedes: null
---

# ADR-0006 — Protección de credenciales y ciclo de tokens

## Contexto

`ADR-0004` define JWT con Sesión persistente, pero faltaba fijar la protección de contraseñas, la firma y la duración inicial de los tokens.

## Alternativas

### A — Argon2id, firma asimétrica y renovación rotativa

- **Cómo funciona:** la contraseña se deriva con Argon2id; el acceso usa un JWT de vida corta; el token de renovación rota y su reutilización revoca la familia asociada.
- **A favor:** limita exposición, permite separar firma y verificación y detecta robo de tokens de renovación.
- **En contra:** requiere administración segura de claves y estado de renovación.

### B — Contraseña con hash heredado y JWT de larga duración

- **Cómo funciona:** un único token mantiene acceso durante un período largo.
- **A favor:** implementación más pequeña.
- **En contra:** aumenta el impacto de filtraciones y demora la revocación efectiva.

## Decisión

- **Elegida:** A — Argon2id, firma asimétrica y renovación rotativa.
- **Por qué:** complementa la Sesión persistente con credenciales resistentes y acceso de corta duración.
- **Decidió:** Ingeniero — 2026-10-30

## Consecuencias

- **Qué cambia:** acceso de 15 minutos, renovación de hasta 30 días, rotación, detección de reutilización y claves fuera del repositorio.
- **Riesgos:** pérdida o rotación incorrecta de claves; carreras durante la renovación.
- **Revisar si:** cambian los clientes, el modelo de amenazas o los requisitos de operación offline.
