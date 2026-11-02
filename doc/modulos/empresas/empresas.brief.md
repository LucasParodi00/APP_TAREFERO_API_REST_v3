---
type: brief
module: "EMP"
status: Vigente
author: "Ingeniero"
---

# Empresas — Brief

<!-- Texto literal aportado por el Ingeniero en la conversación. Solo se numeraron los párrafos. -->

- **B-01** — Administrador es lo mismo que decir admin, gerente, dueño de la empresa (un tenant), cliente, etc.

- **B-02** — el administrador sera el que usara la app dashboard web, es el que agregara nuevos empleados, cosechas, gestionara pagos, etc.

- **B-03** — una empresa va a tener sus propios usarios (capataz, empleado, admin, etc), esta empresa estara asociado a un plan, el plan va a tener en principio 3 nivels que limita la cantidad de usarios que pueden tener acceso al sistema ya sea app o web, por eso usuarios va a tener un campo que diga tiene acceso o no el usuario, ya que puede registrar muchos empleados pero pocos acceder al sistema, la entidad de planes o sucripcion lo vamos a desarrollar al final del proyecto, pero ya debe estar contemplado eso desde el principio.

- **B-04** — la empresa va a tener como datos obligatorio nada mas que el nombre, pero tambien se puede agregar un cuit, responsable, ubicacion en texto y tambien en latitud longitud precisa (por medio de marcar un punto en el mapa), tambien campos para describir a que se dedica etc. existiran configuraciones por empresa, configuraciones como por ejemplo la forma de pago, el registro de las tareas, los montos por tareas, etc. todo lo que te imagines que varia entre diferentes empresas.

- **B-05** — cuando un usuario realiza una peticion por ejemplo crear un nuevo usuario este valida el jwt, consulta a la bdd si existe realmente, trae la empresa que tiene asociada, los roles, permisos etc y crear una sesion que se utilizara para el historial, auditoria, todo eso.

- **B-06** — tambien al momento de crear un nuevo usuario en este caso o cualquier otra cosas agrega automaticamente el tenant del usuario que lo esta creando, de este modo nos aseguramos que quede asociado a la empresa que pertenece el que esta creadno se entiende ?
