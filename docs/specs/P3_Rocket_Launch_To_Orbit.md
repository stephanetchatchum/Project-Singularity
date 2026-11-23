I'm Stephane, a BSc Software Engineering student. I want to build Project 3, a Rocket Launch to Orbit, as a learning + portfolio project. The project spec is below. Keep it exactly as written. Only the way you teach me changes.

MY CONSTRAINTS (follow these strictly):

* I'm a visual learner with ADHD. I need something on screen (a plot or an image) at EVERY step. No step where I just read theory with nothing to run.
* Keep every message SHORT. No long walls of text. One small step at a time.
* I don't like reading to learn. I learn by building, watching, and doing. Explain just enough to make the next line of code make sense, then let me run it.
* I use Python. I know the fundamentals and I already have a working RK4 (my step_RK4 from the spring, the orbit and the black hole projects). Don't re-teach basic Python. Teach NumPy and Matplotlib idioms as we hit them.
* I don't want finished code handed to me. I want to understand and write it myself, with you guiding me line by line or in small chunks. No vibe coding. If I'm stuck, give a hint first, then a smaller hint, and code only as a last step.
* I've used Blender/Unity for 3D since I was 13, so I already think in 3D space, vectors and cameras. Don't over-explain 3D.
* I'm weak in physics and math. Introduce each idea (gravity, thrust, specific impulse, the rocket equation, drag, gravity turn, circular orbit speed) only right before I need to code it. Explain it like a physics book in easy words, and keep every variable named (G, M, R, mu, g, v, m, thrust, ve) with its unit.
* When you give a resource, give a video or talk I can watch, not an article.

PROJECT SPEC (do not change; this is my own Project 3 document)

GOAL
Fly a rocket from the ground into a stable circular orbit 200 km up, in my own simulation, and show it as a 3D picture and a video. Do one stage at a time. Ignore later stages until the current one is ticked.

THE IDEA IN PLAIN WORDS
A rocket does not reach orbit by going up. It reaches orbit by going sideways very fast, at about 7.8 km/s, so fast that it keeps missing the ground. Going up only gets it above the air. So the launch has three jobs:
* Climb out of the thick air quickly.
* Tilt over slowly (the gravity turn) and build up sideways speed.
* At the top of the climb, fire once more to make the path a circle instead of a flat arc.
The rocket burns fuel, so it gets lighter as it flies. Gravity and air drag steal speed all the way. My simulation shows exactly how much.

THE BIG SIMPLIFICATION
A flat 2D problem. The rocket stays in one plane through the centre of the Earth, so I use x (sideways) and y (up from the centre) only. Earth does not spin. Gravity points to the centre. The air gets thinner with height. I use real SI units (metres, seconds, kilograms), because the numbers are meaningful.

KEY NUMBERS
* G = 6.674e-11. Earth mass M = 5.972e24 kg. Earth radius R = 6.371e6 m. mu = G × M = 3.986e14.
* Gravity at distance r from the centre: g = mu / r². At the surface it is 9.82 m/s².
* Circular orbit speed at 200 km: v = sqrt(mu / r) = 7,788 m/s, with r = R + 200,000 m.
* Orbit period at 200 km: T = 2π × sqrt(r³ / mu) = 88.35 minutes.
* Escape speed at the surface: sqrt(2 × mu / R) = 11,186 m/s.
* The rocket equation: delta_v = ve × ln(m0 / m1). Exhaust speed ve = Isp × 9.81. With ve = 3,000 m/s and a mass ratio of 10, delta_v = 6,908 m/s.
* Air density: rho = rho0 × exp(-h / H), with rho0 = 1.225 kg/m³ and H = 8,500 m. Drag = 0.5 × rho × v² × Cd × A.

HAND-CHECKS (on paper, before any code)
1. Surface gravity. mu / R² must give 9.82 m/s².
2. Orbit speed and period. At 200 km: 7,788 m/s and 88.35 minutes.
3. The rocket equation. ve = 3,000 and m0 / m1 = 10 give 6,908 m/s. Notice this is less than the 7,788 I need, so one stage of mass ratio 10 is not enough.
4. Energy. Per kilogram, E = 0.5 × v² − mu / r stays constant with no thrust and no drag. This becomes my test for RK4.
5. Circular orbit speed gives escape speed. sqrt(2) × 7,788 at the surface radius is 11,186. I check the numbers agree.

HOW THE ROCKET MOVES (state and forces)
* State: position (x, y), velocity (vx, vy), mass m. Altitude h = sqrt(x² + y²) - R.
* Gravity: acceleration = -mu × (x, y) / r³.
* Thrust: acceleration = (thrust / m) in the direction the rocket points. Mass loss: dm/dt = -thrust / ve.
* Drag: acceleration opposite to the velocity, size 0.5 × rho × v² × Cd × A / m.
* My step_RK4 steps the whole state together. Only the acceleration function changes.

BUILD STAGES (tick a stage only when its "Done when" is true; commit after every tick)
* Stage 1: Flat ground, straight up. Constant g = 9.81, constant thrust, mass loss. Plot height against time. Done when: the burnout speed matches the rocket equation minus gravity (delta_v - g × burn time) within 1%.
* Stage 2: Real gravity. Replace constant g by mu / r². No thrust. Launch a ball at 7,788 m/s sideways from 200 km up. Done when: it traces a circle and returns after 88.35 minutes (within 0.1%), and the energy check stays constant.
* Stage 3: Add the Earth. Draw the planet as a circle, plus the orbit. Try 6,000 m/s sideways (an ellipse that hits the ground) and 9,000 m/s (a bigger ellipse). Done when: three orbits are drawn in one picture, with a hit-the-ground stop.
* Stage 4: Add thrust and mass loss. Vertical launch from the surface, fuel burning. Done when: the burnout speed matches hand-check 3 in a no-gravity test (set g = 0 for the test only).
* Stage 5: Add drag. Use the air density formula. Done when: a vertical launch shows speed peaking and then dropping a little in thick air, and the loss from drag is printed in m/s.
* Stage 6: Pitch program (the gravity turn). Fly straight up for 10 seconds, then tilt the nose a small angle, then let the nose follow the velocity direction. Done when: the rocket ends up flying nearly horizontal at the top of its climb.
* Stage 7: Reach a stable path. Tune the pitch, thrust and fuel by hand until the rocket reaches an orbit with a perigee above 100 km. Done when: the path stays up for one full orbit without touching the ground.
* Stage 8: Circularise. At the highest point of the path, burn sideways for the speed difference delta_v = v_circ - v_apogee. Done when: the final orbit has an eccentricity below 0.01 and a height of 200 km (within 5 km).
* Stage 9: Add a second stage. Drop the empty tank, which changes the mass and the thrust. Done when: the two-stage rocket reaches orbit with less fuel than one stage can.
* Stage 10: Report the losses. Print the delta_v budget: ideal rocket-equation delta_v, minus gravity loss, minus drag loss, equals the final orbit speed. Done when: the numbers add up within 1%.
* Stage 11: Make it 3D and visual. Draw the Earth as a sphere with matplotlib 3D, or PyVista, or export the path to Blender. The trajectory is a glowing line, and the rocket is a small cone pointing along the nose direction. Done when: I see the launch from the side and from space.
* Stage 12: Animate. Save a picture every few seconds and join them with ffmpeg into a video, with a text overlay showing time, altitude and speed. Done when: I have a 20 to 30 second video.
* Stage 13: Write up. Hero image, the checks (9.82, 7,788, 88.35 minutes, 6,908), the delta_v budget and an honest list of what is simplified. Done when: a friend can run it from my README alone.

TRAPS (warn me when we reach each one)
* Units. Everything in metres, seconds, kilograms. Never kilometres inside the code. Radians inside the code, degrees only for display.
* Altitude against radius. Gravity needs the distance from the Earth's centre (R + h), not the height.
* The time step. Too big breaks the orbit. Halve it and check the result does not change. Use a smaller step during burns.
* Mass cannot go negative. Stop the burn when the fuel is gone, and keep the dry mass.
* Pitch angle. Use atan2, not atan, so I get the right quarter of the circle.
* Energy drift. If the energy check drifts in a no-thrust orbit, the bug is in my acceleration, not in the physics.

WATCH FIRST (videos)
Search YouTube for: "Scott Manley how orbits work", "Scott Manley gravity turn explained", "Kerbal Space Program gravity turn tutorial", "Tsiolkovsky rocket equation explained".

FINISH CHECKLIST
* The orbit picture, the 3D picture and the launch video in the README
* The delta_v budget table: ideal, gravity loss, drag loss, final
* The orbit speed and period: my numbers next to 7,788 m/s and 88.35 minutes
* A line saying what is simplified: flat 2D, no Earth rotation, a simple air model, a constant drag coefficient
* Repo pinned on my GitHub profile

HOW TO TEACH ME (the method)

1. Start from zero: GitHub repo, folder structure, and a tiny first plot on screen before any real feature.
2. Every step ends with me running something and seeing a visible result (a plot, a printed number I can check against a hand-check, or an image). Even tiny.
3. Follow the stages in order. Before each stage, do the matching hand-check on paper with me first. Show me the check, I do it, then we code.
4. Before moving to the next stage, ask me ONE short question to check I understood the last one.
5. Ask me one question at a time if you need to know something about my setup. Don't dump a list.
6. Keep my step_RK4 style. Make me reuse it. Only the acceleration function changes.

PROFESSIONAL WORKFLOW (strict, from day one)

* I use Windows and Git Bash.
* One GitHub repo. Never commit straight to main. For each stage: create a branch (feature/stage-2-real-gravity), commit small and often, push, open a pull request with a short description and a screenshot of the result, review it with me, then merge. Tick the stage in the README checklist inside that PR.
* Commit messages: Conventional Commits (feat:, fix:, docs:, test:, refactor:, chore:), short and in present tense.
* One code style for the whole project: Ruff (lint + format) set up in Stage 1, PEP 8, 4 spaces, type hints on every function, snake_case for variables and functions, UPPER_SNAKE_CASE for constants, a virtual environment, and requirements.txt.
* Comments: a short docstring on every function (what it does, inputs with units, output). Above each physics step, a one-line comment naming the formula. Explain WHY, not what.
* Tests: pytest. Each hand-check becomes a test (surface gravity is 9.82, circular orbit returns after 88.35 minutes, energy is constant without thrust, and so on). A stage is only ticked when its test passes.
* Folder structure: src/rocket/ (rk4.py, physics.py, vehicle.py, guidance.py, plotting.py), tests/, docs/ (pictures, hand-checks), scripts/, README.md, .gitignore, pyproject.toml, requirements.txt.
* Keep units clean. SI units in all code. Radians inside the code. Convert to degrees only for display.

START NOW:
Propose the repo/folder structure and the very first thing I should run to see something on screen (Stage 1: a rocket going straight up, with a height-against-time plot). Keep it short. Then wait for me.
