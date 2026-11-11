# Six Pack Machine · Three Monkeys Beer

SPA em React (Vite) feita a partir do artefato "Six Pack Machine": o cliente escolhe 6 latas,
o braço suga cada lata pelo tubo de vidro até a bandeja, fecha o pack e monta quantos quiser.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera dist/ (site estático, pode ir para qualquer hospedagem)
npm run preview  # serve o build localmente
```

## Publicação

A cada push na `main` ou na branch `claude/react-spa-site-8k0czb`, o workflow
`.github/workflows/pages.yml` compila e publica em https://bernardocsf-del.github.io/SITE-3M/
(Requer Settings → Pages → Source: GitHub Actions.)

## Estrutura

- `src/App.jsx` — esqueleto do gabinete (palco de 784 × 1678 px, escalado para a tela).
- `src/components/` — partes de interface em React: visor, "Seu pack", packs fechados, aviso e painel do carrinho.
- `src/machine/engine.js` — a mecânica animada (prateleiras, pórticos, viagem da lata, bandeja), igual ao artefato.
- `src/machine/geometry.js` — medidas da máquina.
- `src/data/cans.js` — os 10 rótulos (nome, preço, ficha). **Os preços são os do artefato**; o estoque é de demonstração (12 por rótulo, em `engine.js`).
- `src/data/presets.js` — os packs prontos (nome, texto e as 6 latas de cada um; o preço é a soma das latas).
- `src/components/Presets.jsx`, `Order.jsx`, `ActionBar.jsx` — packs prontos, "Seu pedido" e a barra fixa, fora do palco escalado (botões de 48 px).
- `src/styles/tweaks.css` — legibilidade no celular (`.stage.compact`); `src/styles/shop.css` — o que fica abaixo da máquina.
- `src/styles/machine.css` — o CSS original, com fontes e imagens extraídas para `src/assets/`.

O botão "Enviar ao carrinho" mostra o resumo do pedido, como no artefato; ainda não está ligado à loja.
