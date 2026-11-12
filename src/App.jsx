import { useEffect, useMemo, useRef, useState } from 'react';
import Display from './components/Display.jsx';
import PackInfo from './components/PackInfo.jsx';
import Rack from './components/Rack.jsx';
import Toast from './components/Toast.jsx';
import CartSheet from './components/CartSheet.jsx';
import Presets from './components/Presets.jsx';
import Order from './components/Order.jsx';
import ActionBar from './components/ActionBar.jsx';
import { money, packValue } from './machine/engine.js';
import { getCatalog, presetsFor } from './data/catalog.js';
import { STAGE_W, STAGE_H } from './machine/geometry.js';
import { useMachine, useStageFit } from './machine/useMachine.js';
import seal from './assets/img/seal.webp';

/* Six Pack Machine: um gabinete de 784 px medido como elevação frontal e escalado para caber.
   Topo com o selo → visor → vitrine com duas prateleiras e um pórtico de sucção em cada →
   tubo de vidro que desce pelo pilar até o coletor → bandeja do pack → botões e total →
   packs fechados → base. */
export default function App() {
  const wrapRef = useRef(null);
  const catalog = useMemo(getCatalog, []);
  const presets = useMemo(() => presetsFor(catalog), [catalog]);
  const { stageRef, machine, snap } = useMachine(catalog);
  const compact = useStageFit(wrapRef, stageRef, STAGE_W, STAGE_H);
  const orderRef = useRef(null);
  const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
  const toTray = () => window.scrollTo({ top: Math.max(0, wrapRef.current.offsetTop + wrapRef.current.offsetHeight * 0.62 - window.innerHeight / 2), behavior: smooth() });
  const toOrder = () => orderRef.current.scrollIntoView({ behavior: smooth(), block: 'start' });

  const pack = snap?.pack || [];
  const packs = snap?.packs || [];
  const n = pack.length, pv = packValue(pack);
  const closedV = packs.reduce((a, p) => a + packValue(p.items) * p.qty, 0);
  const closedN = packs.reduce((a, p) => a + p.qty, 0);
  const tot = closedV + (n === 6 ? pv : 0), np = closedN + (n === 6 ? 1 : 0);
  /* dá para enviar com pack fechado ou bandeja completa; latas soltas na bandeja ficam de fora */
  const canSend = n === 6 || packs.length > 0;
  /* enquanto o cliente monta um pack olhando a bandeja, a barra fixa não cobre a bandeja */
  const deckRef = useRef(null);
  const [trayOnScreen, setTrayOnScreen] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setTrayOnScreen(e.isIntersecting), { threshold: 0.35 });
    io.observe(deckRef.current);
    return () => io.disconnect();
  }, []);
  const showBar = canSend && !(n > 0 && n < 6 && trayOnScreen);
  const send = () => machine?.sendToCart(); /* ação final: a confirmação aparece onde o cliente está */
  /* com a bandeja ocupada o pack não reabre: o aviso aparece ali mesmo, sem tirar o cliente do lugar */
  const reopen = (k) => { const busy = machine.S.pack.length > 0; machine.reopenPack(k); if (!busy) toTray(); };

  return (
    <>
    <div className="wrap" id="wrap" ref={wrapRef}>
      <div className={'stage' + (compact ? ' compact' : '')} id="stage" ref={stageRef}>
        <div className="shell" aria-hidden="true" />
        <div className="seal"><img src={seal} alt="Three Monkeys Beer" /></div>
        <div className="shift">
          <div className="cab" />
          <div className="crown">
            <h1 className="sr">Six Pack Machine</h1>
            <div className="eng l" aria-hidden="true">Six Pack</div>
            <div className="eng r" aria-hidden="true">Machine</div>
          </div>

          <Display snap={snap} compact={compact} catalog={catalog} />

          <div className="vit" id="vit" />
          <div id="shelves" />
          <div id="cans" />
          <div id="gantries" />
          <div className="glare" />
          <div className="frame" />

          <PackInfo pack={pack} />
          <div className="deck" ref={deckRef} />
          <svg className="pipes" id="manifold" />
          <svg className="pipes" id="pipes" />
          <div id="rides" />
          <svg className="pipes" id="fittings" />
          <div id="pcans" />
          <div id="drops" />
          <svg className="pipes" id="mouths" />
          <div className="closebar">
            <button className="btn" id="b-close" type="button" disabled={n < 6} onClick={() => machine?.closePack()}>
              <span className="bl">Fechar pack</span><span className="bd">·</span><span className="bs">guardar esse e<br />montar outro</span>
            </button>
          </div>

          <div className="pinfo tot">
            <div className="lbl">Total do pedido<small>{np * 6 + ' latas'}</small></div>
            <div className="val" id="ro-total">{money(tot)}</div>
            <div className="cnt">Packs<em>{np}</em></div>
          </div>

          <Rack chips={snap?.chips || []} ver={snap?.chipsVer || 0} compact={compact} onOpenOrder={toOrder} onQty={(k, d) => machine?.changeQty(k, d)} onUndo={(k) => machine?.undoPack(k)} onReopen={(k) => machine?.reopenPack(k)} />

          <div className="plinth"><div className="wordmark">Three Monkeys Beer<small>Rio de Janeiro · Brewing friends</small></div></div>
        </div>
      </div>
    </div>

    <main className="shop">
      <Presets snap={snap} catalog={catalog} presets={presets} onAdd={(p) => machine?.addPreset(p)} onRemove={(p) => machine?.removePreset(p)} />
      <Order ref={orderRef} chips={snap?.chips || []} pending={n > 0 && n < 6 ? n : 0}
        onQty={(k, d) => machine?.changeQty(k, d)} onUndo={(k) => machine?.undoPack(k)} onReopen={reopen} />
    </main>
    <Toast toast={snap?.toast} />
    <CartSheet panel={snap?.panel} onClose={() => machine?.closePanel()} />
    <ActionBar n={n} packs={np} total={tot} canSend={showBar} onClose={() => machine?.closePack()} onSend={send} onSeeOrder={toOrder} />
    </>
  );
}
