import { money } from '../machine/engine.js';

export default function Panel({ panel, onClose }) {
  return (
    <div className={'panel' + (panel ? ' show' : '')} id="panel">
      {panel && (
        <>
          <h3>Enviando ao carrinho</h3>
          <div className="list">{panel.lines.map((o) => o.n + '× ' + (o.c.disp || o.c.name) + ' ' + o.c.vol + ' ml').join(' · ')}</div>
          <div className="row">
            <span>{panel.count + ' latas · ' + panel.count / 6 + ' pack' + (panel.count > 6 ? 's' : '')}</span>
            <span>{money(panel.total)}</span>
          </div>
          <button type="button" id="p-ok" onClick={onClose}>OK</button>
        </>
      )}
    </div>
  );
}
