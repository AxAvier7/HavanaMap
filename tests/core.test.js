const fs = require('fs');
const path = require('path');
const HC = require('../core/havana-core.js');

const graphPath = path.join(__dirname, '..', 'data', 'havana-graph.json');
const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
HC.setGraph(graph);

let failures = 0;
function check(label, cond, extra) {
  if (cond) console.log('PASS ' + label + (extra ? ' :: ' + extra : ''));
  else { failures += 1; console.log('FAIL ' + label + (extra ? ' :: ' + extra : '')); }
}

function point(lat, lng) { return { lat: lat, lng: lng }; }

const A = point(23.1150, -82.3816);
const B = point(23.1350, -82.3667);

const adjCar = HC.getAdj(graph, 'car');
const adjFoot = HC.getAdj(graph, 'foot');
check('grafo con nodos', graph.nodes.lat.length > 100000, 'nodos=' + graph.nodes.lat.length);
check('adyacencia de coche bidireccional', adjCar.length === graph.nodes.lat.length);
check('aristas de coche cargadas', adjCar.reduce(function (a, l) { return a + l.length; }, 0) > 200000);

const carRoute = HC.computeLocalRoute(A, B, 'car');
const footRoute = HC.computeLocalRoute(A, B, 'foot');
check('ruta local en coche', !!carRoute, carRoute ? Math.round(carRoute.distance) + ' m' : 'sin ruta');
check('ruta local a pie', !!footRoute, footRoute ? Math.round(footRoute.distance) + ' m' : 'sin ruta');
check('coche por calles (3-5 km)', carRoute && carRoute.distance > 3000 && carRoute.distance < 5000, carRoute && Math.round(carRoute.distance) + ' m');
check('a pie por calles (3-5 km)', footRoute && footRoute.distance > 3000 && footRoute.distance < 5000, footRoute && Math.round(footRoute.distance) + ' m');
check('geometria con detalle', carRoute && carRoute.coords.length > 50, carRoute && carRoute.coords.length + ' puntos');

const pins = [
  point(23.1150, -82.3816), point(23.1350, -82.3667), point(23.1245, -82.3890),
  point(23.1060, -82.3742), point(23.1290, -82.3820), point(23.1180, -82.3670)
];

for (const profile of ['car', 'foot']) {
  const adj = HC.getAdj(graph, profile);
  const nodes = HC.tspSnapPoints(graph, adj, pins);
  const mat = HC.tspMatrix(graph, adj, nodes);
  check('matriz ' + profile, !!mat);
  if (!mat) continue;

  const n = pins.length;
  const cost = function (order) {
    let c = 0;
    for (let i = 1; i < order.length; i += 1) c += mat.dist[order[i - 1]][order[i]];
    return c;
  };

  const open = HC.tspSolveOrder(mat.dist, n, -1, -1, false);
  const fixed = HC.tspSolveOrder(mat.dist, n, 2, 4, false);
  const closed = HC.tspSolveOrder(mat.dist, n, 3, 3, true);

  check(profile + ' abierta cubre todos', new Set(open.order).size === n, open.order.join(','));
  check(profile + ' abierta respeta inicio/fin', fixed.order[0] === 2 && fixed.order[n - 1] === 4, fixed.order.join(','));
  check(profile + ' cerrada empieza y acaba en el ancla', closed.order[0] === 3 && closed.order[n] === 3, closed.order.join(','));

  let bestOpen = Infinity;
  let bestCycle = Infinity;
  const perm = function (arr, k) {
    if (k === arr.length) {
      bestOpen = Math.min(bestOpen, cost(arr));
      bestCycle = Math.min(bestCycle, cost(arr.concat([arr[0]])));
      return;
    }
    for (let i = k; i < arr.length; i += 1) {
      const t = arr[k]; arr[k] = arr[i]; arr[i] = t;
      perm(arr, k + 1);
      const u = arr[k]; arr[k] = arr[i]; arr[i] = u;
    }
  };
  perm([0, 1, 2, 3, 4, 5], 0);
  check(profile + ' abierta optima', Math.abs(cost(open.order) - bestOpen) < 1e-6,
    Math.round(cost(open.order)) + ' vs ' + Math.round(bestOpen));
  check(profile + ' cerrada optima', Math.abs(cost(closed.order) - bestCycle) < 1e-6,
    Math.round(cost(closed.order)) + ' vs ' + Math.round(bestCycle));
}

const many = [];
for (let i = 0; i < 13; i += 1) many.push(point(23.105 + (i % 5) * 0.009, -82.395 + Math.floor(i / 5) * 0.011));
const manyMat = HC.tspMatrix(graph, HC.getAdj(graph, 'car'), HC.tspSnapPoints(graph, HC.getAdj(graph, 'car'), many));
const heur = HC.tspSolveOrder(manyMat.dist, 13, 1, 9, false);
check('heuristica 13 pines cubre todos', new Set(heur.order).size === 13, String(heur.order.length));
check('heuristica respeta inicio/fin', heur.order[0] === 1 && heur.order[12] === 9, heur.order.join(','));

const doubled = [[23.1150, -82.3816], [23.1160, -82.3816], [23.1170, -82.3816], [23.1160, -82.3816], [23.1150, -82.3816]];
const runs = HC.buildRouteLanes(HC.dedupeCoords(doubled), 18);
check('detecta tramo repetido', runs.some(function (r) { return r.lane === 1; }), 'carriles=' + JSON.stringify(runs.map(function (r) { return r.lane; })));
const shifted = runs.filter(function (r) { return r.lane > 0; }).every(function (r) {
  return r.pts.some(function (p) { return Math.abs(p[1] + 82.3816) > 0.00005; });
});
check('pasada repetida desplazada', shifted);
const single = HC.buildRouteLanes([[23.1150, -82.3816], [23.1150, -82.3750], [23.1200, -82.3750]], 18);
check('sin repeticiones un solo carril', single.length === 1 && single[0].lane === 0);

console.log(failures === 0 ? '\nCORE OK' : '\n' + failures + ' FALLOS');
process.exit(failures === 0 ? 0 : 1);
