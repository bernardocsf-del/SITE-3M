import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Machine } from './engine.js';

const noop = () => () => {};
const none = () => null;

/* Monta o motor sobre o palco depois que o React desenhou o esqueleto, e o desmonta ao sair. */
export function useMachine(catalog) {
  const stageRef = useRef(null);
  const [machine, setMachine] = useState(null);
  useLayoutEffect(() => {
    const m = new Machine(stageRef.current, catalog);
    setMachine(m);
    return () => m.destroy();
  }, [catalog]);
  const snap = useSyncExternalStore(machine ? machine.subscribe : noop, machine ? machine.getSnapshot : none);
  return { stageRef, machine, snap };
}

/* O palco tem 784 px de largura e escala para caber em telas menores. */
export function useStageFit(wrapRef, stageRef, w, h) {
  const [compact, setCompact] = useState(false);
  useLayoutEffect(() => {
    const fit = () => {
      const k = Math.min(document.documentElement.clientWidth, w) / w;
      setCompact(k < 0.72); /* em tela estreita o palco encolhe: os textos pequenos ganham corpo */
      stageRef.current.style.transform = 'scale(' + k + ')';
      wrapRef.current.style.height = h * k + 'px';
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [wrapRef, stageRef, w, h]);
  return compact;
}

/* Reinicia uma animação CSS (remove a classe, força reflow, recoloca) quando `trigger` muda. */
export function useRestartClass(ref, cls, trigger, enabled = true) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!enabled || !trigger) return;
    const el = ref.current; if (!el) return;
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps
}
