import { money } from '../machine/engine.js';

/* Barra fixa no rodapé: o total do pedido e a próxima ação, sempre ao alcance do dedo.
   Só aparece quando há o que fazer: enquanto o pack está sendo montado, a bandeja fica à vista. */
export default function ActionBar({ n, packs, total, canSend, onClose, onSend, onSeeOrder }) {
  if (!canSend) return null;
  return (
    <div className="abar" role="region" aria-label="Resumo do pedido">
      <div className="abar-in">
        <button type="button" className="abar-sum" onClick={onSeeOrder}>
          <span>{packs + (packs === 1 ? ' pack' : ' packs') + ' · ' + packs * 6 + ' latas'}</span>
          <b>{money(total)}</b>
        </button>
        {n === 6
          ? <button type="button" className="sbtn" onClick={onClose}>Fechar pack</button>
          : <button type="button" className="sbtn" onClick={onSend}>Enviar ao carrinho</button>}
      </div>
    </div>
  );
}
