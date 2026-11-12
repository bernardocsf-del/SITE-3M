import { forwardRef } from 'react';
import { money, packValue } from '../machine/engine.js';

/* Seu pedido: os packs fechados em tamanho de dedo (botões de 48 px), fora do palco escalado. */
const Order = forwardRef(function Order({ chips, total, packs, canSend, pending, onQty, onUndo, onReopen, onSend }, ref) {
  return (
    <section className="shop-sec" aria-labelledby="order-h" ref={ref}>
      <header className="shop-head">
        <h2 id="order-h">Seu pedido</h2>
        <p>{chips.length ? 'Ajuste a quantidade, troque latas ou remova.' : 'Os packs que você fechar ou adicionar aparecem aqui.'}</p>
      </header>
      {chips.length > 0 && (
        <ul className="od-list">
          {chips.map((p, k) => (
            <li className="od-row" key={k}>
              <div className="od-cans" aria-hidden="true">
                {p.items.map((i, j) => <img key={j} src={i.c.img} alt="" />)}
              </div>
              <div className="od-info">
                <b>{p.name || 'Pack ' + (k + 1)}</b>
                <span>{summary(p.items)}</span>
                <span className="od-unit">{money(packValue(p.items))} cada</span>
              </div>
              <div className="od-qty" role="group" aria-label={'Quantidade de ' + (p.name || 'Pack ' + (k + 1))}>
                <button type="button" aria-label="Menos um" onClick={() => onQty(k, -1)}>−</button>
                <output>{p.qty}</output>
                <button type="button" aria-label="Mais um" onClick={() => onQty(k, 1)}>+</button>
              </div>
              <b className="od-sub">{money(packValue(p.items) * p.qty)}</b>
              <div className="od-acts">
                <button type="button" className="sbtn ghost sm" onClick={() => onReopen(k)}>Trocar latas</button>
                <button type="button" className="sbtn ghost sm danger" onClick={() => onUndo(k)}>Remover</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="od-total">
        <div>
          <span>{packs + (packs === 1 ? ' pack' : ' packs')} · {packs * 6} latas</span>
          <b>{money(total)}</b>
        </div>
        <button type="button" className="sbtn big" disabled={!canSend} onClick={onSend}>Enviar ao carrinho</button>
      </div>
      {pending > 0 && <p className="od-note">Há {pending} {pending === 1 ? 'lata' : 'latas'} na bandeja: complete as 6 e feche o pack para ele entrar no pedido.</p>}
    </section>
  );
});
export default Order;

function summary(items) {
  const agg = new Map();
  items.forEach((i) => agg.set(i.c, (agg.get(i.c) || 0) + 1));
  return [...agg].map(([c, n]) => n + '× ' + (c.disp || c.name)).join(' · ');
}
