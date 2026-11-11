---
type: adr
id: ADR-0009
title: "Estructura modular simplificada y separación de escritura y lectura"
status: Aceptado
scope: ["GLOBAL"]
date: 2026-11-11
supersedes: null
---

# ADR-0009 — Estructura modular simplificada y separación de escritura y lectura

## Contexto

`ADR-0002` estableció un monolito modular con arquitectura hexagonal de cuatro capas. La primera implementación del módulo Empresas mostró que subdividir anticipadamente puertos por dirección, persistencia por tecnología y tipo de artefacto, y Presentación por transporte produce demasiados directorios para pocos archivos y dificulta la navegación sin reforzar por sí mismo los límites arquitectónicos.

También es necesario distinguir dos necesidades diferentes: los comandos cargan y guardan agregados de Dominio, mientras que las consultas pueden leer proyecciones optimizadas sin reconstruir esos agregados.

## Alternativas

### A — Mantener la estructura profunda y todos los contratos de persistencia en Aplicación

- **Cómo funciona:** cada módulo conserva `puertos/entrada`, `puertos/salida`, `persistencia/typeorm/<tipo>` y `presentacion/http/<tipo>`; repositorios y consultas se reúnen como puertos de Aplicación.
- **A favor:** hace explícitos desde el filesystem el transporte, la tecnología y la dirección de cada puerto.
- **En contra:** crea directorios con muy pocos archivos, mezcla persistencia de agregados con modelos de lectura y aumenta la navegación cotidiana.

### B — Simplificar directorios y separar repositorios de Dominio de consultas de Aplicación

- **Cómo funciona:** cada módulo conserva las cuatro capas, elimina niveles anticipados y crea carpetas internas solo cuando tienen contenido. Los repositorios de agregados son contratos de Dominio y usan exclusivamente tipos de Dominio. Las consultas son puertos de Aplicación y devuelven modelos de lectura. Infraestructura implementa ambos contratos.
- **A favor:** mantiene la inversión de dependencias, explicita el límite de los agregados, permite lecturas optimizadas y reduce profundidad accidental.
- **En contra:** requiere dos contratos y dos inyecciones cuando un módulo tiene escritura y lectura; exige evitar que modelos de Aplicación entren en repositorios de Dominio.

### C — Organizar cada módulo únicamente por funcionalidades

- **Cómo funciona:** comandos, entidades, controladores y persistencia se agrupan por caso de uso o recurso, sin carpetas estables para las cuatro capas.
- **A favor:** concentra archivos que cambian juntos.
- **En contra:** vuelve menos visibles y más difíciles de verificar los límites hexagonales aprobados en `ADR-0002`.

## Decisión

- **Elegida:** B — simplificar directorios y separar repositorios de Dominio de consultas de Aplicación.
- **Por qué:** conserva la arquitectura hexagonal y la organización por módulos con menos estructura accidental, a la vez que separa el modelo de escritura basado en agregados de las proyecciones de lectura. Se acepta el costo de mantener contratos e inyecciones diferenciados.
- **Decidió:** Ingeniero — 2026-11-11

## Consecuencias

- **Qué cambia en la especificación o el código:** `arquitectura.md` y `nomenclatura.md` definen la nueva estructura global. Los módulos nuevos deben seguirla. Los módulos existentes se reorganizan únicamente mediante una tarea y un plan aprobados.
- **Riesgos:** crear contratos ceremoniales en módulos pequeños; duplicar operaciones sin distinguir su intención; filtrar paginación, DTO o modelos de lectura hacia Dominio; interpretar la separación como obligación de usar bases de datos distintas o consistencia eventual.
- **Revisar si:** la cantidad de archivos de una carpeta vuelve difícil su navegación, aparece más de un transporte o tecnología simultánea dentro de un módulo, o la separación entre agregados y proyecciones no aporta claridad comprobable.
