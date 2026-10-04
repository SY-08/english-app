// =============================================================
//  オリジナルイラスト（SVG）
//  教材の絵は使わず、同じ物・場面が伝わる絵をここで描いています
// =============================================================
(function () {
  const INK = "#3B2A3F";
  const S = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const s3 = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;

  const wrap = (inner, vb = "0 0 200 200", cls = "") =>
    `<svg class="art ${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;

  // ---------------- 人物 ----------------
  const SKIN = { tan: "#C98B5C", light: "#F4CBA4", deep: "#9C6440" };
  const PEOPLE = {
    girl: { skin: SKIN.tan, shirt: "#E7848F", hair: "#2B1C19", style: "curly", bow: "#F07C93" },
    mother: { skin: SKIN.tan, shirt: "#F6E58D", hair: "#5A3A22", style: "long" },
    father: { skin: SKIN.deep, shirt: "#A7A9B4", hair: "#2B1C19", style: "short", beard: true, collar: "#BFE3F2" },
    grandfather: { skin: SKIN.deep, shirt: "#5E8A3A", hair: "#C9C9CF", style: "bald", inner: "#FFFFFF" },
    grandmother: { skin: SKIN.deep, shirt: "#C7A4D9", hair: "#C9C9CF", style: "bun", scarf: "#FFFFFF" },
    sister: { skin: SKIN.tan, shirt: "#B48AD6", hair: "#2B1C19", style: "pigtails", bow: "#B48AD6" },
    brother: { skin: SKIN.deep, shirt: "#4FA35B", hair: "#2B1C19", style: "curlyshort", hood: true },
    sam: { skin: SKIN.light, shirt: "#5DA9E9", hair: "#F2C94C", style: "spiky" },
    teacher: { skin: SKIN.light, shirt: "#FFFFFF", hair: "#8A5A35", style: "long", jacket: "#C2357A" }
  };

  function hairBack(p) {
    const c = p.hair;
    switch (p.style) {
      case "curly": {
        let out = "";
        for (let i = 0; i < 11; i++) {
          const a = Math.PI * (0.95 + (i / 10) * 1.1);
          out += `<circle cx="${100 + Math.cos(a) * 60}" cy="${92 + Math.sin(a) * -58 + 20}" r="24" fill="${c}"/>`;
        }
        return out + `<ellipse cx="100" cy="98" rx="74" ry="66" fill="${c}"/>`;
      }
      case "long":
        return `<path d="M38 92 C30 150 34 205 52 238 L148 238 C166 205 170 150 162 92 C150 40 50 40 38 92Z" fill="${c}" ${s3}/>`;
      case "bun":
        return `<circle cx="100" cy="34" r="22" fill="${c}" ${s3}/>`;
      case "pigtails":
        return `<circle cx="40" cy="112" r="20" fill="${c}" ${s3}/><circle cx="160" cy="112" r="20" fill="${c}" ${s3}/>
          <path d="M44 86 l-14 -10 l2 18z M156 86 l14 -10 l-2 18z" fill="${p.bow}" ${s3}/>`;
      default:
        return "";
    }
  }
  function hairFront(p) {
    const c = p.hair;
    switch (p.style) {
      case "curly":
        return `<path d="M50 84 C58 52 92 40 120 46 C140 50 152 66 152 86 C138 70 118 66 104 74 C94 62 70 64 50 84Z" fill="${c}"/>
          <path d="M130 42 l18 -14 l4 20z M130 42 l22 6 l-12 14z" fill="${p.bow}" ${s3}/><circle cx="132" cy="44" r="5" fill="${p.bow}" ${s3}/>`;
      case "long":
        return `<path d="M46 92 C48 46 152 40 156 92 C140 66 112 56 84 62 C72 70 58 80 46 92Z" fill="${c}"/>`;
      case "short":
        return `<path d="M46 86 C46 36 154 36 154 86 C150 68 136 58 100 58 C66 58 52 68 46 86Z" fill="${c}"/>`;
      case "bald":
        return `<path d="M46 98 C40 70 52 58 62 64 C58 76 56 86 58 100Z M154 98 C160 70 148 58 138 64 C142 76 144 86 142 100Z" fill="${c}" ${s3}/>`;
      case "bun":
        return `<path d="M46 92 C42 50 158 50 154 92 C146 74 130 64 100 64 C70 64 54 74 46 92Z" fill="${c}"/>`;
      case "pigtails":
        return `<path d="M46 92 C46 44 154 44 154 92 C144 70 124 62 100 70 C80 62 56 70 46 92Z" fill="${c}"/>`;
      case "curlyshort": {
        let out = "";
        for (let i = 0; i < 9; i++) {
          const a = Math.PI * (1.08 + (i / 8) * 0.84);
          out += `<circle cx="${100 + Math.cos(a) * 52}" cy="${90 + Math.sin(a) * 50}" r="16" fill="${c}"/>`;
        }
        return out;
      }
      case "spiky":
        return `<path d="M44 92 L40 64 L58 70 L56 44 L76 58 L84 34 L98 54 L112 32 L120 56 L140 40 L138 64 L160 62 L154 92 C140 74 120 68 100 70 C80 68 58 76 44 92Z" fill="${c}"/>`;
      default:
        return "";
    }
  }
  function body(p) {
    let b = `<path d="M40 238 C40 180 62 156 100 156 C138 156 160 180 160 238Z" fill="${p.jacket || p.shirt}" ${S}/>`;
    if (p.jacket) b += `<path d="M84 160 L100 200 L116 160Z" fill="${p.shirt}" ${s3}/>`;
    if (p.collar) b += `<path d="M84 158 L100 178 L116 158Z" fill="${p.collar}" ${s3}/>`;
    if (p.inner) b += `<path d="M82 160 L100 238 L118 160Z" fill="${p.inner}" ${s3}/>`;
    if (p.scarf) b += `<path d="M76 160 C90 176 110 176 124 160 L112 190 L100 178 L88 190Z" fill="${p.scarf}" ${s3}/>`;
    if (p.hood) b += `<path d="M66 166 C80 182 120 182 134 166" fill="none" ${s3}/><line x1="92" y1="182" x2="90" y2="204" ${s3}/><line x1="108" y1="182" x2="110" y2="204" ${s3}/>`;
    return b;
  }
  function face(p, mood = "smile") {
    const mouth =
      mood === "open"
        ? `<path d="M88 122 Q100 140 112 122 Z" fill="#F08A8A" ${s3}/>`
        : `<path d="M88 122 Q100 134 112 122" fill="none" ${s3}/>`;
    return `<circle cx="100" cy="98" r="52" fill="${p.skin}" ${S}/>
      <ellipse cx="80" cy="100" rx="6" ry="8" fill="${INK}"/><ellipse cx="120" cy="100" rx="6" ry="8" fill="${INK}"/>
      <circle cx="82" cy="97" r="2" fill="#fff"/><circle cx="122" cy="97" r="2" fill="#fff"/>
      <circle cx="68" cy="116" r="7" fill="#F29BA0" opacity=".55"/><circle cx="132" cy="116" r="7" fill="#F29BA0" opacity=".55"/>
      ${p.beard ? `<path d="M62 118 C70 150 130 150 138 118 C128 138 72 138 62 118Z" fill="${INK}" opacity=".35"/>` : ""}
      ${mouth}`;
  }
  // 人物（上半身）。viewBox 200x240
  function person(kind, mood) {
    const p = PEOPLE[kind] || PEOPLE.girl;
    return `<g class="person">${hairBack(p)}${body(p)}${face(p, mood)}${hairFront(p)}</g>`;
  }

  // ---------------- もの ----------------
  const ITEMS = {
    bag: () => `<path d="M62 74 C62 30 138 30 138 74" fill="none" stroke="#D9675A" stroke-width="12" stroke-linecap="round"/>
      <path d="M62 74 C62 30 138 30 138 74" fill="none" ${s3}/>
      <path d="M100 176 C40 140 26 100 46 82 C62 68 86 74 100 96 C114 74 138 68 154 82 C174 100 160 140 100 176Z" fill="#E77FB1" ${S}/>
      <path d="M66 98 C72 90 82 90 88 96" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>`,
    train: (len = 4) => {
      let cars = "";
      const w = 150 / (len + 1);
      for (let i = 1; i <= len; i++) {
        const x = 20 + i * w;
        cars += `<rect x="${x}" y="96" width="${w - 6}" height="44" rx="5" fill="#E2603F" ${s3}/>
          <circle cx="${x + w * 0.25}" cy="146" r="7" fill="${INK}"/><circle cx="${x + w * 0.65}" cy="146" r="7" fill="${INK}"/>`;
      }
      return `<rect x="16" y="88" width="${w}" height="52" rx="6" fill="#3E7CC9" ${s3}/>
        <rect x="18" y="72" width="${w * 0.55}" height="24" rx="4" fill="#3E7CC9" ${s3}/>
        <rect x="${16 + w * 0.6}" y="66" width="10" height="24" fill="${INK}"/>
        <circle cx="${16 + w * 0.3}" cy="146" r="9" fill="${INK}"/><circle cx="${16 + w * 0.75}" cy="146" r="9" fill="${INK}"/>${cars}`;
    },
    bike: () => `<circle cx="56" cy="130" r="34" fill="none" stroke="${INK}" stroke-width="7"/>
      <circle cx="148" cy="130" r="34" fill="none" stroke="${INK}" stroke-width="7"/>
      <path d="M56 130 L90 84 L132 84 L148 130 M90 84 L104 130 L132 84 M104 130 L56 130" fill="none" stroke="#5BA4E6" stroke-width="9" stroke-linejoin="round"/>
      <path d="M84 76 L100 76 M132 84 L126 60 L142 56" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <rect x="134" y="44" width="30" height="20" rx="3" fill="#fff" ${s3}/>`,
    doll: () => `<path d="M60 184 C64 130 80 112 100 112 C120 112 136 130 140 184Z" fill="#F4B6CF" ${S}/>
      <circle cx="100" cy="78" r="34" fill="#4A2E25" ${S}/>
      <circle cx="100" cy="84" r="26" fill="#F4CBA4" ${s3}/>
      <path d="M74 74 C80 54 120 54 126 74 C116 66 84 66 74 74Z" fill="#4A2E25"/>
      <circle cx="90" cy="86" r="4" fill="${INK}"/><circle cx="110" cy="86" r="4" fill="${INK}"/>
      <path d="M94 96 Q100 101 106 96" fill="none" ${s3}/>
      <path d="M72 50 l14 6 l-14 8z M128 50 l-14 6 l14 8z" fill="#8FD0E8" ${s3}/>`,
    book: () => `<path d="M40 50 L150 40 L162 160 L52 170Z" fill="#B23A6B" ${S}/>
      <path d="M52 170 L44 176 L36 56 L40 50" fill="#E9D7E0" ${s3}/>
      <rect x="76" y="70" width="58" height="30" rx="4" transform="rotate(-5 105 85)" fill="#F6D5E3" ${s3}/>
      <line x1="84" y1="82" x2="126" y2="78" ${s3}/><line x1="85" y1="92" x2="118" y2="89" ${s3}/>`,
    robot: () => `<line x1="100" y1="22" x2="100" y2="40" ${S}/><circle cx="100" cy="20" r="7" fill="#F2C94C" ${s3}/>
      <rect x="62" y="40" width="76" height="56" rx="10" fill="#5FB3D9" ${S}/>
      <circle cx="84" cy="64" r="8" fill="#fff" ${s3}/><circle cx="116" cy="64" r="8" fill="#fff" ${s3}/>
      <circle cx="84" cy="64" r="3" fill="${INK}"/><circle cx="116" cy="64" r="3" fill="${INK}"/>
      <rect x="82" y="80" width="36" height="8" rx="2" fill="#F2994A" ${s3}/>
      <rect x="54" y="100" width="92" height="62" rx="10" fill="#5FB3D9" ${S}/>
      <circle cx="84" cy="128" r="7" fill="#fff" ${s3}/><circle cx="116" cy="128" r="7" fill="#fff" ${s3}/>
      <rect x="28" y="106" width="22" height="40" rx="8" fill="#F2C94C" ${s3}/><rect x="150" y="106" width="22" height="40" rx="8" fill="#F2C94C" ${s3}/>
      <rect x="68" y="162" width="22" height="24" rx="5" fill="#F2C94C" ${s3}/><rect x="110" y="162" width="22" height="24" rx="5" fill="#F2C94C" ${s3}/>`,
    jumprope: () => `<path d="M48 60 C40 180 160 180 152 60" fill="none" stroke="#F2994A" stroke-width="6"/>
      <rect x="38" y="24" width="20" height="44" rx="9" fill="#E2603F" ${s3}/>
      <rect x="142" y="24" width="20" height="44" rx="9" fill="#3E7CC9" ${s3}/>`,
    birthday: () => `<line x1="40" y1="70" x2="56" y2="130" ${s3}/><ellipse cx="38" cy="50" rx="20" ry="24" fill="#F2C94C" ${s3}/>
      <line x1="160" y1="66" x2="148" y2="130" ${s3}/><ellipse cx="162" cy="46" rx="20" ry="24" fill="#5FB3D9" ${s3}/>
      <rect x="54" y="110" width="92" height="64" rx="6" fill="#F49AC1" ${S}/>
      <rect x="92" y="110" width="16" height="64" fill="#fff" ${s3}/>
      <path d="M100 110 C80 84 66 96 80 108 Z M100 110 C120 84 134 96 120 108Z" fill="#fff" ${s3}/>
      <path d="M100 30 l6 14 l15 1 l-12 9 l4 15 l-13 -8 l-13 8 l4 -15 l-12 -9 l15 -1z" fill="#FFD166" ${s3}/>`
  };

  // ---------------- かたち ----------------
  const SHAPE_COLOR = "#C2357A";
  const SHAPES = {
    circle: `<circle cx="100" cy="100" r="62"/>`,
    diamond: `<path d="M100 28 L148 100 L100 172 L52 100Z"/>`,
    heart: `<path d="M100 168 C40 128 24 88 44 64 C62 44 88 52 100 76 C112 52 138 44 156 64 C176 88 160 128 100 168Z"/>`,
    rectangle: `<rect x="28" y="70" width="144" height="62" rx="2"/>`,
    square: `<rect x="44" y="44" width="112" height="112" rx="2"/>`,
    star: `<path d="M100 26 L118 76 L172 78 L130 110 L146 164 L100 132 L54 164 L70 110 L28 78 L82 76Z"/>`,
    triangle: `<path d="M100 32 L170 160 L30 160Z"/>`
  };
  function shape(name, opts = {}) {
    const fill = opts.fill || "none";
    const stroke = opts.stroke || SHAPE_COLOR;
    return `<g fill="${fill}" stroke="${stroke}" stroke-width="${opts.sw || 11}" stroke-linejoin="round">${SHAPES[name]}</g>`;
  }

  // ---------------- 時計 ----------------
  function clock(h) {
    let ticks = "";
    for (let i = 1; i <= 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      ticks += `<text x="${100 + Math.cos(a) * 62}" y="${100 + Math.sin(a) * 62 + 7}" text-anchor="middle" font-size="20" font-family="Fredoka, sans-serif" font-weight="600" fill="${INK}">${i}</text>`;
    }
    const ha = ((h % 12) / 12) * 360;
    return `<circle cx="100" cy="100" r="84" fill="#fff" stroke="${INK}" stroke-width="9"/>${ticks}
      <line x1="100" y1="100" x2="100" y2="38" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <line x1="100" y1="100" x2="100" y2="58" stroke="#E04848" stroke-width="7" stroke-linecap="round" transform="rotate(${ha} 100 100)"/>
      <circle cx="100" cy="100" r="7" fill="${INK}"/>`;
  }

  // ---------------- はんたいことば ----------------
  function opposite(kind) {
    const on = "#D9675A", off = "#D8D2DA";
    const bag = (x, y, sc, c) =>
      `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M30 30 C30 0 70 0 70 30" fill="none" stroke="${c === off ? off : INK}" stroke-width="6"/>
       <rect x="10" y="28" width="80" height="62" rx="8" fill="${c}" stroke="${c === off ? off : INK}" stroke-width="5"/></g>`;
    switch (kind) {
      case "big": return bag(20, 40, 1.4, on) + bag(150, 120, 0.4, off);
      case "little": return bag(20, 40, 1.4, off) + bag(150, 120, 0.4, on);
      case "long": return `<g transform="translate(0 30) scale(1 .7)">${ITEMS.train(6)}</g><g transform="translate(0 100) scale(.4 .5)" opacity=".35">${ITEMS.train(1)}</g>`;
      case "short": return `<g transform="translate(0 30) scale(1 .7)" opacity=".3">${ITEMS.train(6)}</g><g transform="translate(0 100) scale(.4 .5)">${ITEMS.train(1)}</g>`;
    }
    return "";
  }

  // ---------------- 公開API ----------------
  // "item:bag" / "shape:star" / "clock:3" / "face:mother" / "opp:big" / "emoji:🐙|⬆️"
  function render(code, extra = {}) {
    const [type, arg] = code.split(":");
    switch (type) {
      case "item":
        return wrap(arg === "train" ? ITEMS.train(4) : ITEMS[arg](), "0 0 200 200");
      case "shape":
        return wrap(shape(arg, extra), "0 0 200 200");
      case "clock":
        return wrap(clock(+arg), "0 0 200 200");
      case "face":
        return wrap(person(arg), "20 10 160 160", "face");
      case "person":
        return wrap(person(arg, extra.mood), "0 0 200 240");
      case "opp":
        return wrap(opposite(arg), "0 0 200 200");
      case "emoji": {
        const parts = arg.split("|");
        return `<div class="emoji-art">${parts.map((e, i) => `<span class="e${i}">${e}</span>`).join("")}</div>`;
      }
    }
    return "";
  }

  // ① ストーリーの場面（横長 400x260）
  function scene(page) {
    if (page.key === "title") {
      return wrap(
        `<rect width="400" height="260" fill="${page.bg}"/>
         ${dots(400, 260, "#ffffff", 0.12)}
         <text x="24" y="112" font-family="Fredoka, sans-serif" font-weight="700" font-size="54" fill="#fff">I Want</text>
         <text x="28" y="146" font-family="'M PLUS Rounded 1c', sans-serif" font-weight="800" font-size="20" fill="#FBD3E6">〜が ほしいな</text>
         <circle cx="305" cy="150" r="88" fill="#F6CFCF" stroke="#fff" stroke-width="8"/>
         <g transform="translate(232 76) scale(.58)">${person("grandmother")}</g>
         <g transform="translate(300 112) scale(.47)">${person("girl", "open")}</g>`,
        "0 0 400 260", "scene"
      );
    }
    if (page.key === "birthday") {
      const fam = ["father", "grandmother", "brother", "sister", "girl", "sam", "mother", "grandfather"];
      let people = "";
      fam.forEach((k, i) => {
        const x = 2 + i * 44, y = i % 2 ? 128 : 116;
        people += `<g transform="translate(${x} ${y}) scale(${k === "girl" ? 0.5 : 0.44})">${person(k, "open")}</g>`;
      });
      let balloons = "";
      ["#F2C94C", "#5FB3D9", "#F49AC1", "#9AD38A", "#C7A4D9"].forEach((c, i) => {
        balloons += `<line x1="${36 + i * 82}" y1="96" x2="${40 + i * 82}" y2="140" stroke="${INK}" stroke-width="2"/><ellipse cx="${36 + i * 82}" cy="76" rx="17" ry="21" fill="${c}" ${s3}/>`;
      });
      return wrap(
        `<rect width="400" height="260" fill="${page.bg}"/>${dots(400, 260, "#ffffff", 0.25)}
         ${balloons}
         <rect x="70" y="10" width="260" height="42" rx="21" fill="#fff" ${s3}/><text x="200" y="42" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="30" fill="#C2357A">Happy Birthday!</text>
         ${people}
         <g transform="translate(176 206) scale(.26)">${ITEMS.birthday()}</g>`,
        "0 0 400 260", "scene"
      );
    }
    // 通常ページ：左に家族＋女の子、右にお店の棚とほしい物
    const item = page.key === "train" ? ITEMS.train(5) : ITEMS[page.key]();
    return wrap(
      `<rect width="400" height="260" fill="${page.bg}"/>${dots(400, 260, "#ffffff", 0.25)}
       <rect x="210" y="0" width="190" height="260" fill="${page.shop}" opacity=".55"/>
       <rect x="210" y="70" width="190" height="8" fill="${INK}" opacity=".18"/>
       <rect x="210" y="206" width="190" height="10" fill="${INK}" opacity=".18"/>
       <g opacity=".45"><g transform="translate(222 8) scale(.3)">${item}</g><g transform="translate(286 8) scale(.3)">${item}</g><g transform="translate(350 8) scale(.24)">${item}</g></g>
       <g transform="translate(244 66) scale(.72)">${item}</g>
       <g transform="translate(14 14) scale(.36)">${clock(page.hour)}</g>
       <g transform="translate(20 46) scale(.84)">${person(page.helper)}</g>
       <g transform="translate(112 112) scale(.62)">${person("girl", "open")}</g>`,
      "0 0 400 260", "scene"
    );
  }
  function dots(w, h, c, o) {
    return `<pattern id="dp" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2.2" fill="${c}" opacity="${o}"/></pattern><rect width="${w}" height="${h}" fill="url(#dp)"/>`;
  }

  window.ART = { render, scene, person, shape, clock, wrap, PEOPLE, trainInner: ITEMS.train };
})();
