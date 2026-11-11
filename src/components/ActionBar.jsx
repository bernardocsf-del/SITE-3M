import { money } from '../machine/engine.js';

/* Barra fixa no rodapé: o estado do pedido e a próxima ação, sempre ao alcance do dedo. */
export default function ActionBar({ n, packs, total, canSend, onClose, onSend, onSeeOrder }) {
  /* só aparece quando há o que fazer: enquanto o pack está sendo montado, a bandeja fica à vista */
  if (!canSend) return null;
  return (
    <div className="abar" role="region" aria-label="Resumo do pedido">
      <div className="abar-in">
        <button type="button" className="abar-sum" onClick={onSeeOrder}>
          <span>{packs + (packs === 1 ? ' pack' : ' packs') + ' · ' + packs * 6 + ' latas'}</span>
          <b>{money(total)}</b>
        </button>
        {n === 6 && <button type="button" className="sbtn ghost" onClick={onClose}>Fechar pack</button>}
        <button type="button" className="sbtn" onClick={onSend}>Enviar ao carrinho</button>
      </div>
    </div>
  );
}
