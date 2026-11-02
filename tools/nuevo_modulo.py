#!/usr/bin/env python3
"""nuevo_modulo — crea la carpeta de un módulo a partir de las plantillas.

Uso:
    python tools/nuevo_modulo.py <nombre> <PREFIJO> "<Nombre legible>" <EPIC-NNN>
    python tools/nuevo_modulo.py lotes LOT "Lotes" EPIC-001

Crea doc/modulos/<nombre>/ con todos los archivos del módulo, reemplaza los marcadores
crea adr/ y planes/ vacíos y registra la tarea de especificación del módulo en la épica indicada.
No sobrescribe nada: falla si el módulo ya existe.
Las plantillas se leen de doc/plantillas/.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ARCHIVOS = {
    "modulo.brief.template.md": "{m}.brief.md",
    "modulo.preguntas.template.md": "{m}.preguntas.md",
    "modulo.requerimientos.template.md": "{m}.requerimientos.md",
    "modulo.use-case.template.md": "{m}.use-case.md",
    "modulo.modelo-datos.template.md": "{m}.modelo-datos.md",
    "modulo.task.template.md": "{m}.task.md",
    "modulo.readme.template.md": "README.md",
}


def tarea_de_especificacion(texto: str, prefijo: str, legible: str, epica: str) -> str:
    """Convierte la tarea de ejemplo de la plantilla en la tarea de especificación del módulo."""
    inicio = texto.index(f"## {prefijo}-TASK-001")
    tarea = f"""## {prefijo}-TASK-001 — Especificar el módulo {legible}

- **Épica:** `{epica}`
- **Tipo:** Especificación
- **Estado:** En curso
- **Prioridad:** Alta
- **Alcance:** Todo el brief
- **Depende de:** Ninguna
- **Plan:** No aplica
- **Bloqueo:** Ninguno
"""
    return texto[:inicio] + tarea


def main() -> int:
    if len(sys.argv) != 5:
        print(__doc__)
        return 2
    nombre, prefijo, legible, epica = sys.argv[1:5]
    if not re.fullmatch(r"EPIC-\d{3}", epica):
        print("La épica debe tener el formato EPIC-NNN y existir en doc/task.md.")
        return 2
    if not re.fullmatch(r"[a-z][a-z0-9-]*", nombre):
        print("El nombre debe estar en minúsculas, sin espacios ni tildes (ver nomenclatura.md).")
        return 2
    if not re.fullmatch(r"[A-Z]{2,4}", prefijo):
        print("El prefijo debe tener 2 a 4 letras mayúsculas.")
        return 2

    doc = Path("doc")
    plantillas = doc / "plantillas"
    destino = doc / "modulos" / nombre
    if destino.exists():
        print(f"{destino} ya existe. No se modifica nada.")
        return 1

    arquitectura = doc / "arquitectura.md"
    if arquitectura.exists() and f"`{prefijo}`" not in arquitectura.read_text(encoding="utf-8"):
        print(f"AVISO: el prefijo {prefijo} no está registrado en doc/arquitectura.md §Módulos. Registrarlo antes de especificar.")

    task = doc / "task.md"
    if task.exists() and f"## {epica}" not in task.read_text(encoding="utf-8"):
        print(f"AVISO: {epica} no existe en doc/task.md. Pedir al ingeniero que la cree.")

    destino.mkdir(parents=True)
    for carpeta in ("adr", "planes"):
        (destino / carpeta).mkdir()
        (destino / carpeta / ".gitkeep").touch()

    for plantilla, salida in ARCHIVOS.items():
        texto = (plantillas / plantilla).read_text(encoding="utf-8")
        texto = texto.replace('"PRE"', f'"{prefijo}"').replace("PRE-", f"{prefijo}-").replace("PRE_", f"{prefijo}_")
        texto = texto.replace("`PRE`", f"`{prefijo}`")
        texto = texto.replace("[Nombre del módulo]", legible).replace("[Módulo]", legible)
        texto = texto.replace("[modulo]", nombre).replace("<modulo>", nombre)
        if plantilla == "modulo.task.template.md":
            texto = tarea_de_especificacion(texto, prefijo, legible, epica)
        (destino / salida.format(m=nombre)).write_text(texto, encoding="utf-8")

    print(f"Módulo creado en {destino}")
    print("Siguiente paso: el ingeniero escribe el brief; luego fase 1 (doc/proceso/01-especificar-modulo.md).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
