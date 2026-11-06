const {test} = require('node:test');
const assert = require('node:assert/strict');
const G = require('../src/geometry.js');
const T = require('../src/tiling.js');
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
const square = [[0, 0], [10, 0], [10, 10], [0, 10]];

function inside(p, polygon) {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) &&
        p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) result = !result;
  }
  return result;
}

function distanceToEdge(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

test('hatching has physical spacing and stops short of each boundary', () => {
  const lines = G.hatchPolygon(square, {spacing: 2, angle: 0, inset: 0.35});
  assert.equal(lines.length, 5);
  lines.forEach((line, i) => {
    near(line.a[0], 0.35); near(line.b[0], 9.65);
    near(line.a[1], 1 + 2 * i); near(line.b[1], 1 + 2 * i);
  });
});

test('concave scanlines split at notches and never bridge the exterior', () => {
  const u = [[0, 0], [6, 0], [6, 6], [4, 6], [4, 2], [2, 2], [2, 6], [0, 6]];
  const lines = G.hatchPolygon(u, {spacing: 2, angle: 0, inset: 0.2});
  assert.equal(lines.length, 5);
  for (const l of lines) for (let t = 0; t <= 1; t += 0.05)
    assert.ok(inside([l.a[0] * (1 - t) + l.b[0] * t, l.a[1]], u));
  // A scanline through both notch vertices must also be split correctly.
  const vertexLines = G.hatchPolygon(u, {spacing: 4, angle: 0, inset: 0.2});
  assert.equal(vertexLines.length, 2);
});

test('hatching supports reflections, rotation and translation without duplicate lines', () => {
  for (const angle of [0, 30, 45, 90, 135, 180]) for (const sign of [-1, 1]) {
    const polygon = G.TILE.map(p => [p[0] * 6 * sign, p[1] * 6]);
    const lines = G.hatchPolygon(polygon, {spacing: 1.2, angle, inset: 0.35});
    assert.ok(lines.length > 0);
    assert.equal(new Set(lines.map(l => T.edgeKey(l.a, l.b))).size, lines.length);
    for (const l of lines) for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      assert.ok(inside([l.a[0] * (1 - t) + l.b[0] * t, l.a[1] * (1 - t) + l.b[1] * t], polygon));
    }
    const shifted = G.hatchPolygon(polygon.map(p => [p[0] + 13, p[1] - 7]), {spacing: 1.2, angle, inset: 0.35});
    assert.equal(shifted.length, lines.length);
    shifted.forEach((l, i) => ['a', 'b'].forEach(k => {
      near(l[k][0], lines[i][k][0] + 13); near(l[k][1], lines[i][k][1] - 7);
    }));
  }
});

test('hatching rejects invalid parameters instead of looping', () => {
  for (const input of [{spacing: 0}, {spacing: -1}, {spacing: NaN}, {angle: Infinity}, {inset: -1}])
    assert.throws(() => G.hatchPolygon(square, input));
});

test('shading leaves geometry and shared outlines unchanged in both modes', () => {
  for (const mode of ['aperiodic', 'periodic']) {
    const plain = T.generate({mode});
    const shaded = T.generate({mode, shading: 'hatch'});
    assert.deepEqual(shaded.tiles.map(t => t.points), plain.tiles.map(t => t.points));
    assert.deepEqual(shaded.lines.filter(l => l.kind === 'outline'), plain.lines);
    assert.ok(shaded.stats.shadingSegments > 0);
    assert.equal(plain.stats.shadingSegments, 0);
    assert.equal(shaded.stats.segments, shaded.stats.outlineSegments + shaded.stats.shadingSegments);
    assert.deepEqual(shaded, T.generate({mode, shading: 'hatch'}));
  }
});

test('both shading styles stay inside their tile and the page margin', () => {
  for (const mode of ['aperiodic', 'periodic']) for (const shading of ['hatch', 'crosshatch']) {
    const art = T.generate({mode, shading, rotation: 15, seed: 'Gordon'});
    const tiles = new Map(art.tiles.map(t => [t.id, t]));
    for (const l of art.lines.filter(l => l.kind === 'shading')) {
      for (const p of [l.a, l.b, [(l.a[0] + l.b[0]) / 2, (l.a[1] + l.b[1]) / 2]]) {
        assert.ok(p[0] >= 8 - 1e-8 && p[0] <= 140 + 1e-8 && p[1] >= 8 - 1e-8 && p[1] <= 97 + 1e-8);
        const polygon = tiles.get(l.tileId).points;
        assert.ok(inside(p, polygon));
        polygon.forEach((q, i) => assert.ok(distanceToEdge(p, q, polygon[(i + 1) % polygon.length]) >= 0.35 - 1e-7));
      }
      assert.equal(l.colour, tiles.get(l.tileId).colour);
    }
  }
});

test('spacing controls darkness and cross-hatching adds a second direction', () => {
  const a = T.generate({shading: 'hatch', hatchSpacing: 1.2});
  const b = T.generate({shading: 'hatch', hatchSpacing: 2.4});
  const c = T.generate({shading: 'crosshatch', hatchSpacing: 1.2});
  assert.ok(a.stats.shadingSegments > b.stats.shadingSegments);
  assert.ok(c.stats.shadingSegments > a.stats.shadingSegments);
  const black = T.generate({shading: 'hatch', palette: 'black'});
  assert.deepEqual(a.lines.map(l => [l.a, l.b]), black.lines.map(l => [l.a, l.b]));
  assert.ok(new Set(black.tiles.map(t => t.shade.spacing)).size > 1);
  const uniform = T.generate({shading: 'hatch', hatchVariation: 'uniform'});
  assert.equal(new Set(uniform.tiles.map(t => JSON.stringify(t.shade))).size, 1);
});

test('periodic shading repeats, including line phase, over the colour supercell', () => {
  const art = T.generate({mode: 'periodic', shading: 'crosshatch'});
  const groups = new Map();
  for (const tile of art.tiles) {
    const key = `${((tile.i % 3) + 3) % 3},${((tile.j % 3) + 3) % 3},${tile.member}`;
    const lines = G.hatchPolygon(tile.points, {spacing: tile.shade.spacing, angle: tile.shade.angle});
    const relative = lines.map(l => [l.a, l.b].flatMap(p => [p[0] - tile.points[0][0], p[1] - tile.points[0][1]]));
    if (groups.has(key)) {
      const prior = groups.get(key);
      assert.equal(relative.length, prior.length);
      relative.forEach((line, i) => line.forEach((v, j) => near(v, prior[i][j])));
    }
    groups.set(key, relative);
  }
});

test('shaded SVGs and recipes preserve every pen line and carrier offset', () => {
  const art = T.generate({shading: 'crosshatch'}), svg = T.toSvg(art);
  assert.equal((svg.match(/<path /g) || []).length, art.stats.segments);
  assert.doesNotMatch(svg, /<pattern|<clipPath|transform=|<polygon/);
  assert.equal(T.toSvg(T.generate(JSON.parse(T.recipe(art)).settings)), svg);
  const coordinates = text => [...text.matchAll(/d="M ([\d.-]+) ([\d.-]+) L ([\d.-]+) ([\d.-]+)"/g)].map(m => m.slice(1).map(Number));
  const normal = coordinates(svg), carrier = coordinates(T.toSvg(art, {carrier: true}));
  carrier.forEach((line, i) => line.forEach((v, j) => near(v, normal[i][j] + (j % 2 ? 96 : 31))));
});

test('legacy settings stay unshaded and unsupported shading settings are rejected', () => {
  assert.equal(T.settings({seed: '42'}).shading, 'none');
  for (const input of [{shading: 'fill'}, {hatchSpacing: 0}, {hatchSpacing: NaN}, {hatchSpacing: 5}, {hatchAngle: Infinity}, {hatchVariation: 'random'}])
    assert.throws(() => T.generate(input));
});

test('recipes load both versions and preserve legacy outline geometry', () => {
  const legacy = JSON.stringify({application: 'Tile(1,1) Studio', version: '1.0.0', settings: {seed: '20261104'}});
  const settings = T.readRecipe(legacy);
  assert.equal(settings.shading, 'none');
  assert.equal(T.generate(settings).stats.segments, 298);
  const art = T.generate({shading: 'crosshatch', hatchSpacing: 2, hatchAngle: 60, hatchVariation: 'uniform'});
  assert.deepEqual(T.readRecipe(T.recipe(art)), art.settings);
  for (const input of ['null', '{}', '{', JSON.stringify({application: 'Tile(1,1) Studio', version: '9.0.0', settings: {}})])
    assert.throws(() => T.readRecipe(input));
});
