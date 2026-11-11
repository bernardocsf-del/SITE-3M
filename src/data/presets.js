/* Packs prontos: 6 latas cada, pelo `key` de src/data/cans.js.
   O preço é sempre a soma das latas (sem desconto próprio). */
export const PRESETS = [
  {
    id: 'low-cal',
    name: 'Low Cal Pack',
    tag: 'Leve',
    line: '3 Free + 3 Summer',
    text: 'Pra beber sem pesar: a Classic sem álcool e a Classic de verão, 20 e 25 kcal por 100 ml.',
    cans: ['classic-ipa-free', 'classic-ipa-summer', 'classic-ipa-free', 'classic-ipa-summer', 'classic-ipa-free', 'classic-ipa-summer'],
  },
  {
    id: 'sour-power',
    name: 'Sour Power',
    tag: 'Azedinhas',
    line: "2 I'm Sour + 2 Baby + 2 F#cking",
    text: 'As três sours da casa lado a lado: da cremosa de marshmallow à mais ácida da família.',
    cans: ['im-sour', 'im-sour-baby', 'im-fcking-sour', 'im-sour', 'im-sour-baby', 'im-fcking-sour'],
  },
  {
    id: 'classic-trio',
    name: 'Classic Trio',
    tag: 'Linha fixa',
    line: '2 Classic + 2 Summer + 2 Free',
    text: 'A IPA que abriu a cervejaria em três intensidades: 6%, 3,3% e sem álcool.',
    cans: ['classic-ipa-350', 'classic-ipa-summer', 'classic-ipa-free', 'classic-ipa-350', 'classic-ipa-summer', 'classic-ipa-free'],
  },
  {
    id: 'hop-trip',
    name: 'Hop Trip',
    tag: 'Lupuladas',
    line: '2 Classic + 2 Galaxy Detox + 2 Milky Way',
    text: 'Uma viagem de lúpulo: do amargor limpo da Classic à hazy de Galaxy e à milkshake IPA.',
    cans: ['classic-ipa-350', 'galaxy-detox', 'milky-way-ipa', 'classic-ipa-350', 'galaxy-detox', 'milky-way-ipa'],
  },
  {
    id: 'paranoid-night',
    name: 'Paranoid Night',
    tag: 'Imperial Stout 12%',
    line: '3 Popcorn + 3 Coconut and Coffee',
    text: 'Para a noite render: pipoca caramelo de um lado, coco queimado e café do outro.',
    cans: ['paranoid-popcorn', 'paranoid-coconut-coffee', 'paranoid-popcorn', 'paranoid-coconut-coffee', 'paranoid-popcorn', 'paranoid-coconut-coffee'],
  },
  {
    id: 'tour-da-casa',
    name: 'Tour da Casa',
    tag: 'Um de cada',
    line: 'Sour, IPAs e Imperial Stout',
    text: 'Seis rótulos diferentes pra conhecer a cervejaria inteira num pack só.',
    cans: ['im-sour', 'im-sour-baby', 'paranoid-popcorn', 'classic-ipa-350', 'galaxy-detox', 'milky-way-ipa'],
  },
];
