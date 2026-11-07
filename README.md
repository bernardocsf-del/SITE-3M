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

## Estrutura

- `src/App.jsx` — esqueleto do gabinete (palco de 784 × 1678 px, escalado para a tela).
- `src/components/` — partes de interface em React: visor, "Seu pack", packs fechados, aviso e painel do carrinho.
- `src/machine/engine.js` — a mecânica animada (prateleiras, pórticos, viagem da lata, bandeja), igual ao artefato.
- `src/machine/geometry.js` — medidas da máquina.
- `src/data/cans.js` — os 10 rótulos (nome, preço, ficha). **Preço e estoque aqui são os do artefato** (estoque de demonstração: 4 por rótulo).
- `src/styles/machine.css` — o CSS original, com fontes e imagens extraídas para `src/assets/`.

O botão "Enviar ao carrinho" mostra o resumo do pedido, como no artefato; ainda não está ligado à loja.
