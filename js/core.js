// =============================================================
//  共通のしくみ：読み上げ / 応援キャラ / 学習記録 / 設定
// =============================================================
(function () {
  const store = {
    get(k, d) { try { const v = localStorage.getItem("eapp:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("eapp:" + k, JSON.stringify(v)); } catch (e) {} }
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // ---------------- 設定 ----------------
  // speed: slow（5さいむけ）/ normal / fast　pitch: high（こどもむけ）/ normal
  // voiceJa / voiceEn: "" = おすすめを自動でえらぶ、それ以外は声の名前
  const SETTINGS_VERSION = 2;
  const DEFAULTS = { v: SETTINGS_VERSION, name: "", gasUrl: (window.APP_CONFIG && window.APP_CONFIG.gasUrl) || "", speed: "slow", pitch: "high", voiceJa: "", voiceEn: "", order: "ja-en", mode: "" };
  const saved = store.get("settings", {});
  if ((saved.v || 1) < SETTINGS_VERSION) { // 前のバージョンの設定は、新しい「こども向け」の声と速さにそろえる
    delete saved.enRate; saved.speed = "slow"; saved.pitch = "high"; saved.v = SETTINGS_VERSION;
  }
  const Settings = {
    data: Object.assign({}, DEFAULTS, saved),
    save(patch) { Object.assign(this.data, patch); store.set("settings", this.data); }
  };
  if (!Settings.data.gasUrl && DEFAULTS.gasUrl) Settings.data.gasUrl = DEFAULTS.gasUrl;
  store.set("settings", Settings.data);

  // ---------------- 読み上げ ----------------
  const synth = window.speechSynthesis;
  let voices = [];
  function loadVoices() { voices = synth ? synth.getVoices() : []; }
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }
  // iPhone / iPad：最初のタップで読み上げを「解錠」しておく（以降は自動で読める）
  let unlocked = false;
  function unlockSpeech() {
    if (unlocked || !synth) return;
    unlocked = true;
    try { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; synth.speak(u); } catch (e) {}
    loadVoices();
  }
  ["pointerdown", "touchend", "click"].forEach((ev) => document.addEventListener(ev, unlockSpeech, { once: true, passive: true }));
  // アプリを閉じたり別のアプリに切り替えたら読み上げを止める
  document.addEventListener("visibilitychange", () => { if (document.hidden && synth) { token++; synth.cancel(); } });
  // 子どもが聞きやすい「女性の声」を優先してえらぶ（端末に入っている声の中から）
  const FEMALE = {
    // en: Ana は子どもの声（Edge / Windows）。そのあとは明るい女性の声
    en: ["Ana Online", "Microsoft Ana", "Jenny Online", "Aria Online", "Michelle Online", "Samantha", "Google US English", "Ava", "Allison", "Susan", "Zoe", "Karen", "Tessa", "Moira", "Fiona", "Victoria", "Zira", "Microsoft Aria", "Microsoft Jenny", "Google UK English Female"],
    ja: ["Nanami Online", "Aoi Online", "Mayu Online", "Microsoft Nanami", "Google 日本語", "Kyoko", "O-Ren", "Sayaka", "Microsoft Ayumi", "Microsoft Haruka", "Mizuki"]
  };
  const MALE = /(Daniel|Alex\b|Fred|Tom\b|Aaron|Guy|David|Mark|Rishi|Arthur|Oliver|Gordon|Ralph|Albert|Bruce|Junior|Eddy|Reed|Rocko|Grandpa|Male|Otoya|Hattori|Ichiro|Keita|Daichi|Naoki|Kenji)/i;
  function voicesFor(lang) {
    return voices.filter((v) => v.lang && v.lang.toLowerCase().replace("_", "-").startsWith(lang === "en" ? "en" : "ja"));
  }
  function rankVoices(lang) {
    const list = voicesFor(lang);
    const score = (v) => {
      const i = FEMALE[lang].findIndex((p) => v.name.includes(p));
      if (i >= 0) return i;
      if (MALE.test(v.name)) return 900;
      return lang === "en" && !/en[-_]US/i.test(v.lang) ? 500 : 400;
    };
    return list.slice().sort((a, b) => score(a) - score(b));
  }
  function voiceFor(lang) {
    const want = lang === "en" ? Settings.data.voiceEn : Settings.data.voiceJa;
    if (want) { const v = voicesFor(lang).find((x) => x.name === want); if (v) return v; }
    return rankVoices(lang)[0] || null;
  }
  // 速さ（rate）と高さ（pitch）。slow = 5さいの子が聞き取りやすい速さ
  const RATE = { slow: { ja: 0.85, en: 0.62 }, normal: { ja: 0.95, en: 0.78 }, fast: { ja: 1.05, en: 0.92 } };
  function rateFor(lang) { return (RATE[Settings.data.speed] || RATE.slow)[lang]; }
  function pitchFor(v) {
    if (Settings.data.pitch !== "high") return 1.0;
    return v && /Ana/.test(v.name) ? 1.08 : 1.25; // もともと子どもの声なら上げすぎない
  }
  let token = 0;
  function speakOne(text, lang, myToken) {
    return new Promise((resolve) => {
      if (!synth || !text || myToken !== token) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === "en" ? "en-US" : "ja-JP";
      const v = voiceFor(lang); if (v) u.voice = v;
      u.rate = rateFor(lang);
      u.pitch = pitchFor(v);
      let done = false;
      const fin = () => { if (!done) { done = true; resolve(); } };
      u.onend = fin; u.onerror = fin;
      // 一部ブラウザで onend が来ないときの保険
      setTimeout(fin, 2500 + text.length * (lang === "en" ? 150 : 240) / u.rate);
      synth.speak(u);
      if (synth.paused) synth.resume();
    });
  }
  const Speech = {
    get speaking() { return speakingFlag; },
    stop() { token++; if (synth) synth.cancel(); setSpeaking(false); },
    // 日本語 → 英語 の順で読む（設定で英語だけにもできる）
    async say(ja, en, opts = {}) {
      this.stop();
      const my = token;
      setSpeaking(true, opts.el);
      if (ja && Settings.data.order !== "en" && !opts.enOnly) { await speakOne(ja, "ja", my); await wait(Settings.data.speed === "slow" ? 650 : 350); }
      if (en) await speakOne(en, "en", my);
      if (my === token) setSpeaking(false, opts.el);
    },
    en(text, opts = {}) { return this.say(null, text, opts); },
    voiceList(lang) { return rankVoices(lang); },
    currentVoice(lang) { return voiceFor(lang); }
  };
  let speakingFlag = false;
  function setSpeaking(on, el) {
    speakingFlag = on;
    document.body.classList.toggle("is-speaking", on);
    document.querySelectorAll(".speaking").forEach((n) => n.classList.remove("speaking"));
    if (on && el) el.classList.add("speaking");
  }

  // ---------------- 応援キャラ ----------------
  const LINES = {
    hello: ["いっしょに がんばろう！", "Let's go!", "きょうも よろしくね！"],
    tap: ["いいね！", "Good!", "そのちょうし！", "Nice!", "じょうず！"],
    correct: ["せいかい！", "Great!", "すごい！", "Perfect!", "やったね！"],
    wrong: ["おしい！もういちど", "だいじょうぶ、もういっかい！", "Try again!"],
    clear: ["ぜんぶ できたね！ Great job!", "クリア！ すごいよ！", "やったー！ Excellent!"]
  };
  const Cheer = {
    init() {
      this.box = document.getElementById("cheer");
      this.idle = document.getElementById("cheerIdle");
      this.act = document.getElementById("cheerAct");
      this.bubble = document.getElementById("cheerBubble");
      this.stage = document.getElementById("clearStage");
      this.act.addEventListener("ended", () => this.endAction());
      this.stage.addEventListener("click", () => this.endAction());
      this.box.addEventListener("click", () => (this.current === "clear" ? this.endAction() : this.play("tap", pick(LINES.tap))));
      const tryIdle = () => { const p = this.idle.play(); if (p) p.catch(() => {}); };
      tryIdle();
      document.addEventListener("pointerdown", tryIdle, { once: true });
    },
    say(text, ms = 2200) {
      if (!this.bubble) return;
      this.bubble.textContent = text;
      this.bubble.classList.add("show");
      clearTimeout(this._t);
      this._t = setTimeout(() => this.bubble.classList.remove("show"), ms);
    },
    // kind: "tap"（②の動画：ポーズとくるり）/ "clear"（③の動画：ひかりと バイバイ）
    play(kind, line) {
      if (line) this.say(line);
      if (kind === "wrong") { this.box.classList.remove("shake"); void this.box.offsetWidth; this.box.classList.add("shake"); try { navigator.vibrate && navigator.vibrate(60); } catch (e) {} return; }
      if (kind === "correct") kind = "tap";
      if (this.current === "clear" && kind === "tap") return; // クリア演出中は上書きしない
      this.current = kind;
      this.act.src = kind === "clear" ? "media/cheer-clear.mp4" : "media/cheer-tap.mp4";
      this.act.muted = kind !== "clear";
      this.act.currentTime = 0;
      this.box.classList.add("acting");
      if (kind === "clear") {
        document.body.classList.add("clear-on");
        this.stage.classList.add("show");
        this.stage.querySelector(".clear-msg").textContent = line || pick(LINES.clear);
        confetti(this.stage.querySelector(".confetti"));
      }
      // 動画が再生できない端末でも、メッセージは数秒見せてから閉じる
      const fallback = () => { this.box.classList.remove("acting"); if (kind === "clear") { clearTimeout(this._ft); this._ft = setTimeout(() => this.endAction(), 3500); } else this.endAction(); };
      const p = this.act.play();
      if (p) p.catch(() => { this.act.muted = true; this.act.play().catch(fallback); });
    },
    endAction() {
      clearTimeout(this._ft);
      this.box.classList.remove("acting");
      document.body.classList.remove("clear-on");
      this.stage.classList.remove("show");
      this.act.pause();
      this.current = null;
    },
    LINES
  };
  function confetti(host) {
    if (!host) return;
    host.innerHTML = "";
    const colors = ["#C2357A", "#F2C94C", "#5FB3D9", "#7CC6A4", "#F49AC1", "#B48AD6"];
    for (let i = 0; i < 60; i++) {
      const s = document.createElement("i");
      s.style.left = Math.random() * 100 + "%";
      s.style.background = pick(colors);
      s.style.animationDelay = Math.random() * 1.2 + "s";
      s.style.animationDuration = 2.4 + Math.random() * 2 + "s";
      s.style.transform = `rotate(${Math.random() * 360}deg)`;
      host.appendChild(s);
    }
  }

  // ---------------- 学習記録（スプレッドシート） ----------------
  const Log = {
    history() { return store.get("history", []); },
    queue() { return store.get("queue", []); },
    // rec: { mode, phase, unit, item, result, correct, total, seconds }
    record(rec) {
      const now = new Date();
      const row = Object.assign(
        {
          timestamp: now.toISOString(),
          date: now.toLocaleDateString("ja-JP"),
          learner: Settings.data.name || "なまえなし",
          mode: "こども",
          unit: window.DATA.unit.title,
          correct: "", total: "", seconds: "",
          device: /iPad|iPhone|Android/i.test(navigator.userAgent) ? "タブレット/スマホ" : "パソコン"
        },
        rec
      );
      const h = this.history(); h.push(row); store.set("history", h.slice(-500));
      const q = this.queue(); q.push(row); store.set("queue", q);
      this.flush();
      return row;
    },
    async flush() {
      const url = Settings.data.gasUrl;
      const q = this.queue();
      if (!url || !q.length || this._busy) return;
      this._busy = true;
      try {
        // Apps Script は CORS を返さないので no-cors + text/plain で送る
        await fetch(url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ rows: q }) });
        store.set("queue", []);
        this.lastSent = new Date();
      } catch (e) {
        // 通信できないときは端末に残しておき、次回まとめて送る
      } finally {
        this._busy = false;
      }
    },
    // 「I practiced this on these days」用：その内容を練習した日付
    daysFor(key) {
      const days = [];
      this.history().forEach((r) => { if ((r.phase + ":" + r.item) === key && !days.includes(r.date)) days.push(r.date); });
      return days;
    },
    practiceDays() {
      const days = new Set(this.history().map((r) => r.date));
      return days;
    }
  };
  window.addEventListener("online", () => Log.flush());

  // 経過時間
  const Timer = { start() { this.t0 = Date.now(); }, sec() { return Math.round((Date.now() - (this.t0 || Date.now())) / 1000); } };

  window.CORE = { store, wait, pick, shuffle, Settings, Speech, Cheer, Log, Timer };
})();
