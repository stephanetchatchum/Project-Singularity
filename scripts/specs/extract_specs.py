"""Turn the original project specs into structured JSON for the Project Library.

Nothing is rewritten: every string in the output is copied from the source file.
The test src/content/specs/specs.test.ts checks that, word for word.

Sources (docs/specs/):
  P1  text/P1_3D_Slingshot_Game.md            (pandoc conversion of the .docx)
  P2, P3, P4, P6, P7, P8  *.md                  (the "PROJECT SPEC" part + workflow)
  P5  text/P5_EM_Field_Visualizer_Build_Guide.txt (pdftotext of the build guide)

Run:  python scripts/specs/extract_specs.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SPECS = ROOT / "docs" / "specs"
OUT = ROOT / "src" / "content" / "specs"

MD_SPECS = {
    "p2-black-hole": "P2_BlackHole_RayTracer.md",
    "p3-rocket-orbit": "P3_Rocket_Launch_To_Orbit.md",
    "p4-ai-pilot": "P4_AI_Pilot_Rocket_Landing.md",
    "p6-fluid-cpp": "P6_3D_Fluid_Simulator_CPP.md",
    "p7-julia-pde": "P7_Julia_PDE_Neural_Surrogate.md",
    "p8-earth-obs": "P8_Earth_Observation_Pipeline__source_labelled_Project5.md",
}

HEADING = re.compile(r"^[A-Z][A-Z0-9 ,/&'-]+(?: \(.*\))?:?$")
STAGE = re.compile(r"^Stage (\d+): (.+?)\. (.*)$")


def split_stage(n: int, rest_title: str, rest: str) -> dict:
    """Split 'Title. body Done when: x' into its parts."""
    body, _, done = rest.partition("Done when: ")
    return {"id": str(n), "title": rest_title, "body": body.strip(), "doneWhen": done.strip() or None}


# --------------------------------------------------------------------------- md specs


def parse_md_spec(text: str) -> tuple[list[dict], list[dict]]:
    """Sections between 'PROJECT SPEC' and 'HOW TO TEACH ME', plus the workflow."""
    lines = text.splitlines()
    sections: list[dict] = []
    current: dict | None = None
    keep = False
    for raw in lines:
        line = raw.strip()
        if HEADING.match(line):
            name = line.rstrip(":")
            if name.startswith("PROJECT SPEC"):
                keep = True
                continue
            if name.startswith("HOW TO TEACH ME") or name.startswith("START NOW"):
                keep = False
                continue
            if name.startswith("PROFESSIONAL WORKFLOW"):
                keep = True
            if keep:
                current = {"heading": name, "items": []}
                sections.append(current)
            continue
        if not keep or current is None or not line:
            continue
        if line.startswith("* "):
            current["items"].append({"kind": "li", "text": line[2:]})
        elif re.match(r"^\d+\. ", line):
            n, _, t = line.partition(". ")
            current["items"].append({"kind": "li", "n": int(n), "text": t})
        else:
            current["items"].append({"kind": "p", "text": line})

    stages: list[dict] = []
    for s in sections:
        if s["heading"].startswith("BUILD STAGES"):
            for it in s["items"]:
                m = STAGE.match(it["text"])
                if m:
                    stages.append(split_stage(int(m[1]), m[2], m[3]))
    return sections, stages


# --------------------------------------------------------------------------- P1 (docx -> gfm)


def clean_md(s: str) -> str:
    """Remove markdown emphasis and checkbox markers; keep the words."""
    s = s.replace("**", "").replace("\\", "")
    return re.sub(r"^\[ \] ", "", s)


def parse_p1(text: str) -> tuple[list[dict], list[dict]]:
    sections: list[dict] = []
    current: dict | None = None
    table: list[list[str]] | None = None
    for raw in text.splitlines():
        line = raw.strip()
        if line.startswith("#"):
            level = len(line) - len(line.lstrip("#"))
            title = line.lstrip("# ").strip()
            if level == 1 or title.startswith("Traps, videos"):
                continue
            current = {"heading": title, "items": []}
            sections.append(current)
            table = None
            continue
        if current is None or not line:
            table = None
            continue
        if line.startswith("|"):
            cells = [c.strip() for c in line.strip("|").split("|")]
            if all(re.fullmatch(r":?-+:?", c) for c in cells):
                continue
            if table is None:
                table = []
                current["items"].append({"kind": "table", "rows": table})
            table.append([clean_md(c) for c in cells])
            continue
        table = None
        if line.startswith("\\"):
            # A display equation. Pandoc wrote "\\ " for a LaTeX thin space.
            # Pandoc wrote "\\ " for a thin space and "\|" for a plain bar.
            tex = line.replace("\\\\ ", "\\, ").replace("\\|", "|")
            current["items"].append({"kind": "math", "tex": tex})
        elif line.startswith("- "):
            current["items"].append({"kind": "li", "text": clean_md(line[2:]).strip()})
        elif re.match(r"^\d+\. ", line):
            n, _, t = line.partition(". ")
            current["items"].append({"kind": "li", "n": int(n), "text": clean_md(t).strip()})
        else:
            current["items"].append({"kind": "p", "text": clean_md(line)})

    stages: list[dict] = []
    for s in sections:
        if s["heading"] == "Build stages":
            for it in s["items"]:
                m = STAGE.match(it["text"])
                if m:
                    stages.append(split_stage(int(m[1]), m[2], m[3]))
    return sections, stages


# --------------------------------------------------------------------------- P5 (pdf text)

STEP = re.compile(r"^(\d+)\.(\d+) (.+)$")
FIELDS = ["Goal:", "You'll see:", "Just enough:", "Your task:", "Commit:"]
NOISE = re.compile(r"^(EM Field Visualizer: Build Guide|Page \d+ of \d+|Nov 22, 2026 · .*)$")


def parse_p5(text: str) -> tuple[list[dict], list[dict]]:
    lines = [l.strip() for l in text.splitlines()]
    lines = [l for l in lines if l and not NOISE.match(l)]

    # Phase titles from the progress tracker ("1. Repo setup: ...").
    phases: dict[int, dict] = {}
    i = lines.index("Progress tracker")
    for l in lines[i:]:
        m = re.match(r"^(\d+)\. (.+)$", l)
        if m and int(m[1]) not in phases:
            title, _, body = m[2].partition(": ")
            phases[int(m[1])] = {"id": m[1], "title": title, "body": body, "doneWhen": None, "steps": []}
        if len(phases) == 10:
            break

    # Steps 4.1 ... 10.4, each with labelled fields.
    start = lines.index("4.1 One arrow (done)")
    end = lines.index("EM physics cheat sheet")
    step: dict | None = None
    field: str | None = None
    for l in lines[start:end]:
        m = STEP.match(l)
        if m and int(m[1]) in phases:
            step = {"id": f"{m[1]}.{m[2]}", "title": m[3], "fields": {}}
            phases[int(m[1])]["steps"].append(step)
            field = None
            continue
        if step is None or re.match(r"^Phases? \d", l):
            if re.match(r"^Phases? \d", l):
                step = None
            continue
        # pdftotext leaves a space before punctuation after inline code ("x .").
        l = re.sub(r" ([.,;:)])", r"\1", l)
        hit = next((f for f in FIELDS if l.startswith(f)), None)
        if hit:
            field = hit[:-1]
            step["fields"][field] = l[len(hit):].strip()
        elif field:
            step["fields"][field] += " " + l
        else:
            step["fields"]["Note"] = (step["fields"].get("Note", "") + " " + l).strip()

    # Supporting sections, kept as plain lines.
    def block(title: str, stop: str | None) -> dict:
        a = lines.index(title) + 1
        b = lines.index(stop) if stop else len(lines)
        return {"heading": title, "items": [{"kind": "p", "text": l} for l in lines[a:b]]}

    sections = [
        block("How to use this guide", "Progress tracker"),
        block("Git, PRs and code style", "Phase 4: field math"),
        block("EM physics cheat sheet", "Cheat sheets: Python to JS, Unity/Blender to Three.js"),
        block("Cheat sheets: Python to JS, Unity/Blender to Three.js", "When stuck"),
        block("When stuck", None),
    ]
    return sections, [phases[k] for k in sorted(phases)]


# --------------------------------------------------------------------------- main


def section_text(sections: list[dict], *names: str) -> str:
    """Plain words of the first section whose heading starts with one of `names`."""
    for s in sections:
        if any(s["heading"].startswith(n) for n in names):
            return " ".join(i["text"] for i in s["items"] if i["kind"] in ("p", "li"))
    return ""


def build_speech(sections: list[dict], stages: list[dict], unit: str) -> dict[str, str]:
    """Exact sentences to read aloud. Built only from spec words plus labels."""
    speech: dict[str, str] = {}
    goal = section_text(sections, "GOAL", "Start here", "How to use this guide")
    idea = section_text(sections, "THE IDEA IN PLAIN WORDS", "The idea in plain words")
    if goal or idea:
        speech["overview"] = " ".join(x for x in (goal, idea) if x)
    for st in stages:
        head = f"{unit} {st['id']}: {st['title']}."
        done = f" Done when: {st['doneWhen']}" if st.get("doneWhen") else ""
        speech[f"stage.{st['id']}"] = re.sub(r"\s+", " ", f"{head} {st['body']}{done}").strip()
        for step in st.get("steps", []):
            parts = " ".join(f"{k}: {v}" for k, v in step["fields"].items() if k != "Commit")
            speech[f"step.{step['id']}"] = re.sub(r"\s+", " ", f"Step {step['id']}: {step['title']}. {parts}").strip()
    return speech


def write(project_id: str, sources: list[str], sections: list[dict], stages: list[dict]) -> None:
    unit = "Phase" if project_id == "p5-em-field" else "Stage"
    data = {
        "projectId": project_id,
        "sources": sources,
        "sections": sections,
        "stages": stages,
        "speech": build_speech(sections, stages, unit),
    }
    (OUT / f"{project_id}.json").write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{project_id:16s} {len(sections):2d} sections  {len(stages):2d} stages")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    sec, st = parse_p1((SPECS / "text" / "P1_3D_Slingshot_Game.md").read_text(encoding="utf-8"))
    write("p1-slingshot", ["text/P1_3D_Slingshot_Game.md"], sec, st)
    for pid, file in MD_SPECS.items():
        sec, st = parse_md_spec((SPECS / file).read_text(encoding="utf-8"))
        write(pid, [file], sec, st)
    sec, st = parse_p5((SPECS / "text" / "P5_EM_Field_Visualizer_Build_Guide.txt").read_text(encoding="utf-8"))
    write("p5-em-field", ["text/P5_EM_Field_Visualizer_Build_Guide.txt"], sec, st)


if __name__ == "__main__":
    main()
