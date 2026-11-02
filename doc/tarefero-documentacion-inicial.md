# Tarefero — Documento de visión, alcance y modelo de dominio

> **Estado:** documentación inicial de descubrimiento y análisis.  
> **Versión:** 0.1  
> **Propósito:** consolidar lo conversado sobre Tarefero, proponer entidades y campos candidatos, y dejar explícito qué decisiones están confirmadas, cuáles son propuestas y cuáles siguen pendientes.  
> **Importante:** este documento no es todavía un esquema definitivo de base de datos ni una especificación cerrada de API. Los nombres, campos, estados y relaciones deben validarse antes de implementarse.

---

## 1. Resumen del producto

**Tarefero** será una plataforma de gestión integral para establecimientos agrícolas. Su objetivo es ayudar a administrar la operación de campo, los recursos humanos, las labores, los insumos, el inventario, la producción y los costos, con información centralizada y trazable.

El primer enfoque será la **yerba mate**, pero el dominio debe ser adaptable a otros cultivos y actividades regionales, entre ellos:

- Citricultura.
- Nuez pecán.
- Tabaco.
- Té.
- Silvicultura.
- Otros cultivos permanentes o regionales de Argentina, Paraguay y países cercanos.

La solución debe servir tanto para operaciones pequeñas como para explotaciones con varias chacras, lotes, depósitos, cuadrillas y usuarios.

### 1.1 Objetivos principales

1. Registrar chacras y lotes con ubicación geográfica.
2. Visualizar y delimitar lotes sobre un mapa.
3. Administrar cultivos, campañas o ciclos productivos.
4. Planificar y registrar labores agrícolas.
5. Registrar asistencia y trabajo individual, incluso cuando una tarea la realiza una cuadrilla.
6. Controlar insumos, compras, proveedores, depósitos y movimientos de stock.
7. Registrar cosechas, cantidades producidas, entregas y destinos.
8. Registrar observaciones fenológicas, sanitarias y fotografías.
9. Obtener indicadores de rendimiento, costos y productividad.
10. Permitir que el personal de campo registre información desde Android aun sin conectividad.
11. Sincronizar los registros móviles con el backend sin duplicaciones ni pérdida silenciosa de información.
12. Mantener aislamiento estricto entre empresas clientes y auditoría de operaciones.

### 1.2 Principios de diseño

- **Multitenencia:** varias empresas clientes en una misma base de datos, con aislamiento estricto.
- **Configurabilidad:** los cultivos no comparten necesariamente las mismas etapas, unidades, labores o calendarios.
- **Trazabilidad:** los registros relevantes deben poder relacionarse con su origen, responsable, fecha y contexto.
- **Offline-first en campo:** la aplicación móvil debe permitir registrar trabajo sin conexión.
- **Integridad:** stock, movimientos, liquidaciones y datos históricos no deben alterarse de forma implícita.
- **Separación de responsabilidades:** la app móvil captura datos; el backend valida y calcula los resultados definitivos.
- **Evolución gradual:** empezar por los procesos esenciales y agregar módulos sin construir desde el inicio un sistema contable completo.
- **Auditoría:** las correcciones y acciones sensibles deben quedar registradas.

---

## 2. Decisiones confirmadas y decisiones pendientes

### 2.1 Confirmado

| Tema | Decisión |
|---|---|
| Nombre del producto | Tarefero |
| Enfoque inicial | Gestión agrícola, inicialmente yerba mate |
| Adaptabilidad | Debe contemplar otros cultivos regionales |
| Mapas | **Mapbox** como proveedor de mapas |
| Geometrías | PostgreSQL con PostGIS para almacenar y consultar geometrías |
| Backend | NestJS |
| Base de datos | PostgreSQL |
| ORM considerado | TypeORM |
| Arquitectura | Clean Architecture y programación orientada a objetos |
| Web administrativa | Next.js + TypeScript |
| App móvil de campo | Android nativo con Kotlin y Jetpack Compose como opción recomendada |
| Persistencia móvil | Room/SQLite |
| Sincronización móvil | WorkManager para reintentos y sincronización en segundo plano |
| Multitenencia | Base compartida, con `company_id` y controles estrictos de aislamiento |
| Infraestructura | Servidor propio del usuario con Docker; el diseño operativo se verá más adelante |
| Facturación electrónica | Fuera del MVP inicial |
| Alcance contable | Gestión administrativa y análisis de costos, no contabilidad formal completa |

### 2.2 Propuesta recomendada, aún sujeta a confirmación

- Campañas flexibles por establecimiento y cultivo, para no imponer un calendario anual universal.
- UUID para identificar operaciones creadas offline.
- Stock calculado a partir de movimientos, en lugar de editar manualmente una cantidad acumulada.
- Tarifas con vigencia e historial, preservando la tarifa aplicada a cada registro histórico.
- Separación entre asistencia diaria e imputación de horas a labores.
- Registro de compras separado de recepción de mercadería y pagos.
- Auditoría técnica separada del historial funcional de negocio.
- Costos definitivos calculados y validados por el backend.

### 2.3 Pendiente de definición

- Modelo definitivo de campañas y ciclos productivos.
- Modalidades salariales y reglas de liquidación que se soportarán.
- Flujo de aprobación de asistencia, labores, consumos, cosechas y liquidaciones.
- Política de resolución de conflictos offline por tipo de entidad.
- Catálogo de roles y permisos definitivos.
- Reglas de cierre y reapertura de períodos.
- Requisitos normativos y operativos específicos para fitosanitarios.
- Alcance de ventas, cobros, pagos y reportes financieros del MVP.
- Necesidad y prioridad de maquinaria, meteorología e integraciones externas.
- Definición agronómica concreta de etapas fenológicas por cultivo.

---

## 3. Usuarios y aplicaciones

### 3.1 Aplicación web administrativa

Orientada a propietarios, administradores y responsables de oficina/campo.

Funciones previstas:

- Administración de empresa, usuarios, roles y permisos.
- Configuración de cultivos, variedades, unidades y catálogos.
- Gestión de chacras, lotes y mapas.
- Gestión de empleados, cuadrillas y tarifas.
- Revisión de asistencia y labores sincronizadas.
- Compras, proveedores, depósitos, movimientos y existencias.
- Gestión de cosechas, producción y destinos.
- Registro de gastos e ingresos administrativos.
- Revisión y aprobación de registros, si se define ese flujo.
- Reportes, estadísticas y auditoría.

### 3.2 Aplicación móvil Android de campo

Orientada principalmente a capataces, encargados y personal autorizado.

Funciones previstas:

- Consultar chacras, lotes y cuadrillas asignados.
- Registrar asistencia y novedades.
- Crear y actualizar labores.
- Imputar horas por trabajador, no solo horas totales de la cuadrilla.
- Registrar superficie trabajada, producción y consumos.
- Adjuntar fotos, notas y observaciones de campo.
- Registrar observaciones fenológicas o sanitarias.
- Consultar el estado de sincronización.
- Continuar registrando cuando no hay internet.

La app móvil no debería ser el lugar principal para administrar pagos, contabilidad o configuraciones complejas.

---

## 4. Modelo general de organización y relaciones

Relaciones de alto nivel propuestas:

```text
Empresa
├── Usuarios / membresías / roles
├── Chacras
│   ├── Lotes
│   │   ├── Geometría geográfica
│   │   ├── Cultivos / plantaciones
│   │   ├── Campañas o ciclos
│   │   ├── Labores
│   │   ├── Cosechas / producción
│   │   └── Observaciones fenológicas y sanitarias
│   └── Depósitos
├── Empleados
│   ├── Historial de tarifas
│   ├── Pertenencia a cuadrillas
│   └── Asistencias
├── Cuadrillas
├── Labores
│   ├── Asignaciones de empleados / horas
│   ├── Insumos consumidos
│   ├── Maquinaria utilizada
│   └── Archivos / fotografías
├── Insumos / proveedores / compras
├── Movimientos de stock
├── Gastos / ingresos / pagos / cobros
└── Auditoría
```

La relación concreta entre cultivos, lotes, campañas y plantaciones debe definirse con cuidado. Un lote puede cambiar de cultivo o variedad a lo largo del tiempo; por eso no conviene asumir que su cultivo actual explica automáticamente todo su historial.

---

## 5. Convenciones sugeridas para las entidades

Estos son criterios de diseño iniciales, no una migración ya aprobada.

### 5.1 Campos comunes

En la mayoría de las entidades de negocio podría utilizarse:

| Campo | Tipo orientativo | Descripción |
|---|---|---|
| `id` | UUID | Identificador interno estable |
| `company_id` | UUID | Empresa propietaria del registro; requerido en datos tenant-scoped |
| `created_at` | timestamptz | Fecha y hora de creación |
| `created_by` | UUID nullable | Usuario creador, si aplica |
| `updated_at` | timestamptz | Última actualización |
| `updated_by` | UUID nullable | Usuario que realizó la última actualización |
| `deleted_at` | timestamptz nullable | Borrado lógico, solo cuando sea apropiado |
| `version` | integer, opcional | Control optimista de concurrencia |

No todas las entidades necesitan todos estos campos. Para registros financieros, movimientos de stock y auditoría, el borrado lógico o la edición directa pueden no ser adecuados: puede ser necesario anular o compensar mediante un nuevo registro.

### 5.2 Tipos y dinero

- Usar `numeric/decimal` para dinero, cantidades y mediciones donde la precisión sea importante; evitar `float` para importes monetarios.
- Guardar timestamps con zona horaria cuando corresponda.
- Guardar unidades explícitas junto a las cantidades.
- Evitar almacenar valores derivados que puedan quedar desactualizados; si se guardan como snapshot, documentar su finalidad.
- No usar latitud/longitud en grados para calcular directamente hectáreas.
- Definir precisión, redondeo y reglas de conversión por magnitud y unidad.

### 5.3 Campos de sincronización móvil

Las operaciones que puedan crearse offline deberían contemplar:

- `client_operation_id` o identificador UUID generado por el dispositivo.
- `device_id` o identificador lógico del dispositivo, si se decide gestionarlo.
- `client_created_at` para conservar la hora declarada por el dispositivo.
- `received_at` / `synced_at` en el servidor.
- Estado de sincronización gestionado en la base local, y estado de procesamiento/rechazo en el backend cuando corresponda.

La hora del dispositivo no debe tratarse como una fuente infalible ni reemplazar el reloj del servidor para auditoría.

---

## 6. Empresa, usuarios, acceso y seguridad

### 6.1 `companies` — Empresas clientes

Representa al cliente SaaS. No debe confundirse con el titular de una chacra ni con el CUIT de un proveedor.

Campos candidatos:

- `id`
- `legal_name`
- `trade_name`
- `tax_id` — CUIT u otro identificador fiscal
- `country_code`
- `timezone`
- `currency_code` — por ejemplo, ARS
- `status` — activa, suspendida, cerrada, etc.
- `created_at`
- `updated_at`

Pendiente: planes, límites, facturación del SaaS y configuración por país.

### 6.2 `users` — Usuarios de acceso

Campos candidatos:

- `id`
- `email`
- `password_hash` o identificador del proveedor de identidad
- `first_name`
- `last_name`
- `phone`
- `status`
- `last_login_at`
- `created_at`
- `updated_at`

No guardar contraseñas en texto plano. Definir verificación de email, recuperación de acceso, MFA si se requiere y política de sesión.

### 6.3 `company_memberships` — Membresía de usuario a empresa

Permite que la autorización sea explícita y facilita que una persona tenga acceso a una o más empresas si el producto lo permite.

Campos candidatos:

- `id`
- `company_id`
- `user_id`
- `status`
- `joined_at`
- `created_at`

Restricción candidata: combinación única `(company_id, user_id)`.

### 6.4 `roles`, `permissions`, `role_permissions`, `membership_roles`

Catálogo de roles y permisos. Roles inicialmente considerados:

- `ADMIN`
- `GERENTE`
- `ENCARGADO_STOCK`
- `ENCARGADO_CHACRAS`

Podrían sumarse `CAPATAZ`, `ENCARGADO_PERSONAL`, `CONSULTA` u otros, pero conviene definir permisos por acción y alcance antes de multiplicar roles.

Campos orientativos:

- `roles`: `id`, `company_id` nullable si los roles pueden ser globales o personalizados, `code`, `name`, `description`.
- `permissions`: `id`, `code`, `description`.
- `role_permissions`: `role_id`, `permission_id`.
- `membership_roles`: `membership_id`, `role_id`, y eventualmente alcance por chacra/depósito.

La API debe determinar la empresa desde el contexto autenticado y validar el acceso al recurso. No debe confiar en un `company_id` enviado libremente por el cliente.

### 6.5 Sesiones, dispositivos y auditoría de acceso

Entidades opcionales/recomendadas:

- `user_sessions`: usuario, membresía/empresa, fecha de creación, expiración, revocación, metadatos mínimos.
- `devices`: usuario/membresía, identificador lógico, plataforma, última sincronización, estado.
- `audit_logs`: actor, empresa, acción, entidad, identificador de entidad, fecha, origen (web/móvil), dispositivo y resultado.

No registrar contraseñas, tokens, secretos ni datos sensibles innecesarios en logs.

---

## 7. Geografía: chacras, lotes y Mapbox

### 7.1 `farms` — Chacras o establecimientos

Campos candidatos:

- `id`
- `company_id`
- `name`
- `code`
- `description`
- `owner_name` o referencia a una entidad titular, si se necesita distinguir al titular
- `owner_tax_id`
- `address`
- `locality`
- `province`
- `country_code`
- `latitude` / `longitude` como punto de referencia opcional
- `declared_area_ha`
- `contact_name`
- `contact_phone`
- `status`
- `created_at`
- `updated_at`

Notas:

- El CUIT de la empresa cliente SaaS es distinto del CUIT del titular del establecimiento.
- `declared_area_ha` es una declaración administrativa; no debe confundirse con el área calculada de los polígonos de lotes.
- Más adelante podría crearse `farm_owners` o una entidad `legal_entities` si se requiere registrar titulares, arrendatarios, administradores o contratos.

### 7.2 `lots` — Lotes

Campos candidatos:

- `id`
- `company_id`
- `farm_id`
- `name`
- `code`
- `description`
- `status` — activo, inactivo, en renovación, fuera de producción, etc.
- `geometry` — `geometry(Polygon/MultiPolygon, SRID)` en PostGIS, según la decisión espacial
- `mapped_area_ha` — superficie calculada a partir de la geometría, si se materializa
- `productive_area_ha` — superficie neta productiva declarada o calculada por una metodología explícita
- `soil_condition` — texto o catálogo, según el alcance
- `notes`
- `created_at`
- `updated_at`

Reglas y consideraciones:

- La geometría se dibuja y edita en el mapa con Mapbox.
- PostGIS almacena y consulta la geometría; Mapbox es el proveedor de visualización/interacción del mapa, no la base maestra de datos del lote.
- Validar geometrías vacías, inválidas, autointersectadas y polígonos degenerados.
- Calcular áreas con un método geodésico o una proyección adecuada; no calcular hectáreas multiplicando diferencias de grados.
- Diferenciar área total delimitada y superficie neta efectivamente productiva.
- Definir si los lotes pueden solaparse y cómo se detectan solapamientos.
- Definir la estrategia de edición del polígono y de conservación del historial de geometría.

### 7.3 `lot_geometry_versions` — Historial geométrico (opcional)

Si se necesita conocer cómo cambió un lote:

- `id`
- `company_id`
- `lot_id`
- `geometry`
- `area_ha`
- `valid_from`
- `valid_to`
- `changed_by`
- `change_reason`
- `created_at`

Otra opción es mantener auditoría de cambios sin duplicar toda la geometría; elegir según requisitos reales de trazabilidad.

### 7.4 Cultivo actual e historial del lote

No se recomienda que el lote tenga únicamente un `crop_id` permanente si puede cambiar de cultivo o variedad. Una entidad histórica ofrece más flexibilidad.

#### `crop_types` — Tipos de cultivo

- `id`
- `company_id` nullable si existe un catálogo global
- `name` — yerba mate, citrus, pecán, etc.
- `code`
- `description`
- `is_perennial`
- `status`

#### `crop_varieties` — Variedades

- `id`
- `company_id` nullable
- `crop_type_id`
- `name`
- `code`
- `description`
- `status`

#### `lot_plantings` — Implantaciones o ciclos de cultivo en un lote

- `id`
- `company_id`
- `lot_id`
- `crop_type_id`
- `crop_variety_id` nullable
- `planting_date` nullable
- `renewal_date` nullable
- `plant_count` nullable
- `row_spacing_m` nullable
- `plant_spacing_m` nullable
- `planting_frame_description` nullable
- `productive_area_ha` nullable
- `productive_status`
- `start_date`
- `end_date` nullable
- `notes`

Esta entidad permitiría conservar cultivos anteriores, replantes y renovaciones. Hay que definir si una plantación puede abarcar solo parte del lote.

---

## 8. Campañas y ciclos productivos

El concepto de campaña sigue pendiente. Se está considerando una alternativa flexible por establecimiento y cultivo para no forzar campañas exclusivamente anuales ni por cosecha.

### 8.1 `campaigns` — Campañas o ciclos

Campos candidatos:

- `id`
- `company_id`
- `farm_id` nullable
- `name`
- `code`
- `crop_type_id` nullable
- `start_date`
- `end_date` nullable
- `status` — planificada, activa, cerrada, cancelada
- `description`
- `created_at`
- `updated_at`

### 8.2 Relación entre campaña, lote y plantación

Alternativas a decidir:

1. Campaña vinculada a la chacra y al cultivo.
2. Campaña vinculada a varios lotes mediante `campaign_lots`.
3. Campaña relacionada con una `lot_planting`.
4. Ciclos productivos por lote para cultivos permanentes, coexistiendo con campañas administrativas.

Entidad candidata `campaign_lots`:

- `id`
- `company_id`
- `campaign_id`
- `lot_id`
- `lot_planting_id` nullable
- `planned_area_ha` nullable
- `notes`

No asumir que una campaña tiene un único lote o que todos los cultivos siguen el mismo calendario. También se debe decidir cómo registrar una cosecha que cruza fechas de campaña o pertenece a más de un ciclo.

---

## 9. Empleados, cuadrillas, asistencia y remuneraciones

### 9.1 `employees` — Empleados o trabajadores

Campos candidatos:

- `id`
- `company_id`
- `employee_code`
- `first_name`
- `last_name`
- `document_type`
- `document_number`
- `tax_id` / `cuil` nullable
- `phone`
- `address`
- `hire_date` nullable
- `termination_date` nullable
- `category_id` nullable
- `status`
- `emergency_contact` nullable
- `notes`
- `created_at`
- `updated_at`

El acceso a datos personales debe limitarse por permisos. Debe validarse qué datos son realmente necesarios para el producto y el marco legal aplicable.

### 9.2 `employee_categories` — Categorías laborales (opcional)

- `id`
- `company_id`
- `name`
- `code`
- `description`
- `status`

No asumir que una categoría interna reemplaza categorías o reglas legales aplicables.

### 9.3 `crews` — Cuadrillas

- `id`
- `company_id`
- `name`
- `code`
- `leader_employee_id` nullable
- `description`
- `status`

### 9.4 `crew_memberships` — Historial de integrantes de una cuadrilla

- `id`
- `company_id`
- `crew_id`
- `employee_id`
- `start_date`
- `end_date` nullable
- `role_in_crew` nullable

Así se evita que cambiar la composición actual de una cuadrilla modifique retrospectivamente quién integraba una cuadrilla en una fecha pasada.

### 9.5 `compensation_schemes` / `employee_rates` — Modalidades y tarifas

Las modalidades que se han contemplado son:

- Por hora.
- Por jornal.
- Mensual.
- Por hectárea.
- Por producción o rendimiento.
- Por tarea o acuerdo.
- Mixta.

Campos candidatos para un esquema de remuneración:

- `id`
- `company_id`
- `name`
- `compensation_type`
- `unit_code`
- `description`
- `status`

Campos candidatos para una tarifa con vigencia (`employee_rates`):

- `id`
- `company_id`
- `employee_id` nullable
- `employee_category_id` nullable
- `compensation_scheme_id`
- `amount`
- `currency_code`
- `valid_from`
- `valid_to` nullable
- `conditions` / parámetros adicionales
- `created_at`
- `created_by`

Puede haber tarifas por persona, categoría, labor o acuerdo. Las reglas exactas están pendientes.

**Regla histórica importante:** una labor o liquidación debe conservar la tarifa aplicada y los datos base utilizados al momento del cálculo. Cambiar una tarifa futura no debe recalcular automáticamente trabajos anteriores.

### 9.6 `attendance_records` — Asistencia diaria

- `id`
- `company_id`
- `employee_id`
- `work_date`
- `check_in_at` nullable
- `check_out_at` nullable
- `break_minutes` nullable
- `attendance_status` — presente, ausente, justificado, etc., según definición
- `recorded_by`
- `source` — web/móvil
- `notes`
- `approval_status` si se incorpora aprobación
- `client_operation_id` nullable para sincronización
- `created_at`
- `updated_at`

No se debe obligar a que una asistencia sea una sola franja horaria si el trabajo tiene múltiples entradas, pausas o turnos. Si esto es habitual, puede ser más apropiada una entidad de sesiones/intervalos de asistencia.

### 9.7 `attendance_intervals` — Intervalos de asistencia (opcional)

- `id`
- `company_id`
- `attendance_record_id`
- `start_at`
- `end_at` nullable
- `interval_type` — trabajo, descanso u otra categoría
- `notes`

### 9.8 Asistencia frente a horas imputadas

La asistencia responde **cuándo estuvo trabajando una persona**. La imputación a labores responde **en qué trabajo se empleó ese tiempo**.

Una persona puede registrar 8 horas de asistencia y repartirlas entre varias labores. El modelo debe permitir detectar diferencias y evitar doble imputación accidental.

---

## 10. Labores agrícolas

### 10.1 `work_types` — Tipos de labor configurables

Ejemplos:

- Poda.
- Cosecha.
- Fertilización.
- Aplicación fitosanitaria.
- Desmalezado.
- Carpida.
- Riego.
- Control de plagas.
- Mantenimiento de caminos.
- Replante o renovación.
- Otras tareas configurables.

Campos candidatos:

- `id`
- `company_id` nullable para catálogo global
- `name`
- `code`
- `description`
- `crop_type_id` nullable
- `default_compensation_type` nullable
- `requires_area` boolean
- `requires_quantity` boolean
- `requires_chemical_details` boolean
- `status`

Los requisitos de campos pueden variar por tipo de labor, pero las reglas deben validarse en backend.

### 10.2 `work_orders` — Órdenes de trabajo (opcional)

Para planificación previa:

- `id`
- `company_id`
- `farm_id`
- `lot_id` nullable
- `campaign_id` nullable
- `work_type_id`
- `title`
- `description`
- `planned_start_at`
- `planned_end_at` nullable
- `planned_area_ha` nullable
- `assigned_crew_id` nullable
- `priority`
- `status` — borrador, planificada, asignada, en ejecución, completada, cancelada
- `created_by`
- `approved_by` nullable

Puede aplazarse si el primer MVP solo registra labores ejecutadas.

### 10.3 `work_records` — Registro de labor ejecutada

Campos candidatos:

- `id`
- `company_id`
- `work_order_id` nullable
- `farm_id`
- `lot_id`
- `lot_planting_id` nullable
- `campaign_id` nullable
- `work_type_id`
- `crew_id` nullable
- `work_date`
- `started_at` nullable
- `finished_at` nullable
- `area_worked_ha` nullable
- `quantity` nullable
- `unit_code` nullable
- `status` — borrador, enviado, revisado, aprobado, rechazado, anulado; estados definitivos pendientes
- `recorded_by`
- `notes`
- `client_operation_id` nullable
- `created_at`
- `updated_at`

La superficie de la labor debe ser la superficie efectivamente intervenida, no asumir automáticamente que es la superficie total del lote.

### 10.4 `work_employee_entries` — Participación y tiempo por trabajador

- `id`
- `company_id`
- `work_record_id`
- `employee_id`
- `hours_worked` o `duration_minutes`
- `quantity_attributed` nullable
- `compensation_scheme_id` nullable
- `applied_rate` nullable
- `applied_rate_currency` nullable
- `calculation_snapshot` nullable
- `notes`

Ejemplo: si la tarea duró 8 horas de reloj y participaron tres personas con 8, 4 y 6 horas, el total es **18 horas-persona**, no 8. La duración de la labor y las horas individuales deben ser conceptos separados.

Si el pago es por producción, se debe definir cómo se reparte la producción entre trabajadores y cómo se evita atribuir la misma cantidad completa a cada integrante.

### 10.5 `work_material_consumptions` — Insumos usados en una labor

- `id`
- `company_id`
- `work_record_id`
- `product_id`
- `warehouse_id`
- `quantity`
- `unit_code`
- `stock_movement_id` nullable
- `recorded_at`
- `notes`

El consumo debe terminar vinculado a un movimiento de stock trazable. Un registro móvil sin sincronizar no significa que el stock central ya se haya descontado.

### 10.6 `work_machinery_usages` — Uso de maquinaria (futuro)

- `id`
- `company_id`
- `work_record_id`
- `machinery_id`
- `start_at` nullable
- `end_at` nullable
- `hours_used` nullable
- `distance_used_km` nullable
- `fuel_quantity` nullable
- `cost_snapshot` nullable
- `notes`

### 10.7 Costos de labor

Posibles componentes:

- Costo de mano de obra calculado a partir de las participaciones y reglas vigentes.
- Costo de insumos consumidos.
- Costo de maquinaria.
- Otros costos directos.
- Costo total.
- Costo por hectárea trabajada.
- Costo por unidad producida, si se dispone de datos fiables.

Debe distinguirse entre **estimación de gestión** y **liquidación laboral oficial**. Las reglas de liquidación deben revisarse con especialistas y según la normativa aplicable antes de presentarlas como cálculo legal.

---

## 11. Insumos, productos, unidades y stock

### 11.1 `product_categories` — Categorías de productos

Ejemplos:

- Fertilizantes y abonos.
- Herbicidas.
- Fitosanitarios.
- Combustible.
- Semillas y plantines.
- Herramientas.
- Repuestos.
- Elementos de protección personal.
- Materiales de riego.
- Otros.

Campos:

- `id`
- `company_id`
- `name`
- `code`
- `description`
- `status`

### 11.2 `products` — Insumos y artículos inventariables

- `id`
- `company_id`
- `category_id`
- `code`
- `name`
- `description`
- `brand` nullable
- `default_unit_id`
- `is_stock_tracked`
- `minimum_stock` nullable
- `status`
- `notes`

Campos especializados para fitosanitarios, si se incorporan:

- ingrediente activo
- formulación/concentración
- registro o identificador reglamentario
- unidad de aplicación
- indicaciones de seguridad y ficha técnica, según requisitos aplicables

No se deben inventar reglas agronómicas ni normativas. Los detalles específicos deben validarse con usuarios técnicos y normativa vigente.

### 11.3 `units_of_measure` — Unidades de medida

- `id`
- `code` — kg, g, L, mL, unidad, bolsa, cajón, etc.
- `name`
- `dimension` — masa, volumen, conteo, longitud, área, tiempo, etc.
- `precision`
- `is_base_unit`

### 11.4 `product_unit_conversions` — Conversiones

- `id`
- `company_id`
- `product_id` nullable para conversiones generales
- `from_unit_id`
- `to_unit_id`
- `factor`
- `valid_from`
- `valid_to` nullable

Ejemplo: una presentación de compra puede ser una bolsa de 25 kg, mientras que el consumo se registra en kg. Las conversiones deben ser explícitas y no permitir conversiones físicas inválidas, como convertir litros a kg sin una densidad o regla específica.

### 11.5 Lotes y vencimientos de productos

Si se necesita trazabilidad por lote comercial:

#### `product_batches`

- `id`
- `company_id`
- `product_id`
- `batch_code`
- `manufactured_at` nullable
- `expires_at` nullable
- `supplier_id` nullable
- `purchase_item_id` nullable
- `notes`

Las existencias deben poder consultarse por producto, depósito y, si aplica, lote comercial.

### 11.6 `warehouses` — Depósitos o almacenes

- `id`
- `company_id`
- `farm_id` nullable
- `name`
- `code`
- `address` nullable
- `responsible_employee_id` nullable
- `status`

### 11.7 `stock_movements` — Movimientos de stock

La existencia se deriva de movimientos aceptados; no se recomienda modificar una cifra de stock sin un movimiento explicativo.

Campos candidatos:

- `id`
- `company_id`
- `warehouse_id`
- `product_id`
- `product_batch_id` nullable
- `movement_type` — recepción, consumo, transferencia de salida, transferencia de entrada, devolución, ajuste, baja, etc.
- `quantity` — magnitud positiva con el sentido determinado por el tipo, o convención de signo uniforme documentada
- `unit_id`
- `occurred_at`
- `source_type`
- `source_id`
- `work_record_id` nullable
- `purchase_receipt_id` nullable
- `transfer_id` nullable
- `status` — pendiente, confirmado, anulado, según diseño
- `created_by`
- `notes`
- `client_operation_id` nullable

Decisiones técnicas a tomar:

- Convención de signo.
- Cómo se confirma y revierte un movimiento.
- Cómo se bloquea la concurrencia para evitar stock negativo involuntario.
- Cómo se realizan ajustes y quién puede autorizarlos.
- Si se usa una tabla de saldos materializados para acelerar consultas, manteniendo los movimientos como fuente de verdad.

### 11.8 `stock_transfers` — Transferencias entre depósitos

- `id`
- `company_id`
- `source_warehouse_id`
- `destination_warehouse_id`
- `status`
- `requested_at`
- `dispatched_at` nullable
- `received_at` nullable
- `created_by`
- `received_by` nullable
- `notes`

Detalle candidato `stock_transfer_items`:

- `id`
- `company_id`
- `transfer_id`
- `product_id`
- `product_batch_id` nullable
- `quantity`
- `unit_id`

Una transferencia no debe dejar stock duplicado: la salida y la entrada deben relacionarse y procesarse de forma consistente. Si hay recepción parcial, se necesita modelarla explícitamente.

---

## 12. Proveedores, compras y recepción de mercadería

### 12.1 `suppliers` — Proveedores

- `id`
- `company_id`
- `legal_name`
- `trade_name` nullable
- `tax_id` nullable
- `contact_name`
- `email`
- `phone`
- `address`
- `locality`
- `province`
- `country_code`
- `payment_terms` nullable
- `status`
- `notes`

### 12.2 `purchase_orders` / `purchases` — Compras

Puede utilizarse una entidad de compra simple al inicio y agregar órdenes de compra formales si hace falta planificación/aprobación previa.

Campos candidatos:

- `id`
- `company_id`
- `supplier_id`
- `purchase_number`
- `purchase_date`
- `currency_code`
- `status`
- `subtotal`
- `tax_total` nullable
- `total`
- `due_date` nullable
- `notes`
- `created_by`

### 12.3 `purchase_items` — Detalle de compra

- `id`
- `company_id`
- `purchase_id`
- `product_id`
- `description_snapshot`
- `quantity_ordered`
- `unit_id`
- `unit_price`
- `discount_amount` nullable
- `tax_amount` nullable
- `line_total`
- `quantity_received` derivada o mantenida con control explícito

La descripción y el precio histórico deben conservarse aunque cambie el catálogo de producto.

### 12.4 `purchase_receipts` — Recepción de mercadería

- `id`
- `company_id`
- `purchase_id`
- `warehouse_id`
- `received_at`
- `received_by`
- `status`
- `notes`

Detalle `purchase_receipt_items`:

- `id`
- `company_id`
- `purchase_receipt_id`
- `purchase_item_id`
- `product_id`
- `product_batch_id` nullable
- `quantity_received`
- `unit_id`

Una compra, su recepción física y su pago son hechos diferentes. No debe aumentarse el stock solo porque se registró una factura o se creó una compra, salvo que el flujo de negocio defina explícitamente una recepción automática.

---

## 13. Fenología, sanidad y observaciones de campo

### 13.1 `phenological_stages` — Etapas fenológicas

- `id`
- `company_id` nullable si existe catálogo global
- `crop_type_id`
- `code`
- `name`
- `description`
- `sort_order`
- `status`

Cada cultivo puede tener sus propias etapas. No se debe asumir que las etapas de yerba mate son iguales a las de citrus o pecán. El catálogo definitivo debe validarse con productores o profesionales agronómicos.

### 13.2 `field_observations` — Observaciones

Entidad general para observaciones de campo, con tipo o categoría.

- `id`
- `company_id`
- `farm_id`
- `lot_id`
- `lot_planting_id` nullable
- `observation_type` — fenológica, sanitaria, suelo, clima, general, etc.
- `observed_at`
- `phenological_stage_id` nullable
- `severity` nullable
- `description`
- `recorded_by`
- `source`
- `client_operation_id` nullable
- `created_at`

Puede convenir separar tablas de observaciones fenológicas y sanitarias si las validaciones y campos específicos se vuelven diferentes. El diseño debe permitir una observación puntual sin exigir fechas de inicio y fin.

### 13.3 `field_observation_attachments`

- `id`
- `company_id`
- `field_observation_id`
- `file_id`
- `caption` nullable

---

## 14. Cosechas, producción y entregas

### 14.1 `harvest_records` — Registros de cosecha

- `id`
- `company_id`
- `farm_id`
- `lot_id`
- `lot_planting_id` nullable
- `campaign_id` nullable
- `harvest_date`
- `crop_type_id`
- `quantity`
- `unit_id`
- `quality_grade` nullable
- `crew_id` nullable
- `destination_id` nullable
- `recorded_by`
- `status`
- `notes`
- `client_operation_id` nullable

### 14.2 `harvest_employee_entries` — Participación de trabajadores (opcional)

- `id`
- `company_id`
- `harvest_record_id`
- `employee_id`
- `quantity_attributed` nullable
- `hours_worked` nullable
- `notes`

Definir si las cosechas se registran como una cantidad global por lote/día o como partidas individuales, y cómo se vinculan con las labores y remuneraciones por producción para no contar dos veces la misma cantidad.

### 14.3 `production_destinations` — Destinos o compradores

- `id`
- `company_id`
- `name`
- `destination_type`
- `tax_id` nullable
- `contact_name` nullable
- `phone` nullable
- `address` nullable
- `status`

Puede representar secadero, acopiador, cooperativa, comprador u otro destino. Si se necesita administración comercial, convendría una entidad de clientes separada o una entidad común de terceros con roles.

### 14.4 `harvest_deliveries` — Entregas (si hay múltiples partidas)

- `id`
- `company_id`
- `harvest_record_id`
- `destination_id`
- `delivered_at`
- `quantity`
- `unit_id`
- `ticket_number` nullable
- `vehicle_reference` nullable
- `quality_grade` nullable
- `notes`

Una cosecha puede distribuirse entre varios destinos y un destino puede recibir varias partidas. La cantidad cosechada y la cantidad efectivamente entregada pueden diferir y deben poder conciliarse.

---

## 15. Maquinaria y mantenimiento (posible fase posterior)

### 15.1 `machinery` — Equipos y vehículos

- `id`
- `company_id`
- `farm_id` nullable
- `name`
- `code`
- `machinery_type`
- `brand`
- `model`
- `serial_number` nullable
- `purchase_date` nullable
- `status`
- `notes`

### 15.2 `machinery_readings` — Lecturas de uso

- `id`
- `company_id`
- `machinery_id`
- `reading_at`
- `hours_total` nullable
- `odometer_km` nullable
- `fuel_quantity` nullable
- `recorded_by`

### 15.3 `maintenance_records` — Mantenimiento

- `id`
- `company_id`
- `machinery_id`
- `maintenance_type`
- `performed_at`
- `next_due_at` nullable
- `next_due_hours` nullable
- `cost_amount` nullable
- `currency_code` nullable
- `supplier_id` nullable
- `notes`

Este módulo no necesita ser parte del primer MVP salvo que el uso de maquinaria sea una prioridad inmediata.

---

## 16. Gestión económica: gastos, ingresos, pagos y cobros

El objetivo inicial es conocer costos y movimientos administrativos. No se plantea construir desde el inicio un sistema contable completo.

### 16.1 `expense_categories` — Categorías de gasto

Ejemplos: combustible, servicios, reparaciones, fletes, alquileres, mano de obra, insumos y otros.

- `id`
- `company_id`
- `name`
- `code`
- `description`
- `status`

### 16.2 `expenses` — Gastos

- `id`
- `company_id`
- `expense_category_id`
- `farm_id` nullable
- `lot_id` nullable
- `campaign_id` nullable
- `supplier_id` nullable
- `expense_date`
- `description`
- `amount`
- `currency_code`
- `status`
- `source_type` nullable — compra, gasto directo, mantenimiento, etc.
- `source_id` nullable
- `created_by`
- `notes`

Se debe evitar contar el mismo costo varias veces: una compra de insumos, su pago, su recepción y su consumo son eventos distintos. El consumo puede generar costo de labor, mientras que la compra representa adquisición de inventario.

### 16.3 `income_records` — Ingresos

- `id`
- `company_id`
- `farm_id` nullable
- `lot_id` nullable
- `campaign_id` nullable
- `destination_id` nullable
- `income_date`
- `description`
- `quantity` nullable
- `unit_id` nullable
- `unit_price` nullable
- `amount`
- `currency_code`
- `status`
- `source_type` nullable
- `source_id` nullable
- `created_by`
- `notes`

Puede vincularse a ventas o entregas de producción, pero no toda entrega debe generar automáticamente un ingreso confirmado.

### 16.4 `payments` y `receipts` — Pagos y cobros

Una posible entidad común `cash_transactions` o tablas separadas según se necesite registrar contrapartes y conciliaciones.

Campos candidatos:

- `id`
- `company_id`
- `transaction_type` — pago/cobro
- `counterparty_type`
- `counterparty_id`
- `transaction_date`
- `amount`
- `currency_code`
- `payment_method`
- `reference`
- `status`
- `related_purchase_id` nullable
- `related_expense_id` nullable
- `related_income_id` nullable
- `notes`

Definir si se permiten pagos parciales, anticipos, saldos pendientes, medios de pago y conciliación. No inferir que una compra está pagada al crearla.

### 16.5 Costos indirectos y análisis de rentabilidad

A futuro pueden incorporarse reglas para distribuir costos indirectos por:

- Superficie productiva.
- Horas trabajadas.
- Cantidad producida.
- Uso de maquinaria.
- Porcentaje configurado.
- Otro criterio definido por la empresa.

Los informes deben mostrar la metodología y distinguir costos directos de costos asignados/estimados. Indicadores potenciales:

- Costo por lote.
- Costo por hectárea trabajada.
- Costo por kg o unidad producida.
- Rendimiento por hectárea.
- Consumo de insumos por lote/cultivo.
- Mano de obra por tipo de labor.
- Ingresos y margen bruto estimado por campaña/ciclo.

---

## 17. Archivos, fotos y documentos

### 17.1 `files` — Metadatos de archivos

- `id`
- `company_id`
- `storage_key`
- `original_filename`
- `mime_type`
- `size_bytes`
- `checksum`
- `uploaded_by`
- `uploaded_at`
- `status`
- `metadata` JSONB, solo para atributos auxiliares no estructurales

El archivo binario puede almacenarse fuera de PostgreSQL, mientras que la base guarda sus metadatos y relaciones. La tecnología concreta de almacenamiento se definirá junto con infraestructura.

### 17.2 Tablas de relación de archivos

Según la entidad, utilizar relaciones explícitas como:

- `work_record_attachments`
- `field_observation_attachments`
- `employee_documents` si se justifican documentos personales
- `purchase_attachments`
- `harvest_attachments`

Evitar que cualquier archivo pueda vincularse a cualquier entidad sin validación de permisos y tipo.

### 17.3 Fotos offline

La app debe guardar las fotos localmente con un identificador provisional y sincronizarlas por separado de los registros de texto. La operación de negocio no debería quedar en un estado imposible de recuperar si la subida de una foto falla; el estado de adjuntos debe ser visible y reintentable.

---

## 18. Sincronización offline y consistencia

### 18.1 Flujo general propuesto

1. El usuario registra una operación en Android.
2. La app guarda inmediatamente los datos en Room/SQLite.
3. Se asigna un UUID local a la operación.
4. La operación queda en una cola local de sincronización.
5. WorkManager intenta enviarla cuando existe conectividad.
6. El backend valida autenticación, empresa, permisos, referencias y reglas de negocio.
7. El backend procesa la operación de forma transaccional e idempotente.
8. Devuelve un resultado por operación: aceptada, ya procesada, rechazada o pendiente de resolución.
9. La app marca el estado y muestra errores corregibles.
10. Las fotos y otros archivos se sincronizan mediante un flujo complementario.

### 18.2 Requisitos

- Idempotencia: repetir un envío no crea duplicados.
- Confirmación individual por operación.
- Reintentos con espera progresiva.
- Cola persistente incluso si la app se cierra.
- Errores de validación visibles y comprensibles.
- No eliminar registros locales antes de tener confirmación durable.
- No reemplazar cambios nuevos del usuario con respuestas antiguas.
- Conflictos resueltos según la entidad, no con una regla global de “última escritura gana”.
- El servidor es la autoridad para consistencia central, permisos y stock.
- La hora local del dispositivo no basta como evidencia definitiva de orden cronológico.

### 18.3 Conflictos por entidad

Políticas candidatas a definir:

- Catálogos/configuración: el servidor puede ser fuente de verdad; la app necesita saber cuándo actualizar su copia.
- Asistencia/labores/observaciones: conservar el registro de origen, permitir corrección explícita y auditar cambios.
- Stock: movimientos validados por servidor; no aplicar cambios centrales de forma optimista sin reconciliación.
- Pagos/liquidaciones: no aceptar cambios sensibles sin reglas de autorización y estados definidos.
- Eliminaciones: evitar borrados silenciosos; utilizar anulación o resolución explícita cuando existan referencias.

### 18.4 Acceso offline

Una sesión revocada no puede conocerse inmediatamente en un dispositivo sin conexión. La estrategia debe equilibrar seguridad y operatividad: credenciales/tokens protegidos, período de uso offline acotado, reautenticación cuando sea posible y límites claros sobre qué operaciones puede realizar el usuario sin conectividad.

---

## 19. Estados, aprobaciones y correcciones

Se ha contemplado que algunas operaciones puedan requerir revisión o aprobación, pero el flujo no está cerrado.

Entidades/campos posibles:

- `approval_status` en registros que lo necesiten.
- `submitted_at`, `submitted_by`.
- `approved_at`, `approved_by`.
- `rejected_at`, `rejected_by`, `rejection_reason`.
- `voided_at`, `voided_by`, `void_reason`.

No todo registro requiere aprobación. Definir por módulo quién puede crear, enviar, revisar, aprobar, corregir, anular o reabrir.

Para registros con impacto económico o de stock, puede ser preferible anular y crear un registro compensatorio en lugar de modificar el pasado sin trazabilidad.

---

## 20. Auditoría e historial

### 20.1 `audit_logs`

Campos candidatos:

- `id`
- `company_id`
- `actor_user_id` nullable
- `action`
- `entity_type`
- `entity_id`
- `occurred_at`
- `source` — web, Android, proceso interno
- `device_id` nullable
- `request_id` nullable
- `result`
- `before_data` JSONB nullable
- `after_data` JSONB nullable
- `metadata` JSONB nullable

La auditoría técnica no es lo mismo que el historial funcional. Por ejemplo, el movimiento de stock es un registro de negocio; el log de auditoría explica quién lo generó, modificó o anuló.

Debe evitarse almacenar secretos, tokens o información personal innecesaria en los snapshots.

---

## 21. Reportes y estadísticas

Posibles reportes:

- Superficie por chacra, lote, cultivo y estado productivo.
- Mapa de lotes y consulta de ficha de lote.
- Labores por fecha, lote, cultivo, tipo y cuadrilla.
- Horas por empleado y tipo de labor.
- Asistencia y diferencias entre horas presentes e imputadas.
- Consumo de insumos por lote, campaña y labor.
- Existencia actual por depósito, producto y lote comercial.
- Movimientos, ajustes y transferencias de stock.
- Compras por proveedor, período y producto.
- Producción por lote, cultivo, fecha y campaña/ciclo.
- Rendimiento por hectárea.
- Entregas por destino y conciliación entre cosecha y entrega.
- Costos directos y estimados por lote, hectárea o unidad producida.
- Gastos e ingresos por período.
- Historial de observaciones fenológicas/sanitarias.

Los reportes deben indicar período, unidad de medida y metodología de cálculo. Las métricas derivadas deben respetar las relaciones históricas, las anulaciones y los cambios de tarifa.

---

## 22. API y arquitectura de software

### 22.1 Stack de referencia

- **Web:** Next.js + TypeScript.
- **API:** NestJS.
- **Base de datos:** PostgreSQL + PostGIS.
- **ORM:** TypeORM como opción considerada.
- **Validación:** DTOs y validaciones en backend.
- **Autenticación:** JWT/access token y estrategia de renovación/revocación a definir.
- **Móvil:** Kotlin + Jetpack Compose.
- **Base local:** Room/SQLite.
- **Sincronización:** WorkManager.
- **Mapas:** Mapbox.

### 22.2 Criterios arquitectónicos

- Clean Architecture y separación de dominio, aplicación, infraestructura y presentación.
- Reglas de negocio fuera de los controladores HTTP.
- Repositorios/interfaces cuando aporten desacoplamiento real.
- Validación de entrada y autorización en el backend.
- Transacciones para operaciones que afecten varias tablas.
- Restricciones e índices en base de datos como última línea de defensa.
- Idempotencia para operaciones móviles y procesos repetibles.
- Errores consistentes, sin exponer detalles internos.
- Aislamiento de tenant validado en todas las consultas y operaciones.
- Pruebas unitarias, de integración y de autorización/aislamiento.

### 22.3 PostGIS y mapas

- Usar geometrías georreferenciadas con SRID explícito.
- Definir el tipo espacial (`Polygon` o `MultiPolygon`) y reglas de validez.
- Considerar índices espaciales GiST.
- Usar Mapbox para visualización, dibujo y edición de geometrías.
- Mantener el dato oficial en la base de Tarefero, no únicamente en el proveedor cartográfico.
- Revisar términos, límites y costos vigentes del proveedor antes del despliegue comercial.

---

## 23. Seguridad y aislamiento multiempresa

Requisitos de base:

- Cada registro de negocio debe pertenecer a una empresa, directa o indirectamente.
- No confiar en `company_id` enviado por el cliente.
- Validar que cada FK relacionada pertenezca a la misma empresa.
- Diseñar consultas y repositorios para no cruzar datos entre tenants.
- Evaluar Row-Level Security de PostgreSQL como defensa adicional, no como sustituto de una autorización correcta.
- Proteger contraseñas mediante hashing adecuado; nunca guardarlas en claro.
- Access tokens de vida acotada, renovación segura y revocación de sesiones/dispositivos según necesidad.
- Rate limiting y protección de endpoints sensibles.
- Validación de DTOs y límites de tamaño de archivos.
- Control de acceso a datos personales y salariales.
- Auditoría de operaciones críticas.
- Backups, restauración y recuperación ante incidentes; detalle operativo pendiente de la etapa de infraestructura.
- Pruebas automatizadas de aislamiento entre empresas.

---

## 24. Entidades candidatas: catálogo consolidado

La lista es deliberadamente amplia; no significa que todas deban implementarse en el MVP.

### Plataforma y seguridad
- `companies`
- `users`
- `company_memberships`
- `roles`
- `permissions`
- `role_permissions`
- `membership_roles`
- `user_sessions`
- `devices`
- `audit_logs`

### Establecimientos y cultivos
- `farms`
- `lots`
- `lot_geometry_versions`
- `crop_types`
- `crop_varieties`
- `lot_plantings`
- `campaigns`
- `campaign_lots`

### Personal y trabajo
- `employees`
- `employee_categories`
- `crews`
- `crew_memberships`
- `compensation_schemes`
- `employee_rates`
- `attendance_records`
- `attendance_intervals`
- `work_types`
- `work_orders`
- `work_records`
- `work_employee_entries`
- `work_material_consumptions`
- `work_machinery_usages`

### Inventario y compras
- `product_categories`
- `products`
- `units_of_measure`
- `product_unit_conversions`
- `product_batches`
- `warehouses`
- `stock_movements`
- `stock_transfers`
- `stock_transfer_items`
- `suppliers`
- `purchases` o `purchase_orders`
- `purchase_items`
- `purchase_receipts`
- `purchase_receipt_items`

### Campo y producción
- `phenological_stages`
- `field_observations`
- `field_observation_attachments`
- `harvest_records`
- `harvest_employee_entries`
- `production_destinations`
- `harvest_deliveries`

### Maquinaria
- `machinery`
- `machinery_readings`
- `maintenance_records`

### Economía
- `expense_categories`
- `expenses`
- `income_records`
- `payments` / `receipts` o `cash_transactions`

### Archivos
- `files`
- Tablas de adjuntos específicas por entidad

---

## 25. Reglas de negocio críticas a preservar

1. **Aislamiento por empresa:** ninguna consulta debe permitir leer o modificar datos de otro tenant.
2. **Historial laboral:** las tarifas nuevas no cambian trabajos o liquidaciones anteriores.
3. **Horas individuales:** una labor grupal conserva las horas de cada trabajador.
4. **Asistencia ≠ labor:** tiempo presente e imputación a tareas son datos relacionados, pero distintos.
5. **Stock por movimientos:** las existencias deben explicarse por movimientos trazables.
6. **Compra ≠ recepción ≠ pago ≠ consumo:** cada evento tiene significado propio.
7. **Área del lote ≠ área trabajada:** los costos por hectárea deben usar la superficie realmente intervenida cuando corresponda.
8. **Cosecha ≠ entrega ≠ ingreso cobrado:** las cantidades y estados pueden diferir.
9. **Offline idempotente:** reenviar una operación no crea duplicados.
10. **No perder información:** un conflicto o rechazo de sincronización debe quedar visible y recuperable.
11. **Trazabilidad de cambios:** los registros críticos se corrigen o anulan de forma explícita.
12. **Configuración por cultivo:** no forzar etapas fenológicas, unidades ni ciclos idénticos para todos los cultivos.
13. **No usar coordenadas angulares para medir hectáreas:** utilizar cálculo geoespacial apropiado.
14. **Datos del dispositivo no son autoridad absoluta:** registrar tiempos del cliente y servidor por separado cuando sea relevante.

---

## 26. Roadmap inicial propuesto

### Fase 1 — Fundamentos y operación agrícola básica

- Empresas, usuarios, membresías, roles y permisos.
- Chacras, lotes, Mapbox y PostGIS.
- Cultivos, variedades e implantaciones.
- Empleados, cuadrillas y asistencia.
- Tipos y registros de labor.
- API base y aislamiento multiempresa.
- Auditoría básica y pruebas de integridad.

### Fase 2 — App móvil offline

- Persistencia local Room.
- Asistencia y labores.
- Horas individuales por trabajador.
- UUID local, cola de sincronización e idempotencia.
- Manejo de errores y conflictos.
- Fotos y adjuntos con reintentos.

### Fase 3 — Insumos y stock

- Productos, unidades y conversiones.
- Proveedores y compras.
- Recepción, depósitos y movimientos.
- Consumos asociados a labores.
- Transferencias y control de concurrencia.

### Fase 4 — Producción y seguimiento agronómico

- Campañas/ciclos una vez definida su semántica.
- Cosechas, entregas y destinos.
- Observaciones fenológicas y sanitarias.
- Fotos e historial por lote.

### Fase 5 — Gestión económica e indicadores

- Gastos, ingresos, pagos/cobros básicos.
- Costos laborales estimados.
- Costos por lote, hectárea y unidad producida.
- Reportes de productividad y rentabilidad estimada.

### Fase 6 — Extensiones

- Maquinaria y mantenimiento.
- Meteorología.
- Integraciones externas.
- Exportaciones e integraciones contables.
- Facturación electrónica, si se justifica y tras validar requisitos legales/técnicos.

El orden exacto debe revisarse según la prioridad comercial. Sin embargo, el aislamiento multiempresa, la trazabilidad, la idempotencia y la consistencia de stock conviene diseñarlos desde el principio.

---

## 27. Lista de decisiones para las próximas conversaciones

Se recomienda resolver una decisión por vez y registrar su estado en esta documentación.

1. **Campañas/ciclos productivos:** anual, por cosecha/ciclo, flexible por establecimiento/cultivo o posponer el módulo. La opción flexible se recomendó, pero aún no fue confirmada.
2. **Remuneraciones:** qué modalidades deben estar disponibles desde el MVP y cuáles solo se registran como datos.
3. **Aprobaciones:** qué registros requieren revisión, quién aprueba y si se puede corregir después.
4. **Asistencia:** entrada/salida simple o múltiples intervalos por día; cómo registrar pausas y turnos.
5. **Labores:** si se planifican órdenes de trabajo o inicialmente solo se registran labores ejecutadas.
6. **Cosecha:** registro por lote/día, por trabajador, por partida o combinación.
7. **Stock:** permitir stock negativo, cómo manejar faltantes y cómo aprobar ajustes.
8. **Compras:** compra directa o flujo de solicitud/orden/recepción.
9. **Pagos/cobros:** alcance administrativo inicial y manejo de pagos parciales.
10. **Offline:** cuánto tiempo puede operar un dispositivo sin reautenticarse y qué datos puede consultar.
11. **Permisos:** permisos generales o restricciones específicas por chacra, depósito y cuadrilla.
12. **MVP comercial:** qué módulos son imprescindibles para probar con los primeros clientes.

---

## 28. Glosario inicial

- **Empresa cliente:** organización que contrata y utiliza Tarefero.
- **Chacra / establecimiento:** unidad productiva o propiedad administrada.
- **Lote:** subdivisión geográfica u operativa de un establecimiento.
- **Plantación / implantación:** cultivo concreto establecido en un lote durante un período.
- **Campaña / ciclo productivo:** período de gestión asociado a un cultivo o producción; definición pendiente.
- **Labor:** actividad agrícola ejecutada o planificada.
- **Cuadrilla:** grupo de trabajadores que realiza tareas.
- **Asistencia:** registro de presencia/tiempo de un trabajador.
- **Horas-persona:** suma de las horas aportadas por cada trabajador.
- **Insumo:** producto consumible usado en la explotación.
- **Movimiento de stock:** evento que aumenta, reduce o traslada existencias.
- **Cosecha:** producción recolectada.
- **Entrega:** traslado o recepción de producción por un destino.
- **Costo estimado:** cálculo gerencial que puede diferir de una liquidación formal.
- **Tenant / multitenencia:** separación lógica entre empresas que usan una misma instancia del sistema.
- **Offline-first:** diseño en el que la aplicación puede trabajar localmente sin depender de una conexión permanente.

---

## 29. Cierre

Este documento consolida la visión y el modelo inicial de Tarefero, con especial atención a entidades, campos candidatos, relaciones y reglas de integridad. Debe tratarse como una **base viva de análisis**.

Próximo paso recomendado: continuar con las decisiones pendientes, actualizar este documento después de cada definición y, una vez estabilizado el dominio, separar la documentación en archivos más específicos, por ejemplo:

- `VISION.md`
- `DOMAIN_MODEL.md`
- `BUSINESS_RULES.md`
- `OFFLINE_SYNC.md`
- `SECURITY.md`
- `ROADMAP.md`

La definición final de tablas, índices, restricciones, endpoints y pantallas debería derivarse de esas decisiones, no adelantarse a ellas.
