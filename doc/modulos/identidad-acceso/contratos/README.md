---
type: contracts
module: "ACC"
status: Propuesto
---

# Identidad y acceso — Contratos

## 1. Archivos

| Tipo | Archivo | Versión |
|---|---|---|
| HTTP | `openapi.yaml` | v1 |
| Eventos | `asyncapi.yaml` | No aplica |

## 2. Semántica adicional

| Operación | Comportamiento | Referencia |
|---|---|---|
| `iniciarSesion` | Valida credenciales con Argon2id, comprueba que la Empresa y la Cuenta estén activas, crea Sesión persistente y emite token de acceso (15 min) y renovación (30 días). | `ACC-UC-002`, `ADR-0006`, `ACC-BR-019` |
| `renovarSesion` | Valida el refresh token, emite un nuevo par de tokens e invalida el anterior. Si se detecta un refresh token ya utilizado, revoca inmediatamente toda la sesión. | `ACC-UC-009`, `ADR-0006` |
| `habilitarCuentaEmpresa` | Crea la Cuenta de Empresa para una persona previa validación de cupo con Suscripciones y unicidad de correo en la Empresa. | `ACC-UC-001`, `ACC-BR-003`, `ACC-BR-006` |
| `cambiarContrasenia` | Verifica la contraseña anterior, actualiza con Argon2id y revoca o actualiza sesiones existentes. | `ACC-UC-004`, `ACC-BR-013`, `ACC-BR-014` |
| `restablecerContrasenia` | Permite al Administrador de la Empresa o soporte técnico asignar una nueva contraseña que cumpla `ACC-BR-019`. | `ACC-UC-005`, `ACC-BR-010` |
| `cambiarEstadoCuenta` | Requiere cabecera `If-Match`. Suspende o reactiva la cuenta validando cupos al reactivar. | `ACC-UC-010`, `ACC-BR-006`, `ACC-BR-016` |
| `registrarIntervencionSoporte` | Permite al SuperAdministrador registrar una intervención de soporte temporal con motivo obligatorio de hasta 1000 caracteres. | `ACC-UC-007`, `ACC-BR-011`, `ACC-BR-020` |

## 3. Contratos que consume

| Contrato | Módulo | Para qué | Si no responde |
|---|---|---|---|
| Identidad, alias y estado de Empresa | `EMP` | `ACC-DEP-001` (resolver empresa por alias y verificar que esté activa) | Rechazar inicio de sesión con `EMP_NO_HABILITADA` o denegar acceso |
| Cupos de suscripción | `SUS` | `ACC-DEP-002` (validar cupo de cuentas activas contratadas) | Rechazar con `ACC_VALIDACION_COMERCIAL_NO_DISPONIBLE` |
| Persona / Empleado | `PER` | `ACC-DEP-003` (comprobar que la persona pertenece a la Empresa) | Rechazar habilitación con `ACC_PERSONA_NO_DISPONIBLE` |
