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
  const DEFAULTS = { name: "", gasUrl: (window.APP_CONFIG && window.APP_CONFIG.gasUrl) || "", enRate: 0.85, order: "ja-en", mode: "" };
  const Settings = {
    data: Object.assign({}, DEFAULTS, store.get("settings", {})),
    save(patch) { Object.assign(this.data, patch); store.set("settings", this.data); }
  };
  if (!Settings.data.gasUrl && DEFAULTS.gasUrl) Settings.data.gasUrl = DEFAULTS.gasUrl;

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
  function voiceFor(lang) {
    const pref = lang === "en" ? ["Samantha", "Google US English", "Microsoft Aria", "Karen", "Daniel"] : ["Kyoko", "O-Ren", "Google 日本語", "Microsoft Nanami", "Haruka"];
    const list = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith(lang === "en" ? "en" : "ja"));
    for (const p of pref) { const v = list.find((x) => x.name.includes(p)); if (v) return v; }
    return list[0] || null;
  }
  let token = 0;
  function speakOne(text, lang, myToken) {
    return new Promise((resolve) => {
      if (!synth || !text || myToken !== token) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === "en" ? "en-US" : "ja-JP";
      const v = voiceFor(lang); if (v) u.voice = v;
      u.rate = lang === "en" ? Settings.data.enRate : 1.0;
      u.pitch = 1.05;
      let done = false;
      const fin = () => { if (!done) { done = true; resolve(); } };
      u.onend = fin; u.onerror = fin;
      // 一部ブラウザで onend が来ないときの保険
      setTimeout(fin, 1500 + text.length * (lang === "en" ? 140 : 220) / u.rate);
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
      if (ja && Settings.data.order !== "en" && !opts.enOnly) { await speakOne(ja, "ja", my); await wait(220); }
      if (en) await speakOne(en, "en", my);
      if (my === token) setSpeaking(false, opts.el);
    },
    en(text, opts = {}) { return this.say(null, text, opts); }
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
