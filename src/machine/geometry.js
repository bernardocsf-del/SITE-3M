/* Geometria da máquina: elevação frontal em px, num palco de 784 × 1678 que é escalado para caber na tela. */
import elA from '../assets/img/fit-elA.webp';
import teeT from '../assets/img/fit-teeT.webp';
import union from '../assets/img/union.webp';
import tray from '../assets/img/tray.webp';

export const STAGE_W = 784, STAGE_H = 1678;
/* Folga igual nas duas prateleiras: 22 px entre o braço (trilho + 48) e o topo da lata.
   Em relação ao artefato original, o trilho A desceu 12 px, o trilho B desceu 12 px (para não cobrir as etiquetas de cima)
   e o piso B desceu 8 px. */
export const ROWS = [
  { key: 'A', vol: 473, rail: 274, floor: 574, canH: 230 },
  { key: 'B', vol: 350, rail: 646, floor: 892, canH: 176 },
];
export const COLX = [110, 251, 392, 533, 674];
export const PARK_X = 690;                         /* cada pórtico espera na ponta da porta */
export const MAN_Y = 1148;                         /* linha central do coletor */
export const SLOTX = [127, 233, 339, 445, 551, 657]; /* seis bocas, centradas no gabinete */
export const PACK_FLOOR = 1128;
const PH = { 473: 112, 350: 86 };                  /* alturas na bandeja mantêm a proporção real */
export const packH = (c) => PH[c.vol] || 80;

/* a linha de vidro */
export const PA = ROWS[0].rail, PB = ROWS[1].rail, TX = 766, GAL_END = 724, BR = 24;
export const PW = 34;                              /* diâmetro do vidro */
export const FD = 40;                              /* diâmetro externo das conexões de latão */
export const TRAY = { x: 72, y: 1067, w: 715, h: 102 };
export const FIT = {
  elA: { w: 260, h: 259, cx: 188.0, cy: 71.0, dd: 140, u: elA },
  teeT: { w: 177, h: 260, cx: 116.5, cy: 129.0, dd: 112, u: teeT },
};
export const UNION = union;
export const TRAY_IMG = tray;

/* ---------- prateleiras montadas a partir do catálogo ----------
   O catálogo muda (nem sempre 10 rótulos, nem sempre metade de cada tamanho), então nada aqui é fixo:
   - as latas maiores vão para a prateleira de cima; o corte entre as prateleiras fica na troca de tamanho
     mais próxima do meio, ou no meio mesmo se só houver um tamanho ou se uma prateleira passar de MAX_ROW;
   - em cada prateleira as latas se distribuem por igual na largura (mesmas posições das etiquetas);
   - a lata nunca passa da altura livre da prateleira nem da largura da sua coluna: se precisar, encolhe. */
export const MAX_ROW = 7;
const SHELF_X0 = 40, SHELF_W = 704, ARM = 48, GAP = 22;
const NATURAL_H = (vol) => (vol >= 400 ? 230 : 176);
const GUESS_RATIO = (vol) => (vol >= 400 ? 0.395 : 0.528);
export function layoutShelves(cans) {
  const list = cans.map((c, i) => ({ c, i })).sort((a, b) => b.c.vol - a.c.vol || a.i - b.i).map((o) => o.c);
  const n = list.length;
  let cut = -1;
  for (let i = 1; i < n; i++) if (list[i].vol !== list[i - 1].vol && (cut < 0 || Math.abs(i - n / 2) < Math.abs(cut - n / 2))) cut = i;
  if (cut < 0 || cut > MAX_ROW || n - cut > MAX_ROW) cut = Math.ceil(n / 2);
  [list.slice(0, cut), list.slice(cut)].forEach((group, r) => {
    const row = ROWS[r], cell = SHELF_W / Math.max(1, group.length), room = row.floor - (row.rail + ARM) - GAP;
    group.forEach((c, i) => {
      c.row = row; c.col = i; c.count = group.length; c.code = row.key + (i + 1);
      c.x = SHELF_X0 + cell * (i + 0.5);
      c.ratio = c.ratio || GUESS_RATIO(c.vol);
      c.maxW = cell - 10;
      c.h = Math.min(NATURAL_H(c.vol), room, c.maxW / c.ratio);
    });
  });
  return list;
}
