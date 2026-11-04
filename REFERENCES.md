# Mathematical provenance

Tile(1,1) is the fourteen-unit-edge polygon in David Smith, Joseph Samuel Myers, Craig S. Kaplan and Chaim Goodman-Strauss, *A chiral aperiodic monotile*, Combinatorial Theory 4(2), 2024, article 13. The published paper is CC BY 4.0. https://doi.org/10.5070/C64264241

The vertex coordinates, key-point indices (3, 5, 7, 11), nine labels, substitution table and relative placement angles in this app encode that mathematical construction. We consulted Appendix A, Figure 5.3 and Kaplan's `spectre.js`. A copy named `Original-Spectre.js` in https://github.com/henrypdonahue/Spectre-Ulam-Spiral/tree/0979c0d1db4f0e0104e217eb3c77fa64621db2c7 was used to read the reference tables when the original JavaScript URL could not be retrieved directly. We have not bundled that script or its p5.js interface. Mathematical facts and tables are credited to their original authors; the MIT licence covers this application's new code.

## Aperiodic construction

The single-tile types use the same polygon. Gamma is a two-tile Mystic compound. Each substitution stage fits eight child locations using four corresponding key points; Gamma omits one location. Each complete stage reverses handedness, so the generator applies one global reflection for odd depths to retain a consistent displayed handedness. No patch mixes tile handednesses.

The Delta tile counts after depths 0–4 are 1, 9, 71, 559, 4401. The seed chooses a root and a crop. A crop is accepted only if the sum of its clipped tile areas matches the drawing rectangle (relative tolerance 1e-7); the no-overlap property follows from the construction and is also checked numerically for representative patches.

## Periodic cell

Let P be the unit polygon in `geometry.js`, and s = sqrt(3). The second tile is

`Q = translate(P[6]) · rotate(150°) · reflect_x(P)`.

The translation vectors are

`u = (3 + 2s, -s)`, `v = ((3 - s)/2, (3 + s)/2)`.

They are perpendicular and their parallelogram area is `6(1 + sqrt(3))`, twice the tile area `3(1 + sqrt(3))`. The two tile interiors and their neighbouring translates are disjoint. This supplies a complete periodic covering; its density is exactly one. This particular coordinate construction was derived by enumerating reflected edge contacts and validating the resulting lattice. The original paper's Figure 6.2 establishes the existence of periodic tilings.

For unit-cell tests, a 5 × 5 collection of cells is checked by triangulating the non-convex polygons and measuring their pairwise intersections. That neighbourhood contains every potential overlap at these bounded tile diameters and lattice spacings. Page crops additionally check coverage. The colour motif repeats every three translations in each lattice direction, so decoration does not destroy periodicity.

## Scope

The program samples a finite set of substitution roots with deterministic crops. It is not an enumerator of all possible tilings. Seed hashing is 32-bit, so collisions are possible; different input strings are not mathematically guaranteed to produce unique drawings. The paper's aperiodicity theorem applies to infinite homochiral tilings, not to a visual test on the exported crop.
