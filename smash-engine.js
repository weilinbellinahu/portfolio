// ================================================================
// 骂醒 · Engine · 所有 smash-* 页面共享的游戏引擎
// ================================================================
// 这个文件包含所有内容无关的基础设施：
//   - SFX（Web Audio API 8-bit 音效 + SpeechSynthesis 人声）
//   - 共享工具（smartTruncate / setupCoinAmbient）
// v2（骂醒购物脑/焦虑脑等）新建 smash-XXX.html 时只需 <script src="smash-engine.js">
// + 在页面里定义自己的 personas / levels / angles / 文案 HTML。
// ================================================================

// ========== SFX (Web Audio API 合成 + TTS) ==========
const SFX = (() => {
  let ctx = null;
  let muted = localStorage.getItem('smash_sfx_muted') === '1';

  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function beep({ freq=440, dur=0.1, type='square', vol=0.15, slideTo=null, attack=0.005 }) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function noise({ dur=0.15, vol=0.15, filterFreq=800, filterType='lowpass' }) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const t = c.currentTime;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;
    filter.Q.value = 1;
    const gain = c.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(gain).connect(c.destination);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  function speak(text, { pitch=0.3, rate=0.65, vol=1.0, lang='en-US' }={}) {
    if (muted) return;
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // 去掉 markdown 星号和零宽字符，避免 TTS 念出 "star star"
      const clean = (text || '').replace(/\*+/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '');
      if (!clean.trim()) return;
      const u = new SpeechSynthesisUtterance(clean);
      u.pitch = pitch; u.rate = rate; u.volume = vol; u.lang = lang;
      window.speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }

  function shutUp() {
    if (!('speechSynthesis' in window)) return;
    try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
  }

  // ========== AMBIENT BED (CRT 电流嗡鸣，永恒底噪) ==========
  let ambNodes = null;
  let ambWanted = false;
  function _ambUp() {
    if (muted || !ambWanted || ambNodes) return;
    const c = ensure();
    if (!c) return;
    const t = c.currentTime;
    const master = c.createGain();
    master.gain.setValueAtTime(0, t);
    master.gain.linearRampToValueAtTime(1, t + 1.8); // 缓慢淡入
    master.connect(c.destination);
    // 60Hz 交流电嗡
    const hum = c.createOscillator();
    hum.type = 'sine'; hum.frequency.value = 60;
    const humG = c.createGain(); humG.gain.value = 0.012;
    hum.connect(humG).connect(master);
    hum.start(t);
    // 120Hz 二次谐波
    const harm = c.createOscillator();
    harm.type = 'sine'; harm.frequency.value = 120;
    const harmG = c.createGain(); harmG.gain.value = 0.006;
    harm.connect(harmG).connect(master);
    harm.start(t);
    // ~8kHz CRT 高频 whine（窄带通白噪）
    const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const whine = c.createBufferSource();
    whine.buffer = buf; whine.loop = true;
    const wf = c.createBiquadFilter();
    wf.type = 'bandpass'; wf.frequency.value = 8000; wf.Q.value = 60;
    const wg = c.createGain(); wg.gain.value = 0.06;
    whine.connect(wf).connect(wg).connect(master);
    whine.start(t);
    // 慢 LFO 轻微颤动（防止底噪过死）
    const lfo = c.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.18;
    const lfoG = c.createGain(); lfoG.gain.value = 0.04;
    lfo.connect(lfoG).connect(master.gain);
    lfo.start(t);
    ambNodes = { hum, harm, whine, lfo, master };
  }
  function _ambDown() {
    if (!ambNodes || !ctx) return;
    const n = ambNodes;
    ambNodes = null;
    const t = ctx.currentTime;
    try {
      n.master.gain.cancelScheduledValues(t);
      n.master.gain.linearRampToValueAtTime(0, t + 0.5);
    } catch (e) { /* ignore */ }
    setTimeout(() => {
      try { n.hum.stop(); n.harm.stop(); n.whine.stop(); n.lfo.stop(); }
      catch (e) { /* ignore */ }
    }, 600);
  }
  const ambient = {
    start() { ambWanted = true; _ambUp(); },
    stop()  { ambWanted = false; _ambDown(); },
  };

  // ========== MICRO SWEETENERS ==========
  function tick() { // 按钮 hover — 极轻高频
    beep({ freq: 6500, dur: 0.012, type: 'square', vol: 0.03, attack: 0.001 });
  }
  function powerOn() { // 输入框聚焦 — 低到中 swell
    beep({ freq: 180, dur: 0.22, type: 'sine', vol: 0.08, slideTo: 440, attack: 0.02 });
    setTimeout(() => beep({ freq: 880, dur: 0.08, type: 'triangle', vol: 0.04 }), 180);
  }

  function coin() {
    // 街机投币 B5→E6（用于欢迎 chirp / toggle 预览）
    beep({ freq: 988, dur: 0.07, type: 'square', vol: 0.11 });
    setTimeout(() => beep({ freq: 1319, dur: 0.14, type: 'square', vol: 0.11 }), 75);
  }

  function start() {
    // 进场 fanfare：C5-E5-G5-C6-G5-C6 + triangle 低音 bed
    const melody = [
      { f: 523,  d: 0.08, t: 0 },
      { f: 659,  d: 0.08, t: 80 },
      { f: 784,  d: 0.08, t: 160 },
      { f: 1047, d: 0.14, t: 240 },
      { f: 784,  d: 0.18, t: 420 },
      { f: 1047, d: 0.3,  t: 600 },
    ];
    melody.forEach(n => setTimeout(() =>
      beep({ freq: n.f, dur: n.d, type: 'square', vol: 0.11 }), n.t));
    setTimeout(() => beep({ freq: 131, dur: 0.3, type: 'triangle', vol: 0.09 }), 240);
    setTimeout(() => beep({ freq: 262, dur: 0.3, type: 'triangle', vol: 0.09 }), 600);
  }

  function hit() {
    // MK 风 FIGHT!!：低音 growl 建势 → 白噪爆破 + 重低音 + 金属回响
    beep({ freq: 60, dur: 0.2, type: 'sawtooth', vol: 0.1, slideTo: 180 });
    setTimeout(() => {
      noise({ dur: 0.18, vol: 0.22, filterFreq: 1200 });
      beep({ freq: 70,  dur: 0.4,  type: 'sawtooth', vol: 0.2,  slideTo: 30 });
      beep({ freq: 196, dur: 0.25, type: 'square',   vol: 0.1,  slideTo: 100 });
    }, 200);
    setTimeout(() => {
      beep({ freq: 1760, dur: 0.35, type: 'triangle', vol: 0.08 });
      beep({ freq: 1319, dur: 0.35, type: 'triangle', vol: 0.05 });
    }, 230);
  }

  function ko() {
    // 先切断一切口播（BOSS 正在说的话），400ms 静默 punch
    shutUp();
    const SILENCE = 400;
    setTimeout(() => {
      // 阶段 1：K.O. 人声 + 小调下行四音
      speak('K. O.', { pitch: 0.2, rate: 0.6, vol: 1.0 });
      const notes = [554, 494, 415, 349]; // C#5 B4 Ab4 F4
      notes.forEach((f, i) => {
        setTimeout(() => beep({ freq: f, dur: 0.32, type: 'triangle', vol: 0.12 }), i * 210 + 500);
      });
      beep({ freq: 110, dur: 1.8, type: 'sine', vol: 0.08 });
      // 阶段 2：GAME OVER 戏剧终曲
      setTimeout(() => {
        beep({ freq: 440, dur: 0.2,  type: 'square', vol: 0.14 });
        setTimeout(() => beep({ freq: 349, dur: 0.2,  type: 'square', vol: 0.14 }), 220);
        setTimeout(() => beep({ freq: 262, dur: 0.85, type: 'square', vol: 0.15 }), 440);
        setTimeout(() => {
          beep({ freq: 65, dur: 1.4, type: 'sawtooth', vol: 0.2, slideTo: 30 });
          noise({ dur: 0.35, vol: 0.1, filterFreq: 400 });
        }, 440);
      }, 1600);
    }, SILENCE);
  }

  // 打字机单字 blip — 每字一下。opts 按 BOSS 传，无 opts 用默认默片
  function type(opts = {}) {
    if (muted) return;
    const base = opts.freq ?? 2000;
    const jitter = opts.jitter ?? 400;
    const f = Math.max(60, base + (Math.random() - 0.5) * jitter);
    beep({
      freq: f,
      dur: opts.dur ?? 0.012,
      type: opts.wave ?? 'square',
      vol: opts.vol ?? 0.035,
      attack: 0.001,
      slideTo: opts.slideTo,
    });
  }

  function toggle() {
    muted = !muted;
    localStorage.setItem('smash_sfx_muted', muted ? '1' : '0');
    // 静音时 ambient 立即停；恢复时如果仍被需要，重启
    if (muted) _ambDown();
    else if (ambWanted) _ambUp();
    return muted;
  }
  function isMuted() { return muted; }

  return { beep, noise, speak, shutUp, coin, start, hit, ko, type, tick, powerOn, ambient, toggle, isMuted };
})();

// 🔊/🔇 按钮（绑定 id="sfx-toggle"）
function toggleSfx() {
  const muted = SFX.toggle();
  const btn = document.getElementById('sfx-toggle');
  if (btn) {
    btn.textContent = muted ? '🔇' : '🔊';
    btn.classList.toggle('muted', muted);
  }
  if (!muted) SFX.coin();
}
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('sfx-toggle');
  if (btn && SFX.isMuted()) {
    btn.textContent = '🔇';
    btn.classList.add('muted');
  }
});

// ========== SHARED UTILS ==========

// 截到句末（≥ maxLen/2 时用句末切，否则硬截加省略号）
function smartTruncate(text, maxLen) {
  if (!text || text.length <= maxLen) return text;
  const delim = /[。！？!?.]/g;
  let lastEnd = -1, m;
  while ((m = delim.exec(text)) !== null) {
    const pos = m.index + 1;
    if (pos <= maxLen) lastEnd = pos;
    else break;
  }
  if (lastEnd >= Math.floor(maxLen * 0.5)) return text.slice(0, lastEnd);
  return text.slice(0, maxLen - 1) + '…';
}

// COIN 屏首次 hover/tap → 播欢迎 chirp（浏览器 autoplay policy 软解锁）
function setupCoinAmbient(coinEl) {
  if (!coinEl || coinEl.classList.contains('hidden')) return;
  let played = false;
  const tryPlay = () => {
    if (played) return;
    played = true;
    SFX.coin();
    ['mouseenter','mousemove','touchstart'].forEach(ev =>
      coinEl.removeEventListener(ev, tryPlay));
  };
  coinEl.addEventListener('mouseenter', tryPlay);
  coinEl.addEventListener('mousemove', tryPlay);
  coinEl.addEventListener('touchstart', tryPlay, { passive: true });
}
