import { useLayoutEffect, useRef } from 'react';
import { money, offPct } from '../machine/engine.js';
import { useRestartClass } from '../machine/useMachine.js';

const IDLE_TICK = '<b>Monte quantos packs quiser</b> · misture rótulos e tamanhos · <b>6 latas por pack</b> · preço por lata no display · feche o pack e comece o próximo';

/* letreiro: a ficha (ingredientes, adjuntos, serviço, prêmios) rola só quando não cabe */
function setTick(el, text) {
  el.classList.remove('run');
  el.innerHTML = '<span class="tk"><span>' + text + '</span></span>';
  const w = el.firstChild.firstChild.offsetWidth, box = el.clientWidth;
  if (w > box + 2 && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    el.firstChild.innerHTML += '<span>' + text + '</span>';
    el.style.setProperty('--dur', Math.round((w + 64) / 48) + 's'); /* ~48 px/s */
    void el.offsetWidth; el.classList.add('run');
  }
}
/* nomes longos encolhem até caber (o tamanho vai por variável, porque o CSS original fixa o tamanho com !important) */
function fitName(n) {
  let fs = 38; n.style.setProperty('--name-fs', fs + 'px'); n.style.letterSpacing = '1.5px';
  while (n.scrollWidth > n.clientWidth + 1 && fs > 21) { fs -= 1; n.style.setProperty('--name-fs', fs + 'px'); if (fs < 30) n.style.letterSpacing = '.6px'; }
}

export default function Display({ snap, compact, catalog }) {
  /* o resumo do visor em repouso sai do catálogo: quantos rótulos e quais tamanhos há hoje */
  const vols = [...new Set(catalog.map((x) => x.vol))].sort((a, b) => a - b);
  const resumo = catalog.length + (catalog.length === 1 ? ' rótulo' : ' rótulos') + ' · ' + vols.join(' e ') + ' ml';
  const c = snap?.sel || null;
  const out = c ? snap.selStock <= 0 : false;
  const full = (snap?.pack.length || 0) >= 6;
  const dispRef = useRef(null), nameRef = useRef(null), tickRef = useRef(null);
  const tick = c ? (c.ficha || c.adj || '') : IDLE_TICK;

  useRestartClass(dispRef, 'flash', snap?.flash);
  useLayoutEffect(() => {
    const n = nameRef.current;
    if (c) fitName(n); else { n.style.removeProperty('--name-fs'); n.style.letterSpacing = ''; }
  }, [c, compact]);
  useLayoutEffect(() => { setTick(tickRef.current, tick); }, [tick, snap?.flash, compact]);

  return (
    <div className={'disp' + (c ? '' : ' idle')} id="disp" aria-live="polite" ref={dispRef}>
      <div className="d-name" id="d-name" ref={nameRef}>{c ? c.name : 'Toque numa lata'}</div>
      <div className="d-price" id="d-price">
        {c ? <><small>{offPct(c) ? <><s>{money(c.regular)}</s> −{offPct(c)}%</> : 'a lata'}</small>{money(c.price)}</> : <><small>preço</small>R$ --,--</>}
      </div>
      <div className="d-row2">
        <span className="pill" id="d-style">{c ? (c.estilo || c.style || '') : 'Six pack'}</span>
        <span className="meta" id="d-meta">
          {c
            ? c.vol + ' ml · ' + (c.abvTxt || c.abv) + ' · ' + (c.ibu && !compact ? c.ibu + ' ibu · ' : '') + 'restam ' + snap.selStock
            : resumo}
        </span>
        <span className={'hint' + (c && !out ? ' go' : '')} id="d-hint">
          {c ? (out ? 'esgotado' : full ? 'pack cheio' : 'toque de novo') : ''}
        </span>
      </div>
      <div className="d-pitch" id="d-pitch">
        {c
          ? (out ? 'Esgotou por aqui. Escolha outro rótulo para completar o pack.' : (c.pitch || c.short || c.desc || ''))
          : 'Toque numa lata: o braço desce até ela. Toque de novo e ele suga a lata para o seu pack.'}
      </div>
      <div className="d-tick" id="d-tick" ref={tickRef} />
    </div>
  );
}
