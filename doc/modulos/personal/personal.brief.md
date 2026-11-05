---
type: brief
module: "PER"
status: Vigente
author: "Parodi Lucas"
---

# Personal — Brief

<!-- Lo escribe el INGENIERO, con sus palabras. Es el origen de toda la especificación del módulo.
El agente solo puede: numerar los párrafos (B-01, B-02…) sin cambiar el texto, y agregar párrafos nuevos al final cuando el ingeniero dicta más contenido.
El agente NO reescribe, resume ni "mejora" este texto. Las aclaraciones van a personal.preguntas.md.
Un párrafo = una idea. Si un párrafo mezcla varias ideas, el agente puede proponer dividirlo, pero lo hace el ingeniero.

Guía de qué conviene escribir (no es obligatorio seguir este orden):
- Para qué sirve el módulo y qué problema resuelve.
- Qué datos tiene cada cosa ("un lote tiene ancho, largo…").
- Reglas que siempre se cumplen ("un lote siempre debe tener…", "nunca puede…").
- Quién hace qué ("como administrador debo poder…", "como empleado…").
- Qué pasa en casos especiales o de error.
- Con qué otros módulos se relaciona y qué necesita de ellos.
- Qué NO hace este módulo. -->

- **B-01** — Dejemos en claro que una empresa tiene sus empleados, un empleado solo puede pertenecer a una empresa (Si ese empleado con el mismo DNI va a otra empresa se crea registro nuevo y se mantiene el de la otra empresa), la empresa puede crear todos los empleados que le permita la suscripcion que tenga la empresa, un empleado no es necesariamente un usuario del sistema, un usuario del sistema tiene acceso al mismo, un empleado puede pasar a ser usuario de la empresa (el administrador crea al empleado cuando lo asigna como usuario le genera la contraseña y los permisos que tenga etc ), por ende creo que debe existir una entidad empleado y otra usuario, todo usuario tiene una ficha empleado. Los datos obligatorio para crear un empleado son DNI, nombre, apellido y telefono de contacto, todos los demas son opcionales, al pasar a ser usuario se le solicitara una contraseña (creada por el administrador ) y un correo de acceso.

- **B-02** — Cuadrillas: Una cuadrilla esta conformada por un grupo de empleados (pueden ser usuarios internos o no, ejemplo un capatas que es usuario y un empleado que no lo es), se puede asignar un lider de cuadrilla si es necesario, un empleado puede estar relacionado con una o mas cuadrilla (crees que es conveniente esto ?), la cuadrilla debe tener un nombre obligatorio y se asigna de manera automatica una letra y dos numeros para identificar (este debe ser unico). se debe mantener un historial de los integrantes de la cuadrilla, por ejemplo, hoy fulano es parte, mañana no, y luego se reincorpora a la cuadrilla, todo eso se debe mantener, el capatas solo ve la conformacion actual, el historial lo ve el administrador.

- **B-03** — La asistencia lo confirma el capatas marcado quien vino, en caso de que tenga algun tipo de restriccion el empleado le debe figurar al capataz, tambien hay que tener en cuenta que se puede marcar de manera opcional la hora de ingreso del empleado y la hora de salida, tambien una nota al registrar una hora de entrada o salida, por ejemplo, se retira a las 10.30 nota: estaba descompuesto. todo de manera opcional, si se marca la asistencia como ok nada mas entonces significa que asistio ese dia nada mas. Esto de las horas servira para las empresas que realizan los pagos por horas de trabajo.

- **B-04** — Los tipos de pago lo configura una empresa, puede ser de manera global es decir en la configuracion de la empresa establece que se le paga a todos de manera mensual o bien por empleado, teniendo peso el que es especifico por empleado sobre el que es general. los tipos de pago puede ser, mensuales, por labor, por hora, etc (sugiereme que te parece y como crees que podrian ser los pagos mas comunes). Luego en la parte de labores o tareas se especificaran en cada labor el monto que se paga por ese labor, por hora, etc (o sugiereme tu como seria) tambien es cofigurable por empresa.

- **B-05** — TODO LO QUE SE HAGA ES PROPIO DE LA EMPRESA, TODO ESTA SEPARADO POR TENATS. Toda tabla o entidad debe tener su id de tenant.

- **B-06** — No existe una cuadrilla principal, existen varias cuadrillas, a lo que me referia es que si es conveniente o no que un empleado pueda pertenecer o no a mas de una cuadrilla al mismo tiempo.

- **B-07** — Como se menciono anteriormente todo codigo es propio de una empresa, la otra empresa puede repetir el codigo ya que la id del tenant no es el mismo.

- **B-08** — El lider de la cuadrilla puede ser un empleado, por ejemplo el capataz junta 5 empleados y asigna a uno de ellos como lider de cuadrilla, sin necesidad de que sea usuario interno.

- **B-09** — Me parece perfecto la asistncia con intervalos.

- **B-10** — Las restricciones me parecen perfecto.

- **B-11** — Lo de la remuneracion me parece perfecto.
