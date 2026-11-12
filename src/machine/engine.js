/* Motor da Six Pack Machine.
   A parte mecânica (prateleiras, latas, pórticos, tubo de vidro, viagem da lata, bandeja)
   é animada direto no DOM, quadro a quadro, exatamente como no artefato original.
   O estado de compra (pack atual, packs fechados, estoque, visor, avisos) é publicado
   para o React por subscribe()/getSnapshot(). */
import { presetsFor } from '../data/catalog.js';
import { ROWS, layoutShelves, PARK_X, MAN_Y, SLOTX, PACK_FLOOR, packH, PA, PB, TX, GAL_END, BR, PW, FIT, FD, TRAY, UNION, TRAY_IMG } from './geometry.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const money = (v) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const DEMO_STOCK = 12; /* estoque de demonstração por rótulo, até ligar na loja */
const SPEED = 0.7;     /* a viagem da lata dura 70% do tempo original */
export const offPct = (c) => (c.regular > c.price ? Math.round((1 - c.price / c.regular) * 100) : 0);
export const packValue = (arr) => arr.reduce((a, i) => a + i.c.price, 0);

function glass(d) {
  /* tubo claro e translúcido: borda brilhante em cima/esquerda, mais suave embaixo/direita, sobre sombra */
  return '<path d="' + d + '" fill="none" stroke="rgba(0,0,0,.5)" stroke-width="' + (PW + 6) + '" stroke-linecap="butt" stroke-linejoin="round" transform="translate(2,6)"/>' +
    '<path d="' + d + '" fill="none" stroke="rgba(190,210,235,.13)" stroke-width="' + PW + '" stroke-linecap="butt" stroke-linejoin="round"/>' +
    '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="' + (PW - 12) + '" stroke-linecap="butt" stroke-linejoin="round" transform="translate(-5,-5)"/>' +
    '<path d="' + d + '" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="' + (PW - 14) + '" stroke-linecap="butt" stroke-linejoin="round" transform="translate(6,6)"/>' +
    '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,.34)" stroke-width="2.5" stroke-linecap="butt" stroke-linejoin="round" transform="translate(-9,-9)"/>' +
    '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1.5" stroke-linecap="butt" stroke-linejoin="round" transform="translate(10,10)"/>';
}
function img(k, x, y, w, hh) {
  return '<image href="' + FIT[k].u + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" preserveAspectRatio="none" style="filter:drop-shadow(0 3px 3px rgba(0,0,0,.55))"/>';
}
function elbow(x, y) { const f = FIT.elA, s = FD / f.dd; return img('elA', x - f.cx * s, y - f.cy * s, f.w * s, f.h * s); }
function tee(x, y) { const f = FIT.teeT, s = FD / f.dd; return img('teeT', x - f.cx * s, y - f.cy * s, f.w * s, f.h * s); }

export class Machine {
  constructor(root, catalog) {
    this.root = root;
    this.dead = false;
    this.listeners = new Set();
    this.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.cans = layoutShelves(catalog.map((c) => ({ ...c })));
    this.presets = presetsFor(catalog);
    this.byKey = {}; this.cans.forEach((c) => (this.byKey[c.key] = c));
    this.stock = {}; this.cans.forEach((c) => (this.stock[c.id] = c.stock ?? DEMO_STOCK));
    this.S = { sel: null, pack: [], packs: [], seq: 0, busy: {}, q: {}, arm: {}, armAt: {} };
    this.ui = { flash: 0, chips: [], chipsVer: 0, toast: null, panel: null, idleMeta: true };
    this.snap = null;
    this.onKey = (e) => { if (e.key === 'Enter') this.confirmAdd(); };
    this.build();
    this.cans.forEach((c) => { if (this.stock[c.id] <= 0) this.markOut(c); });
    this.renderChips();
    this.emit();
    document.addEventListener('keydown', this.onKey);
  }

  /* ---------- ponte com o React ---------- */
  $(id) { return this.root.querySelector('#' + id); }
  subscribe = (fn) => { this.listeners.add(fn); return () => this.listeners.delete(fn); };
  getSnapshot = () => this.snap;
  emit() {
    if (this.dead) return;
    const S = this.S;
    this.snap = {
      sel: S.sel,
      selStock: S.sel ? this.stock[S.sel.id] : 0,
      flash: this.ui.flash,
      pack: S.pack.slice(),
      packs: S.packs.map((p) => ({ items: p.items, qty: p.qty, name: p.name, preset: p.preset })),
      stock: { ...this.stock },
      chips: this.ui.chips,
      chipsVer: this.ui.chipsVer,
      toast: this.ui.toast,
      panel: this.ui.panel,
    };
    this.listeners.forEach((fn) => fn());
  }
  destroy() {
    this.dead = true;
    document.removeEventListener('keydown', this.onKey);
    ['shelves', 'cans', 'gantries', 'manifold', 'pipes', 'rides', 'fittings', 'pcans', 'drops', 'mouths'].forEach((id) => { const el = this.$(id); if (el) el.innerHTML = ''; });
    this.listeners.clear();
  }
  frames(T, step) {
    /* um laço de requestAnimationFrame que para sozinho se a máquina for desmontada */
    return new Promise((res) => {
      const t0 = performance.now();
      const go = (now) => {
        if (this.dead) return res();
        const p = Math.min(1, (now - t0) / T);
        step(p);
        if (p < 1) requestAnimationFrame(go); else res();
      };
      go(t0);
    });
  }

  /* ---------- prateleiras, etiquetas, latas, pórticos, tubo ---------- */
  build() {
    const $ = (id) => this.$(id), S = this.S;
    ROWS.forEach((r) => {
      const sh = document.createElement('div'); sh.className = 'shelf'; sh.style.top = r.floor + 'px';
      sh.innerHTML = '<div class="lip" id="lip-' + r.key + '"></div>'; $('shelves').appendChild(sh);
      const led = document.createElement('div'); led.className = 'led'; led.style.top = (r.rail + 22) + 'px'; $('shelves').appendChild(led);
      $('gantries').insertAdjacentHTML('beforeend', '<div class="gallery" style="top:' + (r.rail - 14) + 'px"></div><div class="gcap" style="top:' + (r.rail - 25) + 'px"></div>' +
        '<div class="car" id="car-' + r.key + '" style="top:' + (r.rail + 14) + 'px;left:' + PARK_X + 'px"><span class="lamp"></span><div class="hose" id="hose-' + r.key + '"><div class="seg"></div><div class="cup"></div></div></div>');
      S.arm[r.key] = Promise.resolve(); S.armAt[r.key] = null;
    });
    this.cans.forEach((c) => {
      const r = c.row, w = c.h * c.ratio, x = c.x;
      const el = document.createElement('div'); el.className = 'c-can'; el.id = 'can-' + c.id; el.tabIndex = 0;
      el.setAttribute('role', 'button'); el.setAttribute('aria-label', c.code + ' ' + (c.disp || c.name));
      el.style.cssText = 'left:' + (x - w / 2) + 'px;top:' + (r.floor - c.h) + 'px;height:' + c.h + 'px;width:' + w + 'px';
      el.innerHTML = '<img src="' + c.img + '" alt="' + c.name + '">' + (offPct(c) ? '<span class="off">−' + offPct(c) + '%</span>' : '');
      el.addEventListener('click', () => this.tap(c));
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); this.tap(c); } });
      $('cans').appendChild(el);
      const tag = document.createElement('div'); tag.className = 'tag' + (offPct(c) ? ' sale' : '') + (c.count > 5 ? ' tight' : ''); tag.id = 'tag-' + c.id;
      tag.innerHTML = '<b>' + c.code + '</b><span><i>R$</i>' + c.price.toFixed(2).replace('.', ',') + '</span>';
      tag.addEventListener('click', () => this.tap(c));
      $('lip-' + r.key).appendChild(tag);
    });
    /* larguras exatas tiradas das próprias latas, para nenhuma ficar esticada */
    Promise.all([...this.root.querySelectorAll('.c-can img')].map((im) => im.decode().catch(() => {}))).then(() => {
      if (this.dead) return;
      this.cans.forEach((c) => {
        const el = $('can-' + c.id), im = el.querySelector('img');
        if (im.naturalWidth) { c.ratio = im.naturalWidth / im.naturalHeight; c.h = Math.min(c.h, c.maxW / c.ratio); const w = c.h * c.ratio; el.style.width = w + 'px'; el.style.height = c.h + 'px'; el.style.top = (c.row.floor - c.h) + 'px'; el.style.left = (c.x - w / 2) + 'px'; }
      });
    });

    /* a linha de vidro: galeria A → cotovelo → tronco (com o T da galeria B) → coletor → 6 bocas */
    this.PIPE_D = 'M' + GAL_END + ',' + PA + ' H' + (TX - BR) + ' Q' + TX + ',' + PA + ' ' + TX + ',' + (PA + BR) + ' V' + (MAN_Y - BR) + ' Q' + TX + ',' + MAN_Y + ' ' + (TX - BR) + ',' + MAN_Y + ' H' + SLOTX[0];
    const PIPE_B = 'M' + GAL_END + ',' + PB + ' H' + TX;
    const PIPE_G = 'M' + GAL_END + ',' + PA + ' H' + (TX - BR) + ' Q' + TX + ',' + PA + ' ' + TX + ',' + (PA + BR) + ' V' + (TRAY.y + 10);
    const defs = '<defs><linearGradient id="steelc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0e1a9"/><stop offset=".22" stop-color="#cdb76f"/><stop offset=".55" stop-color="#9c843f"/><stop offset="1" stop-color="#4a3c14"/></linearGradient></defs>';
    /* o vidro fica SOB a lata em trânsito; as conexões de latão ficam SOBRE ela */
    $('pipes').innerHTML = defs + glass(PIPE_G) + glass(PIPE_B) + '<path id="pp" d="' + this.PIPE_D + '" fill="none" stroke="none"/>';
    let f = defs;
    f += elbow(TX, PA);
    f += tee(TX, PB);
    f += '<image href="' + TRAY_IMG + '" x="' + TRAY.x + '" y="' + TRAY.y + '" width="' + TRAY.w + '" height="' + TRAY.h + '" preserveAspectRatio="none" style="filter:drop-shadow(0 5px 6px rgba(0,0,0,.6))"/>';
    SLOTX.forEach((x, i) => {
      const ty = MAN_Y + 8;
      f += '<text x="' + x + '" y="' + (ty + 1) + '" text-anchor="middle" font-family="Futura Cond,Futura,sans-serif" font-weight="700" font-size="17" fill="rgba(255,240,190,.5)">' + (i + 1) + '</text>';
      f += '<text x="' + x + '" y="' + ty + '" text-anchor="middle" font-family="Futura Cond,Futura,sans-serif" font-weight="700" font-size="17" fill="#3a2a08">' + (i + 1) + '</text>';
    });
    f += '<image href="' + UNION + '" x="700" y="' + (MAN_Y - 26) + '" width="34" height="52" preserveAspectRatio="none" style="filter:drop-shadow(0 3px 3px rgba(0,0,0,.6))"/>';
    $('fittings').innerHTML = f;
    $('manifold').innerHTML = defs;
    let o = defs;
    SLOTX.forEach((x, i) => {
      o += '<ellipse cx="' + x + '" cy="' + (PACK_FLOOR + 1.2) + '" rx="21.5" ry="4.2" fill="rgba(255,236,170,.6)"/>' + '<ellipse cx="' + x + '" cy="' + (PACK_FLOOR + 0.4) + '" rx="20" ry="3.6" fill="#0b0803" id="mouth-' + i + '"/>';
    });
    $('mouths').innerHTML = o;
  }

  /* ---------- visor ---------- */
  showCan(c) { this.ui.flash++; this.emit(); }

  /* ---------- pórticos (um por prateleira) ----------
     O braço para sobre a coluna e FICA lá, mangueira descida, pronto: tocar de novo na mesma lata suga.
     Escolher uma lata na outra prateleira só recolhe a mangueira deste braço. */
  carOf(c) { return this.$('car-' + c.row.key); }
  hoseOf(c) { return this.$('hose-' + c.row.key); }
  armTo(c) {
    const k = c.row.key, S = this.S, reduce = this.reduce;
    S.arm[k] = S.arm[k].then(async () => {
      if (this.dead) return;
      const car = this.carOf(c), hose = this.hoseOf(c);
      car.classList.remove('ready');
      const cw = c.h * c.ratio + 10; /* o tubo é da largura da lata */
      if (S.armAt[k] !== c.x) {
        if (S.armAt[k] !== null) { hose.style.height = '0px'; await wait(reduce ? 0 : 300); }
        const from = S.armAt[k] === null ? PARK_X : S.armAt[k];
        car.style.left = c.x + 'px'; car.style.width = (cw + 24) + 'px'; car.style.marginLeft = (-(cw + 24) / 2) + 'px';
        hose.style.width = cw + 'px'; hose.style.marginLeft = (-cw / 2) + 'px';
        await wait(reduce ? 0 : Math.min(500, 140 + Math.abs(c.x - from) * 0.6));
        S.armAt[k] = c.x;
      }
      const top = c.row.floor - c.h, carBottom = c.row.rail + 14 + 34;
      hose.style.height = Math.max(0, top - 8 - carBottom) + 'px';
      await wait(reduce ? 0 : 340);
      if (!this.dead) car.classList.add('ready');
    });
    return S.arm[k];
  }
  armRetract(row) {
    const k = row.key, S = this.S;
    S.arm[k] = S.arm[k].then(async () => {
      if (this.dead) return;
      const car = this.$('car-' + k), hose = this.$('hose-' + k);
      car.classList.remove('ready'); hose.style.height = '0px';
      await wait(this.reduce ? 0 : 300);
    });
    return S.arm[k];
  }

  /* ---------- escolha / compra ---------- */
  select(c) {
    const S = this.S;
    this.root.querySelectorAll('.c-can.sel,.tag.sel').forEach((t) => t.classList.remove('sel'));
    S.sel = c; this.$('can-' + c.id).classList.add('sel'); this.$('tag-' + c.id).classList.add('sel'); this.showCan(c);
    if (this.stock[c.id] > 0) this.armTo(c);
    ROWS.forEach((r) => { if (r !== c.row && S.armAt[r.key] !== null) this.armRetract(r); });
  }
  tap(c) { if (this.S.sel === c && this.stock[c.id] > 0) { this.confirmAdd(); return; } this.select(c); }
  confirmAdd() {
    const S = this.S, c = S.sel;
    if (!c) { this.toast('Toque numa lata para escolher'); return; }
    if (this.stock[c.id] <= 0) { this.showCan(c); return; }
    if (S.pack.length >= 6) { this.toast('Pack cheio: feche este pack para montar outro', true); return; }
    this.stock[c.id]--; const item = { c, uid: ++S.seq }; S.pack.push(item); this.ui.flash++; this.emit();
    this.suck(c, item);
  }

  /* ---------- a viagem ----------
     1. a lata sobe dentro da mangueira de vidro até o carro (cortada pelo corpo do carro)
     2. sai deitada na galeria de vidro e corre até a porta da direita
     3. desce pelo pilar até o coletor sob a bandeja e vai até a sua boca
     4. sobe pela boca e aparece na bandeja, na próxima posição livre */
  async suck(c, it) {
    const S = this.S, reduce = this.reduce, $ = (id) => this.$(id);
    if (S.busy[c.id]) { (S.q[c.id] = S.q[c.id] || []).push(it); return; }
    S.busy[c.id] = true;
    const el = $('can-' + c.id), car = this.carOf(c), k = c.row.key;
    await S.arm[k]; if (this.dead) return;
    if (S.armAt[k] !== c.x) { await this.armTo(c); }
    car.classList.add('vac', 'on'); car.classList.remove('ready'); el.classList.remove('sel');
    const slot = Math.max(0, S.pack.indexOf(it)), tx = SLOTX[slot];
    /* 1. mangueira acima */
    const top = c.row.floor - c.h, carBottom = c.row.rail + 48, dist = top - carBottom + c.h;
    await this.frames(reduce ? 10 : SPEED * Math.min(900, 420 + dist * 0.9), (p) => {
      const yy = -dist * (p < 0.2 ? (p / 0.2) * (p / 0.2) * 0.08 : 0.08 + (p - 0.2) / 0.8 * 0.92);
      const clip = Math.max(0, carBottom - (top + yy));
      el.style.transform = 'translateY(' + yy.toFixed(1) + 'px)'; el.style.clipPath = 'inset(' + clip.toFixed(1) + 'px 0 0 0)';
    });
    if (this.dead) return;
    el.style.opacity = '0'; el.style.transform = ''; el.style.clipPath = '';
    car.classList.remove('vac');
    if (this.stock[c.id] > 0) {
      el.style.opacity = ''; el.classList.remove('feed'); void el.offsetWidth; el.classList.add('feed');
      if (S.sel === c) { el.classList.add('sel'); car.classList.add('ready'); }
    } else {
      this.markOut(c);
      if (S.sel === c) this.showCan(c);
      this.armRetract(c.row);
    }
    /* 2. a galeria */
    const RH = c.vol === 473 ? 30 : 23, rw = RH * c.ratio, ride = document.createElement('div');
    ride.className = 'ride'; ride.style.cssText = 'height:' + RH + 'px;width:' + rw + 'px;opacity:0'; ride.innerHTML = '<img src="' + c.img + '" alt="">'; $('rides').appendChild(ride);
    const gy = c.row.rail, cx = c.x, GX = TX - 4;
    await this.frames(reduce ? 10 : SPEED * Math.min(700, 220 + (GX - cx) * 0.55), (p) => {
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2, x = cx + (GX - cx) * e;
      ride.style.opacity = Math.min(1, p * 5); ride.style.transform = 'translate(' + (x - rw / 2) + 'px,' + (gy - RH / 2) + 'px) rotate(90deg)';
    });
    if (this.dead) return;
    car.classList.remove('on');
    /* 3. tronco + coletor até a boca */
    const path = $('pp'), L = path.getTotalLength();
    const joinLen = k === 'B' ? (() => { let lo = 0, hi = L; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2, p = path.getPointAtLength(m); if (p.y < PB) lo = m; else hi = m; } return lo; })() : (TX - GAL_END - 4);
    const endLen = (() => { let lo = 0, hi = L; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2, p = path.getPointAtLength(m); if (p.y < MAN_Y - 1 || p.x > tx) lo = m; else hi = m; } return lo; })();
    await this.frames(reduce ? 10 : SPEED * Math.max(500, (endLen - joinLen) * 0.95), (p) => {
      const e = p < 0.3 ? (p / 0.3) * (p / 0.3) * 0.22 : 0.22 + (p - 0.3) / 0.7 * 0.78;
      const len = joinLen + (endLen - joinLen) * e, pt = path.getPointAtLength(len), q = path.getPointAtLength(Math.max(0, len - 3));
      const ang = Math.atan2(pt.y - q.y, pt.x - q.x) * 180 / Math.PI + 90;
      ride.style.transform = 'translate(' + (pt.x - rw / 2) + 'px,' + (pt.y - RH / 2) + 'px) rotate(' + ang + 'deg)';
    });
    if (this.dead) return;
    /* a lata se endireita sob a boca */
    const mouth = $('mouth-' + slot);
    await this.frames(reduce ? 10 : 160, (p) => {
      ride.style.transform = 'translate(' + (tx - rw / 2) + 'px,' + (MAN_Y - RH / 2) + 'px) rotate(' + (90 - 90 * p) + 'deg)';
    });
    if (this.dead) return;
    ride.remove(); mouth.setAttribute('fill', '#5aa7ff');
    /* 4. sobe pela boca até a bandeja, voltando ao seu tamanho */
    const H = packH(c), w = H * c.ratio, d = document.createElement('div');
    d.className = 'drop'; d.style.cssText = 'height:' + H + 'px;width:' + w + 'px;left:' + (tx - w / 2) + 'px;top:' + (PACK_FLOOR - H) + 'px'; d.innerHTML = '<img src="' + c.img + '" alt="">'; $('drops').appendChild(d);
    await this.frames(reduce ? 10 : SPEED * 460, (p) => {
      const e = p < 0.8 ? (1 - Math.pow(1 - p / 0.8, 3)) : 1, over = p > 0.8 ? Math.sin((p - 0.8) / 0.2 * Math.PI) * 6 : 0;
      const yy = H * (1 - e) - over, sc = 0.6 + 0.4 * e;
      d.style.transform = 'translateY(' + yy.toFixed(1) + 'px) scale(' + sc.toFixed(3) + ')'; d.style.clipPath = 'inset(0 0 ' + Math.max(0, yy).toFixed(1) + 'px 0)';
    });
    if (this.dead) return;
    d.remove(); setTimeout(() => mouth.setAttribute('fill', '#0b0803'), 160);
    if (S.pack.includes(it)) this.placeInPack(it);
    S.busy[c.id] = false; const q = S.q[c.id]; if (q && q.length) this.suck(c, q.shift());
  }
  markOut(c) {
    const el = this.$('can-' + c.id), tg = this.$('tag-' + c.id);
    /* a lata esgotada fica na prateleira, apagada, em vez de deixar um buraco */
    el.style.opacity = ''; el.classList.remove('sel');
    el.classList.add('out'); tg.classList.add('out'); tg.querySelector('span').textContent = 'ESGOTADO';
  }
  placeInPack(it) {
    if (this.$('p-' + it.uid)) return;
    const c = it.c, slot = this.S.pack.indexOf(it), H = packH(c), w = H * c.ratio;
    const el = document.createElement('div'); el.className = 'pcan'; el.id = 'p-' + it.uid;
    el.style.cssText = 'left:' + (SLOTX[slot] - w / 2) + 'px;top:' + (PACK_FLOOR - H) + 'px;height:' + H + 'px;width:' + w + 'px';
    el.innerHTML = '<img src="' + c.img + '" alt="' + c.name + '">'; el.title = 'Devolver ' + c.code;
    el.addEventListener('click', () => this.giveBack(it));
    this.$('pcans').appendChild(el); this.relayout();
  }
  relayout() {
    this.S.pack.forEach((it, i) => { const el = this.$('p-' + it.uid); if (el) { const w = packH(it.c) * it.c.ratio; el.style.left = (SLOTX[i] - w / 2) + 'px'; } });
  }
  restoreTube(c) {
    const el = this.$('can-' + c.id), tg = this.$('tag-' + c.id);
    if (el.classList.contains('out')) {
      el.classList.remove('out'); el.style.opacity = ''; el.classList.remove('feed'); void el.offsetWidth; el.classList.add('feed');
      tg.classList.remove('out'); tg.querySelector('span').innerHTML = '<i>R$</i>' + c.price.toFixed(2).replace('.', ',');
    }
    if (this.S.sel === c) this.showCan(c);
  }
  giveBack(it) {
    const S = this.S, i = S.pack.indexOf(it); if (i < 0) return;
    S.pack.splice(i, 1); this.stock[it.c.id]++;
    const el = this.$('p-' + it.uid); if (el) { el.classList.add('back'); setTimeout(() => { el.remove(); this.relayout(); }, 340); }
    this.restoreTube(it.c); this.toast(it.c.code + ' devolvida à máquina'); this.emit();
  }

  /* ---------- packs fechados, cada um com quantidade ---------- */
  closePack = () => {
    const S = this.S, reduce = this.reduce;
    if (S.pack.length < 6) { this.toast('Complete as 6 latas para fechar o pack', true); return; }
    const arr = S.pack; const stored = this.storePack(arr); S.pack = [];
    /* o inverso da chegada: cada lata desce pela sua boca e o pack aparece embaixo */
    const T = reduce ? 10 : 420, GAP = reduce ? 0 : 80;
    arr.forEach((it, i) => {
      const el = this.$('p-' + it.uid); if (!el) return;
      el.style.pointerEvents = 'none'; el.style.transition = 'none'; el.style.transformOrigin = '50% 100%';
      const H = el.offsetHeight, m = this.$('mouth-' + i);
      setTimeout(() => {
        if (this.dead) return;
        if (m) m.setAttribute('fill', '#5aa7ff');
        this.frames(T, (p) => {
          const e = p < 0.18 ? -Math.sin(p / 0.18 * Math.PI) * 0.06 : Math.pow((p - 0.18) / 0.82, 2.2);
          const yy = Math.max(0, e) * H, sc = 1 - 0.4 * Math.max(0, e), lift = e < 0 ? e * H : 0;
          el.style.transform = 'translateY(' + (yy + lift).toFixed(1) + 'px) scale(' + sc.toFixed(3) + ')';
          el.style.clipPath = 'inset(-30px -30px ' + Math.max(0, yy / sc).toFixed(1) + 'px -30px)';
        }).then(() => { el.remove(); if (m) setTimeout(() => m.setAttribute('fill', '#0b0803'), 140); });
      }, i * GAP);
    });
    this.emit();
    setTimeout(() => { if (this.dead) return; this.renderChips(); this.toast((stored.name || 'Pack ' + (S.packs.indexOf(stored) + 1)) + (stored.qty > 1 ? ' · agora ' + stored.qty + '×' : ' guardado') + ' · bandeja livre'); }, (arr.length - 1) * GAP + T + 260);
  };
  canAfford(items) { const need = {}; items.forEach((i) => (need[i.c.id] = (need[i.c.id] || 0) + 1)); return Object.keys(need).every((id) => this.stock[id] >= need[id]); }
  renderChips() {
    this.ui.chips = this.S.packs.map((p) => ({ items: p.items, qty: p.qty, name: p.name }));
    this.ui.chipsVer++;
    this.emit();
  }
  changeQty = (k, d) => {
    const p = this.S.packs[k];
    if (d > 0) { if (!this.canAfford(p.items)) { this.toast('Sem estoque para repetir este pack inteiro', true); return; } p.items.forEach((i) => this.stock[i.c.id]--); p.qty++; }
    else { if (p.qty <= 1) { this.undoPack(k); return; } p.items.forEach((i) => this.stock[i.c.id]++); p.qty--; }
    this.syncTubes();
    this.renderChips();
  };
  /* depois de mexer no estoque por fora da viagem: some/volta a lata da vitrine */
  syncTubes() {
    this.cans.forEach((c) => {
      if (this.stock[c.id] > 0) this.restoreTube(c);
      else { const el = this.$('can-' + c.id); if (!el.classList.contains('out') && !this.S.busy[c.id]) this.markOut(c); }
    });
  }

  /* ---------- identidade do pack: a composição ----------
     Dois packs com as mesmas 6 latas (em qualquer ordem) são o mesmo pack: somam quantidade em vez de virar outra linha.
     Se a composição é a de um pack pronto, ele leva o nome do pack pronto — mesmo montado à mão ou reaberto e fechado sem trocar nada. */
  sig(items) { return items.map((i) => i.c.id).sort((a, b) => a - b).join('-'); }
  presetFor(sig) { return this.presets.find((p) => this.sig(p.cans.map((key) => ({ c: this.byKey[key] }))) === sig); }
  storePack(items) {
    const sig = this.sig(items), same = this.S.packs.find((p) => p.sig === sig);
    if (same) { same.qty++; return same; }
    const preset = this.presetFor(sig);
    const pack = { items, qty: 1, sig, name: preset?.name, preset: preset?.id };
    this.S.packs.push(pack);
    return pack;
  }

  /* ---------- packs prontos ---------- */
  presetItems(preset) { return preset.cans.map((key) => ({ c: this.byKey[key], uid: ++this.S.seq })); }
  canAffordPreset(preset) { return this.canAfford(preset.cans.map((key) => ({ c: this.byKey[key] }))); }
  /* entra direto nos packs fechados; repetir o mesmo pack pronto só soma a quantidade */
  addPreset = (preset) => {
    const S = this.S;
    if (!this.canAffordPreset(preset)) { this.toast('Sem estoque para o ' + preset.name, true); return false; }
    const items = this.presetItems(preset);
    items.forEach((i) => this.stock[i.c.id]--);
    this.storePack(items);
    this.syncTubes(); this.renderChips(); this.toast(preset.name + ' no pedido');
    return true;
  };
  /* tira uma unidade do pack pronto que já está no pedido */
  removePreset = (preset) => {
    const k = this.S.packs.findIndex((p) => p.preset === preset.id);
    if (k >= 0) this.changeQty(k, -1);
  };
  /* põe as 6 latas na bandeja para trocar alguma antes de fechar */
  loadPreset = (preset) => {
    const S = this.S;
    if (S.pack.length) { this.toast('Esvazie a bandeja para abrir um pack pronto', true); return false; }
    if (!this.canAffordPreset(preset)) { this.toast('Sem estoque para o ' + preset.name, true); return false; }
    S.pack = this.presetItems(preset);
    S.pack.forEach((it) => { this.stock[it.c.id]--; this.placeInPack(it); });
    this.syncTubes(); this.emit(); this.toast(preset.name + ' na bandeja · troque o que quiser');
    return true;
  };
  undoPack = (k) => {
    const p = this.S.packs.splice(k, 1)[0];
    for (let n = 0; n < p.qty; n++) p.items.forEach((it) => this.stock[it.c.id]++);
    this.syncTubes(); this.renderChips(); this.toast('Pack desfeito · latas de volta à máquina');
  };
  reopenPack = (k) => {
    const S = this.S;
    if (S.pack.length) { this.toast('Há latas na bandeja: feche ou devolva antes de trocar este pack', true); return; }
    const p = S.packs[k];
    if (p.qty > 1) { p.qty--; S.pack = p.items.map((i) => ({ c: i.c, uid: ++S.seq })); }
    else { S.packs.splice(k, 1); S.pack = p.items; }
    S.pack.forEach((it) => this.placeInPack(it)); this.renderChips(); this.toast((p.name || 'Pack ' + (k + 1)) + ' de volta à bandeja');
  };
  toast(msg, warn) { this.ui.toast = { msg, warn: !!warn, id: (this.ui.toast?.id || 0) + 1 }; this.emit(); }

  /* ---------- carrinho ---------- */
  /* Envia os packs fechados (e a bandeja, se estiver completa). Latas soltas na bandeja ficam de fora e continuam lá. */
  sendToCart = () => {
    const S = this.S, n = S.pack.length;
    if (!S.packs.length && n < 6) { this.toast('Faltam ' + (6 - n) + ' latas para fechar o pack', true); return; }
    const all = []; S.packs.forEach((p) => { for (let k = 0; k < p.qty; k++) p.items.forEach((i) => all.push(i.c)); });
    if (n === 6) S.pack.forEach((i) => all.push(i.c));
    const agg = {}; all.forEach((c) => { agg[c.id] = agg[c.id] || { c, n: 0 }; agg[c.id].n++; });
    this.ui.panel = { lines: Object.values(agg), count: all.length, total: all.reduce((a, c) => a + c.price, 0), left: n < 6 ? n : 0 };
    this.emit();
  };
  closePanel = () => { this.ui.panel = null; this.emit(); };
}
