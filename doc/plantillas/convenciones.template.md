---
type: conventions
status: Propuesto
owner: "[Ingeniero]"
---

# Convenciones técnicas

<!-- Qué define este archivo: doc/proceso/reglas-documentacion.md §3. -->

## 1. Tipos de datos

| Tipo | En la API | Regla |
|---|---|---|
| Identificador | string | [UUID v7] |
| Texto | string | Longitud máxima explícita |
| Entero | integer | Rango explícito |
| Decimal | [string / number] | Precisión, escala y unidad explícitas |
| Dinero | [Esquema] | Moneda ISO 4217 |
| Fecha | `YYYY-MM-DD` | Sin zona horaria |
| FechaHora | ISO 8601 | UTC |
| Booleano | boolean | |
| Enumeración | string en MAYUSCULAS | Valores en el modelo de datos del módulo |

En contratos: **requerido** (debe estar), **opcional** (puede omitirse) y **nullable** (puede ser `null`) no son sinónimos.

## 2. API

- **Especificación:** OpenAPI [versión], un archivo por módulo en `doc/modulos/<m>/contratos/openapi.yaml`
- **Versión:** en la ruta (`/api/v1/`)
- **Paginación:** [cursor / offset], tamaño por defecto [N], máximo [N]
- **Filtros y orden:** [sintaxis]; todo orden paginado tiene un desempate único
- **Idempotencia:** [mecanismo]
- **Concurrencia:** [campo `version` / ETag]
- **Trazabilidad:** cada operación declara `x-use-case` y `x-business-rules`

## 3. Errores

Formato [RFC 9457]:

```json
{
  "type": "about:blank",
  "title": "Medida inválida",
  "status": 422,
  "code": "LOT_MEDIDA_INVALIDA",
  "detail": "El ancho debe ser mayor que cero."
}
```

| Situación | HTTP |
|---|---|
| Regla de negocio incumplida | 422 |
| Sin permiso | 403 |
| No encontrado | 404 |
| Conflicto de concurrencia | 409 |
| Datos con formato inválido | 400 |

## 4. Eventos

- **Especificación:** AsyncAPI [versión]
- **Envoltorio:** [id, tipo, version, ocurridoEn, productor, correlacion, datos]
- **Entrega:** [al menos una vez]; los consumidores son idempotentes

## 5. Persistencia

- **Migraciones:** única fuente del esquema físico
- **Evolución:** agregar → migrar datos → quitar lo viejo
- **Borrado por defecto:** [lógico / físico]
- **Auditoría mínima:** [creado_en, creado_por, actualizado_en, actualizado_por]

## 6. Protección de datos

| Clasificación | Ejemplos | Controles |
|---|---|---|
| Público | | |
| Interno | | |
| Personal | | |
| Sensible | | |

- Secretos: [gestor]; nunca en código, documentación ni logs.

## 7. Requisitos no funcionales globales

| ID | Categoría | Requisito | Verificación |
|---|---|---|---|
| `NFR-GLOBAL-001` | [Rendimiento] | [Medible] | [Método] |

## 8. Comandos de calidad

| Control | Comando | Cuándo |
|---|---|---|
| Formato y lint | `[comando]` | Siempre |
| Tipos | `[comando]` | Siempre |
| Build | `[comando]` | Siempre |
| Pruebas de un módulo | `[comando] <modulo>` | Siempre |
| Pruebas de arquitectura | `[comando]` | Siempre |
| Integración | `[comando]` | Si toca persistencia o integraciones |
| Contratos | `[comando]` | Si toca la API |
| Documentación | `python tools/spec_lint.py doc` | Siempre |
