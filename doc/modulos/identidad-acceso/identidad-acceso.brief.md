---
type: brief
module: "ACC"
status: Vigente
author: "Ingeniero"
---

# Identidad y acceso — Brief

<!-- Texto literal aportado por el Ingeniero en la conversación. Solo se numeraron los párrafos. -->

- **B-01** — una empresa va a tener sus propios usarios (capataz, empleado, admin, etc), esta empresa estara asociado a un plan, el plan va a tener en principio 3 nivels que limita la cantidad de usarios que pueden tener acceso al sistema ya sea app o web, por eso usuarios va a tener un campo que diga tiene acceso o no el usuario, ya que puede registrar muchos empleados pero pocos acceder al sistema, la entidad de planes o sucripcion lo vamos a desarrollar al final del proyecto, pero ya debe estar contemplado eso desde el principio.

- **B-02** — cuando un usuario realiza una peticion por ejemplo crear un nuevo usuario este valida el jwt, consulta a la bdd si existe realmente, trae la empresa que tiene asociada, los roles, permisos etc y crear una sesion que se utilizara para el historial, auditoria, todo eso.

- **B-03** — tambien al momento de crear un nuevo usuario en este caso o cualquier otra cosas agrega automaticamente el tenant del usuario que lo esta creando, de este modo nos aseguramos que quede asociado a la empresa que pertenece el que esta creadno se entiende ?

- **B-04** — Los superadministrador no son visibles en las empresas, es decir los adminsitradores o empleados etc no deben visualizar a los usuarios superadministradores.

- **B-05** — Un superadministrador puede consultar cualqueir empresa y realizar cualquier accion en las empreas sin restricciones, util para demostraciones, correcciones, soporte, etc. un superadmin es el unico cpas de crear otro superadmin, siempre debe existir un superadmin, tambien puede crear administradores y asociarlo a una empresa, capataz, etc siempre definiendo la empresa a la que se va a asociar. Un administrador puede crear otro administrador de su empresa, puede crear empleados, capataz, etc siempre que el plan lo permita.

- **B-06** — el nuevo usuario por defecto no tiene permitido iniciar sesion ni en la app ni en la web, siempre por defecto usuario interno.

- **B-07** — Ahora un usuario va a tener datos basicos obligatorios, por ejemplo, dni, nombre y apellido, correo electronico y contraseña (si es que puede iniciar sesion), tambien tendran datos adiccionales como direccion, tipo de sangre, etc.  un usuario tendra campos o tablas asociadas (ya me propones tu como seria) tendra como un cv que permitira adjuntar el cv en pdf (esto lo dejamos para el final, mientras tanto el campo sera null) datos como especializaciones, etc. y una tabla de informacion adiccionales como contactos de emergencia, datos tecnicos, tambien tendran asocicados licencias, asistencias etc.

- **B-08** — el administrador es el que escribe la contraseña del usuario interno, luego el usuario interno podra cambiar su contraseña en la pagina o en la app, no se enviaran invitaciones ni nada de eso .

- **B-09** — me gusta la separacion de peroas y empleado sin ser un usuario, esto nos permite tener un mejor control de las membresias.

- **B-10** — un mismo usuario puede figurar en otras empresa, se restringe que el dni y correo debe ser unico por empresa pero tendra los permisos y mebresia de la empresa asociada no llevara su membresia a niguna otra empresa

- **B-11** — roles fijos inicialemnte

- **B-12** — apruebo crear superadmin.

- **B-13** — me gusta tu propuesta

- **B-14** — la membresia es por empresa, es decir, yo contrato un plan de tarefero, me permite crear la empresa con ciertas cantidad de usuarios internos, chacras, etc, no es que un usuario paga una membresia y se une a una empresa, ten encuenta que es un saas.

- **B-15** — El reestablecimiento de contraseña lo puede hacer el administrador a cualquier usuario, en caso de que el administrador no pueda iniciar sesion el superadmin cambiara la contraseña, no existe un restablecer contraseña que se pueda acceder en caso de olvidarse.

- **B-16** — El flujo es asi, yo desarrollo tarefero, viene el dueño de una empresa y contrata mi servicio, yo le creo la empresa y le genero el usuario administrador, el luego puede crear sus empleados sus usuarios internos dependiendo del plan que el contrate eso ya no depende de mi, depende del señor o persona que contrate el servicio que ofresco se entiende ?
