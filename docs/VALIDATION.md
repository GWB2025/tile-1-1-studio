# Validation — 1.1.0

Updated on Gordon's Mac on 6 November 2026.

## Shading checks

`node --test tests/*.test.cjs`: **22 tests passed**, including the original 11 geometry/export tests.

- Physical hatch spacing, adjustable direction and inward clearance.
- Concave polygons, scanlines through vertices, reflections and translation.
- Hatch segments remain inside their owner tile and the paper crop, with at least 0.35 mm centreline clearance from tile boundaries at the tested endpoints and midpoints.
- Identical seeds/settings reproduce identical geometry, colours and shading.
- Shading preserves the original tile geometry and deduplicated outline paths.
- Periodic shading repeats over the colour supercell, including line phase.
- Both styles work with all palettes; monochrome retains different tones.
- Denser spacing adds paths; cross-hatching adds a perpendicular line set.
- SVG path counts match statistics and every carrier coordinate is offset by (31, 96) mm.
- Version 1.0.0 recipes load as unshaded drawings; 1.1.0 recipes preserve shading controls.
- Invalid spacing, angles, styles and recipes are rejected.

The two aperiodic shaded SVG examples were rendered using librsvg and visually inspected. Parallel hatching has 1,021 paths / 8.177 m pen-down travel; cross-hatching has 1,724 paths / 14.664 m. Each still has 298 outline paths. The corresponding periodic examples have 1,073 / 1,756 paths.

All 12 supplied SVGs passed independent XML parsing, path-count and plain-line syntax checks. A4 stress checks (3 mm tile edge and margin, 0.6 mm uniform cross-hatching, 15° extra rotation) retained full coverage in both modes: 38,296 / 38,913 paths, generated in approximately 0.63 / 0.09 seconds in Node on this Mac. This tests generation, not browser rendering or plotter throughput.

The browser security policy blocked access to the local `file:` app for this update. Therefore **the new browser controls have not had an interactive browser check**. The previous version's browser check below does not verify the new interface. No physical plotting command was issued.

## Original 1.0.0 checks

Checked on Gordon's Mac on 4 November 2026.

## Automated geometry and export checks

`node --test tests/*.test.cjs`: **11 tests passed**.

- Fourteen equal edges and the analytical Tile(1,1) area.
- Rigid transformations, reflection, triangulation, polygon intersection and segment clipping.
- Periodic cell: two opposite-handed tiles, matching lattice area and no interior overlap in a 5 × 5 neighbourhood.
- Aperiodic substitution: expected tile counts, common handedness and no interior overlap in the tested patch.
- Repeatable results for identical settings; changed geometry for the tested different seeds in both modes.
- Complete crop coverage, margin bounds and deduplicated shared edges over several seeds.
- Palette changes preserve geometry; periodic tile colours repeat over a 3 × 3 lattice cell.
- Explicit SVG dimensions, colour layers, plain line paths, recipe reproduction and A4-carrier placement.
- Invalid settings rejected.

Additional generation checks covered A4 portrait, a 3 mm margin, 15° rotation, 3 mm and 18 mm tile edges, seeds 0, 42 and 20261104, in both modes. All twelve crops had full numerical coverage within floating-point tolerance. The smallest tiles produced around 5,700–5,800 exported line segments; the largest produced around 160–180.

All six supplied SVGs were parsed independently with Python's XML parser and their metadata and path counts checked. The default aperiodic postcard has 298 paths and approximately 1.680 m of pen-down travel.

## Browser check

Opened the self-contained `Tile_1_1_Studio.html` directly from disk in Chrome, without a server. Checked initial generation, Next seed, periodic mode, the tile-colour inspection view and SVG download. The browser-downloaded periodic SVG for seed 20261105 was byte-for-byte identical to the Node-generated example.

## Plotter compatibility and limits

Exports use the plain SVG elements supported by the installed SVG Plotter importer. Their shared edges are deduplicated and their crop is represented by explicit path endpoints rather than SVG clipping masks.

An attempted end-to-end import check was blocked by the browser extension's local-file-access setting. Do not interpret the geometry/export checks as a completed SVG Plotter import or a physical plotting test. No connection, homing or plotting command was issued. Review the preview at original size before plotting.

The mathematical tests check this implementation, not the published proof of aperiodicity. Seeds select valid compositions within the implemented constructions; they do not guarantee a unique infinite tiling for every possible seed.

## Backup

`tmutil isexcluded` reported the project directory as Included. This confirms eligibility for Time Machine, not that a backup has already run. Source and supplied examples are also kept in the GitHub repository. Personal `exports/` are ignored by Git and should be backed up with Time Machine.
