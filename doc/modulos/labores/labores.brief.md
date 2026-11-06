---
type: brief
module: "LAB"
status: Vigente
author: "Parodi Lucas"
---

# Labores — Brief

<!-- Lo escribe el INGENIERO, con sus palabras. Es el origen de toda la especificación del módulo.
El agente solo puede: numerar los párrafos (B-01, B-02…) sin cambiar el texto, y agregar párrafos nuevos al final cuando el ingeniero dicta más contenido.
El agente NO reescribe, resume ni "mejora" este texto. Las aclaraciones van a labores.preguntas.md.
Un párrafo = una idea. Si un párrafo mezcla varias ideas, el agente puede proponer dividirlo, pero lo hace el ingeniero. -->

- **B-01** — Lo que pretendo es que cada empresa pueda tener tareas asociadas, por ejemplo, cortar pasto, mantenimiento (calles, alambrado, cercos, etc), cosechar, etc, cada tarea de esas va a tener montos definidos (estos montos sirven para en caso de que la empresa no pague mensualmente si no por tarea) estos montos puede ser por hora, por labor, etc (esto lo define el administrador cuando va creando las tareas) cuando se arma el labor se difine que tarea se va a llevar a cabo, por ejemplo cortar paso, se define que empleados trabajan en ello, por ejemplo fulano solo, o fulano y fulano o una cuadrilla. se puede planificar un labor para tal fecha, se puede poner iniciado para saber en que se esta trabajando, se puede poner finalizado cuando se termino, si se cancela el labor en medio proceso tambien se puede dejar como pausado o como canelado directamente.

- **B-02** — Esto tambien servira como para que el administrador a la hora de decir vamos a pagar a los empleados vea cuantos labores se realizaron, quiern lo hizo y cuanto debe abonar a cada uno. el labor tambien debera permitir notas, y adjuntar imagenes o informes, especificar que se utilizo del modulo stock y de donde se retiro. Todas esas cosas son importante para mantener la trazabilidad.

- **B-03** — por eso mi duda si PER debe mantener los montos de cada uno. Por ejemplo, una empresa que dice a tal empleado lo pago mensualmente y resulta que esta realizando una tarea que se paga por hora no deberia influir al momento de calcular los pagos a los empleados que si cobran por hora, ejemplo: Juan cobra por mes un monto fijo establecido por la empresa, pedro cobra por tarea. Hoy se va a cosechar, la cosecha se paga 10, se asignan dos empleados juan y pedro, realizan el labor, a la hora de pagar juan cobra su mes a mes y pedro va a cobrar 5 porque el trabajo lo hicieron entre dos, se entiende ? pero esto lo debe definir el administrador, ya que si ve que pedro por ejemplo realizo el 80% del trabajo a la hora de abonar debe pagarle mas ya que juan es mensual y el es por labor, se entiende a lo que voy ? estoy viendo que conviene no tanto que el sistema en si calcule los montos a pagar, si no que el administrador manualmente defina luego si cuanto se paga a cada uno en base al registro de labores que se llevo a cabo, me interesa mas eso, con asistencias y demas tu que opinas ? analiza detalladamente el flujo como si fuera una empresa real en el dia a dia

- **B-04** — Bien, vamos a realizar unas aclaraciones, todos los labores, reportes, etc deben llevar el id de campaña ya que al iniciar una nueva campaña se debe empezar de cero nuevamente ya que servira para ver cuanto se gasto, que se realizo, etc.

- **B-05** — Me gusta tu planteo, vamos a desarrollarlo asi
