import { money, packValue } from '../machine/engine.js';

/* Packs fechados: cada um com quantidade, reabrir (toque nas latinhas) e desfazer (×). */
export default function Rack({ chips, ver, onQty, onUndo, onReopen }) {
  return (
    <div className="rack">
      <div className="slbl">Packs fechados</div>
      <div className="chips" id="chips">
        {!chips.length ? (
          <span className="empty">Nenhum ainda · feche o pack ao chegar em 6</span>
        ) : (
          chips.map((p, k) => (
            <div className="chip" key={ver + '-' + k}>
              <div className="minis" title={'Reabrir pack ' + (k + 1) + ' na bandeja'} onClick={() => onReopen(k)}>
                {p.items.map((i, j) => <img key={j} src={i.c.img} alt="" style={{ height: (i.c.vol === 473 ? 34 : 26) + 'px' }} />)}
              </div>
              <div className="cv">
                {money(packValue(p.items) * p.qty)}
                <small>{'Pack ' + (k + 1) + (p.qty > 1 ? ' · ' + p.qty + '×' : '')}</small>
              </div>
              <div className="qty">
                <button type="button" aria-label="Menos um" onClick={(e) => { e.stopPropagation(); onQty(k, -1); }}>−</button>
                <b>{p.qty}</b>
                <button type="button" aria-label="Mais um deste pack" onClick={(e) => { e.stopPropagation(); onQty(k, 1); }}>+</button>
              </div>
              <span className="x" title="Desfazer este pack" onClick={(e) => { e.stopPropagation(); onUndo(k); }}>×</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
