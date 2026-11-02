#!/usr/bin/env python3
"""contexto — arma el contexto de una fase en un solo texto, para usar con cualquier agente o API.

Uso:
    python tools/contexto.py <fase> [--modulo <nombre>] [--plan <PLAN-ID>] [--pedido "<texto>"] [--salida <archivo>]

Ejemplos:
    python tools/contexto.py 1 --modulo lotes --pedido "Especificá el módulo a partir del brief"
    python tools/contexto.py 2 --modulo lotes --pedido "Implementemos LOT-TASK-002"
    python tools/contexto.py 3 --plan PLAN-LOT-0001 --salida contexto.md

Lee la sección "Leer" del procedimiento de la fase (doc/proceso/NN-*.md) e incluye esos archivos,
junto con el procedimiento mismo. No decide qué leer: la única fuente es el procedimiento.
Sirve para herramientas que no leen el repositorio solas (chat web, API de OpenAI o Anthropic).
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

DOC = Path("doc")
RUTA_RE = re.compile(r"`([^`]+)`")


def procedimiento(fase: str) -> Path:
    numero = f"{int(fase):02d}" if fase.isdigit() else fase
    candidatos = sorted((DOC / "proceso").glob(f"{numero}-*.md"))
    if not candidatos:
        sys.exit(f"No existe el procedimiento de la fase {fase} en doc/proceso/.")
    return candidatos[0]


def buscar_plan(plan_id: str) -> Path:
    candidatos = sorted(DOC.glob(f"modulos/*/planes/{plan_id}-*.md"))
    if not candidatos:
        sys.exit(f"No se encontró {plan_id} en doc/modulos/*/planes/.")
    return candidatos[0]


def seccion_leer(texto: str) -> tuple[list[tuple[str, str]], list[str]]:
    """Devuelve [(ruta o marcador, nota)] y las líneas 'Además' de la sección Leer."""
    m = re.search(r"^## Leer\n(.*?)(?=^## )", texto, flags=re.S | re.M)
    if not m:
        return [], []
    items, ademas = [], []
    for linea in m.group(1).splitlines():
        linea = linea.strip()
        if linea.startswith("- "):
            cuerpo = linea[2:]
            nota = cuerpo.split(" — ", 1)[1] if " — " in cuerpo else ""
            ruta = RUTA_RE.match(cuerpo)
            if ruta:
                items.append((ruta.group(1), nota))
            elif cuerpo.startswith("Plan"):
                items.append(("<plan>", nota))
        elif linea.startswith("Además:"):
            ademas.append(linea[len("Además:"):].strip())
    return items, ademas


def resolver(ruta: str, modulo: str | None) -> Path | None:
    if ruta.startswith("<m>."):
        if not modulo:
            return None
        return DOC / "modulos" / modulo / ruta.replace("<m>", modulo)
    return Path(ruta)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("fase", help="Número de fase: 0 a 4")
    ap.add_argument("--modulo")
    ap.add_argument("--plan")
    ap.add_argument("--pedido", default="")
    ap.add_argument("--salida")
    args = ap.parse_args()

    proc = procedimiento(args.fase)
    texto_proc = proc.read_text(encoding="utf-8")
    plan = buscar_plan(args.plan) if args.plan else None
    modulo = args.modulo or (plan.parts[plan.parts.index("modulos") + 1] if plan else None)

    items, ademas = seccion_leer(texto_proc)
    archivos: list[tuple[Path, str]] = [(proc, "procedimiento de la fase: seguirlo paso a paso")]
    faltan: list[str] = []
    for ruta, nota in items:
        if ruta == "<plan>":
            if plan:
                archivos.append((plan, nota))
            else:
                faltan.append("Plan (indicar con --plan)")
            continue
        destino = resolver(ruta, modulo)
        if destino is None:
            faltan.append(f"{ruta} (indicar el módulo con --modulo)")
        elif destino.is_file():
            if destino not in [a for a, _ in archivos]:
                archivos.append((destino, nota))
        else:
            faltan.append(f"{destino} (todavía no existe)")

    partes = [
        f"# Contexto — {proc.stem}",
        "",
        "Instrucciones para el agente:",
        "- Adoptá el rol definido en la sección \"Rol\" del procedimiento incluido.",
        "- Seguí sus pasos en orden y escribí solo en los archivos que indica su sección \"Escribir\".",
        "- Aplicá AGENTS.md y doc/proceso/reglas-documentacion.md.",
        "- Si necesitás un archivo que no está incluido, pedilo; no supongas su contenido.",
        "",
    ]
    if args.pedido:
        partes += ["## Pedido del ingeniero", "", args.pedido, ""]
    notas = [f"- `{a}`: {n}" for a, n in archivos if n]
    if notas:
        partes += ["## Alcance de lectura", ""] + notas + [""]
    if ademas or faltan:
        partes += ["## No incluido en este contexto", ""]
        partes += [f"- {f}" for f in faltan]
        partes += [f"- {a}" for a in ademas]
        partes += [""]
    for archivo, _ in archivos:
        partes += [f'<archivo ruta="{archivo}">', archivo.read_text(encoding="utf-8").rstrip(), "</archivo>", ""]

    salida = "\n".join(partes)
    if args.salida:
        Path(args.salida).write_text(salida, encoding="utf-8")
        print(f"Contexto escrito en {args.salida}", file=sys.stderr)
    else:
        sys.stdout.write(salida)
    print(f"{len(archivos)} archivos · {len(salida):,} caracteres · {len(faltan)} faltantes", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
