I'm Stephane, a BSc Software Engineering student. I want to build Project 4, an AI Pilot that lands a rocket, as a learning + portfolio project. The project spec is below. Keep it exactly as written. Only the way you teach me changes.

MY CONSTRAINTS (follow these strictly):

* I'm a visual learner with ADHD. I need something on screen (a plot or an image or an animation) at EVERY step. No step where I just read theory with nothing to run.
* Keep every message SHORT. No long walls of text. One small step at a time.
* I don't like reading to learn. I learn by building, watching, and doing. Explain just enough to make the next line of code make sense, then let me run it.
* I use Python. I know the fundamentals and I already have a working RK4 (my step_RK4). Don't re-teach basic Python. Teach NumPy, Matplotlib and the machine learning libraries as we hit them.
* I don't want finished code handed to me. I want to understand and write it myself, with you guiding me line by line or in small chunks. No vibe coding. If I'm stuck, give a hint first, then a smaller hint, and code only as a last step.
* I've used Blender/Unity for 3D since I was 13, so I already think in 3D space, vectors and cameras. Don't over-explain 3D.
* I'm weak in physics and math. Introduce each idea (thrust-to-weight ratio, stopping distance, PD control, reward, policy, episode) only right before I need to code it. Explain it like a physics book in easy words, and keep every variable named with its unit.
* When you give a resource, give a video or talk I can watch, not an article.

PROJECT SPEC (do not change; this is my own Project 4 document)

GOAL
Build a simple rocket landing world, then teach a computer pilot to land the rocket softly on a pad. First I write a pilot by hand with physics. Then I let a reinforcement learning agent learn to do it by trial and error. At the end I compare the two. Do one stage at a time. Ignore later stages until the current one is ticked.

THE IDEA IN PLAIN WORDS
A landing rocket falls, and the pilot can switch the engine on to slow down. Burn too early and the rocket runs out of fuel or goes back up. Burn too late and it crashes. The perfect plan is to fall freely, then burn at exactly the right height, so the speed reaches zero right at the ground (the suicide burn). A learning agent has no physics knowledge. It tries thousands of landings, gets a reward for a soft landing and a penalty for a crash, and slowly learns the same idea.

THE BIG SIMPLIFICATION
A flat 2D world. The rocket has a position (x, y), a velocity (vx, vy), a tilt angle theta and a spin rate omega. Gravity is constant at g = 9.81 m/s². The ground is flat at y = 0 and the pad is a stretch of it. The engine has a maximum thrust and can swivel a little (gimbal). Air drag is ignored at first. I use SI units.

KEY NUMBERS
* Free fall from a height h: speed v = sqrt(2 × g × h) and time t = sqrt(2 × h / g). From 1,000 m, v = 140 m/s and t = 14.3 s.
* Thrust-to-weight ratio: T / (m × g). With a ratio of 3, the engine gives 3 g of acceleration, and the net slowing acceleration is 2 g = 19.62 m/s².
* Stopping distance with full thrust: d = v² / (2 × a_net). From 140 m/s, with a_net = 19.62, d = 500 m. So the suicide burn starts at 500 m.
* A soft landing (my rule): vertical speed below 2 m/s, tilt below 5°, sideways speed below 2 m/s, and within 5 m of the pad centre.

HAND-CHECKS (on paper, before any code)
1. Free fall. From 1,000 m: v = 140.07 m/s and t = 14.28 s.
2. Stopping distance. With thrust-to-weight 3 and v = 140 m/s: d = 500 m.
3. Burn time. t_burn = v / a_net = 140 / 19.62 = 7.1 s.
4. Fuel cost. Mass flow = thrust / ve. I check that 7.1 s of burn fits in my fuel.
5. Landing rule. Write down the soft-landing numbers above as the pass/fail test.

BUILD STAGES (tick a stage only when its "Done when" is true; commit after every tick)
* Stage 1: The world, no pilot. A rocket starts at 1,000 m and falls with no engine. Draw it with Matplotlib. Done when: it hits the ground at 14.3 s with a speed of 140 m/s (hand-check 1).
* Stage 2: Add the engine. Thrust, mass loss and the tilt. Reuse my step_RK4. Done when: a constant 3 g thrust makes the rocket go up, and fuel runs out at the expected time.
* Stage 3: Draw the flight live. An animation (Matplotlib FuncAnimation) with the rocket as a rectangle, a flame when the engine is on, and a pad. Done when: I can watch a flight and see speed, height and fuel on screen.
* Stage 4: Hand-written pilot 1 (vertical only). Free fall, then full thrust at the height from hand-check 2. Done when: the rocket lands softly from 1,000 m in a straight drop.
* Stage 5: Hand-written pilot 2 (PD controller). A controller that sets the thrust to follow a target speed that shrinks with height. Done when: it lands softly from 10 different starting heights and speeds, and I print the success rate.
* Stage 6: Add tilt and sideways motion. Start 100 m off to the side with a small tilt. A second PD controller steers the tilt using the gimbal. Done when: the rocket lands on the pad with the soft-landing rule, from 20 random starts.
* Stage 7: Wrap it as a Gymnasium environment. reset() puts the rocket at a random start. step(action) moves it by one small time step and returns the observation, the reward, and whether the episode is over. Done when: a random pilot runs for many episodes without errors, and gymnasium's environment checker passes.
* Stage 8: Design the reward. A small reward for getting closer to the pad and slowing down, a big reward for a soft landing, a big penalty for a crash, and a tiny penalty for fuel. Done when: my hand-written pilot from Stage 6 scores much higher than the random pilot, so the reward makes sense.
* Stage 9: Train the agent. Use Stable-Baselines3 and the PPO algorithm. Plot the average reward against training steps. Done when: the learning curve rises, and the trained agent lands softly in more than 80% of 100 test landings.
* Stage 10: Watch it learn. Record a short video at three moments: before training, halfway, and after training. Done when: I have a side-by-side clip showing the agent crashing, then wobbling, then landing.
* Stage 11: Compare. Hand-written PD pilot against the learning agent, on the same 200 random starts. Table: success rate, average fuel used, average landing speed. Done when: I have the table and one honest sentence about which pilot wins and why.
* Stage 12: Make it harder. Add wind, or a random engine failure, or a smaller pad. Done when: I see how each pilot copes, and the table is updated.
* Stage 13: Link to Project 3. Use the final speed and height of my launch simulation as the start of a landing, if I choose. Optional.
* Stage 14: Write up. Hero GIF, the learning curve, the comparison table, and an honest list of what is simplified. Done when: a friend can run it from my README alone.

TRAPS (warn me when we reach each one)
* Reward hacking. The agent may find a trick, for example hovering forever to collect small rewards. Add a time limit and a fuel penalty.
* Reward scale. If the crash penalty is much larger than everything else, the agent learns nothing. Keep rewards in a similar range.
* Observation scale. Divide heights and speeds by typical values so the numbers the agent sees are near -1 to 1.
* The time step. Use a fixed small step (for example 0.02 s) and do not change it between training and testing.
* Randomness. Set seeds, so I can repeat a result. Train with several seeds and report the average, not the best run.
* Angles. Use radians inside the code. Wrap the tilt angle to the range -π to π.
* Overfitting to one start. Always test the agent on starts it never saw during training.

WATCH FIRST (videos)
Search YouTube for: "Nicholas Renotte reinforcement learning Stable Baselines3 tutorial", "SpaceX Falcon 9 landing explained suicide burn", "Gymnasium LunarLander PPO", "Steve Brunton PID control explained".

FINISH CHECKLIST
* The landing GIF and the learning curve in the README
* The comparison table: hand-written pilot against the learning agent
* The three checks: 140 m/s fall speed, the 500 m burn height, the 80% success rate
* A line saying what is simplified: 2D world, flat ground, constant gravity, no air, a simple engine
* Repo pinned on my GitHub profile

HOW TO TEACH ME (the method)

1. Start from zero: GitHub repo, folder structure, and a tiny first plot on screen before any real feature.
2. Every step ends with me running something and seeing a visible result (a plot, a printed number I can check against a hand-check, or an animation). Even tiny.
3. Follow the stages in order. Before each stage, do the matching hand-check on paper with me first. Show me the check, I do it, then we code.
4. Before moving to the next stage, ask me ONE short question to check I understood the last one.
5. Ask me one question at a time if you need to know something about my setup. Don't dump a list.
6. Keep my step_RK4 style. Make me reuse it for the rocket motion.

PROFESSIONAL WORKFLOW (strict, from day one)

* I use Windows and Git Bash.
* One GitHub repo. Never commit straight to main. For each stage: create a branch (feature/stage-4-vertical-pilot), commit small and often, push, open a pull request with a short description and a screenshot of the result, review it with me, then merge. Tick the stage in the README checklist inside that PR.
* Commit messages: Conventional Commits (feat:, fix:, docs:, test:, refactor:, chore:), short and in present tense.
* One code style for the whole project: Ruff (lint + format) set up in Stage 1, PEP 8, 4 spaces, type hints on every function, snake_case for variables and functions, UPPER_SNAKE_CASE for constants, a virtual environment, and requirements.txt.
* Comments: a short docstring on every function (what it does, inputs with units, output). Above each physics step, a one-line comment naming the formula. Explain WHY, not what.
* Tests: pytest. Each hand-check becomes a test (free fall gives 140 m/s from 1,000 m, the burn height is 500 m, the soft-landing rule is correct, the environment passes the checker). A stage is only ticked when its test passes.
* Folder structure: src/lander/ (rk4.py, world.py, pilots.py, env.py, train.py, plotting.py), tests/, docs/ (pictures, hand-checks), scripts/, models/ (git-ignored), README.md, .gitignore, pyproject.toml, requirements.txt.
* Keep units clean. SI units in all code. Radians inside the code. Convert to degrees only for display.

START NOW:
Propose the repo/folder structure and the very first thing I should run to see something on screen (Stage 1: a rocket falling from 1,000 m with a plot of height against time). Keep it short. Then wait for me.
