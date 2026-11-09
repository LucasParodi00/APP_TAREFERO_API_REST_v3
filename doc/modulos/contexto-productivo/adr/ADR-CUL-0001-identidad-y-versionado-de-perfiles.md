---
type: adr
id: ADR-CUL-0001
title: "Identidad de línea y precedencia versionada de Perfiles"
status: Aprobado
scope: ["CUL"]
date: 2026-11-09
supersedes: null
---

# ADR-CUL-0001 — Identidad de línea y precedencia versionada de Perfiles

## Contexto

`CUL-ENT-003` exige versiones únicas por línea y referencia a una versión padre. `CUL-BR-004` establece la precedencia y `CUL-BR-006` protege la historia. Falta decidir cómo se identifica una línea y cómo se mantiene estable su cadena de padres.

## Alternativas

### A — Una línea por Cultivo y ámbito de aplicación

- **Cómo funciona:** la línea se identifica por Cultivo y alcance. Para EMPRESA incluye la Empresa y para LOTE incluye la Empresa y el Lote. Cada versión tiene un ID propio y referencia a la versión exacta de su padre. BASE es la raíz. La especialización por Lote usa la capa Empresa cuando corresponde y conserva la capa base a través de su cadena.
- **A favor:** permite resolver la precedencia sin elegir entre perfiles competidores dentro de un ámbito. Una Campaña puede conservar la referencia exacta que usó.
- **En contra:** ofrecer varias líneas alternativas para el mismo ámbito requeriría otra decisión funcional.

### B — Varias líneas con identificador propio en el mismo ámbito

- **Cómo funciona:** cada línea tiene identidad independiente. Al seleccionar un Perfil se informa explícitamente qué línea usar.
- **A favor:** permite ofrecer configuraciones alternativas dentro del mismo ámbito.
- **En contra:** exige definir qué línea se ofrece o aplica, cómo se selecciona su padre y qué hace el sistema cuando faltan selecciones.

## Decisión

- **Recomendación de origen IA:** A. Aplicar la precedencia sobre referencias a versiones concretas. Una edición posterior de un padre no cambia los datos efectivos de una versión publicada existente.
- **Decidió:** Ingeniero. Se adopta la alternativa A.

## Consecuencias si se acepta

- La asignación de la próxima versión se serializa por línea. La restricción de unicidad se aplica aunque haya solicitudes simultáneas y alcances con referencias opcionales.
- Al crear un borrador, se selecciona un padre publicado y compatible cuando corresponda. Antes de publicar se verifica la cadena, la compatibilidad y la conservación de los campos base obligatorios.
- La inactivación modifica el estado de disponibilidad para nuevos usos. Las referencias históricas siguen resolviendo el contenido y la cadena de la versión original.
- La fijación de la versión en un Ciclo se incorpora en su entrega, según `CUL-BR-007`.
