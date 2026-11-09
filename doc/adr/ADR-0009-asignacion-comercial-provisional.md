---
type: adr
id: ADR-0009
title: "Asignación comercial provisional para el alta de Empresas"
status: Aceptado
scope: ["EMP", "SUS"]
date: 2026-11-09
supersedes: null
---

# ADR-0009 — Asignación comercial provisional para el alta de Empresas

## Contexto

`EMP-Q-008` aprobó que la plataforma gestione una asignación comercial provisional hasta que exista SUS. El alta necesita verificarla mediante `EMP-DEP-002`. Este ADR propone cómo resolver esa dependencia para `EMP-UC-001`, dentro del modelo de `ADR-0008`.

## Alternativas

### A — Registro provisional persistente administrado por plataforma

- **Cómo funciona:** plataforma habilita de forma explícita un alias previsto antes del alta. Un proveedor externo a EMP consulta esa habilitación mediante un puerto y distingue confirmación, ausencia y falla técnica. El alias permite preparar la habilitación antes de que exista un identificador de Empresa.
- **A favor:** permite auditar la habilitación y migrar las asignaciones a SUS usando un identificador estable de EMP.
- **En contra:** exige un proveedor operativo, persistencia y un mecanismo autorizado para preparar las asignaciones.

### B — Lista de alias habilitados por configuración del despliegue

- **Cómo funciona:** un proveedor lee una lista explícita, administrada por plataforma, detrás del mismo puerto.
- **A favor:** evita crear una estructura persistente para el piloto.
- **En contra:** los cambios dependen del mecanismo de configuración del despliegue y la trazabilidad requiere evidencia externa.

## Decisión

- **Elegida:** A — Registro provisional persistente administrado por plataforma, verificado mediante puerto con simulación de dobles para pruebas aisladas de EMP.
- **Por qué:** permite auditar la habilitación comercial y reemplazar limpiamente el proveedor provisional cuando el módulo `SUS` asuma la operación, sin acoplar EMP a reglas comerciales.
- **Decidió:** Ingeniero — 2026-11-09.

## Consecuencias

- `PLAN-EMP-0001` verifica el contrato con dobles de prueba en el entorno de pruebas de EMP.
- La migración a SUS conciliará cada asignación provisional con la Empresa identificada por su alias y conservará su referencia de origen.
- La propuesta cubre el alta de EMP. La habilitación de sesiones y los cupos de ACC se concretarán bajo `ACC-DEP-002`.
- La integración prueba que una falla del proveedor impide el alta y se distingue de una asignación ausente.
