let current = 0;
let currentView = "map";
const activePlace = {};
const $ = s => document.querySelector(s);
const esc = s => String(s||'').replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const key = (i,p) => `sinan-note-${i}-${p}`;
const gpsKey = (i,p) => `sinan-gps-${i}-${p}`;
function nl2br(s) { return esc(s).replace(/\n/g,'<br>'); }

const ISLAND_THEMES = {
  "임자도": { colorName:"홍매화 빨강", color:"#d63b35", dark:"#7f1d1d", soft:"#fff1f2", ink:"#8f1d1d", rgb:"214,59,53", note:"홍매화 축제와 붉은 봄 경관을 반영한 색" },
  "자은도": { colorName:"바다 민트", color:"#0ea5a4", dark:"#115e59", soft:"#ecfeff", ink:"#0f766e", rgb:"14,165,164", note:"해변·갯벌·해상풍력 경관을 반영한 수업용 색" },
  "암태도": { colorName:"암석 남청", color:"#334155", dark:"#0f172a", soft:"#f1f5f9", ink:"#334155", rgb:"51,65,85", note:"화강암·암석 지형과 선착장 경관을 반영한 수업용 색" },
  "안좌도": { colorName:"퍼플 보라", color:"#7e22ce", dark:"#4c1d95", soft:"#f5f3ff", ink:"#6b21a8", rgb:"126,34,206", note:"퍼플섬·퍼플교 컬러마케팅을 반영한 색" },
  "압해도": { colorName:"항구 파랑", color:"#2563eb", dark:"#1e3a8a", soft:"#eff6ff", ink:"#1d4ed8", rgb:"37,99,235", note:"군청 소재지·교통 결절점·항만 경관을 반영한 수업용 색" },
  "팔금도": { colorName:"황금 노랑", color:"#eab308", dark:"#92400e", soft:"#fef9c3", ink:"#854d0e", rgb:"234,179,8", note:"옐로 정원·황금색 경관 이미지를 반영한 색" }
};
function applyIslandTheme(i) {
  const island = DATA?.islands?.[i];
  const theme = ISLAND_THEMES[island?.name] || ISLAND_THEMES["자은도"];
  const root = document.documentElement;
  root.style.setProperty('--theme', theme.color);
  root.style.setProperty('--theme-dark', theme.dark);
  root.style.setProperty('--theme-soft', theme.soft);
  root.style.setProperty('--theme-ink', theme.ink);
  root.style.setProperty('--theme-hero-a', theme.dark);
  root.style.setProperty('--theme-hero-b', theme.color);
  root.style.setProperty('--theme-rgb', theme.rgb);
  document.body.setAttribute('data-island-theme', island?.name || '');
}
function getIslandTheme(name) { return ISLAND_THEMES[name] || ISLAND_THEMES["자은도"]; }
function getHeroPhoto(p) {
  const photos = PHOTO_MAP[p.title] || [];
  return photos.find(ph => ph.hero !== false && ph.src && !ph.src.startsWith('data:image/svg+xml')) || photos[0] || null;
}
function renderPlaceVisualHero(p) {
  const ph = getHeroPhoto(p);
  const activity = getActivityContent(p);
  const keywords = getPlaceKeywords(p).map(k=>`<span>#${esc(k)}</span>`).join('');
  const see = activity.mission.slice(0,3).map(x=>`<li>${esc(x.replace(/다\.$/, '기'))}</li>`).join('');
  const visual = ph && ph.src ? `<img src="${esc(ph.src)}" alt="${esc(ph.cap)}" loading="lazy" data-photo-src="${esc(ph.src)}" data-photo-cap="${esc(ph.cap)}" data-photo-source="${esc(ph.source||'출처')}" data-photo-url="${esc(ph.url||'#')}" onerror="this.outerHTML='<div class=\'place-visual-fallback\'>대표 사진을 불러오지 못했습니다.<br>사진 자료 영역에서 대체 자료를 확인하세요.</div>'">` : `<div class="place-visual-fallback">대표 사진 보강이 필요한 답사지입니다.<br>현장에서 직접 증거 사진을 남겨 보세요.</div>`;
  return `<div class="place-visual-hero">${visual}<div class="place-hero-caption"><b>🧭 오늘의 탐험 장소</b><span>${esc(ph?.cap || p.title)}</span></div></div>
  <div class="explorer-summary">
    <div class="explorer-card"><b>🔎 관찰 키워드</b><div class="keyword-pills">${keywords}</div></div>
    <div class="explorer-card"><b>이곳에서 찾을 흔적</b><ul>${see}</ul></div>
  </div>`;
}
function getPlaceKeywords(p) {
  const theme = getPlaceTheme(p);
  const map = {
    coast_sand:['해안사구','모래해안','방풍림','관광자원'],
    tidal_flat:['갯벌','물때','포구','생활경관'],
    rock_coast:['해식지형','암석','풍화','안전'],
    transport:['교통변화','연륙·연도교','접근성','생활권'],
    reclamation:['간척지','방조제','농경지','토지이용'],
    energy:['재생에너지','경관변화','지역갈등','지속가능성'],
    harbor_tourism:['항구','해양관광','개발과보전','마리나'],
    general:['지형','경관','지역변화','관찰']
  };
  return map[theme] || map.general;
}

const ISLAND_LEARNING = {
  "임자도": {
    icon:"🌺",
    title:"모래가 만든 섬, 그리고 사람이 가꾼 관광 경관",
    intro:"임자도에서는 긴 백사장과 사구, 방풍림, 대파밭, 튤립 축제가 서로 연결되는 모습을 볼 수 있습니다. 바람과 파도가 만든 모래 지형이 농업과 관광, 마을 생활에 어떤 영향을 주는지 살펴보는 것이 핵심입니다.",
    points:[
      ["해안 사구와 백사장", "파도와 바람이 모래를 옮기고 쌓아 긴 해변과 사구를 만듭니다."],
      ["방풍림과 농업", "해송 숲은 바람과 모래, 염분을 막아 마을과 농경지를 보호합니다."],
      ["축제와 장소 이미지", "튤립은 생산 작물이라기보다 임자도를 알리는 봄철 관광 자원으로 활용됩니다."]
    ],
    question:"임자도는 왜 ‘모래 지형’이 자연 경관뿐 아니라 농업과 관광까지 바꾸는 사례가 될까요?"
  },
  "자은도": {
    icon:"🌬️",
    title:"바람, 해변, 갯벌이 관광과 에너지 자원이 되는 섬",
    intro:"자은도에서는 연속된 해수욕장, 방풍림, 갯벌, 풍력 발전을 함께 볼 수 있습니다. 불편하게 느껴질 수 있는 바람과 모래, 갯벌이 어떻게 에너지·생태관광·농업의 조건이 되는지 살펴보면 좋습니다.",
    points:[
      ["해변과 사질토", "고운 모래 해변과 물 빠짐이 좋은 토양은 경관과 농업에 모두 영향을 줍니다."],
      ["바람의 활용", "강한 바람은 생활에는 불편할 수 있지만 풍력 발전의 입지 조건이 됩니다."],
      ["생태관광", "갯벌과 사구를 훼손하지 않고 관찰·체험하는 방식이 지속가능성을 좌우합니다."]
    ],
    question:"자은도에서 바람과 갯벌은 왜 ‘불편한 자연’이 아니라 ‘활용할 수 있는 자원’이 될 수 있을까요?"
  },
  "암태도": {
    icon:"🪨",
    title:"암석 지형과 섬 교통의 변화를 함께 보는 섬",
    intro:"암태도에서는 바위 해안, 노둣길, 선착장, 천사대교 조망을 통해 섬 지역의 자연 조건과 교통 변화가 어떻게 연결되는지 볼 수 있습니다. 특히 다리와 도로가 생기면서 섬의 접근성과 생활권이 달라지는 과정을 살펴보는 것이 중요합니다.",
    points:[
      ["암석과 해안", "바위 해안과 해식 지형은 파랑과 풍화 작용을 이해하는 단서가 됩니다."],
      ["노둣길과 물때", "물때에 따라 길이 열리고 닫히는 경험은 섬 교통의 제약을 보여줍니다."],
      ["교통망 변화", "천사대교와 선착장은 섬의 이동 방식이 어떻게 바뀌었는지 보여줍니다."]
    ],
    question:"다리와 도로가 연결되면 섬은 더 편리해지지만, 기존 선착장과 마을의 역할은 어떻게 달라질까요?"
  },
  "안좌도": {
    icon:"💜",
    title:"색채 관광, 간척지, 재생에너지가 만나는 섬",
    intro:"안좌도에서는 퍼플섬의 장소 마케팅, 간척 평야, 태양광 발전을 함께 볼 수 있습니다. 지역 이미지를 새롭게 만들고, 바다를 농경지로 바꾸며, 에너지를 생산하는 방식이 지역 경관과 주민 생활에 어떤 영향을 주는지 생각해 볼 수 있습니다.",
    points:[
      ["퍼플섬과 장소성", "보라색 경관은 지역을 기억하게 만드는 관광 브랜드가 됩니다."],
      ["간척과 농업", "방조제와 배수로는 갯벌이 농경지로 바뀐 흔적을 보여줍니다."],
      ["재생에너지", "태양광 발전은 친환경 에너지이지만 경관 변화와 주민 수용성도 함께 생각해야 합니다."]
    ],
    question:"안좌도에서는 지역 개발이 관광, 농업, 에너지 중 어느 한 가지가 아니라 여러 방식으로 동시에 나타납니다. 그 장점과 고민은 무엇일까요?"
  },
  "압해도": {
    icon:"🚢",
    title:"신안의 관문에서 교통과 해안 경관을 읽는 섬",
    intro:"압해도는 신안군청 소재지와 송공항을 중심으로 여러 섬을 연결하는 관문 역할을 합니다. 항구, 도로, 여객 이동, 해안 지형을 함께 보며 교통 결절점이 지역의 중심성을 어떻게 만드는지 살펴보면 좋습니다.",
    points:[
      ["교통 결절점", "송공항과 도로망은 사람과 물자가 모이고 흩어지는 지점을 보여줍니다."],
      ["해안 경관", "분매리 해안과 노루섬은 침식·퇴적·물때 관찰에 좋은 장소입니다."],
      ["행정과 생활권", "압해도는 신안 여러 섬을 연결하는 생활·행정 중심지 역할을 합니다."]
    ],
    question:"압해도는 왜 단순한 섬 하나가 아니라 신안 여러 섬을 연결하는 ‘관문’으로 이해할 수 있을까요?"
  },
  "팔금도": {
    icon:"🌾",
    title:"작은 섬에서 간척과 교통 변화의 흔적을 찾는 섬",
    intro:"팔금도에서는 간척 농경지, 등대, 선착장을 통해 작은 섬의 공간 변화가 잘 드러납니다. 바다를 막아 만든 농경지와 다리 개통 이후 기능이 약해진 선착장을 비교하면, 인간 활동이 섬의 경관을 어떻게 바꾸는지 이해할 수 있습니다.",
    points:[
      ["간척 농경지", "반듯한 논밭과 배수로는 바다와 갯벌이 농업 공간으로 바뀐 흔적입니다."],
      ["등대와 해상 안전", "좁은 바닷길의 조류와 선박 안전을 함께 생각할 수 있습니다."],
      ["선착장의 변화", "다리와 도로가 생기면 기존 배 교통 거점의 역할이 달라질 수 있습니다."]
    ],
    question:"팔금도에서 간척지와 선착장은 ‘섬의 생활 방식이 바뀐 흔적’이라고 볼 수 있을까요?"
  }
};
function islandLearningCard(island) {
  const d = ISLAND_LEARNING[island.name];
  if (!d) return '';
  const pts = d.points.map(([h,t]) => `<div class="island-learning-point"><b>${esc(h)}</b>${esc(t)}</div>`).join('');
  return `<div class="island-learning-card">
    <div class="island-learning-head"><div class="island-learning-icon" aria-hidden="true">${d.icon}</div><div><h3 class="island-learning-title">${esc(d.title)}</h3><p class="island-learning-intro">${esc(d.intro)}</p></div></div>
    <div class="island-learning-grid">${pts}</div>
    <div class="island-big-question">생각해 볼 질문: ${esc(d.question)}</div>
  </div>`;
}

function islandThemeNote(island) {
  const t = getIslandTheme(island.name);
  return `<div class="island-theme-note"><b>${esc(t.colorName)}</b> — ${esc(t.note)}</div>`;
}


/* Terminology tooltip renderer */
function annotateTerms(text) {
  if (!text) return '';
  const keys = Object.keys(TERMS_DICT).sort((a,b) => b.length - a.length);
  let html = esc(text);
  const spans = [];
  keys.forEach(term => {
    const info = TERMS_DICT[term];
    if (info.tier === 'core') return;
    const cls = info.tier === 'advanced' ? 'term-adv' : 'term-edge';
    const wikiEn = info.en ? `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(info.en)}` : '';
    const wikiKo = `https://ko.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(term)}`;
    const tipHtml = `<span class="${cls}" data-term="${esc(term)}" tabindex="0" role="button" aria-label="${esc(term)} 용어 설명 열기">${esc(term)}<span class="term-tip"><b>${esc(term)}${info.en ? ' ('+esc(info.en)+')' : ''}</b><br>${esc(info.desc)}<br><a href="${wikiKo}" target="_blank" rel="noopener">한국어 위키백과 검색</a>${wikiEn ? ' · <a href="'+wikiEn+'" target="_blank" rel="noopener">영어 위키백과</a>' : ''}</span></span>`;
    const marker = `__TERM_${spans.length}__`;
    spans.push(tipHtml);
    // Replace only first occurrence per term to avoid stacking
    const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
    html = html.replace(re, marker);
  });
  spans.forEach((s, i) => { html = html.replace(`__TERM_${i}__`, s); });
  return html.replace(/\n/g,'<br>');
}

function renderTidalBadge(title) {
  const t = TIDAL_MAP[title];
  if (!t) return '';
  const labels = {required:'물때 필수', recommend:'물때 권장', reference:'물때 참고'};
  return `<span class="badge-item badge-tidal ${t.level} help-badge" tabindex="0" role="button" data-help="${esc(t.note)}">${labels[t.level]} <span class="help-dot">?</span></span>`;
}

function renderTideLink(title) {
  if (!TIDAL_MAP[title]) return '';
  return `<a href="https://www.khoa.go.kr/swtc/main.do" target="_blank" rel="noopener" title="국립해양조사원 스마트 조석예보에서 답사일과 인근 예보지점을 확인합니다">물때 조회</a>`;
}
function getPlaceCurriculumHelp(title, code) {
  const theme = getPlaceTheme({title});
  const placePhrase = `${title} 답사에서는`;
  const themeHelp = {
    coast_sand: {
      "9통사02": `${placePhrase} 해안 사구, 바람, 파랑, 방풍림을 통해 자연환경이 인간 생활과 토지 이용에 미치는 영향을 살펴봅니다.`,
      "12한지02": `${placePhrase} 모래 해안, 사구, 연안 퇴적 과정을 현장에서 관찰하며 우리나라 해안 지형의 형성 원리를 설명합니다.`,
      "12여지02": `${placePhrase} 해변 경관이 지역 이미지와 관광 자원으로 활용되는 방식을 살펴보고, 책임 있는 답사 태도를 생각합니다.`
    },
    tidal_flat: {
      "9통사02": `${placePhrase} 갯벌, 조수 간만의 차, 포구 입지가 주민 생활과 생업에 어떤 조건을 제공하는지 확인합니다.`,
      "12한지04": `${placePhrase} 항구·선착장·어업 활동의 입지와 교통 접근성 변화를 산업·교통 공간 구조와 연결합니다.`,
      "12여지02": `${placePhrase} 갯벌과 포구가 지닌 장소성과 생태 관광의 의미를 이해하고 보전 태도를 기릅니다.`,
      "12한지05": `${placePhrase} 갯벌 보전, 관광 이용, 항만 개발 사이의 지속가능한 선택을 탐구합니다.`,
      "12한지02": `${placePhrase} 조간대 갯벌, 갯골, 퇴적물 변화 등 해안 지형의 특징을 관찰합니다.`
    },
    rock_coast: {
      "12한지02": `${placePhrase} 해식애, 해식 동굴, 절리, 풍화 흔적을 통해 해안 침식 지형과 지질 구조를 탐구합니다.`,
      "12여지02": `${placePhrase} 특이 지질 경관을 관광 자원으로 활용할 때 필요한 안전과 보전 태도를 생각합니다.`,
      "12한지05": `${placePhrase} 지질 명소의 보전과 탐방 이용 사이의 균형을 판단합니다.`
    },
    transport: {
      "9통사04": `${placePhrase} 다리, 노둣길, 선착장 같은 교통 시설이 생활권, 접근성, 지역 경제를 어떻게 바꾸는지 살펴봅니다.`,
      "12한지04": `${placePhrase} 연륙·연도교와 항구의 기능 변화를 통해 교통망 재편과 지역 공간 구조 변화를 탐구합니다.`,
      "9통사02": `${placePhrase} 물때와 해안 지형이라는 자연 조건이 이동 방식과 교통 시설 이용에 미치는 영향을 확인합니다.`,
      "12한지05": `${placePhrase} 관광·레저 개발과 주민 생활, 해양 환경 보전 사이의 관계를 판단합니다.`
    },
    reclamation: {
      "12한지02": `${placePhrase} 갯벌이 농경지로 바뀐 과정을 통해 간척 지형과 토지 피복 변화를 관찰합니다.`,
      "12한지04": `${placePhrase} 간척지의 농업 이용과 도로·수로 배열을 산업·교통 공간 구조와 연결합니다.`,
      "9통사04": `${placePhrase} 토지 이용 변화가 지역 생활공간과 공동체에 미친 영향을 살펴봅니다.`
    },
    energy: {
      "9통사04": `${placePhrase} 재생에너지 시설 입지가 지역 경제, 경관, 주민 생활에 가져오는 변화를 살펴봅니다.`,
      "12한지04": `${placePhrase} 태양광·풍력 시설의 입지를 자연 조건, 토지 이용, 교통 접근성과 연결해 탐구합니다.`,
      "12한지05": `${placePhrase} 기후 위기 대응, 에너지 전환, 경관·생태 보전 사이의 지속가능성을 판단합니다.`,
      "12여지02": `${placePhrase} 에너지 경관이 새로운 지역 이미지와 답사 주제로 구성되는 방식을 살펴봅니다.`
    },
    harbor_tourism: {
      "9통사02": `${placePhrase} 만, 갯벌, 바람 같은 자연 조건이 항구 입지와 주민 생활에 미치는 영향을 확인합니다.`,
      "12한지05": `${placePhrase} 해양 관광·레저 개발이 지역 활성화와 환경 보전에 어떤 쟁점을 만드는지 탐구합니다.`,
      "9통사04": `${placePhrase} 관광 시설과 교통 시설이 지역 변화와 생활공간 재편에 미치는 영향을 살펴봅니다.`,
      "12한지04": `${placePhrase} 항구·마리나·교통 시설의 입지를 산업 및 교통 공간 구조와 연결합니다.`
    }
  };
  return (themeHelp[theme] && themeHelp[theme][code]) || STANDARDS_META[code] || code;
}
function renderStandardBadges(title) {
  const stds = PLACE_STANDARDS[title] || [];
  return stds.map(s => `<span class="badge-item badge-standard help-badge" tabindex="0" role="button" data-help="${esc(getPlaceCurriculumHelp(title, s))}">${esc(STANDARDS_LABEL[s]||s)} <span class="help-dot">?</span><span class="curriculum-place-note">장소 연계</span></span>`).join('');
}
function renderPrincipleCards(title) {
  const cards = [];
  Object.entries(PRINCIPLE_CARDS).forEach(([term, card]) => {
    if (card.places.includes(title)) {
      cards.push(`<details class="principle-card"><summary>${esc(card.title)}</summary><div class="p-body">${esc(card.body)}</div></details>`);
    }
  });
  return cards.join('');
}



function getPlaceTheme(p) {
  const t = p.title;
  if (/해수욕장|해변|사구|뮤지엄/.test(t)) return 'coast_sand';
  if (/갯벌|분매리|전장포|둔장|송공항/.test(t)) return 'tidal_flat';
  if (/용난굴|노루섬|서근등대/.test(t)) return 'rock_coast';
  if (/노둣길|퍼플교|선착장|고산/.test(t)) return 'transport';
  if (/간척|자라도|이목리/.test(t)) return 'reclamation';
  if (/태양광|풍력/.test(t)) return 'energy';
  if (/생낌항|마리나|오도/.test(t)) return 'harbor_tourism';
  return 'general';
}

function getActivityContent(p) {
  const theme = getPlaceTheme(p);
  const title = p.title;
  const base = {
    coast_sand: {
      question:'모래 해안과 사구는 어떻게 만들어지고, 사람들은 이 지형을 어떻게 이용·보전하고 있을까?',
      mission:['모래의 입자 크기·색·단단함을 손으로 비교한다.','해변 뒤쪽의 방풍림·식생·시설물이 어떤 역할을 하는지 찾는다.','바다 쪽에서 내륙 쪽으로 이동하며 경관이 어떻게 바뀌는지 기록한다.'],
      photo:['해변 전체 규모가 드러나는 사진','사구·방풍림·염생식물 중 하나의 근접 사진','사람의 이용 시설과 자연 지형이 함께 보이는 사진'],
      questions:['이 해안 지형은 자연 그대로 보전하는 것이 좋을까, 관광 자원으로 활용하는 것이 좋을까?','방풍림이나 탐방로가 없다면 주변 농경지와 마을에는 어떤 변화가 생길까?'],
      safety:['사구 식생 보호를 위해 정해진 길을 벗어나지 않는다.','파도가 높거나 강풍이 불 때는 해안선 가까이 접근하지 않는다.']
    },
    tidal_flat: {
      question:'갯벌과 포구의 지형은 주민 생활, 교통, 산업과 어떤 관계를 맺고 있을까?',
      mission:['간조와 만조에 따라 드러나는 지형 범위를 확인한다.','갯골·어구·선착장·방조제 등 인간 활동의 흔적을 찾는다.','갯벌의 색, 질감, 냄새, 생물 흔적을 관찰해 기록한다.'],
      photo:['갯벌과 갯골의 형태가 드러나는 사진','포구·선박·어구 등 생활 경관 사진','자연 지형과 인공 구조물이 함께 보이는 사진'],
      questions:['갯벌은 개발해야 할 땅일까, 보전해야 할 생태 공간일까?','다리와 도로가 늘어나면 포구의 역할은 어떻게 달라질까?'],
      safety:['갯벌에는 지도교사 허락 없이 들어가지 않는다.','물때를 확인하고 만조 전에는 반드시 안전한 곳으로 이동한다.']
    },
    rock_coast: {
      question:'바위 해안의 절리, 풍화, 침식 흔적은 이 지역의 지질 역사를 어떻게 보여 줄까?',
      mission:['바위 표면의 갈라진 방향, 색, 층리, 구멍 형태를 관찰한다.','파도 침식이 집중되는 부분과 덜 침식된 부분을 비교한다.','해식애·동굴·노두 주변에서 접근 가능한 안전선을 확인한다.'],
      photo:['절리·층리·암맥 등 구조가 선명한 사진','파도 침식 또는 풍화 흔적의 근접 사진','주변 해안 경관과 지형이 함께 보이는 사진'],
      questions:['같은 바위라도 어떤 곳은 더 빨리 깎이고 어떤 곳은 덜 깎이는 이유는 무엇일까?','이 지형을 관광지로 활용할 때 가장 먼저 고려해야 할 안전 문제는 무엇일까?'],
      safety:['해식애 가장자리와 젖은 바위에는 접근하지 않는다.','해식 동굴이나 노두는 간조 시간과 철수 시간을 반드시 확인한다.']
    },
    transport: {
      question:'섬을 잇는 다리, 노둣길, 선착장은 지역의 이동 방식과 생활권을 어떻게 바꾸었을까?',
      mission:['사람·차량·선박이 이동하는 방향과 흐름을 관찰한다.','교통 시설이 생기기 전후의 생활 변화를 추론한다.','관광객 이용과 주민 이용이 충돌하거나 공존하는 장면을 찾는다.'],
      photo:['다리·노둣길·선착장의 구조가 드러나는 사진','교통 시설 주변의 상업·관광 시설 사진','현재는 기능이 줄었거나 바뀐 시설의 흔적 사진'],
      questions:['다리가 놓이면 모든 지역이 똑같이 발전할까?','기존 선착장이나 포구가 쇠퇴할 때 지역은 어떤 선택을 할 수 있을까?'],
      safety:['차량 통행 구간에서는 촬영보다 안전 거리를 먼저 확보한다.','노둣길은 물때와 노면 상태를 확인한 뒤 이동한다.']
    },
    reclamation: {
      question:'갯벌을 막아 만든 간척지는 섬의 토지 이용과 생태계를 어떻게 바꾸었을까?',
      mission:['방조제 안쪽과 바깥쪽의 경관 차이를 비교한다.','논밭의 형태, 배수로, 수문, 도로망이 어떻게 배열되어 있는지 본다.','간척 전의 지형을 상상하고 현재 토지 이용과 비교한다.'],
      photo:['방조제 또는 수문이 드러나는 사진','바둑판형 농경지와 도로망 사진','바다·갯벌·농경지의 경계가 보이는 사진'],
      questions:['간척은 식량 생산과 생태 보전 중 어느 쪽에 더 큰 영향을 주었을까?','앞으로 기후변화와 해수면 상승이 간척지에 어떤 문제를 만들 수 있을까?'],
      safety:['방조제 가장자리, 배수로, 수문 주변에서는 장난치지 않는다.','농경지 사유지에는 허락 없이 들어가지 않는다.']
    },
    energy: {
      question:'섬 지역의 바람과 일조량은 어떻게 재생에너지 자원으로 바뀌고 있을까?',
      mission:['발전 시설의 위치와 주변 지형 조건을 연결해 본다.','농업·관광·주거 공간과 발전 시설이 어떻게 공존하는지 관찰한다.','재생에너지 개발의 장점과 갈등 가능성을 함께 기록한다.'],
      photo:['발전 시설과 주변 경관이 함께 보이는 사진','농경지·마을·도로와 발전 시설의 거리감이 보이는 사진','안내판이나 안전 시설 사진'],
      questions:['재생에너지 시설은 지역 주민에게 어떤 이익과 부담을 동시에 줄까?','섬 지역은 왜 재생에너지 입지로 자주 주목받을까?'],
      safety:['발전 시설 내부나 통제 구역에는 들어가지 않는다.','시설물 촬영 시 안내판과 출입 제한 표시를 따른다.']
    },
    harbor_tourism: {
      question:'항구와 해양 관광 개발은 지역 경제, 생태 환경, 주민 생활에 어떤 변화를 가져올까?',
      mission:['항구 시설, 관광 시설, 자연 해안이 만나는 지점을 찾는다.','개발된 공간과 아직 자연성이 남은 공간을 비교한다.','관광객 증가가 만들 수 있는 이익과 문제를 함께 기록한다.'],
      photo:['항구·마리나·선착장 시설 사진','해안 생태 또는 경관 훼손 우려 지점 사진','주민 생활 공간과 관광 공간이 만나는 사진'],
      questions:['해양 관광 개발은 지역을 살리는 방법일까, 새로운 갈등의 원인이 될까?','개발과 보전을 함께 만족시키려면 어떤 기준이 필요할까?'],
      safety:['항구 가장자리와 선박 접안 구역에서는 안전선을 넘지 않는다.','공사장이나 사유 시설에는 허락 없이 접근하지 않는다.']
    },
    general: {
      question:'이 장소의 자연환경과 인간 활동은 서로 어떤 영향을 주고받고 있을까?',
      mission:['가장 눈에 띄는 자연 지형을 하나 찾는다.','그 지형을 이용하거나 바꾼 인간 활동을 하나 찾는다.','관찰 사실과 해석을 구분해 기록한다.'],
      photo:['장소 전체 모습 사진','핵심 지형 또는 시설 근접 사진','사람의 이용 흔적이 보이는 사진'],
      questions:['이 장소가 신안군 섬 지역의 특징을 보여 주는 이유는 무엇일까?','답사 전 예상과 실제 관찰 결과는 어떻게 달랐을까?'],
      safety:['지도교사의 안내에 따라 이동한다.','촬영보다 안전 확보를 우선한다.']
    }
  };
  const content = base[theme] || base.general;
  if (/용난굴|노둣길|노루섬/.test(title)) content.safety = ['반드시 간조 시간을 확인하고, 만조 1시간 전에는 철수한다.','젖은 바위와 갯벌 가장자리는 미끄러지거나 빠질 수 있으므로 단독 행동을 하지 않는다.'];
  if (/서근등대/.test(title)) content.safety = ['해식애 가장자리와 난간 밖으로 접근하지 않는다.','강풍이 불 때는 등대 주변 고지대에서 촬영 자세를 무리하게 취하지 않는다.'];
  return content;
}

function renderStudentActivity(p) {
  const a = getActivityContent(p);
  return `<div class="student-activity">
    <div class="activity-card"><strong>핵심 질문</strong><p>${esc(a.question)}</p></div>
    <div class="activity-card"><strong>현장 관찰 미션</strong><ul class="activity-list">${a.mission.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="activity-card"><strong>증거 사진 남기기</strong><ul class="activity-list">${a.photo.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
  </div>`;
}

function renderFieldNoteGuide() {
  return `<div class="field-note-grid">
    <div class="field-note"><b>관찰 사실</b><span>눈으로 본 지형·시설·색·형태를 그대로 적기</span></div>
    <div class="field-note"><b>지리적 해석</b><span>왜 그런 모습이 나타났는지 개념으로 설명하기</span></div>
    <div class="field-note"><b>추가 질문</b><span>더 조사하고 싶은 점이나 토론할 문제 적기</span></div>
  </div>`;
}

function renderSafetyAndThinking(p) {
  const a = getActivityContent(p);
  return `<div class="safety-box"><strong>안전 유의사항</strong><ul>${a.safety.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="thinking-box"><strong>답사 후 생각 질문</strong><ol>${a.questions.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>`;
}


function getStudentChecklist(p) {
  const a = getActivityContent(p);
  const theme = getPlaceTheme(p);
  const common = {
    coast_sand: [
      ['모래를 살펴보기', '입자 크기, 색, 단단함 중 2가지를 비교해 적습니다.'],
      ['해변 뒤쪽을 보기', '방풍림, 사구 식물, 탐방로, 건물 중 무엇이 있는지 찾습니다.'],
      ['바다에서 육지 쪽으로 걷기', '경관이 모래사장 → 식생 → 시설·마을로 어떻게 바뀌는지 봅니다.'],
      ['사람의 이용 모습 찾기', '관광, 산책, 농업 보호, 생태 보전 중 어떤 이용이 보이는지 적습니다.']
    ],
    tidal_flat: [
      ['물때 확인하기', '지금이 밀물인지 썰물인지 확인하고 갯벌이 얼마나 드러났는지 봅니다.'],
      ['갯벌 표면 보기', '색, 질감, 갯골, 생물 흔적 중 2가지를 관찰합니다.'],
      ['생활 흔적 찾기', '어구, 선착장, 배, 돌담, 방조제 등 사람의 이용 흔적을 찾습니다.'],
      ['자연과 사람 연결하기', '이 지형이 어업, 교통, 관광, 농업 중 무엇과 연결되는지 적습니다.']
    ],
    rock_coast: [
      ['바위 모양 보기', '갈라진 틈, 층, 구멍, 색 차이 중 2가지를 찾습니다.'],
      ['파도가 깎은 흔적 찾기', '해식애, 동굴, 자갈 해변, 파식대 중 보이는 것을 표시합니다.'],
      ['가까이 가지 말고 관찰하기', '위험한 가장자리나 젖은 바위는 멀리서 보고 기록합니다.'],
      ['형성 과정 생각하기', '침식, 풍화, 암석의 약한 부분 중 어떤 개념으로 설명할 수 있는지 적습니다.']
    ],
    transport: [
      ['이동 수단 찾기', '다리, 도로, 배, 선착장, 노둣길 중 보이는 것을 표시합니다.'],
      ['사람과 차량 흐름 보기', '누가, 어디로, 어떤 수단으로 이동하는지 관찰합니다.'],
      ['과거와 현재 비교하기', '다리나 도로가 생기기 전에는 어떻게 이동했을지 생각합니다.'],
      ['변화의 영향 적기', '주민 생활, 관광, 상점, 항구 기능 중 무엇이 달라졌는지 기록합니다.']
    ],
    reclamation: [
      ['방조제 찾기', '바다와 농경지를 나누는 둑, 수문, 배수로를 찾습니다.'],
      ['양쪽 경관 비교하기', '방조제 바깥과 안쪽의 물, 식물, 토지 이용 차이를 봅니다.'],
      ['농경지 형태 보기', '논밭, 도로, 배수로가 어떤 모양으로 배열되어 있는지 관찰합니다.'],
      ['장점과 문제 생각하기', '식량 생산, 생태 변화, 침수 위험 중 하나를 골라 적습니다.']
    ],
    energy: [
      ['발전 시설 위치 보기', '태양광·풍력 시설이 어디에 놓였는지 주변 지형과 함께 봅니다.'],
      ['주변 공간과 비교하기', '농경지, 마을, 도로, 관광지와의 거리를 관찰합니다.'],
      ['장점 찾기', '전기 생산, 지역 수익, 기후 대응 등 긍정적 효과를 찾습니다.'],
      ['걱정되는 점 찾기', '경관 변화, 생태 영향, 주민 갈등 등 문제 가능성을 적습니다.']
    ],
    harbor_tourism: [
      ['항구 시설 보기', '방파제, 선착장, 배, 마리나 시설 중 보이는 것을 표시합니다.'],
      ['관광 시설 찾기', '카페, 전망대, 산책로, 안내판 등 관광객을 위한 시설을 봅니다.'],
      ['자연 해안과 비교하기', '개발된 공간과 자연성이 남은 공간의 차이를 기록합니다.'],
      ['지역 변화 생각하기', '관광 개발이 주민 생활과 자연환경에 줄 영향을 적습니다.']
    ],
    general: [
      ['핵심 지형 찾기', '이 장소를 대표하는 자연 지형을 하나 고릅니다.'],
      ['인간 활동 찾기', '사람들이 그 지형을 이용하거나 바꾼 모습을 찾습니다.'],
      ['사진으로 기록하기', '전체 모습 1장, 가까운 모습 1장을 남깁니다.'],
      ['한 문장으로 정리하기', '이 장소의 지리적 특징을 한 문장으로 씁니다.']
    ]
  };
  return common[theme] || common.general;
}

const MAP_POINTS = [
  {title:'대광해수욕장', island:'임자도', lat:35.0849, lng:126.0879},
  {title:'전장포마을', island:'임자도', lat:35.0638, lng:126.1378},
  {title:'용난굴', island:'임자도', lat:35.0392, lng:126.0758},
  {title:'백길해수욕장', island:'자은도', lat:34.8726, lng:126.0036},
  {title:'둔장 해변 공원', island:'자은도', lat:34.9146, lng:126.0315},
  {title:'1004 뮤지엄 파크 (양산해변)', island:'자은도', lat:34.87794449, lng:125.9959143},
  {title:'추포해수욕장 및 노둣길', island:'암태도', lat:34.8763, lng:126.0732},
  {title:'생낌항', island:'암태도', lat:34.877236111111, lng:126.10849722222},
  {title:'암태 오도 선착장 주변 (선착장 입지 및 해양 레저 환경)', island:'암태도', lat:34.860969444444, lng:126.15572222222},
  {title:'퍼플섬과 퍼플교 (반월도·박지도)', island:'안좌도', lat:34.7046, lng:126.1236},
  {title:'자라도 (간척 평야 지형)', island:'안좌도', lat:34.7092, lng:126.1969},
  {title:'태양광 발전소 (스마트팜 앤 쏠라시티)', island:'안좌도', lat:34.7568, lng:126.1343},
  {title:'송공항 일대', island:'압해도', lat:34.847719396, lng:126.2270177127},
  {title:'분매리 해안', island:'압해도', lat:34.8643, lng:126.3049},
  {title:'노루섬 (바깥노루섬)', island:'압해도', lat:34.8176, lng:126.2515},
  {title:'서근등대', island:'팔금도', lat:34.8020, lng:126.0785},
  {title:'고산선착장', island:'팔금도', lat:34.7817, lng:126.1528},
  {title:'이목리마을 (간척 농경지)', island:'팔금도', lat:34.7867, lng:126.1715}
];
let fieldMap = null;
let fieldMarkers = {};
let studentFieldMarkers = {};
let customGpsMarker = null;

function findPlaceRefByTitle(title) {
  for (let i=0; i<DATA.islands.length; i++) {
    const pi = DATA.islands[i].places.findIndex(p => p.title === title);
    if (pi >= 0) return {islandIndex:i, placeIndex:pi, island:DATA.islands[i], place:DATA.islands[i].places[pi]};
  }
  return null;
}
function getStoredGpsForTitle(title) {
  const ref = findPlaceRefByTitle(title);
  if (!ref) return null;
  try {
    const raw = JSON.parse(localStorage.getItem(gpsKey(ref.islandIndex, ref.placeIndex)) || '{}');
    const lat = parseCoordValue(raw.lat);
    const lng = parseCoordValue(raw.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return {lat, lng, ref};
    }
  } catch(e) {}
  return null;
}
function naverMapSearchUrl(title) {
  const naverQueries = {
    '대광해수욕장': '전라남도 신안군 임자면 대광해수욕장',
    '전장포마을': '전라남도 신안군 임자면 전장포마을',
    '용난굴': '전라남도 신안군 임자면 용난굴',
    '백길해수욕장': '전라남도 신안군 자은면 백길해수욕장',
    '둔장 해변 공원': '전라남도 신안군 자은면 둔장해변 무한의다리',
    '1004 뮤지엄 파크 (양산해변)': '전라남도 신안군 자은면 1004 뮤지엄파크 양산해변',
    '추포해수욕장 및 노둣길': '전라남도 신안군 암태면 추포해수욕장 노둣길',
    '생낌항': '전라남도 신안군 암태면 생낌항',
    '암태 오도 선착장 주변 (선착장 입지 및 해양 레저 환경)': '전라남도 신안군 암태면 오도선착장',
    '퍼플섬과 퍼플교 (반월도·박지도)': '전라남도 신안군 안좌면 퍼플섬 퍼플교',
    '자라도 (간척 평야 지형)': '전라남도 신안군 안좌면 자라도',
    '태양광 발전소 (스마트팜 앤 쏠라시티)': '전라남도 신안군 안좌면 스마트팜앤쏠라시티 태양광 발전소',
    '송공항 일대': '전라남도 신안군 압해읍 송공항',
    '분매리 해안': '전라남도 신안군 압해읍 분매리 해안',
    '노루섬 (바깥노루섬)': '전라남도 신안군 압해읍 바깥노루섬',
    '서근등대': '전라남도 신안군 팔금면 서근등대',
    '고산선착장': '전라남도 신안군 팔금면 고산선착장',
    '이목리마을 (간척 농경지)': '전라남도 신안군 팔금면 이목리 간척 농경지'
  };
  const query = naverQueries[title] || ('전라남도 신안군 ' + String(title || '').replace(/\s*\([^)]*\)/g, '').replace(/및.+$/, '').trim());
  return 'https://map.naver.com/p/search/' + encodeURIComponent(query);
}
function osmCoordUrl(lat, lng, zoom=15) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
}
function markerPopupHtml(title, island, lat, lng, type='default') {
  const safeTitle = title.replace(/'/g, "\\'");
  const label = type === 'student' ? '<span style="font-weight:900;color:#111827">학생 입력 위치</span><br>' : '<span style="color:#4b5563">기본 위치</span><br>';
  const coordLine = type === 'student' ? `${lat.toFixed(5)}, ${lng.toFixed(5)}<br>` : '';
  return `<b>${title}</b><br>${island}<br>${label}${coordLine}<button class="map-jump" onclick="jumpToPlaceFromMap('${safeTitle}')">자료 보기</button><br><a class="map-jump" target="_blank" rel="noopener" href="${naverMapSearchUrl(title)}">네이버 지도</a> <a class="map-jump" target="_blank" rel="noopener" href="${osmCoordUrl(lat,lng,type === 'student' ? 16 : 15)}">OSM 지도</a>`;
}
function showMapFallback(message) {
  const fb = document.getElementById('map-fallback');
  if (fb) {
    fb.classList.add('open');
    if (message) fb.innerHTML = message;
  }
}
function hideMapFallback() {
  const fb = document.getElementById('map-fallback');
  if (fb) fb.classList.remove('open');
}

function stabilizeFieldMap(options = {}) {
  if (!fieldMap) return;
  const el = document.getElementById('field-map');
  const status = document.getElementById('map-status-line');
  const ticks = [0, 80, 220, 500, 1000];
  ticks.forEach(t => setTimeout(() => {
    try {
      fieldMap.invalidateSize({animate:false, pan:false});
      if (options.fit && MAP_POINTS && MAP_POINTS.length) {
        const bounds = L.latLngBounds(MAP_POINTS.map(p => [p.lat, p.lng]));
        fieldMap.fitBounds(bounds, {padding:[26, 26], maxZoom: 11, animate:false});
      }
      if (status && el) {
        const w = Math.round(el.getBoundingClientRect().width);
        status.textContent = `지도 표시 영역: ${w}px · 타일이 어긋나면 ‘지도 다시 불러오기’를 눌러 보세요.`;
      }
    } catch (e) {}
  }, t));
}
let fieldMapResizeObserver = null;
function attachFieldMapResizeObserver() {
  const el = document.getElementById('field-map');
  if (!el || typeof ResizeObserver === 'undefined') return;
  if (fieldMapResizeObserver) fieldMapResizeObserver.disconnect();
  fieldMapResizeObserver = new ResizeObserver(() => stabilizeFieldMap());
  fieldMapResizeObserver.observe(el);
}

function removeLayerSafe(layer) {
  try { if (layer && fieldMap && fieldMap.hasLayer(layer)) fieldMap.removeLayer(layer); } catch(e) {}
}
function addDefaultMarker(pt) {
  if (!fieldMap) return null;
  const th = getIslandTheme(pt.island);
  const marker = L.circleMarker([pt.lat, pt.lng], {
    radius: 8,
    weight: 3,
    color: '#ffffff',
    fillColor: th.color,
    fillOpacity: 0.95,
    opacity: 1,
    className: 'fieldwork-circle-marker'
  }).addTo(fieldMap);
  marker.bindPopup(markerPopupHtml(pt.title, pt.island, pt.lat, pt.lng, 'default'));
  return marker;
}
function addStudentMarker(pt, gps) {
  if (!fieldMap) return null;
  const th = getIslandTheme(pt.island);
  const marker = L.circleMarker([gps.lat, gps.lng], {
    radius: 10,
    weight: 4,
    color: '#111827',
    fillColor: th.color,
    fillOpacity: 0.95,
    opacity: 1,
    className: 'student-circle-marker'
  }).addTo(fieldMap);
  marker.bindPopup(markerPopupHtml(pt.title, pt.island, gps.lat, gps.lng, 'student'));
  return marker;
}
function addOrRefreshPlaceMarker(title) {
  if (!fieldMap) return;
  const pt = MAP_POINTS.find(x => x.title === title);
  if (!pt) return;
  removeLayerSafe(fieldMarkers[title]);
  removeLayerSafe(studentFieldMarkers[title]);
  delete fieldMarkers[title];
  delete studentFieldMarkers[title];
  const gps = getStoredGpsForTitle(title);
  if (gps) {
    studentFieldMarkers[title] = addStudentMarker(pt, gps);
  } else {
    fieldMarkers[title] = addDefaultMarker(pt);
  }
}
function refreshAllPlaceMarkers() {
  MAP_POINTS.forEach(pt => addOrRefreshPlaceMarker(pt.title));
}
function getMapMarkerForTitle(title) {
  return studentFieldMarkers[title] || fieldMarkers[title];
}
function clearGpsForPlace(islandIndex, placeIndex, title) {
  localStorage.removeItem(gpsKey(islandIndex, placeIndex));
  const latEl = document.querySelector(`input[data-gps="${islandIndex}-${placeIndex}-lat"]`);
  const lngEl = document.querySelector(`input[data-gps="${islandIndex}-${placeIndex}-lng"]`);
  if (latEl) latEl.value = '';
  if (lngEl) lngEl.value = '';
  addOrRefreshPlaceMarker(title);
  const status = document.getElementById(`gps-status-${islandIndex}-${placeIndex}`);
  if (status) status.textContent = '입력 좌표를 지웠습니다. 지도에는 기본 위치가 다시 표시됩니다.';
}
function initFieldMap() {
  const el = document.getElementById('field-map');
  if (!el) return;
  if (typeof L === 'undefined') {
    showMapFallback('Leaflet 지도 라이브러리가 아직 로딩되지 않았습니다. 인터넷 연결 또는 학교망의 외부 CDN 차단 여부를 확인해 주세요. 각 답사지의 <b>지도에서 보기</b> 버튼은 새 창 지도로도 활용할 수 있습니다.');
    return;
  }
  if (fieldMap) {
    stabilizeFieldMap();
    hideMapFallback();
    return;
  }
  fieldMap = L.map('field-map', {scrollWheelZoom:false, zoomControl:true, preferCanvas:true}).setView([34.86,126.16], 10);
  const tile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution:'&copy; OpenStreetMap'});
  tile.on('tileerror', () => showMapFallback('지도 배경 타일을 불러오지 못했습니다. 학교망에서 OpenStreetMap 타일이 차단되었을 수 있습니다. 마커나 버튼이 보이면 그대로 사용하고, 필요하면 <b>OpenStreetMap에서 보기</b>를 눌러 새 창에서 확인하세요.'));
  tile.on('load', hideMapFallback);
  tile.addTo(fieldMap);
  MAP_POINTS.forEach((pt) => {
    addOrRefreshPlaceMarker(pt.title);
  });
  stabilizeFieldMap({fit:true});
  attachFieldMapResizeObserver();
}
function reloadFieldMap() {
  if (fieldMap) {
    fieldMap.remove();
    fieldMap = null;
    fieldMarkers = {};
    studentFieldMarkers = {};
    customGpsMarker = null;
  }
  hideMapFallback();
  initFieldMap();
  stabilizeFieldMap({fit:true});
}
function parseCoordValue(v) {
  if (!v) return NaN;
  return Number(String(v).trim().replace(',', '.'));
}
function geolocationErrorMessage(error) {
  if (error?.code === 1) return '위치 권한이 거부되었습니다. 브라우저의 사이트 설정에서 위치 권한을 허용해 주세요.';
  if (error?.code === 2) return '현재 위치를 확인할 수 없습니다. GPS와 네트워크 상태를 확인해 주세요.';
  if (error?.code === 3) return '위치 확인 시간이 초과되었습니다. 하늘이 트인 곳에서 다시 시도해 주세요.';
  return '현재 위치를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.';
}
function captureCurrentGps(islandIndex, placeIndex, title, button) {
  const latEl = document.querySelector(`input[data-gps="${islandIndex}-${placeIndex}-lat"]`);
  const lngEl = document.querySelector(`input[data-gps="${islandIndex}-${placeIndex}-lng"]`);
  const status = document.getElementById(`gps-status-${islandIndex}-${placeIndex}`);
  if (!navigator.geolocation) {
    if (status) status.textContent = '이 브라우저는 현재 위치 기능을 지원하지 않습니다.';
    return;
  }
  const originalLabel = button?.textContent || '현재 위치 좌표 찍기';
  if (button) {
    button.disabled = true;
    button.textContent = '위치 확인 중';
  }
  if (status) status.textContent = '현재 위치를 확인하고 있습니다. 브라우저의 위치 권한 요청을 허용해 주세요.';
  navigator.geolocation.getCurrentPosition(position => {
    const lat = Number(position.coords.latitude.toFixed(6));
    const lng = Number(position.coords.longitude.toFixed(6));
    const accuracy = Math.round(position.coords.accuracy);
    if (latEl) latEl.value = String(lat);
    if (lngEl) lngEl.value = String(lng);
    localStorage.setItem(gpsKey(islandIndex, placeIndex), JSON.stringify({
      lat:String(lat), lng:String(lng), accuracy, capturedAt:new Date().toISOString()
    }));
    addOrRefreshPlaceMarker(title);
    if (status) status.textContent = `현재 위치 좌표를 저장했습니다: ${lat.toFixed(6)}, ${lng.toFixed(6)} · 정확도 약 ±${accuracy}m`;
    if (button) {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }, error => {
    if (status) status.textContent = geolocationErrorMessage(error);
    if (button) {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }, {enableHighAccuracy:true, timeout:15000, maximumAge:0});
}
function showGpsOnMap(islandIndex, placeIndex, title) {
  const latEl = document.querySelector(`input[data-gps="${islandIndex}-${placeIndex}-lat"]`);
  const lngEl = document.querySelector(`input[data-gps="${islandIndex}-${placeIndex}-lng"]`);
  const status = document.getElementById(`gps-status-${islandIndex}-${placeIndex}`);
  const lat = parseCoordValue(latEl?.value);
  const lng = parseCoordValue(lngEl?.value);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    if (status) status.textContent = '위도와 경도를 숫자로 입력해 주세요. 예: 34.8654 / 126.1234';
    return;
  }
  const k = gpsKey(islandIndex, placeIndex);
  localStorage.setItem(k, JSON.stringify({lat:String(lat), lng:String(lng)}));
  if (typeof L === 'undefined') {
    if (status) status.innerHTML = `지도 라이브러리가 로딩되지 않아 새 창 지도로 엽니다. <a target="_blank" rel="noopener" href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}">좌표 지도 보기</a>`;
    window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`, '_blank', 'noopener');
    return;
  }
  currentView = 'map';
  renderTabs();
  applyTopLevelView();
  initFieldMap();
  if (!fieldMap) return;
  addOrRefreshPlaceMarker(title);
  const activeMarker = getMapMarkerForTitle(title);
  fieldMap.setView([lat, lng], 16);
  if (activeMarker) activeMarker.openPopup();
  document.getElementById('map-section')?.scrollIntoView({behavior:'smooth', block:'start'});
  if (status) status.textContent = `입력한 좌표를 지도에 표시했습니다: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
function openPlaceInOsm(title) {
  const pt = MAP_POINTS.find(x=>x.title===title);
  if (!pt) return;
  const gps = getStoredGpsForTitle(title);
  const lat = gps ? gps.lat : pt.lat;
  const lng = gps ? gps.lng : pt.lng;
  window.open(osmCoordUrl(lat,lng,gps ? 16 : 15), '_blank', 'noopener');
}
function openPlaceInNaver(title) {
  window.open(naverMapSearchUrl(title), '_blank', 'noopener');
}
function focusMapPoint(title) {
  currentView = 'map';
  renderTabs();
  applyTopLevelView();
  if (!fieldMap) initFieldMap();
  const m = getMapMarkerForTitle(title);
  if (m && fieldMap) {
    fieldMap.setView(m.getLatLng(), 14);
    m.openPopup();
    document.getElementById('map-section')?.scrollIntoView({behavior:'smooth', block:'start'});
  } else {
    const pt = MAP_POINTS.find(x=>x.title===title);
    if (pt) {
      showMapFallback('내장 지도가 보이지 않아 새 창 지도를 열 수 있습니다. 학교망에서 외부 지도 타일이 차단된 경우가 많습니다.');
      window.open(naverMapSearchUrl(title), '_blank', 'noopener');
    }
  }
}
function jumpToPlaceFromMap(title) {
  for (let i=0;i<DATA.islands.length;i++) {
    const pi = DATA.islands[i].places.findIndex(p=>p.title===title);
    if (pi >= 0) {
      currentView = 'island';
      current = i;
      activePlace[current] = pi;
      renderTabs();
      renderIsland();
      applyTopLevelView();
      setTimeout(()=>document.getElementById('place-'+pi)?.scrollIntoView({behavior:'smooth', block:'start'}), 60);
      break;
    }
  }
}


function shuffleQuizOptions(correct, wrongs) {
  const opts = [correct, ...wrongs.slice(0,3)].map((text, i)=>({text, isCorrect:i===0}));
  // Deterministic shuffle for stable rendering
  const order = [1, 3, 0, 2];
  const arranged = order.map(i=>opts[i]);
  return {a: arranged.map(x=>x.text), correct: arranged.findIndex(x=>x.isCorrect)};
}
function getPlaceQuiz(p) {
  const title = p.title;
  const quiz = {
    "대광해수욕장": [
      {q:"대광해수욕장의 넓은 모래 해안과 방풍림을 함께 볼 때, 가장 알맞은 해석은 무엇일까요?", correct:"파도와 바람이 만든 모래 해안을 사람들이 농경지와 마을 보호를 위해 방풍림과 함께 관리한 사례입니다.", wrong:["하천이 깊은 협곡을 만들고 그 위에 숲이 자란 사례입니다.","화산 폭발로 용암이 흘러 굳은 뒤 기둥 모양 절리가 생긴 사례입니다.","빙하가 산지를 깎아 U자곡과 빙퇴석을 만든 사례입니다."], exp:"대광해수욕장은 모래 해안·사구·해송 방풍림을 통해 자연 지형과 인간의 이용·보전이 함께 나타나는 장소입니다."},
      {q:"이곳에서 모래가 단단하게 느껴지는지 확인하려면 어떤 관찰이 가장 적절할까요?", correct:"같은 힘으로 발자국 깊이를 비교하고, 물기·입자 크기·단단함을 함께 기록합니다.", wrong:["멀리서 바다 색만 보고 모래 성분을 단정합니다.","해송의 높이만 재고 모래 상태는 기록하지 않습니다.","만조 때 바닷물 속에 들어가 해변 폭을 추정합니다."], exp:"답사에서는 감상보다 관찰 기준을 정해 비교하는 활동이 중요합니다."}
    ],
    "전장포마을": [
      {q:"전장포마을이 포구로 이용되기 쉬웠던 지형 조건을 가장 잘 설명한 것은 무엇일까요?", correct:"바다가 안쪽으로 들어온 만과 양쪽 곶이 파도를 약하게 만들어 어선 정박에 유리했습니다.", wrong:["해안선이 곧게 뻗어 외해 파도가 그대로 들어오기 때문입니다.","높은 산지에서 빙하가 흘러 항구를 막았기 때문입니다.","사막처럼 비가 오지 않아 배가 쉽게 다닐 수 있었기 때문입니다."], exp:"내만형 포구는 외해의 파랑 에너지가 줄어들어 피항지로 활용되기 쉽습니다."},
      {q:"전장포의 돌담과 낮은 지붕을 볼 때 연결할 수 있는 지리 개념은 무엇일까요?", correct:"도서 지역의 강한 해풍에 적응한 생활 경관입니다.", wrong:["고산 지역의 눈사태를 막기 위한 주거 경관입니다.","도심의 지가 상승에 따른 고층화 경관입니다.","열대 우림의 잦은 홍수를 피하기 위한 수상 가옥 경관입니다."], exp:"바람과 염분은 섬마을의 주거 형태와 돌담 같은 생활 경관에 영향을 줍니다."}
    ],
    "용난굴": [
      {q:"용난굴 답사에서 물때 확인이 가장 중요한 이유는 무엇일까요?", correct:"조석에 따라 접근로가 바닷물에 잠겨 고립될 수 있기 때문입니다.", wrong:["물때에 따라 바위의 나이가 하루 단위로 바뀌기 때문입니다.","만조 때만 타포니가 만들어지기 때문입니다.","간조 때는 해식 동굴이 사라지기 때문입니다."], exp:"해식 동굴과 갯벌 접근지는 간조 때만 안전하게 접근 가능한 경우가 많습니다."},
      {q:"용난굴의 벌집 모양 풍화 흔적을 해석하는 가장 적절한 태도는 무엇일까요?", correct:"염풍화를 중요한 요인으로 보되 암석 조직과 습윤·건조 등 다른 풍화 조건도 함께 확인합니다.", wrong:["모든 구멍은 소금 결정 하나만으로 만들어졌다고 확정합니다.","구멍 모양만 보고 암석의 정확한 나이를 계산합니다.","파도가 닿는 바위의 구멍은 모두 생물이 판 것이라고 봅니다."], exp:"타포니는 염풍화가 기여할 수 있지만 여러 물리·화학적 풍화 과정이 복합적으로 작용할 수 있습니다."}
    ],
    "백길해수욕장": [
      {q:"백길해수욕장에서 바다 쪽에서 내륙 쪽으로 걸어가며 보기 좋은 변화는 무엇일까요?", correct:"모래사장, 사구 식생, 방풍림처럼 염분과 바람 조건에 따라 달라지는 해안 경관입니다.", wrong:["고도가 높아질수록 빙하와 만년설이 늘어나는 산지 경관입니다.","도심 중심부로 갈수록 지가와 고층 건물이 높아지는 도시 경관입니다.","용암이 식으며 만든 주상절리가 계곡을 따라 이어지는 화산 경관입니다."], exp:"해안에서 내륙으로 갈수록 바람, 염분, 수분 조건이 달라져 식생과 경관도 달라집니다."},
      {q:"백길해수욕장 뒤쪽 방풍림의 역할을 가장 잘 설명한 것은 무엇일까요?", correct:"바람에 날리는 모래와 염분 피해를 줄여 내륙의 농경지와 생활공간을 보호합니다.", wrong:["갯벌을 더 깊게 깎아 큰 배가 들어오게 합니다.","태양광 패널의 발전량을 일부러 낮춥니다.","해식 동굴을 빠르게 만들기 위해 파도를 키웁니다."], exp:"곰솔 방풍림은 해안과 내륙 사이의 완충 공간 역할을 합니다."}
    ],
    "둔장 해변 공원": [
      {q:"둔장 해변 공원에서 풍력 발전과 연결해 볼 수 있는 자연 조건은 무엇일까요?", correct:"장애물이 적은 해안에서 강한 바람이 자주 부는 조건입니다.", wrong:["석탄층이 얕게 묻혀 있어 쉽게 채굴되는 조건입니다.","빙하가 녹아 큰 낙차의 폭포를 만드는 조건입니다.","사막의 오아시스가 넓게 발달한 조건입니다."], exp:"풍력 발전은 바람의 세기와 빈도, 개방적인 지형 조건과 관련됩니다."},
      {q:"무한의 다리 아래 갯벌에서 갯골을 관찰할 때 가장 알맞은 설명은 무엇일까요?", correct:"밀물과 썰물이 오가며 갯벌 바닥을 깎아 만든 자연 물길입니다.", wrong:["사람이 논에 물을 대기 위해 만든 직선 수로입니다.","용암이 흘러간 뒤 남은 화산 통로입니다.","바람이 모래를 쌓아 만든 사구의 능선입니다."], exp:"갯골은 조류의 흐름이 갯벌 표면을 침식하면서 형성됩니다."}
    ],
    "1004 뮤지엄 파크 (양산해변)": [
      {q:"1004 뮤지엄 파크를 지리 답사지로 볼 때 핵심 관찰 관점은 무엇일까요?", correct:"사구 지형의 굴곡을 없애지 않고 문화·관광 공간으로 활용한 방식입니다.", wrong:["갯벌을 완전히 매립해 공업 단지로 바꾼 방식입니다.","빙하가 깎은 골짜기에 스키장을 만든 방식입니다.","화산 분화구 안에 호수를 만든 방식입니다."], exp:"이 장소는 자연 지형과 문화 시설의 결합, 지속가능한 공간 이용을 생각해 볼 수 있습니다."},
      {q:"양산해변에서 식생 변화를 관찰할 때 좋은 방법은 무엇일까요?", correct:"바다 가까운 곳과 내륙 쪽을 나누어 식물 종류와 키, 분포를 비교합니다.", wrong:["가장 예쁜 꽃만 골라 이름을 외우고 위치는 기록하지 않습니다.","주차장 안의 차량 수만 세고 해안 식생은 보지 않습니다.","바다 색이 파란지만 보고 식생 분포를 판단합니다."], exp:"환경 구배를 보려면 위치에 따른 차이를 비교해 기록해야 합니다."}
    ],
    "추포해수욕장 및 노둣길": [
      {q:"추포 노둣길을 답사하기 전에 가장 먼저 확인해야 할 것은 무엇일까요?", correct:"노둣길이 드러나는 간조 시간과 다시 잠기기 전 철수 시간입니다.", wrong:["근처 도시의 지하철 막차 시간입니다.","화산 분화 경보 단계입니다.","겨울철 눈사태 위험 등급입니다."], exp:"노둣길은 조석에 따라 드러나거나 잠기므로 시간 확인이 안전의 핵심입니다."},
      {q:"노둣길과 연륙·연도교를 비교할 때 생각할 수 있는 변화는 무엇일까요?", correct:"물때에 의존하던 이동이 줄고 자동차 중심 이동이 늘어나 생활권이 바뀝니다.", wrong:["다리가 놓이면 바닷물의 조차가 완전히 사라집니다.","노둣길이 있으면 모든 선착장이 자동으로 폐쇄됩니다.","교통 시설은 주민 생활과 관광 흐름에 영향을 주지 않습니다."], exp:"교통 시설의 변화는 이동 시간, 생활권, 관광 동선을 바꿉니다."}
    ],
    "생낌항": [
      {q:"생낌항에서 방파제를 관찰할 때 가장 알맞은 질문은 무엇일까요?", correct:"방파제가 항구 안쪽의 파도를 얼마나 줄이고 어선 정박을 돕는가입니다.", wrong:["방파제가 산 정상의 빙하를 얼마나 빠르게 이동시키는가입니다.","방파제가 사막의 모래언덕을 얼마나 키우는가입니다.","방파제가 도시 지하철 노선을 어떻게 바꾸는가입니다."], exp:"방파제는 파랑 에너지를 줄여 항구 내부를 안정시키는 시설입니다."},
      {q:"생낌항을 작은 항구 답사지로 볼 때 기록하면 좋은 내용은 무엇일까요?", correct:"어선, 방파제, 갯벌, 쉼터 같은 시설이 주민 생활과 어떻게 연결되는지입니다.", wrong:["대형 백화점의 층별 매장 배치입니다.","화산재의 분출 방향만입니다.","고산 식물의 수직 분포만입니다."], exp:"작은 항구는 지역 주민의 생업, 이동, 휴식 공간이 함께 나타나는 생활 경관입니다."}
    ],
    "암태 오도 선착장 주변 (선착장 입지 및 해양 레저 환경)": [
      {q:"오도선착장에서 천사대교를 함께 조망할 수 있다는 점은 어떤 지리적 의미와 연결될까요?", correct:"선착장, 다리, 해양 레저 시설이 한곳에 모이며 교통 결절점의 성격이 나타납니다.", wrong:["빙하가 만든 권곡과 피오르가 동시에 나타난다는 뜻입니다.","사막의 오아시스가 도시 중심부로 이동했다는 뜻입니다.","화산 분화구가 바다 아래에서 계속 커진다는 뜻입니다."], exp:"전남영상위원회 자료도 오도선착장을 요트 선착장과 천사대교 조망 지점으로 설명합니다."},
      {q:"해양 레저 시설을 답사할 때 함께 살펴야 할 쟁점은 무엇일까요?", correct:"관광 활성화 효과와 함께 해양 환경, 쓰레기, 주민 이용 공간의 변화를 봅니다.", wrong:["레저 시설은 환경이나 주민 생활과 전혀 관련이 없습니다.","배가 많을수록 갯벌 생태계는 항상 좋아집니다.","선착장은 오직 사진 촬영 장소로만 의미가 있습니다."], exp:"해양 관광 개발은 지역 활성화와 환경 보전의 균형을 함께 검토해야 합니다."}
    ],
    "퍼플섬과 퍼플교 (반월도·박지도)": [
      {q:"퍼플섬을 장소성 관점에서 볼 때 핵심 질문은 무엇일까요?", correct:"보라색 경관과 브랜드가 지역 이미지, 관광객 이동, 주민 생활에 어떤 영향을 주는가입니다.", wrong:["파랑이 암석 절리를 따라 해식 동굴을 만드는가입니다.","고산 지대에서 빙하가 후퇴하고 있는가입니다.","하천 상류에서 선상지가 어떻게 발달하는가입니다."], exp:"퍼플섬은 색채와 경관을 활용해 장소 이미지를 만든 사례입니다."},
      {q:"퍼플교 답사에서 지속가능한 관광과 연결해 볼 수 있는 내용은 무엇일까요?", correct:"관광객 증가가 지역 소득, 교통 혼잡, 경관 관리에 주는 영향을 함께 살펴봅니다.", wrong:["관광객이 늘면 자연환경은 항상 자동으로 회복됩니다.","색채 경관은 지역 정체성과 전혀 관련이 없습니다.","다리는 오직 물리적 이동만 만들고 지역 이미지는 바꾸지 않습니다."], exp:"관광 브랜딩은 지역 활성화와 관리 문제를 동시에 생각하게 합니다."}
    ],
    "자라도 (간척 평야 지형)": [
      {q:"자라도 간척 평야에서 방조제 안팎을 비교할 때 가장 중요한 차이는 무엇일까요?", correct:"안쪽의 농경지·담수 환경과 바깥쪽의 바다·갯벌 환경이 나뉘는 점입니다.", wrong:["산 정상의 침엽수림과 활엽수림이 고도별로 나뉘는 점입니다.","도심 상업지와 주거지가 지가에 따라 나뉘는 점입니다.","빙하 말단부의 퇴적물이 크기별로 쌓이는 점입니다."], exp:"간척지는 방조제를 경계로 해양 환경과 농업 공간이 뚜렷하게 나뉩니다."},
      {q:"간척 평야에서 직선 도로와 배수로가 많이 보이는 이유로 알맞은 것은 무엇일까요?", correct:"새로 만든 농경지를 효율적으로 나누고 물을 빼기 위해 인공적으로 설계했기 때문입니다.", wrong:["자연 하천이 항상 완벽한 직선으로 흐르기 때문입니다.","빙하가 논을 직사각형으로 깎았기 때문입니다.","바람이 도로를 일정한 간격으로 만들기 때문입니다."], exp:"간척지는 계획적으로 조성된 인공 토지이므로 직선적 경관이 자주 나타납니다."}
    ],
    "태양광 발전소 (스마트팜 앤 쏠라시티)": [
      {q:"안좌도 태양광 발전소를 답사할 때 재생에너지의 장점과 함께 볼 쟁점은 무엇일까요?", correct:"경관 변화, 농지 이용, 주민 수용성, 발전 이익 공유 문제입니다.", wrong:["해식 동굴 내부의 종유석 성장 속도만입니다.","하천 상류의 빙하 침식 규모만입니다.","사막 오아시스의 낙타 이동 경로만입니다."], exp:"재생에너지는 기후 대응에 중요하지만 지역의 토지 이용과 주민 생활도 함께 살펴야 합니다."},
      {q:"태양광 발전소가 넓은 면적으로 보일 때, 학생 기록란에 적기 좋은 관찰은 무엇일까요?", correct:"패널 배열, 주변 마을·농경지와의 거리, 안내판 또는 변전 시설의 위치입니다.", wrong:["바다 물결의 색만 보고 발전량을 계산합니다.","주변 식당의 메뉴만 기록합니다.","높은 산의 등고선 간격만 비교합니다."], exp:"에너지 시설 답사에서는 입지와 주변 토지 이용의 관계를 기록하는 것이 중요합니다."}
    ],
    "송공항 일대": [
      {q:"송공항 일대를 교통지리 관점에서 답사할 때 핵심 질문은 무엇일까요?", correct:"천사대교 개통 이후 항구·도로·관광 이동의 역할이 어떻게 달라졌는가입니다.", wrong:["화산 분화 이후 용암이 어느 방향으로 흘렀는가입니다.","빙하가 녹아 형성한 호수가 어디에 있는가입니다.","대도시 중심 업무 지구의 지가가 왜 높은가입니다."], exp:"교량 개통은 기존 해상 교통 거점의 기능과 이동 경로를 바꿀 수 있습니다."},
      {q:"항구 기능이 약해졌는지 살펴보려면 어떤 장면을 비교하면 좋을까요?", correct:"여객선 운항 흔적, 주차장 이용, 버스·차량 동선, 관광 안내 시설을 함께 봅니다.", wrong:["모래 입자 하나만 확대해 보고 항구 기능을 판단합니다.","식물 잎의 모양만 보고 교통 변화를 판단합니다.","하늘의 구름 모양만 보고 여객 수요를 판단합니다."], exp:"항구의 기능 변화는 시설 이용과 이동 흐름을 함께 보아야 이해할 수 있습니다."}
    ],
    "분매리 해안": [
      {q:"분매리 해안에서 농경지와 갯벌이 가까운 모습을 볼 때 연결할 수 있는 생활 방식은 무엇일까요?", correct:"농업과 어업이 함께 나타나는 반농반어적 생활입니다.", wrong:["초원에서 가축만 이동시키는 순수 유목 생활입니다.","고산 지대에서만 이루어지는 목축 생활입니다.","대도시 지하철 역세권의 통근 생활입니다."], exp:"해안 마을에서는 농경지와 갯벌이 가까워 농업과 어업 요소가 함께 나타날 수 있습니다."},
      {q:"분매리 해안 사진을 보강한다면 어떤 장면이 가장 답사지에 도움이 될까요?", correct:"자연 해안, 갯벌, 농경지, 인공 구조물이 한눈에 비교되는 장면입니다.", wrong:["장소와 무관한 대도시 야경 사진입니다.","학교 교실 안 책상 배열 사진입니다.","해안선이 보이지 않는 음식 사진입니다."], exp:"이 답사지는 해안선 변화와 토지 이용의 경계를 보여 주는 사진이 필요합니다."}
    ],
    "노루섬 (바깥노루섬)": [
      {q:"노루섬 노두에서 암맥이 기존 지층을 자르는 모습을 봤다면, 형성 순서를 어떻게 해석할 수 있을까요?", correct:"기존 지층이 먼저 만들어지고, 암맥은 그 뒤에 들어온 것으로 볼 수 있습니다.", wrong:["색이 진한 암석은 언제나 가장 먼저 만들어졌다고 단정합니다.","바닷물에 가까운 암석은 모두 같은 날 만들어졌다고 봅니다.","관광객이 많은 암석일수록 지질 연대가 오래되었다고 봅니다."], exp:"교차 관계는 지질 구조의 상대적 형성 순서를 추론하는 중요한 단서입니다."},
      {q:"노루섬 답사에서 안전상 가장 주의해야 할 점은 무엇일까요?", correct:"간조 접근 가능 시간과 미끄러운 암반, 만조 때 고립 위험을 확인합니다.", wrong:["도심 지하철 환승 시간을 먼저 확인합니다.","사막 모래폭풍의 이동 방향만 확인합니다.","눈사태 위험 등급만 확인합니다."], exp:"조간대 암반 답사는 물때와 미끄럼 위험을 함께 확인해야 합니다."}
    ],
    "서근등대": [
      {q:"서근등대 주변 수도의 조류 속도를 설명할 때 함께 확인해야 할 조건은 무엇일까요?", correct:"통로의 폭과 수심·단면 형태, 조석량, 해저 마찰을 함께 확인합니다.", wrong:["등대 불빛의 밝기만 확인합니다.","주변 나무의 높이만 확인합니다.","모래의 색만 확인합니다."], exp:"좁은 수도에서 조류가 빨라질 수 있지만 실제 유속은 수심·단면·조석량·마찰 등 여러 조건에 좌우됩니다."},
      {q:"등대를 지리 답사 대상으로 볼 때 관찰하면 좋은 내용은 무엇일까요?", correct:"항로 안전, 조망 위치, 주변 해안 지형과 조류 흐름의 관계입니다.", wrong:["등대 색깔만 보고 지역의 인구를 계산합니다.","등대 높이만으로 갯벌 생물 종류를 판단합니다.","등대가 있으면 모든 해안 침식이 멈춘다고 봅니다."], exp:"등대는 해상 교통과 지형 조건을 함께 이해할 수 있는 관찰 지점입니다."}
    ],
    "고산선착장": [
      {q:"고산선착장의 기능 변화를 교통지리 관점에서 설명하면 무엇일까요?", correct:"연륙·연도교가 이동의 중심이 되면서 기존 선착장의 결절 기능이 약해질 수 있습니다.", wrong:["해수욕장 모래가 고와지면 선착장 기능이 자동으로 사라집니다.","방풍림이 자라면 모든 여객선이 운항을 중단합니다.","갯벌 생물이 늘어나면 다리가 자동으로 철거됩니다."], exp:"교통망 변화는 기존 항구와 선착장의 중심성을 바꿉니다."},
      {q:"고산선착장 사진을 보강한다면 어떤 장면이 가장 적절할까요?", correct:"선착장, 소형 어선, 도로·다리 연결성을 함께 보여 주는 장면입니다.", wrong:["해안과 관계없는 실내 체육관 사진입니다.","정확한 위치를 알 수 없는 산 정상 사진입니다.","음식점 메뉴판만 크게 찍은 사진입니다."], exp:"이 장소는 배 중심 교통에서 도로 중심 교통으로 바뀐 흔적을 보여 주는 사진이 필요합니다."}
    ],
    "이목리마을 (간척 농경지)": [
      {q:"이목리 간척 농경지에서 가장 핵심적으로 관찰할 경관은 무엇일까요?", correct:"방조제를 기준으로 바다·갯벌과 안쪽 농경지가 직선적으로 나뉘는 모습입니다.", wrong:["화산 분화구와 용암 대지가 이어지는 모습입니다.","빙하가 깎아 만든 U자곡과 권곡의 모습입니다.","도시 중심부의 고층 빌딩과 지하철 환승역입니다."], exp:"간척지는 방조제를 경계로 해양 환경과 농업 공간이 분리되는 경관을 보여 줍니다."},
      {q:"이목리마을을 ‘섬 안의 내륙 농촌 같은 경관’으로 볼 수 있는 이유는 무엇일까요?", correct:"간척으로 만들어진 평탄한 농경지와 직선 수로가 넓게 나타나기 때문입니다.", wrong:["섬 전체가 높은 산맥으로 둘러싸여 있기 때문입니다.","빙하가 논을 깎아 계단식으로 만들었기 때문입니다.","도심의 고층 건물이 해안선을 따라 늘어서 있기 때문입니다."], exp:"간척 농경지는 섬 지역에서도 내륙 농촌과 비슷한 평탄한 농업 경관을 만들 수 있습니다."}
    ]
  };
  const qs = quiz[title] || [];
  return qs.map(item => {
    const arranged = shuffleQuizOptions(item.correct, item.wrong);
    return {q:item.q, a:arranged.a, correct:arranged.correct, exp:item.exp};
  });
}
function renderPlaceQuiz(p, idx) {
  const qs = getPlaceQuiz(p);
  if (!qs.length) return '';
  return `<section class="place-quiz-panel" id="quiz-place-${current}-${idx}">
    <h4>미션 클리어 퀴즈</h4>
    <p class="text">설명을 읽고 현장 관찰까지 마친 뒤 풀어 봅니다. 정답 확인 후 해설을 읽으며 핵심 개념을 다시 정리하세요.</p>
    ${qs.map((q,i)=>`<div class="quiz-card" data-place-quiz="${current}-${idx}-${i}"><b>문제 ${i+1}. ${esc(q.q)}</b><div class="quiz-options">${q.a.map((opt,j)=>`<label><input type="radio" name="placequiz-${current}-${idx}-${i}" value="${j}"> ${esc(opt)}</label>`).join('')}</div><div class="quiz-explain" id="place-quiz-exp-${current}-${idx}-${i}"></div></div>`).join('')}
    <button type="button" onclick="checkPlaceQuiz(${current}, ${idx})">정답 확인</button>
    <div class="quiz-result" id="place-quiz-result-${current}-${idx}"></div>
  </section>`;
}
function checkPlaceQuiz(islandIndex, placeIndex) {
  const place = DATA.islands[islandIndex].places[placeIndex];
  const qs = getPlaceQuiz(place);
  let score = 0;
  qs.forEach((q,i)=>{
    const picked = document.querySelector(`input[name="placequiz-${islandIndex}-${placeIndex}-${i}"]:checked`);
    if (picked && Number(picked.value) === q.correct) score++;
    const exp = document.getElementById(`place-quiz-exp-${islandIndex}-${placeIndex}-${i}`);
    if (exp) exp.textContent = `정답: ${q.a[q.correct]} — ${q.exp}`;
  });
  const result = document.getElementById(`place-quiz-result-${islandIndex}-${placeIndex}`);
  if (result) { result.style.display='block'; const msg = score===qs.length ? '탐험 성공! 이 장소의 핵심을 잘 이해했어요.' : (score>0 ? '거의 다 왔어요. 해설을 읽고 한 번 더 확인해 보세요.' : '아직 탐험 중! 기본 이해와 사진 자료를 다시 살펴보세요.'); result.textContent = `결과: ${score} / ${qs.length}문항 · ${msg}`; }
}
const PHOTO_MISSING_HTML = `<div class="photo-missing"><div class="pm-icon">◐</div>현장 사진 미확보<div class="pm-hint">답사 시 직접 촬영해 보강</div></div>`;
function replaceBrokenPhoto(img) {
  const card = img.closest('.photo-card');
  img.outerHTML = PHOTO_MISSING_HTML;
  card?.querySelectorAll('[data-photo-src]').forEach(el => el.remove());
}
function photoStatusInfo(ph) {
  const isConcept = ph.src && ph.src.startsWith('data:image/svg+xml');
  if (isConcept) return {label:'개념도', cls:'concept', note:'실제 현장 사진이 아니라 개념 이해용 그림입니다. 답사 후 실제 사진으로 보강하면 좋습니다.'};
  if ((ph.status||'').includes('비교') || (ph.status||'').includes('위치')) return {label:ph.status, cls:'concept', note:'재사용 가능한 공공 자료이지만 해당 답사지에서 촬영한 현장사진은 아닙니다. 비교·위치 확인용으로만 활용하세요.'};
  if ((ph.status||'').includes('대체') || (ph.status||'').includes('후보')) return {label:ph.status||'대체', cls:'concept', note:'정확한 답사지 현장 사진이 아닐 수 있습니다. 장소 확인 후 실제 사진으로 교체하는 것을 권장합니다.'};
  return {label:ph.status||'사진', cls:'official', note:'공개·공식 자료 기반 사진입니다. 현장 답사 사진으로 추가 보강할 수 있습니다.'};
}
function renderMedia(p) {
  const photos = PHOTO_MAP[p.title] || [];
  const review = PHOTO_REVIEW[p.title];
  const reviewHtml = review ? `<div class="photo-reinforce"><b>사진 보강 메모 · ${esc(review.status)}</b><div class="photo-status-summary">답사지 완성도를 높이려면 아래 장면을 현장 사진으로 추가하는 것이 좋습니다.</div><ul>${review.shots.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><div class="photo-links">${(review.links||[]).map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}</div></div>` : '';
  const gallery = photos.length ? `<div class="media-gallery">${photos.map((ph,idx)=>{
    const info = photoStatusInfo(ph);
    const src = ph.src || '';
    const imgHtml = src ? `<img class="photo-click" src="${esc(src)}" alt="${esc(ph.cap)}" loading="lazy" data-photo-src="${esc(src)}" data-photo-cap="${esc(ph.cap)}" data-photo-source="${esc(ph.source||'출처')}" data-photo-url="${esc(ph.url||'#')}" onerror="replaceBrokenPhoto(this)">` : PHOTO_MISSING_HTML;
    return `<figure class="photo-card">${imgHtml}<figcaption><b>[${esc(info.label)}]</b> ${esc(ph.cap)}<span class="photo-note ${info.cls}">${esc(info.note)}</span><div class="photo-tools">${src ? `<button type="button" class="photo-tool" data-photo-src="${esc(src)}" data-photo-cap="${esc(ph.cap)}" data-photo-source="${esc(ph.source||'출처')}" data-photo-url="${esc(ph.url||'#')}">확대 보기</button>` : ''}<a class="photo-tool source-link" href="${esc(ph.url||'#')}" target="_blank" rel="noopener">출처로 이동</a></div></figcaption></figure>`;
  }).join('')}</div>` : '';
  const placeholder = `<div class="media-placeholder">${nl2br(p.media || '사진 삽입 영역')}<div class="source-note">※ 공개 자료를 우선 연결했습니다. <b>개념도·대체 이미지</b>로 표시된 항목은 현장 답사 사진으로 보강하는 것이 좋습니다.</div></div>`;
  return reviewHtml + gallery + placeholder;
}
function openPhotoModal(src, cap, source, url) {
  const modal = document.getElementById('photo-modal');
  if (!modal) return;
  document.getElementById('photo-modal-img').src = src;
  document.getElementById('photo-modal-img').alt = cap || '확대 사진';
  document.getElementById('photo-modal-title').textContent = cap || '사진 확대 보기';
  document.getElementById('photo-modal-caption').textContent = `${source || '출처'} · ${cap || ''}`;
  const a = document.getElementById('photo-modal-source');
  a.href = url || '#';
  modal.classList.add('open');
}
function closePhotoModal() {
  const modal = document.getElementById('photo-modal');
  if (!modal) return;
  modal.classList.remove('open');
  const img = document.getElementById('photo-modal-img');
  if (img) img.removeAttribute('src');
}
function bindPhotoActions() {
  document.querySelectorAll('.photo-tool[data-photo-src], .photo-click[data-photo-src]').forEach(el => {
    el.addEventListener('click', () => openPhotoModal(el.dataset.photoSrc, el.dataset.photoCap, el.dataset.photoSource, el.dataset.photoUrl));
  });
}
document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closePhotoModal(); });
document.addEventListener('click', (e)=>{ if (e.target && e.target.id === 'photo-modal') closePhotoModal(); });


function renderMapLegend() {
  const el = document.getElementById('map-island-legend');
  if (!el) return;
  el.innerHTML = DATA.islands.map(island => {
    const th = getIslandTheme(island.name);
    return `<span class="map-legend-chip"><span class="map-legend-dot" style="background:${th.color}"></span>${esc(island.name)}</span>`;
  }).join('') + `<span class="map-legend-chip"><span class="map-legend-dot" style="background:#f97316"></span>입력 좌표</span>`;
}
function applyTopLevelView() {
  const mapSection = document.getElementById('map-section');
  const islandView = document.getElementById('islandView');
  if (!mapSection || !islandView) return;
  document.body.setAttribute('data-top-view', currentView);
  if (currentView === 'map') {
    mapSection.hidden = false;
    islandView.hidden = true;
    renderMapLegend();
    setTimeout(() => { initFieldMap(); stabilizeFieldMap({fit:true}); }, 60);
  } else {
    mapSection.hidden = true;
    islandView.hidden = false;
    setTimeout(() => stabilizeFieldMap(), 60);
  }
}
function selectMapTab() {
  currentView = 'map';
  history.replaceState(null, '', '#map');
  renderTabs();
  applyTopLevelView();
  setTimeout(() => document.getElementById('map-section')?.scrollIntoView({behavior:'smooth', block:'start'}), 40);
}

/* Progress tracker */
function updateProgress() {
  const total = document.querySelectorAll('input[data-check]').length;
  const done = document.querySelectorAll('input[data-check]:checked').length;
  const pct = total ? Math.round(done/total*100) : 0;
  const el = document.getElementById('progress-fill');
  const tx = document.getElementById('progress-text');
  if (el) el.style.width = pct + '%';
  if (tx) tx.textContent = `현재 답사지 체크리스트: ${done} / ${total} 항목 (${pct}%)`;
}

function renderTabs() {
  const mapBtn = `<button class="tab map-tab ${currentView==='map'?'active':''}" onclick="selectMapTab()" aria-pressed="${currentView==='map'}">🗺️ 답사지도</button>`;
  const islandBtns = DATA.islands.map((it,i)=>{
    const th=getIslandTheme(it.name);
    const active = currentView==='island' && i===current;
    return `<button class="tab ${active?'active':''}" onclick="selectIsland(${i})" style="--theme:${th.color};--theme-dark:${th.dark};--theme-soft:${th.soft}" aria-pressed="${active}">${it.name}</button>`;
  }).join('');
  $('#tabs').innerHTML = mapBtn + islandBtns;
  const quick = $('#quicklinks');
  if (quick) quick.innerHTML = '';
}

function selectIsland(i) {
  currentView = 'island';
  current=i;
  applyIslandTheme(current);
  if (activePlace[current] == null) activePlace[current] = 0;
  const name = DATA.islands[i].name;
  history.replaceState(null, '', '#island=' + encodeURIComponent(name) + '&place=' + activePlace[current]);
  renderTabs();
  renderIsland();
  applyTopLevelView();
  window.scrollTo({top:document.querySelector('.topbar').offsetTop, behavior:'smooth'});
}
function selectPlace(idx) {
  currentView = 'island';
  activePlace[current] = idx;
  const name = DATA.islands[current].name;
  history.replaceState(null, '', '#island=' + encodeURIComponent(name) + '&place=' + idx);
  renderIsland();
  applyTopLevelView();
  setTimeout(()=>document.getElementById('place-tab-panel')?.scrollIntoView({behavior:'smooth', block:'start'}), 30);
}

const ISLAND_DEEP_DIVE = {
  "임자도": {
    title:"모래섬에 남은 순교 기억과 관광 경관",
    one:"임자도는 긴 백사장과 사구로 알려진 섬이지만, 동시에 한국전쟁 시기의 종교적 기억과 튤립 축제를 통해 지역 이미지를 만들어 온 섬입니다.",
    keywords:["해안 사구","대광해수욕장","진리교회 48인 순교","전장포 새우젓","튤립 축제","도서 공동체"],
    story:"임자도는 자연지리적으로는 모래가 만든 섬에 가깝지만, 인문환경을 보면 종교와 기억의 장소로도 볼 수 있습니다. 한국전쟁 시기 임자도 진리교회 48인 순교 사건은 섬 공동체가 전쟁과 종교, 기억을 어떻게 간직해 왔는지를 보여 주는 사례입니다. 다만 ‘성결교회 비율이 높다’처럼 통계가 필요한 표현은 답사지에서는 단정하지 않고, ‘기독교 순교 기억이 지역 공동체의 역사로 남아 있다’는 방식으로 다루는 것이 적절합니다. 또한 임자도의 튤립은 농산물 주산지라기보다 대광해변과 연결된 축제·관광 경관으로 이해하는 것이 좋습니다.",
    links:[
      {place:"대광해수욕장", text:"자연 지형이 관광 경관으로 바뀐 사례를 볼 수 있습니다."},
      {place:"전장포마을", text:"포구, 새우젓, 어업 생활의 기억을 연결해 볼 수 있습니다."},
      {place:"용난굴", text:"자연 지형과 지역 전설·지명 이야기를 확장해 볼 수 있습니다."}
    ],
    questions:["임자도는 자연경관이 강한 섬일까요, 역사적 기억이 강한 섬일까요?", "종교적 기억은 지역의 경관이나 공동체 정체성에 어떤 방식으로 남을 수 있을까요?"],
    report:"임자도는 해안 사구와 백사장으로 대표되는 자연경관뿐 아니라, 진리교회 48인 순교 사건과 같은 역사적 기억을 함께 지닌 섬입니다. 이를 통해 하나의 섬은 자연환경과 인문환경이 겹쳐져 형성된 장소임을 알 수 있습니다.",
    research:["기독교 순교 기억", "도서 공동체", "축제와 관광 경관", "포구 생활사"]
  },
  "자은도": {
    title:"이름에 담긴 이야기와 해변 관광의 변화",
    one:"자은도는 이름의 유래와 설화, 해변 관광, 사구 보전이 함께 나타나는 섬입니다.",
    keywords:["자은도 지명","두서춘 설화","해수욕장","사구","1004 뮤지엄 파크","관광 개발"],
    story:"자은도라는 이름에는 ‘자애롭고 은혜로운 섬’이라는 뜻이 담겨 있습니다. 지명 유래와 설화는 단순한 옛이야기가 아니라, 사람들이 이 섬을 어떤 장소로 기억하고 설명해 왔는지를 보여 줍니다. 오늘날 자은도는 백길해수욕장, 둔장 해변, 1004 뮤지엄 파크를 통해 해안 관광지로 성장하고 있습니다. 따라서 자은도는 ‘이름과 이야기로 기억되는 섬’이자 ‘해안 지형을 관광과 문화 공간으로 활용하는 섬’으로 볼 수 있습니다.",
    links:[
      {place:"백길해수욕장", text:"부드러운 해안 지형과 관광 경관을 연결해 봅니다."},
      {place:"둔장 해변 공원", text:"바람, 갯벌, 풍력발전이 한 장소에서 만나는 모습을 봅니다."},
      {place:"1004 뮤지엄 파크 (양산해변)", text:"사구 지형을 문화시설과 연결한 사례를 살펴봅니다."}
    ],
    questions:["지명은 실제 지형을 더 많이 담고 있을까요, 사람들의 기억을 더 많이 담고 있을까요?", "해변을 관광지로 개발할 때 자연 지형을 어디까지 보전해야 할까요?"],
    report:"자은도는 이름의 유래와 해안 관광 경관을 통해 자연환경과 장소 기억이 함께 작용하는 섬입니다. 특히 해변과 사구는 단순한 자연 지형이 아니라 관광과 문화 공간으로 재해석되고 있습니다.",
    research:["지명 유래와 장소 기억", "해안 관광", "사구 보전", "문화시설 개발"]
  },
  "암태도": {
    title:"소작쟁의의 기억과 연결되는 섬",
    one:"암태도는 조용한 섬처럼 보이지만, 1920년대 소작쟁의를 통해 농민들이 권리를 요구했던 역사적 장소입니다.",
    keywords:["암태도 소작쟁의","농민운동","소작료","토지 소유","노둣길","천사대교"],
    story:"암태도는 1923~1924년 소작료 인하를 요구한 농민운동인 암태도 소작쟁의의 현장입니다. 이 사건은 섬 지역에서도 토지 소유, 농업 생산, 경제적 불평등을 둘러싼 갈등이 뚜렷하게 존재했음을 보여 줍니다. 암태도 답사에서는 해변과 선착장만 보는 것이 아니라 농경지, 마을, 교통로를 보며 ‘이 땅을 누가 소유했고, 누가 일했으며, 어떤 갈등이 있었는가?’라는 질문을 던질 수 있습니다.",
    links:[
      {place:"추포해수욕장 및 노둣길", text:"물때에 따라 이동하던 생활 교통을 볼 수 있습니다."},
      {place:"생낌항", text:"물자와 사람이 드나들던 작은 항구의 기능을 살펴봅니다."},
      {place:"암태 오도 선착장 주변 (선착장 입지 및 해양 레저 환경)", text:"다리 개통 이후 교통 중심이 어떻게 바뀌는지 봅니다."}
    ],
    questions:["섬이라는 고립된 환경은 주민들의 단결을 더 강하게 만들었을까요?", "오늘날의 평온한 농경지 경관 뒤에는 어떤 사회적 갈등이 숨어 있을 수 있을까요?"],
    report:"암태도는 지형과 교통뿐 아니라 소작쟁의의 기억을 통해 이해할 수 있는 섬입니다. 농경지와 선착장 경관은 단순한 생활공간이 아니라 토지 소유와 농민운동의 역사를 함께 담고 있습니다.",
    research:["암태도 소작쟁의", "농민운동", "토지 소유", "교통 변화"]
  },
  "안좌도": {
    title:"김환기, 퍼플섬, 색으로 만든 장소성",
    one:"안좌도는 예술가의 고향이자, 색채 마케팅을 통해 섬의 이미지를 새롭게 만든 장소입니다.",
    keywords:["김환기","퍼플섬","반월도","박지도","컬러마케팅","장소성"],
    story:"안좌도는 한국 추상미술의 대표 화가 김환기의 고향으로 알려져 있습니다. 동시에 반월도·박지도는 퍼플섬 사업을 통해 지붕, 다리, 시설물 등을 보라색으로 꾸미며 새로운 관광 경관을 형성했습니다. 이 탭에서는 색이 어떻게 지역 정체성을 만들고, 관광지가 된 섬에서 주민 생활과 외부 이미지가 어떻게 만나는지를 생각해 봅니다.",
    links:[
      {place:"퍼플섬과 퍼플교 (반월도·박지도)", text:"색채 마케팅과 장소성의 핵심 사례를 살펴봅니다."},
      {place:"자라도 (간척 평야 지형)", text:"관광 이미지 뒤에 있는 생활·생산 공간을 봅니다."},
      {place:"태양광 발전소 (스마트팜 앤 쏠라시티)", text:"미래 에너지와 지역 경관 변화를 연결해 봅니다."}
    ],
    questions:["보라색으로 꾸민 경관은 지역 정체성일까요, 관광을 위해 만들어진 이미지일까요?", "관광객이 보는 안좌도와 주민이 살아가는 안좌도는 같을까요?"],
    report:"안좌도는 예술가 김환기의 고향이자 퍼플섬 컬러마케팅을 통해 장소 이미지가 새롭게 만들어진 섬입니다. 이곳에서는 색채, 예술, 관광, 주민 생활이 결합하여 장소성이 형성되는 과정을 볼 수 있습니다.",
    research:["퍼플섬 컬러마케팅", "장소성", "김환기와 지역 정체성", "재생에너지 경관"]
  },
  "압해도": {
    title:"신안의 관문, 배와 다리가 만나는 섬",
    one:"압해도는 신안군의 행정 중심지이자, 다리와 항구를 통해 여러 섬으로 연결되는 교통의 관문입니다.",
    keywords:["신안군청","송공항","교통 결절점","연륙교","분재정원","정원 관광"],
    story:"압해도는 신안군청이 있는 행정 중심지이며, 송공항을 통해 주변 섬으로 이동하는 교통 거점 역할을 해 왔습니다. 다리로 육지와 연결되면서 압해도는 더 이상 완전히 고립된 섬이 아니지만, 송공항에서는 여전히 배를 통한 섬 이동의 흔적과 기능을 확인할 수 있습니다. 또한 1004섬 분재정원과 같은 정원 관광 공간은 자연을 감상하고 관리하는 방식이 관광 자원으로 바뀌는 모습을 보여 줍니다.",
    links:[
      {place:"송공항 일대", text:"신안 섬 교통의 관문 역할을 살펴봅니다."},
      {place:"분매리 해안", text:"개발 압력과 해안 경관의 관계를 봅니다."},
      {place:"노루섬 (바깥노루섬)", text:"해안 지질과 접근 안전을 함께 생각합니다."}
    ],
    questions:["다리가 놓이면 섬은 더 이상 섬이 아니게 될까요?", "교통이 편리해지면 지역의 고유성은 약해질까요, 더 잘 알려질까요?"],
    report:"압해도는 신안의 행정과 교통이 집중되는 관문 역할을 하는 섬입니다. 송공항과 연륙교를 통해 배와 도로 교통이 함께 작동하며, 정원 관광은 자연 경관을 새로운 방식으로 자원화하는 사례입니다.",
    research:["섬 교통 변화", "행정 중심지", "정원 관광", "연륙교와 생활권"]
  },
  "팔금도": {
    title:"간척이 만든 농업 경관과 옐로우 섬",
    one:"팔금도는 갯벌과 얕은 바다를 간척하여 농경지를 넓힌 섬이며, 최근에는 노란색 이미지를 활용한 관광 경관도 함께 나타납니다.",
    keywords:["간척","농경지","이목리마을","서근등대","고산선착장","옐로우 섬"],
    story:"팔금도는 섬이지만 농업 경관이 두드러지는 지역입니다. 이곳에서는 ‘섬인데 왜 농촌처럼 보이는가?’라는 질문으로 접근하면 좋습니다. 간척은 자연 해안을 바꾸어 농지를 만드는 과정이지만, 동시에 섬 주민의 생계를 지탱해 온 생활 기반이기도 합니다. 여기에 옐로우 섬 이미지와 등대·선착장 경관을 연결하면 팔금도의 자연환경과 인문환경을 함께 설명할 수 있습니다.",
    links:[
      {place:"서근등대", text:"좁은 해협과 뱃길의 안전을 살펴봅니다."},
      {place:"고산선착장", text:"배 중심 교통에서 도로 중심 교통으로 바뀐 흔적을 봅니다."},
      {place:"이목리마을 (간척 농경지)", text:"간척 농경지와 농촌 경관을 직접 확인합니다."}
    ],
    questions:["간척지는 자연을 훼손한 공간일까요, 주민의 삶을 가능하게 한 공간일까요?", "색채 관광은 지역의 실제 생활을 잘 보여 줄까요, 아니면 새롭게 만든 이미지일까요?"],
    report:"팔금도는 간척을 통해 농경지가 발달한 섬으로, 자연 해안이 농업과 마을 경관으로 바뀐 과정을 보여 줍니다. 동시에 등대, 선착장, 옐로우 섬 이미지는 팔금도의 교통과 관광 경관을 이해하는 단서가 됩니다.",
    research:["간척과 농업 경관", "등대와 해상 교통", "옐로우 섬", "섬 농촌 경관"]
  }
};
function renderIslandDeepTab(island) {
  const d = ISLAND_DEEP_DIVE[island.name];
  if (!d) return '';
  const placeButtons = d.links.map(link => {
    const idx = island.places.findIndex(p => p.title === link.place);
    const onclick = idx >= 0 ? ` onclick="selectPlace(${idx})"` : '';
    return `<button type="button" class="deep-link-card"${onclick}><b>${esc(link.place)}</b><span>${esc(link.text)}</span></button>`;
  }).join('');
  return `<article class="deep-dive-card" id="island-deep-dive" data-search="${esc(JSON.stringify(d))}">
    <div class="deep-dive-hero">
      <span class="deep-dive-kicker">🔎 섬 더 깊이 보기</span>
      <h3>${esc(d.title)}</h3>
      <p class="deep-dive-one">${esc(d.one)}</p>
      <div class="deep-keywords">${d.keywords.map(k=>`<span>#${esc(k)}</span>`).join('')}</div>
    </div>
    <div class="deep-dive-body">
      <section class="deep-section">
        <h4>🧭 사람과 장소 이야기</h4>
        <p>${esc(d.story)}</p>
        <div class="deep-research-tags">${d.research.map(r=>`<span>${esc(r)}</span>`).join('')}</div>
        <div class="deep-source-note">※ 이 탭은 섬별 답사지 3곳을 하나의 지역 이야기로 묶는 심화 배경입니다. 통계 수치나 비율 표현은 현장 자료·공식 자료 확인 후 보완하는 것을 권장합니다.</div>
      </section>
      <section class="deep-section">
        <h4>📍 답사지와 연결하기</h4>
        <p>앞에서 본 답사지 3곳을 아래 관점으로 다시 연결해 봅니다.</p>
        <div class="deep-link-grid">${placeButtons}</div>
      </section>
      <section class="deep-section">
        <h4>💬 생각해 볼 질문</h4>
        <ol class="deep-questions">${d.questions.map(q=>`<li>${esc(q)}</li>`).join('')}</ol>
      </section>
      <section class="deep-section">
        <h4>✍️ 보고서에 쓸 수 있는 문장</h4>
        <div class="deep-report">${esc(d.report)}</div>
      </section>
    </div>
  </article>`;
}

function renderPlaceTabs(island) {
  const selected = activePlace[current] ?? 0;
  const deepIndex = island.places.length;
  const tabs = island.places.map((p, i) => `<button class="place-tab ${i===selected?'active':''}" onclick="selectPlace(${i})" aria-pressed="${i===selected}"><span class="num">답사지 ${i+1}</span><span class="name">${esc(p.title)}</span></button>`).join('') +
    `<button class="place-tab deep-tab ${selected===deepIndex?'active':''}" onclick="selectPlace(${deepIndex})" aria-pressed="${selected===deepIndex}"><span class="num">심화</span><span class="name">섬 더 깊이 보기</span></button>`;
  return `<section class="place-tab-panel" id="place-tab-panel">
    <div class="place-tabs-wrap">
      <p class="place-tabs-title">${esc(island.name)} 답사지 선택</p>
      <div class="place-tabs" role="tablist" aria-label="${esc(island.name)} 답사지 탭">${tabs}</div>
      <div class="place-tab-help">답사지 3곳을 먼저 살펴보고, 마지막 탭에서 이 섬의 인문환경과 장소성을 정리할 수 있습니다.</div>
    </div>
    <div class="mobile-reading-note">휴대폰에서는 답사지 탭을 좌우로 밀어 다른 장소를 선택할 수 있습니다.</div>
  </section>`;
}

function renderIsland() {
  applyIslandTheme(current);
  const island=DATA.islands[current], ov=island.overview;
  if (activePlace[current] == null) activePlace[current] = 0;
  if (activePlace[current] > island.places.length) activePlace[current] = 0;
  const selectedIdx = activePlace[current];
  const bg = (ov.background||[]).map(b=>`<div class="info-box"><b>${esc(b.title)}</b><div class="text">${annotateTerms(b.text)}</div></div>`).join('');
  const selectedPlace = selectedIdx === island.places.length ? renderIslandDeepTab(island) : placeCard(island.places[selectedIdx], selectedIdx);
  $('#islandView').innerHTML = `
    <section class="panel island" data-search="${esc(JSON.stringify(island))}">
      <div class="kicker">${esc(island.code)}</div><h2>${esc(island.name)}</h2>${islandThemeNote(island)}
      ${islandLearningCard(island)}
      <div class="island-mini-stats">
        <div class="island-mini-stat"><b>인구</b><span>${esc(ov.population)}</span></div>
        <div class="island-mini-stat"><b>면적</b><span>${esc(ov.area)}</span></div>
      </div>
      <details class="curriculum-help island-core-detail" open>
        <summary>핵심 개념 더 보기</summary>
        <p class="text">${esc(ov.core)}</p>
      </details>
      <div class="section-title">섬별 특징 및 역사적 배경</div>${bg}
    </section>
    ${renderPlaceTabs(island)}
    ${selectedPlace}
  `;
  restoreNotes();
  bindSearch();
  bindPhotoActions();
  updateProgress();
  setTimeout(() => { if (currentView === 'map') initFieldMap(); }, 0);
}

function placeCard(p, idx) {
  const noteVal = localStorage.getItem(key(current,idx)) || '';
  const gpsVal = JSON.parse(localStorage.getItem(gpsKey(current,idx)) || '{}');
  const checklistItems = getStudentChecklist(p);
  const checks = checklistItems.length ? checklistItems.map((c,j)=>`<label><input type="checkbox" data-check="${current}-${idx}-${j}" onchange="updateProgress()"> <span>${esc(c[0])}<small>${esc(c[1])}</small></span></label>`).join('') : '<p class="text">현장에서 관찰 내용을 추가하세요.</p>';
  const tidalBadge = renderTidalBadge(p.title);
  const stdBadges = renderStandardBadges(p.title);
  const principleCards = renderPrincipleCards(p.title);

  return `<article class="card place" id="place-${idx}" data-search="${esc(JSON.stringify(p))}">
    <div class="place-head">
      <div class="place-title-wrap">
        <div class="place-index">답사지 ${idx+1}</div>
        <h3>${esc(p.title)}</h3>
        <div class="place-badges">${tidalBadge}${stdBadges}</div><div class="map-buttons"><button onclick="focusMapPoint('${esc(p.title).replace(/\'/g, "&apos;")}')">지도에서 보기</button><button onclick="openPlaceInNaver('${esc(p.title).replace(/\'/g, "&apos;")}')">네이버 지도</button>${renderTideLink(p.title)}</div>
      </div>
      <a class="btn top-link" href="#top">위로</a>
    </div>
    ${renderPlaceVisualHero(p)}
    <div class="mode">
      <button class="on" onclick="setMode(this,'basic')">기본 이해</button>
      <button onclick="setMode(this,'deep')">심화 탐구</button>
      <button onclick="setMode(this,'all')">전체 보기</button>
    </div>
    <div class="columns">
      <div>
        <button class="col-toggle" onclick="toggleCol(this)">본문 내용</button>
        <div class="col-content">
          <div class="basic-block"><div class="section-title">기본 이해</div><p class="text">${annotateTerms(p.basic)}</p></div>
          <div class="deep-block hidden"><div class="section-title">심화 탐구</div><p class="text">${annotateTerms(p.deep)}</p></div>
          ${principleCards}
          <div class="term-section"><div class="section-title">핵심 용어</div><p class="text">${annotateTerms(p.terms)}</p></div>
          <div class="section-title">위치 · 교통 접근성</div>
          <div class="info-box"><b>위치</b><div class="text">${nl2br(p.location)}</div><b>교통</b><div class="text">${nl2br(p.access)}</div></div>
          <div class="section-title">사진 자료</div>${renderMedia(p)}
        </div>
      </div>
      <aside>
        <button class="col-toggle" onclick="toggleCol(this)">기록 · 체크리스트</button>
        <div class="col-content">
          <div class="section-title">GPS 좌표 기록</div>
          <div class="gps-input">
            <input type="text" placeholder="위도 (예: 34.8654)" value="${esc(gpsVal.lat||'')}" data-gps="${current}-${idx}-lat">
            <input type="text" placeholder="경도 (예: 126.1234)" value="${esc(gpsVal.lng||'')}" data-gps="${current}-${idx}-lng">
          </div>
          <div class="gps-action-row"><button type="button" onclick="captureCurrentGps(${current}, ${idx}, '${esc(p.title).replace(/'/g, "&apos;")}', this)">현재 위치 좌표 찍기</button><button type="button" onclick="showGpsOnMap(${current}, ${idx}, '${esc(p.title).replace(/'/g, "&apos;")}')">입력 좌표 지도 표시</button><button type="button" onclick="clearGpsForPlace(${current}, ${idx}, '${esc(p.title).replace(/'/g, "&apos;")}')">입력 좌표 지우기</button></div>
          <div class="gps-status" id="gps-status-${current}-${idx}">현재 위치를 자동으로 찍거나 위도·경도를 직접 입력할 수 있습니다.</div>
          <div class="section-title">현장 미션</div>
          <div class="checklist">${checks}</div>
          <div class="section-title">학생 기록란</div>
          ${renderFieldNoteGuide()}
          <textarea data-note="${current}-${idx}" placeholder="관찰 사실 / 지리적 해석 / 추가 질문을 구분하여 기록하세요.">${esc(noteVal)}</textarea>
          <div class="points-section"><div class="section-title">주요 답사 포인트 원문</div><p class="text">${nl2br(p.points)}</p></div>
        </div>
      </aside>
    </div>
    <div class="field-activity-section">
      <div class="section-title">탐험 정리</div>
      ${renderStudentActivity(p)}
      ${renderSafetyAndThinking(p)}
      ${renderPlaceQuiz(p, idx)}
    </div>
  </article>`;
}

function setMode(btn, mode) {
  const card = btn.closest('.card');
  card.querySelectorAll('.mode button').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  const basic = card.querySelector('.basic-block');
  const deep = card.querySelector('.deep-block');
  basic.classList.toggle('hidden', mode === 'deep');
  deep.classList.toggle('hidden', mode === 'basic');
}

function toggleCol(btn) {
  btn.classList.toggle('collapsed');
  const content = btn.nextElementSibling;
  if (content && content.classList.contains('col-content')) {
    content.classList.toggle('collapsed');
  }
}

function restoreNotes() {
  document.querySelectorAll('textarea[data-note]').forEach(t => {
    const [i,p] = t.dataset.note.split('-');
    t.value = localStorage.getItem(key(i,p)) || t.value || '';
    t.addEventListener('input', () => localStorage.setItem(key(i,p), t.value));
  });
  document.querySelectorAll('input[data-check]').forEach(c => {
    const k = 'sinan-check-' + c.dataset.check;
    c.checked = localStorage.getItem(k) === '1';
    c.addEventListener('change', () => { localStorage.setItem(k, c.checked ? '1' : '0'); updateProgress(); });
  });
  document.querySelectorAll('input[data-gps]').forEach(g => {
    g.addEventListener('input', () => {
      const [i,p,axis] = g.dataset.gps.split('-');
      const k = gpsKey(i,p);
      const cur = JSON.parse(localStorage.getItem(k) || '{}');
      cur[axis] = g.value;
      const latText = axis === 'lat' ? g.value : (cur.lat || '');
      const lngText = axis === 'lng' ? g.value : (cur.lng || '');
      const island = DATA.islands[Number(i)];
      const title = island?.places?.[Number(p)]?.title;
      if (!String(latText).trim() && !String(lngText).trim()) {
        localStorage.removeItem(k);
        if (title) addOrRefreshPlaceMarker(title);
      } else {
        localStorage.setItem(k, JSON.stringify(cur));
      }
    });
  });
}

function resetNotes() {
  if (confirm('기록·체크·좌표를 모두 초기화할까요?')) {
    Object.keys(localStorage).filter(k => k.startsWith('sinan-')).forEach(k => localStorage.removeItem(k));
    renderIsland();
    if (fieldMap) refreshAllPlaceMarkers();
  }
}

function togglePrintMode(mode) {
  if (mode === 'worksheet') {
    document.body.classList.add('worksheet-print');
  } else {
    document.body.classList.remove('worksheet-print');
  }
  window.print();
  setTimeout(() => document.body.classList.remove('worksheet-print'), 500);
}

function exportReport() {
  const lines = ['# 신안군 섬 지역 답사 보고서', '', `작성일: ${new Date().toISOString().slice(0,10)}`, ''];
  DATA.islands.forEach((isl, i) => {
    let hasContent = false;
    let islLines = [`## ${isl.name}`, ''];
    isl.places.forEach((pl, pi) => {
      const note = localStorage.getItem(key(i,pi));
      const gps = JSON.parse(localStorage.getItem(gpsKey(i,pi)) || '{}');
      const checked = getStudentChecklist(pl).map((c,j) => localStorage.getItem(`sinan-check-${i}-${pi}-${j}`) === '1' ? `- [x] ${c[0]} - ${c[1]}` : `- [ ] ${c[0]} - ${c[1]}`);
      if (note || gps.lat || gps.lng || checked.some(l => l.startsWith('- [x]'))) {
        hasContent = true;
        islLines.push(`### ${pi+1}. ${pl.title}`);
        if (gps.lat || gps.lng) islLines.push(`- GPS: ${gps.lat||'?'}, ${gps.lng||'?'}`);
        islLines.push('', '체크리스트:', ...checked, '');
        if (note) islLines.push('학생 기록:', note, '');
      }
    });
    if (hasContent) lines.push(...islLines);
  });
  const text = lines.join('\n');
  const blob = new Blob([text], {type:'text/markdown;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sinan-report-${new Date().toISOString().slice(0,10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function bindSearch() {
  const q = $('#search').value.trim().toLowerCase();
  document.querySelectorAll('.place').forEach(el => {
    el.classList.toggle('hidden', q && !el.dataset.search.toLowerCase().includes(q));
  });
}

$('#search').addEventListener('input', bindSearch);
// URL 해시로 초기 섬 선택
function applyHashSelection() {
  if (location.hash === '#map' || !location.hash) {
    currentView = 'map';
    return;
  }
  const m = location.hash.match(/island=([^&]+)/);
  if (m) {
    const name = decodeURIComponent(m[1]);
    const idx = DATA.islands.findIndex(x => x.name === name);
    if (idx >= 0) { current = idx; currentView = 'island'; }
  }
  const p = location.hash.match(/place=(\d+)/);
  if (p) {
    const pi = Number(p[1]);
    if (Number.isInteger(pi) && DATA.islands[current] && pi >= 0 && pi <= DATA.islands[current].places.length) activePlace[current] = pi;
  }
}

applyHashSelection();
renderTabs();
renderIsland();
applyTopLevelView();
window.addEventListener('hashchange', () => {
  applyHashSelection();
  renderTabs();
  renderIsland();
  applyTopLevelView();
  stabilizeFieldMap();
});

window.addEventListener('resize', () => stabilizeFieldMap());
window.addEventListener('orientationchange', () => setTimeout(() => stabilizeFieldMap({fit:true}), 300));
