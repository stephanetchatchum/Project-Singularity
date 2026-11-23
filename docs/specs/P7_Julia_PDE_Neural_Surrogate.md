I'm Stephane, a BSc Software Engineering student. I want to build Project 7, a Heat and Wave Solver in Julia with a Neural Surrogate, as a learning + portfolio project. The project spec is below. Keep it exactly as written. Only the way you teach me changes.

MY CONSTRAINTS (follow these strictly):

* I'm a visual learner with ADHD. I need something on screen (a plot or an animation) at EVERY step. No step where I just read theory with nothing to run.
* Keep every message SHORT. No long walls of text. One small step at a time.
* I don't like reading to learn. I learn by building, watching, and doing. Explain just enough to make the next line of code make sense, then let me run it.
* Python is the only language I know. I have NEVER written Julia. Start Julia from zero, and always compare to the Python I know. Teach the Julia installation, the REPL, packages, arrays (1-based indexing!), functions, loops and broadcasting (the dot) as we hit them. For the neural network part, I will use PyTorch in Python, which is the industry standard.
* I don't want finished code handed to me. I want to understand and write it myself, with you guiding me line by line or in small chunks. No vibe coding. If I'm stuck, give a hint first, then a smaller hint, and code only as a last step.
* I've used Blender/Unity for 3D since I was 13, so I already think in 3D space and vectors. Don't over-explain 3D.
* I'm weak in physics and math. Introduce each idea (partial derivative, finite difference, boundary conditions, stability, the CFL condition) only right before I need to code it. Explain it like a physics book in easy words, and keep every variable named (u, x, t, alpha, c, dx, dt).
* When you give a resource, give a video or talk I can watch, not an article.

PROJECT SPEC (do not change; this is my own Project 7 document)

GOAL
Write solvers for the heat equation and the wave equation in Julia, check them against exact answers, make them fast, and animate them. Then use the solver to make thousands of examples, and train a small neural network (a surrogate) that predicts the answer instantly. This is the start of my long-term goal, a neural surrogate for a PDE simulator. Do one stage at a time. Ignore later stages until the current one is ticked.

THE IDEA IN PLAIN WORDS
A partial differential equation (PDE) describes how something changes in space and time. Heat spreads out and smooths. A wave travels and bounces. A computer cannot handle continuous space, so I put the world on a grid, replace derivatives by differences between neighbours, and step forward in time. A surrogate is a neural network that learned from many solver runs, so it can give a good answer in milliseconds instead of running the full solver.

THE BIG SIMPLIFICATION
First 1D, then 2D. Regular grids. Simple boundaries (the ends are held at zero, or the edges are fixed). Explicit time stepping. The surrogate learns one family of problems, for example "heat spreading from a random starting shape", not everything.

KEY EQUATIONS
* Heat: ∂u/∂t = α ∂²u/∂x² (1D), and ∂u/∂t = α (∂²u/∂x² + ∂²u/∂y²) (2D). u is the temperature, α the diffusivity.
* Wave: ∂²u/∂t² = c² ∂²u/∂x². u is the height, c the wave speed.
* Second derivative on a grid: ∂²u/∂x² ≈ (u[i+1] - 2 u[i] + u[i-1]) / dx².
* Explicit heat step: u_new[i] = u[i] + α dt (u[i+1] - 2 u[i] + u[i-1]) / dx².
* Stability of the heat step: dt ≤ dx² / (2α) in 1D, dt ≤ dx² / (4α) in 2D.
* Stability of the wave step (the CFL condition): c dt / dx ≤ 1 in 1D.

EXACT ANSWERS TO CHECK AGAINST
* Heat in 1D on [0, 1], ends at zero, start u = sin(πx): u(x, t) = sin(πx) e^(-α π² t). With α = 0.1 and t = 1, the peak falls to e^(-0.987) = 0.373.
* Wave in 1D on [0, 1], ends fixed, start u = sin(πx) at rest: u(x, t) = sin(πx) cos(π c t). After one full period, t = 2 / c, it returns to the start.
* Heat in 2D: u = sin(πx) sin(πy), decay rate e^(-2 α π² t).

HAND-CHECKS (on paper, before any code)
1. The second difference. Take u = [0, 1, 4, 9, 16] (that is x²) with dx = 1. The second difference at the middle is 2. Check it by hand.
2. Stability. α = 0.1 and dx = 0.02 give a maximum dt = 0.002 for the 1D heat step. Check it.
3. The exact decay. α = 0.1, t = 1: peak = 0.373.
4. CFL. c = 1, dx = 0.01. What is the largest dt for the wave?
5. Grid size. A 2D grid of 200 × 200 has how many points? How many time steps for t = 1 with dt = 0.00005?

BUILD STAGES (tick a stage only when its "Done when" is true; commit after every tick)
* Stage 1: Julia from zero. Install Julia and VS Code with the Julia extension. Run the REPL. Define a function, make an array, loop over it, and make a plot with Plots.jl. Compare each step to Python. Done when: I see a plot of sin(πx) made in Julia.
* Stage 2: The finite difference by hand. Compute the second difference of x² in Julia and compare with hand-check 1. Then do it for sin(x) and compare with -sin(x). Done when: the error shrinks by 4 times when I halve dx (second order).
* Stage 3: The 1D heat solver. Write the explicit step in a loop. Plot the temperature at several times. Done when: the peak at t = 1 matches 0.373 within 0.5%, and the error plot against the exact answer is tiny.
* Stage 4: Break it on purpose. Choose dt above the stability limit. Watch it explode. Done when: I can show a picture of the stable and the unstable run side by side, and explain why in one sentence.
* Stage 5: Animate it. Heat from a hot spot in the middle, using Plots.jl animations (@animate) or Makie. Done when: I have a GIF of heat spreading.
* Stage 6: The 1D wave solver. Use the leapfrog scheme (needs the two previous time levels). Done when: after one period it returns to its start within 1%, and the CFL limit is verified by breaking it.
* Stage 7: Make it fast in Julia. Use broadcasting (the dot), views and in-place updates. Compare with a naive loop and with NumPy. Measure with @btime (BenchmarkTools). Done when: I print a table of Julia loop, Julia vectorised, and NumPy times for the same problem.
* Stage 8: The 2D heat solver. A 2D grid, with a hot spot, shown as a colour map and as a 3D surface. Done when: the 2D decay of sin(πx)sin(πy) matches the exact rate within 1%.
* Stage 9: The 2D wave. A drop in a pond, with ripples and reflections from the walls. Add a barrier with two slits for a wave interference picture. Done when: I have a GIF of ripples, and I can see interference behind the slits.
* Stage 10: Use all cores. Add multi-threading (Threads.@threads) to the 2D loops. Optional: try the GPU with CUDA.jl, if I have a GPU (or skip). Done when: I print a speedup table for 1, 2, 4 and all threads.
* Stage 11: Make the data. Run the 2D heat solver 5,000 times with random starting shapes (random blobs). Save the start and the result at t = 0.1 as arrays (HDF5 or NumPy files). Done when: I have a data set, and I plot 9 random examples.
* Stage 12: The surrogate in PyTorch. A small convolutional network (a small U-Net or a few convolution layers) that takes the start picture and predicts the result picture. Split the data into train, validation and test. Done when: the test error is printed, and I plot prediction, truth and error side by side.
* Stage 13: Compare solver and surrogate. Speed (solver time against network time) and error. Test on shapes the network has not seen, and on a different α. Done when: I have a table with speed and error, and one honest sentence about where the surrogate fails.
* Stage 14: A physics-aware extra (stretch). Add a loss term that punishes breaking the heat equation or the conservation of total heat. Done when: the error on unseen shapes improves, or I can explain why it did not.
* Stage 15: Write up. Hero GIF, the exact-answer checks (0.373, the wave period, the 2D rate), the speed tables and the surrogate results, and an honest list of what is simplified. Done when: a friend can run it from my README alone.

TRAPS (warn me when we reach each one)
* Julia counts from 1, Python counts from 0. A common source of off-by-one errors.
* Julia stores arrays by column, Python (NumPy) by row. Loop over the first index fastest for speed.
* Boundaries. Keep the end points fixed at zero, and update only the inside cells.
* Copy against alias. In Julia, `b = a` makes a second name for the same array, not a copy. Use copy(a).
* Time. The first run in Julia is slow because it compiles. Measure the second run, with @btime.
* Global variables. Code in the global scope is slow in Julia. Put the work inside functions.
* Stability. A beautiful picture does not prove the solver is right. Always compare with the exact answer.
* Data leakage. For the surrogate, test shapes must not appear in the training data, not even rotated copies.
* Scale of the data. Normalise the inputs and outputs for the network, and remember to undo it when plotting.

WATCH FIRST (videos)
Search YouTube for: "Julia for Python programmers", "Steve Brunton finite difference heat equation", "Steve Brunton physics informed neural networks", "Chris Rackauckas Julia scientific machine learning", "3Blue1Brown heat equation".

FINISH CHECKLIST
* The heat GIF, the wave GIF and the slit-interference picture in the README
* The exact-answer checks: 0.373 for the heat peak, the wave period, the 2D decay rate
* The speed tables: Julia against NumPy, 1 thread against many, solver against surrogate
* The surrogate results: test error, and the unseen-shape failure case
* A line saying what is simplified: regular grid, simple boundaries, a small problem family
* Repo pinned on my GitHub profile

HOW TO TEACH ME (the method)

1. Start from zero: GitHub repo, folder structure, and a tiny first plot on screen before any real feature.
2. Every step ends with me running something and seeing a visible result (a plot, an animation, a printed number I can check against a hand-check). Even tiny.
3. Follow the stages in order. Before each stage, do the matching hand-check on paper with me first. Show me the check, I do it, then we code.
4. Before moving to the next stage, ask me ONE short question to check I understood the last one.
5. Ask me one question at a time if you need to know something about my setup. Don't dump a list.
6. When Julia syntax appears, show the Python version next to it, so I learn by comparing.

PROFESSIONAL WORKFLOW (strict, from day one)

* I use Windows and Git Bash.
* One GitHub repo. Never commit straight to main. For each stage: create a branch (feature/stage-3-heat-1d), commit small and often, push, open a pull request with a short description and a screenshot of the result, review it with me, then merge. Tick the stage in the README checklist inside that PR.
* Commit messages: Conventional Commits (feat:, fix:, docs:, test:, refactor:, chore:), short and in present tense.
* Julia style: a Julia project with Project.toml (julia --project), functions in modules, clear names (snake_case for functions and variables, PascalCase for modules and types), type annotations where they help. Python style: Ruff, PEP 8, type hints, a virtual environment, requirements.txt.
* Comments: a short docstring on every function (what it does, inputs with units, output). Above each numerical step, a one-line comment naming the formula. Explain WHY, not what.
* Tests: Julia's Test standard library for the solver (every hand-check and exact answer becomes a test), and pytest for the surrogate code. A stage is only ticked when its test passes.
* Folder structure: julia/ (src/, test/, Project.toml), python/ (surrogate/, tests/), data/ (git-ignored, with a tiny sample), docs/ (pictures, GIFs, hand-checks), scripts/, README.md, .gitignore.
* Keep units clean. Say what the grid spacing and the time step mean, even when they are dimensionless.

START NOW:
Propose the repo/folder structure and the very first thing I should run to see something on screen (Stage 1: install Julia and plot sin(πx)). Keep it short. Then wait for me.
