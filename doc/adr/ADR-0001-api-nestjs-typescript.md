---
type: adr
id: ADR-0001
title: "API REST con TypeScript y NestJS"
status: Aceptado
scope: ["GLOBAL"]
date: 2026-10-30
supersedes: null
---

# ADR-0001 — API REST con TypeScript y NestJS

## Contexto

Tarefero necesita una API REST modular que atienda clientes web y móviles, aplique autorización multiempresa, exponga contratos OpenAPI y permita separar el dominio de HTTP y del framework.

## Alternativas

### A — NestJS con TypeScript

- **Cómo funciona:** NestJS compone módulos, controladores, guards, pipes, interceptors y adaptadores; el núcleo de Dominio y Aplicación permanece en TypeScript puro.
- **A favor:** estructura explícita, integración HTTP, inyección de dependencias y ecosistema adecuado para una API modular.
- **En contra:** es necesario impedir que sus decoradores y tipos invadan Dominio y Aplicación.

### B — Express o Fastify sin framework estructural

- **Cómo funciona:** la aplicación define manualmente composición, ciclo HTTP e inyección de dependencias.
- **A favor:** menor abstracción impuesta.
- **En contra:** requiere construir y mantener más infraestructura transversal y convenciones propias.

## Decisión

- **Elegida:** A — NestJS con TypeScript.
- **Por qué:** es el stack elegido por el Ingeniero y permite estructurar la API sin introducir el framework en el núcleo del negocio.
- **Decidió:** Ingeniero — 2026-10-30

## Consecuencias

- **Qué cambia:** Presentación utiliza NestJS; Dominio y Aplicación no importan NestJS ni usan sus decoradores.
- **Riesgos:** convertir servicios y decoradores del framework en dependencias del núcleo.
- **Revisar si:** el framework impide cumplir un requisito esencial o el proyecto cambia de plataforma.

