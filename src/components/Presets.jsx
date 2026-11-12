import { useState } from 'react';
import { CANS } from '../data/cans.js';
import { PRESETS } from '../data/presets.js';
import { money } from '../machine/engine.js';

/* estilo do suporte dos packs: a (papelão), b (cesta preta), c (prateleira de latão), d (engradado de madeira), e (vitrine com placa), f (cesta aberta), g (neon), h (engradado aberto). ?suporte=x troca para comparar. */
const CARRIER = new URLSearchParams(location.search).get('suporte') || 'g';
const BY_KEY = Object.fromEntries(CANS.map((c) => [c.key, c]));

function PresetCard({ preset, stock, inOrder, onAdd, onOpen }) {
  const cans = preset.cans.map((k) => BY_KEY[k]);
  const price = cans.reduce((a, c) => a + c.price, 0);
  const litros = (cans.reduce((a, c) => a + c.vol, 0) / 1000).toFixed(1).replace('.', ',');
  const need = {}; cans.forEach((c) => (need[c.id] = (need[c.id] || 0) + 1));
  const available = !stock || Object.keys(need).every((id) => stock[id] >= need[id]);
  const colors = [...new Set(cans.map((c) => c.color))];
  const [added, setAdded] = useState(false);
  const add = () => { if (onAdd(preset)) { setAdded(true); setTimeout(() => setAdded(false), 1400); } };

  return (
    <article className={'pk' + (available ? '' : ' off')} style={{ '--c1': colors[0], '--c2': colors[1] || colors[0], '--c3': colors[2] || colors[0] }}>
      <div className="pk-art" aria-hidden="true">
        <div className="pk-sign"><b>{preset.name}</b></div>
        <div className="pk-handle" />
        <div className="pk-cans">
          {cans.map((c, i) => <img key={i} src={c.img} alt="" loading="lazy" style={{ '--i': i }} />)}
        </div>
        <div className="pk-carrier">
          <b>{preset.name}</b>
          <i>Three Monkeys Beer · six pack</i>
          <em>{preset.line}</em>
        </div>
      </div>
      <span className="pk-tag">{preset.tag}</span>
      {inOrder > 0 && <span className="pk-count">{inOrder}× no pedido</span>}
      <div className="pk-body">
        <h3>{preset.name}</h3>
        <p className="pk-line">{preset.line}</p>
        <p className="pk-text">{preset.text}</p>
        <div className="pk-price">
          <b>{money(price)}</b>
          <span>6 latas · {litros} L · {money(price / 6)} por lata</span>
        </div>
        <div className="pk-actions">
          <button type="button" className="sbtn" disabled={!available} onClick={add}>
            {!available ? 'Sem estoque' : added ? 'Adicionado ✓' : 'Adicionar ao pedido'}
          </button>
          <button type="button" className="sbtn ghost" disabled={!available} onClick={() => onOpen(preset)}>Trocar latas</button>
        </div>
      </div>
    </article>
  );
}

/* Packs já montados pela casa, logo abaixo da máquina. */
export default function Presets({ snap, onAdd, onOpen }) {
  const count = (id) => (snap?.packs || []).filter((p) => p.preset === id).reduce((a, p) => a + p.qty, 0);
  return (
    <section className="shop-sec" aria-labelledby="presets-h">
      <header className="shop-head">
        <h2 id="presets-h">Packs prontos</h2>
        <p>Sem tempo de escolher? A casa já montou. Adicione direto ao pedido ou leve para a máquina e troque as latas que quiser.</p>
      </header>
      <div className="pk-grid" data-carrier={CARRIER}>
        {PRESETS.map((p) => <PresetCard key={p.id} preset={p} stock={snap?.stock} inOrder={count(p.id)} onAdd={onAdd} onOpen={onOpen} />)}
      </div>
    </section>
  );
}
