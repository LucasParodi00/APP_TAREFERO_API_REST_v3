#!/usr/bin/env python3
"""spec_lint — valida la documentación de especificación.

Uso:
    python tools/spec_lint.py doc             # validar
    python tools/spec_lint.py doc --index     # además: índice inverso y cobertura del brief
    python tools/spec_lint.py doc --tareas    # además: regenerar el avance de las épicas en doc/task.md

Sale con código 1 si hay errores. Solo usa la librería estándar.
"""
from __future__ import annotations

import argparse
import re
import sys
from collections import defaultdict
from pathlib import Path

MOD = r"[A-Z]{2,4}-(?:REQ|BR|NFR|DEP|UC|ENT|Q|TASK)-\d{3}"
OTHER = r"EPIC-\d{3}|PLAN-[A-Z]{2,4}-\d{4}|ADR-[A-Z]{2,4}-\d{4}|ADR-\d{4}|NFR-GLOBAL-\d{3}"
ID = rf"(?:{MOD}|{OTHER})"
ID_RE = re.compile(rf"(?<![\w-])({ID})(?![\w-])")
HEAD_RE = re.compile(rf"^(#{{1,6}})\s+`?({ID})`?\s*(?:—|-|:)")
SECTION_RE = re.compile(r"^#{1,2}\s")
BRIEF_DEF_RE = re.compile(r"^-\s+\*\*(B-\d{2})\*\*")
BRIEF_REF_RE = re.compile(r"(?<![\w-])(B-\d{2})(?![\w-])")
MARKER_RE = re.compile(r"\[\[Q:")
FIELD_RE = re.compile(r"^-\s+\*\*(Estado|Origen|Bloqueante|Épica|Tipo|Plan|Regla):\*\*\s*(.*)$")
FIELD_KEYS = {"Estado": "estado", "Origen": "origen", "Bloqueante": "bloq", "Épica": "epica", "Tipo": "tipo", "Plan": "plan", "Regla": "regla"}
APPROVED = {"Aprobado", "Implementado"}
DONE = {"Completada", "Cancelada"}
GEN_START = "<!-- generado:{}:inicio -->"
GEN_END = "<!-- generado:{}:fin -->"


def front_matter(text: str) -> tuple[dict[str, str], int]:
    if not text.startswith("---"):
        return {}, 0
    end = text.find("\n---", 3)
    if end == -1:
        return {}, 0
    data = {}
    for line in text[3:end].splitlines():
        if ":" in line and not line.startswith((" ", "#")):
            k, _, v = line.partition(":")
            data[k.strip()] = v.split(" #", 1)[0].strip().strip('"')
    return data, text.count("\n", 0, end + 4)


def module_of(path: Path) -> str | None:
    parts = path.parts
    if "modulos" in parts:
        i = parts.index("modulos")
        if i + 1 < len(parts) - 1:
            return parts[i + 1]
    return None


def normalize(value: str) -> str:
    value = re.sub(r"\[\[Q:[^\]]*\]\]|`[^`]*`", " ", value).lower()
    return re.sub(r"[^a-záéíóúñü0-9]+", " ", value).strip()


def first_word(value: str) -> str:
    return value.replace("`", "").split()[0] if value.strip() else ""


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("root")
    ap.add_argument("--index", action="store_true")
    ap.add_argument("--tareas", action="store_true")
    args = ap.parse_args()
    root = Path(args.root)
    if not root.is_dir():
        print(f"No existe {root}", file=sys.stderr)
        return 2

    errors: list[str] = []
    warns: list[str] = []
    defs: dict[str, str] = {}
    blocks: dict[str, dict] = {}
    refs: dict[str, set[tuple[str, str]]] = defaultdict(set)
    block_refs: dict[str, set[str]] = defaultdict(set)
    brief_defs: dict[str, set[str]] = defaultdict(set)
    brief_refs: dict[str, dict[str, set[str]]] = defaultdict(lambda: defaultdict(set))
    texts: dict[str, str] = {}
    ftypes: dict[str, str] = {}
    roles: set[str] = set()
    actors: list[tuple[str, str, str]] = []      # (ubicación, actor, tipo)
    epics_file: Path | None = None

    files = sorted(p for p in root.rglob("*") if p.is_file() and p.suffix in {".md", ".yaml", ".yml"})
    # La guía (proceso, plantillas y README general) contiene IDs de ejemplo: no se valida.
    files = [p for p in files
             if not {"plantillas", "proceso"} & set(p.relative_to(root).parts)
             and p.relative_to(root) != Path("README.md")]

    for path in files:
        rel = str(path.relative_to(root))
        text = path.read_text(encoding="utf-8")
        texts[rel] = text
        fm, fm_lines = front_matter(text) if path.suffix == ".md" else ({}, 0)
        ftype = fm.get("type", "yaml" if path.suffix != ".md" else "")
        mod = module_of(path)
        ftypes[rel] = ftype
        if ftype == "epics":
            epics_file = path

        if fm.get("id") and ID_RE.fullmatch(fm["id"]):
            if fm["id"] in defs:
                errors.append(f"ERROR {rel}: {fm['id']} ya definido en {defs[fm['id']]}")
            defs[fm["id"]] = rel
            blocks[fm["id"]] = {"estado": fm.get("status", ""), "origen": "-", "markers": False,
                                "file": rel, "type": ftype, "task": fm.get("task", "")}
            if not path.name.startswith(fm["id"]):
                warns.append(f"AVISO {rel}: el nombre del archivo debería empezar con {fm['id']}")

        current = None
        section = ""
        for n, line in enumerate(text.splitlines(), start=1):
            if n <= fm_lines:
                if line.startswith("task:"):
                    for r in ID_RE.findall(line):
                        refs[r].add((rel, ftype))
                continue
            if line.startswith("## "):
                section = line
            h = HEAD_RE.match(line) if path.suffix == ".md" else None
            if h:
                current = h.group(2)
                where = f"{rel}:{n}"
                if defs.get(current) == rel:      # título del documento con el mismo ID del front matter
                    continue
                if ftype == "module-readme":
                    errors.append(f"ERROR {where}: el README del módulo no es normativo y no puede definir {current}")
                if current in defs and defs[current] != rel:
                    errors.append(f"ERROR {where}: {current} ya definido en {defs[current]}")
                defs[current] = where
                blocks[current] = {"estado": "", "origen": None, "markers": False, "bloq": "",
                                   "file": rel, "type": ftype, "module": mod}
                continue
            if current and SECTION_RE.match(line):
                current = None
            if ftype == "glossary" and "Roles" in section and line.startswith("### "):
                roles.add(line[4:].strip())
            if ftype == "use-cases" and "Actores" in section and line.startswith("|") and not line.startswith("|--") and not line.startswith("|---"):
                cells = [c.strip() for c in line.strip("|").split("|")]
                if len(cells) >= 2 and cells[0] not in ("Actor",) and not set(cells[0]) <= {"-", ":"}:
                    actors.append((f"{rel}:{n}", cells[0], cells[1]))
            if ftype == "brief" and mod:
                b = BRIEF_DEF_RE.match(line)
                if b:
                    brief_defs[mod].add(b.group(1))
                continue
            if current:
                f = FIELD_RE.match(line)
                if f:
                    blocks[current][FIELD_KEYS[f.group(1)]] = f.group(2).strip()
                if MARKER_RE.search(line):
                    blocks[current]["markers"] = True
            if "generado:" in line:
                continue
            for r in ID_RE.findall(line):
                if r != current:
                    refs[r].add((rel, ftype))
                    if current:
                        block_refs[r].add(current)
            if mod and ftype not in ("brief", "module-readme"):
                for b in BRIEF_REF_RE.findall(line):
                    brief_refs[mod][b].add(current or rel)

    for r, where in sorted(refs.items()):
        if r not in defs:
            errors.append(f"ERROR {', '.join(sorted(w for w, _ in where))}: referencia a {r}, que no está definido")

    for mod, bmap in brief_refs.items():
        for b, where in sorted(bmap.items()):
            if b not in brief_defs[mod]:
                errors.append(f"ERROR módulo {mod}: {b} referenciado en {', '.join(sorted(where))} no existe en el brief")

    if roles:
        for where, actor, tipo in actors:
            if tipo.lower().startswith("rol") and actor not in roles:
                errors.append(f"ERROR {where}: el actor '{actor}' no es un rol de glosario.md (roles: {', '.join(sorted(roles))})")

    open_blocking = {i for i, b in blocks.items() if "-Q-" in i
                     and b["estado"].startswith("Abierta") and b.get("bloq", "").startswith("Sí")}

    tasks_by_epic: dict[str, list[str]] = defaultdict(list)
    for i, b in sorted(blocks.items()):
        where = defs[i]
        estado = first_word(b["estado"])
        kind = i.split("-")[1] if i.count("-") == 2 and not i.startswith(("EPIC", "ADR", "PLAN")) else ""
        if kind in {"REQ", "BR", "NFR", "DEP"} and not b["origen"]:
            errors.append(f"ERROR {where}: {i} sin Origen (B-NN, pregunta o IA)")
        if estado in APPROVED and b["markers"]:
            errors.append(f"ERROR {where}: {i} está {estado} pero tiene marcadores [[Q:...]]")
        if estado in APPROVED:
            pending = [q for q in open_blocking if i in block_refs.get(q, set())]
            if pending:
                errors.append(f"ERROR {where}: {i} está {estado} pero depende de preguntas bloqueantes abiertas: {', '.join(sorted(pending))}")
        if kind == "TASK":
            epic = ID_RE.findall(b.get("epica", ""))
            if not epic:
                errors.append(f"ERROR {where}: {i} sin Épica")
            for e in epic:
                tasks_by_epic[e].append(i)
            plan_ids = ID_RE.findall(b.get("plan", ""))
            tipo = first_word(b.get("tipo", ""))
            if estado == "Completada" and tipo != "Especificación":
                if not plan_ids:
                    errors.append(f"ERROR {where}: {i} está Completada sin plan")
                for p in plan_ids:
                    if p in blocks and first_word(blocks[p]["estado"]) != "Cerrado":
                        errors.append(f"ERROR {where}: {i} está Completada pero {p} está {blocks[p]['estado']}")
            for p in plan_ids:
                if p in blocks and blocks[p].get("task") and blocks[p]["task"] != i:
                    errors.append(f"ERROR {where}: {i} indica {p}, pero el plan declara la tarea {blocks[p]['task']}")
        if i.startswith("PLAN-") and b.get("task"):
            t = b["task"]
            if t in blocks and i not in ID_RE.findall(blocks[t].get("plan", "")):
                warns.append(f"AVISO {where}: {i} declara la tarea {t}, pero la tarea no lo indica en Plan")
        if estado == "Retirado":
            continue
        if kind == "BR" and not {u for u in block_refs.get(i, set()) if "-Q-" not in u and u != i}:
            warns.append(f"AVISO {where}: {i} no es aplicada por ningún REQ, UC ni entidad")
        if kind == "REQ" and not any(t == "use-cases" for _, t in refs.get(i, set())):
            warns.append(f"AVISO {where}: {i} no es realizado por ningún caso de uso")
        if kind == "UC" and f"@{i}" not in texts[b["file"]]:
            warns.append(f"AVISO {where}: {i} sin escenarios con tag @{i}")

    for e, tasks in tasks_by_epic.items():
        if e not in blocks:
            continue
        estados = [first_word(blocks[t]["estado"]) for t in tasks]
        epic_estado = first_word(blocks[e]["estado"])
        if epic_estado == "Completada" and any(s not in DONE for s in estados):
            errors.append(f"ERROR {defs[e]}: {e} está Completada pero tiene tareas sin terminar")
        if tasks and all(s in DONE for s in estados) and epic_estado not in DONE:
            warns.append(f"AVISO {defs[e]}: todas las tareas de {e} terminaron; el ingeniero puede marcarla Completada")

    # Redefiniciones: el enunciado de una regla copiado en otro lugar
    for i, b in sorted(blocks.items()):
        regla = normalize(b.get("regla", ""))
        if len(regla) < 25 or "pendiente de definicion" in regla:
            continue
        hits = []
        for rel, text in texts.items():
            if ftypes.get(rel) in ("brief", "questions"):      # el origen puede coincidir con la regla
                continue
            for n, line in enumerate(text.splitlines(), start=1):
                if rel == b["file"] and line.lstrip().startswith("- **Regla:**"):
                    continue
                if regla in normalize(line):
                    hits.append(f"{rel}:{n}")
        if hits:
            warns.append(f"AVISO {', '.join(hits)}: repite el enunciado de {i}; referenciar el ID en lugar de copiarlo")

    for mod, bset in brief_defs.items():
        for b in sorted(bset):
            if b not in brief_refs[mod]:
                warns.append(f"AVISO módulo {mod}: {b} del brief no generó ningún ítem")

    if args.tareas and epics_file:
        text = epics_file.read_text(encoding="utf-8")
        resumen = ["| Épica | Estado | Avance |", "|---|---|---|"]
        for e in sorted(i for i in blocks if i.startswith("EPIC-")):
            tasks = sorted(tasks_by_epic.get(e, []))
            done = sum(1 for t in tasks if first_word(blocks[t]["estado"]) == "Completada")
            activas = sum(1 for t in tasks if first_word(blocks[t]["estado"]) != "Cancelada")
            resumen.append(f"| {e} | {blocks[e]['estado'] or '—'} | {done}/{activas} tareas completadas |")
            rows = ["| Tarea | Tipo | Estado | Plan | Archivo |", "|---|---|---|---|---|"]
            for t in tasks:
                bt = blocks[t]
                rows.append(f"| {t} | {bt.get('tipo', '—')} | {bt['estado']} | {bt.get('plan', '—')} | `{bt['file']}` |")
            if not tasks:
                rows = ["Sin tareas asociadas."]
            body = "\n".join([f"**{done}/{activas} tareas completadas**", ""] + rows)
            text = re.sub(re.escape(GEN_START.format(e)) + r".*?" + re.escape(GEN_END.format(e)),
                          GEN_START.format(e) + "\n" + body + "\n" + GEN_END.format(e), text, flags=re.S)
        text = re.sub(re.escape(GEN_START.format("resumen")) + r".*?" + re.escape(GEN_END.format("resumen")),
                      GEN_START.format("resumen") + "\n" + "\n".join(resumen) + "\n" + GEN_END.format("resumen"), text, flags=re.S)
        epics_file.write_text(text, encoding="utf-8")
        print(f"Avance regenerado en {epics_file}")

    for line in errors + warns:
        print(line)

    if args.index:
        print("\n# Índice inverso")
        for i in sorted(defs):
            users = sorted(block_refs.get(i, set()) - {i}) or sorted({w for w, _ in refs.get(i, set())})
            print(f"{i:<16} ← {', '.join(users) if users else '—'}")
        print("\n# Cobertura del brief")
        for mod, bset in sorted(brief_defs.items()):
            for b in sorted(bset):
                items = sorted(x for x in brief_refs[mod].get(b, set()) if ID_RE.fullmatch(x))
                print(f"{mod} {b} → {', '.join(items) if items else '—'}")

    print(f"\n{len(defs)} IDs · {len(errors)} errores · {len(warns)} avisos")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
