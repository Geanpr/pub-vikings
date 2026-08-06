# VIKINGS NIGHT — St. John's Irish Pub
Landing Page de venda de ingressos · HTML5 + CSS3 + JavaScript puro, sem dependências.

---

## Arquivos deste pacote

```
index.html      → estrutura, SEO, Open Graph e Schema.org do evento
style.css       → toda a identidade visual (blocos numerados e comentados)
script.js       → 11 módulos comentados (header, parallax, brasas, FAQ, contadores…)
assets/img/     → pasta reservada; hoje as imagens vêm por URL
LEIA-ME.md      → este arquivo (pode ficar no repositório, não afeta o site)
```

Suba os quatro no GitHub, na **raiz** do repositório. O Vercel detecta o
`index.html` sozinho — não precisa configurar build nem framework.

> O arquivo `preview-vikings-night.html`, se você o tiver, é apenas uma cópia com
> tudo embutido para visualizar offline. **Não suba** — se ele for para a raiz,
> pode confundir na hora de identificar a página principal.

---

## O que ainda falta preencher

### 1. Link de compra dos botões — `script.js`, linha 32

Todos os 11 botões de compra do site saem de **uma única linha**. Abra o
`script.js` e cole a URL do checkout entre as aspas:

```js
const LINK_INGRESSOS = 'https://www.sympla.com.br/evento/noite-dos-vikings-no-st-johns/3531587';
```

Já está preenchido com o link do Sympla. Header, os 7 botões das dobras, o "Vamos Explorar" e a barra fixa do
celular passam a apontar para lá, abrindo em nova aba. Deixando `''` (vazio),
eles apenas rolam a página até a seção final, como estão hoje.

Os links **Ingressos** do menu e do rodapé continuam sendo âncoras internas de
propósito — quem clica no menu quer navegar, não comprar.

### 2. Preço no Google — `index.html`

No bloco `application/ld+json` do `<head>`, troque `"price": "0.00"` pelo valor
do lote atual.

Já preenchidos: telefone com link de WhatsApp, e-mail, endereço completo do Tatuapé
(no rodapé e no Schema.org), Instagram, Facebook e YouTube.

---

## Como as imagens funcionam hoje

As imagens ficam hospedadas em `desenvolvedor.worksmidia.com.br` e passam por um
conversor que entrega **WebP redimensionado**, para o celular não baixar a versão
de desktop. Nenhuma imagem é servida no formato original.

| Onde | Tamanho entregue | Formato |
|---|---|---|
| Logo (header e rodapé) | 400px | WebP |
| Arte do Hero | 1100 / 1600 / 2200px conforme a tela | WebP |
| Dobra 2 — Celebração Viking | 1000px | WebP |
| Sobre o St. John's | 1200px | WebP |
| Compartilhamento (WhatsApp/Facebook) | 1200px | JPG |

**As três URLs do Hero ficam no `style.css`**, no bloco comentado `ARTE DO HERO`.
As demais ficam no `index.html`, cada uma na sua tag `<img>`.

Se um dia quiser hospedar os arquivos comprimidos no próprio servidor e parar de
depender do conversor, é só trocar essas URLs pelos seus arquivos. O Hero tem uma
proteção extra: se o conversor não responder, o JavaScript volta sozinho para a
imagem original (o endereço está no atributo `data-fallback`).

Para regular a força da arte do Hero, há uma variável no topo do `style.css`:

```css
:root{ --hero-img: .62; }   /* 1 = imagem cheia · 0 = invisível */
```

---

## O que está implementado

**Visual** — paleta preto/madeira/bronze/dourado, títulos em Cinzel com efeito de
pedra gravada, cards em placa de metal com pregos e brilho 3D no hover, timeline
que acende conforme a rolagem, contadores animados, FAQ acordeão, cursor de machado
no desktop, brasas em canvas, neblina, vinheta e granulação de cinema.

**Conversão** — CTA em todas as dobras, header fixo com botão dourado e barra fixa
de compra no celular (aparece depois do Hero e some na dobra final).

**Velocidade** — a primeira pintura não depende de JavaScript nem das fontes: o Hero
anima em CSS puro e o conteúdo nasce visível. Fontes carregam sem bloquear a tela,
imagens vão em WebP redimensionado com `preload` da arte principal, o canvas pausa
fora da tela e um único `requestAnimationFrame` cuida de toda a rolagem.
Medido em ambiente controlado: primeira pintura em ~150 ms, 60 FPS na rolagem.

**Celular** — perfil leve que desliga granulação, `backdrop-filter` e luz volumétrica,
reduz as brasas e o blur. Layout testado em 360, 390 e 414px sem estouro lateral.

**Acessibilidade** — navegação por teclado (setas ↑↓ no FAQ), `aria-expanded`,
skip link, foco visível, contraste AA e `prefers-reduced-motion` desligando as
animações.

---

## Editar depois

**Pelo navegador (mais rápido):** no GitHub, abra o arquivo → ícone de lápis →
`Ctrl+F` para achar o trecho → **Commit changes**. O Vercel republica em ~40s.

**Na sua máquina:** VS Code → `Ctrl+Shift+P` → `Git: Clone` → cole a URL do
repositório. Instale a extensão **Live Server**, clique com o botão direito no
`index.html` → *Open with Live Server* para ver as mudanças ao salvar. Para publicar:
aba **Source Control** → mensagem → **Commit** → **Sync Changes**.

As seções estão separadas por comentários grandes no `index.html`
(`<!-- DOBRA 3 — OS SETE PILARES -->`, `<!-- DOBRA 7 — FAQ -->` e assim por diante).

**Se algo quebrar:** no GitHub, aba **Commits** → abra o commit ruim → **Revert**.
Nenhuma versão se perde.

---

## Copy

Todos os textos do site são os aprovados pelo cliente. Horários oficiais: portões
às 18h, primeira banda às 21h, encerramento às 5h — refletidos no FAQ, no contador
de "11h de celebração" e nas datas do Schema.org.
