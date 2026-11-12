import { useRef } from 'react';
import Display from './components/Display.jsx';
import PackInfo from './components/PackInfo.jsx';
import Rack from './components/Rack.jsx';
import Toast from './components/Toast.jsx';
import Panel from './components/Panel.jsx';
import Presets from './components/Presets.jsx';
import Order from './components/Order.jsx';
import ActionBar from './components/ActionBar.jsx';
import { money, packValue } from './machine/engine.js';
import { STAGE_W, STAGE_H } from './machine/geometry.js';
import { useMachine, useStageFit } from './machine/useMachine.js';
import seal from './assets/img/seal.webp';

/* Six Pack Machine: um gabinete de 784 px medido como elevação frontal e escalado para caber.
   Topo com o selo → visor → vitrine com duas prateleiras e um pórtico de sucção em cada →
   tubo de vidro que desce pelo pilar até o coletor → bandeja do pack → botões e total →
   packs fechados → base. */
export default function App() {
  const wrapRef = useRef(null);
  const { stageRef, machine, snap } = useMachine();
  const compact = useStageFit(wrapRef, stageRef, STAGE_W, STAGE_H);
  const orderRef = useRef(null);
  const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
  const toMachine = () => wrapRef.current.scrollIntoView({ behavior: smooth(), block: 'start' });
  const toTray = () => window.scrollTo({ top: Math.max(0, wrapRef.current.offsetTop + wrapRef.current.offsetHeight * 0.62 - window.innerHeight / 2), behavior: smooth() });
  const toOrder = () => orderRef.current.scrollIntoView({ behavior: smooth(), block: 'start' });

  const pack = snap?.pack || [];
  const packs = snap?.packs || [];
  const n = pack.length, pv = packValue(pack);
  const closedV = packs.reduce((a, p) => a + packValue(p.items) * p.qty, 0);
  const closedN = packs.reduce((a, p) => a + p.qty, 0);
  const tot = closedV + (n === 6 ? pv : 0), np = closedN + (n === 6 ? 1 : 0);
  const canSend = n === 6 || (n === 0 && packs.length > 0);
  const send = () => { machine?.sendToCart(); toMachine(); };
  const reopen = (k) => { const before = machine.S.pack.length; machine.reopenPack(k); if (!before) toTray(); else toMachine(); };

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
            <div className="eng l" aria-hidden="true">Six Pack<b>Machine</b></div>
            <div className="eng r" aria-hidden="true">Escolha 6 latas<b>misture como quiser</b></div>
          </div>

          <Display snap={snap} compact={compact} />
          <Panel panel={snap?.panel} onClose={() => machine?.closePanel()} />
          <Toast toast={snap?.toast} />

          <div className="vit" id="vit" />
          <div id="shelves" />
          <div id="cans" />
          <div id="gantries" />
          <div className="glare" />
          <div className="frame" />

          <PackInfo pack={pack} />
          <div className="deck" />
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
      <Presets snap={snap} onAdd={(p) => machine?.addPreset(p)} />
      <Order ref={orderRef} chips={snap?.chips || []} total={tot} packs={np} canSend={canSend} pending={n > 0 && n < 6 ? n : 0}
        onQty={(k, d) => machine?.changeQty(k, d)} onUndo={(k) => machine?.undoPack(k)} onReopen={reopen} onSend={send} />
    </main>
    <ActionBar n={n} packs={np} total={tot} canSend={canSend} onClose={() => machine?.closePack()} onSend={send} onSeeOrder={toOrder} />
    </>
  );
}
