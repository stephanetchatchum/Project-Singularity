I'm Stephane, a BSc Software Engineering student. I want to build Project 2, a Black Hole Ray Tracer, as a learning + portfolio project. The project spec is below. Keep it exactly as written. Only the way you teach me changes.

MY CONSTRAINTS (follow these strictly):

* I'm a visual learner with ADHD. I need something on screen (a plot or an image) at EVERY step. No step where I just read theory with nothing to run.
* Keep every message SHORT. No long walls of text. One small step at a time.
* I don't like reading to learn. I learn by building, watching, and doing. Explain just enough to make the next line of code make sense, then let me run it.
* I use Python. I know the fundamentals and I already have a working RK4 (my step_RK4 from the spring and the orbit projects). Don't re-teach basic Python. Teach NumPy and Matplotlib idioms as we hit them.
* I don't want finished code handed to me. I want to understand and write it myself, with you guiding me line by line or in small chunks. No vibe coding. If I'm stuck, give a hint first, then a smaller hint, and code only as a last step.
* I've used Blender/Unity for 3D since I was 13, so I already think in 3D space, vectors and cameras. Don't over-explain 3D.
* I'm weak in physics and math. Introduce each idea (impact parameter, photon sphere, shadow, geodesic equation) only right before I need to code it. Explain it like a physics book in easy words, and keep every variable named (G, c, M, b, u, r, phi) even when it equals 1.
* When you give a resource, give a video or talk I can watch, not an article.

PROJECT SPEC (do not change; this is my own Project 2 document)

GOAL
Make a picture of what a camera would see near a black hole, by following light backwards from every pixel and bending it with my RK4. Do one stage at a time. Ignore later stages until the current one is ticked.

THE IDEA IN PLAIN WORDS
A picture is a grid of pixels. For each pixel I ask: which direction does the light in this pixel come from? I follow that ray backwards, out of the camera and into space.
* With no black hole, the ray goes straight and hits a star in the background.
* With a black hole, the ray bends. Rays that pass close bend a lot, so the stars look stretched and warped.
* Rays that pass too close never escape. Those pixels are black. The black circle is the shadow.

THE BIG SIMPLIFICATION
Near a non-spinning black hole, a ray of light stays in one flat plane through the centre. So every ray is a 2D problem, solved with one equation, then placed back into 3D. Units: G = c = black hole mass = 1. Distances are counted in multiples of the mass.

  d²u/dφ² = −u + 3u²

u = 1/r, where r is the distance from the black hole. φ is how far the ray has swept around the black hole in its plane. It has the same shape as my spring (x'' = −x). The only new part is 3u², and it bends the light. So my step_RK4 almost transfers: the "position" is u, the "velocity" is du/dφ, and only the acceleration changes.

KEY NUMBERS
* Event horizon: r = 2 (u = 0.5). Nothing returns from inside.
* Photon sphere: r = 3. Light can orbit here.
* Shadow edge: b = 3 × √3 ≈ 5.196. Rays with b below this fall in.
* Weak bend: about 4 ÷ b radians, for rays that stay far away.
b is the impact parameter: how close the ray would pass to the centre if it were not bent.

HAND-CHECKS (on paper, before any code)
1. Flat space. Without the 3u² term, u = sin(φ) ÷ b. A ray that starts far away (u = 0) with du/dφ = 1 ÷ b returns to u = 0 at φ = π. The bend is exactly 0.
2. Weak bend. With b = 100, the bend is about 4 ÷ 100 = 0.04 radians (2.3°). My own run gives 0.0414.
3. Camera ray, flat space. A camera at r = 50 sees a pixel at angle α = 30° from the direction of the black hole. The ray escapes at φ = 180° − 30° = 150°. Also b = 50 × sin 30° = 25, and the ray's starting du/dφ is cot(30°) ÷ 50 = 0.0346.
4. Disk crossing, flat space. A camera straight above the disk at r = 50, with a pixel at α = 10°, hits the disk plane at distance 50 × tan 10° = 8.82 from the centre.

HOW A RAY STARTS AND WHERE IT STOPS
* Ray that starts far away: u = 0 and du/dφ = 1 ÷ b. It stops when u returns to 0 (escaped, bend = φ − π) or when u reaches 0.5 (fell in).
* Ray that starts at the camera (distance r_cam): (du/dφ)² = 1/b² − u²(1 − 2u), with the sign that sends the ray inward, and b = r_cam × sin α ÷ √(1 − 2/r_cam). That b formula is for a camera that sits still. If it is too much at first, put the camera far away and use b = r × sin α.

BUILD STAGES (tick a stage only when its "Done when" is true; commit after every tick)
* Stage 1: Flat space first. Switch off the 3u² term and trace a ray with b = 10. Done when: u returns to 0 at φ = π (within 0.001), and the path drawn in x, y (x = cos φ ÷ u, y = sin φ ÷ u) is a straight line 10 from the centre.
* Stage 2: Switch the bend on. Use a step of about 0.001 in φ. Done when: b = 100 gives a bend of about 0.041, b = 5.0 falls in, and b = 5.3 escapes after bending by more than 3 radians.
* Stage 3: Draw a fan of rays. 30 rays with different b in one 2D picture, plus circles at r = 2 and r = 3. Done when: rays near b = 5.2 loop around and rays below 5.19 fall in. This is my first README picture.
* Stage 4: Measure the shadow. Search between b = 5 and b = 5.4, halving the gap each time, to find where rays stop escaping. Done when: I find 5.196 within 0.01.
* Stage 5: Add a camera. Put it at r = 50 and turn each pixel into an angle α from the direction of the black hole. Trace each ray from the camera, then turn the escape angle into a direction in 3D. Done when: with the bend switched off, α = 30° gives an escape angle of 150°, as in hand-check 3.
* Stage 6: Make a small image. 100 × 100 pixels, with a checkerboard painted on the sky so the warping is easy to see. Done when: flat space shows an undistorted checkerboard, and the bend shows a distorted one with a black disc in the middle whose half-angle is about 5.8°.
* Stage 7: Make it fast. Because the black hole is a perfect sphere, the escape angle depends only on α. Trace about 2,000 rays across all α once, store the answers in a table, then let every pixel look up its answer with NumPy interpolation. Done when: an 800 × 600 image takes seconds, not minutes, and looks the same as Stage 6.
* Stage 8: Add the glowing disk. A flat ring in the equator plane, from r = 3 to r = 10 (my choice). A ray's 3D position is r × (cos φ × direction 1 + sin φ × direction 2), where direction 1 points from the black hole to the camera and direction 2 is sideways, along the ray's plane. When the height above the disk plane changes sign between two steps, the ray crossed the disk. Done when: with the bend switched off and the camera above, I see a perfect ring, and hand-check 4 matches.
* Stage 9: Colour the disk. Hot white-yellow near the inside, red toward the outside. Tilt the camera so I look at the disk almost edge-on, to get the famous look with light bent over the top. Done when: the image shows the bent copy of the disk over and under the shadow.
* Stage 10: Add stars. Random bright dots on the sky, or a free star-map image. The direction I computed turns into longitude and latitude to look up a colour. Done when: stars near the shadow are stretched into arcs.
* Stage 11: Animate. Move the camera around in 60 to 120 steps and save a picture each time. Join them into a video with ffmpeg. Done when: I have a 10 second loop.
* Stage 12: Write up. Hero image, the three checks (150°, 0.041, 5.196), and an honest list of what is simplified. Done when: a friend can run it from my README alone.

TRAPS (warn me when we reach each one)
* Degrees and radians. Python's maths uses radians. Mixing them is the most common reason pictures look wrong.
* Steps too big near b = 5.2. Rays there wind around the black hole. Halve the step and check the bend does not change.
* Rays that never finish. Put a maximum number of steps on every ray, and treat a ray that never finishes as black.
* Angle wrap-around. Use atan2 when turning x and y into an angle, so I get the right quarter of the circle.

WATCH FIRST (videos)
Search YouTube for: "Sebastian Lague coding adventure black holes", "how Interstellar's black hole was made", "Schwarzschild black hole shadow explained".

FINISH CHECKLIST
* The fan-of-rays picture and the lensed starfield in the README
* The shadow measurement: my number next to 5.196
* The rendering time before and after the lookup table
* A line saying what is simplified: the black hole does not spin, and the disk brightness is artistic, not exact physics
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
* One GitHub repo. Never commit straight to main. For each stage: create a branch (feature/stage-2-bend-on), commit small and often, push, open a pull request with a short description and a screenshot of the result, review it with me, then merge. Tick the stage in the README checklist inside that PR.
* Commit messages: Conventional Commits (feat:, fix:, docs:, test:, refactor:, chore:), short and in present tense.
* One code style for the whole project: Ruff (lint + format) set up in Stage 1, PEP 8, 4 spaces, type hints on every function, snake_case for variables and functions, UPPER_SNAKE_CASE for constants, a virtual environment, and requirements.txt.
* Comments: a short docstring on every function (what it does, inputs with units, output). Above each physics step, a one-line comment naming the formula. Explain WHY, not what.
* Tests: pytest. Each hand-check becomes a test (flat space returns to u = 0 at φ = π, bend at b = 100 is about 0.041, shadow is 5.196 within 0.01, and so on). A stage is only ticked when its test passes.
* Folder structure: src/blackhole/ (rk4.py, ray.py, camera.py, render.py), tests/, docs/ (pictures, hand-checks), scripts/, README.md, .gitignore, pyproject.toml, requirements.txt.
* Keep units clean. G = c = M = 1 in all code. Radians inside the code. Convert to degrees only for display.

START NOW:
Propose the repo/folder structure and the very first thing I should run to see something on screen (Stage 1: a straight ray in flat space). Keep it short. Then wait for me.
