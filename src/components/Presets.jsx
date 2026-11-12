import { money } from '../machine/engine.js';

/* estilo do suporte dos packs: a (papelão), b (cesta preta), c (prateleira de latão), d (engradado de madeira), e (vitrine com placa), f (cesta aberta), g (neon), h (engradado aberto). ?suporte=x troca para comparar. */
const CARRIER = new URLSearchParams(location.search).get('suporte') || 'g';

function PresetCard({ preset, byKey, stock, inOrder, onAdd, onRemove }) {
  const cans = preset.cans.map((k) => byKey[k]);
  const price = cans.reduce((a, c) => a + c.price, 0);
  const full = cans.reduce((a, c) => a + (c.regular > c.price ? c.regular : c.price), 0);
  const off = full > price + 0.004 ? Math.round((1 - price / full) * 100) : 0;
  const litros = (cans.reduce((a, c) => a + c.vol, 0) / 1000).toFixed(1).replace('.', ',');
  const need = {}; cans.forEach((c) => (need[c.id] = (need[c.id] || 0) + 1));
  const available = !stock || Object.keys(need).every((id) => stock[id] >= need[id]);
  const colors = [...new Set(cans.map((c) => c.color))];

  return (
    <article className={'pk' + (available || inOrder > 0 ? '' : ' off')} style={{ '--c1': colors[0], '--c2': colors[1] || colors[0], '--c3': colors[2] || colors[0], '--glow': preset.glow || colors[0] }}>
      <div className="pk-art" aria-hidden="true">
        <div className="pk-sign">{preset.neon && <img src={preset.neon} alt="" loading="lazy" />}<b>{preset.name}</b></div>
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
      <div className="pk-body">
        <h3>{preset.name}</h3>
        <p className="pk-line">{preset.line}</p>
        <p className="pk-text"><b>{preset.tag}.</b> {preset.text}</p>
        <div className="pk-buy">
          <div className="pk-price">
            <b>{money(price)}</b>
            <span>{off > 0 && <><s>{money(full)}</s> <em>−{off}%</em> · </>}6 latas · {litros} L</span>
          </div>
          {inOrder > 0 ? (
            /* já está no pedido: o botão vira a quantidade */
            <div className="od-qty pk-qty" role="group" aria-label={'Quantidade de ' + preset.name + ' no pedido'}>
              <button type="button" aria-label="Menos um" onClick={() => onRemove(preset)}>−</button>
              <output>{inOrder}</output>
              <button type="button" aria-label="Mais um" disabled={!available} onClick={() => onAdd(preset)}>+</button>
            </div>
          ) : (
            <button type="button" className="sbtn" disabled={!available} onClick={() => onAdd(preset)}>
              {available ? 'Adicionar' : 'Sem estoque'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* Packs já montados pela casa, logo abaixo da máquina. */
export default function Presets({ snap, catalog, presets, onAdd, onRemove }) {
  const byKey = Object.fromEntries(catalog.map((c) => [c.key, c]));
  if (!presets.length) return null;
  const count = (id) => (snap?.packs || []).filter((p) => p.preset === id).reduce((a, p) => a + p.qty, 0);
  return (
    <section className="shop-sec" aria-labelledby="presets-h">
      <header className="shop-head">
        <h2 id="presets-h">Packs prontos</h2>
        <p>Sem tempo de escolher? A casa já montou.</p>
      </header>
      <div className="pk-grid" data-carrier={CARRIER}>
        {presets.map((p) => <PresetCard key={p.id} preset={p} byKey={byKey} stock={snap?.stock} inOrder={count(p.id)} onAdd={onAdd} onRemove={onRemove} />)}
      </div>
    </section>
  );
}
