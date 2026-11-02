---
type: epics
owner: "Ingeniero"
---

# Task principal — Épicas

<!-- Las épicas representan resultados grandes del negocio. Las tareas concretas
viven en el task de cada módulo y referencian una de estas épicas. El avance se
regenerará con `python tools/spec_lint.py doc --tareas` cuando Python esté disponible. -->

## Resumen

<!-- generado:resumen:inicio -->
| Épica | Estado | Avance |
|---|---|---|
| EPIC-001 | Propuesta | 0/3 tareas completadas |
| EPIC-002 | Propuesta | 0/4 tareas completadas |
| EPIC-003 | Propuesta | 0/3 tareas completadas |
| EPIC-004 | Propuesta | 0/0 tareas completadas |
| EPIC-005 | Propuesta | 0/0 tareas completadas |
| EPIC-006 | Propuesta | 0/0 tareas completadas |
| EPIC-007 | Propuesta | 0/0 tareas completadas |
| EPIC-008 | Propuesta | 0/0 tareas completadas |
| EPIC-009 | Propuesta | 0/0 tareas completadas |
| EPIC-010 | Propuesta | 0/0 tareas completadas |
| EPIC-011 | Propuesta | 0/0 tareas completadas |
| EPIC-012 | Propuesta | 0/0 tareas completadas |
| EPIC-013 | Propuesta | 0/0 tareas completadas |
| EPIC-014 | Propuesta | 0/0 tareas completadas |
| EPIC-015 | Propuesta | 0/0 tareas completadas |
| EPIC-016 | Propuesta | 0/0 tareas completadas |
| EPIC-017 | Propuesta | 0/0 tareas completadas |
<!-- generado:resumen:fin -->

## EPIC-001 — Empresas administrables

- **Estado:** Propuesta
- **Prioridad:** Alta
- **Objetivo:** Permitir registrar y administrar Empresas cliente con su identidad, estado, ubicación y configuraciones generales.
- **Módulos:** `EMP`
- **Se considera terminada cuando:** una Empresa cliente puede crearse, consultarse, actualizarse, suspenderse y reactivarse con aislamiento verificable respecto de otras empresas.

### Avance

<!-- generado:EPIC-001:inicio -->
**0/3 tareas completadas**

| Tarea | Tipo | Estado | Plan | Archivo |
|---|---|---|---|---|
| EMP-TASK-001 | Especificación | En curso | No aplica | `modulos\empresas\empresas.task.md` |
| EMP-TASK-002 | Implementación | Bloqueada | No aplica | `modulos\empresas\empresas.task.md` |
| EMP-TASK-003 | Implementación | Bloqueada | No aplica | `modulos\empresas\empresas.task.md` |
<!-- generado:EPIC-001:fin -->

## EPIC-002 — Acceso seguro multiempresa

- **Estado:** Propuesta
- **Prioridad:** Alta
- **Objetivo:** Permitir que cada Empresa cliente administre Usuarios, Cuentas de Empresa, roles, permisos, sesiones y dispositivos con acceso aislado y revocable.
- **Módulos:** `ACC`, `EMP`, `SUS`
- **Se considera terminada cuando:** la autenticación, autorización, revocación y resolución del contexto de Empresa funcionan de extremo a extremo y respetan los límites de la Suscripción de Empresa vigente.

### Avance

<!-- generado:EPIC-002:inicio -->
**0/4 tareas completadas**

| Tarea | Tipo | Estado | Plan | Archivo |
|---|---|---|---|---|
| ACC-TASK-001 | Especificación | En curso | No aplica | `modulos\identidad-acceso\identidad-acceso.task.md` |
| ACC-TASK-002 | Implementación | Bloqueada | No aplica | `modulos\identidad-acceso\identidad-acceso.task.md` |
| ACC-TASK-003 | Implementación | Bloqueada | No aplica | `modulos\identidad-acceso\identidad-acceso.task.md` |
| ACC-TASK-004 | Implementación | Bloqueada | No aplica | `modulos\identidad-acceso\identidad-acceso.task.md` |
<!-- generado:EPIC-002:fin -->

## EPIC-003 — Territorio productivo organizado

- **Estado:** Propuesta
- **Prioridad:** Alta
- **Objetivo:** Permitir administrar las Chacras, Lotes, superficies y geometrías pertenecientes a cada Empresa cliente.
- **Módulos:** `TER`, `EMP`
- **Se considera terminada cuando:** se pueden mantener Chacras y Lotes con ubicación geográfica e historial de cambios sin cruces entre empresas.

### Avance

<!-- generado:EPIC-003:inicio -->
**0/3 tareas completadas**

| Tarea | Tipo | Estado | Plan | Archivo |
|---|---|---|---|---|
| TER-TASK-001 | Especificación | En curso | No aplica | `modulos\territorio\territorio.task.md` |
| TER-TASK-002 | Implementación | Bloqueada | No aplica | `modulos\territorio\territorio.task.md` |
| TER-TASK-003 | Implementación | Bloqueada | No aplica | `modulos\territorio\territorio.task.md` |
<!-- generado:EPIC-003:fin -->

## EPIC-004 — Contexto productivo planificado

- **Estado:** Propuesta
- **Prioridad:** Alta
- **Objetivo:** Permitir organizar cultivos, variedades, implantaciones, campañas y ciclos productivos de cada Lote.
- **Módulos:** `CUL`, `TER`
- **Se considera terminada cuando:** la Empresa cliente puede describir qué produce, dónde lo produce y dentro de qué campaña y ciclo.

### Avance

<!-- generado:EPIC-004:inicio -->
**0/0 tareas completadas**

Sin tareas asociadas.
<!-- generado:EPIC-004:fin -->

## EPIC-005 — Personal y asistencia gestionados

- **Estado:** Propuesta
- **Prioridad:** Alta
- **Objetivo:** Permitir administrar Empleados, Capataces, cuadrillas, asistencia y tarifas sin exigir acceso al sistema a cada Empleado.
- **Módulos:** `PER`, `ACC`
- **Se considera terminada cuando:** el personal puede registrarse, organizarse y liquidarse operativamente, diferenciando Empleado de Usuario con acceso.

### Avance

<!-- generado:EPIC-005:inicio -->
**0/0 tareas completadas**

Sin tareas asociadas.
<!-- generado:EPIC-005:fin -->

## EPIC-006 — Labores de campo trazables

- **Estado:** Propuesta
- **Prioridad:** Alta
- **Objetivo:** Permitir planificar y registrar labores realizadas, responsables, recursos, cantidades y resultados en el campo.
- **Módulos:** `LAB`, `PER`, `TER`, `CUL`
- **Se considera terminada cuando:** una labor puede planificarse, ejecutarse, corregirse o anularse conservando responsables, ubicación e historial.

### Avance

<!-- generado:EPIC-006:inicio -->
**0/0 tareas completadas**

Sin tareas asociadas.
<!-- generado:EPIC-006:fin -->

## EPIC-007 — Inventario controlado

- **Estado:** Propuesta
- **Prioridad:** Alta
- **Objetivo:** Permitir gestionar Artículos, Almacenes, Existencias, partidas y movimientos con trazabilidad por Empresa cliente.
- **Módulos:** `INV`, `LAB`, `COM`, `COS`
- **Se considera terminada cuando:** cada entrada, salida, consumo, producción, ajuste y transferencia explica la Existencia disponible sin permitir stock cruzado entre empresas.

### Avance

<!-- generado:EPIC-007:inicio -->
**0/0 tareas completadas**

Sin tareas asociadas.
<!-- generado:EPIC-007:fin -->

## EPIC-008 — Terceros identificados

- **Estado:** Propuesta
- **Prioridad:** Media
- **Objetivo:** Permitir mantener proveedores, compradores, destinos y demás terceros relacionados con las operaciones de la Empresa cliente.
- **Módulos:** `TCE`
- **Se considera terminada cuando:** los terceros pueden reutilizarse de forma consistente en compras, entregas, ingresos y egresos.

### Avance

<!-- generado:EPIC-008:inicio -->
**0/0 tareas completadas**

Sin tareas asociadas.
<!-- generado:EPIC-008:fin -->

## EPIC-009 — Compras y recepciones trazables

- **Estado:** Propuesta
- **Prioridad:** Media
- **Objetivo:** Permitir registrar compras, recepciones y devoluciones vinculadas con proveedores e Inventario.
- **Módulos:** `COM`, `TCE`, `INV`, `ECO`
- **Se considera terminada cuando:** una compra puede recorrerse desde su registro hasta la recepción, el movimiento de Inventario y su obligación económica.

### Avance

<!-- generado:EPIC-009:inicio -->
**0/0 tareas completadas**

Sin tareas asociadas.
<!-- generado:EPIC-009:fin -->

## EPIC-010 — Observaciones de campo registradas

- **Estado:** Propuesta
- **Prioridad:** Media
- **Objetivo:** Permitir registrar observaciones generales, fenológicas y sanitarias con ubicación, evidencia y responsable.
- **Módulos:** `OBS`, `TER`, `CUL`, `ARC`
- **Se considera terminada cuando:** una observación de campo puede consultarse en su contexto productivo y conservar sus evidencias e historial.

### Avance

<!-- generado:EPIC-010:inicio -->
**0/0 tareas completadas**

Sin tareas asociadas.
<!-- generado:EPIC-010:fin -->

## EPIC-011 — Cosechas y entregas trazables

- **Estado:** Propuesta
- **Prioridad:** Alta
- **Objetivo:** Permitir registrar cosechas, pesajes, partidas obtenidas y entregas desde el Lote hasta su destino.
- **Módulos:** `COS`, `CUL`, `TER`, `INV`, `TCE`
- **Se considera terminada cuando:** cada cantidad cosechada puede relacionarse con su origen productivo, pesajes, Existencia resultante y entrega.

### Avance

<!-- generado:EPIC-011:inicio -->
**0/0 tareas completadas**

Sin tareas asociadas.
<!-- generado:EPIC-011:fin -->

## EPIC-012 — Economía de la empresa controlada

- **Estado:** Propuesta
- **Prioridad:** Media
- **Objetivo:** Permitir administrar obligaciones, pagos, cobros, gastos, ingresos y costos asociados con la actividad agropecuaria.
- **Módulos:** `ECO`, `COM`, `PER`, `COS`, `TCE`
- **Se considera terminada cuando:** la Empresa cliente puede explicar sus movimientos económicos y relacionarlos con las operaciones que los originaron.

### Avance

<!-- generado:EPIC-012:inicio -->
**0/0 tareas completadas**

Sin tareas asociadas.
<!-- generado:EPIC-012:fin -->

## EPIC-013 — Archivos privados vinculados

- **Estado:** Propuesta
- **Prioridad:** Media
- **Objetivo:** Permitir almacenar y vincular fotografías, comprobantes y otros archivos privados con los registros funcionales correspondientes.
- **Módulos:** `ARC`
- **Se considera terminada cuando:** los archivos poseen metadatos, autorización, integridad y ciclo de vida controlados sin exposición pública accidental.

### Avance

<!-- generado:EPIC-013:inicio -->
**0/0 tareas completadas**

Sin tareas asociadas.
<!-- generado:EPIC-013:fin -->

## EPIC-014 — Aplicación móvil operativa sin conexión

- **Estado:** Propuesta
- **Prioridad:** Alta
- **Objetivo:** Permitir que el Capataz registre operaciones desde el móvil con conectividad intermitente y sincronización posterior segura.
- **Módulos:** `SIN`, `ACC`, `LAB`, `PER`, `OBS`, `COS`
- **Se considera terminada cuando:** los comandos móviles admitidos se almacenan localmente, se sincronizan sin duplicados y resuelven conflictos según reglas explícitas.

### Avance

<!-- generado:EPIC-014:inicio -->
**0/0 tareas completadas**

Sin tareas asociadas.
<!-- generado:EPIC-014:fin -->

## EPIC-015 — Información gerencial disponible

- **Estado:** Propuesta
- **Prioridad:** Media
- **Objetivo:** Permitir al Administrador consultar indicadores y reportes operativos, productivos, laborales, de Inventario y económicos.
- **Módulos:** `REP`
- **Se considera terminada cuando:** los indicadores priorizados pueden consultarse por período y contexto con datos trazables hasta sus registros de origen.

### Avance

<!-- generado:EPIC-015:inicio -->
**0/0 tareas completadas**

Sin tareas asociadas.
<!-- generado:EPIC-015:fin -->

## EPIC-016 — Suscripciones de Empresa y límites comerciales administrados

- **Estado:** Propuesta
- **Prioridad:** Baja
- **Objetivo:** Permitir administrar los Planes de suscripción, las Suscripciones de Empresa, sus vigencias y los límites de recursos contratados por cada Empresa cliente.
- **Módulos:** `SUS`, `EMP`, `ACC`
- **Se considera terminada cuando:** los tres niveles comerciales pueden asignarse, cambiarse y aplicarse sin afectar la cantidad de Empleados registrados.

### Avance

<!-- generado:EPIC-016:inicio -->
**0/0 tareas completadas**

Sin tareas asociadas.
<!-- generado:EPIC-016:fin -->

## EPIC-017 — Maquinaria mantenida

- **Estado:** Propuesta
- **Prioridad:** Baja
- **Objetivo:** Permitir administrar maquinaria, lecturas de uso y mantenimiento preventivo y correctivo.
- **Módulos:** `MAQ`, `LAB`
- **Se considera terminada cuando:** cada equipo posee historial de utilización y mantenimiento relacionado con las labores en las que participó.

### Avance

<!-- generado:EPIC-017:inicio -->
**0/0 tareas completadas**

Sin tareas asociadas.
<!-- generado:EPIC-017:fin -->
