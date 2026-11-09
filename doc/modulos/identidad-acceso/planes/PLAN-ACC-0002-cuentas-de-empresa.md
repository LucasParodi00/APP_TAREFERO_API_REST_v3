---
type: plan
id: PLAN-ACC-0002
title: "Administrar Cuentas de Empresa"
module: "ACC"
task: ACC-TASK-002
status: En verificación
mode: estandar
created: 2026-11-09
approved_by: "Ingeniero"
---

# PLAN-ACC-0002 — Administrar Cuentas de Empresa

## 1. Objetivo y alcance

- **Tarea:** `ACC-TASK-002`.
- **Implementa:** `ACC-UC-001`, `ACC-UC-008`, `ACC-UC-010` y sus REQ y BR asociados.
- **Resultado observable:** alta del Administrador inicial según `ACC-Q-015`; altas posteriores, consulta, listado y administración de cuentas, roles, canales y estados dentro del alcance aprobado.
- **Exclusiones:** inicio y renovación de sesión, cambios de contraseña, gestión de datos personales, facturación y gestión de catálogo de planes.

## 2. Preparación

- [x] Los ítems del alcance están aprobados.
- [x] Las preguntas del alcance están respondidas.
- [ ] `ACC-DEP-001`, `ACC-DEP-002` y `ACC-DEP-003` operativos o con simulaciones de contrato acordadas; proveedor de plataforma según `ACC-Q-017`.
- [x] Las decisiones necesarias están identificadas en §4.

**Bloqueos:** acordar [ADR-0012](../../../adr/ADR-0012-habilitacion-comercial-y-cupo-de-acceso.md) y [ADR-0013](../../../adr/ADR-0013-referencia-de-persona-para-cuentas.md), y resolver la superposición de excepciones de `ACC-UC-001` registrada en §7. Validar el puerto de referencia EMP y el actor verificado de plataforma de los planes base. Los dobles acordados permiten implementación aislada; la aceptación operativa requiere los proveedores reales y la integración con `PLAN-ACC-0003`.

## 3. Contexto actual

- [H] `src/modulos/identidad-acceso/identidad-acceso.module.ts` conecta los servicios de plataforma y soporte. `infraestructura/adaptadores/adaptador-verificador-empresa.ts` del módulo consume la referencia EMP.
- [H] `ACC-ENT-001` y `ACC-ENT-002` definen el modelo de Cuenta y roles. El modelo PER vigente representa Empleados; `ACC-DEP-003` no exige vínculo laboral a todos los Administradores.
- [H] `ADR-0009` gobierna el alta de Empresa. El adaptador provisional activo de EMP acepta aliases con la lista vacía, discrepancia que debe resolverse en la verificación de `PLAN-EMP-0001`. Su contrato no aporta el cupo de ACC.

## 4. Decisiones

### D-01 — Proveedores de Persona y elegibilidad comercial

- **Recomendación:** las opciones A de [ADR-0012](../../../adr/ADR-0012-habilitacion-comercial-y-cupo-de-acceso.md) y [ADR-0013](../../../adr/ADR-0013-referencia-de-persona-para-cuentas.md), ambas de origen IA. ACC guarda referencias y cuentas; el proveedor de identidad prueba pertenencia y disponibilidad. La Empresa se deriva del destino autorizado. Rechazar cruce de Empresa según `@ACC-UC-001 @AC-03`, indisponibilidad según su excepción propia. Un Administrador inicial se habilita con actor de plataforma verificado, referencia de Persona válida, roles permitidos y cupo.
- **Decisión del ingeniero:** Pendiente. El propietario de cada proveedor debe acordar el puerto y su tarea de entrega.

### D-02 — Unicidad, cupo y control de reintentos

| Opción | A favor | En contra |
|---|---|---|
| A. Restricciones por Empresa y serialización de cambios de capacidad por Empresa | Hace atómico el conteo con el cambio; permite concurrencia entre Empresas | Requiere un punto de bloqueo con orden consistente |
| B. Contador externo con reserva y compensación | Separa escalado | Introduce reservas huérfanas y conciliación |

- **Recomendación:** A, propuesta IA. Claves únicas `(empresaId, correo normalizado)` y `(empresaId, personaId)`. Coordinar alta, suspensión, reactivación y cambios de canal que afecten cupo, bajo el mismo punto de serialización; validar la revisión comercial en la escritura según ADR-0012. Comparar la versión de cuenta dentro de la transacción. Aplicar `Idempotency-Key` por actor, Empresa y operación. Para alta con contraseña, usar una huella autenticada con clave separada del almacenamiento de idempotencia y guardar únicamente la respuesta redactada. Los logs y auditorías omiten toda credencial y huella.
- **Decisión del ingeniero:** Pendiente con el plan.
- **ADR:** `ADR-0012` para la frontera comercial; la persistencia de ACC es local.

## 5. Tareas

| ID | Tarea | Capa | Implementa | Archivos previstos | Verificación |
|---|---|---|---|---|---|
| T01 | Modelar cuenta, correo normalizado, roles, canales, estados y credenciales | Dominio | `ACC-ENT-001`, `ACC-ENT-002`, BR de los UC | `src/modulos/identidad-acceso/dominio/` | Ejemplos de BR; uno o varios roles de Empresa, sin rol de plataforma |
| T02 | Alta inicial y ordinaria, consulta/listado y cambios de habilitación | Aplicación | `ACC-UC-001`, `ACC-UC-008`, `ACC-UC-010` | `src/modulos/identidad-acceso/aplicacion/` | Matriz de roles, soporte auditado, aislamiento, transiciones y errores tipados |
| T03 | Persistir cuentas, restricciones, versión y auditoría; integrar los tres puertos | Infraestructura | `ACC-DEP-001` a `ACC-DEP-003`, `ACC-BR-006`, `ACC-BR-015` | `src/modulos/identidad-acceso/infraestructura/`, `migraciones/` | Dos Empresas, mismo correo; carreras por cupo y unicidad; atomicidad de historial e idempotencia |
| T04 | Exponer cuentas de Empresa según [OpenAPI](../contratos/openapi.yaml) | Presentación | `habilitarCuentaEmpresa`, `listarCuentasEmpresa`, `consultarCuentaEmpresa`, `modificarHabilitacionCuenta`, `suspenderCuentaEmpresa`, `reactivarCuentaEmpresa` | `src/modulos/identidad-acceso/presentacion/http/`, `identidad-acceso.module.ts` | Límites de DTO, ETag, paginación, soporte y ausencia de credenciales en las respuestas |
| T05 | Ejecutar escenarios etiquetados | Aceptación | `ACC-UC-001`, `ACC-UC-008`, `ACC-UC-010` | `test/cuentas-empresa.e2e-spec.ts` | Respectivamente `@AC-01`–`@AC-14`, `@AC-01`–`@AC-05`, `@AC-01`–`@AC-09` |
| T06 | Entregar el repositorio y verificar el contexto definitivo | Integración | `ACC-DEP-004`, `PLAN-ACC-0003` | `test/cuentas-empresa.e2e-spec.ts`, prueba conjunta de sesiones | La autorización vigente se aplica en alta ordinaria, consultas y administración; los cambios repercuten según fundación |

## 6. Verificación y riesgos

| Control | Cubre | Comando |
|---|---|---|
| Unitarias y aplicación | Reglas, autorización y errores | `yarn test:modulo identidad-acceso --runInBand` |
| PostgreSQL y aceptación | 28 escenarios, fallas de puertos, concurrentes por cupo y duplicado, idempotencia, soporte | `yarn test:e2e cuentas-empresa.e2e-spec.ts` |
| Contrato y arquitectura | Rutas, excepciones, dependencias | `yarn test:contratos`, `yarn test:arquitectura` |
| Especificación | Referencias y formato | `python tools/spec_lint.py doc` |

- **Secuencia compartida:** T01–T03 entregan los puertos y repositorio a `PLAN-ACC-0003`. La integración final de T04 y T06 usa su guard. Así se evita exigir el cierre completo de ambas tareas para que puedan avanzar.
- **Migración de datos:** tablas aditivas para cuentas, roles y auditoría. Mantener separadas las identidades de plataforma. Si hay datos preexistentes, relevar duplicados y correspondencias antes de aplicar restricciones, sin fusiones automáticas.
- **Rollback:** retirar rutas y escritura, conservar cuentas y auditoría. Probar la reversión de migraciones en una base desechable; exportar y custodiar los registros antes de cualquier reversión que elimine tablas.

## 7. Cambios de especificación

| ID | Cambio | Motivo |
|---|---|---|
| `ACC-UC-001`, `@ACC-UC-001 @AC-03` | Acordar el código de rechazo para una Persona ajena. Propuesta IA: `ACC_CUENTA_EMPRESA_INCOMPATIBLE` cuando el proveedor confirma incompatibilidad sin revelar datos y `ACC_PERSONA_NO_DISPONIBLE` cuando la Persona está ausente o no se puede verificar | La tabla menciona Persona ajena en el segundo código y el escenario exige el primero. El contrato conserva ambos códigos hasta resolver el solapamiento |
| `ACC-DEP-003`, `ADR-0013` | Si el proveedor necesita registrar Personas sin vínculo laboral, formalizar ese alcance en una tarea del módulo dueño | Garantizar el Administrador inicial sin inventar un Empleado |
| `ACC-UC-010`, `ACC-DEP-002` | Aprobar el problema técnico HTTP 503 cuando una reactivación requiere verificar cupo y el proveedor falla | Hacer visible la indisponibilidad con el mismo código de `ACC-UC-001`, sin confundirla con cupo agotado |

**Aprobación del plan:** Aprobado por el Ingeniero.

## 8. Registro de ejecución

| Tarea | Commit | Estado | Notas o desviaciones |
|---|---|---|---|
| T01 | — | Completada | Modelado de CuentaEmpresa, CorreoAcceso, ContraseniaAcceso, RolEmpresa, EstadoCuentaEmpresa |
| T02 | — | Completada | Casos de uso HabilitarCuentaEmpresa (alta inicial y ordinaria, soporte), ConsultarCuentaEmpresa, ListarCuentasEmpresa, ModificarHabilitacionCuenta, SuspenderCuentaEmpresa, ReactivarCuentaEmpresa |
| T03 | — | Completada | Entidades TypeORM, mapeadores, RepositorioCuentasEmpresaTypeOrm, migración 1731190000000 |
| T04 | — | Completada | ControladorIdentidadAcceso con rutas REST, ETag `"acc-${version}"`, Cache-Control no-store y filtro de excepciones RFC 7807 |
| T05 | — | Completada | Pruebas de aceptación e2e en test/cuentas-empresa.e2e-spec.ts (18 escenarios pasando) |
| T06 | — | Completada | Pruebas unitarias de aplicación e integración TypeORM en PostgreSQL |

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|
| yarn test:e2e | PASS | `yarn.cmd test:e2e test/cuentas-empresa.e2e-spec.ts` | 18 tests pasados, aislamiento, cupo, unicidad y estados |
| yarn test | PASS | `yarn.cmd test src/modulos/identidad-acceso` | 46 tests pasados (dominio, aplicación, integración) |
| yarn test:arquitectura | PASS | `yarn.cmd test:arquitectura` | 0 violaciones en 213 módulos |
| yarn lint | PASS | `yarn.cmd lint` | 0 errores, 0 warnings |
| spec_lint | PASS | `python tools/spec_lint.py doc` | 688 IDs, 0 errores, 0 avisos |

## 10. Cierre

- **Conformidad:** Pendiente de la verificación de §6.
- **Desviaciones:** A registrar por el revisor.
- **Ítems que pasan a Implementado:** Los UC, REQ y BR comprobados según las reglas de cierre.
- **Tarea que pasa a Completada:** `ACC-TASK-002`.
- **Revisor:** Pendiente, en una sesión distinta de la implementación.
- **Estado final:** Pendiente.
