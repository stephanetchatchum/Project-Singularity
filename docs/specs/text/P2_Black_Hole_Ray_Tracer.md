# Project 2: Black Hole Ray Tracer

Oct 29, 2026 · @Stephane

## Start here

You make a picture of what a camera would see near a black hole, by following light backwards from every pixel and bending it with your RK4. Do Stage 1 only. Ignore the rest until it is ticked.

### The idea in plain words

A picture is a grid of pixels. For each pixel you ask: which direction does the light in this pixel come from? You follow that ray of light backwards, out of the camera and into space.

- With no black hole, the ray goes straight and hits a star in the background.

- With a black hole, the ray bends. Rays that pass close bend a lot, so the stars look stretched and warped.

- Rays that pass too close never escape. Those pixels are black. The black circle is called the shadow.

### The big simplification

Near a non-spinning black hole, a ray of light always stays in one flat plane through the black hole's centre. So every ray is a 2D problem, solved with one equation, then placed back into 3D.

Use units where G = c = black hole mass = 1. Distances are then counted in multiples of the mass.

\frac{d^{2}u}{d\varphi^{2}} = -u + 3u^{2}

Here u = 1 ÷ r, where r is the distance from the black hole. The angle φ is how far the ray has swept around the black hole in its plane. It has the same shape as your spring (x'' = −x). The only new part is 3u², and it is what bends the light. So your step_RK4 almost transfers: the "position" is u, the "velocity" is du/dφ, and only the acceleration changes.

### Key numbers

| Name          | Value               | Meaning                        |
|---------------|---------------------|--------------------------------|
| Event horizon | r = 2 (u = 0.5)     | Nothing returns from inside    |
| Photon sphere | r = 3               | Light can orbit here           |
| Shadow edge   | b = 3 × √3 ≈ 5.196  | Rays with b below this fall in |
| Weak bend     | about 4 ÷ b radians | For rays that stay far away    |

The impact parameter b is how close the ray would pass to the centre if it were not bent.

### Hand-checks (on paper, before any code)

1.  **Flat space.** Without the 3u² term, u = sin(φ) ÷ b. A ray that starts far away (u = 0) with du/dφ = 1 ÷ b returns to u = 0 at φ = π. The bend is exactly 0.

2.  **Weak bend.** With b = 100, the bend is about 4 ÷ 100 = 0.04 radians (2.3°). My own run gives 0.0414.

3.  **Camera ray, flat space.** A camera at r = 50 sees a pixel at angle α = 30° from the direction of the black hole. The ray escapes at φ = 180° − 30° = 150°. Also b = 50 × sin 30° = 25, and the ray's starting du/dφ is cot(30°) ÷ 50 = 0.0346.

4.  **Disk crossing, flat space.** A camera straight above the disk at r = 50, with a pixel at α = 10°, hits the disk plane at distance 50 × tan 10° = 8.82 from the centre.

### How a ray starts and where it stops

For a ray that starts far away: u = 0 and du/dφ = 1 ÷ b. It stops when u returns to 0 (it escaped, and the bend is φ − π) or when u reaches 0.5 (it fell in).

For a ray that starts at the camera (distance r_cam), use this relation, with the sign that sends the ray inward:

\left(\frac{du}{d\varphi}\right)^{2} = \frac{1}{b^{2}} - u^{2}(1 - 2u), \qquad b = \frac{r\_{cam}\\\sin\alpha}{\sqrt{1 - 2/r\_{cam}}}

The b formula is for a camera that sits still. If it is too much at first, put the camera far away and use b = r × sin α.

## Build stages

Tick a stage only when its "Done when" is true. Commit after every tick.

- [ ] **Stage 1: Flat space first.** Switch off the 3u² term and trace a ray with b = 10. **Done when:** u returns to 0 at φ = π (within 0.001), and the path drawn in x, y (x = cos φ ÷ u, y = sin φ ÷ u) is a straight line 10 from the centre.

- [ ] **Stage 2: Switch the bend on.** Use a step of about 0.001 in φ. **Done when:** b = 100 gives a bend of about 0.041, b = 5.0 falls in, and b = 5.3 escapes after bending by more than 3 radians.

- [ ] **Stage 3: Draw a fan of rays.** 30 rays with different b in one 2D picture, plus circles at r = 2 and r = 3. **Done when:** rays near b = 5.2 loop around and rays below 5.19 fall in. This is your first README picture.

- [ ] **Stage 4: Measure the shadow.** Search between b = 5 and b = 5.4, halving the gap each time, to find where rays stop escaping. **Done when:** you find 5.196 within 0.01.

- [ ] **Stage 5: Add a camera.** Put it at r = 50 and turn each pixel into an angle α from the direction of the black hole. Trace each ray from the camera, then turn the escape angle into a direction in 3D. **Done when:** with the bend switched off, α = 30° gives an escape angle of 150°, as in hand-check 3.

- [ ] **Stage 6: Make a small image.** 100 × 100 pixels, with a checkerboard painted on the sky so the warping is easy to see. **Done when:** flat space shows an undistorted checkerboard, and the bend shows a distorted one with a black disc in the middle whose half-angle is about 5.8°.

- [ ] **Stage 7: Make it fast.** Because the black hole is a perfect sphere, the escape angle depends only on α. Trace about 2,000 rays across all α once, store the answers in a table, then let every pixel look up its answer with NumPy interpolation. **Done when:** an 800 × 600 image takes seconds, not minutes, and looks the same as Stage 6.

- [ ] **Stage 8: Add the glowing disk.** A flat ring in the equator plane, from r = 3 to r = 10 (your choice). A ray's 3D position is r × (cos φ × direction 1 + sin φ × direction 2), where direction 1 points from the black hole to the camera and direction 2 is sideways, along the ray's plane. When the height above the disk plane changes sign between two steps, the ray crossed the disk. **Done when:** with the bend switched off and the camera above, you see a perfect ring, and hand-check 4 matches.

- [ ] **Stage 9: Colour the disk.** Hot white-yellow near the inside, red toward the outside. Tilt the camera so you look at the disk almost edge-on, to get the famous look with light bent over the top. **Done when:** the image shows the bent copy of the disk over and under the shadow.

- [ ] **Stage 10: Add stars.** Random bright dots on the sky, or a free star-map image. The direction you computed turns into longitude and latitude to look up a colour. **Done when:** stars near the shadow are stretched into arcs.

- [ ] **Stage 11: Animate.** Move the camera around in 60 to 120 steps and save a picture each time. Join them into a video with ffmpeg. **Done when:** you have a 10 second loop.

- [ ] **Stage 12: Write up.** Hero image, the three checks (150°, 0.041, 5.196), and an honest list of what is simplified. **Done when:** a friend can run it from your README alone.

## Traps, videos, finish line

### Traps

- **Degrees and radians.** Python's maths uses radians. Mixing them is the most common reason pictures look wrong.

- **Steps that are too big near b = 5.2.** Rays there wind around the black hole. Halve the step and check the bend does not change.

- **Rays that never finish.** Put a maximum number of steps on every ray, and treat a ray that never finishes as black.

- **Angle wrap-around.** Use a two-argument arctangent (atan2) when you turn x and y into an angle, so you get the right quarter of the circle.

### Watch first

Search YouTube for: "Sebastian Lague coding adventure black holes", "how Interstellar's black hole was made", "Schwarzschild black hole shadow explained".

### Finish checklist

- [ ] The fan-of-rays picture and the lensed starfield in the README

- [ ] The shadow measurement: your number next to 5.196

- [ ] The rendering time before and after the lookup table

- [ ] A line saying what is simplified: the black hole does not spin, and the disk brightness is artistic, not exact physics

- [ ] Repo pinned on your GitHub profile
