# Tarefero — 03. Flujos operativos, estados y trazabilidad

**Versión:** 1.0 · **Fecha:** 23 de octubre de 2026  
**Estado:** procesos propuestos para validación funcional.

## Responsabilidad de este archivo

Explica cómo se conectan los módulos, qué registra cada paso, qué efectos produce y cómo se manejan diferencias, rechazos y correcciones. El alcance está en el archivo 01; las entidades y campos en el 02; las garantías técnicas en el 04.

Los actores nombrados son responsabilidades, no roles obligatorios con esos nombres. Cada acción exige un permiso y un alcance. Los ejemplos son operativos; no constituyen recomendaciones agronómicas ni reglas de liquidación legal.

## 1. Reglas comunes a los procesos

### 1.1 Captura y confirmación

Un borrador permite guardar trabajo incompleto. Presentar solicita revisión cuando el proceso la requiere. Confirmar reconoce un hecho y ejecuta sus efectos centrales. No todos los módulos necesitan revisión previa: una observación puede registrarse directamente, mientras que un ajuste de stock puede exigir autorización.

Los datos necesarios se validan al confirmar, además de las validaciones de formato en captura. El servidor verifica empresa, permisos, referencias, vigencia, cantidades y estado actual. Una confirmación fallida no debe dejar efectos físicos o monetarios parciales ocultos.

### 1.2 Fechas distintas

- Fecha del hecho: cuándo se trabajó, cosechó, recibió o pagó.
- Fecha de captura: cuándo el usuario lo registró.
- Fecha de recepción central: cuándo llegó del dispositivo.
- Fecha de confirmación: cuándo el sistema aceptó sus efectos.

Registrar tarde no significa que la operación ocurrió ese día. El sistema debe mostrar la diferencia cuando sea relevante y controlar imputaciones en períodos cerrados.

### 1.3 Estados independientes

| Dimensión | Ejemplo | Qué informa |
|---|---|---|
| Negocio | Labor presentada | Situación operativa. |
| Sincronización | Pendiente de envío | Si existe confirmación central. |
| Efecto de stock | Consumo rechazado por falta de saldo | Si se generó movimiento. |
| Adjunto | Ticket pendiente de subir | Disponibilidad de evidencia. |
| Pago | Compra parcialmente pagada | Saldo económico derivado. |

Una labor sincronizada puede seguir pendiente de revisión. Una cosecha confirmada puede tener un adjunto pendiente. Una compra confirmada puede no estar recibida ni pagada.

### 1.4 Correcciones

- Maestros: modificar con versión y auditoría; cambios históricos relevantes necesitan vigencia o eventos.
- Borradores: editar o descartar conforme a permisos.
- Observaciones registradas: corregir conservando versiones o sustituir con referencia al anterior.
- Movimientos físicos y monetarios confirmados: compensar/revertir de manera explícita.
- Documentos con operaciones dependientes: resolver dependencias antes de anular; no ocultarlas mediante cascadas.

## 2. Alta de empresa y preparación

**Actor:** administrador autorizado.  
**Entrada:** identidad de la empresa, zona horaria y moneda.  
**Salida:** empresa operativa con permisos y catálogos mínimos.

1. Crear empresa y membresía inicial del administrador.
2. Definir roles y permisos de operaciones reales: captura, revisión, confirmación, ajuste, pago y consulta.
3. Registrar chacras y almacenes.
4. Activar cultivos y variedades que se utilizarán.
5. Publicar perfiles iniciales simples por cultivo.
6. Cargar unidades, productos, labores, medios y condiciones de pago.
7. Invitar usuarios o crear accesos; vincular empleados si corresponde.
8. Asignar alcances y habilitar dispositivos.
9. Registrar existencias iniciales mediante ajuste autorizado con fecha y evidencia disponible.

**Validaciones:** códigos sin duplicar dentro de su ámbito; usuario con acceso a empresa correcta; no editar plantillas globales desde una empresa.

**Trazabilidad:** altas, asignaciones de permisos, versión de perfiles y saldos iniciales quedan identificados. Una carga inicial no debe presentarse como recepción de una compra inexistente.

## 3. Chacra, lote e implantación

**Actor:** administrador o encargado habilitado.

1. Registrar chacra y datos administrativos conocidos.
2. Crear lote; dibujar geometría o dejarla pendiente de relevamiento.
3. Guardar superficie cartográfica calculada y, por separado, productiva declarada.
4. Registrar implantación: cultivo, variedad principal si se conoce, vigencia y perfil.
5. Si comparte lote con otra implantación, identificar sector y superficie sin duplicar el área total en reportes.
6. Iniciar ciclo productivo cuando el módulo esté habilitado.
7. Registrar replantes/bajas como eventos; vincular una labor si corresponde.

**Caso: reemplazo de cultivo.** Finalizar implantación anterior, conservar sus operaciones y crear la nueva. No cambiar crop_id de la anterior.

**Caso: cambio de polígono.** Conservar versión y motivo cuando afecte historia. Las métricas anteriores mantienen su superficie de referencia. Una división o unión territorial requiere nuevos lotes y relación de antecedente documentada; no reutilizar un ID para representar otro espacio sin decisión explícita.

**Criterio de aceptación:** al consultar una labor antigua se ve la implantación que existía entonces, aunque el lote tenga hoy otro cultivo.

## 4. Campaña y ciclo productivo

**Propuesta de operación inicial:** una campaña agrupa ciclos; cada ciclo pertenece a una implantación y como máximo a una campaña principal.

1. Crear campaña con propósito, fechas y alcance.
2. Crear o seleccionar ciclos de las implantaciones participantes.
3. Registrar superficie de referencia por ciclo si se utilizará para rendimiento.
4. Asociar labores, cosechas y observaciones al ciclo pertinente; las tareas generales pueden imputarse a campaña sin ciclo.
5. Mostrar registros sin imputación para revisión; no asignar automáticamente por coincidencia de fechas si hay ambigüedad.
6. Antes de cerrar, listar borradores, consumos no resueltos, producción no conciliada y costos incompletos.
7. Cerrar mediante permiso y conservar resumen/versión de cálculo si se emiten informes consolidados.
8. Reabrir solo con motivo y registro de responsable; una nueva edición debe permitir distinguir informes anteriores.

**Reglas:** las fechas de implantación, ciclo y campaña tienen propósitos distintos. Un pago posterior puede cancelar una deuda de campaña cerrada sin cambiar la fecha del gasto. El cierre no hace desaparecer stock ni saldos pendientes.

**Pendiente:** restricciones exactas de solapamiento entre ciclos de una implantación. La solución inicial debe evitar dos ciclos indistinguibles, sin imponer una regla anual universal.

## 5. Personal y tarifas

1. Registrar empleado con datos necesarios, evitando duplicados conocidos.
2. Asignar categoría interna si se utiliza.
3. Crear cuadrilla y altas de pertenencia con vigencia.
4. Definir modalidades de remuneración que realmente se usarán.
5. Registrar tarifas con vigencia y alcance.
6. Definir precedencia inequívoca entre tarifa individual, categoría y labor antes de calcular.
7. Al confirmar una participación remunerable, guardar cantidad, tarifa, moneda, fórmula implementada y resultado aplicado.

**Cambio de tarifa:** cerrar vigencia anterior y abrir nueva. No recalcular historia automáticamente.

**Cambio de cuadrilla:** finalizar pertenencia y crear otra. Las labores conservan las personas que participaron realmente.

**Empleado sin usuario:** permitido. Un capataz registra su trabajo; el actor de captura queda separado del trabajador.

## 6. Asistencia

**Actor:** capataz o encargado, desde móvil o web.

1. Seleccionar día y empleados.
2. Registrar presencia/ausencia y novedades.
3. Capturar intervalos de trabajo y descanso cuando se maneje horario.
4. Guardar localmente si no hay conexión.
5. Sincronizar y resolver posibles duplicados o conflictos de la misma persona/día.
6. Revisar y confirmar si la empresa requiere ese control.
7. Comparar tiempo de asistencia con tiempo imputado a labores.

**Ejemplo:** una persona registra 8 horas de trabajo, imputa 5 a desmalezado y 2 a mantenimiento; queda 1 hora sin imputar. El sistema muestra la diferencia; no inventa una tarea para completar el total.

**Validaciones:** intervalos coherentes, ausencia incompatible con intervalos activos, pausas tratadas según política, fechas por zona de empresa y permiso sobre el personal. La política ante exceso de horas imputadas debe decidir si bloquea o pide justificación; no corregir automáticamente.

**Corrección:** conservar actor, motivo y valores anteriores. Si la asistencia ya influyó en un resumen remunerativo confirmado, informar el impacto y generar el ajuste pertinente.

## 7. Planificación y ejecución de labores

### 7.1 Planificación opcional

1. Crear orden con tipo, ubicación, fecha y responsables.
2. Asignar cuadrilla y recursos previstos.
3. Ejecutar mediante uno o varios registros reales.
4. Comparar planificado con ejecutado.
5. Completar o cancelar la orden con motivo.

Cancelar una orden no anula las ejecuciones ya realizadas.

### 7.2 Registro de ejecución

1. Seleccionar tipo de labor y contexto permitido: chacra, lote, implantación o instalación.
2. Elegir ciclo cuando corresponda.
3. Registrar fecha, superficie realmente trabajada y observaciones.
4. Agregar participantes con tiempos individuales.
5. Agregar insumos declarados, almacén de origen y partidas requeridas.
6. Agregar maquinaria cuando esté habilitada.
7. Adjuntar evidencia disponible.
8. Guardar, presentar y confirmar conforme al flujo configurado.

**Ejemplo:** una labor dura 6 horas de reloj; una persona participa 6 horas y otra 3. Son 9 horas-persona. La duración del trabajo no reemplaza el tiempo individual.

### 7.3 Confirmación de recursos

- Confirmar participación valida tarifa y conserva snapshot de costo cuando el módulo económico esté habilitado.
- Confirmar un consumo valida saldo y genera una única salida.
- Si un insumo no puede confirmarse, mostrarlo como pendiente/rechazado; no afirmar que todo el efecto de recursos está confirmado.
- Si se adopta confirmación atómica de todos los recursos, fallar el conjunto sin movimientos parciales. La elección entre atómica y por línea debe cerrarse en la especificación del módulo.

### 7.4 Tareas generales

Reparar un camino se asocia a chacra y eventualmente lote. Mantener un almacén identifica la instalación. No se inventa una implantación para poder guardar la tarea. Los costos generales pueden quedar sin distribución productiva hasta que se aplique un criterio explícito.

## 8. Compra, recepción y pago

### 8.1 Compra administrativa

1. Seleccionar proveedor.
2. Registrar documento, moneda, fecha, vencimiento y líneas.
3. Validar cantidades, precios, descuentos y totales.
4. Confirmar compra y generar/proyectar la obligación a pagar.
5. Dejar recepción y pago como situaciones independientes.

Una orden formal de compra, si se incorpora después, es planificación previa; no debe crear deuda definitiva hasta el evento administrativo elegido.

### 8.2 Recepción física

1. Elegir compra y líneas pendientes.
2. Registrar almacén, fecha y receptor.
3. Capturar cantidad efectivamente recibida, unidad y partida si aplica.
4. Conservar conversión utilizada a unidad base.
5. Confirmar en una transacción: recepción, líneas y entradas de stock.
6. Actualizar cantidades pendientes como resultado derivado.

**Ejemplo:** se compran 20 bolsas de contenido fijo de 25 kg; se reciben 12. Ingresan 300 kg y quedan 8 bolsas por recibir. La deuda depende del documento administrativo acordado, no de asumir que recepción parcial equivale a pago parcial.

**Diferencias:** sobreentregas requieren tolerancia o autorización explícita. Mercadería rechazada no ingresa como disponible. Si se necesita cuarentena, se incorpora una ubicación o estado físico antes de habilitar ese circuito.

### 8.3 Pago

1. Registrar cuenta, medio, fecha, importe y contraparte.
2. Confirmar movimiento monetario.
3. Aplicar a una o varias obligaciones compatibles.
4. Mostrar saldo pendiente y, si sobra dinero sin aplicar, anticipo disponible.

**Ejemplo:** compra por 100.000; pago de 40.000 aplicado a esa obligación; saldo 60.000. Una recepción nueva no crea otro pago ni vuelve a generar la deuda.

### 8.4 Devolución

La devolución identifica recepción, línea, partida y cantidad. Genera salida física. Una nota administrativa ajusta la deuda cuando se reconoce el crédito. Si ya se pagó, puede quedar saldo a favor o un reintegro; no simular que el pago nunca existió.

## 9. Transferencia entre almacenes

### 9.1 Solicitud y despacho

1. Crear traslado indicando origen y destino distintos de la misma empresa.
2. Seleccionar productos, partidas y cantidades.
3. Revisar disponibilidad central.
4. Confirmar despacho: salida del origen y entrada a ubicación lógica de tránsito, de manera atómica.
5. Conservar responsable, fecha, documento y movimientos relacionados.

### 9.2 Recepción

1. El receptor consulta el despacho.
2. Registra lo efectivamente recibido por línea.
3. Confirma: salida de tránsito y entrada al destino, atómicamente.
4. Si la recepción es parcial, el remanente permanece visible en tránsito.
5. Resolver diferencia mediante recepción posterior, devolución o baja autorizada.

**Ejemplo:** salen 100 kg y llegan 95. Origen pierde 100, destino recibe 95 y quedan 5 en tránsito hasta resolución. No se agregan 100 al destino ni desaparecen 5 sin explicación.

**Invariante:** una transferencia sin pérdidas cambia ubicación, no cantidad total de empresa. Los movimientos de tránsito deben excluirse de duplicaciones en reportes, aunque cuenten como custodia de empresa.

**Anulación:** antes del despacho puede cancelarse. Después se resuelve con movimientos compensatorios; no borrar salida y recepción ya ocurridas.

## 10. Consumo, recuento y ajuste

### 10.1 Consumo de labor

1. El encargado declara artículo, cantidad, unidad, almacén y partida.
2. El servidor valida contexto y existencia.
3. Aplica conversión conservada, verifica saldo y costo.
4. Genera salida única vinculada al consumo.
5. El reporte atribuye el consumo al destino productivo de la labor.

La disponibilidad mostrada offline es informativa y puede estar desactualizada. Rechazar la confirmación central no debe borrar la declaración de que el insumo se usó físicamente: queda una incidencia para corregir origen, recepción faltante o diferencia autorizada.

### 10.2 Recuento físico

1. Definir almacén y fecha/corte de recuento.
2. Registrar cantidades contadas por artículo y partida.
3. Comparar con saldo de ese corte.
4. Conciliar movimientos ocurridos durante el recuento.
5. Autorizar diferencias y generar ajustes con motivo.

Un recuento no es una asignación directa a una columna de saldo. No se confirma una diferencia calculada sobre una versión obsoleta sin revisión.

## 11. Observaciones fenológicas, sanitarias y generales

1. Elegir ubicación y, para observaciones de cultivo, implantación.
2. Registrar fecha observada, tipo y descripción.
3. Seleccionar etapa compatible si es fenológica.
4. Registrar problema observado, severidad opcional y condición de sospecha/verificación si es sanitaria.
5. Agregar sector, muestra o mediciones si aportan utilidad.
6. Adjuntar fotos y guardar.
7. Vincular una orden/labor de seguimiento mediante una relación explícita si se implementa ese seguimiento.

**Captura básica válida:** “Se observa amarillamiento en el sector sur”, con fecha, implantación, autor y foto opcional.

**Captura avanzada:** además identifica muestra, cantidad observada y parámetros medidos. No se exige este nivel a todos.

**Reglas:** el catálogo de etapas ayuda a organizar; su orden no obliga a una transición automática. Distintos sectores pueden tener observaciones diferentes el mismo día. Registrar una observación no genera consumos ni recomienda automáticamente un tratamiento.

## 12. Cosecha y trabajo asociado

### 12.1 Registro

1. Elegir implantación y ciclo.
2. Crear cosecha con fecha y responsable.
3. Vincular labor de cosecha existente o crear la vinculada de manera controlada.
4. Registrar líneas de producto, partida, clasificación y cantidad.
5. Identificar base de cantidad: estimada, medida o pesada.
6. Registrar pesajes y adjuntos disponibles.
7. Elegir ruta inicial por línea: almacén o entrega directa.
8. Confirmar los datos y efectos correspondientes.

### 12.2 Fuente de verdad de cantidades y tiempos

- La producción recolectada se reconoce en los detalles de cosecha.
- La distribución por trabajador se reconoce en harvest_employee_entries.
- El tiempo y costo laboral se reconocen en work_employee_entries.
- La relación entre ambas atribuye una base de producción al cálculo remunerativo sin duplicarlo.
- La vista de labor puede mostrar producción vinculada, pero no sumar una copia como otra cosecha.

### 12.3 Pesaje

Registrar bruto, tara, neto derivado, unidad, balanza, fecha y ticket. Un nuevo pesaje puede ser otra medición del mismo envío; identificar cuál respalda la cantidad confirmada y cuál se tomó en destino. Si cambia la cantidad después de generar efectos, usar corrección y ajustes relacionados, no sobrescribir historia.

### 12.4 Producción almacenada

Confirmar línea genera una entrada a almacén por producto y partida. Más tarde puede transferirse o entregarse mediante salidas. El saldo físico se consulta por los movimientos.

### 12.5 Entrega directa

La línea conserva cantidad disponible para asignar a entrega sin inventar una recepción en almacén. La confirmación de entregas controla la cantidad neta asignada para evitar sobreentrega. “No almacenado” no significa “sin trazabilidad”.

### 12.6 Ejemplo multicultivo

La interfaz de yerba puede presentar el producto y las clasificaciones que el productor utiliza. La de naranja puede ofrecer otras clasificaciones y registrar envases además del peso cuando se implemente ese detalle. La de pecán puede permitir una medición adicional elegida por el usuario. Todas conservan la misma estructura de origen, fecha, producto, partida, cantidad, unidad y evidencia.

No se definen aquí valores técnicos obligatorios para esos cultivos: se validan con quienes operarán el sistema.

## 13. Entrega, recepción en destino e ingreso

1. Crear entrega y destino.
2. Seleccionar una o varias líneas de cosecha con sus cantidades.
3. Identificar almacén de salida si hubo almacenamiento.
4. Confirmar despacho: generar salida física o asignación directa según ruta.
5. Registrar recepción reconocida por destino y evidencia.
6. Comparar enviado, pesado y aceptado por línea.
7. Resolver diferencias sin alterar lo originalmente recolectado.
8. Cuando exista importe acordado, registrar ingreso administrativo y vincular cantidades liquidadas.
9. Registrar cobro e imputación cuando efectivamente ocurra.

**Ejemplo:** se recolectan 1.000 kg, se despachan 980 y destino reconoce 970. Los 20 no despachados mantienen su situación física; los 10 de diferencia se concilian con motivo. El precio puede reconocerse después. Ninguna de esas cantidades implica por sí misma que se cobró.

**Entrega conjunta:** reúne partidas de diferentes cosechas sin perder los orígenes por línea. La cabecera no declara falsamente un único lote territorial.

**Devolución de producción:** antes de habilitarla debe especificarse documento de retorno, partida, cantidades, entrada física y ajuste comercial. No se resuelve editando la entrega original. Es una ampliación pendiente si el piloto necesita ese circuito.

## 14. Costos y remuneraciones de gestión

### 14.1 Costos directos

- Mano de obra: participaciones confirmadas con tarifa aplicada.
- Insumos: consumos confirmados con valuación aplicada.
- Maquinaria: uso y método de costo cuando esté habilitado.
- Servicios/gastos: documento fuente e imputación explícita.

Compra inventariable, recepción, consumo y pago son eventos distintos. Para costo productivo se reconoce la fuente apropiada; no se suma compra + consumo + pago del mismo insumo.

### 14.2 Distribución de costos generales

1. Seleccionar gasto/costo fuente.
2. Elegir destinos.
3. Elegir criterio: superficie, horas, producción o porcentaje.
4. Guardar bases históricas y resultado.
5. Verificar que no se distribuye más del importe fuente.
6. Mostrar costo directo y asignado por separado.

Modificar el área actual de un lote no cambia una distribución ya confirmada.

### 14.3 Remuneración de gestión y pago

1. Seleccionar empleado y período.
2. Reunir participaciones remunerables no incluidas previamente.
3. Revisar bases y ajustes explícitos.
4. Confirmar resumen gerencial y obligación.
5. Registrar pago e imputación.
6. Corregir posteriormente mediante diferencias documentadas.

El pago cancela saldo; no crea una segunda mano de obra en costos. El resumen no se denomina recibo legal de sueldo sin implementar y validar ese alcance.

## 15. Operación offline y recuperación

1. El dispositivo descarga datos autorizados, catálogos y versiones publicadas.
2. El usuario registra operación; datos y comando se guardan juntos en Room.
3. La pantalla muestra estado local y si existe efecto central confirmado.
4. Al recuperar conectividad se envían dependencias antes de operaciones hijas.
5. El servidor verifica idempotencia y versión.
6. Procesa transacción y conserva resultado durable.
7. Responde por comando: aceptado, ya procesado, rechazado o conflicto.
8. El móvil actualiza únicamente la versión pertinente, sin pisar cambios locales posteriores.
9. Los archivos se cargan por circuito separado y reintentable.
10. Las descargas incrementales incorporan cambios centrales y retiros autorizados.

### 15.1 Casos que deben resolverse

| Caso | Comportamiento esperado |
|---|---|
| Se perdió respuesta después de confirmar | Reenvío con misma clave devuelve resultado sin duplicar. |
| Misma clave con contenido distinto | Rechazo por reutilización indebida; nueva corrección usa nueva clave. |
| Dos dispositivos editan misma labor | Conflicto visible por versión; no última escritura silenciosa. |
| Falta stock central | Declaración preservada y efecto pendiente/rechazado, con resolución explícita. |
| Perfil cambió mientras estaba offline | Interpretar versión capturada o exigir migración explícita. |
| Foto no sube | Registro conservado y adjunto pendiente visible. |
| Usuario perdió permiso | No confirmar operación prohibida; preservar incidencia y ofrecer resolución administrativa autorizada. |
| Catálogo se inactivó | Evaluar fecha y versión; no sustituir por otro valor automáticamente. |
| Reloj móvil incorrecto | Conservar hora cliente y servidor; no ordenar efectos solo por reloj local. |
| App se cierra durante envío | Cola persistente permite reintentar. |

## 16. Estados propuestos por proceso

| Proceso | Recorrido normal | Salidas alternativas |
|---|---|---|
| Labor | Borrador → presentada → confirmada | Rechazada con motivo; corrección; anulación con efectos resueltos. |
| Asistencia | Borrador → presentada → confirmada | Rechazo o corrección auditada. |
| Observación | Borrador → registrada | Sustitución/corrección o anulación visible. |
| Compra | Borrador → confirmada | Anulación si dependencias resueltas; ajustes administrativos. |
| Recepción | Borrador → confirmada | Reversión o devolución según hecho físico. |
| Transferencia | Solicitada → despachada → parcial → recibida | Cancelación previa; cierre con diferencia autorizada. |
| Cosecha | Borrador → presentada → confirmada | Corrección con efectos físicos/comerciales resueltos. |
| Entrega | Borrador → despachada → recibida | Con diferencia; compensación o retorno según circuito. |
| Pago/cobro | Borrador → confirmado | Movimiento compensatorio vinculado. |
| Campaña/ciclo | Planificado → activo → cerrado | Cancelación sin hechos o reapertura autorizada. |

Los pasos de revisión pueden simplificarse por permiso. No permitir que una configuración introduzca transiciones incompatibles con los efectos implementados.

## 17. Navegación de trazabilidad esperada

### 17.1 Insumos

Desde una labor se accede a consumos, movimientos, almacén, partida y recepciones de origen. Desde una recepción se accede a compra, proveedor, comprobantes y pagos imputados. Las cantidades se siguen por líneas; una partida puede tener más de una recepción.

### 17.2 Producción

Desde un ingreso se accede a entregas liquidadas, líneas y cantidades, cosechas e implantaciones. Desde la implantación se consultan labores, insumos, observaciones, cosechas y costos. Desde un ticket se identifica el pesaje y el hecho que respalda.

### 17.3 Personas

Desde una participación se consulta trabajador, labor, asistencia pertinente, tarifa aplicada, resumen remunerativo y pago si esos módulos están habilitados. Datos salariales requieren permiso adicional.

### 17.4 Correcciones

Todo hecho corregido muestra original, motivo, autor, fecha, sustituto o compensación y efectos relacionados. La vista actual puede resumir el neto, pero el detalle permite reconstruir el circuito.

## 18. Informes y reglas de cálculo

| Indicador | Base | Precaución |
|---|---|---|
| Existencia | Suma de movimientos confirmados por ubicación/artículo/partida | No incluir declaraciones pendientes como saldo. |
| Producción | Cantidad neta válida de cosechas | No sumar también entregas como producción adicional. |
| Rendimiento por ha | Producción comparable / superficie histórica de referencia | Mostrar método y superficie; no dividir por cero o desconocido. |
| Costo por ha trabajada | Costo de labor / área intervenida | Distinto de costo por ha de implantación. |
| Costo por unidad producida | Costos del alcance / producción comparable | Mostrar costos faltantes o estimados. |
| Horas-persona | Suma de minutos individuales / 60 | No usar duración de cabecera. |
| Pendiente de pago | Obligación ajustada menos imputaciones vigentes | Anticipo sin aplicar no cancela una deuda automáticamente. |
| Margen gerencial | Ingresos reconocidos menos costos definidos | No confundir con dinero cobrado menos pagado ni beneficio contable. |

Un informe debe indicar filtros, período, unidad, moneda, estados incluidos y si hay datos pendientes. No sumar kg de productos heterogéneos para presentar un rendimiento agronómico único sin explicar el agregado.

## 19. Casos de aceptación de extremo a extremo

1. **Multicultivo:** misma empresa registra tres cultivos, comparte trabajador y almacén, y obtiene costos separados por implantación.
2. **Historia:** finaliza una implantación y crea otra; las cosechas anteriores conservan origen.
3. **Compra parcial:** una compra tiene dos recepciones y dos pagos; stock y deuda concuerdan.
4. **Tránsito:** despacha 100, recibe 95 y resuelve 5 con baja autorizada; total explicado.
5. **Offline:** envía dos veces una cosecha tras perder respuesta; existe una sola producción.
6. **Conflicto:** dos dispositivos modifican una labor; se conserva el trabajo y se solicita resolución visible.
7. **Cosecha almacenada:** una partida entra a almacén y sale en dos entregas; saldo y origen se conservan.
8. **Entrega directa:** una cosecha se entrega sin crear almacén ficticio y no permite asignar más de lo disponible.
9. **Pago parcial:** un movimiento cancela parcialmente dos obligaciones compatibles; el importe no se aplica dos veces.
10. **Tarifa nueva:** actualizar tarifa no cambia costo de una labor anterior.
11. **Corrección:** revertir un consumo crea compensación y no elimina movimiento fuente.
12. **Aislamiento:** usuario de otra empresa no consulta datos ni adjuntos aun conociendo sus IDs.
