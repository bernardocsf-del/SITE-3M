import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Machine } from './engine.js';

const noop = () => () => {};
const none = () => null;

/* Monta o motor sobre o palco depois que o React desenhou o esqueleto, e o desmonta ao sair. */
export function useMachine() {
  const stageRef = useRef(null);
  const [machine, setMachine] = useState(null);
  useLayoutEffect(() => {
    const m = new Machine(stageRef.current);
    setMachine(m);
    return () => m.destroy();
  }, []);
  const snap = useSyncExternalStore(machine ? machine.subscribe : noop, machine ? machine.getSnapshot : none);
  return { stageRef, machine, snap };
}

/* O palco tem 784 px de largura e escala para caber em telas menores. */
export function useStageFit(wrapRef, stageRef, w, h) {
  useLayoutEffect(() => {
    const fit = () => {
      const k = Math.min(window.innerWidth, w) / w;
      stageRef.current.style.transform = 'scale(' + k + ')';
      wrapRef.current.style.height = h * k + 'px';
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [wrapRef, stageRef, w, h]);
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
