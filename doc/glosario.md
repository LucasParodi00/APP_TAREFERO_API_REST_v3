---
type: glossary
status: Aprobado
owner: "Ingeniero"
---

# Glosario

<!-- Qué define este archivo: doc/proceso/reglas-documentacion.md §3.
Regla para agentes: toda palabra del brief, de una conversación o de una pregunta se traduce al término CANÓNICO antes de escribir especificación o código. Si una palabra no está en este glosario y tiene significado de negocio, se abre una pregunta; nunca se supone su significado.
El brief no se reescribe: la normalización ocurre al derivar la especificación. -->

## 1. Roles

### SuperAdministrador

- **Sinónimos aceptados:** superadmin, dueño de la aplicación
- **Nombre en código:** `SUPER_ADMINISTRADOR`
- **Descripción:** persona responsable de administrar la plataforma Tarefero y sus funciones globales. No pertenece funcionalmente a una Empresa cliente determinada.
- **Alcance:** toda la plataforma, sin acceso implícito a los datos de negocio de las Empresas cliente
- **No confundir con:** Desarrollador, que describe una función técnica y no concede por sí misma permisos de producción; Administrador, cuyo alcance pertenece a una Empresa cliente

### Administrador

- **Sinónimos aceptados:** admin, gerente, dueño de la empresa
- **Nombre en código:** `ADMINISTRADOR`
- **Descripción:** persona que administra una Empresa cliente desde la aplicación web. Gestiona usuarios, empleados, configuraciones y operaciones administrativas de la empresa según sus permisos.
- **Alcance:** una Empresa cliente
- **No confundir con:** SuperAdministrador; Empresa cliente, que es la organización administrada y no una persona

### Capataz

- **Sinónimos aceptados:** encargado de campo
- **Nombre en código:** `CAPATAZ`
- **Descripción:** Empleado con mayor responsabilidad operativa que utiliza principalmente la aplicación móvil para registrar labores, asistencia, observaciones, cosechas y otros hechos ocurridos en el campo.
- **Alcance:** una Empresa cliente y los recursos de campo que tenga asignados
- **No confundir con:** Administrador; encargado de almacén, que cumple otra responsabilidad

### Empleado

- **Sinónimos aceptados:** tarefero
- **Nombre en código:** `EMPLEADO`
- **Descripción:** persona registrada laboralmente por una Empresa cliente. Puede participar en labores, asistencia y cosechas sin tener necesariamente acceso al sistema.
- **Alcance:** una Empresa cliente
- **No confundir con:** Usuario; Capataz, que es un Empleado con responsabilidad operativa y acceso cuando corresponda

## 2. Términos del dominio

### Acceso activo

- **Definición:** estado de una Cuenta de Empresa que permite autenticarse y operar dentro de esa Empresa cliente. Su disponibilidad está sujeta a los permisos y a los límites de la Suscripción de Empresa vigente.
- **Sinónimos aceptados:** usuario habilitado
- **No usar:** tiene acceso como único estado booleano
- **Nombre en código:** `AccesoActivo`
- **Módulo dueño:** `ACC`
- **Ejemplo:** una Cuenta de Empresa activa ocupa uno de los accesos permitidos por la Suscripción de Empresa.

### Almacén

- **Definición:** ubicación física o lógica de una Empresa cliente en la que se custodian Artículos.
- **Sinónimos aceptados:** depósito, galpón
- **No usar:** stock o existencia para nombrar la ubicación
- **Nombre en código:** `Almacen`
- **Módulo dueño:** `INV`
- **Ejemplo:** depósito central de insumos de una chacra.

### Artículo

- **Definición:** bien tangible que puede comprarse, almacenarse, consumirse o producirse y cuya cantidad puede controlarse.
- **Sinónimos aceptados:** producto
- **No usar:** Servicio
- **Nombre en código:** `Articulo`
- **Módulo dueño:** `INV`
- **Ejemplo:** fertilizante, bolsa, combustible o producto obtenido de una cosecha.

### Chacra

- **Definición:** establecimiento físico administrado por una Empresa cliente. Contiene uno o más Lotes y conserva su propia identidad territorial.
- **Sinónimos aceptados:** establecimiento
- **No usar:** Empresa o tenant
- **Nombre en código:** `Chacra`
- **Módulo dueño:** `TER`
- **Ejemplo:** una Empresa cliente administra tres Chacras ubicadas en localidades diferentes.

### Configuración de empresa

- **Definición:** conjunto de decisiones configurables que adaptan comportamientos permitidos para una Empresa cliente. Cada configuración tiene tipo, validación y módulo dueño; no constituye una bolsa libre de valores.
- **Sinónimos aceptados:** configuración del tenant
- **No usar:** configuración genérica para guardar reglas de negocio, referencias, stock, dinero o código ejecutable
- **Nombre en código:** `ConfiguracionEmpresa`
- **Módulo dueño:** el módulo responsable de cada configuración
- **Ejemplo:** modalidad de remuneración en Personal o flujo de confirmación en Labores.

### Cuenta de Empresa

- **Definición:** relación de acceso mediante la cual una persona opera dentro de una Empresa cliente con estado, roles, permisos y alcance propios de esa Empresa.
- **Sinónimos aceptados:** cuenta de acceso de empresa, usuario interno con acceso
- **No usar:** Membresía; Suscripción de Empresa; Empleado o Usuario como sustituto de la relación
- **Nombre en código:** `CuentaEmpresa`
- **Módulo dueño:** `ACC`
- **Ejemplo:** el Administrador inicial recibe una Cuenta de Empresa activa creada durante el alta del cliente SaaS.

### Empresa cliente

- **Definición:** organización que contrata Tarefero mediante una Suscripción de Empresa y utiliza la plataforma como tenant propietario de sus cuentas de acceso, empleados, configuraciones y datos de negocio.
- **Sinónimos aceptados:** empresa, tenant, cliente de Tarefero
- **No usar:** Chacra o establecimiento
- **Nombre en código:** `Empresa`
- **Módulo dueño:** `EMP`
- **Ejemplo:** una Empresa cliente puede administrar varias Chacras bajo los límites de su Suscripción de Empresa.

### Existencia

- **Definición:** cantidad disponible de un Artículo en un Almacén y contexto de partida determinados, explicada por movimientos confirmados.
- **Sinónimos aceptados:** stock
- **No usar:** Almacén, depósito o galpón
- **Nombre en código:** `Existencia`
- **Módulo dueño:** `INV`
- **Ejemplo:** 300 kilogramos de fertilizante disponibles en el depósito central.

### Insumo

- **Definición:** Artículo utilizado o consumido durante una labor u otra operación de la Empresa cliente.
- **Sinónimos aceptados:** producto consumido
- **No usar:** Servicio
- **Nombre en código:** `Insumo`
- **Módulo dueño:** `INV`
- **Ejemplo:** fertilizante consumido durante una labor de aplicación.

### Lote

- **Definición:** subdivisión territorial u operativa de una Chacra en la que puede desarrollarse actividad productiva. No conserva un cultivo permanente como parte de su identidad.
- **Sinónimos aceptados:** ninguno
- **No usar:** partida de Artículo
- **Nombre en código:** `Lote`
- **Módulo dueño:** `TER`
- **Ejemplo:** lote norte de una Chacra, cuya Implantación puede cambiar con el tiempo.

### Plan de suscripción

- **Definición:** nivel comercial del catálogo SaaS que establece capacidades y límites contratables. Inicialmente se contemplan tres niveles; sus nombres y límites concretos permanecen pendientes.
- **Sinónimos aceptados:** plan SaaS, plan comercial
- **No usar:** Suscripción de Empresa; plan de implementación
- **Nombre en código:** `PlanSuscripcion`
- **Módulo dueño:** `SUS`; su desarrollo funcional se realizará al final del proyecto
- **Ejemplo:** un Plan de suscripción puede ofrecer un cupo determinado de Cuentas de Empresa activas y Chacras.

### Producto obtenido

- **Definición:** Artículo originado por una cosecha u otro proceso productivo y que puede almacenarse o entregarse conservando su procedencia.
- **Sinónimos aceptados:** producción obtenida
- **No usar:** Insumo cuando se describe su origen productivo
- **Nombre en código:** `ProductoObtenido`
- **Módulo dueño:** `INV`
- **Ejemplo:** yerba mate verde recolectada durante una cosecha.

### Servicio

- **Definición:** prestación intangible realizada o contratada que no genera una Existencia por sí misma.
- **Sinónimos aceptados:** prestación
- **No usar:** Artículo o Producto
- **Nombre en código:** `Servicio`
- **Módulo dueño:** `LAB`
- **Ejemplo:** servicio contratado para cortar el pasto.

### Suscripción de Empresa

- **Definición:** relación comercial mediante la cual una Empresa cliente contrata un Plan de suscripción durante una vigencia y recibe sus capacidades y límites. Pertenece a la Empresa, no a una persona.
- **Sinónimos aceptados:** suscripción SaaS de la Empresa, contrato SaaS
- **No usar:** Membresía; suscripción del Usuario; Plan de suscripción como sustituto de la relación contratada
- **Nombre en código:** `SuscripcionEmpresa`
- **Módulo dueño:** `SUS`; su desarrollo funcional se realizará al final del proyecto
- **Ejemplo:** al contratar Tarefero, la Empresa obtiene una Suscripción de Empresa que limita sus Cuentas de Empresa activas, Chacras y otros recursos definidos por el Plan de suscripción.

### Usuario

- **Definición:** persona reconocida por Tarefero que puede recibir acceso a una o más Empresas cliente. Su autorización y estado dentro de cada Empresa se expresan mediante una Cuenta de Empresa; la ubicación definitiva de sus credenciales depende de la decisión pendiente del módulo `ACC`.
- **Sinónimos aceptados:** usuario del sistema
- **No usar:** Empleado; no toda persona registrada laboralmente necesita acceso
- **Nombre en código:** `Usuario`
- **Módulo dueño:** `ACC`
- **Ejemplo:** un Capataz puede ser un Empleado vinculado a un Usuario con una Cuenta de Empresa activa.

## 3. Palabras que siempre requieren pregunta

| Palabra | Por qué es ambigua |
|---|---|
| cliente | Puede referirse a una Empresa cliente de Tarefero o a quien compra producción a esa empresa. Usar siempre el término completo. |
| dueño | Puede ser el dueño de una Empresa cliente —Administrador— o el dueño de la aplicación —SuperAdministrador—. |
| encargado | Puede referirse al Capataz, al encargado de un Almacén o a otra responsabilidad. |
| membresía | Puede aludir de forma imprecisa a la Suscripción de Empresa o a una Cuenta de Empresa. No se usa como término canónico. |
| plan | Puede ser un Plan de suscripción, un plan de implementación o una planificación operativa. |
| responsable | Puede ser contacto de la Empresa cliente, actor de una operación, representante legal u otra persona. |
| ubicación | Puede ser domicilio textual, punto geográfico, Chacra, Lote o Almacén. |
| forma de pago | Puede significar medio de pago económico o modalidad de remuneración de un Empleado. |
| tarea | Puede significar una Labor del campo, una orden planificada o una tarea técnica del proyecto. |
| producto | Puede nombrar genéricamente un Artículo, un Insumo o un Producto obtenido; precisar el contexto cuando afecte reglas. |
