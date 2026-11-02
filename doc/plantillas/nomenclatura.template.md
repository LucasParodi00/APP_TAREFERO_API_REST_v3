---
type: naming
status: Propuesto
owner: "[Ingeniero]"
---

# Nomenclatura

<!-- Qué define este archivo: doc/proceso/reglas-documentacion.md §3.
Las celdas de "Regla" traen un valor recomendado; el ingeniero lo confirma o lo cambia antes de la fase de fundación. Un agente no inventa una convención que no esté aquí: si falta, pregunta. -->

## 1. Idioma

| Ámbito | Idioma | Notas |
|---|---|---|
| Documentación | Español | Con tildes y ñ |
| Identificadores de código (clases, métodos, variables, archivos, carpetas) | Español | Sin tildes ni ñ (§2) |
| Base de datos (tablas, columnas, índices) | Español | Sin tildes ni ñ |
| API (rutas, campos JSON, parámetros) | Español | Sin tildes ni ñ |
| Mensajes al usuario | Español | Con tildes y ñ |
| Logs técnicos | [Español] | |
| Commits, ramas y PR | Español | |
| Palabras reservadas del lenguaje y APIs de librerías | Las del lenguaje | No se traducen |

## 2. Escritura de identificadores en español

- Sin tildes: `descripcion`, `ubicacion`, `numero`.
- La ñ se reemplaza por `ni`: `anio`, `tamanio`. <!-- Alternativa: evitar la palabra (`ejercicio` en vez de `año`). Elegir una. -->
- Sin abreviaturas salvo las de §5.
- Singular para entidades y clases (`Lote`), plural para colecciones, tablas y rutas (`lotes`).
- Los nombres de negocio salen del **Nombre en código** de `glosario.md`.

## 3. Términos técnicos

<!-- Decide si los sufijos técnicos se traducen. Mantener la misma decisión en todo el proyecto. -->

| Concepto | Término usado | Ejemplo |
|---|---|---|
| Use case | `[CasoDeUso]` sufijo / verbo + objeto sin sufijo | `RegistrarLote` |
| Repository | `[Repositorio]` | `RepositorioLotes` |
| Port (in / out) | `[Puerto]` | `PuertoRegistrarLote` |
| Adapter | `[Adaptador]` | `AdaptadorPostgresLotes` |
| Controller | `[Controlador]` | `ControladorLotes` |
| DTO de entrada / salida | `[Solicitud]` / `[Respuesta]` | `SolicitudRegistrarLote` |
| Domain event | Hecho en pasado | `LoteRegistrado` |
| Value object | Sustantivo | `Medidas` |
| Error de dominio | `[Error]` + causa | `ErrorMedidaInvalida` |
| Test | `[nombre].test.[ext]` | `RegistrarLote.test.ts` |

## 4. Reglas por elemento

| Elemento | Regla | Ejemplo |
|---|---|---|
| Carpeta de módulo | minúsculas, plural, guiones | `src/modulos/lotes/` |
| Capas | `dominio`, `aplicacion`, `infraestructura`, `entrada` | `src/modulos/lotes/dominio/` |
| Clase / tipo | PascalCase | `Lote`, `RegistrarLote` |
| Método / función | camelCase, verbo | `asignarEncargado` |
| Variable / atributo | camelCase | `tipoSuelo` |
| Constante | MAYUSCULAS_CON_GUION_BAJO | `MAXIMO_LOTES_POR_ENCARGADO` |
| Archivo de código | [Igual que la clase / kebab-case] | `RegistrarLote.ts` |
| Tabla | snake_case, plural | `lotes`, `registros_tarea` |
| Columna | snake_case | `tipo_suelo`, `encargado_id` |
| Clave foránea | `<entidad>_id` | `lote_id` |
| Índice | `ix_<tabla>_<columnas>` | `ix_lotes_encargado_id` |
| Ruta HTTP | `/api/v<N>/<recurso-plural>` en kebab-case | `/api/v1/lotes/{id}/encargado` |
| Campo JSON | camelCase | `tipoSuelo` |
| `operationId` | camelCase verbo + objeto | `registrarLote` |
| Valor de enumeración | MAYUSCULAS | `ARCILLOSO` |
| Código de error | `<PRE>_<CAUSA>` | `LOT_MEDIDA_INVALIDA` |
| Evento | `<PRE>.<HechoEnPasado>.v<N>` | `LOT.LoteRegistrado.v1` |
| Prueba de regla | Incluye el ID | `LOT-BR-005 rechaza ancho cero` |
| Prueba de aceptación | Tag del escenario | `@LOT-UC-001 @AC-02` |
| Rama | `plan/<PRE>-<NNNN>-<slug>` | `plan/LOT-0001-registro-de-lotes` |
| Commit | `<PLAN-ID> <Tnn>: <resumen en infinitivo>` | `PLAN-LOT-0001 T01: crear entidad Lote` |

## 5. Abreviaturas permitidas

| Abreviatura | Significado |
|---|---|
| `id` | Identificador |
| `api` | Interfaz de programación |
| [Otra] | [Significado] |

Cualquier otra abreviatura está prohibida.

## 6. Documentación

| Elemento | Regla | Ejemplo |
|---|---|---|
| Archivos de módulo | `<modulo>.<tipo>.md` | `lotes.requerimientos.md` |
| Planes y ADR | `<ID>-<slug>.md` | `PLAN-LOT-0001-registro-de-lotes.md` |
| Títulos de casos de uso | Verbo en infinitivo + objeto | Registrar un lote |
| Títulos de reglas | Sustantivo o frase corta | Encargado obligatorio |
| Términos | Siempre el canónico de `glosario.md` | Administrador (nunca "admin") |
