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
    Cheer.say("Hello!", "いっしょに えいごで あそぼう！");
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
    Cheer.say(name ? `Hello, ${name}!` : "Hello!", "きょうは どれで あそぶ？");
    Speech.say(`${name ? name + "、" : ""}きょうは どれで あそぶ？`, "Let's play!", { noBubble: true });
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
      Cheer.say(p.en, p.ja);
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
    Cheer.say("Tap a card!", "カードを タップしてね");
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
    Cheer.say("Tap and listen!", "どれを きいてみる？");
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
    Cheer.say("Roll the dice!", "サイコロを ふってね");
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
  // ・毎回ちがう問題（ことば93こ から ランダム）
  // ・★ → ★★ → ★★★ で むずかしく
  // ・まちがえた ことばは 次から 多めに出る
  const VOCAB = D.vocab;
  const ALL = VOCAB.flatMap((c) => c.items);
  const catOf = (id) => VOCAB.find((c) => c.id === id);
  const STARS = (l) => "★".repeat(l);
  const { store } = window.CORE;
  const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const sample = (arr, n) => shuffle(arr).slice(0, n);

  const GAMES = [
    { id: "listen", ja: "きいて えらぼう", en: "Listen and choose", icon: "emoji:👂", lv: ["ことばを きいて えを えらぶ（3つから）", "みじかい ぶんを きいて えらぶ（4つから）", "ぶんを きいて えらぶ（6つから）"] },
    { id: "first", ja: "さいしょの もじ", en: "First letter", icon: "emoji:🅰️", lv: ["えの ことばは なにで はじまる？（おおもじ）", "こもじで こたえる", "にている もじ（b d p q）も まざる"] },
    { id: "read", ja: "よんで えらぼう", en: "Read and choose", icon: "emoji:📖", lv: ["たんごを よんで えを えらぶ", "4つから えらぶ", "ぶんを よんで えらぶ"] },
    { id: "spell", ja: "ことばを つくろう", en: "Spell the word", icon: "emoji:✏️", lv: ["3もじの ことば（うすい もじが ヒント）", "4〜5もじ（さいしょの もじだけ ヒント）", "ながい ことば（ヒント なし）"] },
    { id: "shadow", ja: "かげ あて", en: "Guess the shadow", icon: "emoji:👤", lv: ["かげを みて えらぶ（3つから）", "おなじ なかまから 4つ", "かげの いちぶ だけ みえる"] },
    { id: "opposite", ja: "どっちかな？", en: "Big or little?", icon: "opp:big", lv: ["おおきい？ ちいさい？", "どれが おおきい／ながい？（3つから）", "おおきさが にている 4つから"] },
    { id: "hunt", ja: "もじ さがし", en: "Find the letters", icon: "emoji:🔍", lv: ["1しゅるいの もじを ぜんぶ さがす", "にている もじが まざる（3かい）", "えの さいしょの もじを さがす（3かい）"] },
    { id: "dots", ja: "ABC てん つなぎ", en: "Connect A to Z", icon: "emoji:🔗", lv: ["おおもじを ABC じゅんに 6こ", "こもじを abc じゅんに 10こ（ヒント なし）", "Aa Bb Cc… おおもじと こもじを じゅんばんに"] },
    { id: "match", ja: "なかま あわせ", en: "Match", icon: "emoji:🧩", lv: ["おおもじと こもじ（5くみ）", "にている こもじも（7くみ）", "えいごの ことばと え（6くみ）"] },
    { id: "mix", ja: "ランダム チャレンジ", en: "Random challenge", icon: "emoji:🎲", special: true, lv: ["いろんな ゲームが ランダムに 10もん", "いろんな ゲームが ランダムに 10もん", "いろんな ゲームが ランダムに 12もん"] }
  ];
  const gameById = (id) => GAMES.find((g) => g.id === id);

  // 苦手な ことば・まだ出ていない ことばを 多めに えらぶ
  const Stats = {
    get() { return store.get("wordstats", {}); },
    mark(id, ok) {
      if (!id) return;
      const s = this.get(); const r = s[id] || { seen: 0, wrong: 0, right: 0 };
      r.seen++; if (ok) r.right++; else r.wrong++;
      s[id] = r; store.set("wordstats", s);
      const recent = store.get("recentwords", []); recent.unshift(id); store.set("recentwords", recent.slice(0, 30));
    },
    pick(pool, n) {
      const s = this.get(), recent = store.get("recentwords", []);
      const items = pool.map((it) => {
        const r = s[it.id] || { seen: 0, wrong: 0, right: 0 };
        let w = 1 + r.wrong * 1.5 - Math.min(r.right, 4) * 0.2 + (r.seen ? 0 : 1);
        if (recent.slice(0, 12).includes(it.id)) w *= 0.35;
        return { it, w: Math.max(0.15, w) * (0.6 + Math.random() * 0.8) };
      });
      const out = [];
      while (out.length < n && items.length) {
        const total = items.reduce((t, x) => t + x.w, 0);
        let r = Math.random() * total, k = 0;
        while (r > items[k].w && k < items.length - 1) { r -= items[k].w; k++; }
        out.push(items.splice(k, 1)[0].it);
      }
      return out;
    }
  };
  const Levels = {
    get(id) { return store.get("gamelevels", {})[id] || 1; },
    up(id, lv) { const all = store.get("gamelevels", {}); all[id] = Math.max(all[id] || 1, Math.min(3, lv)); store.set("gamelevels", all); }
  };
  // まちがい用の えらびし（同じ なかまから、同じ ことば・同じ え は 出さない）
  function distractors(it, k, pool) {
    const same = (pool || catOf(it.cat).items).filter((x) => x.id !== it.id && x.art !== it.art && x.label !== it.label);
    let out = sample(same, k);
    if (out.length < k) out = out.concat(sample(ALL.filter((x) => x.id !== it.id && !out.includes(x) && x.art !== it.art), k - out.length));
    return out;
  }
  const PIC_CATS = ["items", "shapes", "family", "animals", "fruits", "clothes", "colors", "weather", "numbers", "time"];
  const picPool = (cats) => ALL.filter((x) => cats.includes(x.cat));
  const optPic = (x, withWord) => ({ id: x.id, html: A.render(x.art) + (withWord ? `<small>${esc(x.label)}</small>` : "") });

  // ---------- 問題を つくる ----------
  const MAKE = {
    listen(lv, n) {
      const cats = lv === 1 ? ["items", "shapes", "family", "animals", "fruits", "colors"] : PIC_CATS;
      return Stats.pick(picPool(cats), n).map((it) => {
        const k = lv === 1 ? 2 : lv === 2 ? 3 : 5;
        const en = lv === 1 ? it.label : it.sent;
        return {
          wordId: it.id, title: "Listen and choose.", sub: "よく きいて えらんでね", big: true,
          speak: { en, enOnly: true }, bubble: ["Listen!", "よく きいてね"], replayOnWrong: true,
          options: shuffle([it].concat(distractors(it, k))).map((x) => optPic(x)), answer: it.id, cols: lv === 3 ? 3 : lv === 2 ? 2 : 3,
          after: { ja: lv === 1 ? it.ja : it.sja, en: lv === 1 ? it.label : it.sent }
        };
      });
    },
    read(lv, n) {
      return Stats.pick(picPool(PIC_CATS), n).map((it) => {
        const text = lv === 3 ? it.sent : it.label;
        return {
          wordId: it.id, title: "Read and choose.", sub: "よんで えを えらんでね",
          speak: { ja: "よんで えらんでね", en: "Read and choose." }, bubble: ["Read!", "よんでみてね"],
          visual: `<div class="word-card ${lv === 3 ? "sent" : ""}">${esc(text)}</div>`,
          options: shuffle([it].concat(distractors(it, lv === 1 ? 2 : 3))).map((x) => optPic(x)), answer: it.id, cols: lv === 1 ? 3 : 2,
          after: { ja: lv === 3 ? it.sja : it.ja, en: text }
        };
      });
    },
    first(lv, n) {
      const pool = ALL.filter((x) => x.cat !== "time" && /^[a-z]+$/i.test(x.word));
      const LOOK = { b: "dpq", d: "bpq", p: "qbd", q: "pdb", m: "nw", n: "mu", u: "nv", w: "mv", i: "lj", l: "it", c: "eo", e: "co", h: "nk", f: "tl", t: "fl", s: "zc", g: "qy", y: "vg", r: "nh", o: "ca", a: "oe", k: "hx", v: "uw", z: "sx", j: "ig", x: "kz" };
      return Stats.pick(pool, n).map((it) => {
        const L = it.word[0].toLowerCase();
        let others = lv === 3 ? (LOOK[L] || "").split("") : [];
        const rest = shuffle("abcdefghijklmnopqrstuvwxyz".split("").filter((c) => c !== L && !others.includes(c)));
        others = others.concat(rest).slice(0, lv === 1 ? 2 : 3);
        const fmt = (c) => (lv === 1 ? c.toUpperCase() : lv === 2 ? c : Math.random() < 0.5 ? c.toUpperCase() : c);
        const letters = shuffle([L].concat(others));
        return {
          wordId: it.id, title: "What's the first letter?", sub: "さいしょの もじは どれ？",
          speak: { en: it.label, enOnly: true }, bubble: ["Listen!", "さいしょの もじは どれ？"], replayOnWrong: true,
          visual: `<div class="q-pic">${A.render(it.art)}</div>`,
          options: letters.map((c) => ({ id: c, html: `<b class="opt-letter">${fmt(c)}</b>` })), answer: L, cols: letters.length === 3 ? 3 : 4, optClass: "letters",
          after: { en: `${L.toUpperCase()}. ${it.label}.`, ja: it.ja }
        };
      });
    },
    spell(lv, n) {
      const len = lv === 1 ? [3, 3] : lv === 2 ? [4, 5] : [5, 10];
      let pool = ALL.filter((x) => /^[a-z]+$/.test(x.word) && x.word.length >= len[0] && x.word.length <= len[1] && x.cat !== "time");
      if (pool.length < n) pool = ALL.filter((x) => /^[a-z]+$/.test(x.word) && x.word.length <= len[1]);
      return Stats.pick(pool, n).map((it) => {
        const letters = it.word.split("");
        const extra = sample("abcdefghijklmnopqrstuvwxyz".split("").filter((c) => !letters.includes(c)), lv === 1 ? 2 : lv === 2 ? 3 : 4);
        const tiles = shuffle(letters.concat(extra)).map((c, i) => ({ id: "t" + i + c, html: `<b class="opt-letter">${c}</b>`, ch: c }));
        return {
          type: "seq", wordId: it.id, title: "Spell the word.", sub: "じゅんばんに もじを タップ",
          speak: { en: it.label, enOnly: true }, bubble: [lv === 1 ? it.label : "Spell it!", "もじを じゅんばんに タップしてね"],
          visual: `<div class="q-pic small">${A.render(it.art)}</div>`, hint: lv === 1 ? "all" : lv === 2 ? "first" : "none",
          options: tiles, answer: letters, cols: Math.min(tiles.length, 6), optClass: "letters tiles-sm",
          after: { ja: it.ja, en: it.label }
        };
      });
    },
    shadow(lv, n) {
      const cats = ["items", "shapes", "family", "animals", "fruits", "clothes", "weather"];
      return Stats.pick(picPool(cats), n).map((it) => {
        const pool = lv === 1 ? picPool(cats).filter((x) => x.cat !== it.cat) : catOf(it.cat).items;
        const opts = shuffle([it].concat(distractors(it, lv === 1 ? 2 : 3, pool)));
        const shadowArt = lv === 3 ? A.render(it.art) : it.art.startsWith("shape:") ? A.wrap(A.shape(it.art.split(":")[1], { fill: "#3B2A3F", stroke: "#3B2A3F" }), "0 0 200 200") : A.render(it.art);
        const peek = lv === 3 ? `style="--px:${randInt(30, 70)}%;--py:${randInt(30, 70)}%"` : "";
        return {
          wordId: it.id, title: "What's this?", sub: "これは なに？",
          speak: { ja: "これは なに？", en: "What's this?" }, bubble: ["What's this?", lv === 3 ? "すこしだけ みえるよ" : "かげを よく みてね"],
          visual: `<div class="shadow ${lv === 3 ? "peek" : "sil"}" ${peek}>${shadowArt}</div>`, revealOnRight: true,
          options: opts.map((x) => optPic(x, lv < 3)), answer: it.id, cols: opts.length === 3 ? 3 : 2,
          after: { ja: it.ja, en: it.sent }
        };
      });
    },
    opposite(lv, n) {
      const things = ALL.filter((x) => x.art.startsWith("emoji:") || ["bag", "robot", "doll", "book", "bike"].includes(x.word));
      const qs = [];
      for (let i = 0; i < n; i++) {
        const kind = Math.random() < 0.6 ? "size" : "length";
        const WORD = { big: "おおきい", little: "ちいさい", long: "ながい", short: "みじかい" };
        if (lv === 1) {
          const ans = kind === "size" ? pick(["big", "little"]) : pick(["long", "short"]);
          const it = pick(things);
          const visual = kind === "size"
            ? `<div class="opp-pic size">${ans === "big" ? `<span class="o-big">${A.render(it.art)}</span>` : `<span class="o-small">${A.render(it.art)}</span>`}<span class="dim ${ans === "big" ? "o-small" : "o-big"}">${A.render(it.art)}</span></div>`
            : `<div class="opp-pic len">${lenArt(ans === "long" ? randInt(6, 9) : randInt(1, 2), true)}${lenArt(ans === "long" ? randInt(1, 2) : randInt(6, 9), false)}</div>`;
          const q = kind === "size" ? "Is it big or little?" : "Is it long or short?";
          const choices = kind === "size" ? ["big", "little"] : ["long", "short"];
          qs.push({ title: q, sub: kind === "size" ? "いろの ついた ほうは おおきい？ ちいさい？" : "いろの ついた ほうは ながい？ みじかい？", speak: { en: q, enOnly: true }, bubble: [q, ""],
            visual, options: choices.map((c) => ({ id: c, html: `<b>${c}</b><small>${WORD[c]}</small>`, cls: "word" })), answer: ans, cols: 2, after: { ja: WORD[ans] + "よ。", en: `It's ${ans}.` } });
        } else {
          const count = lv === 2 ? 3 : 4;
          const target = kind === "size" ? pick(["big", "little"]) : pick(["long", "short"]);
          let sizes;
          if (kind === "size") sizes = lv === 2 ? shuffle([0.45, 0.72, 1]) : shuffle([0.62, 0.74, 0.87, 1]);
          else sizes = lv === 2 ? shuffle([2, 4, 8]) : shuffle([3, 4, 5, 6]).map((x, k) => x);
          const best = target === "big" || target === "long" ? Math.max(...sizes) : Math.min(...sizes);
          const it = pick(things);
          const options = sizes.map((s, k) => ({ id: "o" + k + "_" + s, html: kind === "size" ? `<span class="szbox"><span style="transform:scale(${s})">${A.render(it.art)}</span></span>` : lenArt(s, true), cls: "opt-size" + (kind === "length" ? " opt-len" : "") }));
          const ans = options[sizes.indexOf(best)].id;
          const q = `Which one is ${target}?`;
          qs.push({ title: q, sub: `${WORD[target]} のは どれ？`, speak: { en: q, enOnly: true }, bubble: [q, `${WORD[target]} のは どれ？`],
            options, answer: ans, cols: count === 3 ? 3 : 2, after: { ja: WORD[target] + "ね。", en: `This one is ${target}.` } });
        }
      }
      return qs;
    }
  };
  // ながさの え（でんしゃ）：車両の数で 本当に ながさが かわる
  function lenArt(cars, on) {
    let svg = `<rect x="2" y="10" width="30" height="30" rx="5" fill="#3E7CC9" stroke="#3B2A3F" stroke-width="3"/><rect x="4" y="2" width="14" height="12" rx="3" fill="#3E7CC9" stroke="#3B2A3F" stroke-width="3"/><circle cx="10" cy="43" r="5" fill="#3B2A3F"/><circle cx="25" cy="43" r="5" fill="#3B2A3F"/>`;
    for (let i = 0; i < cars; i++) {
      const x = 36 + i * 24;
      svg += `<rect x="${x}" y="14" width="21" height="26" rx="4" fill="#E2603F" stroke="#3B2A3F" stroke-width="3"/><circle cx="${x + 6}" cy="43" r="4" fill="#3B2A3F"/><circle cx="${x + 16}" cy="43" r="4" fill="#3B2A3F"/>`;
    }
    return `<span class="len-row ${on ? "" : "dim"}">${A.wrap(svg, "0 0 260 50")}</span>`;
  }

  // ---------- 問題を すすめる しくみ（えらぶ／じゅんばんに タップ） ----------
  function runQuiz(game, lv, qs) {
    Timer.start();
    let n = 0, score = 0;
    const draw = () => {
      const q = qs[n]; let tries = 0;
      view().innerHTML = `${topbar(game.ja, "game/" + game.id, STARS(lv))}
        <section class="quiz">
          <div class="q-head"><span class="q-num">${n + 1} / ${qs.length}</span><span class="stars">${"★".repeat(score)}${"☆".repeat(qs.length - score)}</span></div>
          <button class="ask ${q.big ? "big" : ""}" id="ask"><span class="ask-emoji">🔈</span><span><b>${esc(q.title)}</b><small>${esc(q.sub || "")}</small></span></button>
          ${q.visual ? `<div class="q-visual">${q.visual}</div>` : ""}
          ${q.type === "seq" ? `<div class="spell-slots" id="slots">${q.answer.map((c, i) => `<span class="${q.hint === "all" || (q.hint === "first" && i === 0) ? "hint" : ""}" data-c="${c}">${q.hint === "all" || (q.hint === "first" && i === 0) ? c : ""}</span>`).join("")}</div>` : ""}
          <div class="opts cols-${q.cols || 3} ${q.optClass || ""}">${q.options.map((o) => `<button class="opt ${o.cls || ""}" data-id="${esc(o.id)}">${o.html}</button>`).join("")}</div>
        </section>`;
      const play = () => Speech.say(q.speak.ja || null, q.speak.en, { el: $("#ask"), bubble: q.bubble, enOnly: q.speak.enOnly });
      $("#ask").onclick = play; setTimeout(play, 250);
      const done = async (el) => {
        if (tries === 0) score++;
        Stats.mark(q.wordId, tries === 0);
        $$(".opt").forEach((x) => (x.disabled = true));
        if (el) { el.classList.add("right"); bump(el, true); }
        if (q.revealOnRight) { const s = $(".shadow"); if (s) s.classList.add("lit"); }
        Cheer.play("correct", pick(Cheer.LINES.correct));
        await Speech.say(q.after.ja, q.after.en, { el: el || $("#slots") });
        await wait(450);
        n++;
        if (document.body.dataset.route !== "game") return;
        if (n < qs.length) draw(); else finish();
      };
      if (q.type === "seq") {
        let pos = 0;
        const slots = $$("#slots span");
        $$(".opt").forEach((b) => b.addEventListener("click", () => {
          const t = q.options.find((o) => o.id === b.dataset.id);
          if (t.ch === q.answer[pos]) {
            slots[pos].textContent = t.ch; slots[pos].classList.add("filled"); slots[pos].classList.remove("hint");
            b.disabled = true; b.classList.add("used");
            Speech.en(t.ch, { noBubble: true });
            pos++;
            if (pos === q.answer.length) done(null);
          } else { tries++; bump(b, false); Speech.en(t.ch, { noBubble: true }); }
        }));
      } else {
        $$(".opt").forEach((b) => b.addEventListener("click", () => {
          if (b.dataset.id === q.answer) done(b);
          else {
            tries++; Stats.mark(q.wordId, false); bump(b, false); b.disabled = true;
            if (q.replayOnWrong) setTimeout(play, 700);
          }
        }));
      }
    };
    const finish = () => finishLevel(game, lv, score, qs.length);
    draw();
  }

  function finishLevel(game, lv, score, total) {
    const good = score / total >= 0.8;
    if (good && lv < 3) Levels.up(game.id, lv + 1);
    view().innerHTML = `${topbar("けっか", "game/" + game.id, game.ja + " " + STARS(lv))}
      <section class="result"><p class="big-stars">${"★".repeat(score)}<span>${"★".repeat(Math.max(0, total - score))}</span></p>
      <h2>${score} / ${total}</h2>
      <p>${score === total ? "ぜんもん せいかい！" : good ? "よく できたね！" : "もういちど やってみよう！"}${good && lv < 3 ? `<br><b class="next-lv">つぎは ${STARS(lv + 1)} に チャレンジ！</b>` : ""}</p>
      <div class="result-btns">
        <a class="btn" href="#/game/${game.id}/${lv}" data-again>もういちど（ちがう もんだい）</a>
        ${lv < 3 ? `<a class="btn primary" href="#/game/${game.id}/${lv + 1}">${STARS(lv + 1)} に すすむ</a>` : ""}
        <a class="btn" href="#/game">ゲームを えらぶ</a>
      </div></section>`;
    const again = $("[data-again]");
    if (again) again.addEventListener("click", (e) => { e.preventDefault(); routes.game(game.id, String(lv)); });
    finishGame(`${game.ja} ${STARS(lv)}`, score, total, `${total}もん中 ${score}もん せいかい！`);
  }

  routes.game = (id, lvArg) => {
    if (!id) {
      view().innerHTML = `${topbar("ゲームで あそぼう", "kids", "Games")}
        <section class="menu-grid">${GAMES.map((g) => `<a class="menu-card ${g.special ? "special" : ""}" href="#/game/${g.id}"><span class="mc-art">${A.render(g.icon)}</span><b>${g.ja}</b><small>${g.en}</small><span class="lv-badge">${STARS(Levels.get(g.id))}</span></a>`).join("")}</section>`;
      Cheer.say("Let's play a game!", "どの ゲームに する？");
      return;
    }
    const game = gameById(id);
    if (!game) return go("game");
    const lv = +lvArg;
    if (!lv || lv < 1 || lv > 3) return levelSelect(game);
    if (id === "hunt") return gameHunt(game, lv);
    if (id === "dots") return gameDots(game, lv);
    if (id === "match") return gameMatch(game, lv);
    if (id === "mix") {
      const kinds = ["listen", "read", "first", "shadow", "opposite", "spell"];
      const total = lv === 3 ? 12 : 10;
      const qs = [];
      for (let i = 0; i < total; i++) { const k = kinds[i % kinds.length]; qs.push(MAKE[k](k === "spell" ? Math.max(1, lv - 1) : lv, 1)[0]); }
      return runQuiz(game, lv, shuffle(qs));
    }
    runQuiz(game, lv, MAKE[id](lv, id === "listen" || id === "read" ? 10 : 8));
  };

  function levelSelect(game) {
    const rec = Levels.get(game.id);
    view().innerHTML = `${topbar(game.ja, "game", game.en)}
      <section class="levels">
        <div class="lv-head"><span class="mc-art">${A.render(game.icon)}</span><p>レベルを えらんでね<br><small>まいかい ちがう もんだいが でるよ</small></p></div>
        ${[1, 2, 3].map((l) => `<a class="lv-card lv${l} ${l === rec ? "rec" : ""}" href="#/game/${game.id}/${l}"><b>${STARS(l)}</b><span>${esc(game.lv[l - 1])}</span>${l === rec ? `<em>おすすめ</em>` : ""}</a>`).join("")}
      </section>`;
    Cheer.say("Choose a level!", "どの レベルに する？");
  }

  function finishGame(name, correct, total, extraMsg) {
    Log.record({ phase: "③ゲーム", item: name, result: correct >= total ? "クリア" : "とちゅう", correct, total, seconds: Timer.sec() });
    Cheer.play("clear", extraMsg || pick(Cheer.LINES.clear));
  }
  function bump(el, ok) {
    el.classList.remove("ok", "ng"); void el.offsetWidth; el.classList.add(ok ? "ok" : "ng");
    if (!ok) Cheer.play("wrong", pick(Cheer.LINES.wrong));
  }

  // A. もじ さがし：★ 1しゅるい ★★ にている もじ入り×3かい ★★★ えの さいしょの もじ×3かい
  function gameHunt(game, lv) {
    Timer.start();
    const rounds = lv === 1 ? 1 : 3;
    const LOOK = { B: "DPR", D: "BOP", P: "RBQ", Q: "OGP", M: "NW", N: "MH", U: "VW", W: "MV", E: "FB", F: "EP", C: "GO", G: "CQ", O: "QDC", I: "LJ", L: "IJ", V: "UY", Y: "VX", K: "XR", R: "PB", S: "Z", Z: "S", H: "NK", T: "FI", A: "R", J: "IL", X: "KY" };
    const words = lv === 3 ? Stats.pick(ALL.filter((x) => /^[a-z]+$/i.test(x.word) && x.cat !== "time"), rounds) : [];
    const letters = lv === 3 ? words.map((w) => w.word[0].toUpperCase()) : sample("ABCDEFGHIJKLMNOPRSTUVWY".split(""), rounds);
    let round = 0, found = 0, totalTargets = 0, misses = 0;
    const draw = () => {
      const L = letters[round], l = L.toLowerCase(), w = words[round];
      const size = lv === 1 ? 16 : 20;
      const nT = randInt(lv === 1 ? 4 : 5, lv === 1 ? 6 : 7);
      const targets = Array.from({ length: nT }, (_, i) => (i % 2 ? l : L));
      const near = (LOOK[L] || "").split("");
      let others = [];
      if (lv >= 2) near.forEach((c) => others.push(c, c.toLowerCase()));
      others = others.concat(sample("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter((c) => c !== L), size));
      const tiles = shuffle(targets.concat(others.slice(0, size - nT).map((c) => (Math.random() < 0.5 ? c.toLowerCase() : c))));
      const emoji = w ? A.render(w.art) : "";
      let got = 0;
      view().innerHTML = `${topbar(game.ja, "game/" + game.id, STARS(lv) + (rounds > 1 ? `　${round + 1} / ${rounds}` : ""))}
        <section class="hunt">
          <button class="ask" id="ask"><span class="ask-emoji">${w ? `<span class="ask-pic">${emoji}</span>` : "🔍"}</span><span><b>${w ? `「${esc(w.label)}」の さいしょの もじを ぜんぶ さがそう` : `「${L}」と「${l}」を ぜんぶ みつけよう`}</b><small>${w ? `Find the first letter of "${esc(w.label)}".` : `Find the big ${L} and the little ${l}.`}</small></span></button>
          <div class="tiles ${lv > 1 ? "t20" : ""}">${tiles.map((c, k) => `<button class="tile" data-c="${c}" style="--r:${randInt(-7, 7)}deg"><b>${c}</b></button>`).join("")}</div>
          <p class="progress"><span id="found">0</span> / ${nT}</p>
        </section>`;
      const intro = () => w
        ? Speech.say(`${w.ja}。さいしょの もじを さがそう`, w.label, { el: $("#ask"), bubble: [w.label, "さいしょの もじは？"] })
        : Speech.say(`おおきい ${L} と ちいさい ${l} を さがそう`, `Find ${L}.`, { el: $("#ask") });
      $("#ask").onclick = intro; intro();
      $$(".tile").forEach((t) => t.addEventListener("click", async () => {
        if (t.classList.contains("got")) return;
        if (t.dataset.c.toUpperCase() === L) {
          t.classList.add("got"); got++; found++; $("#found").textContent = got;
          bump(t, true); Cheer.play("correct", pick(Cheer.LINES.correct));
          Speech.en(t.dataset.c === L ? `big ${L}` : `little ${l}`, { noBubble: true });
          if (got === nT) {
            totalTargets += nT;
            if (w) Stats.mark(w.id, true);
            await wait(800);
            round++;
            if (round < rounds) draw();
            else finishLevel(game, lv, Math.max(0, totalTargets - misses), totalTargets);
          }
        } else { misses++; if (w) Stats.mark(w.id, false); bump(t, false); Speech.en(t.dataset.c, { noBubble: true }); }
      }));
    };
    draw();
  }

  // B. ABC てん つなぎ：ばしょは まいかい ランダム
  function gameDots(game, lv) {
    Timer.start();
    const AB = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let seq;
    if (lv === 1) { const s = randInt(0, 20); seq = AB.slice(s, s + 6).split(""); }
    else if (lv === 2) { const s = randInt(0, 16); seq = AB.slice(s, s + 10).toLowerCase().split(""); }
    else { const s = randInt(0, 20); seq = AB.slice(s, s + 6).split("").flatMap((c) => [c, c.toLowerCase()]); }
    const N = seq.length;
    const pts = [];
    let guard = 0;
    while (pts.length < N && guard++ < 4000) {
      const p = [32 + Math.random() * 296, 32 + Math.random() * 296];
      if (pts.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 58) && (pts.length === 0 || Math.hypot(pts[pts.length - 1][0] - p[0], pts[pts.length - 1][1] - p[1]) < 170)) pts.push(p);
    }
    while (pts.length < N) pts.push([32 + Math.random() * 296, 32 + Math.random() * 296]);
    const decoys = [];
    if (lv >= 2) {
      const pool = AB.split("").filter((c) => !seq.map((x) => x.toUpperCase()).includes(c));
      for (let k = 0, g = 0; k < 4 && g < 800; g++) {
        const p = [30 + Math.random() * 300, 30 + Math.random() * 300];
        if (pts.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 54) && decoys.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 54)) { decoys.push(p.concat(lv === 2 ? pick(pool).toLowerCase() : pick(pool))); k++; }
      }
    }
    const prize = pick(picPool(["animals", "fruits"]));
    let next = 0, misses = 0;
    view().innerHTML = `${topbar(game.ja, "game/" + game.id, STARS(lv))}
      <section class="dots">
        <button class="ask" id="ask"><span class="ask-emoji">🔗</span><span><b>${seq[0]} から じゅんばんに つなごう</b><small>Connect ${seq[0]} to ${seq[N - 1]}.</small></span></button>
        <div class="dot-board"><svg viewBox="0 0 360 360" id="dsvg">
          <g id="lines"></g>
          <g class="reveal" id="reveal"><foreignObject x="110" y="110" width="140" height="140"><div xmlns="http://www.w3.org/1999/xhtml" class="prize">${A.render(prize.art)}</div></foreignObject></g>
          ${decoys.map((d) => `<g class="dd decoy" transform="translate(${d[0]} ${d[1]})"><circle r="22"/><text y="9">${d[2]}</text></g>`).join("")}
          ${pts.map((p, k) => `<g class="dd target" data-k="${k}" transform="translate(${p[0]} ${p[1]})"><circle r="22"/><text y="9">${seq[k]}</text></g>`).join("")}
        </svg></div>
        <p class="progress"><span id="cnt">0</span> / ${N}</p>
      </section>`;
    const intro = () => Speech.say(`${seq[0]} から じゅんばんに つなごう`, `Connect ${seq[0]} to ${seq[N - 1]}.`, { el: $("#ask") });
    $("#ask").onclick = intro; intro();
    const mark = () => $$(".target").forEach((g) => g.classList.toggle("next", lv === 1 && +g.dataset.k === next));
    mark();
    $$(".dd", $("#dsvg")).forEach((g) => g.addEventListener("click", async () => {
      if (g.classList.contains("target") && +g.dataset.k === next) {
        g.classList.add("done");
        if (next > 0) { const a = pts[next - 1], b = pts[next]; $("#lines").insertAdjacentHTML("beforeend", `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`); }
        Speech.en(seq[next], { noBubble: true });
        next++; $("#cnt").textContent = next; mark();
        if (next % 4 === 0) Cheer.play("correct", pick(Cheer.LINES.correct));
        if (next === N) {
          $("#reveal").classList.add("show");
          await wait(600);
          await Speech.say(prize.ja, prize.sent);
          finishLevel(game, lv, Math.max(0, N - misses), N);
        }
      } else if (!g.classList.contains("done")) { misses++; bump(g, false); Speech.en($("text", g).textContent, { noBubble: true }); }
    }));
  }

  // C. なかま あわせ：★ おおもじ↔こもじ ★★ にている こもじ入り ★★★ ことば↔え
  function gameMatch(game, lv) {
    Timer.start();
    let left, right;
    if (lv < 3) {
      const base = lv === 1 ? sample("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), 5) : shuffle(sample("BDPQMNUW".split(""), 4).concat(sample("ACEFGHIJKLORSTVXYZ".split(""), 3)));
      left = base.map((c) => ({ key: c, html: c, say: c }));
      right = shuffle(base).map((c) => ({ key: c, html: c.toLowerCase(), say: c.toLowerCase() }));
    } else {
      const its = Stats.pick(picPool(["animals", "fruits", "items", "clothes", "colors", "weather"]), 6);
      left = its.map((it) => ({ key: it.id, html: esc(it.label), say: it.label, word: true }));
      right = shuffle(its).map((it) => ({ key: it.id, html: A.render(it.art), pic: true }));
    }
    let sel = null, done = 0, miss = 0;
    view().innerHTML = `${topbar(game.ja, "game/" + game.id, STARS(lv))}
      <section class="match">
        <button class="ask" id="ask"><span class="ask-emoji">🧩</span><span><b>${lv < 3 ? "おなじ もじを つなごう" : "ことばと えを つなごう"}</b><small>${lv < 3 ? "Match the big and little letters." : "Match the words and pictures."}</small></span></button>
        <div class="match-board ${lv === 3 ? "words" : ""}" id="mb">
          <svg class="match-lines" id="ml"></svg>
          <div class="col left">${left.map((x) => `<button class="lt ${x.word ? "lt-word" : ""}" data-k="${esc(x.key)}">${x.html}</button>`).join("")}</div>
          <div class="col right">${right.map((x) => `<button class="lt ${x.pic ? "lt-pic" : ""}" data-k="${esc(x.key)}">${x.html}</button>`).join("")}</div>
        </div>
      </section>`;
    const intro = () => Speech.say(lv < 3 ? "おおきい もじと ちいさい もじを つなごう" : "ことばと えを つなごう", lv < 3 ? "Match the letters." : "Match the words and pictures.", { el: $("#ask") });
    $("#ask").onclick = intro; intro();
    const pairs = [];
    const COLORS = ["#C2357A", "#3E7CC9", "#4FA35B", "#F2994A", "#B48AD6", "#2BB3A3", "#E0B000"];
    const redraw = () => {
      const mb = $("#mb"); if (!mb) return;
      const box = mb.getBoundingClientRect(), svg = $("#ml");
      svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
      svg.innerHTML = pairs.map(([a, b], k) => { const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return `<line x1="${ra.right - box.left}" y1="${ra.top + ra.height / 2 - box.top}" x2="${rb.left - box.left}" y2="${rb.top + rb.height / 2 - box.top}" stroke="${COLORS[k % COLORS.length]}"/>`; }).join("");
    };
    const onResize = () => { if (!document.body.contains($("#mb"))) return window.removeEventListener("resize", onResize); redraw(); };
    window.addEventListener("resize", onResize);
    $$(".left .lt").forEach((b) => b.addEventListener("click", () => {
      if (b.classList.contains("done")) return;
      $$(".left .lt").forEach((x) => x.classList.remove("sel"));
      b.classList.add("sel"); sel = b;
      Speech.en(left.find((x) => x.key === b.dataset.k).say, { noBubble: true });
    }));
    $$(".right .lt").forEach((b) => b.addEventListener("click", async () => {
      if (b.classList.contains("done")) return;
      if (!sel) { bump(b, false); Cheer.say("Choose on the left!", "さきに ひだりから えらんでね"); return; }
      if (sel.dataset.k === b.dataset.k) {
        sel.classList.remove("sel"); sel.classList.add("done"); b.classList.add("done");
        pairs.push([sel, b]); redraw(); done++;
        if (lv === 3) Stats.mark(b.dataset.k, true);
        Cheer.play("correct", pick(Cheer.LINES.correct));
        const r = right.find((x) => x.key === b.dataset.k), l = left.find((x) => x.key === b.dataset.k);
        Speech.en(lv < 3 ? `${l.say}. ${r.say}.` : l.say, { noBubble: true });
        sel = null;
        if (done === left.length) { await wait(900); finishLevel(game, lv, Math.max(0, left.length - miss), left.length); }
      } else { miss++; if (lv === 3) Stats.mark(sel.dataset.k, false); bump(b, false); }
    }));
  }


  // ---------------- 設定 ----------------
  function openSettings() {
    const s = Settings.data;
    const backup = Object.assign({}, s);
    const dlg = document.getElementById("settings");
    const q = Log.queue().length, h = Log.history().length;
    const sel = (cur, v) => (cur === v ? "selected" : "");
    const voiceOpts = (lang, cur) => {
      const list = Speech.voiceList(lang);
      const auto = list[0] ? `おすすめ（${list[0].name.replace(/^Microsoft |\s*\(.*\)| Online.*$/g, "")}）` : "おすすめ";
      return `<option value="">${esc(auto)}</option>` + list.map((v) => `<option value="${esc(v.name)}" ${sel(cur, v.name)}>${esc(v.name)}</option>`).join("");
    };
    dlg.innerHTML = `<form method="dialog" class="set-form">
      <h2>せってい</h2>
      <label>なまえ（記録に のります）<input name="name" value="${esc(s.name)}" placeholder="例：はなこ"></label>
      <label>よみあげの はやさ
        <select name="speed"><option value="slow" ${sel(s.speed, "slow")}>ゆっくり（5さい むけ）</option><option value="normal" ${sel(s.speed, "normal")}>ふつう</option><option value="fast" ${sel(s.speed, "fast")}>はやい</option></select></label>
      <label>こえの たかさ
        <select name="pitch"><option value="high" ${sel(s.pitch, "high")}>たかめ（こども むけ）</option><option value="normal" ${sel(s.pitch, "normal")}>ふつう</option></select></label>
      <label>よみあげ
        <select name="order"><option value="ja-en" ${sel(s.order, "ja-en")}>にほんご → えいご</option><option value="en" ${sel(s.order, "en")}>えいご だけ</option></select></label>
      <details><summary>こえを えらぶ（にほんご／えいご）</summary>
        <label>にほんごの こえ<select name="voiceJa">${voiceOpts("ja", s.voiceJa)}</select></label>
        <label>えいごの こえ<select name="voiceEn">${voiceOpts("en", s.voiceEn)}</select></label>
        <p class="note">端末に入っている声から、女性の声を上に並べています。iPhone・iPadは「設定 → アクセシビリティ → 読み上げコンテンツ → 声」で声を追加できます。</p>
      </details>
      <button class="btn" type="button" id="setTry">🔈 ためしに きく</button>
      <details ${s.gasUrl ? "" : "open"}><summary>保護者の方へ：学習記録（スプレッドシート）</summary>
        <label>Apps Script のウェブアプリURL<input name="gasUrl" value="${esc(s.gasUrl)}" placeholder="https://script.google.com/macros/s/.../exec"></label>
        <p class="note">記録 ${h}件（未送信 ${q}件）。URLが空のときは、この端末に記録をためておき、URLを入れると まとめて送ります。</p>
      </details>
      <div class="set-btns"><button class="btn" value="cancel" id="setCancel">とじる</button><button class="btn primary" value="ok" id="setOk">ほぞん</button></div>
    </form>`;
    dlg.showModal();
    const f = $(".set-form", dlg);
    const voicePart = () => ({ speed: f.speed.value, pitch: f.pitch.value, order: f.order.value, voiceJa: f.voiceJa.value, voiceEn: f.voiceEn.value });
    $("#setTry", dlg).addEventListener("click", () => {
      Object.assign(Settings.data, voicePart()); // 保存はせずに、いまの選び方で読んでみる
      Speech.say("カバンが ほしい。", "I want a bag.");
    });
    $("#setCancel", dlg).addEventListener("click", () => { Speech.stop(); Object.assign(Settings.data, backup); });
    $("#setOk", dlg).addEventListener("click", () => {
      Settings.save(Object.assign({ name: f.name.value.trim(), gasUrl: f.gasUrl.value.trim() }, voicePart()));
      Log.flush();
      Speech.say("せっていを ほぞんしたよ", "OK!");
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
