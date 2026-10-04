// =============================================================
//  教材データ（子供用 Unit: I Want）
//  ja = 先に読む日本語 / en = 次に読む英語
// =============================================================
window.DATA = {
  unit: { id: "i-want", title: "I Want", ja: "〜がほしい" },

  // ---------- ① ストーリー ----------
  story: [
    { key: "title", en: "I Want", ja: "〜が ほしいな", helper: "grandmother", hour: null, bg: "#C2357A" },
    { key: "bag", en: "I want a bag.", ja: "カバンが ほしい。", helper: "mother", hour: 7, bg: "#D9EFC9", shop: "#C99A5B" },
    { key: "train", en: "I want a train.", ja: "でんしゃが ほしい。", helper: "father", hour: 8, bg: "#CFE6F7", shop: "#E9F2F8" },
    { key: "bike", en: "I want a bike.", ja: "じてんしゃが ほしい。", helper: "grandfather", hour: 9, bg: "#BFE3CF", shop: "#A8D5BC" },
    { key: "doll", en: "I want a doll.", ja: "にんぎょうが ほしい。", helper: "grandmother", hour: 10, bg: "#F6CFCF", shop: "#F2B9BC" },
    { key: "book", en: "I want a book.", ja: "ほんが ほしい。", helper: "sister", hour: 11, bg: "#F3E3C3", shop: "#D3A86A" },
    { key: "robot", en: "I want a robot.", ja: "ロボットが ほしい。", helper: "brother", hour: 12, bg: "#E4EEF6", shop: "#5B6FC9" },
    { key: "jumprope", en: "I want a jump rope.", ja: "なわとびが ほしい。", helper: "sam", hour: 1, bg: "#FBEAA6", shop: "#F6D768" },
    { key: "birthday", en: "Happy Birthday!", ja: "おたんじょうび おめでとう！", helper: "all", hour: 3, bg: "#F7D3DE" }
  ],

  // ---------- ② タップしてきこう ----------
  sections: [
    {
      id: "phrases", title: "Story Phrases", ja: "おはなしの ことば", icon: "item:bag",
      dialog: [
        { who: "girl", en: "I want a bag.", ja: "カバンが ほしい。" }
      ],
      cards: [
        { id: "bag", art: "item:bag", en: "want a bag", ja: "カバンが ほしい" },
        { id: "train", art: "item:train", en: "want a train", ja: "でんしゃが ほしい" },
        { id: "bike", art: "item:bike", en: "want a bike", ja: "じてんしゃが ほしい" },
        { id: "doll", art: "item:doll", en: "want a doll", ja: "にんぎょうが ほしい" },
        { id: "book", art: "item:book", en: "want a book", ja: "ほんが ほしい" },
        { id: "robot", art: "item:robot", en: "want a robot", ja: "ロボットが ほしい" },
        { id: "jumprope", art: "item:jumprope", en: "want a jump rope", ja: "なわとびが ほしい" },
        { id: "birthday", art: "item:birthday", en: "Happy Birthday!", ja: "おたんじょうび おめでとう！" }
      ]
    },
    {
      id: "shapes", title: "Shapes", ja: "かたち", icon: "shape:star",
      dialog: [
        { who: "teacher", en: "What shape is this?", ja: "これは なんの かたち？" },
        { who: "sam", en: "It's a circle.", ja: "まるだよ。" }
      ],
      cards: [
        { id: "circle", art: "shape:circle", en: "a circle", ja: "まる" },
        { id: "diamond", art: "shape:diamond", en: "a diamond", ja: "ひしがた" },
        { id: "heart", art: "shape:heart", en: "a heart", ja: "ハート" },
        { id: "rectangle", art: "shape:rectangle", en: "a rectangle", ja: "ながしかく" },
        { id: "square", art: "shape:square", en: "a square", ja: "しかく" },
        { id: "star", art: "shape:star", en: "a star", ja: "ほし" },
        { id: "triangle", art: "shape:triangle", en: "a triangle", ja: "さんかく" }
      ]
    },
    {
      id: "opposites", title: "Opposites", ja: "はんたいの ことば", icon: "opp:big",
      dialog: [
        { who: "teacher", en: "Is it big or little?", ja: "おおきい？ ちいさい？" },
        { who: "girl", en: "It's big.", ja: "おおきいよ。" }
      ],
      cards: [
        { id: "big", art: "opp:big", en: "big", ja: "おおきい" },
        { id: "little", art: "opp:little", en: "little", ja: "ちいさい" },
        { id: "long", art: "opp:long", en: "long", ja: "ながい" },
        { id: "short", art: "opp:short", en: "short", ja: "みじかい" }
      ]
    },
    {
      id: "time", title: "Time", ja: "じかん", icon: "clock:3",
      dialog: [
        { who: "teacher", en: "What time is it?", ja: "いま なんじ？" },
        { who: "sam", en: "It's one o'clock.", ja: "1じだよ。" }
      ],
      cards: [
        ["one", "1"], ["two", "2"], ["three", "3"], ["four", "4"], ["five", "5"], ["six", "6"],
        ["seven", "7"], ["eight", "8"], ["nine", "9"], ["ten", "10"], ["eleven", "11"], ["twelve", "12"]
      ].map(([w, n]) => ({ id: "t" + n, art: "clock:" + n, en: w + " o'clock", ja: n + "じ" }))
    },
    {
      id: "family", title: "Family and Friends", ja: "かぞくと ともだち", icon: "face:mother",
      dialog: [
        { who: "teacher", en: "Who's this?", ja: "これは だれ？" },
        { who: "girl", en: "My father.", ja: "わたしの おとうさん。" }
      ],
      cards: [
        { id: "father", art: "face:father", en: "father", ja: "おとうさん" },
        { id: "mother", art: "face:mother", en: "mother", ja: "おかあさん" },
        { id: "brother", art: "face:brother", en: "brother", ja: "おにいさん" },
        { id: "sister", art: "face:sister", en: "sister", ja: "おねえさん" },
        { id: "grandfather", art: "face:grandfather", en: "grandfather", ja: "おじいさん" },
        { id: "grandmother", art: "face:grandmother", en: "grandmother", ja: "おばあさん" },
        { id: "sam", art: "face:sam", en: "friend Sam", ja: "ともだちの サム" }
      ]
    },
    {
      id: "commands", title: "Commands", ja: "うごいてみよう", icon: "emoji:🙆",
      dialog: [],
      cards: [
        { id: "cough", art: "emoji:😷", en: "Cough.", ja: "せきを しよう。" },
        { id: "sneeze", art: "emoji:🤧", en: "Sneeze.", ja: "くしゃみを しよう。" },
        { id: "cover", art: "emoji:🤭", en: "Cover your mouth.", ja: "くちを おさえよう。" },
        { id: "up", art: "emoji:👀|⬆️", en: "Look up.", ja: "うえを みよう。" },
        { id: "down", art: "emoji:👀|⬇️", en: "Look down.", ja: "したを みよう。" },
        { id: "behind", art: "emoji:👀|🔙", en: "Look behind you.", ja: "うしろを みよう。" },
        { id: "shake", art: "emoji:🙅", en: "Shake your head.", ja: "くびを よこに ふろう。" },
        { id: "nod", art: "emoji:🙆", en: "Nod your head.", ja: "うなずこう。" },
        { id: "scratch", art: "emoji:🤔", en: "Scratch your head.", ja: "あたまを かこう。" },
        { id: "puton", art: "emoji:🧥|⬅️", en: "Put on your coat.", ja: "コートを きよう。" },
        { id: "takeoff", art: "emoji:🧥|➡️", en: "Take off your coat.", ja: "コートを ぬごう。" },
        { id: "gloves", art: "emoji:🧤", en: "Put on your gloves.", ja: "てぶくろを はめよう。" },
        { id: "slow", art: "emoji:🚶|🐢", en: "Walk slowly.", ja: "ゆっくり あるこう。" },
        { id: "quick", art: "emoji:🏃|💨", en: "Walk quickly.", ja: "はやく あるこう。" },
        { id: "stop", art: "emoji:✋|🛑", en: "Stop.", ja: "とまれ！" }
      ]
    }
  ],

  // ---------- ③ ゲーム ----------
  // 文字さがし（Homework: Circle all the ...）
  letterHunt: [
    { letter: "O", emoji: "🐙", word: "octopus", ja: "タコ" },
    { letter: "P", emoji: "🍑", word: "peach", ja: "もも" },
    { letter: "R", emoji: "🐰", word: "rabbit", ja: "うさぎ" },
    { letter: "U", emoji: "☂️", word: "umbrella", ja: "かさ" },
    { letter: "W", emoji: "🍉", word: "watermelon", ja: "すいか" },
    { letter: "X", emoji: "🩻", word: "x-ray", ja: "レントゲン" },
    { letter: "Y", emoji: "🧶", word: "yarn", ja: "けいと" }
  ],
  // 点つなぎ（Homework: Connect the big ... to the little ...）
  dotConnect: [
    { letter: "Q", emoji: "👑", word: "queen", ja: "じょおうさまの かんむり" },
    { letter: "S", emoji: "☀️", word: "sun", ja: "たいよう" },
    { letter: "T", emoji: "🐢", word: "turtle", ja: "カメ" },
    { letter: "V", emoji: "🎻", word: "violin", ja: "バイオリン" },
    { letter: "Z", emoji: "🦓", word: "zebra", ja: "シマウマ" }
  ],
  // 大文字と小文字（Connect the big letters to the little letters）
  letterSets: [
    { id: "a-i", label: "A〜I", letters: "ABCDEFGHI" },
    { id: "j-r", label: "J〜R", letters: "JKLMNOPQR" },
    { id: "s-z", label: "S〜Z", letters: "STUVWXYZ" }
  ]
};
