// =============================================================
//  画面
// =============================================================
(function () {
  const { wait, pick, shuffle, Settings, Speech, Cheer, Log, Timer } = window.CORE;
  const D = window.DATA;
  const A = window.ART;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const view = () => document.getElementById("view");
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------------- ルーター ----------------
  const routes = {};
  function go(path) { location.hash = "#/" + path; }
  function route() {
    Speech.stop();
    const parts = (location.hash.replace(/^#\/?/, "") || "").split("/").filter(Boolean);
    let key = parts[0] || "";
    if (!key) key = Settings.data.mode === "adult" ? "adult" : Settings.data.mode === "kids" ? "kids" : "start";
    const fn = routes[key] || routes.start;
    document.body.dataset.route = key;
    document.body.dataset.mode = key === "adult" ? "adult" : key === "start" ? "start" : "kids";
    updateModeSwitch();
    window.scrollTo(0, 0);
    fn(...parts.slice(1));
  }
  window.addEventListener("hashchange", route);

  function updateModeSwitch() {
    const m = document.body.dataset.mode;
    $$(".mode-switch button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
  }

  function topbar(title, back, sub) {
    return `<div class="topbar">
      ${back ? `<a class="back" href="#/${back}" aria-label="もどる">‹</a>` : "<span></span>"}
      <div class="tb-title"><b>${title}</b>${sub ? `<small>${sub}</small>` : ""}</div><span></span></div>`;
  }

  // ---------------- 最初の画面（大人／子供） ----------------
  routes.start = () => {
    view().innerHTML = `
      <section class="start">
        <h1 class="logo">English <span>Time</span></h1>
        <p class="lead">だれが つかう？</p>
        <div class="start-cards">
          <button class="start-card kids" data-go="kids">
            <span class="sc-art">${A.render("face:girl")}</span>
            <b>こども</b><small>おはなし・タップ・ゲーム</small>
          </button>
          <button class="start-card adult" data-go="adult">
            <span class="sc-art adult-mark">Aa</span>
            <b>おとな</b><small>じゅんびちゅう</small>
          </button>
        </div>
      </section>`;
    $$("[data-go]").forEach((b) => b.addEventListener("click", () => { Settings.save({ mode: b.dataset.go }); go(b.dataset.go); }));
  };

  // ---------------- 大人用（あとで構築） ----------------
  routes.adult = () => {
    view().innerHTML = `${topbar("おとな用", "", "")}
      <section class="adult-soon">
        <div class="soon-card">
          <h2>大人用アプリは準備中です</h2>
          <p>子供用を先に作っています。大人用はこのあと、同じ記録のしくみ（スプレッドシート）を使って追加していきます。</p>
          <button class="btn primary" data-go="kids">子供用をひらく</button>
        </div>
      </section>`;
    $("[data-go]").addEventListener("click", () => { Settings.save({ mode: "kids" }); go("kids"); });
  };

  // ---------------- 子供用ホーム ----------------
  routes.kids = () => {
    const name = Settings.data.name;
    const days = Log.practiceDays();
    let week = "";
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("ja-JP");
      week += `<li class="${days.has(key) ? "done" : ""}"><span>${["日", "月", "火", "水", "木", "金", "土"][d.getDay()]}</span><i>${days.has(key) ? "★" : ""}</i></li>`;
    }
    view().innerHTML = `
      <section class="kids-home">
        <div class="hello">
          <p class="unit-tag">Unit</p>
          <h1>${esc(D.unit.title)}<small>${esc(D.unit.ja)}</small></h1>
          <p class="hi">${name ? esc(name) + "さん、" : ""}きょうは どれに する？</p>
        </div>
        <div class="phase-grid">
          <a class="phase p1" href="#/story"><em>1</em><span class="ph-art">${A.render("item:bag")}</span><b>おはなしを きこう</b><small>Story</small></a>
          <a class="phase p2" href="#/tap"><em>2</em><span class="ph-art">${A.render("shape:star")}</span><b>タップして きこう</b><small>Words</small></a>
          <a class="phase p3" href="#/game"><em>3</em><span class="ph-art">${A.render("emoji:🎮")}</span><b>ゲームで あそぼう</b><small>Games</small></a>
        </div>
        <div class="week"><p>がんばった日</p><ul>${week}</ul></div>
      </section>`;
    Cheer.say(pick(Cheer.LINES.hello));
  };

  // ---------------- ① ストーリー ----------------
  routes.story = (idx) => {
    const pages = D.story;
    let i = Math.max(0, Math.min(pages.length - 1, +idx || 0));
    let auto = false;
    if (i === 0) Timer.start();
    const seen = new Set();
    view().innerHTML = `${topbar("おはなしを きこう", "kids", "Story")}
      <section class="story">
        <div class="book"><div class="page" id="page"></div></div>
        <div class="story-text" id="stext"></div>
        <div class="story-ctrl">
          <button class="round prev" id="prev" aria-label="まえへ">‹</button>
          <button class="round listen" id="listen" aria-label="きく">🔈<small>きく</small></button>
          <button class="round auto" id="auto" aria-label="ぜんぶ">▶<small>ぜんぶ</small></button>
          <button class="round next" id="next" aria-label="つぎへ">›</button>
        </div>
        <ol class="pager" id="pager">${pages.map((_, n) => `<li data-n="${n}"></li>`).join("")}</ol>
      </section>`;
    const show = async (n, speak = true) => {
      i = n;
      const p = pages[i];
      seen.add(i);
      $("#page").innerHTML = A.scene(p);
      $("#page").classList.remove("turn"); void $("#page").offsetWidth; $("#page").classList.add("turn");
      $("#stext").innerHTML = `<p class="en">${esc(p.en)}</p><p class="ja">${esc(p.ja)}</p>`;
      $$("#pager li").forEach((li) => li.classList.toggle("on", +li.dataset.n === i));
      $("#prev").disabled = i === 0;
      $("#next").disabled = i === pages.length - 1;
      history.replaceState(null, "", "#/story/" + i);
      if (speak) await Speech.say(p.ja, p.en, { el: $("#stext") });
      if (i === pages.length - 1) {
        Log.record({ phase: "①ストーリー", item: "I Want（おはなし）", result: seen.size === pages.length ? "さいごまで" : "とちゅうから", seconds: Timer.sec() });
        await wait(300);
        Cheer.play("clear", "おはなし さいごまで きけたね！");
      } else if (speak && i > 0) {
        Cheer.play("tap", pick(Cheer.LINES.tap));
      }
    };
    $("#prev").onclick = () => { auto = false; setAuto(); if (i > 0) show(i - 1); };
    $("#next").onclick = () => { auto = false; setAuto(); if (i < pages.length - 1) show(i + 1); };
    $("#listen").onclick = () => Speech.say(pages[i].ja, pages[i].en, { el: $("#stext") });
    $("#page").onclick = () => Speech.say(pages[i].ja, pages[i].en, { el: $("#stext") });
    $$("#pager li").forEach((li) => (li.onclick = () => { auto = false; setAuto(); show(+li.dataset.n); }));
    const setAuto = () => $("#auto").classList.toggle("on", auto);
    $("#auto").onclick = async () => {
      auto = !auto; setAuto();
      if (!auto) return Speech.stop();
      if (i === pages.length - 1) i = -1;
      while (auto && i < pages.length - 1) {
        await show(i + 1);
        await wait(900);
        if (document.body.dataset.route !== "story") return;
      }
      auto = false; setAuto();
    };
    // スワイプでページめくり
    let sx = null;
    $("#page").addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
    $("#page").addEventListener("touchend", (e) => {
      if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
      if (dx < -50) $("#next").click(); else if (dx > 50) $("#prev").click();
    });
    show(i, false);
  };

  // ---------------- ② タップして きこう ----------------
  routes.tap = (sectionId) => {
    if (!sectionId) return tapMenu();
    if (sectionId === "sugoroku") return sugoroku();
    const sec = D.sections.find((s) => s.id === sectionId);
    if (!sec) return go("tap");
    Timer.start();
    const tapped = new Set();
    const key = "②タップ:" + sec.title;
    const days = Log.daysFor(key);
    view().innerHTML = `${topbar(sec.ja, "tap", sec.title)}
      <section class="tap-sec">
        <div class="cards cards-${sec.id}">
          ${sec.cards.map((c, n) => `
            <button class="card" data-n="${n}">
              <span class="num">${n + 1}</span>
              <span class="card-art">${A.render(c.art)}</span>
              <span class="card-en">${esc(c.en)}</span>
              <span class="card-ja">${esc(c.ja)}</span>
              <span class="check">✓</span>
            </button>`).join("")}
        </div>
        <div class="tap-foot">
          ${sec.dialog.length ? `<button class="dialog" id="dialog">
            ${sec.dialog.map((d) => `<span class="dl ${d.who}"><span class="dl-face">${A.render("face:" + d.who)}</span><span class="dl-say">${esc(d.en)}</span></span>`).join("")}
            <span class="dl-play">▶</span></button>` : ""}
          <div class="practice"><p>れんしゅうした日<br><small>I practiced this on these days</small></p>
            <ul>${Array.from({ length: 6 }, (_, n) => `<li>${days[n] ? days[n].replace(/^\d+\//, "") : ""}</li>`).join("")}</ul></div>
        </div>
        <p class="progress" id="prog">0 / ${sec.cards.length}</p>
      </section>`;
    $$(".card").forEach((btn) =>
      btn.addEventListener("click", async () => {
        const c = sec.cards[+btn.dataset.n];
        btn.classList.add("tapped", "pop");
        setTimeout(() => btn.classList.remove("pop"), 400);
        const first = !tapped.has(c.id);
        tapped.add(c.id);
        $("#prog").textContent = `${tapped.size} / ${sec.cards.length}`;
        const completes = first && tapped.size === sec.cards.length;
        Cheer.play("tap", pick(Cheer.LINES.tap));
        await Speech.say(c.ja, c.en, { el: btn });
        if (completes) {
          Log.record({ phase: "②タップ", item: sec.title, result: "ぜんぶ きいた", correct: tapped.size, total: sec.cards.length, seconds: Timer.sec() });
          Cheer.play("clear", `${sec.ja}、ぜんぶ きけたね！`);
          const li = $$(".practice li").find((x) => !x.textContent);
          if (li) li.textContent = new Date().toLocaleDateString("ja-JP").replace(/^\d+\//, "");
        }
      })
    );
    const dlg = $("#dialog");
    if (dlg) dlg.addEventListener("click", async () => {
      for (const d of sec.dialog) {
        const el = $$(".dl", dlg)[sec.dialog.indexOf(d)];
        el.classList.add("on");
        await Speech.say(d.ja, d.en, { el });
        el.classList.remove("on");
        await wait(200);
      }
    });
  };

  function tapMenu() {
    view().innerHTML = `${topbar("タップして きこう", "kids", "Words")}
      <section class="menu-grid">
        ${D.sections.map((s) => `<a class="menu-card" href="#/tap/${s.id}"><span class="mc-art">${A.render(s.icon)}</span><b>${esc(s.ja)}</b><small>${esc(s.title)}</small></a>`).join("")}
        <a class="menu-card special" href="#/tap/sugoroku"><span class="mc-art">${A.render("emoji:🎲")}</span><b>すごろく</b><small>Start → Finish</small></a>
      </section>`;
  }

  // すごろく（p.30-31）：止まったマスを読む
  function sugoroku() {
    Timer.start();
    const pool = shuffle(D.sections.filter((s) => s.id !== "commands").flatMap((s) => s.cards));
    const acts = shuffle(D.sections.find((s) => s.id === "commands").cards).slice(0, 4);
    let cells = pool.slice(0, 18);
    acts.forEach((a, k) => cells.splice(3 + k * 5, 0, Object.assign({ action: true }, a)));
    cells = [{ start: true, en: "Start", ja: "スタート" }, ...cells.slice(0, 22), { finish: true, en: "Finish", ja: "ゴール" }];
    let pos = 0, rolling = false;
    view().innerHTML = `${topbar("すごろく", "tap", "Start → Finish")}
      <section class="sugoroku">
        <div class="board">${cells.map((c, n) => `
          <div class="cell ${c.start ? "start" : ""} ${c.finish ? "finish" : ""} ${c.action ? "action" : ""}" data-n="${n}">
            ${c.start || c.finish ? `<b>${c.en}</b>` : `<span class="cell-art">${A.render(c.art)}</span>`}
          </div>`).join("")}</div>
        <div class="dice-row">
          <button class="dice" id="dice" aria-label="サイコロ">🎲<small>ふる</small></button>
          <div class="said" id="said"><p class="en">サイコロを ふってね</p></div>
        </div>
      </section>`;
    const board = $(".board");
    const piece = document.createElement("div");
    piece.className = "piece";
    piece.innerHTML = A.render("face:girl");
    const place = () => {
      const cell = $$(".cell", board)[pos];
      cell.appendChild(piece);
      $$(".cell", board).forEach((x) => x.classList.toggle("here", x === cell));
    };
    place();
    $("#dice").onclick = async () => {
      if (rolling) return;
      rolling = true;
      const n = 1 + Math.floor(Math.random() * 3);
      const d = $("#dice");
      d.classList.add("roll");
      await wait(600);
      d.classList.remove("roll");
      d.innerHTML = `<span class="pips">${"●".repeat(n)}</span><small>${n}</small>`;
      await Speech.en(["one", "two", "three"][n - 1]);
      for (let k = 0; k < n && pos < cells.length - 1; k++) { pos++; place(); await wait(320); }
      const c = cells[pos];
      if (c.finish) {
        $("#said").innerHTML = `<p class="en">Finish!</p><p class="ja">ゴール！</p>`;
        Log.record({ phase: "②タップ", item: "すごろく", result: "ゴール", seconds: Timer.sec() });
        Cheer.play("clear", "ゴール！ よく がんばったね！");
        await Speech.say("ゴール！", "Finish!");
      } else {
        $("#said").innerHTML = `<p class="en">${esc(c.en)}</p><p class="ja">${c.action ? "やってみよう！ " : ""}${esc(c.ja)}</p>`;
        Cheer.play("tap", c.action ? "やってみよう！" : pick(Cheer.LINES.tap));
        await Speech.say(c.ja, c.en, { el: $("#said") });
      }
      d.innerHTML = `🎲<small>ふる</small>`;
      rolling = false;
    };
    $(".board").addEventListener("click", (e) => {
      const cell = e.target.closest(".cell");
      if (!cell) return;
      const c = cells[+cell.dataset.n];
      if (!c.start && !c.finish) Speech.say(c.ja, c.en, { el: cell });
    });
  }

  // ---------------- ③ ゲーム ----------------
  const GAMES = [
    { id: "hunt", ja: "もじ さがし", en: "Find the letters", icon: "emoji:🔍" },
    { id: "dots", ja: "てん つなぎ", en: "Connect the dots", icon: "emoji:✏️" },
    { id: "match", ja: "おおもじ・こもじ", en: "Big & little letters", icon: "emoji:🔤" },
    { id: "listen", ja: "きいて えらぼう", en: "Listen and choose", icon: "emoji:👂" },
    { id: "opposite", ja: "どっちかな？", en: "Big or little?", icon: "opp:big" },
    { id: "shadow", ja: "かげ あて", en: "Who's this?", icon: "emoji:👤" }
  ];
  routes.game = (id, arg) => {
    if (!id) {
      view().innerHTML = `${topbar("ゲームで あそぼう", "kids", "Games")}
        <section class="menu-grid">${GAMES.map((g) => `<a class="menu-card" href="#/game/${g.id}"><span class="mc-art">${A.render(g.icon)}</span><b>${g.ja}</b><small>${g.en}</small></a>`).join("")}</section>`;
      return;
    }
    const fn = { hunt: gameHunt, dots: gameDots, match: gameMatch, listen: gameListen, opposite: gameOpposite, shadow: gameShadow }[id];
    if (fn) fn(arg); else go("game");
  };

  function chooser(title, back, sub, items, hrefFn) {
    view().innerHTML = `${topbar(title, back, sub)}
      <section class="chooser">${items.map((it) => `<a class="choose" href="${hrefFn(it)}"><span class="ch-emoji">${it.emoji}</span><b>${it.label}</b><small>${it.small || ""}</small></a>`).join("")}</section>`;
  }

  function finishGame(name, correct, total, extraMsg) {
    Log.record({ phase: "③ゲーム", item: name, result: correct >= total ? "クリア" : "とちゅう", correct, total, seconds: Timer.sec() });
    Cheer.play("clear", extraMsg || pick(Cheer.LINES.clear));
  }
  function bump(el, ok) {
    el.classList.remove("ok", "ng"); void el.offsetWidth; el.classList.add(ok ? "ok" : "ng");
    if (!ok) Cheer.play("wrong", pick(Cheer.LINES.wrong));
  }

  // A. もじ さがし（Circle all the ... with a big X or a little x）
  function gameHunt(letter) {
    if (!letter) return chooser("もじ さがし", "game", "Find the letters", D.letterHunt.map((h) => ({ emoji: h.emoji, label: h.letter + " " + h.letter.toLowerCase(), small: h.word })), (it) => "#/game/hunt/" + it.label[0]);
    const h = D.letterHunt.find((x) => x.letter === letter);
    if (!h) return go("game/hunt");
    Timer.start();
    const L = h.letter, l = L.toLowerCase();
    const near = { O: "QCDGo", P: "RBqbd", R: "PBKn", U: "VWnu", W: "VMNm", X: "KYZx", Y: "VXTv" }[L] || "ABC";
    const others = (near + "ABDEFGHKMNST").split("").filter((c) => c.toUpperCase() !== L);
    const targets = shuffle([L, L, L, l, l, l, L, l].slice(0, 6 + Math.floor(Math.random() * 3)));
    const tiles = shuffle(targets.concat(shuffle(others).slice(0, 16 - targets.length).map((c) => (Math.random() < 0.5 ? c.toLowerCase() : c))));
    let found = 0;
    view().innerHTML = `${topbar("もじ さがし", "game/hunt", h.word)}
      <section class="hunt">
        <button class="ask" id="ask"><span class="ask-emoji">${h.emoji}</span><span><b>「${L}」と「${l}」を ぜんぶ みつけよう</b><small>Find the big ${L} and the little ${l}.</small></span></button>
        <div class="tiles">${tiles.map((c, n) => `<button class="tile" data-c="${c}" style="--r:${(n * 37) % 11 - 5}deg"><span class="t-emoji">${h.emoji}</span><b>${c}</b></button>`).join("")}</div>
        <p class="progress"><span id="found">0</span> / ${targets.length}</p>
      </section>`;
    const intro = () => Speech.say(`おおきい ${L} と ちいさい ${l} を さがそう`, `Find the big ${L} and the little ${l}.`, { el: $("#ask") });
    $("#ask").onclick = intro; intro();
    $$(".tile").forEach((t) => t.addEventListener("click", async () => {
      if (t.classList.contains("got")) return;
      if (t.dataset.c.toUpperCase() === L) {
        t.classList.add("got"); found++; $("#found").textContent = found;
        bump(t, true);
        Cheer.play("correct", pick(Cheer.LINES.correct));
        Speech.en(t.dataset.c === L ? `big ${L}` : `little ${l}`);
        if (found === targets.length) {
          await wait(900);
          await Speech.say(h.ja, `${L}. ${h.word}!`);
          finishGame(`もじさがし ${L}${l}`, found, targets.length, `${L} と ${l}、ぜんぶ みつけたね！`);
        }
      } else {
        bump(t, false);
        Speech.en(t.dataset.c);
      }
    }));
  }

  // B. てん つなぎ（Connect the big X's to the little x's）
  function gameDots(letter) {
    if (!letter) return chooser("てん つなぎ", "game", "Connect the dots", D.dotConnect.map((h) => ({ emoji: h.emoji, label: h.letter + " " + h.letter.toLowerCase(), small: h.word })), (it) => "#/game/dots/" + it.label[0]);
    const h = D.dotConnect.find((x) => x.letter === letter);
    if (!h) return go("game/dots");
    Timer.start();
    const L = h.letter, l = L.toLowerCase();
    const line = L === "T";
    const zig = L === "Z" || L === "V";
    const N = line || zig ? 8 : 12;
    const pts = [];
    for (let k = 0; k < N; k++) {
      if (line) pts.push([30 + k * (300 / (N - 1)), 250]);
      else if (zig) pts.push([30 + k * (300 / (N - 1)), k % 2 ? 230 : 110]);
      else { const a = (k / N) * Math.PI * 2 - Math.PI / 2; pts.push([180 + Math.cos(a) * 118, 180 + Math.sin(a) * 118]); }
    }
    const decoys = [];
    const pool = "ABDEFGHKMNOPRUWXY".split("").filter((c) => c !== L);
    for (let k = 0, tries = 0; k < 7 && tries < 400; tries++) {
      const p = [26 + Math.random() * 308, 26 + Math.random() * 308];
      const far = (q, dmin) => Math.hypot(q[0] - p[0], q[1] - p[1]) > dmin;
      if (!pts.every((q) => far(q, 62)) || !decoys.every((q) => far(q, 56))) continue;
      if (!line && !zig && Math.hypot(p[0] - 180, p[1] - 180) < 168) continue;
      if ((line || zig) && p[1] > 150 && p[1] < 200 && Math.abs(p[0] - 180) < 70) continue;
      decoys.push(p.concat(pick(pool)[Math.random() < 0.5 ? "toLowerCase" : "toUpperCase"]()));
      k++;
    }
    let next = 0;
    const lab = (k) => (k % 2 ? l : L);
    view().innerHTML = `${topbar("てん つなぎ", "game/dots", h.word)}
      <section class="dots">
        <button class="ask" id="ask"><span class="ask-emoji">${h.emoji}</span><span><b>${L} → ${l} → ${L} の じゅんに つなごう</b><small>Connect the big ${L}'s to the little ${l}'s.</small></span></button>
        <div class="dot-board">
          <svg viewBox="0 0 360 360" id="dsvg">
            <g id="lines"></g>
            <g class="reveal" id="reveal"><text x="180" y="${line ? 170 : zig ? 340 : 205}" text-anchor="middle" font-size="${line || zig ? 80 : 110}">${h.emoji}</text></g>
            ${line ? `<text x="10" y="215" font-size="40">🐢</text><text x="10" y="120" font-size="36">🐰</text><text x="320" y="215" font-size="34">🏁</text>` : ""}
            ${decoys.map((d, k) => `<g class="dd decoy" data-k="${k}" transform="translate(${d[0]} ${d[1]})"><circle r="21"/><text y="8">${d[2]}</text></g>`).join("")}
            ${pts.map((p, k) => `<g class="dd target" data-k="${k}" transform="translate(${p[0]} ${p[1]})"><circle r="21"/><text y="8">${lab(k)}</text></g>`).join("")}
          </svg>
        </div>
        <p class="progress"><span id="cnt">0</span> / ${N}</p>
      </section>`;
    const intro = () => Speech.say(`おおきい ${L} と ちいさい ${l} を じゅんばんに つなごう`, `Connect the big ${L}'s to the little ${l}'s.`, { el: $("#ask") });
    $("#ask").onclick = intro; intro();
    const mark = () => $$(".target").forEach((g) => g.classList.toggle("next", +g.dataset.k === next));
    mark();
    $$(".dd", $("#dsvg")).forEach((g) => g.addEventListener("click", async () => {
      if (g.classList.contains("target") && +g.dataset.k === next) {
        g.classList.add("done");
        if (next > 0) {
          const a = pts[next - 1], b = pts[next];
          $("#lines").insertAdjacentHTML("beforeend", `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`);
        }
        Speech.en(next % 2 ? `little ${l}` : `big ${L}`);
        next++; $("#cnt").textContent = next; mark();
        if (next % 3 === 0) Cheer.play("correct", pick(Cheer.LINES.correct));
        if (next === N) {
          if (!line && !zig) { const a = pts[N - 1], b = pts[0]; $("#lines").insertAdjacentHTML("beforeend", `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`); }
          $("#reveal").classList.add("show");
          await wait(700);
          await Speech.say(h.ja, h.word);
          finishGame(`てんつなぎ ${L}${l}`, N, N, line ? "カメさんの かち！ よく できたね！" : "できあがり！ すごいね！");
        }
      } else {
        bump(g, false);
        if (g.classList.contains("decoy")) Speech.en($("text", g).textContent);
      }
    }));
  }

  // C. 大文字と小文字をつなごう
  function gameMatch(setId) {
    if (!setId) return chooser("おおもじ・こもじ", "game", "Big & little letters", D.letterSets.map((s) => ({ emoji: s.letters[0] + s.letters[0].toLowerCase(), label: s.label, small: s.letters.split("").join(" "), id: s.id })), (it) => "#/game/match/" + it.id);
    const set = D.letterSets.find((s) => s.id === setId);
    if (!set) return go("game/match");
    Timer.start();
    const big = set.letters.split("");
    const small = shuffle(big.map((c) => c.toLowerCase()));
    let sel = null, done = 0, miss = 0;
    view().innerHTML = `${topbar("おおもじ・こもじ", "game/match", set.label)}
      <section class="match">
        <button class="ask" id="ask"><span class="ask-emoji">🔤</span><span><b>おなじ もじを つなごう</b><small>Connect the big letters to the little letters.</small></span></button>
        <div class="match-board" id="mb">
          <svg class="match-lines" id="ml"></svg>
          <div class="col left">${big.map((c) => `<button class="lt" data-c="${c}">${c}</button>`).join("")}</div>
          <div class="col right">${small.map((c) => `<button class="lt" data-c="${c}">${c}</button>`).join("")}</div>
        </div>
      </section>`;
    const intro = () => Speech.say("おおきい もじと ちいさい もじを つなごう", "Connect the big letters to the little letters.", { el: $("#ask") });
    $("#ask").onclick = intro; intro();
    const pairs = [];
    const COLORS = ["#C2357A", "#3E7CC9", "#4FA35B", "#F2994A", "#B48AD6"];
    const redraw = () => {
      const mb = $("#mb"); if (!mb) return;
      const box = mb.getBoundingClientRect();
      const svg = $("#ml");
      svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
      svg.innerHTML = pairs.map(([a, b], k) => {
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        return `<line x1="${ra.right - box.left}" y1="${ra.top + ra.height / 2 - box.top}" x2="${rb.left - box.left}" y2="${rb.top + rb.height / 2 - box.top}" stroke="${COLORS[k % COLORS.length]}"/>`;
      }).join("");
    };
    const drawLine = (a, b) => { pairs.push([a, b]); redraw(); };
    // 画面を回転したら線を引き直す
    const onResize = () => { if (!document.body.contains($("#mb"))) return window.removeEventListener("resize", onResize); redraw(); };
    window.addEventListener("resize", onResize);
    $$(".left .lt").forEach((b) => b.addEventListener("click", () => {
      if (b.classList.contains("done")) return;
      $$(".left .lt").forEach((x) => x.classList.remove("sel"));
      b.classList.add("sel"); sel = b; Speech.en(b.dataset.c);
    }));
    $$(".right .lt").forEach((b) => b.addEventListener("click", async () => {
      if (b.classList.contains("done")) return;
      if (!sel) { bump(b, false); Cheer.say("さきに ひだりの おおもじを えらんでね"); return; }
      if (sel.dataset.c.toLowerCase() === b.dataset.c) {
        sel.classList.remove("sel"); sel.classList.add("done"); b.classList.add("done");
        drawLine(sel, b); done++;
        Cheer.play("correct", pick(Cheer.LINES.correct));
        Speech.en(`${sel.dataset.c}. ${b.dataset.c}.`);
        sel = null;
        if (done === big.length) { await wait(900); finishGame(`おおもじ・こもじ ${set.label}`, big.length, big.length + miss); }
      } else { miss++; bump(b, false); }
    }));
  }

  // D. きいて えらぼう（Story Phrases / Review / Quiz Time）
  function quizPool() {
    const sec = (id) => D.sections.find((s) => s.id === id).cards;
    const qs = [];
    sec("phrases").slice(0, 7).forEach((c) => qs.push({ cat: "phrases", c, opts: sec("phrases").slice(0, 7) }));
    sec("shapes").forEach((c) => qs.push({ cat: "shapes", c, opts: sec("shapes") }));
    sec("time").forEach((c) => qs.push({ cat: "time", c, opts: sec("time"), q: { en: "What time is it?", ans: "It's " + c.en + "." } }));
    sec("family").forEach((c) => qs.push({ cat: "family", c, opts: sec("family"), q: { en: "Who's this?", ans: c.id === "sam" ? "My friend Sam." : "My " + c.en + "." } }));
    return qs;
  }
  function gameListen() {
    Timer.start();
    const qs = shuffle(quizPool()).slice(0, 8);
    let n = 0, score = 0, tries = 0;
    const draw = () => {
      const q = qs[n];
      const opts = shuffle([q.c].concat(shuffle(q.opts.filter((o) => o.id !== q.c.id)).slice(0, 2)));
      tries = 0;
      view().innerHTML = `${topbar("きいて えらぼう", "game", "Listen and choose")}
        <section class="quiz">
          <div class="q-head"><span class="q-num">${n + 1} / ${qs.length}</span><span class="stars">${"★".repeat(score)}${"☆".repeat(qs.length - score)}</span></div>
          <button class="ask big" id="ask"><span class="ask-emoji">🔈</span><span><b>よく きいて えらんでね</b><small>Listen and choose.</small></span></button>
          <div class="opts">${opts.map((o) => `<button class="opt" data-id="${o.id}">${A.render(o.art)}</button>`).join("")}</div>
        </section>`;
      const play = () => Speech.en(q.c.en, { el: $("#ask") });
      $("#ask").onclick = play;
      setTimeout(play, 300);
      $$(".opt").forEach((b) => b.addEventListener("click", async () => {
        if (b.dataset.id === q.c.id) {
          if (tries === 0) score++;
          b.classList.add("right"); bump(b, true);
          $$(".opt").forEach((x) => (x.disabled = true));
          Cheer.play("correct", pick(Cheer.LINES.correct));
          await Speech.say(q.c.ja, q.c.en, { el: b });
          await wait(500);
          n++;
          if (n < qs.length) draw();
          else {
            view().innerHTML = resultHtml(score, qs.length, "listen");
            finishGame("きいてえらぼう", score, qs.length, `${qs.length}もん中 ${score}もん せいかい！`);
          }
        } else { tries++; bump(b, false); b.disabled = true; setTimeout(play, 500); }
      }));
    };
    draw();
  }

  // E. どっちかな？（Opposites：Is it big or little? / long or short?）
  function gameOpposite() {
    Timer.start();
    const items = [
      { item: "bag", pair: "size" }, { item: "robot", pair: "size" }, { item: "doll", pair: "size" }, { item: "book", pair: "size" },
      { item: "train", pair: "length" }, { item: "jumprope", pair: "length" }, { item: "train", pair: "length" }, { item: "bag", pair: "size" }
    ];
    const qs = shuffle(items).map((it) => Object.assign({}, it, { ans: it.pair === "size" ? pick(["big", "little"]) : pick(["long", "short"]) }));
    let n = 0, score = 0, tries = 0;
    const WORD = { big: "おおきい", little: "ちいさい", long: "ながい", short: "みじかい" };
    const pic = (q) => {
      const svgItem = (k, extra) => A.render("item:" + k).replace('class="art "', `class="art ${extra}"`);
      if (q.pair === "size") {
        const isBig = q.ans === "big";
        return `<div class="opp-pic size"><span class="o-big ${isBig ? "hl" : "dim"}">${svgItem(q.item, "")}</span><span class="o-small ${isBig ? "dim" : "hl"}">${svgItem(q.item, "")}</span></div>`;
      }
      const long = q.ans === "long";
      if (q.item === "train") return `<div class="opp-pic len">${A.wrap(`<g transform="translate(0 0) scale(1 .6)" opacity="${long ? 1 : 0.22}">${A.trainInner(8)}</g><g transform="translate(0 92) scale(.32 .55)" opacity="${long ? 0.22 : 1}">${A.trainInner(1)}</g>`, "0 0 200 160")}</div>`;
      return `<div class="opp-pic len rope">${A.wrap(`<path d="M20 40 C60 ${long ? 150 : 70} 140 ${long ? 150 : 70} 180 40" fill="none" stroke="#F2994A" stroke-width="7"/><rect x="10" y="20" width="18" height="34" rx="8" fill="#E2603F"/><rect x="172" y="20" width="18" height="34" rx="8" fill="#3E7CC9"/>`, "0 0 200 160")}</div>`;
    };
    const draw = () => {
      const q = qs[n]; tries = 0;
      const choices = q.pair === "size" ? ["big", "little"] : ["long", "short"];
      const question = q.pair === "size" ? "Is it big or little?" : "Is it long or short?";
      view().innerHTML = `${topbar("どっちかな？", "game", "Opposites")}
        <section class="quiz">
          <div class="q-head"><span class="q-num">${n + 1} / ${qs.length}</span><span class="stars">${"★".repeat(score)}${"☆".repeat(qs.length - score)}</span></div>
          <button class="ask" id="ask"><span class="ask-emoji">🔈</span><span><b>${question}</b><small>${q.pair === "size" ? "おおきい？ ちいさい？" : "ながい？ みじかい？"}</small></span></button>
          ${pic(q)}
          <div class="opts two">${choices.map((c) => `<button class="opt word" data-id="${c}"><b>${c}</b><small>${WORD[c]}</small></button>`).join("")}</div>
        </section>`;
      const play = () => Speech.en(question, { el: $("#ask") });
      $("#ask").onclick = play; setTimeout(play, 300);
      $$(".opt").forEach((b) => b.addEventListener("click", async () => {
        if (b.dataset.id === q.ans) {
          if (!tries) score++;
          b.classList.add("right"); bump(b, true); $$(".opt").forEach((x) => (x.disabled = true));
          Cheer.play("correct", pick(Cheer.LINES.correct));
          await Speech.say(WORD[q.ans] + "よ。", `It's ${q.ans}.`, { el: b });
          await wait(400); n++;
          if (n < qs.length) draw();
          else { view().innerHTML = resultHtml(score, qs.length, "opposite"); finishGame("どっちかな（はんたいことば）", score, qs.length, `${qs.length}もん中 ${score}もん せいかい！`); }
        } else { tries++; bump(b, false); b.disabled = true; Speech.en(b.dataset.id); }
      }));
    };
    draw();
  }

  // F. かげ あて（Shapes / Family and Friends のシルエット）
  function gameShadow() {
    Timer.start();
    const sec = (id) => D.sections.find((s) => s.id === id).cards;
    const pool = sec("shapes").map((c) => ({ c, opts: sec("shapes"), q: "What shape is this?", qja: "これは なんの かたち？", ans: `It's ${c.en}.` }))
      .concat(sec("family").map((c) => ({ c, opts: sec("family"), q: "Who's this?", qja: "これは だれ？", ans: c.id === "sam" ? "My friend Sam." : `My ${c.en}.` })));
    const qs = shuffle(pool).slice(0, 8);
    let n = 0, score = 0, tries = 0;
    const draw = () => {
      const q = qs[n]; tries = 0;
      const opts = shuffle([q.c].concat(shuffle(q.opts.filter((o) => o.id !== q.c.id)).slice(0, 2)));
      const isShape = q.c.art.startsWith("shape:");
      const shadow = isShape ? A.wrap(A.shape(q.c.art.split(":")[1], { fill: "#3B2A3F", stroke: "#3B2A3F" }), "0 0 200 200") : A.render(q.c.art);
      view().innerHTML = `${topbar("かげ あて", "game", "Who's this?")}
        <section class="quiz">
          <div class="q-head"><span class="q-num">${n + 1} / ${qs.length}</span><span class="stars">${"★".repeat(score)}${"☆".repeat(qs.length - score)}</span></div>
          <button class="ask" id="ask"><span class="ask-emoji">🔈</span><span><b>${q.q}</b><small>${q.qja}</small></span></button>
          <div class="shadow ${isShape ? "" : "sil"}" id="sh">${shadow}</div>
          <div class="opts">${opts.map((o) => `<button class="opt" data-id="${o.id}">${A.render(o.art)}<small>${esc(o.en)}</small></button>`).join("")}</div>
        </section>`;
      const play = () => Speech.say(q.qja, q.q, { el: $("#ask") });
      $("#ask").onclick = play; setTimeout(play, 300);
      $$(".opt").forEach((b) => b.addEventListener("click", async () => {
        if (b.dataset.id === q.c.id) {
          if (!tries) score++;
          $("#sh").classList.add("lit");
          b.classList.add("right"); bump(b, true); $$(".opt").forEach((x) => (x.disabled = true));
          Cheer.play("correct", pick(Cheer.LINES.correct));
          await Speech.say(q.c.ja, q.ans, { el: b });
          await wait(500); n++;
          if (n < qs.length) draw();
          else { view().innerHTML = resultHtml(score, qs.length, "shadow"); finishGame("かげあて", score, qs.length, `${qs.length}もん中 ${score}もん せいかい！`); }
        } else { tries++; bump(b, false); b.disabled = true; }
      }));
    };
    draw();
  }
  function resultHtml(score, total, id) {
    return `${topbar("けっか", "game", "Result")}
      <section class="result"><p class="big-stars">${"★".repeat(score)}<span>${"★".repeat(total - score)}</span></p>
      <h2>${score} / ${total}</h2><p>${score === total ? "ぜんもん せいかい！" : "よく がんばったね！"}</p>
      <button class="btn primary" onclick="window.APP.replay('${id}')">もういちど</button><a class="btn" href="#/game">ゲームを えらぶ</a></section>`;
  }

  // ---------------- 設定 ----------------
  function openSettings() {
    const s = Settings.data;
    const dlg = document.getElementById("settings");
    const q = Log.queue().length, h = Log.history().length;
    dlg.innerHTML = `<form method="dialog" class="set-form">
      <h2>せってい</h2>
      <label>なまえ（記録に のります）<input name="name" value="${esc(s.name)}" placeholder="例：はなこ"></label>
      <label>えいごの はやさ
        <select name="enRate"><option value="0.7" ${s.enRate == 0.7 ? "selected" : ""}>ゆっくり</option><option value="0.85" ${s.enRate == 0.85 ? "selected" : ""}>ふつう</option><option value="1" ${s.enRate == 1 ? "selected" : ""}>はやい</option></select></label>
      <label>よみあげ
        <select name="order"><option value="ja-en" ${s.order === "ja-en" ? "selected" : ""}>にほんご → えいご</option><option value="en" ${s.order === "en" ? "selected" : ""}>えいご だけ</option></select></label>
      <details ${s.gasUrl ? "" : "open"}><summary>保護者の方へ：学習記録（スプレッドシート）</summary>
        <label>Apps Script のウェブアプリURL<input name="gasUrl" value="${esc(s.gasUrl)}" placeholder="https://script.google.com/macros/s/.../exec"></label>
        <p class="note">記録 ${h}件（未送信 ${q}件）。URLが空のときは、この端末に記録をためておき、URLを入れると まとめて送ります。</p>
      </details>
      <div class="set-btns"><button class="btn" value="cancel">とじる</button><button class="btn primary" value="ok" id="setOk">ほぞん</button></div>
    </form>`;
    dlg.showModal();
    $("#setOk", dlg).addEventListener("click", () => {
      const f = $(".set-form", dlg);
      Settings.save({ name: f.name.value.trim(), enRate: +f.enRate.value, order: f.order.value, gasUrl: f.gasUrl.value.trim() });
      Log.flush();
      Speech.say("せっていを ほぞんしました", "OK!");
      if (document.body.dataset.route === "kids") route();
    });
  }

  // ---------------- 起動 ----------------
  window.APP = {
    replay(id) { routes.game(id); },
    go
  };
  document.addEventListener("DOMContentLoaded", () => {
    Cheer.init();
    $$(".mode-switch button").forEach((b) => b.addEventListener("click", () => { Settings.save({ mode: b.dataset.mode }); go(b.dataset.mode); }));
    $("#openSettings").addEventListener("click", openSettings);
    $("#homeBtn").addEventListener("click", () => go(document.body.dataset.mode === "adult" ? "adult" : "kids"));
    Log.flush();
    route();
  });
})();
