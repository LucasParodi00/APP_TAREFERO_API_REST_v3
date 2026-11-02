---
type: contracts
module: "PRE"
status: Propuesto
---

# [Módulo] — Contratos

<!-- La forma de la API vive solo en openapi.yaml (y asyncapi.yaml si hay eventos). No copiar campos ni códigos HTTP aquí.
Cada operación declara en OpenAPI: operationId, x-use-case: PRE-UC-NNN, x-business-rules: [PRE-BR-NNN].
Este archivo solo registra lo que OpenAPI no puede expresar. Si no hay nada, dejar solo §1. -->

## 1. Archivos

| Tipo | Archivo | Versión |
|---|---|---|
| HTTP | `openapi.yaml` | v1 |
| Eventos | `asyncapi.yaml` | [v1 / No aplica] |

## 2. Semántica adicional

| Operación | Comportamiento | Referencia |
|---|---|---|
| `[operationId]` | [Idempotencia, consistencia, orden…] | `PRE-UC-NNN` |

## 3. Contratos que consume

| Contrato | Módulo | Para qué | Si no responde |
|---|---|---|---|
| `[operationId / evento]` | `OTR` | `PRE-DEP-NNN` | [Comportamiento] |
