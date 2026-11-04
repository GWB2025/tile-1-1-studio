# Tile(1,1) Studio

Create reproducible **aperiodic and periodic** tiling compositions from the same straight-edged, fourteen-edge Tile(1,1). Export simple, layered SVGs for the Writing Robot T-A4 through SVG Plotter.

## Open the app

Double-click **`Tile_1_1_Studio.html`**. It opens in your browser and works entirely offline. There is no server, installation, account, Python or Node requirement to use the app.

1. Select **Aperiodic** or **Periodic**.
2. Enter a seed, or click **Next ↗**. Numbers and words both work.
3. Set the paper, tile edge length, margin, rotation and pens, then click **Generate tiling**.
4. Use **Pen lines** to see the exported drawing. **Tile colours** is an inspection view only.
5. Select **Export SVG**, or **Postcard on A4** for a postcard positioned on a carrier sheet.

Use **Save settings** and **Load settings** to keep a reproducible recipe. The same app version, seed and settings recreate the same artwork. SVG metadata also records the version, settings, construction and path statistics. The browser saves downloads in its usual download location; move artwork you want to retain into an `exports/` directory beside this app.

## What the two modes mean

| Mode | Construction | What the seed changes |
| --- | --- | --- |
| Aperiodic | A patch from the published nine-type substitution construction; all tiles have one handedness | Root type, a valid interior crop, orientation and colours |
| Periodic | A two-tile cell, one original and one reflected, repeated on a translation lattice | Lattice origin, orientation and a repeating 3 × 3-cell colour arrangement |

Tile(1,1) forces aperiodicity **when reflections are forbidden**. Allowing reflections makes periodic tilings possible. It is the straight-edged polygon, not the curved-edge Spectre.

Different seeds produce different compositions. They do not imply distinct infinite tilings up to translation and rotation, or a new periodic tiling family for every seed. The periodic implementation uses one verified lattice. Aperiodic patches are sampled from legal substitution tilings, not random placement of independent tiles. A finite cropped sheet is not itself an infinite tiling, and its appearance alone does not prove aperiodicity.

## Paper and plotting

| Export | SVG dimensions | SVG Plotter page | Placement |
| --- | --- | --- | --- |
| Postcard | 148 × 105 mm | Custom 148 × 105 mm | Card at the plotter origin |
| A5 landscape | 210 × 148 mm | Custom 210 × 148 mm | Sheet at origin |
| A4 portrait | 210 × 297 mm | A4 portrait | Sheet at origin |
| Postcard on A4 | 210 × 297 mm | A4 portrait | Card top-left **(31, 96) mm**, bottom-right **(179, 201) mm** |

In SVG Plotter choose **Keep original size and position**, **0° rotation** and **Outline paths**. The carrier export contains only the postcard drawing, without registration marks or a card outline.

Exports use explicit millimetre coordinates and ordinary straight two-point paths. Shared tile edges are drawn once. There are no transforms, clipping masks, fills, images, fonts or external dependencies in the plot SVG. Colour groups are Inkscape-compatible layers. Cropping is calculated before export; no artificial frame is drawn at the crop boundary. Each shared edge belongs to one pen pass, so a tile's whole perimeter is not necessarily one colour.

The default postcard has roughly 300 short segments and about 1.7 m of pen-down travel; exact figures depend on the seed. Increasing tile size reduces detail and plotting time. A4 at the smallest 3 mm edge size is considerably denser. Segment count is **not** the plotter command count or a plot-time estimate.

The Kyoto palette uses your Pigma Micron 05 Orange (35781), Light Brown (35783) and Dark Brown (37741). The colours are illustrative screen values, not measured ink matches. Physical stroke width comes from your pen and paper; the stroke control affects preview/SVG styling. Filled colours in the inspection view are not exported as filled regions.

## Project location and backup

This project is in `~/Documents/ChatGPT/Generative Art/tile-1-1-studio/` on Gordon's Mac, beside the earlier TouchDesigner project. Keep the entire folder together. A practical long-term layout is `Documents/Projects/Generative-Art/tile-1-1-studio/`, with `exports/` for chosen artwork; move it as a complete folder if consolidating projects there. Include that folder in Time Machine. The GitHub repository backs up source and examples; personal exports are deliberately ignored by Git.

Repository: https://github.com/GWB2025/tile-1-1-studio (initially private).

## Development

JavaScript was chosen so the app can run directly in a browser without compilation or installation. There are no package dependencies. Node 18+ is required only for development:

```sh
node --test tests/*.test.cjs
node scripts/build.cjs
```

The tests were written before the corresponding implementation. The bottom-up modules are `src/geometry.js` (coordinates, transformations, intersections and clipping), `src/tiling.js` (construction, deterministic random choices and SVG export), and `src/app.js` (interface). `index.html` is the editable multi-file application; the build script produces the single-file offline edition and examples.

Validation covers equal edge lengths, analytical area, rigid transformations, polygon intersections, the periodic cell's area and overlapping neighbours, substitution counts, handedness, patch overlap, coverage, margins, deduplicated edges, reproducibility, colour repetition, SVG structure, recipes, carrier placement and invalid settings. See `docs/VALIDATION.md` for the checks performed. **No physical plot has been verified.**

## References and acknowledgements

- Smith, Myers, Kaplan and Goodman-Strauss: [A chiral aperiodic monotile](https://cs.uwaterloo.ca/~csk/spectre/), 2024, particularly Appendix A and Figure 5.3. Mathematical basis for the aperiodic construction.
- The same authors: [An aperiodic monotile](https://arxiv.org/abs/2303.10798), 2024, Figure 6.2. Periodic tilings of Tile(1,1).
- [Craig Kaplan's reference app](https://cs.uwaterloo.ca/~csk/spectre/app.html). Coordinate and substitution-table reference. This project provides its own interface, geometry utilities, crop selection, periodic construction and SVG exporter.
- [Dan Catt — What is generative art?](https://youtu.be/ko6YCbfKtQg), particularly 11:39 onwards on deterministic randomness. Inspiration for keeping the seed and complete recipe.
- [Okamirufu Vizualizer — What is Generative Art](https://youtu.be/1RD83NjwNIk), particularly 01:38 onwards on rules and parameters. Inspiration for separating the tiling rules from artistic controls.
- [SVG Plotter](https://github.com/GWB2025/svg-plotter-ta4).

The two video transcripts were consulted through vidIQ. No tutorial project or video transcript is bundled. Referenced researchers and artists have not endorsed this app.

## AI assistance and licence

Developed by Gordon Brindle with OpenAI ChatGPT/Codex assistance for research, implementation, testing and documentation. Gordon defines the goals and reviews the outputs. New application code is MIT licensed; mathematical results and their authorship are credited above. See `LICENSE` and `REFERENCES.md`.
