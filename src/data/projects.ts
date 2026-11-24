/**
 * Catalogue of the eight academy projects.
 *
 * Source of truth for technical content is the original specification file in
 * docs/specs/. This file holds only metadata needed by the interface: titles,
 * stage counts, technologies and the initial status Stephane reported.
 * Stage-level content is added in M2, copied verbatim from the specs.
 */

export type ProjectStatus = "completed" | "in-progress" | "planned";

export interface ProjectMeta {
  id: string;
  number: number;
  title: string;
  /** Two-word label for compact views. */
  shortName: string;
  /** One-line goal, taken from the GOAL section of the spec. */
  goal: string;
  /** Original spec file(s) in docs/specs/. */
  specFiles: string[];
  stageCount: number;
  /** The spec's own word for a step: "stage" or "phase". */
  stageUnit: "stage" | "phase";
  technologies: string[];
  /** Everything starts at "planned": Stephane reset all progress on 2026-11-24. */
  initialStatus: ProjectStatus;
  /** Free-text progress note as reported by Stephane (not verified). */
  initialNote?: string;
}

export const PROJECTS: readonly ProjectMeta[] = [
  {
    id: "p1-slingshot",
    shortName: "Slingshot",
    number: 1,
    title: "3D Gravitational Slingshot",
    goal: "Aim a probe past a moving planet and steal its speed to reach a target.",
    specFiles: ["P1_3D_Slingshot_Game.docx"],
    stageCount: 12,
    stageUnit: "stage",
    technologies: ["Python", "NumPy", "RK4", "Ursina"],
    initialStatus: "planned",
  },
  {
    id: "p2-black-hole",
    shortName: "Black hole",
    number: 2,
    title: "Black Hole Ray Tracer",
    goal: "Follow light backwards from every pixel and bend it with RK4 to see a black hole.",
    specFiles: ["P2_BlackHole_RayTracer.md", "P2_Black_Hole_Ray_Tracer.docx"],
    stageCount: 12,
    stageUnit: "stage",
    technologies: ["Python", "NumPy", "Matplotlib", "RK4", "pytest", "ffmpeg"],
    initialStatus: "planned",
  },
  {
    id: "p3-rocket-orbit",
    shortName: "Orbit launch",
    number: 3,
    title: "Rocket Launch to Orbit",
    goal: "Fly a rocket from the ground into a stable circular orbit 200 km up.",
    specFiles: ["P3_Rocket_Launch_To_Orbit.md"],
    stageCount: 13,
    stageUnit: "stage",
    technologies: ["Python", "NumPy", "Matplotlib", "RK4", "pytest", "ffmpeg"],
    initialStatus: "planned",
  },
  {
    id: "p4-ai-pilot",
    shortName: "AI pilot",
    number: 4,
    title: "AI Pilot: Rocket Landing",
    goal: "Land a rocket softly, first with a hand-written pilot, then with a learning agent.",
    specFiles: ["P4_AI_Pilot_Rocket_Landing.md"],
    stageCount: 14,
    stageUnit: "stage",
    technologies: ["Python", "RK4", "Gymnasium", "Stable-Baselines3", "PPO"],
    initialStatus: "planned",
  },
  {
    id: "p5-em-field",
    shortName: "EM field",
    number: 5,
    title: "3D Electromagnetic Field Visualizer",
    goal: "Place charges in 3D and watch the electric field change, in a full-stack web app.",
    specFiles: ["P5_EM_Field_Visualizer_Build_Guide.pdf"],
    stageCount: 10,
    stageUnit: "phase",
    technologies: ["JavaScript", "Three.js", "Node.js", "Express", "SQLite", "JWT"],
    initialStatus: "planned",
  },
  {
    id: "p6-fluid-cpp",
    shortName: "Fluid C++",
    number: 6,
    title: "3D Fluid Simulator in C++",
    goal: "Make smoke swirl and rise in 3D around obstacles, and render it as a video.",
    specFiles: ["P6_3D_Fluid_Simulator_CPP.md"],
    stageCount: 15,
    stageUnit: "stage",
    technologies: ["Python", "NumPy", "C++17", "CMake", "OpenMP", "ParaView"],
    initialStatus: "planned",
  },
  {
    id: "p7-julia-pde",
    shortName: "Heat & wave",
    number: 7,
    title: "Heat and Wave Solver + Neural Surrogate",
    goal: "Solve heat and wave equations in Julia, then train a network that predicts them instantly.",
    specFiles: ["P7_Julia_PDE_Neural_Surrogate.md"],
    stageCount: 15,
    stageUnit: "stage",
    technologies: ["Julia", "Plots.jl", "BenchmarkTools", "PyTorch"],
    initialStatus: "planned",
  },
  {
    id: "p8-earth-obs",
    shortName: "Earth obs.",
    number: 8,
    title: "Earth Observation Pipeline",
    goal: "Measure vegetation health over Rwanda from real Sentinel-2 images, over time.",
    specFiles: ["P8_Earth_Observation_Pipeline__source_labelled_Project5.md"],
    stageCount: 14,
    stageUnit: "stage",
    technologies: ["Python", "STAC", "xarray", "rasterio", "Zarr", "Docker"],
    initialStatus: "planned",
  },
];
