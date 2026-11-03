---
type: brief
module: "TER"
status: Vigente
author: "Ingeniero"
---

# Territorio — Brief

<!-- Texto literal del Ingeniero recibido el 02/11/2026. Se conserva su párrafo íntegro, sin corregir expresiones ni interpretar “Pogri”. Las aclaraciones están en preguntas. -->

- **B-01** — Una chacra representa un lugar físico de la empresa que va a tener diferentes lotes. Por ejemplo, la empresa Playadito puede tener diferentes chacras. Cada chacra va a estar ubicado en diferentes partes del mundo o del país, si se quiere decir, distintas partes de la región y va a contener cierta cantidad de lotes, uno o más lotes. Estos lotes representan el cuadrante que se va a trazar luego con Pogri y que será el área donde se realiza las diferentes cosechas, los diferentes cultivos, las plantaciones, etcétera. Pero en principio vamos a definir lo que es el módulo de la chacra, ¿sí? Necesito campos como, por ejemplo, el nombre de la chacra, un nombre corto de la chacra, un responsable, que será un texto en plano, al igual que la empresa, que definirá quién es el responsable, y esa chacra va a estar asociado a una empresa.

- **B-02** — Te cuento lo que pretendo del modulo lote que se va a relacionar con chacras y pertenece al modulo territorio. Un lote corresponde a una chacra, va a tener campos como nombre, plantacion que posee, codigo/nombre corto (este codigo servira para generar luego reportes, observaciones, cosechas, etc, por ejemplo Lote AB y el codigo saldria como R-L-AB-001 para un reporte), desripcion, notas, tipo de suelo, estado, etc, tambien quiero que pensemos que campos mas serian util para definir el terreo del lote, por ejemplo, tipo de suelo, sistema de regado, etc.

- **B-03** — Luego quiero definir como un historial de procesos o tareas que se van realiazando en el lote, por ejemplo hoy se pasa el disco de arado, se planta, se cosecha, se deja listo para sembrar, se fertiliza, etc todo esto debe tener como un hisotorial del mismo. vamos a tener un modulo de reportes o tareas que va a estar relacionado con cuadrillas y empleados para ver que actividad realizan, esto tambien se debe registrar en el lote si es que la activdad se hace en un lote, todas esas cosas quiero contemplar, puedes leer los archivos principales de "/doc" donde se explica mas o menos lo que se pretende.

- **B-04** — Superposición a) Dos Lotes activos de una misma Empresa no pueden superponerse; sus límites sí pueden tocarse. Las geometrías históricas no producen conflicto. Recomendado.a) Cada Lote es un área continua: un polígono que puede tener huecos; áreas separadas se registran como Lotes diferentes. Recomendado.

- **B-05** — Con respecto a postgri es postgis de posgres para areas, el area va a ser latitud longitud que se va a recibir desde el front, va a venir en ese formato y se va a obtener usando la api de mapbox (pero lo hace el front).

- **B-06** — La chacra no tiene geometria, solo un punto especifico como pin o direccion ingresada manualmente.

- **B-07** — a) Permitir crear un Lote sin geometría y delimitarlo posteriormente. Recomendado.

- **B-08** — Superposición a) Dos Lotes activos de una misma Empresa no pueden superponerse; sus límites sí pueden tocarse. Las geometrías históricas no producen conflicto. Recomendado.

- **B-09** — Superficie a) La superficie oficial se calcula desde la geometría vigente y se expresa en hectáreas; sin geometría queda sin calcular. Recomendado.

- **B-10** — b) Solo se conserva la geometría vigente.

- **B-11** — a) El nombre corto es único dentro de la Chacra, con la misma normalización aprobada para Chacras. El Lote no puede cambiar de Chacra después de crearse. Recomendado.

- **B-12** — Acceso del Capataz a) Si ACC le asigna una Chacra, puede consultar todos sus Lotes; no administra geometrías. Recomendado.
