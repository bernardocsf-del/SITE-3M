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
