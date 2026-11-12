import { money } from '../machine/engine.js';

/* Confirmação do envio ao carrinho, no lugar onde o cliente está (sobe do rodapé).
   Enquanto a loja não está ligada, é aqui que o pedido termina; depois, este é o ponto de ir para o carrinho da loja. */
export default function CartSheet({ panel, onClose }) {
  if (!panel) return null;
  const packs = panel.count / 6;
  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-h" onClick={(e) => e.stopPropagation()}>
        <h3 id="sheet-h">Pedido no carrinho <span aria-hidden="true">✓</span></h3>
        <ul>
          {panel.lines.map((o) => (
            <li key={o.c.id}><b>{o.n}×</b> {o.c.disp || o.c.name} <i>{o.c.vol} ml</i><span>{money(o.c.price * o.n)}</span></li>
          ))}
        </ul>
        <div className="sheet-tot">
          <span>{packs + (packs === 1 ? ' pack' : ' packs')} · {panel.count} latas</span>
          <b>{money(panel.total)}</b>
        </div>
        {panel.left > 0 && <p className="sheet-note">{panel.left === 1 ? '1 lata solta na bandeja ficou' : panel.left + ' latas soltas na bandeja ficaram'} de fora. Complete as 6 e feche o pack para incluir.</p>}
        <button type="button" className="sbtn ghost" onClick={onClose}>Continuar comprando</button>
      </div>
    </div>
  );
}
