I'm Stephane, a BSc Software Engineering student. I want to build Project 6, a 3D Fluid Simulator in C++, as a learning + portfolio project. The project spec is below. Keep it exactly as written. Only the way you teach me changes.

MY CONSTRAINTS (follow these strictly):

* I'm a visual learner with ADHD. I need something on screen (a plot, an image or a video) at EVERY step. No step where I just read theory with nothing to run.
* Keep every message SHORT. No long walls of text. One small step at a time.
* I don't like reading to learn. I learn by building, watching, and doing. Explain just enough to make the next line of code make sense, then let me run it.
* Python is the only language I know. I have NEVER written C++. Start C++ from zero, and always compare to the Python I know ("this is like a list, but..."). Teach compiling, types, arrays, pointers and references, and memory as we hit them. No assumed C++ knowledge.
* I don't want finished code handed to me. I want to understand and write it myself, with you guiding me line by line or in small chunks. No vibe coding. If I'm stuck, give a hint first, then a smaller hint, and code only as a last step.
* I've used Blender/Unity for 3D since I was 13, so I already think in 3D space, vectors and cameras. Don't over-explain 3D.
* I'm weak in physics and math. Introduce each idea (velocity field, advection, viscosity, pressure, divergence, incompressibility, the Poisson equation) only right before I need to code it. Explain it like a physics book in easy words, and keep every variable named with its unit.
* When you give a resource, give a video or talk I can watch, not an article.

PROJECT SPEC (do not change; this is my own Project 6 document)

GOAL
Build a fluid simulator that makes smoke swirl and rise in 3D, with obstacles, and render it as a video. I first learn the idea in 2D in Python (fast to try), then rebuild it in C++ for speed, then extend it to 3D and use all the CPU cores. A 3D fluid is the most impressive picture in this whole plan, and it teaches me C++, performance and the Navier-Stokes equations. Do one stage at a time. Ignore later stages until the current one is ticked.

THE IDEA IN PLAIN WORDS
A fluid is a grid of cells. Each cell holds a velocity (which way the fluid moves) and a density (how much smoke is there). One time step has four small jobs:
1. Add forces (buoyancy makes hot smoke rise, gravity pulls).
2. Advect: move things along the flow. For each cell, I look backwards to where its fluid came from, and copy the value from there (semi-Lagrangian).
3. Diffuse: viscosity smooths the velocity a little (optional for smoke).
4. Project: water and air cannot be squeezed, so the flow must have zero divergence. I solve for a pressure and subtract its gradient. This step is the heart of the simulation, and the most expensive.

THE BIG SIMPLIFICATION
A "stable fluids" solver (Jos Stam, 1999) on a regular grid. Incompressible flow, constant viscosity, smoke is a density field carried by the flow, solid walls and boxes as obstacles. No free-surface water, no turbulence model, no adaptive grid.

KEY EQUATIONS
* Momentum: ∂u/∂t + (u · ∇)u = -(1/ρ) ∇p + ν ∇²u + f
* Incompressibility: ∇ · u = 0
* u is the velocity (m/s), p the pressure, ρ the density of the fluid, ν the viscosity, f the forces per mass.
* Projection: solve ∇²p = (1/dt) ∇ · u*, then u = u* - dt ∇p. The Poisson equation ∇²p = b is solved with an iterative method (Jacobi, then Gauss-Seidel, then multigrid as a stretch goal).
* Stable time step: use semi-Lagrangian advection, so any dt is stable. Accuracy is best when dt × max speed < 1 cell.

HAND-CHECKS (on paper, before any code)
1. Advection. A blob in a constant flow of 1 cell per second moves 10 cells in 10 seconds. Predict where it lands.
2. Divergence by hand. For a tiny 3 × 3 grid with chosen velocities, compute ∇ · u with central differences. Then check that adding a pressure gradient can bring it to zero.
3. Decay of a vortex. In 2D, with u = cos(x) sin(y) e^(-2νt) and v = -sin(x) cos(y) e^(-2νt) (the Taylor-Green vortex), the total kinetic energy falls as e^(-4νt). With ν = 0.01 and t = 10, the energy is 0.670 of the start.
4. The Poisson size. A 64³ grid has 262,144 cells. How many numbers must I update per iteration? How many iterations do I want per time step (20 to 60)?
5. Memory. 64³ cells × 4 bytes × 4 fields (3 velocity components + density) = about 4 MB. How big is 256³?

BUILD STAGES (tick a stage only when its "Done when" is true; commit after every tick)
* Stage 1: Python warm-up, 2D. Write the whole 2D smoke solver in NumPy on a 128 × 128 grid. Draw the density as an animation. Done when: I see smoke swirling, and it takes seconds per frame. This is my reference, and my speed baseline.
* Stage 2: Python checks. Test advection (hand-check 1), the divergence after projection (below 1e-4), and the Taylor-Green decay (hand-check 3, within 2%). Done when: three tests pass in pytest.
* Stage 3: C++ from zero. Install a compiler (g++ in MSYS2, or MSVC) and CMake. Write "hello", then a program that makes a 2D array, fills it with numbers, and writes a picture. Learn types, std::vector, loops, functions, references and headers. Done when: a C++ program writes a PGM or PNG image that I open and see.
* Stage 4: 2D advection in C++. A blob moves along a constant flow, drawn as a series of images. Done when: it matches hand-check 1 and matches my Python result.
* Stage 5: 2D projection in C++. Add the divergence, the Jacobi pressure solver and the pressure gradient. Done when: the divergence after projection is below 1e-4, as in Python.
* Stage 6: The full 2D solver in C++. Forces, advection, projection, smoke source, boundaries. Done when: the C++ output looks like my Python animation, and the Taylor-Green energy decay matches e^(-4νt) within 2%. Print the speed against Python (the speedup).
* Stage 7: The lid-driven cavity. A closed box with a moving top lid at Reynolds number 100 (use ν = 0.01, box 1 × 1, lid speed 1). Done when: after it settles, the horizontal velocity along the vertical centreline reaches a minimum near -0.21 at a height near 0.45 (the published benchmark of Ghia et al., 1982). This proves the solver is physically right, not only pretty.
* Stage 8: Make it faster. Measure with a timer. Use the Gauss-Seidel red-black ordering, then OpenMP (#pragma omp parallel for) on the loops. Done when: I print a table of 1, 2, 4, and all cores, with the speedup for each.
* Stage 9: Extend to 3D. Change the grid to x, y, z. Velocity gets three components. The divergence, the pressure solve and the advection each get one more term. Start with 32³. Done when: the divergence after projection is below 1e-4 in 3D, and a blob moves correctly in a constant flow.
* Stage 10: 3D smoke. Add a hot smoke source at the bottom, buoyancy (f = α × density upward), and a few vorticity details if I want. Save the density as a file for every frame (VTK or raw binary). Done when: I open the files in ParaView (free) and see a plume rising and curling.
* Stage 11: Obstacles. Add a solid sphere or box inside the domain. The flow must go around it (velocity is zero at the solid, and the pressure solver respects it). Done when: the smoke wraps around the obstacle, and the divergence in fluid cells is still tiny.
* Stage 12: Scale up and measure. Run 64³ and 128³ with all cores. Done when: I have a table of grid size, time per step, and memory, and I understand why the pressure solve takes most of the time.
* Stage 13: A better pressure solver (stretch). Replace Jacobi with a multigrid or conjugate gradient solver. Done when: I get the same divergence with far fewer iterations, with a printed comparison.
* Stage 14: Make it beautiful. Render the smoke in 3D. Option A: ParaView volume rendering with a camera path. Option B: export a density grid to OpenVDB and render it in Blender, which I already know. Done when: I have a 15 to 30 second video of a smoke plume around an obstacle.
* Stage 15: Write up. Hero video, the three checks (advection, 0.670 energy, the cavity benchmark), the speedup table and an honest list of what is simplified. Done when: a friend can build and run it from my README alone.

TRAPS (warn me when we reach each one)
* Indexing. A 3D array stored in one long line needs the formula index = x + nx × (y + ny × z). One wrong order and the picture is a mess. Write one function for it, and test it.
* Off-by-one at the boundary. Ghost cells or careful loops. Every boundary condition is a bug waiting to happen.
* Advection backwards. The "look backwards" step uses minus the velocity. A wrong sign makes smoke move the wrong way or blow up.
* Interpolation. A position that is between cells needs trilinear interpolation. Clamp it to the grid.
* Numerical diffusion. Semi-Lagrangian smooths the smoke more than real life. This is a known weakness, not a bug.
* Units. Keep dx, dt and velocity consistent. Say what a cell is in metres, even if it is 1.
* Reading and writing the same array. In Jacobi, use two arrays (old and new). In-place updates give a different method.
* Data races. In OpenMP, two threads must not write to the same cell. Red-black ordering and separate arrays avoid this.
* Optimisation too early. First make it correct, then measure, then speed it up.
* Compiler flags. Test with -O0 and -g, run the speed tests with -O2 or -O3.

WATCH FIRST (videos)
Search YouTube for: "Ten Minute Physics fluid simulation Matthias Müller", "Sebastian Lague coding adventure fluid simulation", "Jos Stam stable fluids explained", "C++ for Python programmers", "OpenMP tutorial Tim Mattson".

FINISH CHECKLIST
* The hero video and the 3D smoke pictures in the README
* The three checks: advection, the 0.670 energy decay, the cavity benchmark
* The speedup table: Python, C++ one core, C++ all cores
* The grid-size table: 32³, 64³, 128³ with time and memory
* A line saying what is simplified: incompressible, no free surface, no turbulence model, regular grid
* Repo pinned on my GitHub profile

HOW TO TEACH ME (the method)

1. Start from zero: GitHub repo, folder structure, and a tiny first picture on screen before any real feature.
2. Every step ends with me running something and seeing a visible result (an image, an animation, a printed number I can check against a hand-check). Even tiny.
3. Follow the stages in order. Before each stage, do the matching hand-check on paper with me first. Show me the check, I do it, then we code.
4. Before moving to the next stage, ask me ONE short question to check I understood the last one.
5. Ask me one question at a time if you need to know something about my setup. Don't dump a list.
6. When C++ syntax appears, show the Python version next to it, so I learn by comparing.

PROFESSIONAL WORKFLOW (strict, from day one)

* I use Windows and Git Bash.
* One GitHub repo. Never commit straight to main. For each stage: create a branch (feature/stage-5-projection), commit small and often, push, open a pull request with a short description and a screenshot of the result, review it with me, then merge. Tick the stage in the README checklist inside that PR.
* Commit messages: Conventional Commits (feat:, fix:, docs:, test:, refactor:, chore:), short and in present tense.
* One code style: for Python, Ruff, type hints and PEP 8. For C++, C++17, clang-format, clear names (snake_case for variables and functions, PascalCase for classes, UPPER_SNAKE_CASE for constants), and no raw `new` and `delete` (use std::vector).
* Build system: CMake from the start, with a Release and a Debug build.
* Comments: a short comment on every function (what it does, inputs with units, output). Above each physics step, a one-line comment naming the formula. Explain WHY, not what.
* Tests: pytest for the Python reference, and a small C++ test program (Catch2 or doctest) for the C++ code. Each hand-check becomes a test. A stage is only ticked when its test passes.
* Folder structure: python/ (reference solver and tests), cpp/ (src/, include/, tests/, CMakeLists.txt), docs/ (pictures, hand-checks, benchmarks), scripts/, README.md, .gitignore.
* Keep units clean. SI units, or clearly say "1 cell = 1 unit".

START NOW:
Propose the repo/folder structure and the very first thing I should run to see something on screen (Stage 1: a tiny 2D smoke animation in Python). Keep it short. Then wait for me.
