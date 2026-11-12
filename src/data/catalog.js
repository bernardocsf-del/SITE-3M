import { CANS } from './cans.js';
import { PRESETS } from './presets.js';

/* O catálogo que a máquina mostra. Hoje vem do arquivo de rótulos; quando a loja for ligada, vem dela
   (nome, preço, preço cheio quando em promoção, estoque).
   Para testar a máquina com outros catálogos, abra a página com ?simular=…
     7     → 7 rótulos (5 de 473 ml e 2 de 350 ml), um deles já esgotado
     473   → só os rótulos de 473 ml (um tamanho só: divide nas duas prateleiras)
     12    → 12 rótulos (7 de 473 ml e 5 de 350 ml), para ver prateleira cheia */
export function getCatalog() {
  const sim = new URLSearchParams(location.search).get('simular');
  let list = CANS.map((c) => ({ ...c }));
  if (sim === '7') {
    list = list.filter((c) => !['classic-ipa-summer', 'classic-ipa-free', 'galaxy-detox'].includes(c.key));
    list.find((c) => c.key === 'milky-way-ipa').stock = 0;
  } else if (sim === '473') {
    list = list.filter((c) => c.vol === 473);
  } else if (sim === '12') {
    const clone = (key, id, name) => ({ ...list.find((c) => c.key === key), id, key: key + '-b', name, disp: name });
    list.push(clone('im-sour', 9001, "I'm Sour (lote 2)"), clone('paranoid-popcorn', 9002, 'Paranoid Popcorn (lote 2)'));
  }
  return list;
}

/* Só entram os packs prontos cujas 6 latas existem no catálogo. */
export function presetsFor(catalog) {
  const keys = new Set(catalog.map((c) => c.key));
  return PRESETS.filter((p) => p.cans.every((k) => keys.has(k)));
}
