(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HavanaCore = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var PASS_COLORS = ['#e91e63', '#8e24aa', '#00897b', '#6d4c41', '#c0ca33'];

  var state = { graph: null, adj: null, adjGraph: null, loading: null };

  function loadGraph(url, fetchImpl) {
    if (state.graph) return Promise.resolve(state.graph);
    if (state.loading) return state.loading;
    var f = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
    if (!f) return Promise.reject(new Error('fetch no disponible'));
    state.loading = f(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (g) {
      state.loading = null;
      return setGraph(g);
    }, function (err) {
      state.loading = null;
      throw err;
    });
    return state.loading;
  }

  function setGraph(g) {
    state.graph = g;
    state.adj = null;
    state.adjGraph = null;
    return g;
  }

  function getGraph() {
    return state.graph;
  }

function haversineKm(a, b) {
  var R = 6371;
  var dLat = (b.lat - a.lat) * Math.PI / 180;
  var dLng = (b.lng - a.lng) * Math.PI / 180;
  var la1 = a.lat * Math.PI / 180;
  var la2 = b.lat * Math.PI / 180;
  var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(la1) * Math.cos(la2) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function nearestLocalNode(g, p, adj) {
  var lats = g.nodes.lat, lons = g.nodes.lon;
  var best = -1, bd = Infinity;
  for (var i = 0; i < lats.length; i++) {
    if (adj && adj[i] && !adj[i].length) continue;
    var d = (lats[i] - p.lat) * (lats[i] - p.lat) + (lons[i] - p.lng) * (lons[i] - p.lng);
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}

function dijkstraLocal(adj, s, t) {
  var N = adj.length;
  var dist = new Float64Array(N);
  var prev = new Int32Array(N);
  var done = new Uint8Array(N);
  var heap = [[0, s]];
  for (var i = 0; i < N; i++) dist[i] = Infinity;
  for (var i = 0; i < N; i++) prev[i] = -1;
  dist[s] = 0;
  function push(item) {
    var h = heap.length;
    heap.push(item);
    while (h > 0) {
      var p = (h - 1) >> 1;
      if (heap[p][0] <= heap[h][0]) break;
      var tmp = heap[p]; heap[p] = heap[h]; heap[h] = tmp;
      h = p;
    }
  }
  function pop() {
    var top = heap[0];
    var last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      var h = 0;
      for (;;) {
        var l = h * 2 + 1, r = l + 1, m = h;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === h) break;
        var tmp = heap[m]; heap[m] = heap[h]; heap[h] = tmp;
        h = m;
      }
    }
    return top;
  }
  while (heap.length) {
    var cur = pop();
    var u = cur[1];
    if (done[u]) continue;
    done[u] = 1;
    if (u === t) break;
    var al = adj[u];
    for (var k = 0; k < al.length; k++) {
      var v = al[k][0], w = al[k][1], nd = dist[u] + w;
      if (nd < dist[v]) { dist[v] = nd; prev[v] = u; push([nd, v]); }
    }
  }
  if (dist[t] === Infinity) return null;
  var path = [];
  for (var x = t; x !== -1; x = prev[x]) path.push(x);
  path.reverse();
  return { distM: dist[t], path: path };
}

function getAdj(g, profile) {
  var graph = g || state.graph;
  if (!graph) return null;
  if (state.adjGraph !== graph) {
    state.adjGraph = graph;
    state.adj = { car: null, foot: null };
  }
  var adj = state.adj[profile];
  if (adj) return adj;
  var edges = graph.edges[profile];
  adj = new Array(graph.nodes.lat.length);
  for (var i = 0; i < adj.length; i++) adj[i] = [];
  for (var e = 0; e < edges.length; e++) {
    var ed = edges[e];
    adj[ed[0]].push([ed[1], ed[2]]);
    if (profile === 'car') adj[ed[1]].push([ed[0], ed[2]]);
  }
  state.adj[profile] = adj;
  return adj;
}

function localRouteOn(g, a, b, profile) {
  var adj = getAdj(g, profile);
  var s = nearestLocalNode(g, a, adj);
  var t = nearestLocalNode(g, b, adj);
  if (s === -1 || t === -1 || s === t) return null;
  var snapA = haversineKm(a, { lat: g.nodes.lat[s], lng: g.nodes.lon[s] }) * 1000;
  var snapB = haversineKm(b, { lat: g.nodes.lat[t], lng: g.nodes.lon[t] }) * 1000;
  if (snapA > 3000 || snapB > 3000) return null;
  var res = dijkstraLocal(adj, s, t);
  if (!res) return null;
  var lats = g.nodes.lat, lons = g.nodes.lon;
  var coords = res.path.map(function (idx) { return [lats[idx], lons[idx]]; });
  return { distance: res.distM, coords: coords };
}

function computeLocalRoute(a, b, profile) {
  var g = state.graph;
  if (!g) return null;
  var res = localRouteOn(g, a, b, profile);
  if (res) return res;
  if (profile === 'car') {
    var alt = localRouteOn(g, a, b, 'foot');
    if (alt) { alt.fallbackProfile = 'foot'; return alt; }
  }
  return null;
}

function dedupeCoords(coords) {
  var out = [];
  for (var i = 0; i < coords.length; i++) {
    var p = coords[i];
    if (!out.length) { out.push([p[0], p[1]]); continue; }
    var q = out[out.length - 1];
    if (Math.abs(q[0] - p[0]) > 1e-7 || Math.abs(q[1] - p[1]) > 1e-7) out.push([p[0], p[1]]);
  }
  return out;
}

function segKey(a, b) {
  var ka = Math.round(a[0] * 1e6) + ',' + Math.round(a[1] * 1e6);
  var kb = Math.round(b[0] * 1e6) + ',' + Math.round(b[1] * 1e6);
  return ka < kb ? ka + '|' + kb : kb + '|' + ka;
}

function segOffset(a, b, meters) {
  var cosLat = Math.cos(((a[0] + b[0]) / 2) * Math.PI / 180);
  var ka = Math.round(a[0] * 1e6) + ',' + Math.round(a[1] * 1e6);
  var kb = Math.round(b[0] * 1e6) + ',' + Math.round(b[1] * 1e6);
  var sign = ka < kb ? 1 : -1;
  var dLatM = (b[0] - a[0]) * 110540;
  var dLngM = (b[1] - a[1]) * 111320 * cosLat;
  var len = Math.sqrt(dLatM * dLatM + dLngM * dLngM);
  if (!len) return { lat: 0, lng: 0 };
  var nx = -dLatM / len * sign;
  var ny = dLngM / len * sign;
  return {
    lat: ny * meters / 110540,
    lng: nx * meters / (111320 * cosLat)
  };
}

function buildRouteLanes(coords, stepM) {
  var n = coords.length;
  if (n < 2) return [];
  var i, k;
  var keys = [];
  var counts = {};
  for (i = 0; i < n - 1; i++) {
    k = segKey(coords[i], coords[i + 1]);
    keys.push(k);
    counts[k] = (counts[k] || 0) + 1;
  }
  var seen = {};
  var lanes = [], totals = [], offs = [];
  for (i = 0; i < n - 1; i++) {
    var lane = seen[keys[i]] || 0;
    seen[keys[i]] = lane + 1;
    lanes.push(lane);
    totals.push(counts[keys[i]]);
    offs.push(lane === 0
      ? { lat: 0, lng: 0 }
      : segOffset(coords[i], coords[i + 1], Math.min(lane, PASS_COLORS.length) * stepM));
  }
  var runs = [];
  i = 0;
  while (i < n - 1) {
    var j = i;
    while (j + 1 < n - 1 && lanes[j + 1] === lanes[i] && totals[j + 1] === totals[i]) j += 1;
    var run = { lane: lanes[i], total: totals[i], pts: [] };
    if (lanes[i] > 0) run.pts.push([coords[i][0], coords[i][1]]);
    for (var s = i; s <= j; s++) {
      var oa = offs[s];
      if (s > i) {
        oa = {
          lat: (offs[s].lat + offs[s - 1].lat) / 2,
          lng: (offs[s].lng + offs[s - 1].lng) / 2
        };
      }
      run.pts.push([coords[s][0] + oa.lat, coords[s][1] + oa.lng]);
    }
    run.pts.push([coords[j + 1][0] + offs[j].lat, coords[j + 1][1] + offs[j].lng]);
    if (lanes[i] > 0) run.pts.push([coords[j + 1][0], coords[j + 1][1]]);
    runs.push(run);
    i = j + 1;
  }
  return runs;
}

function passStyle(baseColor, lane) {
  if (lane === 0) return { color: baseColor, weight: 6, opacity: 0.8 };
  return {
    color: PASS_COLORS[(lane - 1) % PASS_COLORS.length],
    weight: 5,
    opacity: 0.95,
    dashArray: '12 7'
  };
}

function tspSnapPoints(g, adj, points) {
  var lats = g.nodes.lat, lons = g.nodes.lon;
  var out = [];
  for (var i = 0; i < points.length; i++) {
    var idx = nearestLocalNode(g, points[i], adj);
    if (idx < 0) return null;
    out.push({
      idx: idx,
      snapM: haversineKm(points[i], { lat: lats[idx], lng: lons[idx] }) * 1000
    });
  }
  return out;
}

function tspMatrix(g, adj, nodes) {
  var n = nodes.length;
  var dist = [];
  var paths = [];
  for (var i = 0; i < n; i++) {
    dist.push(new Float64Array(n));
    paths.push(new Array(n));
    for (var j = 0; j < n; j++) {
      if (i === j) { dist[i][j] = 0; paths[i][j] = [nodes[i].idx]; continue; }
      var r = dijkstraLocal(adj, nodes[i].idx, nodes[j].idx);
      if (!r) return null;
      dist[i][j] = r.distM;
      paths[i][j] = r.path;
    }
  }
  return { dist: dist, paths: paths };
}

function tspExact(dist, n, start, end) {
  var active = [], i;
  for (i = 0; i < n; i++) { if (i !== end) active.push(i); }
  var m = active.length;
  if (m === 0) return { order: [end], cost: 0 };
  var startFree = start < 0 || start === end;
  var startLocal = -1;
  if (!startFree) {
    startLocal = active.indexOf(start);
    if (startLocal < 0) return null;
  }
  var size = 1 << m;
  var dp = new Float64Array(size * m);
  var par = new Int32Array(size * m);
  for (i = 0; i < dp.length; i++) { dp[i] = Infinity; par[i] = -1; }
  if (startFree) {
    for (i = 0; i < m; i++) dp[(1 << i) * m + i] = 0;
  } else {
    dp[(1 << startLocal) * m + startLocal] = 0;
  }
  var full = size - 1;
  for (var mask = 1; mask < size; mask++) {
    for (var j = 0; j < m; j++) {
      if ((mask & (1 << j)) === 0) continue;
      var cur = dp[mask * m + j];
      if (cur === Infinity) continue;
      for (var k = 0; k < m; k++) {
        if (mask & (1 << k)) continue;
        var nm = mask | (1 << k);
        var nd = cur + dist[active[j]][active[k]];
        if (nd < dp[nm * m + k]) {
          dp[nm * m + k] = nd;
          par[nm * m + k] = j;
        }
      }
    }
  }
  var best = Infinity, bestJ = -1;
  for (j = 0; j < m; j++) {
    var cost = dp[full * m + j];
    if (cost === Infinity) continue;
    if (end >= 0) cost += dist[active[j]][end];
    if (cost < best) { best = cost; bestJ = j; }
  }
  if (bestJ < 0) return null;
  var order = [];
  var curMask = full, curJ = bestJ;
  while (curJ >= 0) {
    order.push(active[curJ]);
    var pj = par[curMask * m + curJ];
    curMask ^= (1 << curJ);
    curJ = pj;
  }
  order.reverse();
  if (end >= 0) order.push(end);
  return { order: order, cost: best };
}

function tspExactClosed(dist, n, anchor) {
  if (n <= 1) return { order: [anchor, anchor], cost: 0 };
  var size = 1 << n;
  var dp = new Float64Array(size * n);
  var par = new Int32Array(size * n);
  for (var i = 0; i < dp.length; i++) { dp[i] = Infinity; par[i] = -1; }
  dp[(1 << anchor) * n + anchor] = 0;
  var full = size - 1;
  for (var mask = 1; mask < size; mask++) {
    for (var j = 0; j < n; j++) {
      if ((mask & (1 << j)) === 0) continue;
      var cur = dp[mask * n + j];
      if (cur === Infinity) continue;
      for (var k = 0; k < n; k++) {
        if (mask & (1 << k)) continue;
        var nm = mask | (1 << k);
        var nd = cur + dist[j][k];
        if (nd < dp[nm * n + k]) {
          dp[nm * n + k] = nd;
          par[nm * n + k] = j;
        }
      }
    }
  }
  var best = Infinity, bestJ = -1;
  for (j = 0; j < n; j++) {
    if (j === anchor) continue;
    var cost = dp[full * n + j] + dist[j][anchor];
    if (cost < best) { best = cost; bestJ = j; }
  }
  if (bestJ < 0) return null;
  var order = [];
  var curMask = full, curJ = bestJ;
  while (curJ >= 0) {
    order.push(curJ);
    var pj = par[curMask * n + curJ];
    curMask ^= (1 << curJ);
    curJ = pj;
  }
  order.reverse();
  order.push(anchor);
  return { order: order, cost: best };
}

function tsp2opt(dist, order) {
  var n = order.length;
  var improved = true, rounds = 0;
  while (improved && rounds < 200) {
    improved = false;
    rounds += 1;
    for (var i = 0; i < n - 2; i++) {
      for (var j = i + 1; j < n - 1; j++) {
        var a = order[i], b = order[i + 1], c = order[j], d = order[j + 1];
        var delta = dist[a][c] + dist[b][d] - dist[a][b] - dist[c][d];
        if (delta < -1e-9) {
          var lo = i + 1, hi = j;
          while (lo < hi) { var t = order[lo]; order[lo] = order[hi]; order[hi] = t; lo++; hi--; }
          improved = true;
        }
      }
    }
  }
}

function tspHeuristic(dist, n, start, end, closed) {
  var anchor = closed ? (start >= 0 ? start : 0) : -1;
  var remaining = [];
  for (var i = 0; i < n; i++) {
    if (closed) { if (i !== anchor) remaining.push(i); }
    else if (i !== start && i !== end) remaining.push(i);
  }
  var order = [];
  var cur;
  if (closed) { cur = anchor; order.push(cur); }
  else if (start >= 0) { cur = start; order.push(cur); }
  else if (remaining.length) { cur = remaining.shift(); order.push(cur); }
  else { cur = 0; order.push(cur); }
  while (remaining.length) {
    var bi = 0, bd = Infinity;
    for (var r = 0; r < remaining.length; r++) {
      var d = dist[cur][remaining[r]];
      if (d < bd) { bd = d; bi = r; }
    }
    cur = remaining.splice(bi, 1)[0];
    order.push(cur);
  }
  if (closed) order.push(anchor);
  else if (end >= 0 && end !== start) order.push(end);
  tsp2opt(dist, order);
  return { order: order };
}

function tspSolveOrder(dist, n, start, end, closed) {
  if (closed) {
    if (n <= 12) return tspExactClosed(dist, n, start >= 0 ? start : 0);
    return tspHeuristic(dist, n, start, end, true);
  }
  if (n <= 12) return tspExact(dist, n, start, end);
  return tspHeuristic(dist, n, start, end, false);
}

  return {
    loadGraph: loadGraph,
    setGraph: setGraph,
    getGraph: getGraph,
    PASS_COLORS: PASS_COLORS,
    haversineKm: haversineKm,
    nearestLocalNode: nearestLocalNode,
    dijkstraLocal: dijkstraLocal,
    getAdj: getAdj,
    localRouteOn: localRouteOn,
    computeLocalRoute: computeLocalRoute,
    dedupeCoords: dedupeCoords,
    segKey: segKey,
    segOffset: segOffset,
    buildRouteLanes: buildRouteLanes,
    passStyle: passStyle,
    tspSnapPoints: tspSnapPoints,
    tspMatrix: tspMatrix,
    tspExact: tspExact,
    tspExactClosed: tspExactClosed,
    tsp2opt: tsp2opt,
    tspHeuristic: tspHeuristic,
    tspSolveOrder: tspSolveOrder
  };
}));
