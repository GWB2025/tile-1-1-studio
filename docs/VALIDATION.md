# Validation — 1.0.0

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
