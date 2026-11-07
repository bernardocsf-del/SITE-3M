import { useEffect, useRef } from 'react';
import { money, packValue } from '../machine/engine.js';

export default function PackInfo({ pack }) {
  const n = pack.length, pv = packValue(pack);
  const numRef = useRef(null), prev = useRef(n);
  useEffect(() => {
    /* o contador pula só quando uma lata entra */
    if (n === prev.current + 1) { const e = numRef.current; e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump'); }
    prev.current = n;
  }, [n]);
  return (
    <div className="pinfo">
      <div className="lbl">Seu pack<small id="pack-hint" style={{ opacity: n ? 1 : 0.5 }}>{n ? 'Toque numa lata para devolver' : 'Escolha 6 latas'}</small></div>
      <div className="val" id="ro-pack">{money(pv)}<small>{n === 6 ? 'completo' : n ? 'faltam ' + (6 - n) : 'vazio'}</small></div>
      <div className="cnt">Latas<em id="pack-num" ref={numRef}>{n + '/6'}</em></div>
    </div>
  );
}
