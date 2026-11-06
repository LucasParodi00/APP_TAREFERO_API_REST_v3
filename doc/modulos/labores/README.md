---
type: module-readme
module: "LAB"
normative: false
---

# Labores

> **Documento descriptivo.** Resume la especificación para lectura humana. No es fuente para decisiones: ante cualquier diferencia mandan `requerimientos`, `use-case` y `modelo-datos`. Se regenera cuando la especificación cambia.

## De qué se trata

Labores administra el catálogo de Tipos de Labor de cada Empresa, la planificación mediante Órdenes y el registro del trabajo realmente ejecutado. Un Tipo de Labor puede representar cosechar, cortar pasto o realizar mantenimiento y define el contexto y las magnitudes que exige. El catálogo se reutiliza entre Campañas; las Órdenes y ejecuciones pertenecen siempre a una Campaña concreta.

Una Orden puede cumplirse mediante varias ejecuciones. También se admite una ejecución directa para trabajo imprevisto. En cada ejecución se conservan participantes individuales, intervalos, cantidades, contribución porcentual, notas, evidencias y consumos declarados con su Almacén de origen. El Capataz opera el trabajo; el Administrador lo revisa y confirma.

LAB conserva hechos operativos, no importes. Personal es dueño de modalidades, tarifas, propuestas monetarias y devengos. Para un monto total distribuible, LAB propone partes iguales y permite al Administrador confirmar otra contribución con motivo; PER decide qué genera pago según la modalidad vigente de cada Empleado.

## Qué se puede hacer

| Quién | Qué | Detalle |
|---|---|---|
| Administrador | Administrar Tipos de Labor y asociar su configuración remunerativa | `LAB-UC-001`, `LAB-UC-002` |
| Administrador o Capataz | Crear y planificar Órdenes | `LAB-UC-003` |
| Administrador o Capataz | Modificar, completar o cancelar Órdenes | `LAB-UC-004` |
| Administrador o Capataz | Crear e iniciar ejecuciones planificadas o directas | `LAB-UC-005` |
| Capataz | Registrar participación individual | `LAB-UC-006` |
| Capataz | Declarar recursos, notas y evidencias | `LAB-UC-007` |
| Capataz | Modificar, pausar, reanudar, finalizar o cancelar trabajo | `LAB-UC-008` |
| Administrador | Revisar y confirmar ejecuciones | `LAB-UC-009` |
| Administrador | Corregir o anular hechos confirmados | `LAB-UC-010` |
| Administrador | Revisar la remuneración calculada por PER | `LAB-UC-011` |
| Administrador | Comparar asistencia | `LAB-UC-012` |
| Administrador o Capataz | Consultar historia operativa por Campaña | `LAB-UC-013` |
| Sistemas consumidores | Obtener hechos confirmados y sus correcciones | `LAB-UC-014` |

## Reglas principales

- Todo registro está aislado por Empresa y sus referencias deben pertenecer al mismo tenant (`LAB-BR-001`).
- Los Tipos de Labor tienen código inmutable, no se eliminan y se reutilizan entre Campañas (`LAB-BR-002`, `LAB-BR-003`).
- Toda Orden y ejecución lleva una Campaña inmutable; un cambio de Campaña requiere otro registro relacionado (`LAB-BR-004`, `LAB-BR-005`).
- Una Orden puede originar varias ejecuciones y una ejecución imprevista puede existir sin Orden (`LAB-BR-007`, `LAB-BR-008`).
- La Cuadrilla planificada nunca sustituye el detalle individual de quienes trabajaron realmente (`LAB-BR-012`).
- Los porcentajes distribuidos suman 100 % y cualquier ajuste administrativo conserva su motivo (`LAB-BR-016`).
- LAB conserva tiempos, cantidades y porcentajes; PER conserva tarifas, importes y devengos (`LAB-BR-017`, `LAB-BR-018`).
- Cada consumo se resuelve individualmente por INV y una ejecución puede confirmarse mostrando líneas pendientes o rechazadas (`LAB-BR-021`, `LAB-BR-022`).
- Una ejecución confirmada solo se corrige mediante otra versión o se anula con trazabilidad (`LAB-BR-025`).
- La Campaña nueva comienza sin hechos propios y nunca recibe hechos reasignados de una anterior (`LAB-BR-027`).

## Relación con otros módulos

- **Empresas:** identidad y pertenencia de la Empresa (`LAB-DEP-001`).
- **Contexto productivo:** Campaña obligatoria, Ciclo e Implantación (`LAB-DEP-002`).
- **Territorio:** Chacra y Lote donde se realiza el trabajo (`LAB-DEP-003`).
- **Personal:** Empleados, Cuadrillas, asistencia, tarifas y devengos (`LAB-DEP-004`).
- **Inventario:** Artículos, Unidades, Almacenes, Partidas y movimientos de consumo (`LAB-DEP-005`).
- **Archivos:** imágenes e informes privados (`LAB-DEP-006`).
- **Cosechas:** producción obtenida vinculada con el trabajo de cosechar (`LAB-DEP-007`).
- **Identidad y acceso:** roles, permisos y auditoría de actores (`LAB-DEP-008`).
- **Reportes:** indicadores calculados desde hechos por Campaña (`LAB-DEP-009`).
- **Maquinaria:** equipos utilizados cuando ese módulo sea activado (`LAB-DEP-010`).

## Qué no hace

- No administra fichas, Cuadrillas ni asistencia de Empleados.
- No conserva tarifas, importes devengados ni pagos.
- No modifica Campañas, Implantaciones, Chacras o Lotes.
- No mantiene existencias ni crea por sí mismo movimientos de Inventario.
- No almacena el contenido binario de imágenes o informes.
- No registra la producción, pesajes o entregas de una Cosecha.
- No almacena acumulados o reportes gerenciales reiniciables.

## Estado

La especificación fue aprobada por el Ingeniero el 06/11/2026. Contiene 27 reglas de negocio, 16 requerimientos, 10 dependencias, 14 casos de uso y 12 entidades. Las 22 preguntas fueron respondidas y no quedan preguntas abiertas. No se creó ningún plan ni se inició implementación.

Antes de planificar la integración remunerativa, la especificación de Personal deberá incorporar el monto total distribuible y el ajuste administrativo documentados por `LAB-DEP-004`. También deberá reconciliarse la dependencia histórica de Empresas que atribuía a LAB la propiedad de los montos, porque la decisión vigente asigna esa propiedad a PER.

## Archivos

| Archivo | Contenido |
|---|---|
| `labores.brief.md` | Descripción original del Ingeniero |
| `labores.preguntas.md` | Preguntas y respuestas |
| `labores.requerimientos.md` | Reglas, requerimientos y dependencias |
| `labores.use-case.md` | Casos de uso y permisos |
| `labores.modelo-datos.md` | Entidades y relaciones |
| `labores.task.md` | Tareas del módulo |
| `adr/` | Decisiones del módulo |
| `planes/` | Planes e historial de implementación |
