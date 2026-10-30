/* ===== الإعدادات: عدّل النصوص والرقم من هون ===== */
const CONFIG = {
  phone: "970598107206",
  waText: "وافقت! يلا نحكي 😎",
  intro: "أهلاً فيك... 👋\nهاد الرابط مش لأي حدا.",
  phrases: [
    "استنى، اسمع العرض للآخر!",
    "لهالدرجة مش حابب؟ 🥺",
    "طيب فكّر فيها!",
    "فرصة حلوة، لا تضيّعها!",
    "لسه ما حكينا عن المميزات 😂",
    "إحنا شايفين فيك شيء مميز!",
    "على الأقل جرّب الزر التاني 😏",
    "الزر هاد خجول، بيهرب من الناس 🙈"
  ],
  tired: "تعبت من الركض 😮‍💨... بس لسه ما غيرت رأيي!",
  caught: "ولا يهمك، فهمنا قصدك 😏",
  tiredAt: 8,    // بعد كم محاولة يتعب الزر
  shrinkAt: 12,  // بعد كم محاولة يبدأ يصغر
  clauses: [
    ["المدة", "طويلة جدًا، بإذن الله"],
    ["المزايا", "أفكار، تحديات، وقهوة ممتازة ☕"],
    ["الراتب", "نحكي فيه بالتفاصيل 😉"],
    ["الأجواء", "شغل جدّي وضحك أكتر 😄"]
  ],
  needSign: "لحظة، وقّع أول 😉",
  signed: "تمام يا شريك، يلا نحكي! 🚀"
};

const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const yes = $("#yes"), no = $("#no"), bubble = $("#bubble");

/* ===== الصوت (مولَّد بالكود، خفيف وهادئ) ===== */
let ac = null, muted = false;
function audio() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (ac && ac.state === "suspended") ac.resume();
  return ac;
}
function tone(freq, delay, dur, vol, type) {
  const a = muted ? null : audio(); if (!a) return;
  const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type || "sine"; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.05);
}
const blip = () => tone(480 + Math.random() * 260, 0, 0.12, 0.02, "triangle");
const chime = () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.12, 1, 0.05));
$("#sound").addEventListener("click", e => {
  muted = !muted; e.currentTarget.textContent = muted ? "🔇" : "🔊"; if (!muted) blip();
});

/* ===== التنقل بين الشاشات ===== */
function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === id));
  window.scrollTo(0, 0);
}

/* ===== الشاشة 0: الكتابة التدريجية ===== */
(async function intro() {
  await sleep(900);
  const el = $("#typed");
  for (const ch of CONFIG.intro) { el.textContent += ch; await sleep(ch === "\n" ? 500 : 65); }
  await sleep(1500);
  show("s-offer");
})();

/* ===== الشاشة 1: زر الرفض الهارب ===== */
let attempts = 0, last = 0, lastX = 0, lastY = 0, flying = false, flipped = false, accepted = false;
const offerActive = () => $("#s-offer").classList.contains("active");

function dodge(force) {
  const now = performance.now();
  if (flipped || accepted || (!force && now - last < 260)) return;
  last = now; attempts++;
  const w = no.offsetWidth, h = no.offsetHeight, m = 14;

  if (!flying) { // أول هروب: حوّله لوضع fixed من مكانه الحالي
    const r = no.getBoundingClientRect();
    no.style.left = r.left + "px"; no.style.top = r.top + "px";
    no.classList.add("flying"); void no.offsetWidth;
    flying = true; lastX = r.left; lastY = r.top;
  }
  const yr = yes.getBoundingClientRect();
  let x, y, i = 0;
  do {
    x = m + Math.random() * Math.max(1, innerWidth - w - 2 * m);
    y = m + Math.random() * Math.max(1, innerHeight - h - 2 * m);
    i++;
  } while (i < 30 && (Math.hypot(x - lastX, y - lastY) < 140 ||
    (x < yr.right + 8 && x + w > yr.left - 8 && y < yr.bottom + 8 && y + h > yr.top - 8)));
  no.style.left = x + "px"; no.style.top = y + "px";
  lastX = x; lastY = y;

  // العبارة الجانبية
  bubble.textContent = attempts === CONFIG.tiredAt ? CONFIG.tired
    : CONFIG.phrases[(attempts - 1) % CONFIG.phrases.length];
  placeBubble(x, y, w, h);
  blip();

  // بعد عدد محاولات: الرفض يصغر والموافقة تكبر بلطف
  if (attempts > CONFIG.shrinkAt) {
    const k = attempts - CONFIG.shrinkAt;
    no.style.setProperty("--s", Math.max(0.6, 1 - k * 0.06));
    yes.style.setProperty("--s", Math.min(1.18, 1 + k * 0.03));
  }
}

function placeBubble(x, y, w, h) {
  bubble.classList.add("on");
  const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
  let bx = Math.min(Math.max(8, x + w / 2 - bw / 2), innerWidth - bw - 8);
  let by = y - bh - 10; if (by < 8) by = y + h + 10;
  bubble.style.left = bx + "px"; bubble.style.top = by + "px";
}

// الماوس: يهرب عند الاقتراب
document.addEventListener("pointermove", e => {
  if (e.pointerType !== "mouse" || !offerActive()) return;
  const r = no.getBoundingClientRect();
  if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < 95) dodge();
});
// اللمس: يهرب عند اللمس القريب
document.addEventListener("pointerdown", e => {
  audio();
  if (!offerActive()) return;
  const r = no.getBoundingClientRect();
  if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < 75) dodge(true);
});
// لو انضغط فعلًا (كيبورد أو صدفة): "لا" تتحول إلى "نعم"
no.addEventListener("click", e => {
  if (performance.now() - last < 600) { e.preventDefault(); return; }
  flipped = true; no.textContent = "لا";
  bubble.textContent = CONFIG.caught; placeBubble(lastX, lastY, no.offsetWidth, no.offsetHeight);
  setTimeout(() => { no.textContent = "نعم! 😄"; no.classList.add("turned"); }, 600);
  setTimeout(accept, 1500);
});
window.addEventListener("resize", () => {
  if (!flying) return;
  no.style.left = Math.min(lastX, innerWidth - no.offsetWidth - 8) + "px";
  no.style.top = Math.min(lastY, innerHeight - no.offsetHeight - 8) + "px";
});
yes.addEventListener("click", accept);

/* ===== الشاشة 2: الاحتفال ===== */
function accept() {
  if (accepted) return;
  accepted = true; bubble.classList.remove("on");
  show("s-win"); fitPad(); chime(); burst(); setTimeout(burst, 900);
}

$("#clauses").innerHTML = CONFIG.clauses.map(c => `<li><b>${c[0]}:</b> ${c[1]}</li>`).join("");

/* كونفيتي ذهبي وفضي */
const cv = $("#confetti"), cx = cv.getContext("2d");
let bits = [], raf = 0;
function sizeCv() {
  const d = devicePixelRatio || 1;
  cv.width = innerWidth * d; cv.height = innerHeight * d; cx.setTransform(d, 0, 0, d, 0, 0);
}
sizeCv(); window.addEventListener("resize", sizeCv);
function burst() {
  const cols = ["#C9A24D", "#A9822F", "#8C94A0", "#F8F7F4", "#E3C77E"];
  for (let i = 0; i < 90; i++) {
    bits.push({
      x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * 0.4,
      vx: (Math.random() - .5) * 13, vy: -Math.random() * 13 - 3,
      w: 6 + Math.random() * 6, h: 4 + Math.random() * 6,
      r: Math.random() * 6, vr: (Math.random() - .5) * .3,
      c: cols[(Math.random() * cols.length) | 0], life: 0
    });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}
function tick() {
  cx.clearRect(0, 0, innerWidth, innerHeight);
  bits.forEach(p => {
    p.vy += 0.28; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
    cx.save(); cx.globalAlpha = Math.max(0, 1 - p.life / 170);
    cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c;
    cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore();
  });
  bits = bits.filter(p => p.life < 170 && p.y < innerHeight + 30);
  raf = bits.length ? requestAnimationFrame(tick) : 0;
  if (!raf) cx.clearRect(0, 0, innerWidth, innerHeight);
}

/* ===== التوقيع ===== */
const pad = $("#pad"), pc = pad.getContext("2d");
let drawing = false, signed = false;
function fitPad() {
  const r = pad.getBoundingClientRect(), d = devicePixelRatio || 1;
  if (!r.width) return;
  pad.width = r.width * d; pad.height = r.height * d;
  pc.setTransform(d, 0, 0, d, 0, 0);
  pc.lineWidth = 2.6; pc.lineCap = pc.lineJoin = "round"; pc.strokeStyle = "#101B2C";
}
window.addEventListener("resize", () => { if (!signed) fitPad(); });
const pt = e => { const r = pad.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
pad.addEventListener("pointerdown", e => {
  drawing = true; pad.setPointerCapture(e.pointerId);
  const [x, y] = pt(e); pc.beginPath(); pc.moveTo(x, y); pc.lineTo(x + .1, y + .1); pc.stroke();
});
pad.addEventListener("pointermove", e => {
  if (!drawing) return;
  const [x, y] = pt(e); pc.lineTo(x, y); pc.stroke(); pc.beginPath(); pc.moveTo(x, y);
  if (!signed) { signed = true; $("#padHint").hidden = true; $("#talkNote").textContent = CONFIG.signed; }
});
["pointerup", "pointercancel"].forEach(t => pad.addEventListener(t, () => drawing = false));
$("#clear").addEventListener("click", () => {
  signed = false; pc.clearRect(0, 0, pad.width, pad.height);
  $("#padHint").hidden = false; $("#talkNote").textContent = "";
});

/* ===== زر واتساب ===== */
const talk = $("#talk");
talk.href = `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(CONFIG.waText)}`;
talk.addEventListener("click", e => {
  if (signed) return;
  e.preventDefault();
  $("#talkNote").textContent = CONFIG.needSign;
  pad.classList.remove("shake"); void pad.offsetWidth; pad.classList.add("shake");
});
