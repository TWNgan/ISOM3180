/* Network diagram engine: Cisco-style SVG icons, topology rendering, and
   collision / broadcast domain computation. Exposes window.Diagrams. */
(function () {
  'use strict';

  const COL = { top: '#62b0ea', front: '#2f74ad', side: '#245d8c', stroke: '#173f5f' };
  const PALETTE = ['#e6194b', '#3cb44b', '#f58231', '#911eb4', '#0082c8', '#f032e6', '#008080',
    '#aa6e28', '#d4a017', '#800000', '#808000', '#000080', '#e75480', '#2e8b57', '#ff6347', '#6a5acd',
    '#20b2aa', '#b8860b', '#9932cc', '#228b22'];

  // ---------- icons (centered at 0,0) ----------
  function boxBody(extra) {
    return `<polygon points="-30,-8 -18,-22 34,-22 22,-8" fill="${COL.top}" stroke="${COL.stroke}" stroke-width="1"/>
      <polygon points="22,-8 34,-22 34,-4 22,10" fill="${COL.side}" stroke="${COL.stroke}" stroke-width="1"/>
      <rect x="-30" y="-8" width="52" height="18" fill="${COL.front}" stroke="${COL.stroke}" stroke-width="1"/>${extra || ''}`;
  }
  function arrow(x1, y1, x2, y2, both) {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff" stroke-width="1.8" marker-end="url(#ah)"${both ? ' marker-start="url(#ahs)"' : ''}/>`;
  }
  const ICONS = {
    router: () => `<path d="M-32,-4 L-32,9 A32,11 0 0 0 32,9 L32,-4" fill="${COL.front}" stroke="${COL.stroke}"/>
      <ellipse cx="0" cy="-4" rx="32" ry="11" fill="${COL.top}" stroke="${COL.stroke}"/>
      ${arrow(-24, -11, -8, -6)}${arrow(24, 3, 8, -2)}${arrow(5, -6, 22, -11)}${arrow(-5, -2, -22, 3)}`,
    switch: () => boxBody(arrow(-12, -19.5, 12, -19.5) + arrow(16, -16.5, -8, -16.5) +
      arrow(-16, -13.5, 8, -13.5) + arrow(12, -10.5, -12, -10.5)),
    hub: () => boxBody(arrow(-10, -15, 18, -15, true) +
      [...Array(8)].map((_, i) => `<rect x="${-26 + i * 6}" y="2" width="4" height="5" fill="#fff"/>`).join('')),
    repeater: () => `<polygon points="-22,-14 -12,-24 26,-24 16,-14" fill="${COL.top}" stroke="${COL.stroke}"/>
      <polygon points="16,-14 26,-24 26,8 16,18" fill="${COL.side}" stroke="${COL.stroke}"/>
      <rect x="-22" y="-14" width="38" height="32" fill="${COL.front}" stroke="${COL.stroke}"/>
      <rect x="-14" y="-8" width="22" height="20" fill="${COL.side}" stroke="#fff" stroke-width="1.2"/>
      <line x1="-11" y1="-2" x2="5" y2="-2" stroke="#fff"/><line x1="-11" y1="2" x2="5" y2="2" stroke="#fff"/><line x1="-11" y1="6" x2="5" y2="6" stroke="#fff"/>`,
    bridge: () => `<path d="M24,-18 L32,-26 L32,10 L24,18 Z" fill="${COL.side}" stroke="${COL.stroke}"/>
      <path d="M-28,-18 Q-2,6 24,-18 L24,18 L-28,18 Z" fill="${COL.front}" stroke="${COL.stroke}"/>
      <path d="M-28,-18 L-20,-26 Q4,-4 32,-26 L24,-18 Q-2,6 -28,-18 Z" fill="${COL.top}" stroke="${COL.stroke}"/>`,
    pc: () => `<rect x="-15" y="-22" width="30" height="22" rx="2" fill="#d9d5c7" stroke="#6b6655"/>
      <rect x="-11" y="-18" width="22" height="14" fill="#fff" stroke="#6b6655" stroke-width=".8"/>
      <polygon points="-20,6 20,6 15,0 -15,0" fill="#c9c4b2" stroke="#6b6655"/>
      <rect x="-22" y="6" width="44" height="5" fill="#bdb7a3" stroke="#6b6655"/>`,
    server: () => `<rect x="-12" y="-24" width="24" height="44" rx="2" fill="#d9d5c7" stroke="#6b6655"/>
      <line x1="-8" y1="-16" x2="8" y2="-16" stroke="#6b6655"/><line x1="-8" y1="-10" x2="8" y2="-10" stroke="#6b6655"/>
      <circle cx="6" cy="12" r="2" fill="#3cb44b"/>`,
    cloud: () => `<path d="M-30,10 C-44,10 -44,-10 -28,-10 C-28,-26 -6,-28 0,-16 C6,-30 30,-26 28,-10 C44,-10 44,10 30,10 Z" fill="#f2f6fa" stroke="#7a8fa3" stroke-width="1.5"/>`,
    ring: () => `<ellipse cx="0" cy="0" rx="38" ry="20" fill="#fff" stroke="#c0392b" stroke-width="3"/>
      <ellipse cx="0" cy="0" rx="31" ry="14" fill="#fff5f5" stroke="#c0392b" stroke-width="1.5"/>`,
  };
  const TYPE_NAME = { router: 'Router', switch: 'Switch', hub: 'Hub', repeater: 'Repeater', bridge: 'Bridge',
    pc: 'PC', server: 'Server', cloud: 'Cloud', ring: 'Ring', bus: 'Bus' };
  const LAYER = { router: 3, switch: 2, bridge: 2, hub: 1, repeater: 1, bus: 1, ring: 1 };

  const DEFS = `<defs>
    <marker id="ah" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#fff"/></marker>
    <marker id="ahs" viewBox="0 0 6 6" refX="1" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6 Z" fill="#fff"/></marker>
  </defs>`;

  function iconSVG(type, size) {
    const s = size || 120;
    return `<svg class="icon-svg" viewBox="-50 -40 100 70" width="${s}" height="${s * 0.7}" xmlns="http://www.w3.org/2000/svg">${DEFS}<g>${ICONS[type]()}</g></svg>`;
  }

  // ---------- domain computation ----------
  function computeDomains(topo, kind) {
    const join = kind === 'collision'
      ? { hub: 1, repeater: 1, bus: 1, ring: 1 }
      : { hub: 1, repeater: 1, bus: 1, ring: 1, switch: 1, bridge: 1 };
    const parent = topo.links.map((_, i) => i);
    const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    const union = (a, b) => { parent[find(a)] = find(b); };
    const typeOf = {};
    topo.nodes.forEach((n) => { typeOf[n.id] = n.t; });
    topo.nodes.forEach((n) => {
      if (!join[n.t]) return;
      const inc = [];
      topo.links.forEach((l, i) => { if (l[0] === n.id || l[1] === n.id) inc.push(i); });
      for (let k = 1; k < inc.length; k++) union(inc[0], inc[k]);
    });
    const groups = {};
    topo.links.forEach((_, i) => { const r = find(i); (groups[r] = groups[r] || []).push(i); });
    return Object.values(groups);
  }

  function nodeById(topo, id) { return topo.nodes.find((n) => n.id === id); }

  function linkEnds(topo, l) {
    const a = nodeById(topo, l[0]); const b = nodeById(topo, l[1]);
    const pt = (n, other) => {
      if (n.t === 'bus') {
        const half = (n.w || 200) / 2;
        return { x: Math.max(n.x - half, Math.min(n.x + half, other.x)), y: n.y };
      }
      return { x: n.x, y: n.y };
    };
    return [pt(a, b), pt(b, a)];
  }

  function describeGroup(topo, group) {
    const names = new Set();
    group.forEach((i) => topo.links[i].slice(0, 2).forEach((id) => {
      const n = nodeById(topo, id);
      if (n.t !== 'bus') names.add(n.label || n.tag || TYPE_NAME[n.t]);
    }));
    return [...names].join(' ↔ ');
  }

  // ---------- rendering ----------
  function render(topo, opts) {
    const o = Object.assign({ highlight: null, showTypes: false, portLabels: true }, opts || {});
    const W = topo.w || 760; const H = topo.h || 400;
    let groups = null; const colorOf = {};
    if (o.highlight) {
      groups = computeDomains(topo, o.highlight);
      groups.forEach((g, gi) => g.forEach((i) => { colorOf[i] = PALETTE[gi % PALETTE.length]; }));
    }
    let svg = `<svg class="topo" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${DEFS}`;
    // links
    topo.links.forEach((l, i) => {
      const [p, q] = linkEnds(topo, l);
      const color = colorOf[i] || (l[2] && l[2].serial ? '#c0392b' : '#8a1c1c');
      const width = colorOf[i] ? 5 : 2.4;
      if (l[2] && l[2].serial) {
        const mx = (p.x + q.x) / 2; const my = (p.y + q.y) / 2;
        const dx = (q.x - p.x); const dy = (q.y - p.y); const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len * 8; const ny = dx / len * 8; const ux = dx / len * 7; const uy = dy / len * 7;
        svg += `<polyline points="${p.x},${p.y} ${mx - ux + nx},${my - uy + ny} ${mx + ux - nx},${my + uy - ny} ${q.x},${q.y}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
      } else {
        svg += `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
      }
      if (l[2] && l[2].label) {
        const mx = (p.x + q.x) / 2; const my = (p.y + q.y) / 2;
        svg += `<text x="${mx}" y="${my - 12}" class="seg-label" text-anchor="middle">${l[2].label}</text>`;
      }
      if (o.portLabels && l[2] && l[2].port) {
        const a = nodeById(topo, l[0]);
        const t = 0.22; const lx = p.x + (q.x - p.x) * t; const ly = p.y + (q.y - p.y) * t;
        const from = a.t === 'bus' ? q : p;
        const fx = from === p ? lx : q.x + (p.x - q.x) * t; const fy = from === p ? ly : q.y + (p.y - q.y) * t;
        svg += `<text x="${fx + 6}" y="${fy - 6}" class="port-label">${l[2].port}</text>`;
      }
    });
    // buses
    topo.nodes.filter((n) => n.t === 'bus').forEach((n) => {
      const half = (n.w || 200) / 2;
      let color = '#333';
      if (groups) {
        const idx = topo.links.findIndex((l) => l[0] === n.id || l[1] === n.id);
        if (idx >= 0) color = colorOf[idx];
      }
      svg += `<line x1="${n.x - half}" y1="${n.y}" x2="${n.x + half}" y2="${n.y}" stroke="${color}" stroke-width="${groups ? 7 : 5}"/>`;
      svg += `<rect x="${n.x - half - 5}" y="${n.y - 6}" width="5" height="12" fill="#555"/><rect x="${n.x + half}" y="${n.y - 6}" width="5" height="12" fill="#555"/>`;
    });
    // nodes
    topo.nodes.filter((n) => n.t !== 'bus').forEach((n) => {
      svg += `<g transform="translate(${n.x},${n.y})">${ICONS[n.t]()}</g>`;
      if (n.tag) svg += `<text x="${n.x}" y="${n.y - 30}" class="tag-label" text-anchor="middle">${n.tag}</text>`;
      const showName = n.t === 'pc' || n.t === 'server' || n.t === 'cloud' || n.t === 'ring' || o.showTypes;
      if (showName && n.label) {
        const dy = n.t === 'cloud' || n.t === 'ring' ? 5 : (n.t === 'pc' ? 26 : 34);
        svg += `<text x="${n.x}" y="${n.y + dy}" class="node-label" text-anchor="middle">${n.label}</text>`;
      } else if (o.showTypes && !n.label) {
        svg += `<text x="${n.x}" y="${n.y + 34}" class="node-label" text-anchor="middle">${TYPE_NAME[n.t]}</text>`;
      }
    });
    // badges
    if (groups) {
      groups.forEach((g, gi) => {
        // choose the longest link of the group for the badge
        let best = g[0]; let bestLen = -1;
        g.forEach((i) => { const [p, q] = linkEnds(topo, topo.links[i]); const L = Math.hypot(q.x - p.x, q.y - p.y); if (L > bestLen) { bestLen = L; best = i; } });
        const [p, q] = linkEnds(topo, topo.links[best]);
        const bx = (p.x + q.x) / 2; const by = (p.y + q.y) / 2;
        svg += `<circle cx="${bx}" cy="${by}" r="11" fill="${PALETTE[gi % PALETTE.length]}" stroke="#fff" stroke-width="2"/>`;
        svg += `<text x="${bx}" y="${by + 4}" class="badge" text-anchor="middle">${gi + 1}</text>`;
      });
    }
    svg += '</svg>';
    return { svg, groups };
  }

  // ---------- predefined topologies ----------
  const N = (id, t, x, y, label, extra) => Object.assign({ id, t, x, y, label }, extra || {});
  const TOPOS = [
    { id: 'q02', name: 'Review Q2 嘅圖', w: 760, h: 380, nodes: [
      N('r1', 'router', 110, 160), N('s1', 'switch', 300, 95), N('h1', 'pc', 300, 30, 'H1'),
      N('hub', 'hub', 500, 95), N('h2', 'pc', 500, 30, 'H2'), N('h3', 'pc', 650, 60, 'H3'), N('h4', 'pc', 650, 140, 'H4'),
      N('s2', 'switch', 240, 280), N('r2', 'router', 430, 300), N('br', 'bridge', 600, 300), N('h5', 'pc', 720, 300, 'H5')],
      links: [['r1', 's1'], ['s1', 'h1'], ['s1', 'hub'], ['hub', 'h2'], ['hub', 'h3'], ['hub', 'h4'], ['r1', 's2'], ['s2', 'r2'], ['r2', 'br'], ['br', 'h5']] },
    { id: 'q04', name: 'Review Q4 嘅圖', w: 760, h: 400, nodes: [
      N('m', 'router', 110, 60, 'Miller'), N('br', 'bridge', 110, 200), N('hb', 'pc', 110, 330, 'P1'),
      N('sa', 'switch', 300, 120), N('k', 'router', 480, 50, 'Kaiser'), N('sb', 'switch', 600, 170), N('hs', 'pc', 690, 320, 'P2'),
      N('hub', 'hub', 420, 260), N('x1', 'pc', 330, 350, 'P3'), N('x2', 'pc', 420, 350, 'P4'), N('x3', 'pc', 510, 350, 'P5')],
      links: [['m', 'br'], ['br', 'hb'], ['m', 'sa'], ['sa', 'k'], ['k', 'sb'], ['sb', 'hs'], ['sb', 'hub'], ['hub', 'x1'], ['hub', 'x2'], ['hub', 'x3']] },
    { id: 'q08', name: 'Review Q8 嘅圖', w: 760, h: 360, nodes: [
      N('net', 'cloud', 90, 60, 'Internet'), N('r', 'router', 300, 60), N('sw', 'switch', 300, 190),
      N('a', 'pc', 110, 160, 'A'), N('b', 'pc', 110, 290, 'B'), N('hub', 'hub', 510, 190),
      N('c', 'pc', 680, 90, 'C'), N('d', 'pc', 680, 200, 'D'), N('e', 'pc', 680, 310, 'E')],
      links: [['r', 'net', { serial: true }], ['r', 'sw'], ['sw', 'a'], ['sw', 'b'], ['sw', 'hub'], ['hub', 'c'], ['hub', 'd'], ['hub', 'e']] },
    { id: 'q16', name: 'Review Q16 嘅圖', w: 760, h: 360, nodes: [
      N('r', 'router', 380, 60), N('sw', 'switch', 180, 170), N('a', 'pc', 90, 300, 'A'), N('b', 'pc', 180, 300, 'B'), N('c', 'pc', 270, 300, 'C'),
      N('hub', 'hub', 580, 170), N('d', 'pc', 490, 300, 'D'), N('e', 'pc', 580, 300, 'E'), N('f', 'pc', 670, 300, 'F')],
      links: [['r', 'sw', { port: 'E0' }], ['sw', 'a'], ['sw', 'b'], ['sw', 'c'], ['r', 'hub', { port: 'E1' }], ['hub', 'd'], ['hub', 'e'], ['hub', 'f']] },
    { id: 'q12', name: 'Review Q12 嘅圖', w: 760, h: 330, nodes: [
      N('a', 'bridge', 110, 120), N('pa', 'pc', 60, 260, 'P1'), N('b', 'hub', 290, 120), N('p1', 'pc', 250, 260, 'P2'), N('p2', 'pc', 340, 260, 'P3'),
      N('c', 'router', 470, 120), N('d', 'switch', 630, 120), N('p3', 'pc', 720, 40, 'P4'), N('p4', 'pc', 720, 230, 'P5')],
      links: [['a', 'pa'], ['a', 'b'], ['b', 'p1'], ['b', 'p2'], ['b', 'c'], ['c', 'd'], ['d', 'p3'], ['d', 'p4']] },
    { id: 'q03', name: 'Review Q3 嘅圖', w: 760, h: 300, nodes: [
      N('p', 'pc', 60, 150, 'PC1'), N('hub', 'hub', 220, 150), N('r', 'router', 400, 150), N('sw', 'switch', 570, 150),
      N('p4', 'pc', 710, 70, 'PC4'), N('p5', 'pc', 710, 240, 'PC5')],
      links: [['p', 'hub'], ['hub', 'r'], ['r', 'sw'], ['sw', 'p4'], ['sw', 'p5']] },
    { id: 's1', name: '一部 Switch + 4 PCs', w: 760, h: 320, nodes: [
      N('sw', 'switch', 380, 140), N('a', 'pc', 160, 60, 'A'), N('b', 'pc', 160, 230, 'B'), N('c', 'pc', 600, 60, 'C'), N('d', 'pc', 600, 230, 'D')],
      links: [['sw', 'a'], ['sw', 'b'], ['sw', 'c'], ['sw', 'd']] },
    { id: 's2', name: '一部 Hub + 4 PCs', w: 760, h: 320, nodes: [
      N('hub', 'hub', 380, 140), N('a', 'pc', 160, 60, 'A'), N('b', 'pc', 160, 230, 'B'), N('c', 'pc', 600, 60, 'C'), N('d', 'pc', 600, 230, 'D')],
      links: [['hub', 'a'], ['hub', 'b'], ['hub', 'c'], ['hub', 'd']] },
    { id: 's4', name: '兩部 Switch 串連 + Hub', w: 760, h: 380, nodes: [
      N('s1', 'switch', 220, 110), N('a', 'pc', 70, 40, 'A'), N('b', 'pc', 70, 180, 'B'), N('c', 'pc', 220, 250, 'C'),
      N('s2', 'switch', 520, 110), N('d', 'pc', 680, 40, 'D'), N('e', 'pc', 680, 180, 'E'), N('hub', 'hub', 480, 260),
      N('f', 'pc', 400, 350, 'F'), N('g', 'pc', 560, 350, 'G')],
      links: [['s1', 'a'], ['s1', 'b'], ['s1', 'c'], ['s1', 's2'], ['s2', 'd'], ['s2', 'e'], ['s2', 'hub'], ['hub', 'f'], ['hub', 'g']] },
    { id: 's5', name: '兩部 Router（serial）+ Switch / Hub / Bridge', w: 860, h: 430, nodes: [
      N('net', 'cloud', 790, 50, 'Internet'), N('r2', 'router', 560, 60), N('r1', 'router', 260, 60),
      N('sw1', 'switch', 110, 200), N('p1', 'pc', 50, 320, 'P1'), N('p2', 'pc', 160, 320, 'P2'),
      N('hub', 'hub', 330, 210), N('p3', 'pc', 260, 330, 'P3'), N('p4', 'pc', 340, 340, 'P4'), N('p5', 'pc', 420, 330, 'P5'),
      N('sw2', 'switch', 580, 210), N('p6', 'pc', 520, 330, 'P6'), N('p7', 'pc', 620, 340, 'P7'),
      N('br', 'bridge', 740, 220), N('p8', 'pc', 790, 340, 'P8')],
      links: [['r1', 'r2', { serial: true }], ['r2', 'net', { serial: true }], ['r1', 'sw1'], ['sw1', 'p1'], ['sw1', 'p2'],
        ['r1', 'hub'], ['hub', 'p3'], ['hub', 'p4'], ['hub', 'p5'], ['r2', 'sw2'], ['sw2', 'p6'], ['sw2', 'p7'], ['sw2', 'br'], ['br', 'p8']] },
    { id: 's6', name: 'Bus + Repeater + Bridge + Router', w: 860, h: 440, nodes: [
      N('bus1', 'bus', 170, 110, null, { w: 240 }), N('a', 'pc', 90, 45, 'A'), N('b', 'pc', 170, 45, 'B'), N('c', 'pc', 250, 45, 'C'),
      N('rep', 'repeater', 340, 175),
      N('bus2', 'bus', 170, 240, null, { w: 240 }), N('d', 'pc', 90, 305, 'D'), N('e', 'pc', 170, 305, 'E'), N('f', 'pc', 250, 305, 'F'),
      N('br', 'bridge', 420, 290),
      N('bus3', 'bus', 620, 240, null, { w: 240 }), N('g', 'pc', 540, 175, 'G'), N('h', 'pc', 620, 175, 'H'), N('i', 'pc', 700, 175, 'I'),
      N('r', 'router', 620, 340), N('sw', 'switch', 780, 340), N('j', 'pc', 720, 410, 'J'), N('k', 'pc', 830, 410, 'K')],
      links: [['a', 'bus1'], ['b', 'bus1'], ['c', 'bus1'], ['rep', 'bus1'], ['rep', 'bus2'], ['d', 'bus2'], ['e', 'bus2'], ['f', 'bus2'],
        ['br', 'bus2'], ['br', 'bus3'], ['g', 'bus3'], ['h', 'bus3'], ['i', 'bus3'], ['r', 'bus3'], ['r', 'sw'], ['sw', 'j'], ['sw', 'k']] },
    { id: 'big', name: '課堂大圖（Collision Domain Segmentation）', w: 900, h: 560, nodes: [
      N('net', 'cloud', 820, 50, 'Internet'), N('r2', 'router', 600, 50), N('fddi', 'ring', 600, 140, 'FDDI'), N('r1', 'router', 600, 235),
      N('tr', 'ring', 790, 235, 'Token'), N('hh', 'pc', 870, 175, 'H'), N('ii', 'pc', 870, 300, 'I'), N('jj', 'pc', 760, 320, 'J'),
      N('ms', 'switch', 380, 235), N('srv', 'server', 330, 140, 'Server'), N('g', 'pc', 230, 235, 'G'),
      N('ws', 'switch', 230, 360), N('srv2', 'server', 80, 300, 'Srv2'), N('prn', 'pc', 70, 400, 'Printer'),
      N('dd', 'pc', 140, 470, 'D'), N('ee', 'pc', 240, 480, 'E'), N('ff', 'pc', 340, 470, 'F'),
      N('hub', 'hub', 440, 400), N('aa', 'pc', 370, 500, 'A'), N('bb', 'pc', 450, 510, 'B'), N('cc', 'pc', 530, 500, 'C'),
      N('bus1', 'bus', 680, 330, null, { w: 140 }), N('ll', 'pc', 630, 290, 'L'), N('kk', 'pc', 730, 290, 'K'),
      N('rep', 'repeater', 680, 390),
      N('bus2', 'bus', 680, 445, null, { w: 140 }), N('nn', 'pc', 630, 410, 'N'), N('mm', 'pc', 730, 410, 'M'),
      N('brg', 'bridge', 800, 470),
      N('bus3', 'bus', 800, 530, null, { w: 120 }), N('pp', 'pc', 750, 505, 'P'), N('oo', 'pc', 850, 505, 'O')],
      links: [['r2', 'net', { serial: true }], ['r2', 'fddi'], ['fddi', 'r1', { port: 'F0' }], ['r1', 'tr', { port: 'T0' }], ['tr', 'hh'], ['tr', 'ii'], ['tr', 'jj'],
        ['r1', 'ms', { port: 'E0' }], ['ms', 'srv'], ['ms', 'g'], ['ms', 'ws'], ['ms', 'hub'], ['hub', 'aa'], ['hub', 'bb'], ['hub', 'cc'],
        ['ws', 'srv2'], ['ws', 'prn'], ['ws', 'dd'], ['ws', 'ee'], ['ws', 'ff'],
        ['r1', 'bus1', { port: 'E1' }], ['ll', 'bus1'], ['kk', 'bus1'], ['rep', 'bus1'], ['rep', 'bus2'], ['nn', 'bus2'], ['mm', 'bus2'],
        ['brg', 'bus2'], ['brg', 'bus3'], ['pp', 'bus3'], ['oo', 'bus3']] },
  ];

  // exhibit re-drawings for the official review questions (hidden from the trainer list)
  TOPOS.push(
    { id: 'x03', hidden: true, w: 760, h: 300, nodes: [
      N('p', 'pc', 60, 160, 'PC'), N('hub', 'hub', 220, 160), N('r', 'router', 400, 160), N('sw', 'switch', 570, 160),
      N('p4', 'pc', 710, 70, 'PC'), N('p5', 'pc', 710, 250, 'PC')],
      links: [['p', 'hub', { label: 'Segment 1' }], ['hub', 'r', { label: 'Segment 2' }], ['r', 'sw', { label: 'Segment 3' }],
        ['sw', 'p4', { label: 'Segment 4' }], ['sw', 'p5', { label: 'Segment 5' }]] },
    { id: 'x05', hidden: true, w: 760, h: 170, nodes: [N('a', 'pc', 120, 90, 'Host A'), N('b', 'pc', 640, 90, 'Host B')],
      links: [['a', 'b']] },
    { id: 'x11', hidden: true, w: 760, h: 300, nodes: [
      N('sw', 'switch', 380, 150), N('a', 'pc', 170, 60, 'Host A'), N('b', 'pc', 590, 60, 'Host B'), N('c', 'pc', 170, 245, 'Host C'), N('d', 'pc', 590, 245, 'Host D')],
      links: [['sw', 'a'], ['sw', 'b'], ['sw', 'c'], ['sw', 'd']] },
    { id: 'x12', hidden: true, w: 760, h: 300, nodes: [
      N('a', 'bridge', 110, 120, null, { tag: 'A' }), N('pa', 'pc', 60, 250), N('b', 'hub', 290, 120, null, { tag: 'B' }), N('p1', 'pc', 250, 250), N('p2', 'pc', 340, 250),
      N('c', 'router', 470, 120, null, { tag: 'C' }), N('d', 'switch', 640, 120, null, { tag: 'D' }), N('p3', 'pc', 720, 40), N('p4', 'pc', 720, 230)],
      links: [['a', 'pa'], ['a', 'b'], ['b', 'p1'], ['b', 'p2'], ['b', 'c'], ['c', 'd'], ['d', 'p3'], ['d', 'p4']] },
  );

  const SPECIAL = {
    'osi-up': (() => {
      const layers = ['7 Application', '6 Presentation', '5 Session', '4 Transport', '3 Network', '2 Data Link', '1 Physical'];
      let s = '<svg class="topo" viewBox="0 0 420 330" xmlns="http://www.w3.org/2000/svg" style="min-width:300px;max-width:420px">';
      layers.forEach((t, i) => {
        s += `<rect x="40" y="${15 + i * 43}" width="190" height="34" rx="9" fill="#fff" stroke="#3f7ea6" stroke-width="3"/>`;
        s += `<text x="135" y="${37 + i * 43}" text-anchor="middle" class="node-label" style="font-size:15px">${t}</text>`;
      });
      s += '<rect x="270" y="12" width="70" height="30" fill="#fff" stroke="#1e3a8a" stroke-width="2"/><text x="305" y="33" text-anchor="middle" style="font:800 15px serif">Data</text>';
      s += '<line x1="305" y1="300" x2="305" y2="58" stroke="#1d4ed8" stroke-width="4"/><polygon points="305,44 295,64 315,64" fill="#1d4ed8"/>';
      return s + '</svg>';
    })(),
  };

  function exhibit(id) {
    if (SPECIAL[id]) return SPECIAL[id];
    const t = TOPOS.find((x) => x.id === id);
    return t ? render(t, {}).svg : '';
  }

  // ---------- random topology generator (tree layout) ----------
  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick(arr) { return arr[rnd(arr.length)]; }

  function randomTopo() {
    let idc = 0; let pcc = 0;
    const mk = (t) => ({ id: 'n' + (idc++), t, children: [], label: t === 'pc' ? String.fromCharCode(65 + (pcc++ % 26)) : null });
    const routers = rnd(3); // 0,1,2
    const roots = [];
    function grow(node, depth) {
      if (node.t === 'pc') return;
      let kids = [];
      if (node.t === 'router') kids = [...Array(1 + rnd(3))].map(() => pick(['switch', 'switch', 'hub', 'bridge', 'pc']));
      else if (node.t === 'switch') kids = [...Array(2 + rnd(3))].map(() => (depth < 2 ? pick(['pc', 'pc', 'pc', 'hub', 'switch']) : 'pc'));
      else if (node.t === 'hub') kids = [...Array(2 + rnd(2))].map(() => (depth < 2 ? pick(['pc', 'pc', 'pc', 'repeater']) : 'pc'));
      else if (node.t === 'repeater') kids = [pick(['pc', 'hub'])];
      else if (node.t === 'bridge') kids = [pick(['pc', 'hub', 'switch'])];
      kids.forEach((t) => { const c = mk(t); node.children.push(c); grow(c, depth + 1); });
    }
    if (routers === 0) { const s = mk('switch'); roots.push(s); grow(s, 0); }
    for (let i = 0; i < routers; i++) { const r = mk('router'); roots.push(r); grow(r, 0); }
    // layout
    const nodes = []; const links = [];
    let leafX = 0; const gapX = 95; const gapY = 105;
    function place(n, depth) {
      if (!n.children.length) { n.x = leafX * gapX; leafX++; } else {
        n.children.forEach((c) => place(c, depth + 1));
        n.x = (n.children[0].x + n.children[n.children.length - 1].x) / 2;
      }
      n.y = depth * gapY;
      nodes.push({ id: n.id, t: n.t, x: n.x, y: n.y, label: n.label });
      n.children.forEach((c) => links.push([n.id, c.id]));
    }
    roots.forEach((r) => { place(r, 0); leafX += 0.6; });
    if (routers === 2) links.push([roots[0].id, roots[1].id, { serial: true }]);
    if (routers >= 1 && Math.random() < 0.4) {
      const cloud = { id: 'net', t: 'cloud', x: (leafX) * gapX, y: 0, label: 'Internet' };
      nodes.push(cloud); links.push([roots[roots.length - 1].id, 'net', { serial: true }]); leafX += 1;
    }
    const pad = 60;
    const maxY = Math.max(...nodes.map((n) => n.y));
    nodes.forEach((n) => { n.x += pad; n.y += 50; });
    return { id: 'random', name: '隨機網絡', w: Math.max(760, leafX * gapX + pad), h: maxY + 120, nodes, links };
  }

  // keep random practice diagrams exam-sized (roughly 7–20 devices)
  function randomTopoSized() {
    let t;
    for (let i = 0; i < 200; i++) {
      t = randomTopo();
      const devices = t.nodes.length;
      if (devices >= 7 && devices <= 20) break;
    }
    return t;
  }

  window.Diagrams = { ICONS, TYPE_NAME, LAYER, PALETTE, iconSVG, render, computeDomains, describeGroup, TOPOS, randomTopo: randomTopoSized, DEFS, exhibit };
})();
