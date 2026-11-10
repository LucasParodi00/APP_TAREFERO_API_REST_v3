---
type: contracts
module: "EMP"
status: Propuesto
---

# Empresas — Contratos

## 1. Archivos

| Tipo | Archivo | Versión |
|---|---|---|
| HTTP | `openapi.yaml` | v1 |
| Eventos | `asyncapi.yaml` | No aplica |

## 2. Semántica adicional

| Operación | Comportamiento | Referencia |
|---|---|---|
| `registrarEmpresa` | Crea la Empresa activa, asigna su configuración general inicial (`AR`, `America/Argentina/Buenos_Aires`, `ARS`) e inhabilita cualquier modificación futura de su alias. | `EMP-UC-001`, `EMP-BR-004`, `EMP-BR-006`, `EMP-BR-013` |
| `modificarEmpresa` | Requiere cabecera `If-Match` con la versión conocida. No permite modificar el alias. Si la Empresa está suspendida, solo admite modificación por SuperAdministrador; si está cerrada, se rechaza. | `EMP-UC-004`, `EMP-BR-013`, `EMP-BR-014` |
| `suspenderEmpresa` | Requiere cabecera `If-Match`. Pasa el estado a `SUSPENDIDA` e incrementa la versión. Conserva historial. | `EMP-UC-005`, `EMP-BR-004`, `EMP-BR-005` |
| `reactivarEmpresa` | Requiere cabecera `If-Match`. Pasa el estado de `SUSPENDIDA` a `ACTIVA` e incrementa la versión. | `EMP-UC-006`, `EMP-BR-004` |
| `cerrarEmpresa` | Requiere cabecera `If-Match`. Pasa el estado a `CERRADA` de forma irreversible e incrementa la versión. Conserva datos y referencias históricas. | `EMP-UC-007`, `EMP-BR-004`, `EMP-BR-008` |
| `modificarConfiguracionGeneral` | Requiere cabecera `If-Match` de la configuración. Verifica que la Empresa no esté cerrada y que el actor posea autorización para modificarla según su estado. | `EMP-UC-008`, `EMP-BR-006`, `EMP-BR-014` |
| `listarEmpresas` | Paginación por base de datos (`LIMIT`/`OFFSET`). Requiere rol de plataforma SuperAdministrador. | `EMP-UC-003` |

## 3. Contratos que consume

| Contrato | Módulo | Para qué | Si no responde |
|---|---|---|---|
| Contexto de autorización | `ACC` | `EMP-DEP-001` (obtener `solicitudId`, `empresaId`, roles y verificar actor) | Denegar acceso con `EMP_ACCESO_DENEGADO` |
| Asignación comercial | `SUS` | `EMP-DEP-002` (confirmar asignación comercial vigente o provisional) | Rechazar alta con `EMP_ASIGNACION_COMERCIAL_REQUERIDA` |
