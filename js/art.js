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

  // ---------------- 人物（ひと目で わかるように 特ちょうを はっきり） ----------------
  // おとな：頭が小さく体が大きい／こども：頭が大きく体が小さい
  // おじいちゃん：白い髪・はげ頭・めがね・白いひげ・ちょうネクタイ
  // おばあちゃん：白いおだんご・めがね・ショール・ブローチ
  // おとうさん：みじかい黒髪・ひげ・ネクタイ・スーツ　おかあさん：長い髪・口紅・イヤリング・ネックレス
  // おにいさん：つんつん髪・パーカー　おねえさん：ふたつ結び・リボン・ワンピース
  const SKIN = { tan: "#D49A6A", light: "#F6D0AE", deep: "#A86B45" };
  const PEOPLE = {
    girl: { kid: true, skin: SKIN.tan },
    mother: { adult: true, skin: SKIN.tan },
    father: { adult: true, skin: SKIN.deep },
    grandfather: { adult: true, old: true, skin: SKIN.deep },
    grandmother: { adult: true, old: true, skin: SKIN.deep },
    sister: { kid: true, skin: SKIN.tan },
    brother: { kid: true, skin: SKIN.deep },
    sam: { kid: true, skin: SKIN.light },
    teacher: { adult: true, skin: SKIN.light }
  };
  function person(kind, mood) {
    const p = PEOPLE[kind] || PEOPLE.girl;
    const kid = !p.adult;
    const R = kid ? 56 : 44, HX = 100, HY = kid ? 100 : 84;
    const ex = R * 0.38, ey = HY + R * 0.08;
    const eyes = (lash) => `<ellipse cx="${HX - ex}" cy="${ey}" rx="${R * 0.11}" ry="${R * 0.15}" fill="${INK}"/><ellipse cx="${HX + ex}" cy="${ey}" rx="${R * 0.11}" ry="${R * 0.15}" fill="${INK}"/>
      <circle cx="${HX - ex + 2}" cy="${ey - 3}" r="${R * 0.04}" fill="#fff"/><circle cx="${HX + ex + 2}" cy="${ey - 3}" r="${R * 0.04}" fill="#fff"/>
      ${lash ? `<path d="M${HX - ex - 8} ${ey - 8} l-6 -5 M${HX - ex - 3} ${ey - 11} l-3 -6 M${HX + ex + 8} ${ey - 8} l6 -5 M${HX + ex + 3} ${ey - 11} l3 -6" ${s3}/>` : ""}`;
    const cheeks = `<circle cx="${HX - R * 0.6}" cy="${HY + R * 0.38}" r="${R * 0.14}" fill="#F29BA0" opacity=".55"/><circle cx="${HX + R * 0.6}" cy="${HY + R * 0.38}" r="${R * 0.14}" fill="#F29BA0" opacity=".55"/>`;
    const my = HY + R * 0.45;
    const mouth = (lip) => mood === "open"
      ? `<path d="M${HX - 11} ${my} Q${HX} ${my + 16} ${HX + 11} ${my} Z" fill="${lip || "#F08A8A"}" ${s3}/>`
      : lip ? `<path d="M${HX - 11} ${my} Q${HX} ${my + 11} ${HX + 11} ${my} Q${HX} ${my + 3} ${HX - 11} ${my}Z" fill="${lip}" ${s3}/>` : `<path d="M${HX - 11} ${my} Q${HX} ${my + 11} ${HX + 11} ${my}" fill="none" ${s3}/>`;
    const head = `<circle cx="${HX}" cy="${HY}" r="${R}" fill="${p.skin}" ${S}/><ellipse cx="${HX - R}" cy="${HY + 6}" rx="7" ry="10" fill="${p.skin}" ${s3}/><ellipse cx="${HX + R}" cy="${HY + 6}" rx="7" ry="10" fill="${p.skin}" ${s3}/>`;
    const glasses = `<g fill="rgba(255,255,255,.25)" stroke="${INK}" stroke-width="4"><circle cx="${HX - ex}" cy="${ey}" r="${R * 0.27}"/><circle cx="${HX + ex}" cy="${ey}" r="${R * 0.27}"/></g><path d="M${HX - ex + R * 0.27} ${ey} Q${HX} ${ey - 6} ${HX + ex - R * 0.27} ${ey}" fill="none" stroke="${INK}" stroke-width="4"/>`;
    const brows = (c, thick) => `<path d="M${HX - ex - 10} ${ey - R * 0.32} q10 -7 20 0 M${HX + ex - 10} ${ey - R * 0.32} q10 -7 20 0" fill="none" stroke="${c}" stroke-width="${thick || 4}" stroke-linecap="round"/>`;
    const bodyAdult = (fill) => `<path d="M30 240 C30 178 58 150 100 150 C142 150 170 178 170 240Z" fill="${fill}" ${S}/>`;
    const bodyKid = (fill) => `<path d="M50 240 C50 196 70 170 100 170 C130 170 150 196 150 240Z" fill="${fill}" ${S}/>`;
    let back = "", bodyArt = "", front = "", extra = "";
    switch (kind) {
      case "grandfather":
        bodyArt = bodyAdult("#FFFFFF") + `<path d="M48 240 C46 190 64 160 84 154 L100 210 L116 154 C136 160 154 190 152 240Z" fill="#4E7F34" ${S}/>
          <path d="M86 156 L100 170 L114 156 L114 168 L100 162 L86 168Z" fill="#C0392B" ${s3}/><circle cx="100" cy="196" r="3" fill="${INK}"/><circle cx="100" cy="216" r="3" fill="${INK}"/>`;
        front = `<path d="M${HX - R * 0.95} ${HY - 4} C${HX - R * 1.05} ${HY - 34} ${HX - R * 0.7} ${HY - 40} ${HX - R * 0.55} ${HY - 26} C${HX - R * 0.7} ${HY - 14} ${HX - R * 0.8} ${HY - 4} ${HX - R * 0.78} ${HY + 8}Z M${HX + R * 0.95} ${HY - 4} C${HX + R * 1.05} ${HY - 34} ${HX + R * 0.7} ${HY - 40} ${HX + R * 0.55} ${HY - 26} C${HX + R * 0.7} ${HY - 14} ${HX + R * 0.8} ${HY - 4} ${HX + R * 0.78} ${HY + 8}Z" fill="#F4F4F4" ${s3}/>
          <path d="M${HX - 16} ${HY - R * 0.62} q16 -5 32 0 M${HX - 12} ${HY - R * 0.5} q12 -4 24 0" fill="none" stroke="${INK}" stroke-width="2.5" opacity=".45" stroke-linecap="round"/>
          <ellipse cx="${HX - 10}" cy="${HY - R * 0.7}" rx="9" ry="5" fill="#fff" opacity=".35"/>`;
        extra = brows("#F4F4F4", 7) + glasses + `<path d="M${HX - 22} ${my - 4} C${HX - 14} ${my - 14} ${HX - 4} ${my - 10} ${HX} ${my - 6} C${HX + 4} ${my - 10} ${HX + 14} ${my - 14} ${HX + 22} ${my - 4} C${HX + 12} ${my + 2} ${HX + 4} ${my - 2} ${HX} ${my - 2} C${HX - 4} ${my - 2} ${HX - 12} ${my + 2} ${HX - 22} ${my - 4}Z" fill="#F4F4F4" ${s3}/>`;
        return `<g class="person">${bodyArt}${head}${front}${eyes()}${extra}${cheeks}${mood === "open" ? mouth() : ""}</g>`;
      case "grandmother":
        back = `<circle cx="${HX}" cy="${HY - R - 8}" r="20" fill="#EDEDED" ${s3}/>`;
        bodyArt = bodyAdult("#B992D6") + `<path d="M40 214 C60 170 140 170 160 214 L148 240 L52 240Z" fill="#E8D7F1" ${s3}/><path d="M60 178 L100 214 L140 178" fill="none" ${s3}/><circle cx="100" cy="208" r="8" fill="#F2C94C" ${s3}/>`;
        front = `<path d="M${HX - R - 6} ${HY + 10} C${HX - R - 14} ${HY - 40} ${HX - 20} ${HY - R - 14} ${HX} ${HY - R - 6} C${HX + 20} ${HY - R - 14} ${HX + R + 14} ${HY - 40} ${HX + R + 6} ${HY + 10} C${HX + R - 8} ${HY - 20} ${HX + 18} ${HY - R + 6} ${HX} ${HY - R + 12} C${HX - 18} ${HY - R + 6} ${HX - R + 8} ${HY - 20} ${HX - R - 6} ${HY + 10}Z" fill="#EDEDED" ${s3}/>`;
        extra = glasses + `<circle cx="${HX - R - 2}" cy="${HY + 22}" r="5" fill="#fff" ${s3}/><circle cx="${HX + R + 2}" cy="${HY + 22}" r="5" fill="#fff" ${s3}/>`;
        return `<g class="person">${back}${bodyArt}${head}${front}${eyes()}${extra}${cheeks}${mouth("#E57A8A")}</g>`;
      case "father":
        bodyArt = bodyAdult("#5B6577") + `<path d="M82 152 L100 176 L118 152Z" fill="#fff" ${s3}/><path d="M100 172 L92 182 L100 224 L108 182Z" fill="#2E86DE" ${s3}/><path d="M82 152 L72 200 L100 176Z M118 152 L128 200 L100 176Z" fill="#4A5363" ${s3}/>`;
        front = `<path d="M${HX - R - 2} ${HY - 2} C${HX - R - 4} ${HY - R - 10} ${HX + R + 4} ${HY - R - 10} ${HX + R + 2} ${HY - 2} C${HX + R - 6} ${HY - R * 0.55} ${HX - 4} ${HY - R * 0.62} ${HX - 18} ${HY - R * 0.5} C${HX - 28} ${HY - R * 0.4} ${HX - R + 6} ${HY - R * 0.4} ${HX - R - 2} ${HY - 2}Z" fill="#241815" ${s3}/>`;
        extra = brows("#241815", 6) + `<path d="M${HX - R * 0.78} ${HY + R * 0.3} C${HX - R * 0.7} ${HY + R * 1.1} ${HX + R * 0.7} ${HY + R * 1.1} ${HX + R * 0.78} ${HY + R * 0.3} C${HX + R * 0.5} ${HY + R * 0.75} ${HX - R * 0.5} ${HY + R * 0.75} ${HX - R * 0.78} ${HY + R * 0.3}Z" fill="#241815" opacity=".85"/>
          <path d="M${HX - 18} ${my - 6} q9 -7 18 0 q9 -7 18 0" fill="#241815" ${s3}/>`;
        return `<g class="person">${bodyArt}${head}${front}${eyes()}${extra}${mood === "open" ? `<path d="M${HX - 9} ${my + 2} Q${HX} ${my + 14} ${HX + 9} ${my + 2} Z" fill="#F08A8A" ${s3}/>` : `<path d="M${HX - 9} ${my + 3} Q${HX} ${my + 10} ${HX + 9} ${my + 3}" fill="none" stroke="#fff" stroke-width="3"/>`}</g>`;
      case "mother":
        back = `<path d="M${HX - R - 14} ${HY - 4} C${HX - R - 30} ${HY + 60} ${HX - R - 16} ${HY + 120} ${HX - R + 6} ${HY + 140} L${HX + R - 6} ${HY + 140} C${HX + R + 16} ${HY + 120} ${HX + R + 30} ${HY + 60} ${HX + R + 14} ${HY - 4} C${HX + R} ${HY - R - 22} ${HX - R} ${HY - R - 22} ${HX - R - 14} ${HY - 4}Z" fill="#6B3E1F" ${S}/>`;
        bodyArt = bodyAdult("#F6D55C") + `<path d="M76 158 Q100 200 124 158" fill="none" stroke="#F2994A" stroke-width="5"/><circle cx="100" cy="186" r="7" fill="#F2994A" ${s3}/>`;
        front = `<path d="M${HX - R - 4} ${HY + 6} C${HX - R} ${HY - R - 4} ${HX + R} ${HY - R - 4} ${HX + R + 4} ${HY + 6} C${HX + R - 10} ${HY - 22} ${HX + 10} ${HY - R + 2} ${HX - 6} ${HY - R * 0.7} C${HX - 18} ${HY - 22} ${HX - R + 4} ${HY - 14} ${HX - R - 4} ${HY + 6}Z" fill="#6B3E1F"/>`;
        extra = `<circle cx="${HX - R - 1}" cy="${HY + 22}" r="6" fill="#F2C94C" ${s3}/><circle cx="${HX + R + 1}" cy="${HY + 22}" r="6" fill="#F2C94C" ${s3}/>` + brows("#6B3E1F", 3);
        return `<g class="person">${back}${bodyArt}${head}${front}${eyes(true)}${extra}${cheeks}${mouth("#E0485A")}</g>`;
      case "teacher":
        back = `<circle cx="${HX + 30}" cy="${HY - R + 4}" r="18" fill="#8A5A35" ${s3}/>`;
        bodyArt = bodyAdult("#C2357A") + `<path d="M84 152 L100 196 L116 152Z" fill="#fff" ${s3}/>`;
        front = `<path d="M${HX - R - 2} ${HY + 4} C${HX - R} ${HY - R - 6} ${HX + R} ${HY - R - 6} ${HX + R + 2} ${HY + 4} C${HX + R - 12} ${HY - 22} ${HX - 10} ${HY - R + 4} ${HX - R - 2} ${HY + 4}Z" fill="#8A5A35"/>`;
        return `<g class="person">${back}${bodyArt}${head}${front}${eyes(true)}${cheeks}${mouth("#E0485A")}</g>`;
      case "brother": {
        bodyArt = bodyKid("#3FA34D") + `<path d="M66 178 C80 196 120 196 134 178" fill="none" ${s3}/><line x1="90" y1="194" x2="88" y2="218" ${s3}/><line x1="110" y1="194" x2="112" y2="218" ${s3}/><rect x="80" y="214" width="40" height="18" rx="6" fill="#2E8B3E" ${s3}/>`;
        let spikes = "";
        const n = 9;
        for (let i = 0; i < n; i++) {
          const a = Math.PI * (1.05 + (i / n) * 0.9), a2 = Math.PI * (1.05 + ((i + 0.5) / n) * 0.9);
          spikes += `${i ? "L" : "M"}${(HX + Math.cos(a) * (R + 2)).toFixed(1)} ${(HY + Math.sin(a) * (R + 2)).toFixed(1)} L${(HX + Math.cos(a2) * (R + 18)).toFixed(1)} ${(HY + Math.sin(a2) * (R + 18)).toFixed(1)} `;
        }
        const aEnd = Math.PI * 1.95;
        spikes += `L${(HX + Math.cos(aEnd) * (R + 2)).toFixed(1)} ${(HY + Math.sin(aEnd) * (R + 2)).toFixed(1)}`;
        front = `<path d="${spikes} C${HX + 20} ${HY - R * 0.45} ${HX - 20} ${HY - R * 0.45} ${(HX + Math.cos(Math.PI * 1.05) * (R + 2)).toFixed(1)} ${(HY + Math.sin(Math.PI * 1.05) * (R + 2)).toFixed(1)}Z" fill="#1E1412" ${s3}/>`;
        extra = brows("#1E1412", 5);
        return `<g class="person">${bodyArt}${head}${front}${eyes()}${extra}${cheeks}${mouth()}</g>`;
      }
      case "sister":
        back = `<path d="M${HX - R - 4} ${HY - 6} C${HX - R - 30} ${HY + 4} ${HX - R - 30} ${HY + 50} ${HX - R - 12} ${HY + 70} C${HX - R - 2} ${HY + 50} ${HX - R + 4} ${HY + 20} ${HX - R + 4} ${HY}Z M${HX + R + 4} ${HY - 6} C${HX + R + 30} ${HY + 4} ${HX + R + 30} ${HY + 50} ${HX + R + 12} ${HY + 70} C${HX + R + 2} ${HY + 50} ${HX + R - 4} ${HY + 20} ${HX + R - 4} ${HY}Z" fill="#1E1412" ${s3}/>`;
        bodyArt = bodyKid("#A06CD5") + `<path d="M76 176 L100 196 L124 176" fill="#fff" ${s3}/>`;
        front = `<path d="M${HX - R - 2} ${HY + 4} C${HX - R} ${HY - R - 8} ${HX + R} ${HY - R - 8} ${HX + R + 2} ${HY + 4} C${HX + R - 4} ${HY - 18} ${HX + 26} ${HY - R * 0.38} ${HX} ${HY - R * 0.38} C${HX - 26} ${HY - R * 0.38} ${HX - R + 4} ${HY - 18} ${HX - R - 2} ${HY + 4}Z" fill="#1E1412" ${s3}/>
          <path d="M${HX - R - 8} ${HY - 10} l-16 -12 l2 22z M${HX - R - 8} ${HY - 10} l-2 -20 l16 10z M${HX + R + 8} ${HY - 10} l16 -12 l-2 22z M${HX + R + 8} ${HY - 10} l2 -20 l-16 10z" fill="#E056A0" ${s3}/>`;
        return `<g class="person">${back}${bodyArt}${head}${front}${eyes(true)}${cheeks}${mouth()}</g>`;
      case "sam": {
        bodyArt = bodyKid("#3B8FE0") + `<rect x="92" y="196" width="16" height="16" rx="3" fill="#FFD166" ${s3}/>`;
        front = `<path d="M${HX - R - 2} ${HY + 2} L${HX - R - 12} ${HY - 26} L${HX - R + 8} ${HY - 22} L${HX - R + 2} ${HY - R - 4} L${HX - 18} ${HY - R + 4} L${HX - 10} ${HY - R - 18} L${HX + 6} ${HY - R + 2} L${HX + 22} ${HY - R - 16} L${HX + 24} ${HY - R + 6} L${HX + R} ${HY - R} L${HX + R - 6} ${HY - 22} L${HX + R + 14} ${HY - 18} L${HX + R + 2} ${HY + 2} C${HX + R - 12} ${HY - 26} ${HX - R + 12} ${HY - 26} ${HX - R - 2} ${HY + 2}Z" fill="#F7C531" ${s3}/>`;
        extra = `<g fill="#C9774A"><circle cx="${HX - R * 0.58}" cy="${HY + R * 0.3}" r="2.5"/><circle cx="${HX - R * 0.48}" cy="${HY + R * 0.4}" r="2.5"/><circle cx="${HX - R * 0.68}" cy="${HY + R * 0.42}" r="2.5"/><circle cx="${HX + R * 0.58}" cy="${HY + R * 0.3}" r="2.5"/><circle cx="${HX + R * 0.48}" cy="${HY + R * 0.4}" r="2.5"/><circle cx="${HX + R * 0.68}" cy="${HY + R * 0.42}" r="2.5"/></g>`;
        return `<g class="person">${bodyArt}${head}${front}${eyes()}${extra}${mouth()}</g>`;
      }
      default: { // girl（おはなしの 女の子）：くるくる髪＋ピンクのリボン
        let curls = "";
        for (let i = 0; i < 13; i++) { const a = Math.PI * (0.85 + (i / 12) * 1.3); curls += `<circle cx="${HX + Math.cos(a) * (R + 6)}" cy="${HY + 10 + Math.sin(a) * -(R + 2)}" r="${R * 0.42}" fill="#241815"/>`; }
        back = curls + `<ellipse cx="${HX}" cy="${HY + 10}" rx="${R + 20}" ry="${R + 6}" fill="#241815"/>`;
        bodyArt = bodyKid("#EE7F95") + `<path d="M88 176 L100 190 L112 176" fill="#fff" ${s3}/>`;
        front = `<path d="M${HX - R + 2} ${HY - 6} C${HX - R + 8} ${HY - R - 6} ${HX + R - 8} ${HY - R - 6} ${HX + R - 2} ${HY - 6} C${HX + 20} ${HY - R * 0.6} ${HX - 10} ${HY - R * 0.4} ${HX - R + 2} ${HY - 6}Z" fill="#241815"/>
          <path d="M${HX + 22} ${HY - R - 2} l20 -18 l6 26z M${HX + 22} ${HY - R - 2} l28 4 l-16 18z" fill="#FF7FA8" ${s3}/><circle cx="${HX + 24}" cy="${HY - R}" r="6" fill="#FF7FA8" ${s3}/>`;
        return `<g class="person">${back}${bodyArt}${head}${front}${eyes(true)}${cheeks}${mouth()}</g>`;
      }
    }
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
        return wrap(person(arg), "10 20 180 180", "face");
      case "person":
        return wrap(person(arg, extra.mood), "0 0 200 240");
      case "opp":
        return wrap(opposite(arg), "0 0 200 200");
      case "color": {
        const COL = { red: "#E53935", blue: "#1E6FD9", yellow: "#FBC02D", green: "#43A047", pink: "#F48FB1", orange: "#FB8C00", purple: "#8E44AD", black: "#2B2B2B", white: "#FFFFFF", brown: "#8D5A2B" };
        return wrap(`<path d="M100 26 C150 22 178 60 172 104 C166 150 128 176 92 172 C48 168 22 136 28 94 C34 54 62 30 100 26Z" fill="${COL[arg] || arg}" ${S}/><ellipse cx="78" cy="72" rx="16" ry="10" fill="#fff" opacity=".35"/>`, "0 0 200 200");
      }
      case "count": {
        const n = +arg; let out = "";
        const cols = n <= 4 ? 2 : n <= 6 ? 3 : n <= 9 ? 3 : 4;
        const rows = Math.ceil(n / cols), cell = 180 / Math.max(cols, rows);
        for (let i = 0; i < n; i++) {
          const cx = 10 + cell * (i % cols) + cell / 2 + (180 - cell * cols) / 2, cy = 10 + cell * Math.floor(i / cols) + cell / 2 + (180 - cell * rows) / 2, r = cell * 0.4;
          let p = "";
          for (let k = 0; k < 10; k++) { const ang = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; p += (k ? "L" : "M") + (cx + rr * Math.cos(ang)).toFixed(1) + " " + (cy + rr * Math.sin(ang)).toFixed(1); }
          out += `<path d="${p}Z" fill="#FFD166" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
        }
        return wrap(out, "0 0 200 200");
      }
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
