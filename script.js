import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, push, update, remove, get, onValue, onChildAdded, onChildChanged, onDisconnect, query, limitToLast, orderByKey, endBefore, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const app = initializeApp({
    apiKey: "AIzaSyALJPpmb3Hkdd162BgeeR9sz_wKmd_NPqM",
    authDomain: "chat-3e20c.firebaseapp.com",
    projectId: "chat-3e20c",
    storageBucket: "chat-3e20c.firebasestorage.app",
    messagingSenderId: "478481493082",
    appId: "1:478481493082:web:113ab87ab52e528cd6bc63",
    databaseURL: "https://chat-3e20c-default-rtdb.firebaseio.com/"
});
const db = getDatabase(app);
const auth = getAuth(app);

const $ = (id) => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[(Math.random() * a.length) | 0];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const own = (o, k) => (Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- Call servers: if "Test call servers" says TURN FAILED, make new credentials at metered.ca and paste here ---- */
const TURN_USERNAME = "543072f0f5d6244071e0e5c5";
const TURN_CREDENTIAL = "I4+d+Z+jXxwve1mA";
const iceConfiguration = {
    iceServers: [
        { urls: ["stun:stun.relay.metered.ca:80", "stun:stun.l.google.com:19302"] },
        { urls: ["turn:global.relay.metered.ca:80", "turn:global.relay.metered.ca:80?transport=tcp", "turn:global.relay.metered.ca:443", "turns:global.relay.metered.ca:443?transport=tcp"], username: TURN_USERNAME, credential: TURN_CREDENTIAL },
        { urls: ["turn:openrelay.metered.ca:80", "turn:openrelay.metered.ca:443?transport=tcp"], username: "openrelayproject", credential: "openrelayproject" }
    ],
    iceCandidatePoolSize: 4
};
/* Identity passwords are stored as SHA-256 hashes (not readable in the source) */
const PASS_HASH = { Bro: "6e902e2990eeb841c5b67a2d1a5a037a9c2d4f801311ab9d573199ae352fef57", Raa: "d840306ca5f795ba553acc6094033566538ad436f07dd5d19986aa6cea5d9e5d" };

const PAGE = 40, CHUNK = 510000, RING_MS = 45000, CONNECT_MS = 25000;
const REACTS = ["❤️", "😍", "🥰", "😻", "😂", "😮", "😭", "🥺", "🔥", "👍", "💋", "🫶", "💕", "✨", "🌹", "🤗", "💞", "🙈", "🧸", "🦋", "💍", "🌙", "🥹", "💐"];
/* Love buttons: [emoji, label]. The label picks the animation (see NUDGE_FX). */
const NUDGES = [["💋", "beat"], ["🤗", "Hug"], ["💗", "Love"], ["🥺", "Miss you"], ["🌹", "Rose"], ["🎉", "Cheer"], ["🌙", "Good night"], ["☀️", "Good morning"], ["🧸", "Cuddle"], ["💍", "Forever"], ["🦋", "Butterflies"], ["🌠", "Wish"]];
const NUDGE_MSG = {
    "beat": (n) => `${n} beated your screen from the other side 💋`,
    "Hug": (n) => `${n} is hugging you tight 🤗`,
    "Love": (n) => `${n} sent you all their love 💗`,
    "Miss you": (n) => `${n} misses you 🥺`,
    "Rose": (n) => `${n} sent you a rose 🌹`,
    "Cheer": (n) => `${n} is cheering for you 🎉`,
    "Good night": (n) => `${n} says good night, sweet dreams 🌙`,
    "Good morning": (n) => `${n} says good morning, sunshine ☀️`,
    "Cuddle": (n) => `${n} wants to cuddle 🧸`,
    "Forever": (n) => `${n} says forever & always 💍`,
    "Butterflies": (n) => `${n} sent you butterflies 🦋`,
    "Wish": (n) => `${n} sent a shooting star, make a wish 🌠`
};
const MOODS = [["🥰", "Loved"], ["😊", "Happy"], ["😴", "Sleepy"], ["🥺", "Missing you"], ["🤗", "Need a hug"], ["😋", "Hungry"], ["😤", "Grumpy"], ["🤒", "Unwell"], ["🎧", "Chilling"], ["💪", "Busy"], ["😍", "Crushing"], ["🚫", "Clear"]];
const NOTES = [
    "You're my favorite notification 💕", "Thinking of you makes my whole day softer 🌸", "Whatever today throws at you, I'm on your team 🫶",
    "You're the best part of my day, every day ✨", "Home is wherever you are 🏡", "I fall for you a little more every single day 🌹",
    "Your smile is my favorite thing in the whole world 😊", "Sending you a hug that lasts all day 🤗", "Even when we're apart, my heart stays with you 💞",
    "You make ordinary moments feel like magic 🦋", "I'm so proud of you, never forget that 🌟", "You + me = my favorite story 📖",
    "Drink some water, take a breath, and know I adore you 💧", "If love had a sound, it'd be your laugh 🎶", "I'd choose you in every lifetime 💍",
    "Missing you in a very dramatic way right now 🥺", "You're my sunshine on a cloudy day ☀️", "My heart does a little dance when you text me 💃",
    "Thank you for being exactly you 💖", "Nobody makes me laugh like you do 😂💗"
];
const QUESTIONS = [
    "If we could teleport anywhere right now, where would we go? 🌍", "What's your favorite memory of us so far? 📸", "What song reminds you of me? 🎧",
    "What's one tiny thing I do that makes you smile? 😊", "Dream date: cozy night in or big adventure? 🍿", "What was the first thing you noticed about me? 👀",
    "If we had a free day with no plans, what would we do? ☀️", "What's something you've always wanted us to try together? ✨", "What are you grateful for today? 🌸",
    "Which food would you share with me forever? 🍕", "What nickname for me do you secretly love? 🐻", "Where do you see us in five years? 🏡",
    "What's your love language today: words, time, touch, gifts or help? 💞", "If you could relive one day with me, which one would it be? ⏪", "What movie should we watch next? 🎬"
];

let me = null, you = null, started = false, pickedId = null;
let ready = false, stick = true, newBelow = 0, firstUnread = null, oldest = null, loadingOld = false;
let reply = null, edit = null, online = false, partnerTyping = false;
let pickerAt = 0, lastTap = { t: 0, k: null }, celebTok = null, nudgeTok = null, lastCeleb = 0;
let serverOffset = 0, offsetReady = false, ambSpeed = 1;
const msgs = {}, pend = new Set();
const chat = $("chat"), input = $("msg");
const serverNow = () => Date.now() + serverOffset;

let toastT;
function toast(t, ms = 2200) {
    const el = $("toast");
    el.classList.add("hidden"); void el.offsetWidth;
    el.textContent = t; el.classList.remove("hidden");
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.add("hidden"), ms);
}

/* =====================  LOVE FX ENGINE (canvas, sprites drawn once)  ===================== */
const DPR = Math.min(devicePixelRatio || 1, 2);
function heartSprite(c1, c2, s = 64) {
    const c = document.createElement("canvas"); c.width = c.height = s;
    const x = c.getContext("2d"), k = s / 52;
    x.translate(s / 2, s * 0.56); x.scale(k, k);
    const g = x.createLinearGradient(0, -20, 0, 14); g.addColorStop(0, c1); g.addColorStop(1, c2);
    x.beginPath(); x.moveTo(0, 14); x.bezierCurveTo(-30, -4, -16, -26, 0, -10); x.bezierCurveTo(16, -26, 30, -4, 0, 14);
    x.fillStyle = g; x.fill();
    x.fillStyle = "rgba(255,255,255,.6)"; x.beginPath(); x.ellipse(-10, -10, 5, 3, -0.7, 0, 7); x.fill();
    return c;
}
function emojiSprite(ch, s = 64) {
    const c = document.createElement("canvas"); c.width = c.height = s;
    const x = c.getContext("2d");
    x.font = `${s * 0.72}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(ch, s / 2, s / 2 + 2);
    return c;
}
function petalSprite(c1, c2, s = 48) {
    const c = document.createElement("canvas"); c.width = c.height = s;
    const x = c.getContext("2d");
    x.translate(s / 2, s / 2);
    const g = x.createLinearGradient(0, -s * 0.4, 0, s * 0.4); g.addColorStop(0, c1); g.addColorStop(1, c2);
    x.beginPath(); x.moveTo(0, -s * 0.4); x.bezierCurveTo(s * 0.38, -s * 0.3, s * 0.34, s * 0.25, 0, s * 0.4); x.bezierCurveTo(-s * 0.34, s * 0.25, -s * 0.38, -s * 0.3, 0, -s * 0.4);
    x.fillStyle = g; x.fill();
    x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, -s * 0.28); x.quadraticCurveTo(s * 0.05, 0, 0, s * 0.28); x.stroke();
    return c;
}
function starSprite(c1, c2, s = 48) {
    const c = document.createElement("canvas"); c.width = c.height = s;
    const x = c.getContext("2d");
    x.translate(s / 2, s / 2);
    const g = x.createRadialGradient(0, 0, 1, 0, 0, s / 2); g.addColorStop(0, c1); g.addColorStop(1, c2);
    x.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? s * 0.2 : s * 0.46, a = -Math.PI / 2 + (i * Math.PI) / 5; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    x.closePath(); x.fillStyle = g; x.fill();
    return c;
}
function confettiSprite(col, s = 32) {
    const c = document.createElement("canvas"); c.width = c.height = s;
    const x = c.getContext("2d");
    x.fillStyle = col; x.fillRect(s * 0.3, s * 0.18, s * 0.4, s * 0.64);
    return c;
}
const HEARTS = [heartSprite("#ff9ccb", "#ff3f93"), heartSprite("#ffd0e6", "#ff6fb1"), heartSprite("#ffffff", "#ffb3d6"), heartSprite("#e3b6ff", "#b45cff")];
const ALL = HEARTS.concat(["✨", "💖", "🌸", "🦋", "💕"].map((e) => emojiSprite(e)));
const PETALS = [petalSprite("#ff5a8e", "#b3063f"), petalSprite("#ff8fb8", "#d4126f"), petalSprite("#ffd0e6", "#ff5fa8"), emojiSprite("🌹")];
const STARS = [starSprite("#ffffff", "#ffe27a"), starSprite("#ffffff", "#ffb3e6"), emojiSprite("✨"), emojiSprite("⭐")];
const SUN = [emojiSprite("✨"), emojiSprite("🌼"), starSprite("#fff6a8", "#ffb52e")];
const CONF = ["#ff3d7f", "#ffd23f", "#3ec6ff", "#7dff8a", "#c25cff", "#ffffff", "#ff8a3d"].map((c) => confettiSprite(c));
const LIPS = [emojiSprite("💋")];
const ZZZ = [emojiSprite("💤")];
const mkCanvas = (id) => { const c = document.createElement("canvas"); c.id = id; c.setAttribute("aria-hidden", "true"); document.body.prepend(c); return c; };
const bg = mkCanvas("bg"), fx = mkCanvas("fx"), bctx = bg.getContext("2d"), fctx = fx.getContext("2d");
let W = 0, H = 0;
function resize() {
    W = innerWidth; H = innerHeight;
    const d = Math.min(DPR, 1.5);
    bg.width = W * d; bg.height = H * d; bctx.setTransform(d, 0, 0, d, 0, 0);
    fx.width = W * DPR; fx.height = H * DPR; fctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
resize(); addEventListener("resize", resize, { passive: true });

const amb = [];
const newAmb = (init) => ({ sp: pick(ALL), x: rnd(0, W), y: init ? rnd(0, H) : H + 40, s: rnd(14, 38), vy: rnd(0.25, 0.8), ph: rnd(0, 6.28), sw: rnd(10, 30), a: rnd(0.35, 0.8), r: rnd(-0.5, 0.5) });
if (!reduce) for (let i = 0; i < (W < 600 ? 14 : 22); i++) amb.push(newAmb(true));
let bgRaf = 0, lastT = 0;
function tickBg(t) {
    bgRaf = requestAnimationFrame(tickBg);
    if (t - lastT < 33) return;
    const dt = Math.min((t - lastT) / 16.7, 3); lastT = t;
    bctx.clearRect(0, 0, W, H);
    for (const p of amb) {
        p.y -= p.vy * dt * ambSpeed; p.ph += 0.012 * dt;
        if (p.y < -50) Object.assign(p, newAmb(false));
        const a = p.a * Math.min(1, p.y / (H * 0.3), (H + 40 - p.y) / 80);
        if (a <= 0) continue;
        bctx.globalAlpha = a; bctx.save();
        bctx.translate(p.x + Math.sin(p.ph) * p.sw, p.y); bctx.rotate(Math.sin(p.ph) * p.r);
        bctx.drawImage(p.sp, -p.s / 2, -p.s / 2, p.s, p.s); bctx.restore();
    }
    bctx.globalAlpha = 1;
}
const startBg = () => { if (!bgRaf && amb.length) bgRaf = requestAnimationFrame(tickBg); };
document.addEventListener("visibilitychange", () => { if (document.hidden) { cancelAnimationFrame(bgRaf); bgRaf = 0; } else startBg(); });
startBg();

const parts = []; let fxRaf = 0;
function addPart(p) { if (parts.length > 240) parts.shift(); parts.push(p); if (!fxRaf) fxRaf = requestAnimationFrame(loopFx); }
function loopFx() {
    fctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (++p.life > p.max) { parts.splice(i, 1); continue; }
        p.vy += p.g; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        const k = p.life / p.max, a = (k < 0.12 ? k / 0.12 : k > 0.6 ? (1 - k) / 0.4 : 1) * p.a, s = p.s * (k < 0.18 ? 0.4 + k * 3.3 : 1);
        fctx.globalAlpha = a; fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.r);
        fctx.drawImage(p.sp, -s / 2, -s / 2, s, s); fctx.restore();
    }
    fctx.globalAlpha = 1;
    fxRaf = parts.length ? requestAnimationFrame(loopFx) : 0;
}
function burst(x, y, n = 10, pool = ALL) {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
        const ang = rnd(0, 6.28), sp = rnd(2, 6.5);
        addPart({ sp: pick(pool), x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 3, g: 0.13, r: rnd(-0.5, 0.5), vr: rnd(-0.08, 0.08), s: rnd(16, 32), a: 1, life: 0, max: (55 + rnd(0, 30)) | 0 });
    }
}
function rise(x, y, n = 3, pool = HEARTS) {
    if (reduce) return;
    for (let i = 0; i < n; i++) addPart({ sp: pick(pool), x: x + rnd(-10, 10), y, vx: rnd(-0.6, 0.6), vy: -rnd(1.4, 3), g: -0.01, r: rnd(-0.3, 0.3), vr: rnd(-0.03, 0.03), s: rnd(12, 24), a: 0.95, life: 0, max: (70 + rnd(0, 40)) | 0 });
}
const rain = (n = 14) => { for (let i = 0; i < n; i++) setTimeout(() => rise(rnd(10, W - 10), H + 10, 1, ALL), i * 110); };
const burstEl = (el, n = 10, pool = ALL) => { const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, n, pool); };
/* Falling things (petals, confetti) and twinkling things (stars, sparkles) */
const fall = (n, pool, gap = 80, vy0 = 1.4) => {
    if (reduce) return;
    for (let i = 0; i < n; i++) setTimeout(() => addPart({ sp: pick(pool), x: rnd(0, W), y: -24, vx: rnd(-0.7, 0.7), vy: rnd(vy0, vy0 + 1.2), g: 0.012, r: rnd(-3, 3), vr: rnd(-0.07, 0.07), s: rnd(16, 34), a: 0.95, life: 0, max: 260 }), i * gap);
};
const twinkle = (n, pool = STARS) => {
    if (reduce) return;
    for (let i = 0; i < n; i++) setTimeout(() => addPart({ sp: pick(pool), x: rnd(10, W - 10), y: rnd(10, H * 0.7), vx: 0, vy: -0.05, g: 0, r: 0, vr: rnd(-0.02, 0.02), s: rnd(14, 34), a: 1, life: 0, max: (110 + rnd(0, 70)) | 0 }), i * 90);
};

/* =====================  SOUNDS (Web Audio): chat chime, keypad ringtone, ringback  ===================== */
let audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) audioCtx = new AC(); }
    return audioCtx;
}
["click", "touchstart", "keydown"].forEach((ev) => document.addEventListener(ev, () => { const c = getAudioCtx(); if (c && c.state === "suspended") c.resume().catch(() => {}); }, { passive: true }));
const RING_PATTERN = { type: "square", vol: 0.12, gap: 1.0, notes: [[1319, .11], [1047, .11], [1319, .11], [1047, .11], [1568, .22], [0, .08], [1319, .11], [1047, .11], [1319, .11], [1047, .11], [1760, .22], [0, .08], [1568, .11], [1319, .11], [1047, .11], [1319, .11], [1568, .34], [0, .45]] };
const RINGBACK_PATTERN = { type: "sine", vol: 0.09, gap: 2.0, notes: [[[440, 480], .4], [0, .2], [[440, 480], .4], [0, .2]] };
const phone = { master: null, timer: null, kind: null };
function playNote(ctx, dest, freq, start, dur, type, vol) {
    (Array.isArray(freq) ? freq : [freq]).forEach((f) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, start); g.gain.exponentialRampToValueAtTime(vol, start + 0.008);
        g.gain.setValueAtTime(vol, Math.max(start + 0.009, start + dur - 0.02)); g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        o.connect(g); g.connect(dest); o.start(start); o.stop(start + dur + 0.03);
    });
}
function playOnce(notes, type = "triangle", vol = 0.08) {
    const ctx = getAudioCtx();
    if (!ctx || ctx.state !== "running") return;
    const g = ctx.createGain(); g.connect(ctx.destination);
    let t = ctx.currentTime + 0.02;
    notes.forEach(([f, d]) => { if (f) playNote(ctx, g, f, t, d, type, vol); t += d; });
    setTimeout(() => { try { g.disconnect(); } catch (e) {} }, (t - ctx.currentTime + 0.3) * 1000);
}
function startTone(kind) {
    stopTone();
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const pat = kind === "incoming" ? RING_PATTERN : RINGBACK_PATTERN;
    phone.kind = kind; phone.master = ctx.createGain(); phone.master.connect(ctx.destination);
    const loop = () => {
        if (phone.kind !== kind || !phone.master) return;
        let t = ctx.currentTime + 0.05;
        pat.notes.forEach(([f, d]) => { if (f) playNote(ctx, phone.master, f, t, d, pat.type, pat.vol); t += d; });
        if (kind === "incoming" && navigator.vibrate) { try { navigator.vibrate([400, 200, 400]); } catch (e) {} }
        phone.timer = setTimeout(loop, (t - ctx.currentTime + pat.gap) * 1000);
    };
    loop();
}
function stopTone() {
    clearTimeout(phone.timer); phone.timer = null; phone.kind = null;
    if (phone.master) { try { phone.master.gain.setValueAtTime(0, getAudioCtx().currentTime); phone.master.disconnect(); } catch (e) {} phone.master = null; }
    if (navigator.vibrate) { try { navigator.vibrate(0); } catch (e) {} }
}

/* =====================  ON-DEVICE STORAGE (IndexedDB): file cache + searchable message index  ===================== */
const DBN = "BroRaaLove";
let idbP = null;
const idb = () => idbP || (idbP = new Promise((res, rej) => {
    if (!window.indexedDB) return rej(new Error("IndexedDB unavailable"));
    const r = indexedDB.open(DBN, 1);
    r.onupgradeneeded = (e) => { const d = e.target.result; ["files", "msgs"].forEach((n) => { if (!d.objectStoreNames.contains(n)) d.createObjectStore(n, { keyPath: "id" }); }); };
    r.onsuccess = (e) => { const d = e.target.result; d.onversionchange = () => { d.close(); idbP = null; }; res(d); };
    r.onerror = () => { idbP = null; rej(r.error); };
}));
const txDone = (t) => new Promise((a, b) => { t.oncomplete = a; t.onerror = () => b(t.error); t.onabort = () => b(t.error); });
async function fileGet(id) { const d = await idb(); return new Promise((a, b) => { const r = d.transaction("files", "readonly").objectStore("files").get(id); r.onsuccess = () => a(r.result); r.onerror = () => b(r.error); }); }
async function filePut(rec) { const d = await idb(); const t = d.transaction("files", "readwrite"); t.objectStore("files").put(rec); return txDone(t); }
const cq = new Map(); let cT = 0;
function cachePut(k, m) { if (!k || String(k).startsWith("temp_")) return; cq.set(k, m); clearTimeout(cT); cT = setTimeout(flushCache, 400); }
async function flushCache() {
    clearTimeout(cT);
    if (!cq.size) return;
    const items = [...cq]; cq.clear();
    try { const d = await idb(), t = d.transaction("msgs", "readwrite"), s = t.objectStore("msgs"); items.forEach(([k, m]) => s.put({ id: k, body: m.body && !m.deleted ? String(m.body) : "" })); await txDone(t); } catch (e) {}
}
addEventListener("pagehide", flushCache);
async function searchCache(term) {
    await flushCache();
    const keys = [];
    try {
        const d = await idb();
        await new Promise((res, rej) => {
            const r = d.transaction("msgs", "readonly").objectStore("msgs").openCursor();
            r.onsuccess = () => { const c = r.result; if (!c) return res(); if (c.value.body && c.value.body.toLowerCase().includes(term)) keys.push(c.value.id); c.continue(); };
            r.onerror = () => rej(r.error);
        });
    } catch (e) { Object.keys(msgs).sort().forEach((k) => { if (msgs[k].body && String(msgs[k].body).toLowerCase().includes(term)) keys.push(k); }); }
    return keys;
}

/* =====================  DECORATIONS  ===================== */
const HEART_SVG = '<svg viewBox="0 0 64 64"><path d="M32 56C8 40 4 24 12 15c7-7 16-4 20 3 4-7 13-10 20-3 8 9 4 25-20 41z" fill="#ff2f8e"/><ellipse cx="20" cy="22" rx="5" ry="3" transform="rotate(-35 20 22)" fill="#fff" opacity=".65"/></svg>';
const LIPS_SVG = '<svg viewBox="0 0 120 76"><path d="M4 38C22 20 38 12 50 18C55 20 58 24 60 24C62 24 65 20 70 18C82 12 98 20 116 38C96 42 78 42 60 40C42 42 24 42 4 38Z" fill="#e0194f"/><path d="M4 38C24 42 42 42 60 40C78 42 96 42 116 38C104 62 84 72 60 72C36 72 16 62 4 38Z" fill="#ff3d78"/><path d="M4 38C24 42 42 42 60 40C78 42 96 42 116 38" stroke="#8a0230" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="60" cy="56" rx="15" ry="5" fill="#fff" opacity=".4"/><ellipse cx="38" cy="24" rx="9" ry="3" transform="rotate(-20 38 24)" fill="#fff" opacity=".35"/></svg>';
document.querySelectorAll(".card:not(.pvcard)").forEach((c) => c.insertAdjacentHTML("afterbegin", `<div class="crest">${HEART_SVG}</div>`));
$("hb").innerHTML = HEART_SVG;

/* =====================  AUTH  ===================== */
onAuthStateChanged(auth, (u) => {
    if (!u) {
        if (started) { location.reload(); return; }
        $("login").classList.remove("hidden"); $("who").classList.add("hidden"); $("app").classList.add("hidden");
        return;
    }
    $("login").classList.add("hidden");
    const s = localStorage.getItem("broraa_session");
    if (s === "Bro" || s === "Raa") start(s); else if (!started) $("who").classList.remove("hidden");
});
async function login() {
    const em = $("email").value.trim(), pw = $("pass").value, b = $("btn-login");
    $("login-err").classList.add("hidden");
    if (!em || !pw) return;
    b.disabled = true;
    try { await signInWithEmailAndPassword(auth, em, pw); $("pass").value = ""; }
    catch (e) { const el = $("login-err"); el.classList.remove("hidden"); el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; }
    b.disabled = false;
}
$("btn-login").onclick = login;
["email", "pass"].forEach((id) => $(id).addEventListener("keydown", (e) => { if (e.key === "Enter") login(); }));
function askPass(id) { pickedId = id; $("who-1").classList.add("hidden"); $("who-2").classList.remove("hidden"); $("who-title").textContent = `Welcome, ${id}`; $("auth-pass").value = ""; $("auth-err").classList.add("hidden"); $("auth-pass").focus(); }
$("btn-bro").onclick = () => askPass("Bro");
$("btn-raa").onclick = () => askPass("Raa");
$("btn-back").onclick = () => { pickedId = null; $("who-2").classList.add("hidden"); $("who-1").classList.remove("hidden"); };
async function verify() {
    if (!pickedId) return;
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode($("auth-pass").value));
    const h = [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join("");
    if (h === PASS_HASH[pickedId]) { localStorage.setItem("broraa_session", pickedId); start(pickedId); }
    else { const el = $("auth-err"); el.classList.remove("hidden"); el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; }
}
$("btn-auth").onclick = verify;
$("auth-pass").addEventListener("keydown", (e) => { if (e.key === "Enter") verify(); });

/* =====================  START  ===================== */
function start(id) {
    if (started) return;
    started = true; me = id; you = id === "Bro" ? "Raa" : "Bro";
    $("name").textContent = you; $("avatar").textContent = you[0];
    $("call-avatar-letter").textContent = you[0]; $("call-name").textContent = you;
    $("who").classList.add("hidden"); $("app").classList.remove("hidden");
    loadDraft(); applyWallpaper();
    onValue(ref(db, ".info/serverTimeOffset"), (s) => { serverOffset = s.val() || 0; offsetReady = true; });
    presence(); callListener(); pins(); moodInit(); loveListeners(); procQueue();
    document.addEventListener("click", askNotify, { once: true });
    requestAnimationFrame(() => setTimeout(stream, 0));
    setTimeout(() => rain(16), 500);
}
function askNotify() { if ("Notification" in window && Notification.permission === "default") { try { Notification.requestPermission(); } catch (e) {} } }
const preview = (m) => m.body || (m.image ? "📷 Photo" : m.audio ? "🎵 Voice message" : m.fileMeta ? "📄 " + (m.fileMeta.name || "File") : m.callMeta ? "📞 Call" : "Message");
function notifyMsg(m) {
    if (m.sender === me || document.hasFocus() || !("Notification" in window) || Notification.permission !== "granted") return;
    try { new Notification(`New message from ${m.sender}`, { body: preview(m), tag: "broraa-chat" }); } catch (e) {}
}

/* =====================  PRESENCE / TYPING  ===================== */
function renderStatus() {
    const el = $("status");
    if (partnerTyping) { el.className = "on typ"; el.innerHTML = 'typing<span class="dots"><i></i><i></i><i></i></span>'; }
    else { el.className = online ? "on" : "off"; el.textContent = online ? "online 💞" : "offline"; }
    $("hb").classList.toggle("on", online);
    document.body.classList.toggle("together", online);
    ambSpeed = online ? 1.8 : 1;
}
function presence() {
    const mine = ref(db, `presence/${me}`), typ = ref(db, `chat_meta/typing/${me}`), tch = ref(db, `chat_meta/touch/${me}`);
    onValue(ref(db, ".info/connected"), (s) => {
        if (s.val() !== true) return;
        onDisconnect(typ).remove().catch(() => {}); onDisconnect(tch).remove().catch(() => {});
        onDisconnect(mine).set({ state: "offline", last_changed: serverTimestamp() }).then(() => set(mine, { state: "online", last_changed: serverTimestamp() })).catch(() => {});
    });
    onValue(ref(db, `presence/${you}`), (s) => {
        const d = s.val(); if (!d) return;
        const on = d.state === "online";
        if (on && !online && ready) { rain(10); burstEl($("avatar"), 12); }
        online = on; renderStatus();
    });
    onValue(ref(db, `chat_meta/typing/${you}`), (s) => { partnerTyping = !!s.val(); renderStatus(); });
}
let tT = 0, lastW = 0, typing = false;
function stopTyping() { clearTimeout(tT); if (!typing) return; typing = false; lastW = 0; set(ref(db, `chat_meta/typing/${me}`), null).catch(() => {}); }
input.addEventListener("input", () => {
    const r = input.getBoundingClientRect();
    if (performance.now() - (input._ls || 0) > 140) { input._ls = performance.now(); rise(r.left + 24 + Math.min(input.value.length * 8.5, r.width - 90), r.top + 6, 1); }
    toggleSend(); saveDraft();
    if (!input.value.trim() || edit) { stopTyping(); return; }
    const n = Date.now();
    if (n - lastW > 2500) { lastW = n; typing = true; set(ref(db, `chat_meta/typing/${me}`), true).catch(() => {}); }
    clearTimeout(tT); tT = setTimeout(stopTyping, 3500);
});
input.addEventListener("blur", stopTyping);
function toggleSend() { const t = !!input.value.trim(); $("btn-send").classList.toggle("hidden", !t); $("btn-mic").classList.toggle("hidden", t); }
function saveDraft() { if (!edit && me) localStorage.setItem(`draft_${me}`, input.value); }
function loadDraft() { const d = localStorage.getItem(`draft_${me}`); if (d) { input.value = d; toggleSend(); } }
function applyWallpaper() { const w = localStorage.getItem("wallpaper"); if (w) document.documentElement.style.setProperty("--wp", w); }

/* =====================  MESSAGE RENDERING  ===================== */
let term = "";
const EMO = /^(?:\p{Extended_Pictographic}[\u{1F3FB}-\u{1F3FF}️‍]*|\s)+$/u;
const SEG = window.Intl && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
const isEmo = (m) => { const t = (m.body || "").trim(); return !!t && !m.image && !m.audio && !m.fileMeta && !m.callMeta && !m.replyTo && t.length <= 24 && EMO.test(t) && [...(SEG ? SEG.segment(t) : Array.from(t))].length <= 3; };
function hl(text) {
    if (!term) return esc(text);
    const re = new RegExp(escRe(term), "gi");
    let out = "", last = 0, m;
    while ((m = re.exec(text))) { if (!m[0].length) { re.lastIndex++; continue; } out += esc(text.slice(last, m.index)) + `<span class="hl">${esc(m[0])}</span>`; last = m.index + m[0].length; }
    return out + esc(text.slice(last));
}
function bodyHtml(m) {
    if (m.deleted) return '<div class="del">🚫 Message deleted</div>';
    let h = m.replyTo ? `<div class="quote" data-jump="${esc(m.replyTo.id)}"><b>${esc(m.replyTo.sender)}</b><br>${esc(m.replyTo.text)}</div>` : "";
    if (m.image) h += `<img class="pic" src="${esc(m.image)}" alt="Photo" decoding="async">`;
    if (m.audio) h += `<audio class="aud" src="${esc(m.audio)}" controls preload="metadata"></audio>`;
    if (m.fileMeta) { const f = m.fileMeta; h += `<a href="#" class="file" data-fid="${esc(f.id)}" data-fname="${esc(f.name)}" data-fch="${Number(f.chunks) || 0}" data-ftype="${esc(f.type || "")}"><ion-icon name="document"></ion-icon> ${esc(f.name)}</a>`; }
    if (m.callMeta) {
        const t = m.callMeta.callType === "video" ? "video" : "audio", ok = m.callMeta.status === "completed", d = Number(m.callMeta.duration) || 0;
        h += `<div class="callrow ${ok ? "" : "miss"}"><ion-icon name="${t === "video" ? "videocam" : "call"}"></ion-icon><span>${ok ? `${t} call • ${Math.floor(d / 60)}:${String(d % 60).padStart(2, "0")}` : `Missed ${t} call`}</span><button data-call="${t}"><ion-icon name="call"></ion-icon></button></div>`;
    }
    if (m.body) h += `<div class="txt">${hl(String(m.body))}</div>`;
    const rx = Object.values(m.reactions || {}).filter(Boolean);
    if (rx.length) h += `<div class="rx">${rx.map(esc).join("")}</div>`;
    const t = new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const tick = m.sender !== me ? "" : m.status === "seen" ? '<ion-icon name="heart" class="seen"></ion-icon>' : m.status === "delivered" ? '<ion-icon name="heart-outline"></ion-icon>' : m.status === "queued" ? '<ion-icon name="time-outline"></ion-icon>' : '<ion-icon name="checkmark"></ion-icon>';
    return h + `<div class="meta">${m.edited ? "<span>edited</span>" : ""}<span>${t}</span>${tick}</div>`;
}
function menuHtml(k, m) {
    if (m.deleted || String(k).startsWith("temp_")) return "";
    const acts = ["reply"]; if (m.body) acts.push("copy"); acts.push("pin");
    if (m.sender === me) { if (m.body && !m.image && !m.audio && !m.fileMeta && !m.callMeta) acts.push("edit"); acts.push("delete"); }
    return `<div class="mn">${acts.map((a) => `<button data-a="${a}" data-k="${esc(k)}">${a[0].toUpperCase() + a.slice(1)}</button>`).join("")}</div>`;
}
function make(k, m) {
    const el = document.createElement("div");
    el.id = "m-" + k;
    el.className = "b " + (m.sender === me ? "r" : "l") + (isEmo(m) ? " emo" : "");
    el.dataset.ts = m.timestamp || 0;
    el._h = bodyHtml(m) + menuHtml(k, m);
    el.innerHTML = el._h;
    return el;
}
function updateEl(k) {
    const el = $("m-" + k), m = msgs[k];
    if (!el || !m) return;
    const h = bodyHtml(m) + menuHtml(k, m);
    if (el._h === h) return;
    el._h = h; el.innerHTML = h; el.classList.toggle("emo", isEmo(m));
}
function patch(k, p) { if (!msgs[k]) return; msgs[k] = { ...msgs[k], ...p }; cachePut(k, msgs[k]); updateEl(k); }

/* Day separators */
const dk = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
function dayLabel(ts) {
    const d = new Date(ts), n = new Date(), s = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(), diff = Math.round((s(n) - s(d)) / 864e5);
    if (diff === 0) return "Today"; if (diff === 1) return "Yesterday";
    return d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: d.getFullYear() === n.getFullYear() ? undefined : "numeric" });
}
function makeSep(ts) { const s = document.createElement("div"); s.className = "dsep"; s.dataset.d = dk(ts); s.innerHTML = `<span>${esc(dayLabel(ts))}</span>`; return s; }
function addBubble(el) {
    const ts = +el.dataset.ts || 0, last = chat.lastElementChild;
    const lastTs = last && last.classList.contains("b") ? +last.dataset.ts : null;
    if (lastTs === null || dk(lastTs) !== dk(ts)) { if (!(last && last.classList.contains("dsep") && last.dataset.d === dk(ts))) chat.appendChild(makeSep(ts)); }
    chat.appendChild(el);
}
function rebuildDays() {
    chat.querySelectorAll(".dsep").forEach((n) => n.remove());
    let lastDay = null;
    chat.querySelectorAll(".b").forEach((b) => { const ts = +b.dataset.ts || 0, d = dk(ts); if (d !== lastDay) { chat.insertBefore(makeSep(ts), b); lastDay = d; } });
}

/* Playful keyword effects: words in a new message trigger a little animation (first match wins) */
const KW = [
    [/good\s?night|\bgn\b|sweet dreams|😴|🌙/i, (el) => { twinkle(12); burstEl(el, 6, [emojiSprite("🌙"), emojiSprite("💤")]); }],
    [/good\s?morning|\bgm\b|🌞|☀️/i, (el) => { twinkle(10, SUN); burstEl(el, 6, [emojiSprite("☀️"), emojiSprite("✨")]); }],
    [/happy birthday|congrat|🎉|🎂|🥳/i, (el) => { burstEl(el, 22, CONF); fall(14, CONF, 70, 1.6); }],
    [/beat|mwah|muah|xoxo|💋|😘/i, (el, m) => { burstEl(el, 8, LIPS.concat(HEARTS)); if (m.sender !== me) glassbeat(rnd(W * 0.25, W * 0.75), rnd(H * 0.3, H * 0.65), 96); }],
    [/\bhug|🤗/i, (el) => burstEl(el, 8, [emojiSprite("🤗")].concat(HEARTS))],
    [/love you|luv u|love u|miss you|miss u|❤|💕|💖|💗|💞|🥰|😍/i, (el) => burstEl(el, 8, HEARTS)]
];
function msgFx(el, m) {
    const t = m.body || "";
    if (!t) return;
    for (const [re, fn] of KW) if (re.test(t)) { setTimeout(() => fn(el, m), 350); return; }
}

/* =====================  MESSAGE STREAM  ===================== */
function stream() {
    const q = query(ref(db, "messages"), orderByKey(), limitToLast(60));
    let count = 0;
    onChildAdded(q, (s) => { count++; ingest(s.key, s.val()); });
    onChildChanged(q, (s) => ingest(s.key, s.val()));
    onValue(q, () => { ready = true; if (count >= 60) $("btn-older").classList.remove("hidden"); toBottom(false); }, { onlyOnce: true });
}
function ingest(k, m) {
    if (!m) return;
    const prev = msgs[k];
    msgs[k] = m; cachePut(k, m);
    if (prev) {
        updateEl(k);
        const nr = m.reactions && m.reactions[you];
        if (nr && nr !== prev.reactions?.[you]) {
            const el = $("m-" + k);
            if (el) {
                burstEl(el, 7, [emojiSprite(nr)]);
                if (nr === "💋") { const r = el.getBoundingClientRect(); glassbeat(r.left + r.width / 2, r.top + r.height / 2, 80); }
            }
        }
        return;
    }
    if (!oldest || k < oldest) oldest = k;
    const el = make(k, m);
    addBubble(el);
    receipt(k, m);
    if (stick || m.sender === me) toBottom(ready);
    else if (ready && m.sender !== me) { newBelow++; updateJump(); }
    if (ready) {
        if (m.sender !== me) { playOnce([[880, .07], [1318, .1]], "sine", 0.05); notifyMsg(m); }
        msgFx(el, m);
        requestAnimationFrame(() => {
            const r = el.getBoundingClientRect();
            if (r.bottom < 0 || r.top > H) return;
            if (m.sender === me) rise(r.right - 18, r.bottom - 8, 3); else rise(r.left + 20, r.top + 10, 4, ALL);
        });
    }
}
function receipt(k, m) {
    if (m.sender === me || m.status === "seen" || m.deleted) return;
    if (document.hasFocus() && stick) { update(ref(db, `messages/${k}`), { status: "seen" }).catch(() => {}); return; }
    pend.add(k); if (!firstUnread) firstUnread = k;
    if (m.status !== "delivered") update(ref(db, `messages/${k}`), { status: "delivered" }).catch(() => {});
}
function markSeen() {
    pend.forEach((k) => { const m = msgs[k]; if (m && m.status !== "seen" && !m.deleted) update(ref(db, `messages/${k}`), { status: "seen" }).catch(() => {}); });
    pend.clear(); firstUnread = null; updateJump();
}
addEventListener("focus", () => { if (stick && pend.size) markSeen(); });
document.addEventListener("visibilitychange", () => { if (!document.hidden && document.hasFocus() && stick && pend.size) markSeen(); });

async function older() {
    if (loadingOld || !oldest) return false;
    loadingOld = true;
    const b = $("btn-older"); b.disabled = true; b.textContent = "Loading...";
    let ok = false;
    try {
        const snap = await get(query(ref(db, "messages"), orderByKey(), endBefore(oldest), limitToLast(PAGE)));
        const list = [];
        snap.forEach((c) => { list.push([c.key, c.val()]); });
        if (!list.length) { b.classList.add("hidden"); }
        else {
            const prevH = chat.scrollHeight, top = chat.scrollTop, anchor = chat.querySelector(".b"), frag = document.createDocumentFragment();
            list.forEach(([k, m]) => { if (msgs[k]) return; msgs[k] = m; cachePut(k, m); const el = make(k, m); el.classList.add("na"); frag.appendChild(el); });
            chat.insertBefore(frag, anchor);
            oldest = list[0][0]; rebuildDays();
            chat.scrollTop = top + chat.scrollHeight - prevH;
            if (list.length < PAGE) b.classList.add("hidden");
            ok = true;
        }
    } catch (e) { toast("Couldn't load older messages"); }
    loadingOld = false; b.disabled = false; b.textContent = "Load older messages";
    return ok;
}
$("btn-older").onclick = older;
async function jumpTo(id) {
    let el = $("m-" + id), g = 0;
    while (!el && oldest && String(id) < oldest && g++ < 80) { const ok = await older(); if (!ok) { if (loadingOld) { await sleep(80); continue; } break; } el = $("m-" + id); }
    el = el || $("m-" + id);
    if (!el) { toast("Message not found"); return; }
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    el.classList.add("hit"); setTimeout(() => el.classList.remove("hit"), 1500);
}

function toBottom(smooth) { chat.scrollTo({ top: chat.scrollHeight, behavior: smooth && !reduce ? "smooth" : "auto" }); stick = true; newBelow = 0; updateJump(); }
let scTick = false;
chat.addEventListener("scroll", () => {
    if (scTick) return; scTick = true;
    requestAnimationFrame(() => {
        scTick = false;
        stick = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 120;
        if (stick) { newBelow = 0; if (pend.size && document.hasFocus()) markSeen(); }
        if (ready && chat.scrollTop < Math.max(500, chat.clientHeight)) older();
        updateJump();
    });
}, { passive: true });
chat.addEventListener("load", (e) => { if (e.target.tagName === "IMG" && stick) chat.scrollTop = chat.scrollHeight; }, true);
function updateJump() {
    const j = $("unread"), show = !stick && (newBelow > 0 || !!firstUnread);
    j.classList.toggle("hidden", !show);
    if (show) j.textContent = newBelow > 0 ? `↓ ${newBelow} new message${newBelow > 1 ? "s" : ""}` : "↓ Jump to unread";
}
$("unread").onclick = () => { if (newBelow > 0 || !firstUnread) toBottom(true); else jumpTo(firstUnread); firstUnread = null; newBelow = 0; updateJump(); };

/* =====================  SENDING (with offline queue)  ===================== */
let offlineQ = [];
try { offlineQ = JSON.parse(localStorage.getItem("offlineQueue") || "[]"); } catch (e) { offlineQ = []; }
let procQ = false;
const saveQ = () => localStorage.setItem("offlineQueue", JSON.stringify(offlineQ));
addEventListener("online", () => procQueue());
async function procQueue() {
    if (procQ || !navigator.onLine || !offlineQ.length || !me) return;
    procQ = true;
    try {
        const still = [];
        for (const item of [...offlineQ]) {
            const { tempId, ...clean } = item;
            try { await push(ref(db, "messages"), clean); if (tempId) { const el = $("m-temp_" + tempId); if (el) el.remove(); } } catch (e) { still.push(item); }
        }
        offlineQ = still; saveQ();
    } finally { procQ = false; }
}
function queueMsg(m) {
    const tempId = String(Date.now()) + Math.floor(Math.random() * 1000);
    offlineQ.push({ ...m, tempId }); saveQ();
    const k = "temp_" + tempId; msgs[k] = { ...m, status: "queued" };
    addBubble(make(k, msgs[k])); toBottom(true);
}
async function send(f, o = {}) {
    const m = { sender: me, body: null, image: null, audio: null, fileMeta: null, callMeta: null, timestamp: Date.now(), status: "sent", deleted: false, edited: false, ...f };
    if (!o.system && reply) { m.replyTo = reply; cancel(false); }
    if (navigator.onLine) {
        try { await push(ref(db, "messages"), m); }
        catch (e) { toast("Couldn't send, will retry: " + (e.message || e), 4000); queueMsg(m); }
    } else queueMsg(m);
}
function loveSend() { const b = $("btn-send").classList.contains("hidden") ? $("btn-mic") : $("btn-send"); burstEl(b, 12); }
function submit() {
    const t = input.value.trim();
    if (!t) return;
    loveSend();
    if (edit) {
        const k = edit; cancel();
        patch(k, { body: t, edited: true });
        update(ref(db, `messages/${k}`), { body: t, edited: true }).catch(() => toast("Edit couldn't be saved"));
    } else { input.value = ""; localStorage.removeItem(`draft_${me}`); toggleSend(); send({ body: t }); }
    stopTyping();
}
$("btn-send").onclick = submit;
input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.isComposing) submit(); });
function showReply(who, text) { $("reply-who").textContent = who; $("reply-text").textContent = text; $("reply").classList.remove("hidden"); }
function cancel(clear = true) {
    const was = !!edit;
    reply = edit = null; $("reply").classList.add("hidden");
    if (was && clear) { input.value = ""; toggleSend(); }
}
$("btn-cancel").onclick = () => cancel();

/* =====================  MESSAGE ACTIONS  ===================== */
function act(a, k) {
    const m = msgs[k];
    if (!m) return;
    if (a === "reply") { edit = null; reply = { id: k, sender: m.sender, text: preview(m).slice(0, 120) }; showReply(m.sender, reply.text); input.focus(); }
    else if (a === "copy") navigator.clipboard.writeText(m.body || "").then(() => toast("Message copied")).catch(() => toast("Couldn't copy"));
    else if (a === "pin") set(ref(db, "chat_meta/pinned"), { id: k, sender: m.sender, text: preview(m) });
    else if (a === "edit") { reply = null; edit = k; input.value = m.body; toggleSend(); showReply("Editing message", m.body); input.focus(); }
    else if (a === "delete") { const p = { deleted: true, body: null, image: null, audio: null, fileMeta: null, callMeta: null }; patch(k, p); update(ref(db, `messages/${k}`), p).catch(() => {}); }
}
function react(k, emoji, toggle = true) {
    const m = msgs[k];
    if (!m) return;
    const cur = m.reactions?.[me], val = toggle && cur === emoji ? null : emoji, r = { ...(m.reactions || {}) };
    if (val) r[me] = val; else delete r[me];
    patch(k, { reactions: r });
    update(ref(db, `messages/${k}/reactions`), { [me]: val }).catch(() => {});
}
const closeActive = () => document.querySelectorAll(".b.on").forEach((b) => b.classList.remove("on"));

chat.addEventListener("click", (e) => {
    if (Date.now() - pickerAt < 500) return;
    const t = e.target, btn = t.closest(".mn button");
    if (btn) { closeActive(); act(btn.dataset.a, btn.dataset.k); return; }
    const j = t.closest("[data-jump]"); if (j) { jumpTo(j.dataset.jump); return; }
    const f = t.closest(".file"); if (f) { e.preventDefault(); downloadFile(f.dataset.fid, f.dataset.fname, +f.dataset.fch, f.dataset.ftype); return; }
    const cb = t.closest("[data-call]"); if (cb) { startCall(cb.dataset.call); return; }
    if (t.closest("img.pic")) { openViewer(t.src); return; }
    if (t.closest("audio") || t.closest("button")) return;
    const b = t.closest(".b");
    if (!b || b.querySelector(".del")) { closeActive(); return; }
    const k = b.id.slice(2), now = Date.now();
    if (lastTap.k === k && now - lastTap.t < 320) {
        lastTap = { t: 0, k: null }; closeActive();
        burst(e.clientX, e.clientY, 9, HEARTS);
        if (msgs[k] && !String(k).startsWith("temp_") && msgs[k].reactions?.[me] !== "❤️") react(k, "❤️", false);
        return;
    }
    lastTap = { t: now, k };
    const was = b.classList.contains("on");
    closeActive(); if (!was) b.classList.add("on");
});
document.addEventListener("click", (e) => {
    if (!e.target.closest(".b")) closeActive();
    if (!e.target.closest(".dd")) $("menu").classList.add("hidden");
    if (Date.now() - pickerAt > 500 && !e.target.closest("#picker")) $("picker").classList.add("hidden");
    if (!e.target.closest("#nudges, #btn-love")) $("nudges").classList.add("hidden");
    if (!e.target.closest("#moods, #btn-mood")) $("moods").classList.add("hidden");
});

/* Reaction picker: right-click or long-press */
const picker = $("picker");
picker.innerHTML = REACTS.map((r) => `<span>${r}</span>`).join("");
let pickKey = null, lpT = 0;
function showPicker(x, y, k) {
    if (String(k).startsWith("temp_")) return;
    pickKey = k; pickerAt = Date.now(); picker.classList.remove("hidden");
    const r = picker.getBoundingClientRect();
    picker.style.left = Math.max(10, Math.min(x - r.width / 2, innerWidth - r.width - 10)) + "px";
    picker.style.top = Math.max(10, Math.min(y - r.height - 14, innerHeight - r.height - 10)) + "px";
}
picker.addEventListener("click", (e) => {
    if (e.target.tagName !== "SPAN" || !pickKey) return;
    burstEl(e.target, 8, [emojiSprite(e.target.textContent)]);
    react(pickKey, e.target.textContent, true); picker.classList.add("hidden");
});
chat.addEventListener("contextmenu", (e) => {
    const b = e.target.closest(".b");
    if (!b || b.querySelector(".del")) return;
    e.preventDefault(); closeActive(); showPicker(e.clientX, e.clientY, b.id.slice(2));
});

/* Touch: long-press = reactions, swipe = reply */
let sx = 0, sy = 0, swEl = null, swKey = null;
chat.addEventListener("touchstart", (e) => {
    const b = e.target.closest(".b");
    if (!b || e.target.closest(".mn") || e.target.closest("audio")) return;
    const tc = e.touches[0]; sx = tc.clientX; sy = tc.clientY; swEl = b; swKey = b.id.slice(2); b.style.transition = "none";
    if (!b.querySelector(".del")) lpT = setTimeout(() => { swEl = null; b.style.transform = ""; closeActive(); showPicker(tc.clientX, tc.clientY, swKey); }, 450);
}, { passive: true });
chat.addEventListener("touchmove", (e) => {
    if (!swEl) return;
    const dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) clearTimeout(lpT);
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        if (e.cancelable) e.preventDefault();
        const right = swEl.classList.contains("r");
        swEl.style.transform = `translateX(${right ? Math.min(Math.max(dx, -70), 0) : Math.min(Math.max(dx, 0), 70)}px)`;
    } else { swEl.style.transform = ""; swEl = null; }
}, { passive: false });
function endSwipe(cancelled) {
    clearTimeout(lpT);
    if (!swEl) return;
    const tr = swEl.style.transform;
    swEl.style.transition = "transform .25s cubic-bezier(.34,1.56,.64,1)"; swEl.style.transform = "";
    if (tr && !cancelled && Math.abs(parseInt(tr.replace(/[^\d-]/g, ""), 10)) > 45) { const m = msgs[swKey]; if (m && !m.deleted && !String(swKey).startsWith("temp_")) act("reply", swKey); }
    swEl = null;
}
chat.addEventListener("touchend", () => endSwipe(false));
chat.addEventListener("touchcancel", () => endSwipe(true));
chat.addEventListener("pointerdown", (e) => { if (e.target === chat || e.target.closest(".sys, .dsep")) rise(e.clientX, e.clientY, 2, ALL); }, { passive: true });

/* =====================  SEARCH (whole history indexed on this device)  ===================== */
let matches = [], mi = -1, sTok = 0, sT = 0;
function refreshHL() { chat.querySelectorAll(".b").forEach((b) => { const k = b.id.slice(2); if (msgs[k]) updateEl(k); }); }
$("btn-search").onclick = () => { $("sbar").classList.remove("hidden"); $("sinput").focus(); };
$("sclose").onclick = () => { $("sbar").classList.add("hidden"); $("sinput").value = ""; term = ""; matches = []; mi = -1; sTok++; $("scount").textContent = "0/0"; refreshHL(); };
$("sinput").addEventListener("input", (e) => {
    clearTimeout(sT);
    const v = e.target.value.toLowerCase().trim();
    sT = setTimeout(async () => {
        const tok = ++sTok; term = v;
        const res = v ? await searchCache(v) : [];
        if (tok !== sTok) return;
        matches = res; refreshHL(); mi = matches.length ? matches.length - 1 : -1; searchNav();
    }, 220);
});
function searchNav() {
    if (!matches.length) { $("scount").textContent = "0/0"; return; }
    $("scount").textContent = `${mi + 1}/${matches.length}`; jumpTo(matches[mi]);
}
$("sup").onclick = () => { if (matches.length) { mi = (mi - 1 + matches.length) % matches.length; searchNav(); } };
$("sdown").onclick = () => { if (matches.length) { mi = (mi + 1) % matches.length; searchNav(); } };

/* Pinned */
function pins() {
    onValue(ref(db, "chat_meta/pinned"), (s) => {
        const d = s.val(), bar = $("pinned");
        if (!d) { bar.classList.add("hidden"); return; }
        bar.classList.remove("hidden"); $("pinned-text").textContent = `${d.sender}: ${d.text}`; $("pinned-text").onclick = () => jumpTo(d.id);
    });
}
$("btn-unpin").onclick = () => remove(ref(db, "chat_meta/pinned"));

/* =====================  VOICE NOTES  ===================== */
let mr = null, chunks = [], recording = false, recStream = null, recInt = null, recStart = 0, recCancel = false, recAuto = null;
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
function recUI(on) { $("frow").classList.toggle("hidden", on); $("rec").classList.toggle("hidden", !on); }
async function startRec() {
    if (recording) return;
    try { recStream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { toast("Microphone permission denied or unavailable", 3000); return; }
    const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
    mr = new MediaRecorder(recStream, mime ? { mimeType: mime } : undefined);
    chunks = []; recCancel = false;
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    mr.onstop = () => {
        const secs = (Date.now() - recStart) / 1000;
        recStream.getTracks().forEach((t) => t.stop()); recStream = null;
        if (!recCancel && chunks.length && secs >= 0.6) {
            const rd = new FileReader();
            rd.onload = () => send({ audio: rd.result });
            rd.readAsDataURL(new Blob(chunks, { type: mr.mimeType || "audio/webm" }));
        }
    };
    mr.start(); recording = true; recStart = Date.now();
    $("rec-timer").textContent = "0:00"; recUI(true);
    recInt = setInterval(() => { $("rec-timer").textContent = fmt(Math.floor((Date.now() - recStart) / 1000)); }, 500);
    recAuto = setTimeout(() => stopRec(false), 180000);
}
function stopRec(cancelIt) {
    if (!recording) return;
    recCancel = !!cancelIt; recording = false;
    clearInterval(recInt); clearTimeout(recAuto); recUI(false);
    try { mr.stop(); } catch (e) {}
    if (!cancelIt) burstEl($("btn-mic"), 8, HEARTS);
}
$("btn-mic").onclick = startRec;
$("rec-send").onclick = () => stopRec(false);
$("rec-cancel").onclick = () => stopRec(true);

/* =====================  PHOTOS + FILES  ===================== */
let pendingImg = null;
$("btn-attach").onclick = () => $("file").click();
$("file").addEventListener("change", async (e) => {
    const f = e.target.files[0]; e.target.value = "";
    if (!f) return;
    if (f.type.startsWith("image/")) {
        const rd = new FileReader();
        rd.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const c = document.createElement("canvas"), s = Math.min(800 / Math.max(img.width, img.height), 1);
                c.width = Math.max(1, Math.round(img.width * s)); c.height = Math.max(1, Math.round(img.height * s));
                const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
                pendingImg = c.toDataURL("image/jpeg", 0.72);
                $("pv-img").src = pendingImg; $("pv-cap").value = ""; $("pv").classList.remove("hidden"); $("pv-cap").focus();
            };
            img.onerror = () => toast("That image couldn't be opened");
            img.src = ev.target.result;
        };
        rd.readAsDataURL(f);
        return;
    }
    if (f.size > 5 * 1024 * 1024) { toast("File exceeds the 5MB limit", 3000); return; }
    const fid = `file_${Date.now()}`, total = Math.ceil(f.size / CHUNK);
    $("prog-text").textContent = "Uploading..."; $("prog-bar").value = 0; $("prog").classList.remove("hidden");
    try {
        for (let i = 0; i < total; i++) {
            const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(f.slice(i * CHUNK, (i + 1) * CHUNK)); });
            await set(ref(db, `files/${fid}/chunk_${i}`), b64);
            $("prog-bar").value = ((i + 1) / total) * 100;
        }
        send({ fileMeta: { id: fid, name: f.name, type: f.type, size: f.size, chunks: total } });
    } catch (err) { toast("Upload failed: " + (err.message || err), 4000); }
    $("prog").classList.add("hidden");
});
function closePreview() { $("pv").classList.add("hidden"); $("pv-img").src = ""; pendingImg = null; }
$("pv-cancel").onclick = closePreview;
$("pv-send").onclick = () => { if (!pendingImg) return; const cap = $("pv-cap").value.trim(), d = pendingImg; closePreview(); send({ image: d, body: cap || null }); };
$("pv-cap").addEventListener("keydown", (e) => { if (e.key === "Enter") $("pv-send").click(); });

const b64Bytes = (b) => { const bin = atob(b), a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a; };
async function downloadFile(fid, name, total, type) {
    const ck = `v3_${fid}`;
    try {
        let blob = null;
        try { const c = await fileGet(ck); if (c && c.blob) blob = c.blob; } catch (e) {}
        if (!blob) {
            $("prog-text").textContent = "Downloading..."; $("prog-bar").value = 0; $("prog").classList.remove("hidden");
            const bytes = [];
            for (let i = 0; i < total; i++) {
                const v = (await get(ref(db, `files/${fid}/chunk_${i}`))).val();
                if (!v) throw new Error("File data is missing on the server.");
                bytes.push(b64Bytes(v.split(",")[1])); $("prog-bar").value = ((i + 1) / total) * 100;
            }
            blob = new Blob(bytes, { type: type || "application/octet-stream" });
            filePut({ id: ck, blob }).catch(() => {});
        }
        const url = URL.createObjectURL(blob), a = document.createElement("a");
        a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (err) { toast("Download failed: " + (err.message || err), 4000); }
    $("prog").classList.add("hidden");
}

let zoom = 1;
function openViewer(src) { const i = $("viewer-img"); i.src = src; zoom = 1; i.style.transform = "scale(1)"; $("viewer").classList.remove("hidden"); }
$("btn-vclose").onclick = (e) => { e.stopPropagation(); $("viewer").classList.add("hidden"); };
$("btn-dl").onclick = (e) => { e.stopPropagation(); const a = document.createElement("a"); a.href = $("viewer-img").src; a.download = `BroRaa_${Date.now()}.jpg`; a.click(); };
$("viewer").addEventListener("click", (e) => { if (e.target.id === "viewer") $("viewer").classList.add("hidden"); });
$("viewer-img").addEventListener("wheel", (e) => { e.preventDefault(); zoom = Math.min(Math.max(1, zoom - e.deltaY * 0.001), 4); e.target.style.transform = `scale(${zoom})`; }, { passive: false });

/* =====================  MENU  ===================== */
$("btn-menu").onclick = (e) => { e.stopPropagation(); $("menu").classList.toggle("hidden"); };
const closeMenu = () => $("menu").classList.add("hidden");
$("btn-vb").onclick = () => { closeMenu(); $("vb-frame").src = "https://its-me-you.github.io/doctor"; $("vb").classList.remove("hidden"); };
$("vb-close").onclick = () => { $("vb").classList.add("hidden"); $("vb-frame").src = ""; };
$("vb-full").onclick = () => { const o = $("vb"); if (!document.fullscreenElement) o.requestFullscreen().catch(() => {}); else document.exitFullscreen(); };
$("btn-wall").onclick = () => { closeMenu(); $("wall").click(); };
$("wall").addEventListener("input", (e) => { localStorage.setItem("wallpaper", e.target.value); applyWallpaper(); });
$("btn-clear").onclick = async () => {
    const s = localStorage.getItem("broraa_session"), q = localStorage.getItem("offlineQueue");
    try { if (idbP) (await idbP).close(); } catch (e) {}
    idbP = null; indexedDB.deleteDatabase(DBN); indexedDB.deleteDatabase("BroRaaCache");
    localStorage.clear();
    if (s) localStorage.setItem("broraa_session", s);
    if (q) localStorage.setItem("offlineQueue", q);
    alert("Cache cleared. Reloading app."); location.reload();
};
$("btn-logout").onclick = async () => {
    localStorage.removeItem("broraa_session");
    try { if (me) await Promise.race([set(ref(db, `presence/${me}`), { state: "offline", last_changed: serverTimestamp() }), sleep(1500)]); } catch (e) {}
    signOut(auth).finally(() => location.reload());
};
$("btn-touch").onclick = () => { closeMenu(); openPad(); };
$("btn-note").onclick = () => { closeMenu(); burstEl($("btn-love"), 10, HEARTS); send({ body: "💌 " + pick(NOTES) }); };
$("btn-ask").onclick = () => { closeMenu(); burstEl($("btn-love"), 10, HEARTS); send({ body: "💭 " + pick(QUESTIONS) }); };

/* =====================  CALLS (audio + video, STUN/TURN)  ===================== */
let localStream = null, pc = null, callRef = null, callTimer = null, callMeta = null, callHT = null;
let callActive = false, callRole = null, callTimeout = null, connectTimeout = null, disconnectTimer = null;
let callUnsubs = [], pendCands = [], gathered = new Set(), callConnected = false, facing = "user";
const cu = { screen: $("call-screen"), status: $("call-status-text"), dur: $("call-duration"), local: $("local-video"), remote: $("remote-video"), grid: $("video-grid") };
const audioC = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };

function makePC(remote) {
    pendCands = []; gathered = new Set(); callConnected = false;
    const p = new RTCPeerConnection(iceConfiguration);
    localStream.getTracks().forEach((t) => p.addTrack(t, localStream));
    p.ontrack = (e) => {
        cu.remote.srcObject = e.streams[0] || new MediaStream([e.track]);
        const pr = cu.remote.play && cu.remote.play(); if (pr && pr.catch) pr.catch(() => {});
        if (e.track.kind === "video") cu.grid.classList.add("live");
    };
    p.onicecandidate = (e) => { if (!e.candidate) return; gathered.add(e.candidate.type); push(ref(db, `calls/signals/ice_${remote}`), e.candidate.toJSON()).catch(() => {}); };
    p.onicecandidateerror = (e) => console.warn("ICE server error:", e.errorCode, e.url, e.errorText);
    const check = () => {
        if (pc !== p) return;
        const cs = p.connectionState || "", is = p.iceConnectionState || "";
        if (cs === "connected" || is === "connected" || is === "completed") onConnected(p);
        else if (cs === "failed" || is === "failed") onFailed();
        else if (cs === "disconnected" || is === "disconnected") {
            cu.status.classList.remove("hidden"); cu.status.textContent = "Reconnecting...";
            clearTimeout(disconnectTimer);
            disconnectTimer = setTimeout(() => { if (pc === p && p.connectionState !== "connected" && p.iceConnectionState !== "connected") onFailed(); }, 10000);
        }
    };
    p.onconnectionstatechange = check; p.oniceconnectionstatechange = check;
    return p;
}
function onConnected(p) {
    clearTimeout(disconnectTimer); clearTimeout(connectTimeout);
    cu.status.classList.add("hidden");
    if (callConnected) return;
    callConnected = true;
    if (callMeta) { callMeta.status = "connected"; callMeta.startTime = Date.now(); }
    cu.grid.classList.remove("incoming"); cu.grid.classList.add("connected");
    startCallTimer(); playOnce([[660, .09], [880, .14]], "sine", 0.08); rain(10);
    clearInterval(callHT); callHT = setInterval(() => rise(rnd(W * 0.15, W * 0.85), H * 0.8, 1, HEARTS), 1800);
    reportRoute(p);
}
function onFailed() {
    if (!pc) return;
    toast(!gathered.has("relay") ? "Call failed: relay server unreachable. Menu → Test call servers" : "Call connection failed", 5000);
    teardown();
}
async function reportRoute(p) {
    try {
        await sleep(1200); if (pc !== p) return;
        const st = await p.getStats(); let pair = null;
        st.forEach((r) => { if (r.type === "candidate-pair" && r.state === "succeeded" && (r.nominated || r.selected)) pair = r; });
        if (!pair) return;
        const lc = st.get(pair.localCandidateId), rc = st.get(pair.remoteCandidateId);
        toast((lc && lc.candidateType === "relay") || (rc && rc.candidateType === "relay") ? "Connected via secure relay" : "Connected directly", 2200);
    } catch (e) {}
}
function bindIce() {
    callUnsubs.push(onChildAdded(ref(db, `calls/signals/ice_${me}`), (s) => {
        const c = s.val(); if (!c || !pc) return;
        if (pc.remoteDescription) pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {}); else pendCands.push(c);
    }));
}
function flushCands() { const l = pendCands; pendCands = []; l.forEach((c) => pc && pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {})); }
async function clearSignals() { try { await Promise.all([remove(ref(db, `calls/signals/ice_${me}`)), remove(ref(db, `calls/signals/ice_${you}`))]); } catch (e) {} }

function callUI(mode) {
    cu.screen.classList.remove("hidden"); cu.local.classList.remove("hidden");
    $("btn-accept-call").classList.toggle("hidden", mode !== "incoming");
    cu.grid.classList.remove("live", "connected"); cu.grid.classList.toggle("incoming", mode === "incoming");
    cu.remote.muted = false;
    [["btn-toggle-speaker", "volume-high"], ["btn-toggle-mic", "mic"], ["btn-toggle-video", "videocam"]].forEach(([id, ic]) => { $(id).classList.remove("muted"); $(id).querySelector("ion-icon").setAttribute("name", ic); });
}
async function startCall(type) {
    if (callActive || !me) return;
    callActive = true; callRole = "caller"; callUI("outgoing");
    callMeta = { sender: me, type, status: "dialing", startTime: 0 };
    cu.status.textContent = `Calling ${you}...`;
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: type === "video" ? { facingMode: facing } : false, audio: audioC });
        cu.local.srcObject = localStream; if (type === "audio") cu.local.classList.add("hidden");
    } catch (e) { toast("Couldn't access your microphone/camera", 3500); teardown(); return; }
    try {
        await clearSignals();
        pc = makePC(you);
        const offer = await pc.createOffer(); await pc.setLocalDescription(offer);
        callRef = ref(db, `calls/active/${you}`);
        await set(callRef, { type, sender: me, status: "dialing", ringing: false, sdp: offer.sdp, startedAt: serverNow() });
        onDisconnect(callRef).remove(); bindIce();
    } catch (e) { console.error(e); toast("Couldn't start the call", 3500); teardown(); return; }
    callTimeout = setTimeout(() => { if (callMeta && callMeta.status !== "connected" && !callConnected && !pc?.remoteDescription) teardown(); }, RING_MS);
    callUnsubs.push(onValue(callRef, async (s) => {
        const d = s.val();
        if (!d) { if (callActive && pc) teardown(); return; }
        if (!callMeta || !pc) return;
        if (d.status === "dialing" && d.ringing && callMeta.status === "dialing") { callMeta.status = "ringing"; cu.status.textContent = `Ringing ${you}...`; startTone("ringback"); }
        if (d.status === "connected" && pc.signalingState === "have-local-offer") {
            stopTone(); clearTimeout(callTimeout); cu.status.textContent = "Connecting...";
            connectTimeout = setTimeout(() => { if (!callConnected) onFailed(); }, CONNECT_MS);
            try { await pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: d.answerSdp })); flushCands(); }
            catch (e) { console.error(e); teardown(); }
        }
    }));
}
$("btn-audio-call").onclick = () => startCall("audio");
$("btn-video-call").onclick = () => startCall("video");
$("btn-hangup-call").onclick = () => teardown();

function callListener() {
    onValue(ref(db, `calls/active/${me}`), (s) => {
        const d = s.val();
        if (!d) { if (callActive && callRole === "callee") teardown(); return; }
        if (d.status !== "dialing" || callActive) return;
        if (offsetReady && d.startedAt && serverNow() - d.startedAt > 90000) { set(ref(db, `calls/active/${me}`), null).catch(() => {}); return; }
        callActive = true; callRole = "callee";
        const cr = ref(db, `calls/active/${me}`);
        if (!document.hasFocus() && "Notification" in window && Notification.permission === "granted") { try { new Notification(`Incoming ${d.type} call from ${d.sender}`, { tag: "broraa-call" }); } catch (e) {} }
        callUI("incoming");
        callMeta = { sender: d.sender, type: d.type, status: "incoming", startTime: 0 };
        cu.status.textContent = `Incoming ${d.type} call...`; startTone("incoming");
        update(cr, { ringing: true }).catch(() => {}); onDisconnect(cr).remove().catch(() => {});
        clearTimeout(callTimeout);
        callTimeout = setTimeout(() => { if (callMeta && callMeta.status === "incoming") teardown(); }, RING_MS + 5000);
        $("btn-accept-call").onclick = async () => {
            stopTone(); clearTimeout(callTimeout);
            $("btn-accept-call").classList.add("hidden"); cu.grid.classList.remove("incoming"); cu.status.textContent = "Connecting...";
            try { localStream = await navigator.mediaDevices.getUserMedia({ video: d.type === "video", audio: audioC }); }
            catch (e) { toast("Couldn't access your microphone/camera", 3500); teardown(); return; }
            try {
                cu.local.srcObject = localStream; if (d.type === "audio") cu.local.classList.add("hidden");
                pc = makePC(d.sender); bindIce();
                connectTimeout = setTimeout(() => { if (!callConnected) onFailed(); }, CONNECT_MS);
                await pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: d.sdp })); flushCands();
                const ans = await pc.createAnswer(); await pc.setLocalDescription(ans);
                await update(cr, { status: "connected", answerSdp: ans.sdp });
            } catch (e) { console.error(e); teardown(); }
        };
    });
}
const icon = (btn, on, a, b) => { const i = btn.querySelector("ion-icon"); if (i) i.setAttribute("name", on ? a : b); };
$("btn-toggle-mic").onclick = function () { const t = localStream?.getAudioTracks()[0]; if (t) { t.enabled = !t.enabled; this.classList.toggle("muted", !t.enabled); icon(this, t.enabled, "mic", "mic-off"); } };
$("btn-toggle-video").onclick = function () { const t = localStream?.getVideoTracks()[0]; if (t) { t.enabled = !t.enabled; this.classList.toggle("muted", !t.enabled); icon(this, t.enabled, "videocam", "videocam-off"); } };
$("btn-toggle-speaker").onclick = function () { cu.remote.muted = !cu.remote.muted; this.classList.toggle("muted", cu.remote.muted); icon(this, !cu.remote.muted, "volume-high", "volume-mute"); };
$("btn-switch-cam").onclick = async () => {
    if (!localStream?.getVideoTracks().length || !pc) return;
    try {
        const next = facing === "user" ? "environment" : "user";
        const ns = await navigator.mediaDevices.getUserMedia({ video: { facingMode: next } }), nt = ns.getVideoTracks()[0];
        const sd = pc.getSenders().find((s) => s.track && s.track.kind === "video"); if (sd) await sd.replaceTrack(nt);
        const old = localStream.getVideoTracks()[0]; if (old) { localStream.removeTrack(old); old.stop(); }
        localStream.addTrack(nt); facing = next; cu.local.srcObject = localStream;
    } catch (e) { console.warn("Camera switch failed:", e); }
};
$("btn-fullscreen-call").onclick = () => cu.grid.classList.toggle("fullscreen");
function startCallTimer() {
    clearInterval(callTimer); cu.dur.textContent = "00:00"; cu.dur.classList.remove("hidden");
    const t0 = Date.now();
    callTimer = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); cu.dur.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }, 1000);
}
function teardown() {
    const had = callActive || !!callMeta;
    callActive = false; callRole = null;
    stopTone(); clearTimeout(callTimeout); clearTimeout(connectTimeout); clearTimeout(disconnectTimer); clearInterval(callTimer); clearInterval(callHT); callHT = null;
    callUnsubs.forEach((u) => { try { u(); } catch (e) {} }); callUnsubs = []; pendCands = [];
    cu.screen.classList.add("hidden"); cu.dur.classList.add("hidden"); cu.status.classList.remove("hidden");
    cu.grid.classList.remove("fullscreen", "live", "connected", "incoming");
    if (callMeta && callMeta.sender === me) {
        const duration = callMeta.startTime ? Math.floor((Date.now() - callMeta.startTime) / 1000) : 0;
        send({ callMeta: { callType: callMeta.type, duration, status: callMeta.status === "connected" ? "completed" : "missed" } }, { system: true });
    }
    callMeta = null; callConnected = false;
    if (localStream) { localStream.getTracks().forEach((t) => t.stop()); localStream = null; }
    const p = pc; pc = null; if (p) { try { p.close(); } catch (e) {} }
    cu.remote.srcObject = null; cu.local.srcObject = null;
    if (me && had) {
        playOnce([[520, .12], [390, .22]], "triangle", 0.08);
        const mine = ref(db, `calls/active/${me}`), theirs = ref(db, `calls/active/${you}`);
        onDisconnect(mine).cancel().catch(() => {}); onDisconnect(theirs).cancel().catch(() => {});
        set(mine, null).catch(() => {}); set(theirs, null).catch(() => {}); clearSignals();
    }
}
async function gather(cfg, ms = 8000) {
    const p = new RTCPeerConnection(cfg); p.createDataChannel("probe");
    const types = new Set(), errors = [];
    p.onicecandidate = (e) => { if (e.candidate) types.add(e.candidate.type); };
    p.onicecandidateerror = (e) => errors.push(`${e.errorCode || "?"} ${e.url || ""}`.trim());
    await new Promise(async (res) => {
        const t = setTimeout(res, ms);
        p.onicegatheringstatechange = () => { if (p.iceGatheringState === "complete") { clearTimeout(t); res(); } };
        try { await p.setLocalDescription(await p.createOffer()); } catch (e) { clearTimeout(t); res(); }
    });
    p.close();
    return { types, errors };
}
$("btn-test").onclick = async () => {
    closeMenu();
    if (!window.RTCPeerConnection) { alert("This browser doesn't support calls."); return; }
    toast("Testing call servers…", 12000);
    try {
        const direct = await gather(iceConfiguration), relay = await gather({ ...iceConfiguration, iceTransportPolicy: "relay" });
        const lines = [`STUN (direct path): ${direct.types.has("srflx") ? "OK ✅" : "no public address found ❌"}`, `TURN (relay path): ${relay.types.has("relay") ? "OK ✅" : "FAILED ❌"}`];
        if (!relay.types.has("relay")) lines.push("", "Errors: " + ([...new Set(relay.errors)].join(", ") || "none reported (a firewall may be blocking the relay)"), "401 = credentials rejected → create new credentials at metered.ca and paste them into TURN_USERNAME / TURN_CREDENTIAL near the top of script.js.");
        alert(lines.join("\n"));
    } catch (e) { alert("Test failed: " + (e.message || e)); }
    $("toast").classList.add("hidden");
};

/* =====================  LOVE EFFECTS: the beat on the glass, hugs, night sky, sunrise, butterflies, wishes  ===================== */
const glass = $("glass");
const fxo = (cls, html = "", ms = 3400) => { const el = document.createElement("div"); el.className = "fxo " + cls; el.innerHTML = html; document.body.appendChild(el); setTimeout(() => el.remove(), ms); return el; };
const cap = (t) => `<div class="fxcap">${esc(t)}</div>`;
const vibrate = (p) => { if (navigator.vibrate) { try { navigator.vibrate(p); } catch (e) {} } };

/* A lip print pressed on the glass from the OTHER side: mirrored, with a puff of breath fog that fades away */
function glassbeat(x, y, s = 110, delay = 0) {
    if (reduce) return;
    setTimeout(() => {
        const f = document.createElement("div"), k = document.createElement("div");
        f.className = "fog"; k.className = "beat";
        [f, k].forEach((n) => { n.style.left = x + "px"; n.style.top = y + "px"; });
        f.style.setProperty("--s", s * 2.1 + "px");
        k.style.setProperty("--s", s + "px"); k.style.setProperty("--r", rnd(-30, 30) + "deg");
        k.innerHTML = LIPS_SVG;
        glass.append(f, k);
        setTimeout(() => { f.remove(); k.remove(); }, 3500);
        burst(x, y, 7, HEARTS);
        playOnce([[1250, .04], [820, .08]], "sine", 0.06);
    }, delay);
}
function glassbeates(n = 4) {
    fxo("pane", "", 1700);
    for (let i = 0; i < n; i++) glassbeat(i === 0 ? W / 2 + rnd(-40, 40) : rnd(W * 0.16, W * 0.84), i === 0 ? H * 0.45 : rnd(H * 0.2, H * 0.78), rnd(92, 150), 250 + i * 520);
}
/* The sender sees their beates fly up and away toward the other side */
function flybeates() {
    const r = $("btn-love").getBoundingClientRect();
    for (let i = 0; i < 4; i++) setTimeout(() => {
        const e = document.createElement("div"); e.className = "flybeat"; e.textContent = "💋";
        e.style.left = r.left + r.width / 2 + "px"; e.style.top = r.top + r.height / 2 + "px";
        e.style.setProperty("--tx", rnd(-60, 60) + "px"); e.style.setProperty("--ty", -(r.top - H * 0.1 - rnd(0, 120)) + "px");
        document.body.appendChild(e); setTimeout(() => e.remove(), 1500);
    }, i * 180);
}
function hugFx() {
    ["l", "r"].forEach((side) => { const e = document.createElement("div"); e.className = "hugarm " + side; e.textContent = "🤗"; document.body.appendChild(e); setTimeout(() => e.remove(), 2400); });
    fxo("hugglow", "", 2400);
    setTimeout(() => {
        burst(W / 2, H / 2, 22, HEARTS); vibrate([60, 40, 60]);
        const a = $("app");
        if (a && a.animate) a.animate([{ transform: "scale(1)" }, { transform: "scale(.95)", offset: 0.3 }, { transform: "scale(.975)", offset: 0.5 }, { transform: "scale(.95)", offset: 0.7 }, { transform: "scale(1)" }], { duration: 1300, easing: "ease-in-out" });
    }, 700);
}
/* Each love button has its own animation. big:false = no giant floating emoji (the effect draws its own). */
const NUDGE_FX = {
    "beat": { big: false, fn: (mine) => { if (mine) flybeates(); else glassbeates(4); } },
    "Hug": { big: false, fn: () => hugFx() },
    "Love": { big: false, fn: () => { fxo("", `<div class="bigheart">${HEART_SVG}</div>`, 2900); rain(26); } },
    "Miss you": { fn: (mine, d) => { fxo("", cap(mine ? `Sent a “miss you” to ${you}` : `${d.by} misses you`), 3400); for (let i = 0; i < 6; i++) setTimeout(() => rise(rnd(W * 0.15, W * 0.85), H * 0.85, 2, HEARTS), i * 400); } },
    "Rose": { fn: () => fall(34, PETALS, 90, 1.2) },
    "Cheer": { fn: () => { for (let i = 0; i < 6; i++) setTimeout(() => { burst(rnd(W * 0.15, W * 0.85), rnd(H * 0.15, H * 0.5), 20, CONF.concat(HEARTS)); playOnce([[400 + i * 90, .05], [900, .06]], "triangle", 0.05); }, i * 260); fall(26, CONF, 60, 1.6); } },
    "Good night": { big: false, fn: () => { fxo("night", `<div class="moon">🌙</div>${cap("Sweet dreams")}`, 4300); twinkle(28); for (let i = 0; i < 5; i++) setTimeout(() => rise(rnd(W * 0.2, W * 0.8), H * 0.6, 1, ZZZ), 700 + i * 500); playOnce([[523, .22], [659, .22], [784, .4]], "sine", 0.06); } },
    "Good morning": { big: false, fn: () => { fxo("sun", `<div class="sunball">☀️</div>${cap("Rise & shine")}`, 4100); twinkle(22, SUN); playOnce([[784, .12], [988, .12], [1319, .24]], "sine", 0.06); } },
    "Cuddle": { big: false, fn: () => { const e = document.createElement("div"); e.className = "teddy"; e.textContent = "🧸"; document.body.appendChild(e); setTimeout(() => e.remove(), 2900); for (let i = 0; i < 5; i++) setTimeout(() => rise(W / 2 + rnd(-60, 60), H / 2, 3, HEARTS), i * 350); } },
    "Forever": { fn: () => { fxo("flash", cap("Forever & always"), 3000); for (let i = 0; i < 5; i++) setTimeout(() => burst(W / 2 + rnd(-90, 90), H / 2 + rnd(-90, 90), 12, STARS), i * 300); playOnce([[1047, .1], [1319, .1], [1568, .1], [2093, .3]], "sine", 0.05); } },
    "Butterflies": { big: false, fn: () => { for (let i = 0; i < 9; i++) { const b = document.createElement("div"); b.className = "bfly"; b.innerHTML = "<span>🦋</span>"; b.style.setProperty("--x0", rnd(5, 85) + "vw"); b.style.setProperty("--x1", rnd(5, 85) + "vw"); b.style.setProperty("--t", rnd(4.2, 6.4) + "s"); b.style.animationDelay = rnd(0, 1.6) + "s"; document.body.appendChild(b); setTimeout(() => b.remove(), 8500); } } },
    "Wish": { big: false, fn: () => { for (let i = 0; i < 3; i++) { const s = document.createElement("div"); s.className = "shoot"; s.style.top = rnd(4, 28) + "%"; s.style.left = rnd(-10, 30) + "%"; s.style.animationDelay = i * 0.55 + "s"; document.body.appendChild(s); setTimeout(() => s.remove(), 3300); } twinkle(18); fxo("", cap("Make a wish ✨"), 3600); playOnce([[1568, .08], [1976, .08], [2349, .2]], "sine", 0.05); } }
};

/* =====================  LOVE FEATURES: love buttons, moods, touch together  ===================== */
const nud = $("nudges"), moodBox = $("moods");
nud.innerHTML = NUDGES.map(([e, l]) => `<button data-e="${e}" data-l="${l}"><span>${e}</span>${l}</button>`).join("");
$("btn-love").onclick = (e) => {
    e.stopPropagation(); nud.classList.toggle("hidden");
    if (nud.classList.contains("hidden")) return;
    const r = $("btn-love").getBoundingClientRect();
    nud.style.left = Math.max(10, Math.min(r.left - 20, innerWidth - nud.offsetWidth - 10)) + "px";
    nud.style.bottom = innerHeight - r.top + 10 + "px";
};
function sendNudge(e, l) {
    set(ref(db, "chat_meta/nudge"), { by: me, e, l, token: Date.now() + "_" + Math.random().toString(36).slice(2, 7) }).catch(() => toast("Couldn't send"));
}
nud.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    nud.classList.add("hidden");
    sendNudge(b.dataset.e, b.dataset.l);
});
$("btn-call-beat").onclick = () => sendNudge("💋", "beat");
function playNudge(d) {
    const mineN = d.by === me, cfg = own(NUDGE_FX, d.l) || {}, label = String(d.l || "love");
    if (cfg.big !== false) {
        const el = document.createElement("div");
        el.className = "nudge"; el.textContent = d.e; document.body.appendChild(el);
        el.addEventListener("animationend", () => el.remove());
    }
    rain(mineN ? 14 : 28); burst(W / 2, H / 2, 18, [emojiSprite(d.e)].concat(HEARTS));
    if (!mineN) {
        const msg = own(NUDGE_MSG, d.l);
        toast(msg ? msg(d.by) : `${d.by} sent you ${label.toLowerCase()} ${d.e}`, 3800);
        vibrate([120, 60, 120]);
        playOnce([[660, .09], [990, .14], [1320, .18]], "sine", 0.07);
    } else toast(`${d.e} sent to ${you}`, 1500);
    if (!reduce && cfg.fn) cfg.fn(mineN, d);
}

/* Mood: a tiny emoji next to their name, plus a little toast when it changes */
moodBox.innerHTML = MOODS.map(([e, l]) => `<button data-e="${e}" data-l="${l}"><span>${e}</span>${l}</button>`).join("");
$("btn-mood").onclick = (e) => {
    e.stopPropagation(); closeMenu(); moodBox.classList.remove("hidden");
    const r = $("btn-menu").getBoundingClientRect();
    moodBox.style.left = Math.max(10, Math.min(r.right - moodBox.offsetWidth, innerWidth - moodBox.offsetWidth - 10)) + "px";
    moodBox.style.top = r.bottom + 10 + "px";
};
moodBox.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    moodBox.classList.add("hidden");
    const clear = b.dataset.l === "Clear";
    set(ref(db, `chat_meta/mood/${me}`), clear ? null : { e: b.dataset.e, l: b.dataset.l, t: Date.now() })
        .then(() => toast(clear ? "Mood cleared" : `Mood set: ${b.dataset.e} ${b.dataset.l}`)).catch(() => toast("Couldn't set mood"));
});
function moodInit() {
    let first = true;
    const el = $("mood");
    el.onclick = (e) => { e.stopPropagation(); if (el.textContent) { toast(`${you} is feeling ${el.textContent} ${el.title}`.trim(), 2400); burstEl(el, 6, [emojiSprite(el.textContent)]); } };
    onValue(ref(db, `chat_meta/mood/${you}`), (s) => {
        const d = s.val();
        if (!d || !d.e) { el.classList.add("hidden"); el.textContent = ""; el.title = ""; first = false; return; }
        el.textContent = String(d.e); el.title = String(d.l || ""); el.classList.remove("hidden");
        if (!first) { toast(`${you} is feeling ${d.e} ${d.l || ""}`.trim(), 2800); burstEl(el, 8, [emojiSprite(String(d.e))]); }
        first = false;
    });
}

const pad = $("touchpad");
let touching = false, lastTS = 0, mineP = null, partnerP = null, mergeT = 0, hintOn = false, lastMergebeat = 0;
const dot = document.createElement("div"); dot.className = "tdot hidden"; dot.innerHTML = HEART_SVG; document.body.appendChild(dot);
function openPad() { pad.classList.remove("hidden"); }
function endTouch() { if (!touching) return; touching = false; mineP = null; set(ref(db, `chat_meta/touch/${me}`), null).catch(() => {}); }
$("hb").onclick = openPad;
$("pad-close").onclick = () => { pad.classList.add("hidden"); endTouch(); };
function checkMerge() {
    if (!mineP || !partnerP) return;
    const n = performance.now(); if (n - mergeT < 500) return; mergeT = n;
    const d = Math.hypot(mineP.x - partnerP.x, mineP.y - partnerP.y), mx = (mineP.x + partnerP.x) / 2, my = (mineP.y + partnerP.y) / 2;
    burst(mx, my, d < 90 ? 14 : 5, HEARTS);
    if (d < 90) {
        if (navigator.vibrate) navigator.vibrate(40);
        /* fingers meet = a beat lands exactly where you touch */
        if (n - lastMergebeat > 3600) { lastMergebeat = n; glassbeat(mx, my, 96); }
    }
}
function sendTouch(e, force) {
    mineP = { x: e.clientX, y: e.clientY };
    if (performance.now() - (pad._ls || 0) > 120) { pad._ls = performance.now(); rise(e.clientX, e.clientY, 1); }
    checkMerge();
    const n = performance.now(); if (!force && n - lastTS < 90) return; lastTS = n;
    set(ref(db, `chat_meta/touch/${me}`), { x: e.clientX / W, y: e.clientY / H, t: Date.now() }).catch(() => {});
}
pad.addEventListener("pointerdown", (e) => { if (e.target.closest("button")) return; touching = true; try { pad.setPointerCapture(e.pointerId); } catch (x) {} sendTouch(e, true); });
pad.addEventListener("pointermove", (e) => { if (touching) sendTouch(e); });
["pointerup", "pointercancel"].forEach((ev) => pad.addEventListener(ev, endTouch));

function loveListeners() {
    $("avatar").addEventListener("click", () => {
        const now = Date.now(); if (now - lastCeleb < 3000) return; lastCeleb = now;
        burstEl($("avatar"), 16);
        set(ref(db, "chat_meta/celebration"), { triggeredBy: me, token: now + "_" + Math.random().toString(36).slice(2, 7) }).catch(() => {});
    });
    let f1 = true;
    onValue(ref(db, "chat_meta/celebration"), (s) => {
        const d = s.val();
        if (f1) { f1 = false; celebTok = d?.token || null; return; }
        if (d?.token && d.token !== celebTok) { celebTok = d.token; rain(30); for (let i = 0; i < 4; i++) setTimeout(() => burst(rnd(W * 0.2, W * 0.8), rnd(H * 0.25, H * 0.6), 14), i * 250); }
    });
    let f2 = true;
    onValue(ref(db, "chat_meta/nudge"), (s) => {
        const d = s.val();
        if (f2) { f2 = false; nudgeTok = d?.token || null; return; }
        if (d?.token && d.token !== nudgeTok) { nudgeTok = d.token; playNudge(d); }
    });
    onValue(ref(db, `chat_meta/touch/${you}`), (s) => {
        const d = s.val();
        if (!d) { partnerP = null; dot.classList.add("hidden"); return; }
        partnerP = { x: d.x * W, y: d.y * H };
        dot.style.transform = `translate(${partnerP.x}px,${partnerP.y}px)`; dot.classList.remove("hidden");
        rise(partnerP.x, partnerP.y, 1);
        if (!hintOn) { hintOn = true; toast(`${you} is touching the screen 💞`, 2600); if (navigator.vibrate) navigator.vibrate(30); setTimeout(() => (hintOn = false), 15000); }
        checkMerge();
    });
}
