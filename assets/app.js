/* ISOM3180 Midterm study site — single-page app (works from file:// with no server). */
(function () {
  'use strict';
  const D = window.SITE_DATA;
  const G = window.Diagrams;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const main = $('#main');
  const LETTERS = 'ABCDEFGHIJ';
  const TOPIC = { M1: 'Module 1', M2: 'Module 2', M3a: 'Module 3-I', M3b: 'Module 3-II' };
  const EXAM = new Date('2026-10-27T10:30:00+08:00');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rnd = (n) => Math.floor(Math.random() * n);
  const pick = (a) => a[rnd(a.length)];
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = rnd(i + 1); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const store = {
    get(k, d) { try { const v = localStorage.getItem('isom3180.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('isom3180.' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  };
  const ALLQ = D.official.concat(D.extra);
  const qById = (id) => ALLQ.find((q) => q.id === id);
  // original exhibit photo when available (local build); otherwise our own SVG re-drawing
  const exhibitHtml = (q) => (q.img
    ? `<div class="qimg"><img src="${q.img}" alt="exhibit" class="zoomable"></div>`
    : (q.diagram ? `<div class="diagram qdiagram">${G.exhibit(q.diagram)}</div><p class="swipe-hint">↔ 圖太闊可以左右滑動</p>` : ''));

  // ---------------------------------------------------------------- sidebar
  const NAV = [
    { h: '開始' },
    { href: '#/', icon: '🏠', text: '主頁 & 溫習路線', key: 'home' },
    { href: '#/page/strategy', icon: '🎯', text: '考試攻略', page: 'strategy' },
    { href: '#/page/cheatsheet', icon: '⚡', text: '考前 Cheat Sheet', page: 'cheatsheet' },
    { h: '筆記（繁中 + English keywords）' },
    { href: '#/page/m1', icon: '📘', text: 'M1 Exploring the Network', page: 'm1' },
    { href: '#/page/m2', icon: '📗', text: 'M2 Protocols & Communications', page: 'm2' },
    { href: '#/page/m3a', icon: '📙', text: 'M3-I Devices & Switching', page: 'm3a' },
    { href: '#/page/m3b', icon: '📕', text: 'M3-II Collision & Broadcast', page: 'm3b' },
    { href: '#/page/review', icon: '📝', text: '官方 Review Q 詳解', page: 'review' },
    { h: '互動練習' },
    { href: '#/quiz/official', icon: '✍️', text: '官方 Review Q（28 題）', key: 'quiz/official' },
    { href: '#/quiz/extra', icon: '🧪', text: '額外練習題（66 題）', key: 'quiz/extra' },
    { href: '#/quiz/mixed', icon: '🎲', text: '模擬測驗（隨機 25 題）', key: 'quiz/mixed' },
    { href: '#/quiz/wrong', icon: '📕', text: '錯題本', key: 'quiz/wrong' },
    { href: '#/domains', icon: '🔢', text: 'Domain 計數訓練', key: 'domains' },
    { href: '#/switch', icon: '🔀', text: 'Switch 決策模擬', key: 'switch' },
    { href: '#/icons', icon: '🖼️', text: 'Device Icon 辨認', key: 'icons' },
    { href: '#/flash', icon: '🃏', text: 'Flashcards', key: 'flash' },
  ];

  function renderSidebar(activeKey) {
    const studied = store.get('studied', []);
    const notePages = D.pages.map((p) => p.id);
    const done = notePages.filter((id) => studied.includes(id)).length;
    const wrong = store.get('wrong', []).length;
    let html = `<div class="progress">筆記進度：${done} / ${notePages.length}<div class="bar"><span style="width:${(done / notePages.length) * 100}%"></span></div></div>`;
    NAV.forEach((n) => {
      if (n.h) { html += `<h4>${n.h}</h4>`; return; }
      const key = n.page ? 'page/' + n.page : n.key;
      const tick = n.page && studied.includes(n.page) ? '<span class="tick">✔</span>' : (n.key === 'quiz/wrong' && wrong ? `<span class="tick" style="color:#f87171">${wrong}</span>` : '');
      html += `<a href="${n.href}" class="${key === activeKey ? 'active' : ''}"><span>${n.icon}</span><span>${n.text}</span>${tick}</a>`;
    });
    $('#sidebar').innerHTML = html;
  }

  // ---------------------------------------------------------------- router
  function route() {
    const raw = location.hash.slice(1) || '/';
    const [pathPart, query] = raw.split('?');
    const parts = pathPart.split('/').filter(Boolean);
    const params = new URLSearchParams(query || '');
    setDrawer(false);
    let key = 'home';
    if (!parts.length) home();
    else if (parts[0] === 'page') { key = 'page/' + parts[1]; notePage(parts[1], params.get('hl')); }
    else if (parts[0] === 'quiz') { key = 'quiz/' + parts[1]; quizStart(parts[1], params.get('topic')); }
    else if (parts[0] === 'domains') { key = 'domains'; domainTrainer(); }
    else if (parts[0] === 'switch') { key = 'switch'; switchTrainer(); }
    else if (parts[0] === 'icons') { key = 'icons'; iconDrill(); }
    else if (parts[0] === 'flash') { key = 'flash'; flashcards(); }
    else if (parts[0] === 'search') { key = 'search'; searchPage(decodeURIComponent(parts.slice(1).join('/'))); }
    else home();
    renderSidebar(key);
    $$('#bottomnav a').forEach((a) => a.classList.toggle('active', key === a.dataset.key || (a.dataset.key === 'quiz' && key.startsWith('quiz'))));
    if (!params.get('hl')) window.scrollTo(0, 0);
  }

  function setDrawer(open) {
    $('#sidebar').classList.toggle('open', open);
    $('#backdrop').classList.toggle('show', open);
  }

  // ---------------------------------------------------------------- home
  function countdownText() {
    const ms = EXAM - new Date();
    if (ms <= 0) return 'Midterm 已開始 / 完成 —— 加油！';
    const d = Math.floor(ms / 864e5); const h = Math.floor((ms % 864e5) / 36e5); const m = Math.floor((ms % 36e5) / 6e4);
    return `⏳ 距離 Midterm：${d ? d + ' 日 ' : ''}${h} 小時 ${m} 分`;
  }

  function home() {
    const studied = store.get('studied', []);
    const best = store.get('best', {});
    const wrong = store.get('wrong', []);
    const known = store.get('flashKnown', []);
    const bestTxt = (k) => (best[k] != null ? `${best[k]}%` : '未做');
    const steps = [
      { href: '#/page/strategy', t: '睇考試攻略：範圍、答題技巧、教授提示', m: '5 分鐘', done: studied.includes('strategy') },
      { href: '#/page/m3b', t: 'M3-II：Collision / Broadcast domains + 教授數法', m: '20 分鐘 ⭐⭐⭐', done: studied.includes('m3b') },
      { href: '#/domains', t: '用 Domain 計數訓練做 5–10 幅圖', m: '15 分鐘 ⭐⭐⭐', done: false },
      { href: '#/page/m3a', t: 'M3-I：Devices、Switch flood/forward/filter、MAC、broadcast', m: '25 分鐘 ⭐⭐⭐', done: studied.includes('m3a') },
      { href: '#/switch', t: 'Switch 決策模擬：連續做 10 個 frames', m: '10 分鐘 ⭐⭐', done: false },
      { href: '#/icons', t: 'Device Icon 辨認（考試冇名，只有 icon！）', m: '3 分鐘 ⭐⭐', done: false },
      { href: '#/page/m2', t: 'M2：OSI 七層功能、PDU、Encapsulation、TCP/UDP、ACK/FCS', m: '20 分鐘 ⭐⭐', done: studied.includes('m2') },
      { href: '#/page/m1', t: 'M1：Components、Network types、Reliable networks', m: '20 分鐘 ⭐', done: studied.includes('m1') },
      { href: '#/quiz/official', t: '官方 28 題 Review Questions（互動）', m: `30 分鐘 · 最佳 ${bestTxt('official')}`, done: best.official != null },
      { href: '#/quiz/mixed', t: '模擬測驗 25 題 → 再做錯題本', m: `20 分鐘 · 最佳 ${bestTxt('mixed')}`, done: best.mixed != null },
      { href: '#/page/cheatsheet', t: '考前睇 Cheat Sheet', m: '考試前 15 分鐘', done: studied.includes('cheatsheet') },
    ];
    main.innerHTML = `<div style="max-width:1050px">
      <section class="hero">
        <h1>ISOM3180 Midterm 溫習站</h1>
        <p>Telecommunications and Computer Networking Management · Prof. Percy Dias</p>
        <p><b>${countdownText()}</b></p>
        <span class="pill">📅 27 Oct（二）10:30 sharp</span><span class="pill">🏫 Room 2303 / 2405</span><span class="pill">📝 100% MC · 約 70 分鐘</span><span class="pill">📚 Module 1–3</span>
      </section>
      <div class="grid">
        <div class="card"><h3>📖 筆記進度</h3><div class="stat">${studied.length} / ${D.pages.length}</div><p>每頁底部撳「標記為已溫習」</p></div>
        <div class="card"><h3>✍️ 官方 Review Q</h3><div class="stat">${bestTxt('official')}</div><p>額外練習：${bestTxt('extra')} · 模擬：${bestTxt('mixed')}</p></div>
        <a class="card" href="#/quiz/wrong"><h3>📕 錯題本</h3><div class="stat">${wrong.length}</div><p>答錯嘅題目自動加入；答啱就移除</p></a>
        <a class="card" href="#/flash"><h3>🃏 Flashcards</h3><div class="stat">${known.length} / ${D.flash.length}</div><p>已識嘅 keywords</p></a>
      </div>
      <h2 style="margin-top:28px">🗺️ 最短時間攞最高分：建議溫習路線（約 3 小時）</h2>
      <p style="color:var(--muted);margin-top:0">按出題比重排序 —— Module 3 佔官方 Review Questions 大約七成，所以排最前。</p>
      <ol class="route">${steps.map((s) => `<li class="${s.done ? 'done' : ''}"><div><a href="${s.href}"><b>${s.t}</b></a><div class="meta">${s.m}</div></div></li>`).join('')}</ol>
      <div class="grid">
        <a class="card" href="#/page/strategy"><h3>🎯 教授親口講嘅答題技巧</h3><p>「堂上冇講過嘅選項唔會係答案」、underline 關鍵字、icon 冇名……</p></a>
        <a class="card" href="#/domains"><h3>🔢 Domain 計數訓練</h3><p>官方題目圖 + 課堂大圖（15 個）+ 無限隨機圖，一撳顯示答案同顏色分區。</p></a>
        <a class="card" href="#/switch"><h3>🔀 Switch 決策模擬</h3><p>Source 學 table、destination 做決定：flood / forward / filter。</p></a>
      </div>
    </div>`;
  }

  // ---------------------------------------------------------------- note pages
  function notePage(id, hl) {
    const p = D.pages.find((x) => x.id === id);
    if (!p) { home(); return; }
    const studied = store.get('studied', []);
    const idx = D.pages.indexOf(p);
    const prev = D.pages[idx - 1]; const next = D.pages[idx + 1];
    const isDone = studied.includes(id);
    const tocLinks = p.toc.map((t) => `<a class="l${t.level}" href="#/page/${id}" data-goto="${t.id}">${esc(t.text)}</a>`).join('');
    main.innerHTML = `<div class="page-wrap">
      <article class="content"><details class="mtoc"><summary>📑 本頁目錄（撳開跳去任何部分）</summary>${tocLinks}</details>${p.html}
        <div class="page-actions">
          <button class="btn ${isDone ? 'good' : ''}" id="studyBtn">${isDone ? '✅ 已溫習（撳一下取消）' : '☐ 標記為已溫習'}</button>
          <span>${prev ? `<a class="btn" href="#/page/${prev.id}">← ${esc(prev.title)}</a> ` : ''}${next ? `<a class="btn primary" href="#/page/${next.id}">${esc(next.title)} →</a>` : ''}</span>
        </div>
      </article>
      <aside class="toc"><b>本頁目錄</b>${tocLinks}</aside>
    </div>`;
    $$('.exhibit[data-diagram]', main).forEach((el) => {
      el.innerHTML = G.exhibit(el.dataset.diagram);
      el.insertAdjacentHTML('afterend', '<p class="swipe-hint">↔ 圖太闊可以左右滑動</p>');
    });
    $('#studyBtn').onclick = () => {
      const s = store.get('studied', []);
      store.set('studied', s.includes(id) ? s.filter((x) => x !== id) : s.concat(id));
      notePage(id); renderSidebar('page/' + id);
    };
    $$('a[data-goto]', main).forEach((a) => {
      a.onclick = (e) => {
        e.preventDefault();
        const t = document.getElementById(a.dataset.goto);
        const box = a.closest('details'); if (box) box.open = false;
        if (t) t.scrollIntoView({ behavior: 'smooth' });
      };
    });
    // persistent checklist boxes
    const saved = store.get('check.' + id, []);
    $$('li.todo input', main).forEach((cb, i) => {
      cb.checked = saved.includes(i);
      cb.onchange = () => { const s = store.get('check.' + id, []).filter((x) => x !== i); if (cb.checked) s.push(i); store.set('check.' + id, s); };
    });
    if (hl) highlightIn($('.content', main), hl);
  }

  function highlightIn(root, term) {
    const needle = term.toLowerCase(); if (!needle) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = []; let n;
    while ((n = walker.nextNode())) if (n.nodeValue.toLowerCase().includes(needle)) nodes.push(n);
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment(); const text = node.nodeValue; const low = text.toLowerCase();
      let pos = 0; let k;
      while ((k = low.indexOf(needle, pos)) >= 0) {
        frag.appendChild(document.createTextNode(text.slice(pos, k)));
        const m = document.createElement('mark'); m.textContent = text.slice(k, k + needle.length); frag.appendChild(m);
        pos = k + needle.length;
      }
      frag.appendChild(document.createTextNode(text.slice(pos)));
      node.parentNode.replaceChild(frag, node);
    });
    const first = $('mark', root); if (first) setTimeout(() => first.scrollIntoView({ block: 'center' }), 50);
  }

  // ---------------------------------------------------------------- search
  function searchPage(q) {
    const box = $('#searchBox'); if (box.value !== q) box.value = q;
    const needle = q.trim().toLowerCase();
    let html = `<div class="content" style="max-width:900px"><h1>🔍 搜尋：「${esc(q)}」</h1>`;
    if (!needle) { main.innerHTML = html + '<p>輸入關鍵字開始搜尋。</p></div>'; return; }
    let total = 0;
    D.pages.forEach((p) => {
      const low = p.text.toLowerCase(); const hits = []; let pos = 0; let k;
      while ((k = low.indexOf(needle, pos)) >= 0 && hits.length < 4) { hits.push(k); pos = k + needle.length + 60; }
      if (!hits.length) return;
      let count = 0; pos = 0; while ((k = low.indexOf(needle, pos)) >= 0) { count++; pos = k + needle.length; }
      total += count;
      const snips = hits.map((h) => {
        const s = Math.max(0, h - 50); const e = Math.min(p.text.length, h + needle.length + 70);
        const piece = esc(p.text.slice(s, e));
        const re = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');
        return '…' + piece.replace(re, (m) => `<mark>${m}</mark>`) + '…';
      });
      html += `<div class="result"><a href="#/page/${p.id}?hl=${encodeURIComponent(q.trim())}"><b>${p.icon} ${esc(p.title)}</b></a> <span class="kbd">（${count} 處）</span>${snips.map((s) => `<div class="snip">${s}</div>`).join('')}</div>`;
    });
    const fl = D.flash.filter((f) => (f.f + ' ' + f.b).toLowerCase().includes(needle));
    if (fl.length) html += `<h2>🃏 Flashcards（${fl.length}）</h2>` + fl.map((f) => `<div class="result"><b>${esc(f.f)}</b><div class="snip">${f.b}</div></div>`).join('');
    const qs = ALLQ.filter((x) => (x.q + ' ' + x.options.join(' ') + ' ' + x.explain).toLowerCase().includes(needle));
    if (qs.length) html += `<h2>✍️ 相關題目（${qs.length}）</h2>` + qs.map((x) => `<div class="result"><b>${x.id.startsWith('R') ? '官方 Q' + parseInt(x.id.slice(1), 10) : '練習 ' + x.id}</b>：${esc(x.q)}<div class="snip">答案：${x.answer.map((i) => LETTERS[i] + '. ' + esc(x.options[i])).join('；')}</div></div>`).join('');
    if (!total && !fl.length && !qs.length) html += '<p>搵唔到結果。試吓英文 keyword（例如 collision、FCS、OUI）。</p>';
    main.innerHTML = html + '</div>';
  }

  // ---------------------------------------------------------------- quiz engine
  let Q = null;
  const MODE_NAME = { official: '✍️ 官方 Review Questions', extra: '🧪 額外練習題', mixed: '🎲 模擬測驗（隨機 25 題）', wrong: '📕 錯題本', retry: '🔁 重做今次錯題' };

  function quizStart(mode, topic) {
    let list;
    if (mode === 'official') list = D.official.slice();
    else if (mode === 'extra') list = D.extra.slice();
    else if (mode === 'mixed') list = shuffle(ALLQ).slice(0, 25);
    else if (mode === 'wrong') { const w = store.get('wrong', []); list = w.map(qById).filter(Boolean); }
    else if (mode === 'retry' && Q && Q.lastWrong) list = Q.lastWrong.map(qById).filter(Boolean);
    else list = D.official.slice();
    if (topic && topic !== 'all') list = list.filter((q) => q.topic === topic);
    Q = { mode, topic: topic || 'all', list, i: 0, answers: {}, selected: [], lastWrong: Q && Q.lastWrong };
    if (!list.length) {
      main.innerHTML = `<div class="qcard" style="max-width:820px"><h2>${MODE_NAME[mode] || '題目'}</h2><p>${mode === 'wrong' ? '🎉 錯題本係空嘅！做完其他練習，答錯嘅題目會自動加入呢度。' : '呢個分類冇題目。'}</p><a class="btn primary" href="#/quiz/mixed">去做模擬測驗</a></div>`;
      return;
    }
    renderQuestion();
  }

  function topicSelect() {
    if (Q.mode === 'retry') return '';
    const opts = [['all', '全部 Module'], ['M1', 'Module 1'], ['M2', 'Module 2'], ['M3a', 'Module 3-I'], ['M3b', 'Module 3-II']];
    return `<select id="topicSel" class="iconbtn">${opts.map(([v, t]) => `<option value="${v}" ${Q.topic === v ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
  }

  function renderQuestion() {
    const q = Q.list[Q.i]; const n = Q.list.length;
    const multi = q.answer.length > 1;
    const a = Q.answers[q.id];
    const score = Object.values(Q.answers).filter((x) => x.ok).length;
    const answered = Object.keys(Q.answers).length;
    const label = q.id.startsWith('R') ? `官方 Review Q${parseInt(q.id.slice(1), 10)}` : `練習 ${q.id}`;
    let opts = '';
    q.options.forEach((o, i) => {
      let cls = '';
      if (a) { if (q.answer.includes(i)) cls = 'correct'; else if (a.chosen.includes(i)) cls = 'wrong'; }
      else if (Q.selected.includes(i)) cls = 'selected';
      opts += `<button class="opt ${cls}" data-i="${i}" ${a ? 'disabled' : ''}><span class="letter">${LETTERS[i]}</span><span>${esc(o)}</span></button>`;
    });
    main.innerHTML = `<div style="max-width:880px">
      <div class="quiz-head"><h2 style="margin:0">${MODE_NAME[Q.mode] || ''}</h2><div class="toolbar">${topicSelect()}<span class="kbd">得分 ${score} / ${answered}</span></div></div>
      <div class="kbd">第 ${Q.i + 1} / ${n} 題</div>
      <div class="progressline"><span style="width:${((Q.i + (a ? 1 : 0)) / n) * 100}%"></span></div>
      <div class="qcard">
        <div class="qmeta">${label} · ${TOPIC[q.topic] || ''}${multi ? ` · <b style="color:var(--warn)">選 ${q.answer.length} 個答案</b>` : ''}</div>
        <div class="qtext">${esc(q.q)}</div>
        ${exhibitHtml(q)}
        <div class="opts">${opts}</div>
        ${a ? `<div class="explain ${a.ok ? 'ok' : 'no'}"><div class="verdict">${a.ok ? '✅ 答啱！' : '❌ 答錯'} · 正確答案：${q.answer.map((i) => LETTERS[i]).join(', ')}</div>${q.explain}</div>` : ''}
        <div class="qnav">
          <button class="btn" id="prevQ" ${Q.i === 0 ? 'disabled' : ''}>← 上一題</button>
          ${!a && multi ? `<button class="btn primary" id="submitQ" ${Q.selected.length ? '' : 'disabled'}>提交答案</button>` : ''}
          ${a ? `<button class="btn primary" id="nextQ">${Q.i === n - 1 ? '睇結果 🏁' : '下一題 →'}</button>` : ''}
        </div>
        <div class="kbd" style="margin-top:8px">快捷鍵：A–F 或 1–6 揀答案 · Enter 提交 / 下一題 · ← → 前後</div>
      </div></div>`;
    $$('.opt', main).forEach((b) => { b.onclick = () => chooseOption(parseInt(b.dataset.i, 10)); });
    if ($('#prevQ')) $('#prevQ').onclick = () => { if (Q.i > 0) { Q.i--; Q.selected = []; renderQuestion(); } };
    if ($('#nextQ')) $('#nextQ').onclick = nextQuestion;
    if ($('#submitQ')) $('#submitQ').onclick = () => grade(Q.selected.slice());
    if ($('#topicSel')) $('#topicSel').onchange = (e) => { location.hash = `#/quiz/${Q.mode}?topic=${e.target.value}`; };
  }

  function chooseOption(i) {
    const q = Q.list[Q.i]; if (Q.answers[q.id] || i >= q.options.length) return;
    if (q.answer.length > 1) {
      Q.selected = Q.selected.includes(i) ? Q.selected.filter((x) => x !== i) : Q.selected.concat(i);
      renderQuestion();
    } else grade([i]);
  }

  function grade(chosen) {
    const q = Q.list[Q.i];
    const ok = chosen.length === q.answer.length && chosen.every((c) => q.answer.includes(c));
    Q.answers[q.id] = { chosen, ok };
    Q.selected = [];
    const wrong = new Set(store.get('wrong', []));
    if (!ok) wrong.add(q.id); else if (Q.mode === 'wrong' || Q.mode === 'retry') wrong.delete(q.id);
    store.set('wrong', [...wrong]);
    renderQuestion();
    renderSidebar('quiz/' + Q.mode);
  }

  function nextQuestion() {
    if (Q.i < Q.list.length - 1) { Q.i++; Q.selected = []; renderQuestion(); window.scrollTo(0, 0); } else quizResult();
  }

  function quizResult() {
    const n = Q.list.length; const ok = Q.list.filter((q) => Q.answers[q.id] && Q.answers[q.id].ok).length;
    const pct = Math.round((ok / n) * 100);
    if (['official', 'extra', 'mixed'].includes(Q.mode) && Q.topic === 'all') {
      const best = store.get('best', {}); if (best[Q.mode] == null || pct > best[Q.mode]) best[Q.mode] = pct; store.set('best', best);
    }
    const wrongQs = Q.list.filter((q) => !(Q.answers[q.id] && Q.answers[q.id].ok));
    Q.lastWrong = wrongQs.map((q) => q.id);
    const msg = pct >= 90 ? '🏆 勁！考試穩陣' : pct >= 75 ? '👍 唔錯！再溫錯題就完美' : pct >= 50 ? '💪 有進步空間，睇解釋再做錯題' : '📖 建議先返去睇筆記再做';
    main.innerHTML = `<div style="max-width:880px"><div class="qcard" style="text-align:center">
        <h2>${MODE_NAME[Q.mode] || ''} —— 完成！</h2><div class="result-big">${ok} / ${n}</div><p style="font-size:20px">${pct}% · ${msg}</p>
        <div class="toolbar" style="justify-content:center">
          ${wrongQs.length ? '<button class="btn primary" id="retryWrong">🔁 重做今次錯咗嘅題目</button>' : ''}
          <a class="btn" href="#/quiz/${Q.mode === 'retry' ? 'wrong' : Q.mode}" id="again">再做一次</a>
          <a class="btn" href="#/quiz/mixed">🎲 隨機模擬</a><a class="btn" href="#/">返主頁</a>
        </div></div>
      <div class="wronglist">${wrongQs.length ? '<h2>❌ 錯咗嘅題目（附解釋）</h2>' : '<h2>🎉 全部答啱！</h2>'}
      ${wrongQs.map((q) => `<div class="qcard"><div class="qmeta">${q.id.startsWith('R') ? '官方 Q' + parseInt(q.id.slice(1), 10) : '練習 ' + q.id} · ${TOPIC[q.topic]}</div><div class="qtext">${esc(q.q)}</div>
        ${exhibitHtml(q)}
        <div>你揀：${Q.answers[q.id] ? Q.answers[q.id].chosen.map((i) => LETTERS[i]).join(', ') || '—' : '—'} · 正確：<b>${q.answer.map((i) => LETTERS[i] + '. ' + esc(q.options[i])).join('；')}</b></div>
        <div class="explain no">${q.explain}</div></div>`).join('')}</div></div>`;
    if ($('#retryWrong')) $('#retryWrong').onclick = () => { if (location.hash !== '#/quiz/retry') location.hash = '#/quiz/retry'; else quizStart('retry'); };
    $('#again').onclick = (e) => { e.preventDefault(); quizStart(Q.mode === 'retry' ? 'wrong' : Q.mode, Q.topic); };
    window.scrollTo(0, 0);
  }

  // ---------------------------------------------------------------- domain trainer
  const DT = { id: 'q02', topo: null, showTypes: false, hl: null, checked: null };

  function domainTrainer() {
    if (!DT.topo) DT.topo = G.TOPOS.find((t) => t.id === DT.id);
    const t = DT.topo;
    const out = G.render(t, { highlight: DT.hl, showTypes: DT.showTypes });
    const cAns = G.computeDomains(t, 'collision').length; const bAns = G.computeDomains(t, 'broadcast').length;
    const list = out.groups ? `<h3>${DT.hl === 'collision' ? 'Collision' : 'Broadcast'} domains（${out.groups.length} 個）</h3><ol class="domain-list">${out.groups.map((g, gi) => `<li><span class="swatch" style="background:${G.PALETTE[gi % G.PALETTE.length]}"></span>${esc(G.describeGroup(t, g))}</li>`).join('')}</ol>` : '';
    let verdict = '';
    if (DT.checked) {
      const [c, b] = DT.checked;
      verdict = `<div class="explain ${c === cAns && b === bAns ? 'ok' : 'no'}"><div class="verdict">${c === cAns ? '✅' : '❌'} Collision domains：你答 ${Number.isNaN(c) ? '—' : c}，正確 <b>${cAns}</b> &nbsp;&nbsp; ${b === bAns ? '✅' : '❌'} Broadcast domains：你答 ${Number.isNaN(b) ? '—' : b}，正確 <b>${bAns}</b></div>撳下面掣用顏色睇每個 domain 嘅範圍。</div>`;
    }
    main.innerHTML = `<div class="trainer" style="max-width:1100px">
      <h1 style="margin:0">🔢 Collision / Broadcast Domain 計數訓練</h1>
      <details class="card"><summary><b>📌 教授嘅系統化數法（撳開睇）</b></summary>
        <ol><li><b>Collision</b>：tick 所有 <b>Switch、Bridge、Router</b>（L2 + L3）。</li>
        <li>由第一部 tick device 嘅每個 interface 沿線行，<b>直到盡頭或撞到另一部 tick device</b> = 1 個 collision domain（hub、repeater、bus 唔會截停）。做完個 device 打 ✗，去下一部，數過嘅線唔好重複數。</li>
        <li><b>Broadcast</b>：只 tick <b>Router</b>，同樣方法數；冇 router = 1 個。</li>
        <li>Cloud（Internet）連 router 嘅 WAN link、FDDI / Token Ring 都當一條線計。</li></ol></details>
      <div class="toolbar">
        <select id="topoSel">${G.TOPOS.filter((x) => !x.hidden).map((x) => `<option value="${x.id}" ${t.id === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}${t.id === 'random' ? '<option value="random" selected>🎲 隨機網絡</option>' : ''}</select>
        <button class="btn" id="randBtn">🎲 隨機新圖</button>
        <label><input type="checkbox" id="typeChk" ${DT.showTypes ? 'checked' : ''}> 顯示裝置名稱（考試冇名！）</label>
      </div>
      <div class="diagram">${out.svg}</div><p class="swipe-hint">↔ 圖太闊可以左右滑動睇全圖</p>
      <div class="toolbar">
        <label>Collision domains：<input type="number" id="cIn" min="0" value="${DT.checked && !Number.isNaN(DT.checked[0]) ? DT.checked[0] : ''}"></label>
        <label>Broadcast domains：<input type="number" id="bIn" min="0" value="${DT.checked && !Number.isNaN(DT.checked[1]) ? DT.checked[1] : ''}"></label>
        <button class="btn primary" id="checkBtn">對答案</button>
        <button class="btn" id="showC">🎨 顯示 Collision domains</button>
        <button class="btn" id="showB">🎨 顯示 Broadcast domains</button>
        ${DT.hl ? '<button class="btn" id="hideHl">隱藏顏色</button>' : ''}
      </div>
      ${verdict}${list ? `<div class="card">${list}</div>` : ''}
      <p class="kbd">Icon 提示：圓形 = Router；盒 4 箭 = Switch；盒 1 箭 = Hub；盒冇箭 = Repeater；彎形 = Bridge；紅色 Z 線 = WAN serial link。</p>
    </div>`;
    $('#topoSel').onchange = (e) => { if (e.target.value === 'random') return; DT.id = e.target.value; DT.topo = G.TOPOS.find((x) => x.id === DT.id); DT.hl = null; DT.checked = null; domainTrainer(); };
    $('#randBtn').onclick = () => { DT.topo = G.randomTopo(); DT.id = 'random'; DT.hl = null; DT.checked = null; domainTrainer(); };
    $('#typeChk').onchange = (e) => { DT.showTypes = e.target.checked; domainTrainer(); };
    $('#checkBtn').onclick = () => { DT.checked = [parseInt($('#cIn').value, 10), parseInt($('#bIn').value, 10)]; domainTrainer(); };
    $('#showC').onclick = () => { DT.hl = 'collision'; domainTrainer(); };
    $('#showB').onclick = () => { DT.hl = 'broadcast'; domainTrainer(); };
    if ($('#hideHl')) $('#hideHl').onclick = () => { DT.hl = null; domainTrainer(); };
  }

  // ---------------------------------------------------------------- switch trainer
  let ST = null;
  const SPOTS = {
    E0: { pc: [130, 200], hub: [200, 200], hosts: [[80, 110], [80, 300]] },
    E1: { pc: [380, 50], hub: [380, 100], hosts: [[260, 40], [500, 40]] },
    E2: { pc: [630, 200], hub: [560, 200], hosts: [[680, 110], [680, 300]] },
    E3: { pc: [380, 360], hub: [380, 310], hosts: [[260, 380], [500, 380]] },
  };
  const fmtTime = (m) => { const t = 10 * 60 + 30 + m; return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };

  function newSwitchScenario() {
    const ports = ['E0', 'E1', 'E2', 'E3'];
    const kinds = ports.map(() => (Math.random() < 0.3 ? 'hub' : 'pc'));
    if (!kinds.includes('hub')) kinds[rnd(4)] = 'hub';
    const nodes = [{ id: 'sw', t: 'switch', x: 380, y: 200 }]; const links = []; const hosts = [];
    let letter = 0;
    ports.forEach((p, i) => {
      const s = SPOTS[p];
      if (kinds[i] === 'pc') {
        const name = String.fromCharCode(65 + letter++);
        nodes.push({ id: name, t: 'pc', x: s.pc[0], y: s.pc[1], label: name }); links.push(['sw', name, { port: p }]);
        hosts.push({ name, port: p, hub: false });
      } else {
        const hid = 'hub' + p; nodes.push({ id: hid, t: 'hub', x: s.hub[0], y: s.hub[1] }); links.push(['sw', hid, { port: p }]);
        s.hosts.forEach((h) => { const name = String.fromCharCode(65 + letter++); nodes.push({ id: name, t: 'pc', x: h[0], y: h[1], label: name }); links.push([hid, name]); hosts.push({ name, port: p, hub: true }); });
      }
    });
    const table = {};
    hosts.forEach((h) => { if (Math.random() < 0.35) table[h.name] = { port: h.port, time: -rnd(4) - 1 }; });
    ST = { topo: { w: 760, h: 420, nodes, links }, hosts, table, clock: 0, frame: null, right: 0, total: 0, streak: 0, changed: null };
    nextFrame();
  }

  function nextFrame() {
    const src = pick(ST.hosts);
    const dst = Math.random() < 0.15 ? null : pick(ST.hosts.filter((h) => h !== src));
    ST.clock += 1; ST.changed = null;
    const known = !!ST.table[src.name];
    const dstEntry = dst && ST.table[dst.name];
    let decision; let outPort = null;
    if (!dst || !dstEntry) decision = 0; else if (dstEntry.port === src.port) decision = 2; else { decision = 1; outPort = dstEntry.port; }
    const fwdPort = outPort || (dst && dst.port !== src.port ? dst.port : pick(['E0', 'E1', 'E2', 'E3'].filter((p) => p !== src.port)));
    ST.frame = { src, dst, known, decision, fwdPort, a1: null, a2: null };
  }

  function switchTrainer() {
    if (!ST) newSwitchScenario();
    const f = ST.frame; const srcMac = 'MAC-' + f.src.name; const dstMac = f.dst ? 'MAC-' + f.dst.name : 'FF-FF-FF-FF-FF-FF';
    const q1 = [`將 ${srcMac} 加入 table → ${f.src.port}`, `更新 ${srcMac} 嘅 timestamp（已經喺 table）`, `將 ${dstMac} 加入 table`, 'Table 唔使改'];
    const q1Ans = f.known ? 1 : 0;
    const q2 = [`Flood：送去除 ${f.src.port} 以外所有 ports`, `Forward：只送去 ${f.fwdPort}`, 'Filter：唔轉發（do nothing）'];
    const answeredBoth = f.a1 != null && f.a2 != null;
    const rows = Object.entries(ST.table).sort((a, b) => a[0].localeCompare(b[0]))
      .map(([n, e]) => `<tr class="${ST.changed && ST.changed.name === n ? ST.changed.kind : ''}"><td>MAC-${n}</td><td>${e.port}</td><td>${fmtTime(e.time)}</td></tr>`).join('');
    const optBtns = (arr, sel, ans, q) => arr.map((o, i) => {
      let cls = ''; if (sel != null) { if (i === ans) cls = 'correct'; else if (i === sel) cls = 'wrong'; }
      return `<button class="opt ${cls}" data-q="${q}" data-i="${i}" ${sel != null ? 'disabled' : ''}><span class="letter">${LETTERS[i]}</span><span>${esc(o)}</span></button>`;
    }).join('');
    let explain = '';
    if (answeredBoth) {
      const sameHub = ST.hosts.filter((h) => h.hub && h.port === f.src.port && h !== f.src).map((h) => h.name);
      let viaSwitch = [];
      if (f.decision === 0) viaSwitch = ST.hosts.filter((h) => h.port !== f.src.port).map((h) => h.name);
      else if (f.decision === 1) viaSwitch = ST.hosts.filter((h) => h.port === f.fwdPort).map((h) => h.name);
      const reach = [...new Set(sameHub.concat(viaSwitch))].sort();
      const why = !f.dst ? 'Destination 係 <b>broadcast（FF-FF-FF-FF-FF-FF）</b>→ 永遠 <b>flood</b>。'
        : !ST.table[f.dst.name] || (ST.changed && ST.changed.name === f.dst.name) ? `${dstMac} <b>唔喺 table</b>（unknown unicast）→ <b>flood</b>。`
          : f.decision === 2 ? `${dstMac} 喺 table，port = ${f.src.port}，同 frame 入嚟嘅 port 一樣 → <b>filter</b>（目的地已經喺同一 segment 收到）。`
            : `${dstMac} 喺 table，port = ${f.fwdPort} ≠ 入嚟嘅 ${f.src.port} → <b>forward</b> 只去 ${f.fwdPort}。`;
      explain = `<div class="explain ${f.a1 === q1Ans && f.a2 === f.decision ? 'ok' : 'no'}">
        <div class="verdict">${f.a1 === q1Ans && f.a2 === f.decision ? '✅ 兩題都啱！' : '❌ 再睇吓解釋'}</div>
        ① <b>Learning 只睇 source</b>：${srcMac} 由 <b>${f.src.port}</b> 入 → ${f.known ? '已經喺 table → <b>update timestamp</b>' : '<b>加入 table</b>'}（dynamic）。<br>
        ② <b>Decision 只睇 destination</b>：${why}<br>
        ③ 實際收到電訊號嘅 hosts：<b>${reach.join(', ') || '（冇其他）'}</b>${sameHub.length ? `（${sameHub.join(', ')} 同 ${f.src.name} 喺同一部 hub，hub 一定 flood 俾佢哋）` : ''}。${f.dst ? `只有 <b>${f.dst.name}</b> 會 de-encapsulate 上去處理，其他 NIC 見 destination MAC 唔係自己就 discard。` : '因為係 broadcast，全部收到嘅 hosts 都會處理。'}
      </div>`;
    }
    main.innerHTML = `<div class="trainer" style="max-width:1100px">
      <h1 style="margin:0">🔀 Switch 決策模擬（MAC address table）</h1>
      <p class="kbd" style="margin:0">黃金規則：<b>Source MAC → 學 table（加入 / update timestamp）</b>；<b>Destination MAC → 做決定（flood / forward / filter）</b>。連續做落去，table 會慢慢建立。</p>
      <div class="two-col">
        <div><div class="diagram">${G.render(ST.topo, { portLabels: true }).svg}</div><p class="swipe-hint">↔ 左右滑動睇全圖</p></div>
        <div class="card"><h3>MAC Address Table（CAM）</h3>
          <table class="mac-table"><tr><th>MAC address</th><th>Port</th><th>Timestamp</th></tr>${rows || '<tr><td colspan="3" style="color:var(--muted)">（Empty）</td></tr>'}</table>
          <p class="kbd">而家時間：${fmtTime(ST.clock)} · 得分 <span class="streak">${ST.right} / ${ST.total}</span> · 連勝 ${ST.streak}</p></div>
      </div>
      <div class="qcard">
        <div class="frame">📦 Frame：Source = <b>${srcMac}</b> · Destination = <b>${dstMac}</b> · 由 <b>${f.src.port}</b> 入 switch${f.src.hub ? '（經 hub）' : ''}</div>
        <h3>① Switch 點樣處理 MAC table？</h3><div class="opts">${optBtns(q1, f.a1, q1Ans, 1)}</div>
        <h3>② Switch 嘅決定係？</h3><div class="opts">${optBtns(q2, f.a2, f.decision, 2)}</div>
        ${explain}
        <div class="qnav"><button class="btn" id="resetSw">🔄 新網絡</button>${answeredBoth ? '<button class="btn primary" id="nextFrame">下一個 frame ▶</button>' : ''}</div>
      </div></div>`;
    $$('.opt', main).forEach((b) => {
      b.onclick = () => {
        const q = parseInt(b.dataset.q, 10); const i = parseInt(b.dataset.i, 10);
        if (q === 1 && f.a1 == null) f.a1 = i; if (q === 2 && f.a2 == null) f.a2 = i;
        if (f.a1 != null && f.a2 != null && !f.scored) {
          f.scored = true; ST.total++;
          if (f.a1 === q1Ans && f.a2 === f.decision) { ST.right++; ST.streak++; } else ST.streak = 0;
          const existed = !!ST.table[f.src.name];
          ST.table[f.src.name] = { port: f.src.port, time: ST.clock };
          ST.changed = { name: f.src.name, kind: existed ? 'upd' : 'new' };
        }
        switchTrainer();
      };
    });
    $('#resetSw').onclick = () => { newSwitchScenario(); switchTrainer(); };
    if ($('#nextFrame')) $('#nextFrame').onclick = () => { nextFrame(); switchTrainer(); };
  }

  // ---------------------------------------------------------------- icon drill
  const ICON_INFO = {
    router: ['Router', 'Layer 3 · <b>圓形</b> · 用 IP（logical）address · 分隔 collision <b>同</b> broadcast domains · 唔會 flood'],
    switch: ['Switch', 'Layer 2 · <b>盒 + 4 個箭咀</b> · 用 MAC address · flood / forward / filter · 每個 port 一個 collision domain'],
    hub: ['Hub', 'Layer 1 · <b>盒 + 1 個箭咀</b>（盒邊一排 ports）· multiport repeater · flood 所有 ports · 唔分隔任何 domain'],
    repeater: ['Repeater', 'Layer 1 · <b>盒冇箭咀</b> · regenerate signals · 延長距離 · 唔分隔任何 domain'],
    bridge: ['Bridge', 'Layer 2 · <b>彎曲 / 凹形</b> · 用 MAC address · 分隔 collision domains（唔分 broadcast）'],
    cloud: ['Cloud', '雲入面可以係<b>任何嘢</b>（PC、server、router、repeater…）'],
  };
  const ID = { cur: null, ans: null, right: 0, total: 0 };
  function iconDrill() {
    const types = Object.keys(ICON_INFO);
    if (!ID.cur) { ID.cur = pick(types); ID.ans = null; }
    const opts = types.map((t, i) => {
      let cls = ''; if (ID.ans != null) { if (t === ID.cur) cls = 'correct'; else if (t === ID.ans) cls = 'wrong'; }
      return `<button class="opt ${cls}" data-t="${t}" ${ID.ans != null ? 'disabled' : ''}><span class="letter">${LETTERS[i]}</span><span>${ICON_INFO[t][0]}</span></button>`;
    }).join('');
    main.innerHTML = `<div class="trainer" style="max-width:760px">
      <h1 style="margin:0">🖼️ Device Icon 辨認</h1>
      <p class="kbd">🗣️ 教授：「考試只會畫 icon，唔會寫名。」得分 <span class="streak">${ID.right} / ${ID.total}</span></p>
      <div class="icon-stage">${G.iconSVG(ID.cur, 300)}</div>
      <div class="opts">${opts}</div>
      ${ID.ans != null ? `<div class="explain ${ID.ans === ID.cur ? 'ok' : 'no'}"><div class="verdict">${ID.ans === ID.cur ? '✅ 啱！' : '❌ 錯'}：呢個係 <b>${ICON_INFO[ID.cur][0]}</b></div>${ICON_INFO[ID.cur][1]}</div><div class="qnav"><span></span><button class="btn primary" id="nextIcon">下一個 ▶</button></div>` : ''}
      <div class="card"><h3>全部 icons 對照</h3><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr));margin-top:6px">
        ${types.map((t) => `<div style="text-align:center">${G.iconSVG(t, 120)}<div><b>${ICON_INFO[t][0]}</b></div></div>`).join('')}</div></div>
    </div>`;
    $$('.opt', main).forEach((b) => { b.onclick = () => { ID.ans = b.dataset.t; ID.total++; if (ID.ans === ID.cur) ID.right++; iconDrill(); }; });
    if ($('#nextIcon')) $('#nextIcon').onclick = () => { let t; do { t = pick(types); } while (t === ID.cur); ID.cur = t; ID.ans = null; iconDrill(); };
  }

  // ---------------------------------------------------------------- flashcards
  const FC = { topic: 'all', onlyUnknown: false, order: null, i: 0, flipped: false };
  function fcList() {
    const known = store.get('flashKnown', []);
    let list = D.flash.map((c, idx) => Object.assign({ idx }, c));
    if (FC.topic !== 'all') list = list.filter((c) => c.t === FC.topic);
    if (FC.onlyUnknown) list = list.filter((c) => !known.includes(c.idx));
    if (FC.order) list = FC.order.map((i) => list.find((c) => c.idx === i)).filter(Boolean).concat(list.filter((c) => !FC.order.includes(c.idx)));
    return list;
  }
  function flashcards() {
    const list = fcList(); const known = store.get('flashKnown', []);
    if (FC.i >= list.length) FC.i = 0;
    const c = list[FC.i];
    main.innerHTML = `<div class="trainer" style="max-width:820px">
      <h1 style="margin:0">🃏 Flashcards（English keyword ↔ 中文解釋）</h1>
      <div class="toolbar">
        <select id="fcTopic">${[['all', '全部'], ['M1', 'Module 1'], ['M2', 'Module 2'], ['M3a', 'Module 3-I'], ['M3b', 'Module 3-II']].map(([v, t]) => `<option value="${v}" ${FC.topic === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
        <label><input type="checkbox" id="fcUnknown" ${FC.onlyUnknown ? 'checked' : ''}> 只顯示未識</label>
        <button class="btn" id="fcShuffle">🔀 洗牌</button>
        <span class="kbd">已識 ${known.length} / ${D.flash.length}</span>
      </div>
      ${c ? `<div class="flash ${FC.flipped ? 'flipped' : ''}" id="fcCard"><div class="flash-inner">
          <div class="flash-face front"><span class="tag">${TOPIC[c.t]} · ${FC.i + 1} / ${list.length}</span>${esc(c.f)}<div class="kbd" style="margin-top:14px;font-weight:400">撳卡 / 空白鍵 翻轉</div></div>
          <div class="flash-face back"><span class="tag">${esc(c.f)}</span><div>${c.b}</div></div></div></div>
        <div class="qnav"><button class="btn" id="fcPrev">← 上一張</button>
          <button class="btn ${known.includes(c.idx) ? 'good' : ''}" id="fcKnown">${known.includes(c.idx) ? '✅ 已識' : '我識 ✓（K）'}</button>
          <button class="btn primary" id="fcNext">下一張 →</button></div>`
    : '<div class="card">🎉 呢個分類全部已識！取消「只顯示未識」再溫一次。</div>'}
    </div>`;
    $('#fcTopic').onchange = (e) => { FC.topic = e.target.value; FC.i = 0; FC.flipped = false; flashcards(); };
    $('#fcUnknown').onchange = (e) => { FC.onlyUnknown = e.target.checked; FC.i = 0; FC.flipped = false; flashcards(); };
    $('#fcShuffle').onclick = () => { FC.order = shuffle(D.flash.map((_, i) => i)); FC.i = 0; FC.flipped = false; flashcards(); };
    if (!c) return;
    $('#fcCard').onclick = () => { FC.flipped = !FC.flipped; $('#fcCard').classList.toggle('flipped', FC.flipped); };
    $('#fcPrev').onclick = () => { FC.i = (FC.i - 1 + list.length) % list.length; FC.flipped = false; flashcards(); };
    $('#fcNext').onclick = () => { FC.i = (FC.i + 1) % list.length; FC.flipped = false; flashcards(); };
    $('#fcKnown').onclick = () => {
      const k = store.get('flashKnown', []);
      store.set('flashKnown', k.includes(c.idx) ? k.filter((x) => x !== c.idx) : k.concat(c.idx));
      if (FC.onlyUnknown) FC.flipped = false; flashcards();
    };
  }

  // ---------------------------------------------------------------- global UI
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, select, textarea')) return;
    const h = location.hash;
    if (h.startsWith('#/quiz') && Q && main.querySelector('.qcard .opts')) {
      const k = e.key.toLowerCase();
      let idx = -1;
      if (/^[1-9]$/.test(k)) idx = parseInt(k, 10) - 1; else if (/^[a-j]$/.test(k)) idx = LETTERS.toLowerCase().indexOf(k);
      if (idx >= 0) { chooseOption(idx); e.preventDefault(); return; }
      if (e.key === 'Enter') { const s = $('#submitQ') || $('#nextQ'); if (s && !s.disabled) { s.click(); e.preventDefault(); } return; }
      if (e.key === 'ArrowRight' && $('#nextQ')) { $('#nextQ').click(); return; }
      if (e.key === 'ArrowLeft' && $('#prevQ') && !$('#prevQ').disabled) { $('#prevQ').click(); return; }
    }
    if (h.startsWith('#/flash') && $('#fcCard')) {
      if (e.key === ' ') { $('#fcCard').click(); e.preventDefault(); } else if (e.key === 'ArrowRight') $('#fcNext').click();
      else if (e.key === 'ArrowLeft') $('#fcPrev').click(); else if (e.key.toLowerCase() === 'k') $('#fcKnown').click();
    }
  });

  document.addEventListener('click', (e) => {
    const img = e.target.closest('img.zoomable');
    if (img) { const lb = $('#lightbox'); lb.querySelector('img').src = img.src; lb.classList.add('show'); return; }
    if (e.target.closest('#lightbox')) $('#lightbox').classList.remove('show');
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('#lightbox').classList.remove('show'); });

  $('#menuBtn').onclick = () => setDrawer(!$('#sidebar').classList.contains('open'));
  $('#notesBtn').onclick = () => setDrawer(!$('#sidebar').classList.contains('open'));
  $('#backdrop').onclick = () => setDrawer(false);
  $('#toTop').onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  window.addEventListener('scroll', () => $('#toTop').classList.toggle('show', window.scrollY > 700), { passive: true });
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { /* offline cache optional */ });
  $('#themeBtn').onclick = () => {
    const dark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('isom3180.theme', dark ? 'dark' : 'light'); } catch (err) { /* storage unavailable */ }
  };
  let searchTimer = null;
  $('#searchBox').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    const v = e.target.value;
    searchTimer = setTimeout(() => { if (v.trim()) location.hash = '#/search/' + encodeURIComponent(v); }, 300);
  });
  const tick = () => { $('#countdown').textContent = countdownText(); };
  tick(); setInterval(tick, 30000);

  window.addEventListener('hashchange', route);
  route();
})();
