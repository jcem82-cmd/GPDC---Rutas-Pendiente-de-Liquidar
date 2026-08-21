#!/usr/bin/env python3
"""
Regenera historico_index.json agregando las publicaciones reales de Excel
(commits a index.html cuyo mensaje empieza con "Actualizacion") que llegaron
en el push actual.

Por que existe: historico_index.json era un manifiesto de mantenimiento
MANUAL (ver docs/01_MASTER_PROJECT_CONTEXT.md). El 10/08/2026 se genero una
vez y nunca se volvio a correr -> 14 publicaciones reales quedaron invisibles
en historico.html hasta el 21/08/2026 (incidencia documentada en CHANGELOG).
Este script automatiza esa regeneracion en cada push a index.html.

Criterio de inclusion (idéntico al usado en la regeneracion manual del
21/08/2026 - NO cambiar sin actualizar tambien el CHANGELOG):
  1. El commit debe tocar index.html
  2. El primer renglon del mensaje debe empezar con "Actualizacion"
     (asi es como publishToGitHub() en index.html nombra sus commits;
     descarta commits de codigo: feat/fix/refactor/docs/etc.)
"""
import json
import os
import subprocess
import sys
from datetime import datetime, timezone

INDEX_PATH = "historico_index.json"


def normalize_ts(ts: str) -> str:
    """Normaliza cualquier timestamp ISO8601 al formato exacto ya usado en
    el manifiesto: YYYY-MM-DDTHH:MM:SSZ (UTC, sin milisegundos). Necesario
    porque el ordenamiento del manifiesto es lexicografico (string sort),
    y mezclar formatos ('+00:00' vs 'Z') rompe ese orden."""
    dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
    dt = dt.astimezone(timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%S") + "Z"


def files_changed_in_commit(sha: str) -> list[str]:
    result = subprocess.run(
        ["git", "diff-tree", "--no-commit-id", "--name-only", "-r", sha],
        capture_output=True, text=True, check=True,
    )
    return result.stdout.strip().split("\n") if result.stdout.strip() else []


def main():
    event_path = os.environ.get("GITHUB_EVENT_PATH")
    if not event_path or not os.path.exists(event_path):
        print("No hay GITHUB_EVENT_PATH disponible, nada que hacer.")
        sys.exit(0)

    with open(event_path, encoding="utf-8") as f:
        event = json.load(f)

    commits = event.get("commits", [])
    if not commits:
        print("El evento push no trae commits, nada que hacer.")
        sys.exit(0)

    candidatos = []
    for c in commits:
        sha = c.get("id")
        msg = (c.get("message") or "").split("\n")[0]
        if not msg.startswith("Actualizacion"):
            continue
        try:
            changed = files_changed_in_commit(sha)
        except subprocess.CalledProcessError as e:
            print(f"  aviso: no se pudo inspeccionar {sha[:10]} ({e}), se omite")
            continue
        if "index.html" not in changed:
            continue
        candidatos.append({"sha": sha, "date": normalize_ts(c["timestamp"])})

    if not candidatos:
        print("Ningun commit de este push es una publicacion real de Excel (prefijo 'Actualizacion' + toca index.html). Nada que hacer.")
        sys.exit(0)

    with open(INDEX_PATH, encoding="utf-8") as f:
        idx = json.load(f)

    existentes = {s["sha"] for s in idx["snapshots"]}
    agregados = 0
    for e in candidatos:
        if e["sha"] not in existentes:
            idx["snapshots"].append(e)
            existentes.add(e["sha"])
            agregados += 1
            print(f"  + agregado: {e['sha'][:10]} ({e['date']})")

    if agregados == 0:
        print("Las publicaciones de este push ya estaban en el manifiesto. Nada que hacer.")
        sys.exit(0)

    idx["snapshots"].sort(key=lambda x: x["date"], reverse=True)
    now = datetime.now(timezone.utc)
    idx["generated_at"] = now.strftime("%Y-%m-%dT%H:%M:%S.") + f"{now.microsecond // 1000:03d}Z"

    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(idx, f, ensure_ascii=False, separators=(",", ":"))

    print(f"OK: {agregados} publicacion(es) nueva(s) agregadas. Total snapshots: {len(idx['snapshots'])}")


if __name__ == "__main__":
    main()
