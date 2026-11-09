---
type: questions
module: "CUL"
---

# Contexto productivo — Preguntas

<!-- Las preguntas se registran después de analizar el brief del Ingeniero. -->

## CUL-Q-001 — Términos canónicos del contexto productivo

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`, `B-02`; arquitectura.md §4
- **Afecta:** glosario y especificación completa de `CUL`
- **Pregunta:** ¿Aprobás incorporar al glosario las definiciones propuestas de Cultivo, Variedad, Implantación, Campaña y Ciclo productivo?
- **Interpretaciones posibles:**
  - a) Cultivo identifica qué se produce; Variedad es una variante de un Cultivo; Implantación registra un Cultivo establecido en un Lote o sector durante una vigencia; Campaña agrupa la gestión de un período; Ciclo productivo vincula la evolución productiva de una Implantación dentro de una Campaña.
  - b) Usar Campaña y Ciclo productivo como sinónimos y conservar un único concepto.
  - c) Indicar otras definiciones.
- **Recomendación del agente:** opción a), porque mantiene separados el catálogo, la ocupación histórica del Lote y los períodos de gestión sin reescribir el pasado.
- **Respuesta:** Aprueba la opción a) y las definiciones propuestas.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-002 — Alcance de una Campaña y un Ciclo productivo

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`, `B-03`, `B-04`; `EPIC-004`
- **Afecta:** reglas, relaciones y casos de uso de Campaña y Ciclo productivo
- **Pregunta:** ¿Qué puede abarcar una Campaña y cómo se relaciona con los Ciclos productivos?
- **Interpretaciones posibles:**
  - a) Una Campaña pertenece a una Empresa cliente y puede agrupar varios Cultivos, Lotes e Implantaciones; cada Ciclo productivo pertenece a una Implantación concreta dentro de esa Campaña.
  - b) Una Campaña pertenece a un solo Cultivo, aunque incluya varios Lotes; cada Implantación participa mediante su Ciclo productivo.
  - c) Una Campaña pertenece a una sola Implantación o Lote y no existe un Ciclo productivo separado.
- **Recomendación del agente:** opción a), porque permite una campaña empresarial flexible sin perder el detalle productivo por Implantación.
- **Respuesta:** Una Campaña pertenece a una Empresa cliente. Su alcance puede componerse por Chacras completas y por Lotes específicos: seleccionar una Chacra incorpora todos sus Lotes; también se puede seleccionar una Chacra completa y determinados Lotes de otra, o trabajar solamente por Lotes.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-003 — Significado de volver a cero al iniciar una Campaña

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-04`
- **Afecta:** trazabilidad, consultas y cierre de campañas
- **Pregunta:** Cuando empieza una Campaña nueva, ¿“volver a cero” significa comenzar sin registros asociados, conservando íntegra y consultable la Campaña anterior?
- **Interpretaciones posibles:**
  - a) No se borra ni modifica nada anterior; las nuevas labores, cosechas, observaciones e indicadores comienzan en cero porque se asocian a la Campaña nueva. Las consultas muestran por defecto la vigente y permiten consultar las anteriores.
  - b) La Campaña anterior se archiva y deja de ser consultable por operación normal.
  - c) Los registros anteriores se reinician o eliminan.
- **Recomendación del agente:** opción a), por la trazabilidad exigida por la arquitectura y para que “cero” sea un nuevo contexto, no pérdida de historia.
- **Respuesta:** Aprueba la opción a): cada Campaña comienza sin registros propios y conserva íntegra y consultable la historia de las anteriores.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-004 — Dueño de labores, cosechas y reportes

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-03`, `B-04`; arquitectura.md §4; palabra ambigua “tareas” de glosario.md §3
- **Afecta:** dependencias de `CUL` con `LAB`, `COS`, `OBS` y `REP`
- **Pregunta:** ¿Con “tareas” te referís a Labores del campo? ¿Aprobás que `CUL` sea dueño de Campañas y Ciclos, mientras Labores, Observaciones y Cosechas conserven sus propios registros y los Reportes sean proyecciones filtradas por Campaña o Ciclo?
- **Interpretaciones posibles:**
  - a) Sí; cada módulo conserva sus datos y los enlaza con la Campaña, el Ciclo productivo o la Implantación correspondiente.
  - b) `CUL` copia dentro de la Campaña las labores, cosechas y resultados.
  - c) “Tareas” significa otra cosa que debe definirse.
- **Recomendación del agente:** opción a), porque respeta los dueños registrados en arquitectura y evita duplicar datos.
- **Respuesta:** Confirma que “tareas” se refiere a Labores y aprueba la opción a): cada módulo conserva sus propios datos y los enlaza con el contexto productivo correspondiente.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-005 — Ciclo de vida y simultaneidad de Campañas

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`, `B-03`, `B-04`; propuesta IA para completar el ciclo de vida
- **Afecta:** estados y operaciones de Campaña
- **Pregunta:** ¿Aprobás los estados BORRADOR, ACTIVA y CERRADA, permitiendo Campañas superpuestas si abarcan Ciclos productivos distintos y rechazando nuevos registros en una Campaña CERRADA?
- **Interpretaciones posibles:**
  - a) Aprobar; una reapertura excepcional requiere Administrador y queda auditada.
  - b) Permitir solo una Campaña ACTIVA por Empresa cliente.
  - c) Usar otros estados o reglas de superposición y reapertura.
- **Recomendación del agente:** opción a), porque distintos Cultivos pueden tener calendarios simultáneos y el cierre debe estabilizar sus resultados.
- **Respuesta:** Aprueba la opción a), incluidos los estados, la superposición por Ciclos distintos, el bloqueo de nuevos registros al cerrar y la reapertura excepcional y auditada.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-006 — Configuración por Empresa cliente y Lote

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-05`, `B-08`
- **Afecta:** Perfil de cultivo, precedencia y validaciones
- **Pregunta:** ¿Qué puede configurar la Empresa cliente y qué puede especializar cada Lote?
- **Interpretaciones posibles:**
  - a) Existe un Perfil base por Cultivo; la Empresa puede habilitar campos adicionales y ajustar obligatoriedad, unidad y límites permitidos; el Lote puede especializar esos valores. La precedencia es Lote → Empresa → perfil base, sin poder desactivar datos base obligatorios.
  - b) Empresa y Lote pueden crear cualquier campo libre sin un Perfil base.
  - c) Solo la Empresa configura y el Lote no especializa nada.
- **Recomendación del agente:** opción a), usando campos tipados y validados, porque ofrece flexibilidad sin convertir la configuración en datos libres imposibles de comparar.
- **Respuesta:** Aprueba la opción a), con precedencia Lote → Empresa cliente → Perfil base y sin permitir desactivar datos base obligatorios.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-007 — Vigencia de los Perfiles de cultivo

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-08`; propuesta IA para preservar trazabilidad
- **Afecta:** cambios de configuración e historial
- **Pregunta:** Cuando cambia la configuración de campos de un Cultivo, ¿los registros anteriores deben conservar la versión del Perfil con la que fueron capturados?
- **Interpretaciones posibles:**
  - a) Sí; los cambios generan una nueva versión aplicable hacia adelante y no reinterpretan campañas cerradas ni registros históricos.
  - b) La última configuración modifica también la lectura y validación de datos anteriores.
- **Recomendación del agente:** opción a), para que un cambio de campos o unidades no altere el significado histórico.
- **Respuesta:** Aprueba el versionado. Siempre se debe elegir un Perfil y no se puede volver atrás ni cambiar esa selección posteriormente dentro de las Campañas. El instante exacto y el nivel de la selección se precisan en `CUL-Q-013`.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-008 — Ubicación de los campos específicos de cada Cultivo

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-05`, `B-06`, `B-07`, `B-08`; arquitectura.md §4
- **Afecta:** Perfil de cultivo y dependencias con `COS`
- **Pregunta:** ¿Aprobás separar los campos por el hecho que describen, aunque el Perfil del Cultivo determine cuáles corresponden?
- **Interpretaciones posibles:**
  - a) Datos de establecimiento —por ejemplo Variedad, fecha, plantas, marco y superficie productiva— pertenecen a Implantación; datos de período pertenecen al Ciclo; pesajes, bolsas, cajones, calidad y descarte pertenecen a Cosechas. El Perfil define campos y validaciones, pero cada módulo conserva sus valores.
  - b) Todos los campos específicos se guardan directamente en el Cultivo o la Campaña.
  - c) Indicar otra clasificación.
- **Recomendación del agente:** opción a), porque “yerba mate” o “naranja” identifican el Cultivo, mientras las cantidades y calidades cambian en cada cosecha.
- **Respuesta:** Aprueba la opción a): los campos se separan según describan la Implantación, el Ciclo productivo o una Cosecha, y cada módulo conserva los valores que le pertenecen.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-009 — Primeros Cultivos y campos a definir

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-06`, `B-07`, `B-08`
- **Afecta:** perfiles iniciales de Cultivo
- **Pregunta:** ¿Los primeros Perfiles serán Yerba mate y Naranja? En el ejemplo de yerba, ¿“bolas” significa “bolsas”? Después necesitaremos enumerar para cada uno los campos, unidades, obligatoriedad y límites.
- **Interpretaciones posibles:**
  - a) Empezar por Yerba mate y Naranja; “bolas” significa “bolsas”.
  - b) Empezar por otros Cultivos o incluir más desde el inicio.
  - c) “Bolas” tiene otro significado productivo.
- **Recomendación del agente:** opción a) si esos son los dos primeros Cultivos reales; definir un Perfil por vez para no fijar datos agronómicos por suposición.
- **Respuesta:** No se fijan Yerba mate y Naranja como Perfiles obligatorios iniciales. El Administrador elige qué producirá cada Campaña según las Chacras y los Lotes incluidos; si una Chacra incluida tiene Lotes de Yerba mate, la Campaña se basa en esa producción. La posibilidad de incluir varios Cultivos y el término “bolas” se precisan en `CUL-Q-011` y `CUL-Q-012`.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-010 — Actores del módulo

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01` a `B-08`; propuesta IA porque el brief no asigna acciones a roles
- **Afecta:** matriz de permisos y casos de uso
- **Pregunta:** ¿Quién administra Cultivos, Perfiles, Implantaciones, Campañas y Ciclos productivos?
- **Interpretaciones posibles:**
  - a) SuperAdministrador mantiene Perfiles base; Administrador configura su Empresa y Lotes, y crea, activa, cierra o reabre Campañas; Capataz consulta el contexto y registra hechos operativos en sus módulos; Empleado solo participa en las operaciones que esos módulos le permitan.
  - b) El Administrador también crea desde cero los Perfiles base de Cultivo.
  - c) Indicar permisos diferentes por operación.
- **Recomendación del agente:** opción a), separando el catálogo base de plataforma de la adaptación de cada Empresa cliente.
- **Respuesta:** Aprueba la opción a): SuperAdministrador mantiene Perfiles base; Administrador configura su Empresa cliente, Lotes y Campañas; Capataz y Empleado operan según los permisos de los módulos dueños de cada hecho.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-011 — Varios Cultivos dentro de una Campaña

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `CUL-Q-002`, `CUL-Q-009`
- **Afecta:** alcance de Campaña y relación con Ciclos productivos y Perfiles
- **Pregunta:** Si el alcance elegido contiene Implantaciones de Cultivos diferentes, ¿una misma Campaña puede incluir varios Cultivos simultáneamente?
- **Interpretaciones posibles:**
  - a) Sí; la Campaña puede reunir varios Cultivos y cada Ciclo productivo identifica su Implantación, Cultivo y Perfil aplicable.
  - b) No; cada Campaña corresponde a un solo Cultivo y los Lotes con otros Cultivos quedan fuera aunque pertenezcan a una Chacra seleccionada.
  - c) El Administrador elige si la Campaña es de un Cultivo o multicultivo.
- **Recomendación del agente:** opción a), porque el alcance aprobado puede incorporar Chacras completas y la plataforma es multicultivo; los Ciclos conservan el detalle sin mezclar resultados.
- **Respuesta:** Aprueba la opción a): una Campaña puede reunir varios Cultivos; cada Ciclo productivo conserva su Implantación, Cultivo y Perfil aplicable.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-012 — Significado de “bolas” en Yerba mate

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-06`
- **Afecta:** futuro Perfil de Yerba mate
- **Pregunta:** En el ejemplo de Yerba mate, ¿qué significa exactamente “bolas” y en qué unidad se registra?
- **Interpretaciones posibles:**
  - a) Fue un error y significa bolsas.
  - b) Es otro concepto productivo; indicar su nombre, significado y unidad.
  - c) Retirar ese ejemplo y definir los campos cuando se trabaje el Perfil de Yerba mate.
- **Recomendación del agente:** opción c) si todavía no está definido; no conviene fijar un dato agronómico por interpretación.
- **Respuesta:** Aprueba la opción c): se retira “bolas” como ejemplo funcional y los campos se definirán cuando se trabaje el Perfil de Yerba mate.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-013 — Selección y bloqueo del Perfil

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `CUL-Q-007`, `CUL-Q-009`
- **Afecta:** Campaña, Ciclo productivo y versionado de Perfil
- **Pregunta:** ¿Aprobás que cada Ciclo productivo elija obligatoriamente una versión de Perfil y que esa elección quede inmutable al activar la Campaña, pudiendo cambiarse solo mientras está en BORRADOR?
- **Interpretaciones posibles:**
  - a) Sí; cada Ciclo elige una versión, se puede corregir en BORRADOR y queda bloqueada al activar la Campaña.
  - b) El Perfil se elige una sola vez para toda la Campaña.
  - c) La elección queda inmutable desde que se crea el Ciclo, incluso en BORRADOR.
- **Recomendación del agente:** opción a), porque una Campaña puede contener varios Cultivos o configuraciones por Lote y todavía necesita corregirse antes de empezar.
- **Respuesta:** Aprueba la opción a): cada Ciclo productivo elige obligatoriamente una versión de Perfil; puede corregirse mientras la Campaña está en BORRADOR y queda inmutable al activarla.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-014 — Lotes incorporados después de activar una Campaña

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `CUL-Q-002`
- **Afecta:** composición y trazabilidad del alcance de Campaña
- **Pregunta:** Si una Campaña ACTIVA incluye la Chacra A con los Lotes 1, 2 y 3, y después se crea el Lote 4 dentro de esa Chacra, ¿el Lote 4 debe entrar automáticamente en esa Campaña?
- **Interpretaciones posibles:**
  - a) No entra automáticamente. La Campaña conserva la lista inicial —Lotes 1, 2 y 3— y el Administrador puede agregar el Lote 4 explícitamente, dejando registro del cambio.
  - b) Sí. Como la Campaña incluye la Chacra A, todo Lote nuevo de esa Chacra entra automáticamente.
  - c) No entra y tampoco puede agregarse: habría que esperar a otra Campaña.
- **Recomendación del agente:** opción a), porque mantiene claro qué Lotes participaron desde el comienzo y permite ampliar el alcance de forma controlada.
- **Respuesta:** Aprueba la opción a): un Lote creado después no entra automáticamente; el Administrador puede incorporarlo explícitamente a la Campaña ACTIVA y el cambio queda auditado.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-015 — Administración del catálogo de Cultivos y Variedades

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `CUL-Q-001`, `CUL-Q-009`, `CUL-Q-010`; propuesta IA para completar el ciclo de vida
- **Afecta:** Cultivo, Variedad y permisos
- **Pregunta:** ¿Quién puede crear Cultivos y Variedades que todavía no existen en la plataforma?
- **Interpretaciones posibles:**
  - a) El SuperAdministrador mantiene un catálogo global de Cultivos y Variedades; el Administrador habilita los que usa su Empresa cliente y configura sus Perfiles por Empresa y Lote.
  - b) Cada Administrador puede crear Cultivos y Variedades privados para su Empresa cliente.
  - c) Existe catálogo global, pero el Administrador puede crear elementos privados hasta que un SuperAdministrador los normalice.
- **Recomendación del agente:** opción a), porque evita duplicados como “Naranja”, “naranja” o “Cítrico naranja” y mantiene comparables los datos entre Empresas cliente.
- **Respuesta:** Aprueba la opción a): el SuperAdministrador mantiene el catálogo global y el Administrador habilita y configura los Cultivos y Variedades usados por su Empresa cliente.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-016 — Datos mínimos y convivencia de Implantaciones

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`, `CUL-Q-001`; `TER-Q-011`
- **Afecta:** Implantación, vigencia y superposición dentro del Lote
- **Pregunta:** ¿Aprobás que una Implantación requiera Lote, Cultivo, fecha de inicio y superficie o sector diferenciable; permita Variedad opcional y fecha de finalización; y que dos Implantaciones activas del mismo Lote no puedan superponer la misma superficie?
- **Interpretaciones posibles:**
  - a) Aprobar; la suma de superficies activas tampoco puede superar la superficie vigente del Lote.
  - b) Aprobar los datos, pero permitir superficies superpuestas.
  - c) Indicar otros datos mínimos o reglas de convivencia.
- **Recomendación del agente:** opción a), porque hace verificable la coexistencia aprobada en Territorio y evita contar dos veces la misma superficie productiva.
- **Respuesta:** Aprueba la opción a), incluidos los datos mínimos, la Variedad y finalización opcionales, la prohibición de superponer superficies activas y el límite de la superficie vigente del Lote.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-017 — Datos mínimos de una Campaña

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`, `CUL-Q-002`, `CUL-Q-005`; propuesta IA de atributos
- **Afecta:** Campaña
- **Pregunta:** ¿Aprobás que una Campaña tenga nombre obligatorio de hasta 150 caracteres, descripción opcional de hasta 1000, fecha de inicio obligatoria, fecha de finalización opcional mientras no esté CERRADA y alcance territorial obligatorio?
- **Interpretaciones posibles:**
  - a) Aprobar esos datos y límites; el nombre elimina espacios exteriores y no necesita ser único.
  - b) El nombre debe ser único dentro de la Empresa cliente.
  - c) Indicar otros datos, límites o reglas.
- **Recomendación del agente:** opción a), porque dos Empresas o años pueden repetir nombres descriptivos y la identidad técnica no depende del nombre.
- **Respuesta:** Aprueba la opción a): nombre obligatorio de hasta 150 caracteres sin unicidad, descripción opcional de hasta 1000, fechas y alcance territorial obligatorio. La nota posterior sobre fechas se precisa en `CUL-Q-021`.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-018 — Cambios de alcance después de activar

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `CUL-Q-005`, `CUL-Q-014`
- **Afecta:** alcance territorial de Campaña
- **Pregunta:** Además de agregar Lotes explícitamente, ¿se pueden retirar Chacras o Lotes de una Campaña ACTIVA?
- **Interpretaciones posibles:**
  - a) Mientras está en BORRADOR se edita libremente; una vez ACTIVA se pueden agregar Lotes con auditoría, pero no retirar alcance. Para dejar de producir se finaliza el Ciclo correspondiente.
  - b) Se puede retirar un Lote ACTIVO si todavía no tiene hechos asociados en esa Campaña.
  - c) Se puede agregar y retirar alcance en cualquier momento con auditoría.
- **Recomendación del agente:** opción a), porque la composición histórica no debe desaparecer después de comenzar la operación.
- **Respuesta:** Aprueba la opción a): el alcance se edita libremente en BORRADOR; en ACTIVA se agregan Lotes explícitamente y con auditoría, pero no se retiran.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-019 — Tipos permitidos en un Perfil de cultivo

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-05` a `B-08`, `CUL-Q-006`, `CUL-Q-008`; propuesta IA para hacer verificable la configuración
- **Afecta:** Perfil de cultivo y campos configurables
- **Pregunta:** ¿Aprobás que un campo configurable declare código estable, nombre, descripción, destino funcional, tipo, obligatoriedad y validaciones?
- **Interpretaciones posibles:**
  - a) Los tipos iniciales son Texto, Entero, Decimal con unidad, Booleano, Fecha y Selección de catálogo; las validaciones admiten longitud, rango y valores permitidos. No se permite código ejecutable ni fórmulas libres.
  - b) Además se permiten fórmulas configurables por el Administrador.
  - c) Los campos son solamente textos libres.
- **Recomendación del agente:** opción a), porque cubre los ejemplos del brief con datos comparables y validables sin ejecutar lógica creada por usuarios.
- **Respuesta:** Aprueba la opción a), con campos tipados, validaciones verificables y sin código ejecutable ni fórmulas libres.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-020 — Condiciones para cerrar una Campaña

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `CUL-Q-003`, `CUL-Q-005`; propuesta IA para completar el ciclo de vida
- **Afecta:** Campaña y Ciclo productivo
- **Pregunta:** ¿Aprobás que una Campaña solo pueda cerrarse cuando todos sus Ciclos productivos estén finalizados y que al cerrarla se establezca su fecha de finalización?
- **Interpretaciones posibles:**
  - a) Aprobar; una reapertura auditada vuelve la Campaña a ACTIVA, pero no reabre automáticamente sus Ciclos.
  - b) Permitir cerrar la Campaña y finalizar automáticamente todos sus Ciclos activos.
  - c) Permitir cerrar aunque queden Ciclos activos.
- **Recomendación del agente:** opción a), porque evita cierres con producción todavía abierta y exige una decisión explícita sobre cada Ciclo.
- **Respuesta:** Aprueba la opción a): todos los Ciclos productivos deben estar finalizados; una reapertura auditada no los reabre automáticamente.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-021 — Dueño de las fechas estimada y real de finalización

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-09`, `B-10`, `B-11`; impacto en `COS`
- **Afecta:** Campaña, Ciclo productivo o Cosecha; límite entre `CUL` y `COS`
- **Pregunta:** Cuando indicás fecha de inicio, fecha tentativa de finalización y fecha real al cerrar, ¿hablás de la Campaña, del Ciclo productivo o literalmente de una Cosecha del módulo `COS`?
- **Interpretaciones posibles:**
  - a) Campaña: conserva fecha de inicio, fecha tentativa de finalización y fecha real de finalización al pasar a CERRADA.
  - b) Ciclo productivo: cada Ciclo conserva esas tres fechas; la Campaña deriva su período de los Ciclos.
  - c) Cosecha: la decisión corresponde al futuro módulo `COS`; `CUL` solo la registra como dependencia y no define esos campos.
  - d) Más de uno de los anteriores; indicar cuáles.
- **Recomendación del agente:** opción a) si “cosecha” fue un lapsus por “Campaña”; opción c) si te referías al proceso real de cosechar. No conviene elegirlo por contexto.
- **Respuesta:** Corrige la respuesta anterior y aprueba la opción d). La Campaña conserva fecha de inicio, fecha tentativa de finalización y fecha real al cerrar, para comparar lo estimado con lo real; abarca desde que comienza la preparación del suelo hasta la venta de los productos. Las Cosechas también tendrán sus propias fechas de inicio, fin estimado y fin real, definidas por `COS`.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (respuesta corregida)

## CUL-Q-022 — Detalles convencionales finales del modelo

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** propuesta IA para completar atributos y ciclos de vida no detallados en el brief
- **Afecta:** Cultivo, Variedad, Perfil de cultivo, Implantación y Ciclo productivo
- **Pregunta:** ¿Aprobás el paquete final de atributos, límites y estados convencionales propuesto en la especificación?
- **Interpretaciones posibles:**
  - a) Cultivo y Variedad usan código estable de hasta 50 caracteres, nombre hasta 150 y descripción opcional hasta 1000; se activan o inactivan sin borrado. Perfil usa nombre hasta 150, descripción hasta 1000, versión positiva y estados BORRADOR, PUBLICADO e INACTIVO. Implantación usa ACTIVA/FINALIZADA y Ciclo productivo BORRADOR/ACTIVO/FINALIZADO. Los registros históricos nunca se borran.
  - b) Aprobar con otros límites o estados, que deben indicarse.
  - c) No aprobar el paquete; definir cada elemento por separado.
- **Recomendación del agente:** opción a), porque completa el modelo con límites verificables, permite preparar Perfiles antes de usarlos y conserva toda la historia.
- **Respuesta:** Aprueba la opción a) y aprueba explícitamente la especificación completa de `CUL`.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03

## CUL-Q-023 — Variedades disponibles al habilitar un Cultivo

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `CUL-Q-015`, `CUL-BR-002`, `CUL-BR-003`; propuesta IA para concretar la habilitación.
- **Afecta:** futura especificación de habilitación; `CUL-UC-002`, `CUL-UC-003`, `CUL-TASK-002`.
- **Pregunta:** Cuando el Administrador habilita un Cultivo del catálogo global para su Empresa, ¿puede usar cualquiera de sus Variedades activas o debe seleccionar cuáles habilitar?
- **Interpretaciones posibles:**
  - a) Todas las Variedades activas del Cultivo habilitado quedan disponibles. La elección de Variedad sigue ocurriendo al registrar la Implantación.
  - b) El Administrador habilita individualmente las Variedades que usará su Empresa. Solo se pueden elegir Variedades activas del Cultivo que la Empresa haya habilitado.
- **Recomendación del agente:** a). Mantiene una sola habilitación por Empresa y Cultivo y evita exigir una configuración adicional para cada Variedad.
- **Respuesta:** «1a». Aprueba la opción a).
- **Respondida por / fecha:** Parodi Lucas / 2026-11-09

## CUL-Q-024 — Retiro de la habilitación de un Cultivo

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `CUL-Q-015`, `CUL-BR-003`, `CUL-BR-022`; propuesta IA para completar el ciclo de la habilitación.
- **Afecta:** futura especificación de habilitación; `CUL-UC-002`, `CUL-UC-003`, `CUL-TASK-002`.
- **Pregunta:** ¿Qué puede hacer el Administrador cuando su Empresa deja de usar un Cultivo habilitado?
- **Interpretaciones posibles:**
  - a) Puede deshabilitarlo y volver a habilitarlo. El retiro impide crear nuevos Perfiles e Implantaciones para ese Cultivo. Conserva la operación vigente y el historial sin cambiar estados de los registros que ya existen.
  - b) Puede deshabilitarlo solo cuando no tenga Implantaciones ni Ciclos activos. Puede volver a habilitarlo más adelante.
  - c) En la primera entrega solo se puede habilitar. El retiro queda para una entrega posterior.
- **Recomendación del agente:** a). Permite corregir una selección o dejar de incorporar un Cultivo, conservando la continuidad de lo ya registrado. Esta propuesta se limita a los usos definidos en `CUL-BR-003`; cualquier restricción adicional para Ciclos nuevos requiere una decisión propia.
- **Respuesta:** «2a». Aprueba la opción a).
- **Respondida por / fecha:** Parodi Lucas / 2026-11-09

## CUL-Q-025 — Inactivación de Perfiles y excepciones de mantenimiento

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `CUL-REQ-002`, `CUL-UC-002`, `CUL-BR-004` a `CUL-BR-006`, `CUL-BR-022`, `PLAN-CUL-0001` §7; propuesta IA.
- **Afecta:** cambio controlado de `CUL-UC-002` y su contrato.
- **Pregunta:** ¿Aprobás completar el caso de mantenimiento de Perfiles con la consulta de una versión para editar, la inactivación de una versión publicada y el código de error propio de cada regla?
- **Interpretaciones posibles:**
  - a) Incluir la consulta de una versión con los mismos permisos de mantenimiento y permitir que una versión publicada pase a inactiva para usos nuevos. Conservar su contenido y las referencias existentes. Usar `CUL_PERFIL_INCOMPATIBLE` para incompatibilidad de herencia o precedencia y `CUL_CAMPO_PERFIL_INVALIDO` para definiciones inválidas de campos.
  - b) Ajustar el alcance de la consulta o inactivación, o indicar cómo debe quedar la distinción entre los errores.
- **Recomendación del agente:** a). Completa el recorrido de mantenimiento y vincula cada rechazo a la regla que lo origina.
- **Respuesta:** «3a». Aprueba la opción a).
- **Respondida por / fecha:** Parodi Lucas / 2026-11-09
