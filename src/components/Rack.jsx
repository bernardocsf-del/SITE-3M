/* Packs fechados: o compartimento onde os six packs prontos ficam guardados.
   Cada pack é um objeto (seis latinhas numa cinta de papelão), não um visor nem um botão;
   quantidade, troca e remoção ficam em "Seu pedido" — tocar num pack leva até lá. */
export default function Rack({ chips, ver, onOpenOrder }) {
  return (
    <div className="rack">
      <div className="slbl">Packs fechados</div>
      <div className="chips" id="chips">
        {!chips.length ? (
          <span className="empty">Nenhum ainda · feche o pack ao chegar em 6</span>
        ) : (
          chips.map((p, k) => {
            const name = p.name || 'Pack ' + (k + 1);
            return (
              <button type="button" className="chip" key={ver + '-' + k} onClick={onOpenOrder}
                aria-label={name + (p.qty > 1 ? ', ' + p.qty + ' unidades' : '') + ': ver em Seu pedido'}>
                <span className="minis">
                  {p.items.map((i, j) => <img key={j} src={i.c.img} alt="" className={i.c.vol === 473 ? 'tall' : ''} />)}
                </span>
                <span className="band">{name}</span>
                {p.qty > 1 && <span className="n">{p.qty}×</span>}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
