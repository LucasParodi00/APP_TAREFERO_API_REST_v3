# Tarefero — 02. Modelo de dominio y diccionario de campos

**Versión:** 1.0 · **Fecha:** 23 de octubre de 2026  
**Estado:** modelo lógico propuesto; campos candidatos, no migraciones definitivas.

## Responsabilidad de este archivo

Describe las entidades, para qué existen, qué significa cada campo, sus relaciones y reglas principales. Complementa el alcance del archivo 01, los flujos del 03 y la arquitectura del 04. Una entidad lógica no obliga a crear una tabla física independiente si la implementación puede conservar sus responsabilidades e integridad de otra forma.

## 1. Convenciones del diccionario

- `UUID`: identidad estable; `FK`: referencia a otra entidad. Todas las FK de negocio deben respetar la empresa.
- `texto`: cadena con longitud máxima a especificar; `código`: valor estable de catálogo; `decimal`: valor exacto con precisión a definir por magnitud.
- `fecha`: día de negocio; `instante`: fecha/hora con zona; `JSON`: estructura validada, no texto libre arbitrario.
- `R`: requerido; `O`: opcional; `C`: requerido según condición explicada. La condición puede cumplirse al confirmar, aunque el borrador esté incompleto.
- Los campos derivados se calculan; si se materializan deben conservar su fuente, método y consistencia.
- Las listas de estados son candidatas; las transiciones se describen en el archivo 03.
- Cada sección hereda los campos comunes aplicables de la sección 2. No se repiten en cada tabla para evitar inconsistencias.
- Catálogos globales son de solo lectura para empresas. Personalizaciones son registros de la empresa con referencia opcional al origen global. Un usuario de empresa no edita el catálogo de otra.
- Futuro significa extensión prevista, no requisito del primer MVP.

## 2. Campos comunes y perfiles de entidad

### 2.1 Identidad y pertenencia

| Campo | Tipo | Req. | Significado |
|---|---|---|---|
| `id` | UUID | R | Identidad estable; puede generarse en el dispositivo cuando la entidad admite creación offline. |
| `company_id` | UUID FK | R* | Empresa propietaria. Excepción: usuario global y catálogos explícitamente globales. El servidor lo obtiene del contexto autorizado. |
| `created_at` | instante | R | Creación en servidor; no sustituye la fecha efectiva del hecho. |
| `created_by` | UUID FK usuario | C | Autor de creación; un proceso del sistema debe identificar su origen. |

### 2.2 Perfil M — maestros editables

Se aplica a empresas (sin `company_id` propio), chacras, lotes, empleados, almacenes, artículos, terceros y configuraciones de empresa.

| Campo | Tipo | Req. | Significado |
|---|---|---|---|
| `updated_at` | instante | R | Último cambio persistido. |
| `updated_by` | UUID FK usuario | C | Actor del último cambio. |
| `version` | entero | R | Versión para evitar sobreescrituras concurrentes. |
| `deleted_at` | instante | O | Borrado lógico únicamente donde sea admisible; preferir inactivar maestros ya utilizados. |

### 2.3 Perfil H — hechos operativos

Se aplica a labores, asistencia, cosechas, observaciones, documentos y operaciones físicas/económicas. Los registros confirmados no se borran como si nunca hubieran existido.

| Campo | Tipo | Req. | Significado |
|---|---|---|---|
| `occurred_at` o fecha específica | instante/fecha | R | Momento efectivo del hecho, expresado por el campo propio de cada entidad. No duplicar ambos sin necesidad. |
| `recorded_by` | UUID FK usuario | R | Usuario responsable de la captura. |
| `source` | código | R | Web, Android, importación o proceso. |
| `version` | entero | R | Versión del registro para concurrencia. |
| `confirmed_at`, `confirmed_by` | instante, UUID | C | Momento y actor de confirmación cuando exista ese paso. |
| `voided_at`, `voided_by`, `void_reason` | instante, UUID, texto | C | Datos de anulación; deben acompañar el estado anulado. |
| `correction_of_id` | UUID FK misma entidad | O | Registro anterior que esta corrección sustituye; no aplica a todos los hechos. |

### 2.4 Perfil O — captura offline

Complementa H en entidades habilitadas para campo. No toda tabla necesita estos campos: los detalles pertenecen a una operación raíz idempotente.

| Campo | Tipo | Req. | Significado |
|---|---|---|---|
| `client_operation_id` | UUID | C | Clave de envío idempotente de una acción; no confundir con identidad del registro. |
| `device_id` | UUID FK | C | Dispositivo lógico que originó la operación. |
| `client_created_at` | instante | C | Hora declarada por dispositivo. |
| `received_at` | instante | C | Recepción del servidor. |
| `configuration_version_id` | UUID FK | C | Configuración usada para interpretar campos configurables. |

### 2.5 Valores y estados

Cantidades e importes usan decimales; dinero lleva moneda. Masa, volumen, conteo, superficie y tiempo no son intercambiables. Una cantidad estimada debe identificarse como tal. Los estados de sincronización son distintos de los estados de aprobación y de los estados físicos de una operación.


## 3. Plataforma y acceso

### `companies`

Cliente SaaS propietario de la información.  
**Perfil:** M; identidad sin company_id.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `legal_name` | texto | R | Razón social o denominación. |
| `trade_name` | texto | O | Nombre visible comercial. |
| `tax_id` | texto | O | Identificación fiscal; no reemplaza a los titulares de chacras. |
| `country_code` | código | R | País de referencia. |
| `timezone` | texto | R | Zona usada para fechas de negocio y visualización. |
| `currency_code` | código | R | Moneda principal de informes. |
| `status` | código | R | Activa, suspendida o cerrada. |

**Relaciones y reglas:** Una empresa tiene muchas chacras, membresías y operaciones. Suspender acceso no elimina su historial.

### `users`

Persona con credenciales de acceso; independiente del registro laboral.  
**Perfil:** M; global sin company_id.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `email` | texto | R | Identificador de acceso normalizado y único según política. |
| `identity_provider_subject` | texto | C | Identidad externa si se usa proveedor. |
| `password_hash` | texto | C | Hash si la autenticación es propia; nunca contraseña visible. |
| `first_name` | texto | R | Nombre. |
| `last_name` | texto | R | Apellido. |
| `phone` | texto | O | Contacto. |
| `status` | código | R | Activo o bloqueado. |
| `last_login_at` | instante | O | Último acceso confirmado. |

**Relaciones y reglas:** Puede tener membresías en varias empresas. Elegir autenticación propia o externa; no exigir ambos mecanismos.

### `company_memberships`

Acceso de un usuario a una empresa.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `user_id` | UUID FK | R | Usuario autorizado. |
| `status` | código | R | Invitada, activa, suspendida o revocada. |
| `joined_at` | instante | O | Inicio efectivo de acceso. |
| `employee_id` | UUID FK | O | Empleado de esta empresa asociado al usuario. |

**Relaciones y reglas:** Único por empresa y usuario. La vinculación laboral no concede permisos por sí misma.

### `roles`

Agrupación configurable de permisos.  
**Perfil:** M; catálogo de empresa.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | Identificador único dentro de la empresa. |
| `name` | texto | R | Nombre visible. |
| `description` | texto | O | Finalidad del rol. |
| `status` | código | R | Activo o inactivo. |

**Relaciones y reglas:** Los roles de sistema pueden usarse como plantillas; cada empresa solo modifica sus roles.

### `permissions`

Catálogo técnico de acciones disponibles.  
**Perfil:** Global; solo identidad y metadatos de sistema.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | Acción estable, por ejemplo stock.transfer.confirm. |
| `description` | texto | R | Qué permite hacer. |
| `module_code` | código | R | Módulo responsable. |

**Relaciones y reglas:** No editable arbitrariamente por el cliente: un permiso debe corresponder a una capacidad implementada.

### `role_permissions`

Asigna acciones a un rol.  
**Perfil:** Identidad y pertenencia.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `role_id` | UUID FK | R | Rol de la empresa. |
| `permission_id` | UUID FK | R | Acción del catálogo global. |

**Relaciones y reglas:** Combinación única rol-permiso.

### `membership_roles`

Asigna un rol a una membresía.  
**Perfil:** Identidad y pertenencia.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `membership_id` | UUID FK | R | Membresía receptora. |
| `role_id` | UUID FK | R | Rol de la misma empresa. |

**Relaciones y reglas:** Combinación única. Los alcances no deben ampliar lo concedido por el rol.

### `membership_scopes`

Restringe los recursos accesibles; extensión si el piloto requiere delegación.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `membership_id` | UUID FK | R | Membresía limitada. |
| `scope_type` | código | R | Empresa completa, chacra, almacén o cuadrilla. |
| `farm_id` | UUID FK | C | Chacra si ese es el alcance. |
| `warehouse_id` | UUID FK | C | Almacén si ese es el alcance. |
| `crew_id` | UUID FK | C | Cuadrilla si ese es el alcance. |

**Relaciones y reglas:** Una sola referencia pertinente por fila; ausencia de filas no debe interpretarse accidentalmente como acceso total.

### `user_sessions`

Control de sesiones y revocación.  
**Perfil:** Identidad; usuario global con contexto de membresía.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `user_id` | UUID FK | R | Usuario autenticado. |
| `membership_id` | UUID FK | O | Contexto seleccionado cuando corresponda. |
| `refresh_token_hash` | texto | C | Hash del token renovable si se utiliza. |
| `expires_at` | instante | R | Vencimiento. |
| `revoked_at` | instante | O | Revocación. |
| `device_id` | UUID FK | O | Dispositivo asociado. |

**Relaciones y reglas:** No guardar tokens en texto claro; el contexto de empresa se autoriza en cada operación.

### `devices`

Dispositivo lógico autorizado para uso de campo.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `membership_id` | UUID FK | R | Usuario y empresa a los que pertenece el registro lógico. |
| `installation_id` | UUID | R | Identidad de instalación; reinstalar genera otra identidad. |
| `name` | texto | O | Nombre reconocible. |
| `platform` | código | R | Android u otra plataforma admitida. |
| `last_sync_at` | instante | O | Última comunicación confirmada. |
| `status` | código | R | Activo, bloqueado o revocado. |

**Relaciones y reglas:** Cambiar de empresa debe aislar datos, colas y credenciales locales.

## 4. Territorio, cultivos e historia productiva

### `farms`

Chacra o establecimiento administrado.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | Código único de empresa. |
| `name` | texto | R | Nombre de la chacra. |
| `description` | texto | O | Descripción operativa. |
| `owner_name` | texto | O | Titular declarado; sustituible a futuro por relación explícita. |
| `owner_tax_id` | texto | O | Identificación del titular. |
| `address` | texto | O | Dirección o acceso. |
| `locality` | texto | O | Localidad. |
| `province` | texto | O | Provincia o región. |
| `country_code` | código | R | País. |
| `reference_point` | punto geográfico | O | Ubicación de referencia. |
| `declared_area_ha` | decimal | O | Superficie administrativa declarada. |
| `contact_name` | texto | O | Contacto de establecimiento. |
| `contact_phone` | texto | O | Teléfono de contacto. |
| `status` | código | R | Activa o inactiva. |

**Relaciones y reglas:** No confundir titular con empresa SaaS. Geometría detallada se conserva en lotes.

### `lots`

División territorial u operativa estable.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `farm_id` | UUID FK | R | Chacra propietaria del lote. |
| `code` | código | R | Código único dentro de la chacra. |
| `name` | texto | R | Nombre visible. |
| `geometry` | Polygon/MultiPolygon | O | Delimitación georreferenciada; opcional mientras no se dibuje. |
| `mapped_area_ha` | decimal derivado | O | Área cartográfica calculada con método apropiado. |
| `productive_area_ha` | decimal | O | Superficie neta productiva de referencia. |
| `soil_notes` | texto | O | Descripción práctica del suelo. |
| `status` | código | R | Activo, inactivo o fuera de uso. |
| `notes` | texto | O | Observaciones territoriales. |

**Relaciones y reglas:** No contiene un cultivo permanente. Estados agronómicos de una plantación pertenecen a la implantación.

### `lot_geometry_versions`

Conserva delimitaciones anteriores si los cambios afectan el historial.  
**Perfil:** Identidad y pertenencia; historial.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `lot_id` | UUID FK | R | Lote modificado. |
| `geometry` | Polygon/MultiPolygon | R | Geometría de la versión. |
| `area_ha` | decimal | R | Área calculada de esa versión. |
| `valid_from` | instante | R | Inicio de vigencia. |
| `valid_to` | instante | O | Fin; abierto para versión vigente. |
| `change_reason` | texto | R | Motivo de cambio. |
| `changed_by` | UUID FK | R | Responsable. |

**Relaciones y reglas:** No permitir vigencias incompatibles para la misma geometría oficial. Operaciones anteriores conservan superficie aplicada o versión relevante.

### `crop_groups`

Agrupación operativa del catálogo, sin pretender taxonomía científica.  
**Perfil:** M; global o empresa, según política de catálogo.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | Código estable. |
| `name` | texto | R | Por ejemplo cítricos. |
| `description` | texto | O | Criterio de agrupación. |

**Relaciones y reglas:** Un grupo reúne cultivos; no reemplaza la identidad concreta de naranja o limón.

### `crops`

Identidad del cultivo.  
**Perfil:** M; global o empresa, según política de catálogo.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `crop_group_id` | UUID FK | O | Grupo organizador. |
| `code` | código | R | Código estable. |
| `name` | texto | R | Yerba mate, naranja, limón o pecán. |
| `is_perennial` | booleano | R | Indica permanencia como característica orientativa. |
| `status` | código | R | Disponible o inactivo. |

**Relaciones y reglas:** Equivale al crop_types del documento inicial. Un catálogo global no permite operaciones entre empresas.

### `crop_varieties`

Variedad de un cultivo.  
**Perfil:** M; global o empresa, según política de catálogo.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `crop_id` | UUID FK | R | Cultivo al que pertenece. |
| `code` | código | O | Código de catálogo. |
| `name` | texto | R | Denominación de variedad. |
| `description` | texto | O | Información complementaria. |
| `status` | código | R | Disponible o inactiva. |

**Relaciones y reglas:** Validar compatibilidad con cultivo de implantación.

### `lot_plantings`

Implantación concreta en un lote durante un período.  
**Perfil:** M con cambios históricos controlados.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `lot_id` | UUID FK | R | Lote donde está implantada. |
| `crop_id` | UUID FK | R | Cultivo establecido. |
| `main_variety_id` | UUID FK | O | Variedad principal si se conoce. |
| `code` | código | R | Identificador operativo de implantación. |
| `established_at` | fecha | O | Fecha real de plantación, si se conoce. |
| `valid_from` | fecha | R | Inicio de vigencia en el sistema; no inventa fecha de plantación. |
| `valid_to` | fecha | O | Fin de la implantación. |
| `productive_area_ha` | decimal | O | Superficie ocupada/productiva definida. |
| `initial_plant_count` | entero | O | Cantidad inicial conocida. |
| `row_spacing_m` | decimal | O | Distancia entre filas. |
| `plant_spacing_m` | decimal | O | Distancia entre plantas. |
| `sector_name` | texto | C | Sector si coexisten implantaciones en el mismo lote. |
| `sector_geometry` | geometría | O | Delimitación del sector cuando se necesite. |
| `productive_status` | código | R | En formación, productiva, en renovación o finalizada. |
| `crop_profile_version_id` | UUID FK | R | Perfil publicado de referencia. |
| `notes` | texto | O | Detalles de implantación. |

**Relaciones y reglas:** No cambiar cultivo para representar una sustitución: finalizar y crear otra implantación. Coexistencia exige distinguir superficies y evitar doble conteo.

### `planting_varieties`

Detalle de variedades; ampliación para implantaciones mixtas.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `lot_planting_id` | UUID FK | R | Implantación. |
| `crop_variety_id` | UUID FK | R | Variedad compatible. |
| `plant_count` | entero | O | Cantidad atribuida. |
| `area_ha` | decimal | O | Superficie atribuida cuando sea medible. |
| `role` | código | O | Función operativa declarada. |
| `valid_from` | fecha | R | Inicio de vigencia. |
| `valid_to` | fecha | O | Fin. |

**Relaciones y reglas:** La variedad principal debe ser coherente con el detalle si ambos mecanismos se utilizan. No exigir porcentajes sin información real.

### `planting_events`

Cambios físicos relevantes de la implantación.  
**Perfil:** H; O si se habilita.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `lot_planting_id` | UUID FK | R | Implantación afectada. |
| `event_type` | código | R | Replante, baja, renovación parcial o cambio de estado. |
| `event_date` | fecha | R | Fecha efectiva. |
| `plant_count_delta` | entero con signo | C | Altas positivas o bajas negativas. |
| `affected_area_ha` | decimal | O | Superficie intervenida. |
| `related_work_record_id` | UUID FK | O | Labor que materializó el evento. |
| `reason` | texto | R | Motivo. |
| `status` | código | R | Borrador, confirmado o anulado. |

**Relaciones y reglas:** Cantidad actual se obtiene de base y eventos válidos. No duplicar un replante registrado desde una labor.

### `campaigns`

Agrupación de gestión para planificación, costos e informes.  
**Perfil:** M con cierre controlado.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | Código único de empresa. |
| `name` | texto | R | Nombre de campaña. |
| `start_date` | fecha | R | Inicio de período de gestión. |
| `end_date` | fecha | O | Fin previsto o efectivo. |
| `status` | código | R | Planificada, activa, cerrada o cancelada. |
| `description` | texto | O | Alcance y criterios. |
| `closed_at` | instante | C | Fecha de cierre. |
| `closed_by` | UUID FK | C | Responsable del cierre. |

**Relaciones y reglas:** Puede abarcar varias chacras/cultivos a través de ciclos. No representa la vida completa de una plantación.

### `production_cycles`

Período productivo de una implantación.  
**Perfil:** M con cierre controlado.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `lot_planting_id` | UUID FK | R | Implantación seguida. |
| `campaign_id` | UUID FK | O | Campaña de gestión; una principal por ciclo inicialmente. |
| `code` | código | R | Identidad de ciclo. |
| `name` | texto | R | Denominación visible. |
| `start_date` | fecha | R | Inicio. |
| `end_date` | fecha | O | Fin. |
| `reference_area_ha` | decimal | O | Superficie de referencia histórica para indicadores. |
| `status` | código | R | Planificado, activo, cerrado o cancelado. |

**Relaciones y reglas:** Propuesta que reemplaza la relación ambigua campaign_lots. No inferir pertenencia solo por fecha; las reglas de solapamiento se cierran antes de implementar.

## 5. Perfiles y catálogos configurables

### `crop_profiles`

Identidad de una configuración de captura por cultivo.  
**Perfil:** M; empresa o plantilla global.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `crop_id` | UUID FK | R | Cultivo destinatario. |
| `name` | texto | R | Nombre del perfil. |
| `base_profile_id` | UUID FK | O | Plantilla de origen. |
| `status` | código | R | Disponible o retirado. |

**Relaciones y reglas:** La identidad del cultivo no cambia si dos empresas usan perfiles distintos.

### `crop_profile_versions`

Versión publicada que interpreta formularios y catálogos.  
**Perfil:** Identidad y pertenencia; inmutable al publicar.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `crop_profile_id` | UUID FK | R | Perfil propietario. |
| `version_number` | entero | R | Número único dentro del perfil. |
| `status` | código | R | Borrador, publicada o retirada. |
| `published_at` | instante | C | Publicación. |
| `configuration` | JSON validado | R | Referencias de catálogos, formularios y requisitos compatibles. |
| `change_summary` | texto | R | Descripción de cambios. |

**Relaciones y reglas:** Publicar crea una versión nueva. No reescribir configuración usada por registros históricos u offline.

### `custom_field_definitions`

Atributo complementario tipado; limitado a formularios admitidos.  
**Perfil:** Identidad y pertenencia; versionado con perfil.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `profile_version_id` | UUID FK | R | Versión propietaria. |
| `entity_type` | código | R | Formulario compatible: observación, cosecha u otro implementado. |
| `code` | código | R | Clave estable del atributo. |
| `label` | texto | R | Nombre visible. |
| `data_type` | código | R | Texto, decimal, entero, booleano, fecha u opción. |
| `unit_id` | UUID FK | O | Unidad si la magnitud lo requiere. |
| `is_required` | booleano | R | Obligatorio al confirmar en este formulario. |
| `allowed_values` | JSON validado | O | Opciones o límites permitidos. |
| `help_text` | texto | O | Ayuda de captura. |

**Relaciones y reglas:** Los valores se guardan en custom_attributes de entidades habilitadas, con versión. No guardar FK, stock o importes centrales como campos libres.

### `work_types`

Catálogo compartido de tipos de labor.  
**Perfil:** M; empresa.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | Código único. |
| `name` | texto | R | Poda, desmalezado, mantenimiento u otro. |
| `description` | texto | O | Qué incluye la tarea. |
| `location_scope` | código | R | Chacra, lote, implantación o instalación. |
| `requires_area` | booleano | R | Exige superficie intervenida. |
| `requires_quantity` | booleano | R | Exige cantidad y unidad. |
| `detail_kind` | código | O | Detalle técnico implementado que corresponde. |
| `status` | código | R | Activo o inactivo. |

**Relaciones y reglas:** No se multiplica una labor idéntica por cultivo. Los requisitos adicionales no sustituyen validaciones del servidor.

### `work_type_crops`

Compatibilidad entre labor y cultivos.  
**Perfil:** Identidad y pertenencia.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `work_type_id` | UUID FK | R | Labor compartida. |
| `crop_id` | UUID FK | R | Cultivo compatible. |

**Relaciones y reglas:** Relación muchos a muchos. Las labores generales sin cultivo deben identificarse por su alcance, no por una asociación vacía ambigua.

### `phenological_stages`

Etapas prácticas por cultivo.  
**Perfil:** M; catálogo global o empresa.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `crop_id` | UUID FK | R | Cultivo compatible. |
| `code` | código | R | Identificador estable de etapa. |
| `name` | texto | R | Denominación visible. |
| `description` | texto | O | Ayuda de identificación. |
| `sort_order` | entero | R | Orden de presentación, no transición obligatoria. |
| `status` | código | R | Disponible o retirada. |

**Relaciones y reglas:** Suficiente para el inicio. Escalas múltiples se agregan solo si un caso real lo necesita; no se impone un motor científico.

### `quality_grades`

Clasificaciones operativas de producción.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `crop_id` | UUID FK | O | Cultivo de aplicación si la clasificación es específica. |
| `product_id` | UUID FK | O | Producto cosechado compatible. |
| `code` | código | R | Código de clasificación. |
| `name` | texto | R | Nombre usado comercialmente. |
| `description` | texto | O | Criterio declarado. |
| `status` | código | R | Activa o retirada. |

**Relaciones y reglas:** La clasificación identifica una categoría; no contiene una fórmula arbitraria de calidad.

### `measurement_parameters`

Parámetros adicionales medibles.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | Identificador estable. |
| `name` | texto | R | Nombre de medición. |
| `unit_id` | UUID FK | C | Unidad para resultados numéricos. |
| `value_type` | código | R | Decimal, texto u opción. |
| `method_description` | texto | O | Método o referencia de captura. |
| `status` | código | R | Activo o retirado. |

**Relaciones y reglas:** Asociar parámetros disponibles a perfiles. No interpretar cualquier parámetro como requerido por agronomía.

## 6. Personal, asistencia y remuneración de gestión

### `employees`

Persona que realiza trabajos para la empresa.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `employee_code` | código | R | Código interno único. |
| `first_name` | texto | R | Nombre. |
| `last_name` | texto | R | Apellido. |
| `document_type` | código | O | Tipo de documento. |
| `document_number` | texto | O | Número preservando ceros/formato. |
| `tax_id` | texto | O | CUIL u otro identificador. |
| `phone` | texto | O | Contacto. |
| `address` | texto | O | Domicilio si resulta necesario. |
| `category_id` | UUID FK | O | Categoría interna. |
| `hire_date` | fecha | O | Inicio de relación. |
| `termination_date` | fecha | O | Fin de relación. |
| `emergency_contact` | texto | O | Contacto de emergencia con acceso restringido. |
| `status` | código | R | Activo o inactivo. |
| `notes` | texto | O | Observaciones restringidas. |

**Relaciones y reglas:** No requiere usuario. Inactivar no elimina participaciones históricas.

### `employee_categories`

Categorías internas para organización y tarifas.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | Código de categoría. |
| `name` | texto | R | Denominación. |
| `description` | texto | O | Alcance. |
| `status` | código | R | Activa o inactiva. |

**Relaciones y reglas:** No se presenta como sustituto de categorías laborales legales.

### `crews`

Grupo operativo de trabajadores.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | Identificador único. |
| `name` | texto | R | Nombre de cuadrilla. |
| `leader_employee_id` | UUID FK | O | Responsable actual. |
| `status` | código | R | Activa o inactiva. |
| `notes` | texto | O | Descripción. |

**Relaciones y reglas:** La participación histórica proviene de integrantes vigentes y registros individuales, no del listado actual.

### `crew_memberships`

Pertenencia histórica a una cuadrilla.  
**Perfil:** M con vigencias.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `crew_id` | UUID FK | R | Cuadrilla. |
| `employee_id` | UUID FK | R | Trabajador. |
| `valid_from` | fecha | R | Inicio. |
| `valid_to` | fecha | O | Fin. |
| `role_in_crew` | texto | O | Función. |

**Relaciones y reglas:** Evitar vigencias duplicadas para el mismo par. Trabajar fuera de la cuadrilla habitual puede registrarse explícitamente.

### `attendance_records`

Cabecera diaria de asistencia.  
**Perfil:** H y O.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `employee_id` | UUID FK | R | Trabajador. |
| `work_date` | fecha | R | Día de referencia según zona de empresa. |
| `attendance_status` | código | R | Presente, ausente, justificado u otro catálogo controlado. |
| `farm_id` | UUID FK | O | Ubicación principal si se conoce. |
| `status` | código | R | Borrador, presentado, confirmado, rechazado o anulado. |
| `notes` | texto | O | Novedad. |
| `review_reason` | texto | C | Motivo de rechazo o corrección. |

**Relaciones y reglas:** Una cabecera por trabajador y día como propuesta inicial; intervalos permiten múltiples entradas y turnos que crucen medianoche.

### `attendance_intervals`

Intervalos efectivos de presencia o descanso.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `attendance_record_id` | UUID FK | R | Cabecera diaria. |
| `start_at` | instante | R | Inicio real. |
| `end_at` | instante | C | Fin, obligatorio para confirmar intervalo cerrado. |
| `interval_type` | código | R | Trabajo o descanso. |
| `notes` | texto | O | Explicación. |

**Relaciones y reglas:** No permitir intervalos incompatibles solapados. Total trabajado excluye descansos según política declarada.

### `compensation_schemes`

Modalidad de remuneración para cálculo gerencial.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | Código. |
| `name` | texto | R | Nombre del esquema. |
| `compensation_type` | código | R | Hora, jornal, mensual, producción, superficie o tarea. |
| `unit_id` | UUID FK | C | Unidad que determina la cantidad remunerable. |
| `status` | código | R | Disponible o inactivo. |

**Relaciones y reglas:** Esquemas mixtos deben definir componentes explícitos; evitar fórmulas libres ejecutables.

### `employee_rates`

Tarifa con vigencia y alcance.  
**Perfil:** M con vigencia; historial.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `employee_id` | UUID FK | C | Persona si tarifa individual. |
| `employee_category_id` | UUID FK | C | Categoría si tarifa colectiva. |
| `work_type_id` | UUID FK | O | Labor específica. |
| `compensation_scheme_id` | UUID FK | R | Modalidad. |
| `amount` | decimal | R | Importe por unidad del esquema. |
| `currency_code` | código | R | Moneda. |
| `valid_from` | fecha | R | Inicio. |
| `valid_to` | fecha | O | Fin. |
| `notes` | texto | O | Condiciones declaradas. |

**Relaciones y reglas:** Exigir persona o categoría y definir precedencia antes de calcular. Un cambio genera nueva vigencia; registros históricos conservan snapshot.

## 7. Trabajo ejecutado y recursos

### `work_orders`

Planificación opcional previa a la ejecución.  
**Perfil:** M con estados.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `farm_id` | UUID FK | R | Chacra. |
| `lot_id` | UUID FK | O | Lote previsto. |
| `lot_planting_id` | UUID FK | O | Implantación prevista. |
| `production_cycle_id` | UUID FK | O | Ciclo previsto. |
| `work_type_id` | UUID FK | R | Tipo de trabajo. |
| `warehouse_id` | UUID FK | O | Instalación objeto de mantenimiento si corresponde. |
| `title` | texto | R | Resumen. |
| `planned_start_at` | instante | R | Inicio previsto. |
| `planned_end_at` | instante | O | Fin previsto. |
| `planned_area_ha` | decimal | O | Superficie planificada. |
| `assigned_crew_id` | UUID FK | O | Cuadrilla prevista. |
| `priority` | código | R | Prioridad operativa. |
| `status` | código | R | Borrador, planificada, asignada, en ejecución, completada o cancelada. |

**Relaciones y reglas:** Una orden puede producir varios registros de ejecución. Completar no crea producción ni consume stock por sí mismo.

### `work_records`

Hecho de ejecución y cabecera de recursos utilizados.  
**Perfil:** H y O.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `work_order_id` | UUID FK | O | Orden de origen. |
| `farm_id` | UUID FK | R | Chacra del trabajo. |
| `lot_id` | UUID FK | C | Requerido para labores de lote. |
| `lot_planting_id` | UUID FK | C | Requerido si intervención productiva sobre un cultivo. |
| `production_cycle_id` | UUID FK | O | Ciclo de imputación. |
| `warehouse_id` | UUID FK | O | Instalación intervenida para labor general. |
| `work_type_id` | UUID FK | R | Tipo de labor. |
| `crew_id` | UUID FK | O | Cuadrilla de referencia. |
| `work_date` | fecha | R | Día de trabajo. |
| `started_at` | instante | O | Inicio. |
| `finished_at` | instante | O | Fin. |
| `area_worked_ha` | decimal | C | Superficie realmente intervenida cuando el tipo la requiere. |
| `quantity` | decimal | C | Magnitud realizada según tipo de labor. |
| `unit_id` | UUID FK | C | Unidad de quantity. |
| `status` | código | R | Borrador, presentado, confirmado, rechazado o anulado. |
| `custom_attributes` | JSON validado | O | Atributos complementarios del perfil. |
| `notes` | texto | O | Descripción de ejecución. |

**Relaciones y reglas:** Referencias deben concordar. quantity no vuelve a contabilizar producción si existe cosecha vinculada; campos de trabajo y producción tienen fuentes distintas.

### `work_employee_entries`

Tiempo y remuneración atribuibles a cada persona.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `work_record_id` | UUID FK | R | Labor. |
| `employee_id` | UUID FK | R | Participante real. |
| `duration_minutes` | entero | R | Tiempo individual; puede ser cero si solo se registra producción y se explica. |
| `quantity_attributed` | decimal | O | Cantidad individual remunerable. |
| `quantity_unit_id` | UUID FK | C | Unidad si se atribuye cantidad. |
| `compensation_scheme_id` | UUID FK | O | Modalidad aplicada. |
| `employee_rate_id` | UUID FK | O | Tarifa de origen. |
| `applied_rate` | decimal | O | Tarifa histórica aplicada. |
| `currency_code` | código | C | Moneda del importe aplicado. |
| `cost_amount` | decimal snapshot | O | Costo calculado de esta participación. |
| `calculation_snapshot` | JSON validado | O | Bases, regla, redondeo y versión del cálculo. |
| `notes` | texto | O | Aclaración de participación. |

**Relaciones y reglas:** Horas-persona se suman por individuo. No atribuir el total cosechado a cada trabajador. No recalcular retrospectivamente con tarifas nuevas.

### `work_material_consumptions`

Declaración y confirmación de un insumo utilizado.  
**Perfil:** Detalle de H y O por raíz.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `work_record_id` | UUID FK | R | Labor destinataria. |
| `product_id` | UUID FK | R | Artículo utilizado. |
| `warehouse_id` | UUID FK | R | Origen físico. |
| `product_batch_id` | UUID FK | C | Partida si el artículo exige trazabilidad. |
| `quantity` | decimal | R | Cantidad declarada positiva. |
| `unit_id` | UUID FK | R | Unidad capturada. |
| `base_quantity` | decimal snapshot | C | Cantidad convertida a unidad base al confirmar. |
| `conversion_factor` | decimal snapshot | C | Factor aplicado si hubo conversión. |
| `stock_movement_id` | UUID FK | O | Salida confirmada, única por consumo efectivo. |
| `status` | código | R | Declarado, confirmado, rechazado o revertido. |
| `applied_unit_cost` | decimal | O | Costo histórico por unidad base. |
| `currency_code` | código | C | Moneda del costo. |

**Relaciones y reglas:** Una declaración offline no descuenta saldo central. La confirmación física puede resolverse por línea con estado visible, sin presentar el conjunto como totalmente confirmado.

### `work_machinery_usages`

Uso de equipos; ampliación.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `work_record_id` | UUID FK | R | Labor. |
| `machinery_id` | UUID FK | R | Equipo. |
| `duration_minutes` | entero | O | Tiempo de uso. |
| `fuel_quantity` | decimal | O | Combustible registrado. |
| `fuel_unit_id` | UUID FK | C | Unidad del combustible. |
| `cost_amount` | decimal | O | Costo aplicado. |
| `currency_code` | código | C | Moneda del costo. |
| `calculation_snapshot` | JSON validado | O | Bases de valoración. |

**Relaciones y reglas:** Combustible consumido genera un único movimiento; no duplicarlo si ya aparece entre insumos de la labor.

### `work_application_details`

Detalle estructurado de una aplicación cuando sea requerido; ampliación operativa.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `work_record_id` | UUID FK | R | Labor de aplicación. |
| `application_method` | texto | O | Método utilizado. |
| `mixture_volume` | decimal | O | Volumen preparado o aplicado, indicando cuál. |
| `volume_unit_id` | UUID FK | C | Unidad de volumen. |
| `weather_notes` | texto | O | Condiciones observadas. |
| `technical_reference` | texto | O | Referencia a indicación/documento técnico. |
| `notes` | texto | O | Observaciones. |

**Relaciones y reglas:** Los productos y cantidades provienen de consumos. Este registro no autoriza usos ni inventa dosis o exigencias normativas; requisitos se validan antes de su uso comercial.

## 8. Artículos, unidades e inventario

### `units_of_measure`

Unidades físicas comunes.  
**Perfil:** Global o catálogo administrado; M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | kg, L, ha, hora, unidad u otro. |
| `name` | texto | R | Nombre. |
| `dimension` | código | R | Masa, volumen, área, tiempo, conteo o longitud. |
| `decimal_places` | entero | R | Precisión de presentación/captura. |
| `base_unit_id` | UUID FK | O | Unidad de referencia de la dimensión. |
| `factor_to_base` | decimal | O | Conversión física fija cuando existe. |

**Relaciones y reglas:** Una presentación de bolsa/cajón puede depender del artículo; no asumir masa universal.

### `product_categories`

Clasificación del catálogo de artículos.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | Código. |
| `name` | texto | R | Nombre. |
| `parent_category_id` | UUID FK | O | Agrupación superior. |
| `status` | código | R | Disponible o inactiva. |

**Relaciones y reglas:** Evitar ciclos de categorías. Categoría no determina por sí sola efectos de stock.

### `products`

Artículo inventariable: insumo, material o producto obtenido.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `category_id` | UUID FK | R | Clasificación. |
| `code` | código | R | Código único por empresa. |
| `name` | texto | R | Denominación. |
| `product_kind` | código | R | Insumo, producción, material u otro artículo. |
| `description` | texto | O | Descripción. |
| `brand` | texto | O | Marca. |
| `base_unit_id` | UUID FK | R | Unidad de control de existencias. |
| `is_stock_tracked` | booleano | R | Indica si genera movimientos. |
| `requires_batch` | booleano | R | Obliga a identificar partida. |
| `status` | código | R | Disponible o inactivo. |

**Relaciones y reglas:** El mismo motor de stock sirve para insumos y producción. Cultivo no se deduce de un nombre de artículo.

### `crop_output_products`

Productos que pueden obtenerse de un cultivo.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `crop_id` | UUID FK | R | Cultivo de origen. |
| `product_id` | UUID FK | R | Producto de producción. |
| `is_default` | booleano | R | Propuesta inicial al capturar cosecha. |

**Relaciones y reglas:** Muchos a muchos cuando corresponda; validar la elección al confirmar cosecha.

### `product_technical_details`

Ficha especializada de un insumo; ampliación.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `product_id` | UUID FK | R | Artículo único asociado. |
| `active_ingredient` | texto | O | Composición declarada. |
| `formulation` | texto | O | Formulación o concentración. |
| `registration_reference` | texto | O | Referencia identificatoria. |
| `technical_notes` | texto | O | Información del fabricante o responsable. |

**Relaciones y reglas:** Fichas y documentos se adjuntan por relación explícita. No sustituye validación de uso por cultivo/país.

### `product_unit_conversions`

Equivalencia explícita de una presentación del artículo.  
**Perfil:** M con vigencia.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `product_id` | UUID FK | R | Artículo al que aplica. |
| `from_unit_id` | UUID FK | R | Unidad de captura/compra. |
| `to_unit_id` | UUID FK | R | Unidad destino, normalmente base. |
| `factor` | decimal | R | Cantidad destino por unidad origen. |
| `valid_from` | fecha | R | Inicio. |
| `valid_to` | fecha | O | Fin. |
| `conversion_kind` | código | R | Presentación fija u otra equivalencia validada. |

**Relaciones y reglas:** Una bolsa de contenido fijo puede convertirse. Envase variable se pesa; masa y volumen necesitan una regla física válida, nunca conversión implícita.

### `product_batches`

Partida comercial o productiva de un artículo.  
**Perfil:** M con origen histórico.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `product_id` | UUID FK | R | Artículo. |
| `batch_code` | texto | R | Identificador de partida. |
| `origin_type` | código | R | Compra, cosecha o saldo inicial. |
| `manufactured_at` | fecha | O | Fecha declarada de fabricación. |
| `expires_at` | fecha | O | Vencimiento. |
| `supplier_id` | UUID FK | O | Proveedor original. |
| `notes` | texto | O | Identificación adicional. |

**Relaciones y reglas:** No confundir con lote territorial. Recepciones y cosechas enlazan la partida; su historia no depende solo de una FK a una compra.

### `warehouses`

Ubicación de custodia de existencias.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | Código único. |
| `name` | texto | R | Nombre. |
| `farm_id` | UUID FK | O | Chacra asociada si corresponde. |
| `warehouse_kind` | código | R | Físico o ubicación lógica de tránsito. |
| `address` | texto | O | Ubicación. |
| `responsible_employee_id` | UUID FK | O | Responsable. |
| `status` | código | R | Activo o inactivo. |

**Relaciones y reglas:** Puede contener artículos destinados a distintos cultivos. No inactivar ignorando saldos pendientes.

### `warehouse_product_settings`

Configuración del artículo en un almacén.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `warehouse_id` | UUID FK | R | Almacén. |
| `product_id` | UUID FK | R | Artículo. |
| `minimum_stock` | decimal | O | Umbral en unidad base. |
| `location_reference` | texto | O | Estante/sector. |

**Relaciones y reglas:** Único por par; los mínimos son propios de la ubicación, no solo del producto global.

### `stock_movements`

Hecho confirmado que explica una variación de existencias.  
**Perfil:** H; libro de movimientos inmutable.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `warehouse_id` | UUID FK | R | Ubicación afectada. |
| `product_id` | UUID FK | R | Artículo. |
| `product_batch_id` | UUID FK | C | Partida si se exige. |
| `movement_type` | código | R | Recepción, consumo, transferencia, cosecha, entrega, ajuste o reversión. |
| `quantity_delta` | decimal con signo | R | Variación en unidad base; entrada positiva y salida negativa. |
| `base_unit_id` | UUID FK | R | Unidad base preservada. |
| `occurred_at` | instante | R | Fecha efectiva del movimiento. |
| `source_type` | código | R | Tipo de documento fuente admitido. |
| `source_id` | UUID | R | Identidad validada por el caso de uso. |
| `source_line_id` | UUID | R | Línea fuente que permite idempotencia. |
| `reversal_of_id` | UUID FK | O | Movimiento compensado. |
| `applied_unit_cost` | decimal | O | Valuación histórica aplicada. |
| `currency_code` | código | C | Moneda de valuación. |

**Relaciones y reglas:** Propuesta: solo movimientos confirmados forman el libro; pendientes viven en documentos. source_type/id es navegación controlada, no reemplaza FK explícitas desde las líneas fuente. Reversar crea movimiento opuesto y conserva el original.

### `stock_balances`

Saldo materializado opcional para consulta y bloqueo.  
**Perfil:** Proyección técnica.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `warehouse_id` | UUID FK | R | Ubicación. |
| `product_id` | UUID FK | R | Artículo. |
| `product_batch_id` | UUID FK | O | Partida. |
| `quantity` | decimal | R | Suma de movimientos confirmados. |
| `version` | entero | R | Control de concurrencia. |

**Relaciones y reglas:** No editable manualmente; reconstruible desde libro. Definir unicidad también para partida nula.

### `stock_transfers`

Traslado entre almacenes, con recepción separada.  
**Perfil:** H; O si se habilita.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `source_warehouse_id` | UUID FK | R | Origen. |
| `destination_warehouse_id` | UUID FK | R | Destino. |
| `transit_warehouse_id` | UUID FK | R | Ubicación lógica de tránsito de la transferencia o circuito. |
| `requested_at` | instante | R | Solicitud. |
| `dispatched_at` | instante | O | Despacho. |
| `status` | código | R | Borrador, solicitada, despachada, parcialmente recibida, recibida o cerrada con diferencia. |
| `notes` | texto | O | Motivo y aclaraciones. |

**Relaciones y reglas:** Origen distinto de destino y misma empresa. Una vez despachada se resuelve con recepción, devolución o diferencia autorizada, no cancelación que borre salidas.

### `stock_transfer_items`

Artículo y cantidad despachada por traslado.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `transfer_id` | UUID FK | R | Transferencia. |
| `product_id` | UUID FK | R | Artículo. |
| `product_batch_id` | UUID FK | C | Partida requerida. |
| `requested_quantity` | decimal | R | Cantidad solicitada en unidad base. |
| `dispatched_quantity` | decimal | C | Cantidad efectivamente enviada. |
| `unit_id` | UUID FK | R | Unidad base. |
| `dispatch_out_movement_id` | UUID FK | O | Salida del origen. |
| `transit_in_movement_id` | UUID FK | O | Entrada a tránsito. |

**Relaciones y reglas:** Recepciones se registran separadas; recibido y pendiente son derivados, no una cantidad sobreescrita sin detalle.

### `stock_transfer_receipts`

Recepción total o parcial de una transferencia.  
**Perfil:** H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `transfer_id` | UUID FK | R | Traslado recibido. |
| `received_at` | instante | R | Momento efectivo. |
| `received_by` | UUID FK | R | Usuario receptor. |
| `status` | código | R | Borrador, confirmado o anulado. |
| `notes` | texto | O | Observaciones. |

**Relaciones y reglas:** Permite varias recepciones y evidencia por recepción.

### `stock_transfer_receipt_items`

Cantidad aceptada de una línea transferida.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `transfer_receipt_id` | UUID FK | R | Recepción. |
| `transfer_item_id` | UUID FK | R | Línea de origen. |
| `received_quantity` | decimal | R | Cantidad aceptada en unidad base. |
| `transit_out_movement_id` | UUID FK | O | Salida de tránsito. |
| `destination_in_movement_id` | UUID FK | O | Entrada en destino. |
| `notes` | texto | O | Estado o diferencias. |

**Relaciones y reglas:** La suma recibida no supera lo despachado sin resolución explícita. Faltantes no se registran como recepción ficticia.

### `stock_adjustments`

Corrección física autorizada de existencias.  
**Perfil:** H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `warehouse_id` | UUID FK | R | Ubicación. |
| `adjustment_date` | fecha | R | Fecha. |
| `reason_code` | código | R | Inventario inicial, recuento, pérdida, daño u otro. |
| `reason_description` | texto | R | Explicación. |
| `status` | código | R | Borrador, presentado, confirmado o anulado. |
| `approved_by` | UUID FK | C | Responsable autorizado. |

**Relaciones y reglas:** El saldo inicial también necesita un documento. La evidencia de recuento se adjunta.

### `stock_adjustment_items`

Diferencia confirmada por artículo y partida.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `stock_adjustment_id` | UUID FK | R | Documento de ajuste. |
| `product_id` | UUID FK | R | Artículo. |
| `product_batch_id` | UUID FK | C | Partida requerida. |
| `expected_quantity` | decimal snapshot | R | Saldo al momento/corte del recuento. |
| `counted_quantity` | decimal | C | Cantidad contada si proviene de recuento. |
| `quantity_delta` | decimal con signo | R | Diferencia autorizada. |
| `stock_movement_id` | UUID FK | O | Movimiento generado. |

**Relaciones y reglas:** Cambios concurrentes entre recuento y confirmación deben conciliarse; no sobrescribir el saldo actual con el contado.

## 9. Terceros, compras y recepción

### `business_parties`

Identidad común de contraparte con uno o varios roles.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `party_type` | código | R | Persona u organización. |
| `legal_name` | texto | R | Nombre legal o nombre completo. |
| `trade_name` | texto | O | Nombre comercial. |
| `tax_id` | texto | O | Identificación fiscal. |
| `email` | texto | O | Contacto. |
| `phone` | texto | O | Teléfono. |
| `contact_name` | texto | O | Persona de contacto. |
| `address` | texto | O | Dirección. |
| `locality` | texto | O | Localidad. |
| `province` | texto | O | Región. |
| `country_code` | código | R | País. |
| `status` | código | R | Activo o inactivo. |

**Relaciones y reglas:** Propuesta para evitar duplicar un proveedor que también compra producción. La UI mantiene módulos separados por rol.

### `suppliers`

Rol proveedor de una contraparte.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `party_id` | UUID FK | R | Identidad común, única para este rol. |
| `default_payment_term_id` | UUID FK | O | Condición de pago sugerida. |
| `notes` | texto | O | Información de abastecimiento. |
| `status` | código | R | Habilitado o inactivo. |

**Relaciones y reglas:** No hereda de usuario: proveedor no implica acceso al sistema.

### `customers`

Rol comprador/deudor de una contraparte.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `party_id` | UUID FK | R | Identidad común. |
| `default_payment_term_id` | UUID FK | O | Condición sugerida. |
| `status` | código | R | Activo o inactivo. |
| `notes` | texto | O | Información comercial. |

**Relaciones y reglas:** Puede coincidir con un proveedor por party_id sin duplicar identidad.

### `production_destinations`

Lugar u organización receptora de producción.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `party_id` | UUID FK | O | Contraparte que opera el destino. |
| `customer_id` | UUID FK | O | Comprador si corresponde. |
| `name` | texto | R | Nombre del punto de entrega. |
| `destination_type` | código | R | Acopio, secadero, comprador, cooperativa u otro. |
| `address` | texto | O | Ubicación. |
| `status` | código | R | Disponible o inactivo. |

**Relaciones y reglas:** Destino físico no equivale necesariamente al deudor de la venta.

### `purchases`

Documento administrativo de adquisición.  
**Perfil:** H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `supplier_id` | UUID FK | R | Proveedor. |
| `reference_number` | texto | O | Número externo del comprobante. |
| `purchase_date` | fecha | R | Fecha de adquisición/documento. |
| `currency_code` | código | R | Moneda. |
| `payment_term_id` | UUID FK | O | Condición acordada. |
| `due_date` | fecha | O | Vencimiento simple inicial. |
| `subtotal` | decimal derivado | R | Suma neta de líneas. |
| `tax_total` | decimal derivado | O | Impuestos registrados si se incluyen. |
| `total` | decimal derivado | R | Importe documentado. |
| `status` | código | R | Borrador, confirmado o anulado. |
| `notes` | texto | O | Condiciones y referencias. |

**Relaciones y reglas:** No ingresa stock ni registra pago por sí sola. Recepción y saldo de pago son estados derivados independientes.

### `purchase_items`

Detalle adquirido y precio histórico.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `purchase_id` | UUID FK | R | Documento. |
| `product_id` | UUID FK | R | Artículo. |
| `description_snapshot` | texto | R | Descripción histórica. |
| `quantity` | decimal | R | Cantidad adquirida. |
| `unit_id` | UUID FK | R | Unidad de compra. |
| `conversion_factor` | decimal snapshot | C | Factor de presentación aplicable. |
| `unit_price` | decimal | R | Precio por unidad de compra. |
| `discount_amount` | decimal | O | Descuento de línea. |
| `tax_amount` | decimal | O | Impuestos de línea. |
| `line_total` | decimal derivado | R | Resultado con redondeo definido. |

**Relaciones y reglas:** Cantidad recibida se obtiene de recepciones válidas. Precios históricos no cambian con catálogo.

### `purchase_receipts`

Recepción física de una compra.  
**Perfil:** H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `purchase_id` | UUID FK | R | Compra de referencia. |
| `warehouse_id` | UUID FK | R | Destino físico. |
| `received_at` | instante | R | Momento de recepción. |
| `received_by` | UUID FK | R | Receptor. |
| `status` | código | R | Borrador, confirmado o anulado. |
| `reference_number` | texto | O | Remito u otra referencia. |
| `notes` | texto | O | Observaciones. |

**Relaciones y reglas:** Una compra admite múltiples recepciones; las devoluciones confirmadas requieren documento y movimientos inversos relacionados.

### `purchase_receipt_items`

Cantidad físicamente recibida por línea de compra.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `purchase_receipt_id` | UUID FK | R | Recepción. |
| `purchase_item_id` | UUID FK | R | Línea de compra. |
| `product_batch_id` | UUID FK | C | Partida si se exige. |
| `quantity_received` | decimal | R | Cantidad en unidad capturada. |
| `unit_id` | UUID FK | R | Unidad de recepción. |
| `base_quantity` | decimal snapshot | R | Cantidad ingresada a stock. |
| `conversion_factor` | decimal snapshot | R | Conversión aplicada, 1 si coincide. |
| `stock_movement_id` | UUID FK | O | Entrada generada. |

**Relaciones y reglas:** Validar compatibilidad de producto y tolerancia de sobreentrega; una recepción reenviada no duplica entrada.

### `purchase_returns`

Devolución de compra; extensión necesaria si se habilita ese circuito.  
**Perfil:** H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `purchase_receipt_id` | UUID FK | R | Recepción de origen. |
| `returned_at` | instante | R | Fecha de devolución. |
| `reason` | texto | R | Motivo. |
| `status` | código | R | Borrador, confirmado o anulado. |

**Relaciones y reglas:** La devolución física no reduce deuda por sí sola; requiere ajuste administrativo separado.

### `purchase_return_items`

Detalle de devolución a proveedor.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `purchase_return_id` | UUID FK | R | Documento. |
| `purchase_receipt_item_id` | UUID FK | R | Línea recibida original. |
| `quantity` | decimal | R | Cantidad en unidad base. |
| `stock_movement_id` | UUID FK | O | Salida de devolución. |

**Relaciones y reglas:** No devolver más de lo recibido neto de devoluciones anteriores; preservar partida y costo histórico pertinente.

## 10. Observaciones de campo

### `field_observations`

Hecho observado con contexto y evidencia.  
**Perfil:** H y O.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `farm_id` | UUID FK | R | Chacra. |
| `lot_id` | UUID FK | O | Lote observado. |
| `lot_planting_id` | UUID FK | C | Implantación para fenología o sanidad de cultivo. |
| `production_cycle_id` | UUID FK | O | Ciclo relacionado. |
| `observation_type` | código | R | General, fenológica, sanitaria, suelo o clima observado. |
| `observed_at` | instante | R | Momento de observación. |
| `sector_reference` | texto | O | Sector o muestra identificable. |
| `location_point` | punto geográfico | O | Ubicación precisa. |
| `description` | texto | R | Descripción útil del hecho. |
| `status` | código | R | Borrador, registrada o anulada. |
| `custom_attributes` | JSON validado | O | Datos complementarios del perfil. |

**Relaciones y reglas:** No necesita fecha de inicio/fin. No exigir confirmación administrativa para toda novedad si no aporta valor.

### `phenology_observation_details`

Información fenológica específica de una observación.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `field_observation_id` | UUID FK | R | Observación única asociada. |
| `phenological_stage_id` | UUID FK | R | Etapa compatible con cultivo. |
| `observed_plant_count` | entero | O | Cantidad observada si se muestreó. |
| `notes` | texto | O | Alcance o heterogeneidad. |

**Relaciones y reglas:** Una observación puede representar un sector; varias observaciones permiten etapas distintas sin declarar un estado uniforme global.

### `health_observation_details`

Información sanitaria práctica.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `field_observation_id` | UUID FK | R | Observación única asociada. |
| `problem_description` | texto | R | Problema observado o sospechado. |
| `severity` | código | O | Escala interna con significado documentado. |
| `affected_area_ha` | decimal | O | Superficie estimada. |
| `affected_plant_count` | entero | O | Cantidad estimada de plantas. |
| `assessment_status` | código | R | Observado, sospechado o verificado por responsable. |

**Relaciones y reglas:** Una sospecha no se presenta como diagnóstico confirmado. Un catálogo de problemas puede agregarse después.

### `field_observation_measurements`

Resultados adicionales de una muestra u observación.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `field_observation_id` | UUID FK | R | Observación. |
| `parameter_id` | UUID FK | R | Qué se midió. |
| `numeric_value` | decimal | C | Valor numérico cuando corresponde. |
| `text_value` | texto | C | Resultado textual/opción cuando corresponde. |
| `unit_id` | UUID FK | C | Unidad numérica. |
| `sample_reference` | texto | O | Muestra identificada. |
| `method_snapshot` | texto | O | Método efectivamente utilizado. |

**Relaciones y reglas:** Exigir exactamente el tipo de valor permitido; no convertir esta tabla en depósito de relaciones de negocio.

## 11. Cosechas, pesajes, partidas y entregas

### `harvest_records`

Cabecera de recolección de una implantación.  
**Perfil:** H y O.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `lot_planting_id` | UUID FK | R | Origen productivo inequívoco. |
| `production_cycle_id` | UUID FK | C | Ciclo si el módulo ya está operativo. |
| `work_record_id` | UUID FK | O | Labor de cosecha vinculada. |
| `harvest_date` | fecha | R | Día efectivo. |
| `crew_id` | UUID FK | O | Cuadrilla de referencia. |
| `status` | código | R | Borrador, presentada, confirmada o anulada. |
| `custom_attributes` | JSON validado | O | Atributos permitidos por perfil. |
| `notes` | texto | O | Contexto. |

**Relaciones y reglas:** Chacra, lote y cultivo se obtienen de implantación; si se duplican para consulta deben validarse. Una cosecha se divide en líneas sin mezclar orígenes.

### `harvest_items`

Detalle de producto recolectado y destino inicial.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `harvest_record_id` | UUID FK | R | Cosecha. |
| `product_id` | UUID FK | R | Producto obtenido compatible. |
| `product_batch_id` | UUID FK | R | Partida productiva creada o asignada. |
| `quality_grade_id` | UUID FK | O | Clasificación compatible. |
| `estimated_quantity` | decimal | O | Cantidad estimada inicial. |
| `confirmed_quantity` | decimal | C | Cantidad aceptada para confirmar. |
| `unit_id` | UUID FK | R | Unidad capturada. |
| `base_quantity` | decimal snapshot | C | Cantidad en unidad base. |
| `quantity_basis` | código | R | Estimada, medida o pesada. |
| `initial_route` | código | R | Almacén o entrega directa. |
| `warehouse_id` | UUID FK | C | Almacén si ingresa a existencias. |
| `stock_movement_id` | UUID FK | O | Entrada inicial si se almacena. |

**Relaciones y reglas:** Varias clasificaciones pueden crear varias líneas. No crear entrada ficticia para entrega directa. La cantidad confirmada es operativa y puede seguir siendo estimada si se declara.

### `weighings`

Evidencia de pesaje vinculada a cosecha o entrega.  
**Perfil:** H y O.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `harvest_item_id` | UUID FK | C | Línea cosechada si se pesa al origen. |
| `delivery_item_id` | UUID FK | C | Línea entregada si se pesa en entrega. |
| `weighed_at` | instante | R | Fecha efectiva. |
| `gross_weight` | decimal | R | Peso bruto. |
| `tare_weight` | decimal | R | Tara. |
| `net_weight` | decimal derivado | R | Bruto menos tara. |
| `unit_id` | UUID FK | R | Unidad de masa. |
| `ticket_number` | texto | O | Número de ticket. |
| `scale_reference` | texto | O | Balanza o prestador. |
| `vehicle_reference` | texto | O | Vehículo. |
| `measurement_location` | código | R | Origen o destino. |
| `status` | código | R | Registrado, reemplazado o anulado. |

**Relaciones y reglas:** Exactamente un vínculo principal; tara no mayor que bruto. Repetir un pesaje genera otra evidencia, no sobrescribe silenciosamente el anterior.

### `harvest_measurements`

Mediciones de producción o calidad.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `harvest_item_id` | UUID FK | R | Partida/línea medida. |
| `parameter_id` | UUID FK | R | Parámetro. |
| `numeric_value` | decimal | C | Resultado numérico. |
| `text_value` | texto | C | Resultado textual. |
| `unit_id` | UUID FK | C | Unidad. |
| `measured_at` | instante | R | Fecha. |
| `sample_reference` | texto | O | Referencia de muestra. |

**Relaciones y reglas:** Los parámetros dependen del perfil; no exigir humedad o calibre universalmente.

### `harvest_employee_entries`

Atribución de producción por persona.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `harvest_record_id` | UUID FK | R | Cosecha. |
| `harvest_item_id` | UUID FK | O | Línea específica si es necesario. |
| `employee_id` | UUID FK | R | Trabajador. |
| `quantity_attributed` | decimal | R | Producción individual atribuida. |
| `unit_id` | UUID FK | R | Unidad. |
| `work_employee_entry_id` | UUID FK | O | Participación laboral que consume esta base de cálculo. |

**Relaciones y reglas:** Las horas y costos residen en participación de labor. La suma atribuida respeta la cantidad distribuible; registrar producción no crea dos remuneraciones.

### `harvest_deliveries`

Despacho y recepción de producción por un destino.  
**Perfil:** H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `destination_id` | UUID FK | R | Punto receptor. |
| `customer_id` | UUID FK | O | Comprador responsable si ya se conoce. |
| `dispatched_at` | instante | C | Fecha de salida. |
| `received_at` | instante | O | Fecha de recepción reconocida. |
| `vehicle_reference` | texto | O | Transporte. |
| `reference_number` | texto | O | Remito/ticket general. |
| `status` | código | R | Borrador, despachada, recibida, con diferencia o anulada antes de salida. |
| `notes` | texto | O | Acuerdos y observaciones. |

**Relaciones y reglas:** Una entrega puede reunir varias partidas. Una partida puede distribuirse en varias entregas. Una salida efectiva exige devolución/compensación para revertirla.

### `harvest_delivery_items`

Origen y cantidades de una línea entregada.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `harvest_delivery_id` | UUID FK | R | Entrega. |
| `harvest_item_id` | UUID FK | R | Origen productivo. |
| `source_warehouse_id` | UUID FK | C | Almacén de salida si estuvo almacenada. |
| `dispatched_quantity` | decimal | R | Cantidad enviada. |
| `accepted_quantity` | decimal | O | Cantidad reconocida por destino. |
| `unit_id` | UUID FK | R | Unidad de cantidades. |
| `quality_grade_id` | UUID FK | O | Clasificación reconocida. |
| `stock_movement_id` | UUID FK | O | Salida del almacén si aplica. |
| `difference_reason` | texto | C | Explicación de diferencia conciliada. |

**Relaciones y reglas:** La entrega directa reserva/asigna cantidad de harvest_item sin crear stock. La ruta almacenada usa saldo físico. Diferencias no cambian retrospectivamente lo cosechado.

## 12. Economía administrativa y costos

### `payment_methods`

Medio con el que se mueve dinero.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | Código. |
| `name` | texto | R | Efectivo, transferencia, cheque u otro. |
| `requires_reference` | booleano | R | Exige número o referencia. |
| `status` | código | R | Disponible o inactivo. |

**Relaciones y reglas:** No es condición de pago ni modalidad salarial. Cheques con vencimiento/compensación requieren ampliación antes de tratarlos como efectivo disponible.

### `payment_terms`

Condición acordada de vencimiento.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | Código. |
| `name` | texto | R | Contado o plazo acordado. |
| `due_days` | entero | O | Días para sugerir vencimiento simple. |
| `notes` | texto | O | Condiciones. |
| `status` | código | R | Activa o inactiva. |

**Relaciones y reglas:** Cuotas múltiples se modelan como vencimientos de obligación cuando se habiliten, no como texto interpretado automáticamente.

### `money_accounts`

Caja o cuenta de gestión de fondos.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | Identificador. |
| `name` | texto | R | Nombre visible. |
| `account_type` | código | R | Caja, banco u otra cuenta de gestión. |
| `currency_code` | código | R | Moneda de la cuenta. |
| `status` | código | R | Activa o inactiva. |

**Relaciones y reglas:** Saldo se explica por movimientos confirmados. No implica conexión bancaria ni conciliación automática.

### `expense_categories`

Clasificación de gastos administrativos.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | Código. |
| `name` | texto | R | Flete, reparación, servicio u otro. |
| `status` | código | R | Disponible o inactiva. |

**Relaciones y reglas:** No determina automáticamente si un pago es costo del período.

### `expenses`

Reconocimiento de un gasto directo o servicio.  
**Perfil:** H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `supplier_id` | UUID FK | O | Proveedor. |
| `expense_category_id` | UUID FK | R | Clasificación. |
| `expense_date` | fecha | R | Fecha del gasto. |
| `due_date` | fecha | O | Vencimiento. |
| `description` | texto | R | Concepto. |
| `amount` | decimal | R | Importe. |
| `currency_code` | código | R | Moneda. |
| `status` | código | R | Borrador, confirmado o anulado. |
| `notes` | texto | O | Referencias. |

**Relaciones y reglas:** No duplicar aquí como gasto el consumo ya valorizado ni la compra inventariable completa. Su pago es una operación separada.

### `income_records`

Reconocimiento administrativo de ingreso o importe a cobrar.  
**Perfil:** H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `customer_id` | UUID FK | O | Deudor/comprador. |
| `income_date` | fecha | R | Fecha del reconocimiento. |
| `due_date` | fecha | O | Vencimiento. |
| `description` | texto | R | Concepto. |
| `amount` | decimal | R | Importe documentado. |
| `currency_code` | código | R | Moneda. |
| `status` | código | R | Borrador, confirmado o anulado. |

**Relaciones y reglas:** No es cobro ni factura fiscal emitida. Si el precio no está confirmado, la entrega sigue sin ingreso definitivo.

### `income_delivery_allocations`

Relaciona ingresos con cantidades entregadas sin perder detalle.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `income_record_id` | UUID FK | R | Ingreso administrativo. |
| `delivery_item_id` | UUID FK | R | Línea de entrega reconocida. |
| `quantity` | decimal | R | Cantidad liquidada/comercializada. |
| `unit_id` | UUID FK | R | Unidad. |
| `unit_price` | decimal | R | Precio acordado. |
| `amount` | decimal | R | Importe atribuido con redondeo definido. |

**Relaciones y reglas:** Evitar liquidar dos veces la misma cantidad. Un ingreso puede reunir entregas; una entrega admite liquidación parcial.

### `administrative_adjustments`

Nota administrativa de crédito/débito sobre un documento confirmado.  
**Perfil:** H; extensión si se habilitan devoluciones o cambios de importe.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `purchase_id` | UUID FK | C | Compra ajustada. |
| `expense_id` | UUID FK | C | Gasto ajustado. |
| `income_record_id` | UUID FK | C | Ingreso ajustado. |
| `adjustment_date` | fecha | R | Fecha. |
| `amount_delta` | decimal con signo | R | Cambio de importe respecto del documento origen. |
| `currency_code` | código | R | Moneda compatible. |
| `reason` | texto | R | Motivo y referencia externa. |
| `status` | código | R | Borrador, confirmado o anulado. |

**Relaciones y reglas:** Exactamente un documento origen. No altera stock ni mueve dinero; modifica la obligación derivada de manera trazable.

### `financial_obligations`

Proyección de deuda/crédito por documento, evitando vínculos polimórficos sin control.  
**Perfil:** Identidad y pertenencia; proyección controlada.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `direction` | código | R | Por pagar o por cobrar. |
| `party_id` | UUID FK | C | Contraparte comercial. |
| `employee_id` | UUID FK | C | Trabajador si corresponde a remuneración de gestión. |
| `purchase_id` | UUID FK | C | Compra de origen. |
| `expense_id` | UUID FK | C | Gasto de origen. |
| `income_record_id` | UUID FK | C | Ingreso de origen. |
| `compensation_record_id` | UUID FK | C | Remuneración de origen. |
| `original_amount` | decimal | R | Importe original. |
| `adjusted_amount` | decimal derivado | R | Importe neto de ajustes. |
| `currency_code` | código | R | Moneda. |
| `due_date` | fecha | O | Vencimiento. |
| `status` | código derivado | R | Pendiente, parcial, cancelada por pago/cobro o anulada. |

**Relaciones y reglas:** Exactamente un origen y una contraparte pertinente. Si se usa proyección, debe reconstruirse desde documentos e imputaciones; no es una deuda adicional.

### `cash_transactions`

Pago o cobro efectivo con medio y cuenta.  
**Perfil:** H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `direction` | código | R | Pago o cobro. |
| `party_id` | UUID FK | C | Contraparte comercial. |
| `employee_id` | UUID FK | C | Trabajador si corresponde. |
| `transaction_date` | fecha | R | Fecha efectiva. |
| `money_account_id` | UUID FK | R | Caja/cuenta afectada. |
| `payment_method_id` | UUID FK | R | Medio. |
| `amount` | decimal positivo | R | Importe en moneda de cuenta. |
| `currency_code` | código | R | Moneda. |
| `reference` | texto | C | Referencia exigida por medio. |
| `status` | código | R | Borrador, confirmado o revertido. |
| `reversal_of_id` | UUID FK | O | Operación compensada. |
| `notes` | texto | O | Explicación. |

**Relaciones y reglas:** Puede existir anticipo sin obligación imputada. Compensar no borra el movimiento original; totales consideran original y compensación sin excluir dos veces.

### `payment_allocations`

Aplica un pago/cobro a una obligación.  
**Perfil:** H; detalle económico.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `cash_transaction_id` | UUID FK | R | Movimiento confirmado. |
| `financial_obligation_id` | UUID FK | R | Deuda/crédito cancelado parcialmente. |
| `amount` | decimal positivo | R | Importe aplicado. |
| `currency_code` | código | R | Moneda de aplicación. |
| `applied_at` | instante | R | Fecha de imputación. |
| `reversal_of_id` | UUID FK | O | Imputación compensada, si aplica. |
| `status` | código | R | Vigente o revertida. |

**Relaciones y reglas:** Suma aplicada no supera importe disponible ni saldo de obligación. Exigir misma contraparte, dirección y moneda inicialmente; cambio de moneda requiere modelo explícito.

### `compensation_records`

Resumen gerencial de remuneración pendiente de pago.  
**Perfil:** H; no liquidación legal.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `employee_id` | UUID FK | R | Trabajador. |
| `period_start` | fecha | R | Inicio de período. |
| `period_end` | fecha | R | Fin. |
| `amount` | decimal derivado | R | Total de detalles. |
| `currency_code` | código | R | Moneda. |
| `status` | código | R | Borrador, confirmado o anulado. |
| `notes` | texto | O | Aclaraciones. |

**Relaciones y reglas:** No incluir dos veces las mismas participaciones. Habilitar este módulo solo tras definir modalidades y correcciones.

### `compensation_record_items`

Bases y ajustes del resumen remunerativo.  
**Perfil:** Detalle de H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `compensation_record_id` | UUID FK | R | Cabecera. |
| `work_employee_entry_id` | UUID FK | O | Participación fuente. |
| `concept` | texto | R | Concepto. |
| `amount` | decimal con signo | R | Importe de línea. |
| `calculation_snapshot` | JSON validado | R | Cantidad, tarifa, regla y redondeo. |
| `reason` | texto | C | Explicación para ajustes sin participación. |

**Relaciones y reglas:** Una participación pagada no se incorpora otra vez; correcciones generan diferencia explícita.

### `cost_allocations`

Imputa un costo fuente a un destino analítico.  
**Perfil:** H; detalle analítico.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `source_work_employee_entry_id` | UUID FK | C | Fuente de mano de obra. |
| `source_material_consumption_id` | UUID FK | C | Fuente de insumo. |
| `source_machinery_usage_id` | UUID FK | C | Fuente de maquinaria. |
| `source_expense_id` | UUID FK | C | Fuente de gasto directo/indirecto. |
| `farm_id` | UUID FK | R | Destino territorial. |
| `lot_id` | UUID FK | O | Lote destinatario. |
| `lot_planting_id` | UUID FK | O | Implantación destinataria. |
| `production_cycle_id` | UUID FK | O | Ciclo destinatario. |
| `campaign_id` | UUID FK | O | Campaña si no hay ciclo o si se valida concordancia. |
| `amount` | decimal | R | Importe atribuido. |
| `currency_code` | código | R | Moneda. |
| `allocation_method` | código | R | Directo, superficie, horas, producción o porcentaje. |
| `calculation_snapshot` | JSON validado | R | Base y método aplicados. |

**Relaciones y reglas:** Exactamente una fuente. Distribuciones no crean costos nuevos: no sumar fuente y asignaciones. Evitar asignar más del importe fuente neto.

## 13. Maquinaria — ampliación

### `machinery`

Equipo o vehículo administrado.  
**Perfil:** M.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `code` | código | R | Identificador. |
| `name` | texto | R | Nombre. |
| `machinery_type` | código | R | Tipo. |
| `farm_id` | UUID FK | O | Ubicación habitual. |
| `brand` | texto | O | Marca. |
| `model` | texto | O | Modelo. |
| `serial_number` | texto | O | Serie. |
| `purchase_date` | fecha | O | Adquisición. |
| `status` | código | R | Disponible, mantenimiento o inactivo. |

**Relaciones y reglas:** El uso real se registra en labores; ubicación habitual no restringe automáticamente su utilización.

### `machinery_readings`

Lectura de horómetro u odómetro.  
**Perfil:** H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `machinery_id` | UUID FK | R | Equipo. |
| `reading_at` | instante | R | Fecha. |
| `hours_total` | decimal | O | Horómetro acumulado. |
| `odometer_km` | decimal | O | Kilometraje acumulado. |
| `notes` | texto | O | Cambio de instrumento o aclaración. |

**Relaciones y reglas:** Exigir al menos una lectura. Descensos necesitan explicación; no sumar lecturas acumuladas como horas de uso.

### `maintenance_records`

Intervención de mantenimiento.  
**Perfil:** H.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `machinery_id` | UUID FK | R | Equipo. |
| `maintenance_date` | fecha | R | Fecha. |
| `maintenance_type` | código | R | Preventivo o correctivo. |
| `description` | texto | R | Trabajo realizado. |
| `expense_id` | UUID FK | O | Gasto fuente único. |
| `next_due_date` | fecha | O | Próxima fecha prevista. |
| `next_due_hours` | decimal | O | Horómetro previsto. |

**Relaciones y reglas:** No duplicar gasto y costo del mantenimiento. Repuestos pueden vincularse a consumos mediante un circuito específico.

## 14. Documentos, estados y sincronización

### `files`

Metadatos y autorización de un archivo binario.  
**Perfil:** Identidad y pertenencia.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `storage_key` | texto | R | Ubicación interna del objeto, no URL pública permanente. |
| `original_filename` | texto | R | Nombre presentado al usuario. |
| `mime_type` | texto | R | Tipo validado. |
| `size_bytes` | entero | R | Tamaño. |
| `checksum` | texto | R | Huella para integridad. |
| `uploaded_by` | UUID FK | R | Autor. |
| `uploaded_at` | instante | O | Carga completa. |
| `status` | código | R | Pendiente, disponible, fallido o retirado. |
| `metadata` | JSON validado | O | Datos auxiliares no estructurales. |

**Relaciones y reglas:** Permisos dependen de empresa y entidad vinculada. Un registro puede existir con adjunto pendiente visible.

### `attachment_relations`

Familia de tablas explícitas, no una tabla universal sin FK.  
**Perfil:** Identidad y pertenencia.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `owner_id` | UUID FK concreta | R | Se reemplaza por work_record_id, harvest_record_id, weighing_id, purchase_id u otra FK del módulo. |
| `file_id` | UUID FK | R | Archivo de la misma empresa. |
| `caption` | texto | O | Descripción. |
| `attachment_kind` | código | O | Foto, ticket, comprobante u otra clase admitida. |
| `sort_order` | entero | O | Orden de presentación. |

**Relaciones y reglas:** Implementar tablas como work_record_attachments, harvest_attachments, weighing_attachments, purchase_attachments, observation_attachments y transfer_receipt_attachments. El nombre owner_id es solo notación del patrón.

### `status_history`

Patrón de historial funcional por agregado.  
**Perfil:** Identidad y pertenencia; inmutable.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `aggregate_id` | UUID FK concreta | R | Documento cuya transición se registra. |
| `previous_status` | código | O | Estado anterior. |
| `new_status` | código | R | Estado resultante. |
| `changed_at` | instante | R | Momento servidor. |
| `changed_by` | UUID FK | R | Actor. |
| `reason` | texto | C | Motivo de rechazo, anulación o reapertura. |

**Relaciones y reglas:** Usar FK por módulo o mecanismo validado; no se sustituye con log técnico. Se escribe en la misma transacción de la transición.

### `audit_logs`

Registro técnico de acciones y resultados.  
**Perfil:** Identidad y pertenencia; append-only.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `actor_user_id` | UUID FK | O | Actor o proceso identificado. |
| `action` | código | R | Acción ejecutada. |
| `entity_type` | código | R | Tipo de recurso. |
| `entity_id` | UUID | R | Identidad del recurso. |
| `occurred_at` | instante | R | Hora del servidor. |
| `source` | código | R | Web, Android o proceso. |
| `device_id` | UUID FK | O | Dispositivo. |
| `request_id` | texto | O | Correlación técnica. |
| `result` | código | R | Aceptado, rechazado o error. |
| `before_data` | JSON filtrado | O | Cambios previos relevantes. |
| `after_data` | JSON filtrado | O | Cambios resultantes relevantes. |

**Relaciones y reglas:** No guardar tokens, contraseñas o copias indiscriminadas de datos personales. Los movimientos de negocio siguen existiendo por separado.

### `sync_operations`

Control central de idempotencia de comandos móviles.  
**Perfil:** Identidad y pertenencia; técnico.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `client_operation_id` | UUID | R | Identidad de comando. |
| `device_id` | UUID FK | R | Origen lógico. |
| `operation_type` | código | R | Caso de uso solicitado. |
| `aggregate_id` | UUID | R | Registro afectado. |
| `payload_hash` | texto | R | Detecta reutilización de clave con otros datos. |
| `client_created_at` | instante | R | Hora cliente. |
| `received_at` | instante | R | Hora servidor. |
| `processing_status` | código | R | Aceptada, rechazada o conflicto; en proceso si el diseño lo requiere. |
| `result_payload` | JSON validado | O | Resultado durable de reintento. |
| `error_code` | código | O | Motivo estable corregible. |

**Relaciones y reglas:** Único por empresa y client_operation_id. Una nueva corrección usa nuevo comando; reenvío idéntico devuelve resultado previo.

### `sync_outbox_local`

Cola persistente exclusivamente local; no tabla de negocio central.  
**Perfil:** Local por empresa, usuario e instalación.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `operation_id` | UUID | R | Comando que se enviará. |
| `aggregate_id` | UUID | R | Registro local. |
| `operation_type` | código | R | Acción. |
| `payload` | JSON validado | R | Contenido y versiones requeridas. |
| `dependency_ids` | lista UUID | O | Comandos anteriores necesarios. |
| `state` | código | R | Pendiente, enviando, confirmado, rechazado o conflicto. |
| `attempt_count` | entero | R | Intentos. |
| `next_retry_at` | instante | O | Próximo intento. |
| `last_error` | texto | O | Explicación visible y código estable. |
| `base_version` | entero | O | Versión central sobre la que se editó. |

**Relaciones y reglas:** Se guarda en la misma transacción local que el registro. Adjuntos usan cola complementaria; no borrar antes de confirmación durable.

### `sync_change_feed`

Registro técnico o mecanismo equivalente para descarga incremental.  
**Perfil:** Técnico por empresa.

| Campo | Tipo | Req. | Significado y uso |
|---|---|---|---|
| `sequence` | entero creciente | R | Cursor estable del servidor. |
| `entity_type` | código | R | Tipo modificado. |
| `entity_id` | UUID | R | Registro. |
| `entity_version` | entero | R | Versión. |
| `change_kind` | código | R | Alta, cambio o retiro. |
| `changed_at` | instante | R | Fecha servidor. |

**Relaciones y reglas:** El cursor no se basa solo en relojes móviles. Descarga debe aplicar alcances; pérdida de permisos retira copias locales según política sin exponer datos nuevos.

## 15. Cardinalidades principales

| Relación | Cardinalidad y significado |
|---|---|
| Empresa → chacras → lotes | Una empresa tiene muchas chacras; una chacra muchos lotes. |
| Lote → implantaciones | Historial de una o varias implantaciones; simultaneidad exige sectores y reglas. |
| Cultivo → variedades | Una variedad pertenece a un cultivo; el perfil no crea otro cultivo. |
| Implantación → ciclos | Un ciclo pertenece a una implantación; una implantación conserva muchos ciclos. |
| Campaña → ciclos | Una campaña agrupa varios ciclos; inicialmente un ciclo tiene como máximo una campaña. |
| Labor → participaciones / consumos | Cada detalle pertenece a una labor. |
| Compra → recepciones | Varias recepciones parciales para la misma compra. |
| Transferencia → recepciones | Varias recepciones para un despacho. |
| Cosecha → detalles → partida | La cosecha conserva origen; cada detalle identifica producto y partida. |
| Entrega ↔ detalles de cosecha | Muchos a muchos mediante líneas de entrega; permite dividir y reunir partidas. |
| Documento → obligación | Una obligación de origen único por documento en el esquema simple. |
| Pago/cobro ↔ obligación | Muchos a muchos mediante imputaciones, con límites de importe. |
| Fuente de costo → asignaciones | Una fuente se distribuye sin crear costo adicional. |

## 16. Decisiones de integridad que deben quedar en la especificación

1. Códigos y referencias externas tienen ámbitos de unicidad explícitos; un número de ticket por sí solo no es necesariamente único globalmente.
2. Cada FK tenant-scoped concuerda con company_id; las referencias a catálogos globales son excepciones deliberadas de solo lectura.
3. Fechas de fin no son anteriores al inicio. Cantidades confirmadas respetan signo, unidad y contexto.
4. Un estado confirmado exige datos mínimos completos; borradores pueden conservar incompletos identificados.
5. Los enlaces documentales que generen movimientos o pagos son únicos por línea y efecto.
6. No se borran productos, empleados o implantaciones que explican historia; se inactivan.
7. Sincronización, aprobación y estado físico son dimensiones distintas.
8. Ningún JSON introduce referencias de empresa sin validación o reemplaza integridad de stock/dinero.
9. Informes históricos usan superficie, conversión, precio y tarifa aplicados, no los valores actuales del maestro.
10. Campos opcionales no deben llenarse con cero si el dato es desconocido. Cero conocido y ausencia de dato son distintos.

## 17. Puente con el documento inicial

| Nombre inicial | Propuesta actual |
|---|---|
| crop_types | crops, con crop_groups opcional. |
| lot_plantings | Se conserva; variedad principal y eventos históricos explícitos. |
| campaigns / campaign_lots | campaigns + production_cycles como propuesta con responsabilidades separadas. |
| work_types.crop_type_id | work_type_crops para compatibilidad múltiple. |
| harvest_records.quantity | harvest_items para varias partidas/clasificaciones y bases de cantidad. |
| harvest_deliveries.harvest_record_id | harvest_delivery_items permite combinar y dividir orígenes. |
| suppliers / destinos con identidad repetida | business_parties + roles y destinos físicos. |
| payments / receipts | cash_transactions + payment_allocations. |
| products.minimum_stock | warehouse_product_settings.minimum_stock. |
| Stock pendiente/confirmado en una tabla | Documentos pendientes y libro de movimientos solo confirmados. |

No se exige implementar simultáneamente todas las extensiones. Las entidades de ampliación se incorporan por circuito completo; mientras tanto, la interfaz debe indicar claramente qué procesos no están habilitados.

## 18. Reglas para interpretar anulaciones y compensaciones

- **Libro físico:** el movimiento original conserva su efecto firmado y la compensación agrega el efecto opuesto. La suma incluye ambos. No excluir el original por estar compensado y además sumar su inverso, porque produciría una diferencia falsa.
- **Dinero:** una compensación conserva importe positivo y dirección opuesta a la original, con `reversal_of_id`. Los saldos incluyen ambas direcciones; el estado revertido del original es informativo, no una instrucción para descontarlo otra vez.
- **Imputaciones:** en el esquema propuesto, la aplicación original pasa a revertida y deja de cancelar saldo. Si se crea una fila de compensación para el historial, no se cuenta como una aplicación vigente adicional. La especificación física debe elegir esta convención y probarla.
- **Obligaciones:** `cancelada por pago/cobro` significa saldo económico agotado. `Anulada` significa documento invalidado conforme al circuito; no son el mismo estado.
- **Cantidades de producción:** las anulaciones y sustituciones generan netos trazables. La entrega y la cosecha no se netean entre sí: representan hechos distintos.

## 19. Obligatorios por momento de uso

| Momento | Requisitos |
|---|---|
| Crear borrador | Identidad, empresa y autor; contexto mínimo que permita recuperar el trabajo. |
| Presentar | Datos que el revisor necesita; faltantes visibles. |
| Confirmar | Todos los R y todos los C cuya condición se cumpla; referencias y efectos válidos. |
| Anular/compensar | Motivo, actor, referencia original y resolución de dependencias. |
| Consultar historia | Poder interpretar versión, unidad, origen y estado incluso con maestros inactivos. |

La letra R de una tabla describe el registro válido para su uso operativo definitivo; no obliga a perder un borrador de campo porque falta un dato que todavía debe obtenerse.
