---
type: naming
status: Aprobado
owner: "Ingeniero"
---

# Nomenclatura

<!-- Qué define este archivo: doc/proceso/reglas-documentacion.md §3.
Un agente no inventa una convención que no esté aquí: si falta, pregunta. -->

## 1. Idioma

| Ámbito | Idioma | Notas |
|---|---|---|
| Documentación | Español | Con tildes y ñ. |
| Identificadores de código | Español | Sin tildes ni ñ; las APIs de librerías conservan su nombre oficial. |
| Base de datos | Español | Tablas, columnas, índices y restricciones sin tildes ni ñ. |
| API | Español | Rutas, campos JSON y parámetros sin tildes ni ñ. |
| Mensajes al usuario | Español | Con tildes y ñ. |
| Logs técnicos | Español | Sin secretos ni datos personales innecesarios. |
| Commits, ramas y solicitudes de cambio | Español | Se conservan IDs y nombres técnicos oficiales. |
| Palabras reservadas y APIs de librerías | Idioma original | No se traducen NestJS, TypeORM, PostgreSQL ni nombres de sus APIs. |

## 2. Escritura de identificadores en español

- Sin tildes: `descripcion`, `ubicacion`, `numero`.
- La ñ se reemplaza por `ni`: `anio`, `tamanio`, `contrasenia`.
- Sin abreviaturas salvo las de §5.
- Singular para entidades, objetos de valor y clases que representen un único concepto lógico.
- Plural para colecciones, tablas y rutas de recursos: `usuarios`, `cuentas_empresa`, `/usuarios`.
- Los nombres de negocio salen del **Nombre en código** de `glosario.md`.
- Una interfaz se nombra por la capacidad que ofrece, no con el prefijo `I`.
- Los nombres no incluyen el framework salvo que identifiquen una implementación concreta: `RepositorioUsuariosTypeOrm`.

## 3. Términos técnicos

| Concepto | Término usado | Ejemplo |
|---|---|---|
| Use case | Clase con verbo en infinitivo + objeto; archivo con sufijo `caso-de-uso` | `CrearUsuario` · `crear-usuario.caso-de-uso.ts` |
| Command | `Comando` + verbo + objeto | `ComandoCrearUsuario` |
| Query | `Consulta` + verbo + objeto | `ConsultaObtenerUsuario` |
| Repository | `Repositorio` + recurso plural | `RepositorioUsuarios` |
| Implementación de repositorio | Repositorio + tecnología | `RepositorioUsuariosTypeOrm` |
| Port | Nombre de la capacidad; se organiza en `puertos/entrada` o `puertos/salida` | `GeneradorTokens` |
| Adapter | Nombre de la implementación concreta | `GeneradorJwt` |
| Mapper | `Mapeador` + concepto | `MapeadorUsuario` |
| Controller | `Controlador` + recurso plural | `ControladorUsuarios` |
| DTO de entrada | `Solicitud` + verbo + objeto | `SolicitudCrearUsuario` |
| DTO de salida | `Respuesta` + concepto | `RespuestaUsuario` |
| Guard propio | `Guardia` + propósito | `GuardiaAutenticacion` |
| Domain event | Hecho en pasado | `UsuarioCreado` |
| Value object | Sustantivo del dominio | `CorreoElectronico` |
| Error de dominio | Causa precisa, sin sufijo HTTP | `LimiteAccesosAlcanzado` |
| Test | Mismo nombre base con sufijo `.spec.ts` | `crear-usuario.spec.ts` |

## 4. Reglas por elemento

| Elemento | Regla | Ejemplo |
|---|---|---|
| Carpeta de módulo | minúsculas, plural, guiones | `src/modulos/identidad-acceso/` |
| Capas | `dominio`, `aplicacion`, `infraestructura`, `presentacion` | `src/modulos/identidad-acceso/dominio/` |
| Áreas internas | minúsculas, plural, guiones | `dominio/cuentas-empresa/` |
| Clase / tipo | PascalCase | `Usuario`, `CrearUsuario` |
| Interfaz | PascalCase por capacidad, sin prefijo `I` | `RepositorioUsuarios` |
| Método / función | camelCase, verbo | `activarCuentaEmpresa` |
| Variable / atributo | camelCase | `empresaId` |
| Constante | MAYUSCULAS_CON_GUION_BAJO | `MAXIMO_USUARIOS_ACTIVOS` |
| Archivo de código | minúsculas, kebab-case y sufijo funcional cuando aporte contexto | `crear-usuario.caso-de-uso.ts` |
| Tabla | snake_case, plural | `usuarios`, `cuentas_empresa` |
| Columna | snake_case | `empresa_id`, `creado_en` |
| Clave foránea | `<entidad>_id` | `empresa_id` |
| Índice | `ix_<tabla>_<columnas>` | `ix_cuentas_empresa_empresa_id` |
| Restricción única | `uq_<tabla>_<columnas>` | `uq_empresas_cuit` |
| Ruta HTTP | `/api/v<N>/<recurso-plural>` en kebab-case | `/api/v1/usuarios/{id}` |
| Campo JSON | camelCase | `empresaId` |
| `operationId` | camelCase verbo + objeto | `crearUsuario` |
| Valor de enumeración | MAYUSCULAS, sin tildes ni ñ | `ACTIVO`, `SUSPENDIDO` |
| Código de error | `<PRE>_<CAUSA>` | `ACC_LIMITE_ACCESOS_ALCANZADO` |
| Evento | `<PRE>.<HechoEnPasado>.v<N>` | `ACC.UsuarioCreado.v1` |
| Prueba de regla | Incluye el ID de la regla | `PRE-BR-NNN rechaza acceso sobre el límite` |
| Prueba de aceptación | Conserva los tags del escenario | `@PRE-UC-NNN @AC-NN` |
| Rama | `plan/<PRE>-<NNNN>-<slug>` | `plan/PRE-NNNN-crear-empresa` |
| Commit | `<PLAN-ID> <Tnn>: <resumen en infinitivo>` | `PLAN-PRE-NNNN Tnn: crear entidad Empresa` |

## 5. Abreviaturas permitidas

| Abreviatura | Significado |
|---|---|
| `id` | Identificador |
| `api` | Interfaz de programación de aplicaciones |
| `dto` | Objeto de transferencia de datos |
| `jwt` | JSON Web Token |
| `cuit` | Clave Única de Identificación Tributaria |
| `uuid` | Identificador universal único |
| `url` | Localizador uniforme de recursos |
| `http` | Protocolo de transferencia de hipertexto |
| `sql` | Lenguaje de consulta estructurada |
| `orm` | Mapeo objeto-relacional |

Cualquier otra abreviatura requiere incorporarse explícitamente a esta tabla antes de usarse en nombres propios del proyecto.

## 6. Documentación

| Elemento | Regla | Ejemplo |
|---|---|---|
| Archivos de módulo | `<modulo>.<tipo>.md` | `identidad-acceso.requerimientos.md` |
| Planes y ADR | `<ID>-<slug>.md` | `PLAN-PRE-NNNN-crear-empresa.md` |
| Títulos de casos de uso | Verbo en infinitivo + objeto | Crear un usuario |
| Títulos de reglas | Sustantivo o frase corta | Límite de accesos activos |
| Términos | Siempre el canónico de `glosario.md` | Administrador, nunca admin |
