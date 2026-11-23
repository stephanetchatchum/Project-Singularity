# BUILD MY PERSONAL COMPUTATIONAL SCIENCE ACADEMY

I want you to design and build a complete, functional web application from scratch. This application will be my personal **Computational Science Academy**: an interactive learning environment that helps me master the mathematics, physics, numerical methods, scientific computing, and programming behind eight ambitious computational science projects.

This is your first message in this project. Do not assume any previous conversation, existing application, or codebase. I will provide project specification documents as attachments. Read them carefully before designing or implementing anything.

This is not simply a dashboard or an online textbook. I want a personal learning environment built around two central pillars:

**LISTENING + VISUAL LEARNING.**

I learn much better when I can listen to an explanation while watching a concept being demonstrated. Reading should support my learning, not be the main way I experience it.

The application should feel like having a personal science tutor who explains concepts aloud while demonstrating them visually.

---

# 1. ABOUT ME

I am Stephane Tchatchum Chassem, a BSc Software Engineering student at African Leadership University (ALU) in Kigali, Rwanda. I am originally from Cameroon.

My long-term goal is to become a **computational scientist / simulation engineer**.

I am particularly interested in:
- Computational physics and scientific computing.
- Numerical methods and mathematical modelling.
- Astronomy, astrophysics, and aerospace engineering.
- Climate science and Earth observation.
- Fluid dynamics and computational fluid mechanics.
- Robotics and artificial intelligence.
- Computational biology and scientific machine learning.
- High-performance computing and scientific simulation.

My mission is to contribute to Africa's scientific and technological independence by developing the computational skills needed to solve real scientific and engineering problems.

I do not want to become just another web developer. I want to understand the science and mathematics behind the software I build.

# 2. HOW I LEARN: THE MOST IMPORTANT REQUIREMENT

My learning experience must be designed around my actual habits.

I am a strongly visual and auditory learner. I prefer listening to explanations and watching concepts unfold rather than reading lengthy explanations.

I also struggle with long, monotonous learning sessions and information overload. I need an environment that maintains my attention and gives me a reason to keep going.

**The application must be audio-first AND visual-first. Neither is an optional extra.**

## A. LISTENING MUST BE A CORE LEARNING MODE

This is extremely important.

I prefer listening to explanations rather than reading them. Do not build an application that presents long written lessons and expects me to read everything.

I want lessons to feel like a tutor is personally teaching me.

Every substantial lesson should have an audio explanation as a first-class feature.

The experience should include:

- A prominent **Listen to Lesson** control.
- Natural-sounding spoken explanations.
- Play, pause, resume, replay, and rewind controls.
- Adjustable playback speed.
- The ability to replay a particular explanation or section.
- Clear separation between lesson sections so I can listen in short sessions.
- Synchronized highlighting of the sentence or concept currently being explained.
- Spoken explanations of equations, symbols, graphs, and diagrams.
- Short spoken recaps of important concepts.
- Audio explanations of mistakes and exercise feedback where appropriate.

I should be able to open a lesson, press play, and follow along without needing to read paragraphs.

### Audio-first lesson design

Each lesson should be structured like a short teaching session:

1. Introduce the concept verbally.
2. Explain it in simple language.
3. Show a visual demonstration while explaining it.
4. Give a concrete example.
5. Explain why it matters for the project.
6. Ask me a short question or give me a small task.
7. End with a brief spoken recap.

The narration should sound like a real teacher explaining something, not a robotic voice reading a textbook.

Use natural conversational language, appropriate pauses, and short sentences.

Do not simply feed long mathematical text directly into text-to-speech. Equations must be converted into understandable spoken explanations.

For example, when explaining:

\(F=ma\)

The narration should say something like:

"Force equals mass multiplied by acceleration. This means that the force acting on an object depends on how massive it is and how quickly its velocity changes."

When explaining an integral, derivative, matrix, or differential equation, the spoken explanation should help me understand what the mathematical expression means, not just pronounce its symbols.

### Audio technology

Investigate and implement a reliable audio architecture.

Possible approaches include:
- High-quality text-to-speech.
- Browser speech synthesis where suitable.
- Pre-generated audio for important lessons.
- Local audio assets.
- Other practical speech technologies if they provide a substantially better experience.

Do not assume that browser speech synthesis will always provide a good voice or work offline.

Detect available voices and capabilities. Provide a sensible fallback when a suitable voice is unavailable.

Core learning should not depend on a paid external API or a permanent internet connection.

If a high-quality offline voice requires a local model or additional setup, explain the trade-offs and propose a practical implementation.

I want to be able to listen to lessons offline whenever the required audio or voice resources are available locally.

### Audio interface

The audio controls should be easy to access and should not be hidden inside menus.

Consider a persistent mini-player that allows me to:
- See the current lesson.
- Pause and resume.
- Move backward or forward.
- Change playback speed.
- Continue listening while navigating other parts of the academy.

Also consider a dedicated listening mode with minimal distractions.

Do not play audio automatically without my permission.

## B. VISUAL LEARNING MUST BE EQUALLY CENTRAL

I understand concepts much better when I can see them happening.

Whenever a concept can be demonstrated visually, demonstrate it.

Examples:

- Gravity: show objects attracting one another.
- Derivatives: show a curve and its changing slope.
- Integration: show the accumulation of area.
- Vectors: display arrows changing direction and magnitude.
- Numerical integration: animate Euler and RK4 approximations.
- Fluid dynamics: show particles moving through a fluid.
- Electromagnetic fields: display field lines and vectors.
- Orbital mechanics: animate an orbit.
- Wave equations: show waves propagating and interfering.

I want interactive diagrams, animations, simulations, sliders, graphs, and experiments.

Do not use static illustrations when an interactive demonstration would teach the concept better.

### Synchronize audio and visuals

This is a particularly important requirement.

The narration and visual demonstration should work together.

For example, when explaining a gravitational orbit:
- The tutor explains gravitational attraction.
- The planet and central body are animated.
- The gravitational force vector is displayed.
- The narration explains how the force changes with distance.
- The corresponding equation appears.
- Important parts of the equation are highlighted as they are explained.

When teaching a derivative:
- The tutor explains the idea of instantaneous rate of change.
- A tangent moves along a curve.
- The slope changes visibly.
- The equation is displayed and explained aloud.

I want to see and hear the concept at the same time.

## C. READING SHOULD SUPPORT LEARNING, NOT DOMINATE IT

Keep written explanations short and easy to scan.

Use:
- Short sentences.
- Simple language.
- Concise definitions.
- Small sections.
- Visual summaries.
- Clearly displayed equations.
- Optional deeper explanations.

Do not put all the information into text and expect me to read it.

Every important written explanation should be available through audio whenever practical.

I should be able to choose to read, listen, or use both together.

## D. KEEP LESSONS SHORT

- Teach one concept at a time.
- Break complicated subjects into small, manageable steps.
- Avoid enormous paragraphs and walls of text.
- Never introduce several unfamiliar concepts simultaneously.
- Do not assume I already understand mathematical or scientific prerequisites.
- Give me frequent opportunities to interact.

## E. LET ME EXPERIMENT

I should be able to manipulate scientific parameters and immediately see the results.

For example:
- Change gravity and observe an orbit.
- Change viscosity and observe how fluid motion changes.
- Change the time step and compare numerical accuracy.
- Change a wave's frequency and observe its propagation.
- Change a charge's magnitude and observe the electromagnetic field.

The application should help me discover relationships through experimentation.

## F. LET ME DO THE THINKING

Do not turn the platform into a copy-and-paste coding tutorial.

I want to understand what I am building.

- Explain the concept.
- Narrate the explanation.
- Demonstrate it visually.
- Give me a small task.
- Let me attempt it.
- Offer hints when I struggle.
- Explain mistakes without simply giving away the answer.
- Gradually increase difficulty.

Do not immediately reveal complete solutions.

## G. KEEP ME ENGAGED

- Make lessons feel like short missions.
- Give me visible progress.
- Use small achievements and meaningful milestones.
- Include quick knowledge checks.
- Revisit concepts I previously struggled with.
- Provide short recaps before introducing dependent concepts.
- Give me something visual or interactive to accomplish in every learning session.

Avoid unnecessary animations, notifications, or gamification that distract from learning.

## H. PROGRAMMING INSTRUCTION

Python is currently my strongest programming language.

I have experience with Python, NumPy, pytest, Ursina, Git, and GitHub. I have implemented numerical methods including RK4.

I am also learning other languages, including C++ and Julia.

When introducing a new programming language:
- Compare unfamiliar syntax with Python when useful.
- Explain important differences in how the languages work.
- Explain memory management, types, indexing, and other language-specific concepts when relevant.
- Do not assume I understand a feature just because I know Python.
- Let me write the code myself, with guidance.

I also have experience with Blender and Unity 3D. Use those experiences as reference points when explaining 3D graphics concepts where appropriate.

**My preferred learning rhythm is: LISTEN → WATCH → EXPERIMENT → TRY → RECEIVE FEEDBACK → REPEAT.**

---

# 3. THE EIGHT PROJECTS

The academy must organize my learning around these eight computational science projects.

The projects are not random coding exercises. Together, they form a progression toward my goal of becoming a computational scientist and simulation engineer.

Display all eight projects in a structured Project Library.

## Project 1: 3D Gravitational Slingshot Simulator

**Status: Completed**

A 3D gravitational simulation demonstrating orbital mechanics and gravity-assisted trajectories.

Technologies and concepts include:
- Python and NumPy.
- Newtonian gravity.
- Numerical integration.
- Hand-written fourth-order Runge-Kutta (RK4).
- Conservation of energy.
- Three-dimensional visualization.
- Ursina.

I have already completed this project. Do not make me repeat it.

Use it as a foundation for later lessons involving gravity, numerical integration, energy conservation, and simulation.

## Project 2: Black Hole Ray Tracer

A computational physics project exploring how light travels around a black hole.

Important concepts include:
- Schwarzschild geometry.
- Natural units.
- General relativity concepts.
- Photon trajectories.
- Numerical integration.
- Black hole shadows.
- Photon spheres and event horizons.
- Ray tracing and visualization.

The project uses the Schwarzschild equation:

\[
\frac{d^2u}{d\phi^2}=-u+3u^2
\]

with natural units \(G=c=M=1\).

Important reference values include:
- Event horizon radius: 2.
- Photon sphere radius: 3.
- Critical impact parameter: \(3\sqrt{3}\approx5.196\).

Teach the underlying mathematics and physics visually and through spoken explanations before expecting me to implement the ray tracer.

## Project 3: Rocket Launch to Orbit Simulator

A physics-based rocket launch simulation.

The project involves:
- Newtonian gravitational mechanics.
- Variable rocket mass.
- Thrust and fuel consumption.
- The rocket equation.
- Atmospheric modelling.
- Aerodynamic drag.
- Pitch programmes and gravity turns.
- Staging.
- Orbital mechanics.
- Verification of a stable orbit.

There have been different versions of this project's specification. Do not combine different versions or silently choose between them. Treat the actual attached specification as authoritative. If multiple conflicting versions are attached, ask me which one to use.

## Project 4: AI Pilot – Rocket Landing

A project involving the simulation and training of an AI agent to land a rocket.

Concepts include:
- Two-dimensional rocket dynamics.
- Gravity and thrust.
- Variable mass.
- Stopping distance and suicide-burn calculations.
- PD control.
- Rocket gimbal control.
- Reinforcement learning.
- Gymnasium.
- PPO.
- Stable-Baselines3.
- Reward design.
- Training and evaluation.

I want to understand the physics and control theory before moving into reinforcement learning.

## Project 5: 3D Electromagnetic Field Visualizer

A full-stack interactive 3D electromagnetic field visualization application.

Technologies include:
- Three.js.
- JavaScript / TypeScript.
- Node.js and Express.
- SQLite.
- JWT authentication.

Scientific concepts include:
- Electric charges.
- Coulomb's law.
- Electric field vectors.
- Superposition.
- Field strength.
- Field lines.
- Three-dimensional vector visualization.

The application should eventually allow users to place charges, modify their magnitudes and polarities, and observe how the electric field changes.

Previously, I had completed the first three development phases and was working on the fourth phase, where the first field arrow was displayed. Use this as an initial progress reference, but do not claim that any further work has been completed without evidence.

## Project 6: 3D Fluid Simulator in C++

A scientific computing and computational fluid dynamics project.

The project uses C++ to implement a three-dimensional fluid simulation.

The underlying specification includes:
- Stable Fluids.
- Incompressible flow.
- Constant viscosity.
- Smoke density.
- Solid walls and obstacles.
- Momentum equations.
- Incompressibility.
- Pressure projection and the Poisson equation.
- Semi-Lagrangian advection.
- Numerical verification.
- Performance optimization.
- Parallel computing.
- Three-dimensional visualization.

The project has a carefully defined staged progression, including a Python prototype, C++ implementation, numerical verification, lid-driven cavity benchmarking, OpenMP, 3D extension, and performance studies.

**Read the attached Project 6 specification and preserve it exactly.** Do not simplify, rewrite, remove, or invent technical requirements. Only adapt how the material is taught to accommodate my learning preferences.

## Project 7: Heat and Wave Solver in Julia with Neural Surrogate

A scientific computing project involving numerical solutions to heat and wave equations, followed by a machine learning surrogate.

The project includes:
- Learning Julia.
- Finite difference methods.
- One-dimensional and two-dimensional heat equations.
- Wave equations.
- Numerical stability.
- Boundary conditions.
- Numerical verification against exact solutions.
- Visualization and animation.
- Performance optimization.
- Multithreading and optional GPU acceleration.
- Generating simulation datasets.
- Training a PyTorch neural surrogate.
- Comparing the neural surrogate with the numerical solver.
- Physics-aware loss functions.

The project should teach me how traditional numerical simulation and machine learning can work together.

**Read the attached Project 7 specification and preserve its technical content and staged progression exactly.** Only the teaching experience should be adapted.

## Project 8: Earth Observation Pipeline

A geospatial scientific computing project using real Sentinel-2 satellite imagery, with an initial focus on Rwanda.

The pipeline includes:
- Searching satellite imagery catalogues.
- Loading and processing Sentinel-2 data.
- Cloud masking.
- Calculating NDVI.
- Analysing vegetation changes over time.
- Generating maps and time series.
- Working with geospatial formats such as Zarr and GeoTIFF.
- Building a command-line interface.
- Automated tests.
- Docker.
- GitHub Actions.
- An interactive map.

The initial scope is deliberately constrained to a 10 km × 10 km area, Sentinel-2 Level-2A data, and selected spectral bands.

The NDVI equation is:

\[
NDVI=\frac{NIR-Red}{NIR+Red}
\]

This project should help me understand how scientific computing can be applied to real environmental challenges affecting Africa.

**Read the attached Project 8 specification and preserve its technical requirements.** It was previously labelled Project 5 in the source document; it must be represented as Project 8 in this academy.

---

# 4. PROJECT SPECIFICATION RULES

I will attach the project specifications to this conversation.

These documents are the authoritative technical requirements for their respective projects.

You must:
1. Read every attached specification before designing the project learning structure.
2. Preserve the scientific equations, assumptions, constraints, milestones, tests, and technical requirements.
3. Never silently remove a requirement because you think it is too difficult.
4. Never invent technical requirements and present them as part of the original specification.
5. Never merge conflicting versions of a specification.
6. Preserve the original staged progression unless I explicitly authorize a change.
7. Adapt the teaching method, explanations, audio narration, visualizations, exercises, and user experience, not the scientific substance.
8. If a project is mentioned here but its detailed specification is not attached, create a clearly marked project overview only. Ask me for its specification before inventing detailed stages.

The academy should make the specifications easier to learn, not replace them with a different curriculum.

---

# 5. WHAT THE APPLICATION MUST CONTAIN

## A. Dashboard

The dashboard should function as my personal scientific learning command centre.

It should show:
- My current learning mission.
- My overall progress across all eight projects.
- My current project and stage.
- My next learning task.
- Recently completed milestones.
- Concepts I need to revisit.
- Learning streaks and session history.
- A visual overview of my scientific learning journey.

Avoid filling the dashboard with meaningless statistics.

## B. Project Library

A dedicated space for all eight projects.

Each project should have:
- Its scientific objective.
- Its real-world relevance.
- Its technical specification.
- Its learning prerequisites.
- Its staged roadmap.
- Its current progress.
- Its completed milestones.
- Its upcoming tasks.
- Its associated mathematics and physics.
- Its programming technologies.
- Its final deliverables.

## C. Learning Studio

This is the heart of the application.

It must combine audio narration and interactive visual demonstrations.

Each lesson should support:
- Spoken explanations.
- Short written explanations.
- Interactive diagrams.
- Animated demonstrations.
- Mathematical equations.
- Scientific visualizations.
- Short video resources where appropriate.
- Worked examples.
- Guided exercises.
- Hints.
- Knowledge checks.
- Short spoken and visual summaries.
- Links to related concepts.

Every substantial lesson should have a listening experience. Do not treat audio as a feature that can be postponed until the end of development.

The lesson player should coordinate the narration, equations, diagrams, and animations.

## D. Interactive Experiment Lab

A dedicated environment where I can experiment with scientific concepts.

Examples include:
- Gravity and orbital mechanics.
- Numerical integration.
- Rocket trajectories.
- Electromagnetic fields.
- Fluid dynamics.
- Heat diffusion.
- Wave propagation.
- Neural surrogate predictions.
- Satellite vegetation analysis.

Where possible, experiments should include:
- Interactive parameter controls.
- Sliders.
- Play, pause, and reset controls.
- Animated visualizations.
- Live graphs.
- Numerical readouts.
- Comparisons between different parameter choices.

The experiments must be scientifically meaningful, not decorative animations.

Clearly distinguish illustrative demonstrations from validated numerical simulations.

## E. Mathematics and Physics Knowledge Library

Build a connected knowledge library for the mathematics and physics underlying the projects.

**Mathematics**
- Algebra.
- Functions.
- Trigonometry.
- Calculus.
- Derivatives and integrals.
- Linear algebra.
- Vectors and matrices.
- Differential equations.
- Numerical analysis.
- Probability and statistics.
- Optimization.

**Physics**
- Classical mechanics.
- Newtonian gravity.
- Orbital mechanics.
- Electromagnetism.
- Thermodynamics.
- Fluid mechanics.
- Waves and oscillations.
- Heat transfer.
- Introductory general relativity.
- Control theory.

This should not become an unrelated textbook. Link concepts directly to the projects where they are needed.

Teach concepts through spoken explanations and visual demonstrations rather than relying on written material.

## F. Progress Tracker

Track meaningful learning progress.

I want to know:
- Which concepts I have learned.
- Which concepts I understand well.
- Which concepts need revision.
- Which exercises I have completed.
- Which project stages I have completed.
- Which deliverables have passed verification.
- How my knowledge is developing over time.

A stage must never be marked complete merely because I opened a lesson.

Completion should depend on clearly defined criteria, such as passing tests, completing an exercise, demonstrating understanding, or producing a required deliverable.

Include a way to record notes and reflections.

---

# 6. VISUAL AND AUDIO DESIGN

The visual identity is extremely important.

I want the application to feel like a futuristic scientific research laboratory, not a generic educational website or ordinary SaaS dashboard.

### Overall aesthetic

- Dark, sophisticated interface.
- Near-black and charcoal backgrounds.
- Subtle scientific patterns.
- Elegant mathematical details.
- Carefully used glass-like panels.
- Refined typography.
- Atmospheric depth.
- Subtle particles and motion.
- Beautiful scientific visualizations.
- High-quality charts and interactive diagrams.

Think of a modern computational physics laboratory combined with a high-end scientific research workstation.

Avoid:
- Generic blue-gradient dashboards.
- Excessive cards.
- White backgrounds as the dominant design.
- Childish gamification.
- Cluttered interfaces.
- Unnecessary decorative animations.
- Generic AI-generated dashboard aesthetics.

### Audio experience design

The audio player should feel like a central part of the academy.

Design:
- A persistent mini-player.
- A dedicated distraction-free listening mode.
- Clear playback progress.
- Playback speed controls.
- Section navigation.
- Replay controls.
- Synchronized text highlighting.
- Visual indicators for narrated sections.

Make it easy to listen without staring at the screen constantly.

I should be able to listen to a lesson while taking a short break from reading or interacting with the screen.

### Visual and audio synchronization

Do not build two disconnected features.

The narration should guide the visual demonstration.

When a tutor explains a graph, highlight the relevant part of the graph. When an equation is explained, highlight the relevant terms. When a physical process is narrated, animate it at the appropriate moment.

The learning experience should make me feel as though someone is teaching me in front of a scientific demonstration.

---

# 7. TECHNICAL REQUIREMENTS

Build a real application, not a static mockup or a collection of screenshots.

I want a maintainable architecture that can grow as the academy expands.

You may propose a suitable stack. A reasonable starting point would be:
- React.
- TypeScript.
- Vite.
- A reusable component architecture.
- IndexedDB for local persistence.
- Three.js for appropriate scientific visualizations.
- SVG and Canvas for diagrams and graphs.
- A Progressive Web App architecture.

For audio, investigate a suitable combination of:
- Speech synthesis.
- Locally stored audio.
- Pre-generated narration.
- Audio playback and synchronization.

Choose an architecture that can support high-quality spoken lessons without making the core experience dependent on a paid service.

### Offline-first functionality

I want the academy to work reliably on my Windows computer, including when I have no internet connection.

Implement it as an offline-first Progressive Web App.

Requirements:
- Installable application.
- Service worker.
- Web app manifest.
- Local caching of application assets.
- Offline access to cached lessons and visualizations.
- Persistent learning progress.
- Persistent notes.
- Local storage of relevant learning data.
- Export and import of progress backups.
- Offline audio where the relevant audio assets or voice resources have been cached or installed.

Do not assume that all browser voices are available offline. Detect voice availability and communicate limitations honestly.

Do not make core learning features depend on remote APIs, external CDNs, or external fonts.

### Scientific correctness

Scientific calculations must be separate from presentation components.

For every simulation or mathematical visualization:
- Use correct equations.
- Respect units.
- Explain assumptions.
- Validate parameter ranges.
- Avoid misleading visual representations.
- Include numerical checks where appropriate.
- Make limitations clear.

A beautiful but scientifically incorrect visualization is unacceptable.

### Accessibility and usability

- Responsive layout.
- Keyboard accessibility.
- Readable equations.
- Clear navigation.
- Consistent interaction patterns.
- Useful loading and error states.
- Reduced-motion support.
- Good contrast.
- Accessible audio controls.

---

# 8. LEARNING EXPERIENCE AND RESEARCH

Research evidence-based ways to support attention, active learning, retention, and motivation.

Use reliable research and established learning-science principles rather than making unsupported claims about ADHD.

Apply appropriate techniques such as:
- Active recall.
- Spaced repetition.
- Retrieval practice.
- Worked examples.
- Gradual difficulty.
- Immediate feedback.
- Interleaving when appropriate.
- Short learning sessions.
- Visual explanations.
- Audio explanations.
- Learning by doing.

Do not make the application feel like a medical product or assume a diagnosis.

The goal is to make the learning experience engaging, manageable, and effective.

When using external learning resources, prioritize high-quality video explanations, visual demonstrations, and practical resources. Do not make the curriculum dependent on long prerecorded lectures.

---

# 9. DEVELOPMENT WORKFLOW

I want to build this application carefully and professionally.

Do not attempt to implement the entire application in one enormous step.

### Step 1: Understand the requirements

Read all attached project specifications.

Identify:
- The eight projects.
- Their technical requirements.
- Their stages.
- Their dependencies.
- Their prerequisites.
- Their expected deliverables.
- Their current progress where explicitly known.

Identify any missing or conflicting documents.

Do not invent missing information.

### Step 2: Design the architecture

Propose:
- The application architecture.
- The technology stack.
- The data model.
- The navigation structure.
- The lesson system.
- The audio narration system.
- The visualization system.
- The progress-tracking system.
- The offline architecture.

Explain your choices briefly and clearly.

### Step 3: Build incrementally

Implement the application in small, testable milestones.

For each milestone:
1. Explain what we are building.
2. Implement it.
3. Run it.
4. Test it.
5. Show me the actual result.
6. Explain what changed.
7. Wait for my feedback before moving to the next major milestone.

Do not tell me something works without actually testing it.

Do not use fake buttons, placeholder functionality, or static mockups in place of required features.

**Do not postpone the listening experience until the final stage.** Build and validate the core audio-and-visual lesson experience early, before populating the academy with large amounts of content.

### Step 4: Professional engineering practices

Use:
- Git and GitHub.
- Feature branches.
- Small, meaningful commits.
- Conventional Commit messages.
- Pull requests.
- Tests.
- Clear documentation.
- A maintainable folder structure.

Never commit directly to the main branch.

Keep scientific calculations testable independently of the user interface.

---

# 10. INITIAL PROJECT PROGRESS

Use the following information as the initial progress state:

| Project | Initial status |
|---|---|
| Project 1: 3D Gravitational Slingshot Simulator | Completed |
| Project 2: Black Hole Ray Tracer | Planned |
| Project 3: Rocket Launch to Orbit Simulator | Planned |
| Project 4: AI Pilot – Rocket Landing | Planned |
| Project 5: 3D Electromagnetic Field Visualizer | In progress |
| Project 6: 3D Fluid Simulator in C++ | Planned |
| Project 7: Heat and Wave Solver in Julia with Neural Surrogate | Planned |
| Project 8: Earth Observation Pipeline | Planned |

For Project 5, my previously reported progress was that the first three phases were complete and Phase 4 was in progress, with one field arrow displayed.

Treat these as initial user-provided records, not independently verified results.

Do not automatically mark any other stages complete.

---

# 11. WHAT SUCCESS LOOKS LIKE

The finished application should allow me to:

1. Open a beautiful, functional scientific learning environment.
2. See all eight projects and their progress.
3. Select a project and understand its learning roadmap.
4. Press play and listen to a tutor explain the lesson.
5. Watch equations, graphs, animations, and scientific demonstrations while listening.
6. Pause, replay, rewind, and adjust narration speed.
7. Learn the necessary mathematics and physics through short, audio-visual lessons.
8. Experiment with interactive scientific demonstrations.
9. Complete exercises and receive useful feedback.
10. Build the actual scientific projects progressively.
11. Track my understanding and revisit difficult concepts.
12. Access cached learning materials and available audio offline.
13. See tangible progress toward becoming a computational scientist.

The application should feel like a personal scientific academy that I can use for years, not a temporary student project.

---

# 12. YOUR FIRST TASK

Before writing large amounts of code:

1. Read all the attached documents.
2. Confirm that you understand the eight projects and their specifications.
3. Identify missing specifications and conflicting versions.
4. Propose the application architecture.
5. Show me the proposed navigation and main user experience.
6. Explain how the audio-first and visual-first lesson system will work technically.
7. Break the development into small milestones.

Keep your initial explanation concise. I do not want a massive technical essay before we begin.

Once we agree on the architecture, start building the actual application.

**THE CENTRAL PRINCIPLE: I DO NOT WANT AN ONLINE TEXTBOOK. I WANT A PERSONAL, AUDIO-VISUAL COMPUTATIONAL SCIENCE ACADEMY. I WANT TO LISTEN TO A TEACHER EXPLAIN THE MATHEMATICS AND PHYSICS WHILE WATCHING THE CONCEPTS COME ALIVE THROUGH INTERACTIVE VISUALIZATIONS. LISTENING AND VISUAL LEARNING MUST SHAPE THE ENTIRE APPLICATION FROM ITS ARCHITECTURE TO ITS SMALLEST LESSON.**