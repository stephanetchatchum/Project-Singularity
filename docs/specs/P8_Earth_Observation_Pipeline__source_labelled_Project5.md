I'm Stephane, a BSc Software Engineering student. I want to build Project 5, an Earth Observation Pipeline, as a learning + portfolio project. The project spec is below. Keep it exactly as written. Only the way you teach me changes.

MY CONSTRAINTS (follow these strictly):

* I'm a visual learner with ADHD. I need something on screen (a map, a plot or an image) at EVERY step. No step where I just read theory with nothing to run.
* Keep every message SHORT. No long walls of text. One small step at a time.
* I don't like reading to learn. I learn by building, watching, and doing. Explain just enough to make the next line of code make sense, then let me run it.
* I use Python. I know the fundamentals, NumPy and pandas. I have NOT used any GIS tools (QGIS, Rasterio, xarray, GeoPandas) or Docker for real work. Teach each new tool as we hit it, with a picture on screen right away.
* I don't want finished code handed to me. I want to understand and write it myself, with you guiding me line by line or in small chunks. No vibe coding. If I'm stuck, give a hint first, then a smaller hint, and code only as a last step.
* I'm weak in physics and math. Introduce each idea (light bands, reflectance, NDVI, coordinate systems, resolution, clouds) only right before I need to code it. Explain it in easy words.
* When you give a resource, give a video or talk I can watch, not an article.

PROJECT SPEC (do not change; this is my own Project 5 document)

GOAL
Build a small, clean pipeline that finds real Sentinel-2 satellite images of a place in Rwanda, downloads only the pixels I need, removes clouds, computes vegetation health (NDVI) over time, and shows it as maps and a time-series chart. It runs in Docker and has tests. This is the same kind of work done at Development Seed, Sinergise, GeoVille and Acre Insights, so I can show it in interviews.

THE IDEA IN PLAIN WORDS
A satellite photographs the Earth in many colours, including colours my eyes cannot see. Healthy plants reflect a lot of near-infrared light and absorb red light. So comparing the two tells me how green and healthy a place is. The number is NDVI. I do this for many dates, and I get a film of how the land changes through the seasons.

THE BIG SIMPLIFICATION
One small area (about 10 km × 10 km), 10 m pixels, one satellite (Sentinel-2 L2A, which is already corrected for the atmosphere), and only a few bands: blue, green, red, near-infrared and the scene classification (SCL) band for clouds. No machine learning in v1.

KEY NUMBERS
* NDVI = (NIR - Red) / (NIR + Red). It lies between -1 and 1. Water is below 0, bare soil is near 0.1, healthy plants are 0.6 to 0.9.
* Sentinel-2 bands at 10 m: B02 blue, B03 green, B04 red, B08 near-infrared. SCL is at 20 m.
* Sentinel-2 revisits a place about every 5 days (with both satellites).
* A 10 km × 10 km area at 10 m is 1,000 × 1,000 pixels.

HAND-CHECKS (on paper, before any code)
1. NDVI by hand. NIR = 0.5 and Red = 0.1 give (0.5 - 0.1) / (0.5 + 0.1) = 0.667.
2. NDVI of water. NIR = 0.02 and Red = 0.04 give a negative number. Check the sign.
3. Pixel count. A 10 km × 10 km area at 10 m gives 1,000 × 1,000 = 1,000,000 pixels. At 2 bytes each, that is 2 MB per band per date.
4. Cloud cover. If 30% of the pixels are cloud, how many valid pixels remain?
5. Coordinates. One degree of latitude is about 111 km. Check that my area in degrees matches 10 km.

BUILD STAGES (tick a stage only when its "Done when" is true; commit after every tick)
* Stage 1: Set up and look at a satellite image. Create the repo, a virtual environment, and install the libraries (pystac-client, odc-stac or stackstac, rasterio, xarray, rioxarray, matplotlib, geopandas). Find one Sentinel-2 image of my area from a free public STAC catalogue (Earth Search on AWS, or Microsoft Planetary Computer), and plot it in true colour. Done when: I see a real picture of Rwanda on my screen.
* Stage 2: Search properly. Write a function that asks the catalogue for all images of my area for a date range with less than 20% cloud. Print how many I get and the dates. Done when: I get a list of dates, and the count matches the catalogue's website within 1 or 2 images.
* Stage 3: Load only what I need. Load the four bands for my area into an xarray array without downloading whole tiles. Done when: the array has the right shape (time, y, x) and I plot one band.
* Stage 4: Compute NDVI. Write a small function with NumPy. Done when: a test with NIR = 0.5 and Red = 0.1 gives 0.667, and the NDVI map shows forests and fields clearly different from towns and water.
* Stage 5: Remove clouds. Use the SCL band to mask cloud, cloud shadow and snow. Done when: cloudy pixels are blank in the map, and the percent of valid pixels is printed for each date.
* Stage 6: The time series. Compute the average NDVI of my area for every date, and plot it as a line. Add a median composite, to get one clean picture from many dates. Done when: the chart shows the seasons (the dry and wet seasons of Rwanda) as a visible wave.
* Stage 7: A change map. Pick two dates (for example, dry season and wet season, or one year apart) and plot the NDVI difference. Done when: I see which places got greener and which got browner, with a colour bar and a legend.
* Stage 8: Make it cloud-native. Save the result as Zarr (chunked and compressed), and reload it. Compare the file size and the load time against GeoTIFF. Done when: I have a small table with both numbers. Optional: try the ESA EOPF Zarr samples I saw in the EOPF 101 course.
* Stage 9: Turn it into a command-line tool. One command takes the place, the date range and an output folder. Done when: I can run `python -m eopipe run --lat ... --lon ... --start ... --end ...` and get all the pictures.
* Stage 10: Add tests. pytest for NDVI, the cloud mask and the date search (with a saved sample so the tests do not need the internet). Done when: all tests pass, and the NDVI test matches hand-check 1.
* Stage 11: Docker. Write a Dockerfile so the whole pipeline runs with one command on any computer. Done when: a friend can run `docker run ...` and get the same pictures.
* Stage 12: Continuous integration. A GitHub Actions workflow that runs Ruff and pytest on every pull request. Done when: the green check appears on my pull request.
* Stage 13: A small interactive map. Show the NDVI layer on a web map (folium or leafmap), saved as one HTML file. Done when: I can open it in a browser and slide between dates.
* Stage 14: Write up. Hero image (the change map), the time-series chart, the checks, the file-size table and an honest list of what is simplified. Done when: a friend can run it from my README alone.

TRAPS (warn me when we reach each one)
* Scaling. Sentinel-2 numbers are stored as integers with a scale (divide by 10,000 to get reflectance, and watch for the offset in newer data). Wrong scaling gives wrong NDVI.
* Division by zero. NIR + Red can be 0. Handle it, and do not let NaN spread silently.
* Coordinate systems. The images use a projected system (UTM, in metres), and my area is in degrees (WGS84). Use the right one when cutting out my area.
* Clouds are not only "cloud". Shadows and thin haze fool NDVI. Use the SCL classes, and look at the picture.
* Different dates, different shapes. Make sure all dates share the same grid before I average them.
* Memory. Do not load everything at once. Use chunks (dask) and look at the sizes first.
* The internet. Keep a small saved sample for tests and for working offline.

WATCH FIRST (videos)
Search YouTube for: "Sentinel-2 NDVI explained", "STAC explained Radiant Earth", "xarray tutorial Earth observation Python", "Cloud Native Geospatial Zarr explained", "EOPF 101 Development Seed".

FINISH CHECKLIST
* The change map, the time-series chart and the interactive map in the README
* The NDVI hand-check next to my result
* The Zarr against GeoTIFF table (size and load time)
* A green GitHub Actions badge and a working Dockerfile
* A line saying what is simplified: one place, one satellite, no machine learning, simple cloud mask
* Repo pinned on my GitHub profile

HOW TO TEACH ME (the method)

1. Start from zero: GitHub repo, folder structure, and a tiny first picture on screen before any real feature.
2. Every step ends with me running something and seeing a visible result (a map, a chart, a printed number I can check against a hand-check). Even tiny.
3. Follow the stages in order. Before each stage, do the matching hand-check on paper with me first. Show me the check, I do it, then we code.
4. Before moving to the next stage, ask me ONE short question to check I understood the last one.
5. Ask me one question at a time if you need to know something about my setup. Don't dump a list.
6. When a new library appears, show me the smallest possible example first, with a picture, before using it in my project.

PROFESSIONAL WORKFLOW (strict, from day one)

* I use Windows and Git Bash.
* One GitHub repo. Never commit straight to main. For each stage: create a branch (feature/stage-4-ndvi), commit small and often, push, open a pull request with a short description and a screenshot of the result, review it with me, then merge. Tick the stage in the README checklist inside that PR.
* Commit messages: Conventional Commits (feat:, fix:, docs:, test:, refactor:, chore:), short and in present tense.
* One code style for the whole project: Ruff (lint + format) set up in Stage 1, PEP 8, 4 spaces, type hints on every function, snake_case for variables and functions, UPPER_SNAKE_CASE for constants, a virtual environment, and requirements.txt.
* Comments: a short docstring on every function (what it does, inputs with units, output). Explain WHY, not what.
* Tests: pytest. Each hand-check becomes a test. A stage is only ticked when its test passes.
* Folder structure: src/eopipe/ (search.py, load.py, indices.py, mask.py, plots.py, cli.py), tests/, data/ (git-ignored, with a tiny sample), docs/ (pictures), scripts/, Dockerfile, .github/workflows/, README.md, .gitignore, pyproject.toml, requirements.txt.
* Keep units clean. Reflectance between 0 and 1. Coordinates: say clearly which system each variable uses.

START NOW:
Propose the repo/folder structure and the very first thing I should run to see something on screen (Stage 1: a true-colour Sentinel-2 picture of Kigali). Keep it short. Then wait for me.
