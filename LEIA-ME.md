# VIKINGS NIGHT — St. John's Irish Pub
Landing Page cinematográfica · HTML5 + CSS3 + JavaScript Vanilla (zero dependências)

## Arquivos

```
index.html      → estrutura, SEO, Open Graph e Schema.org (MusicEvent)
style.css       → identidade visual completa (20 blocos comentados)
script.js       → 12 módulos comentados (loader, cursor, parallax, brasas, etc.)
assets/img/     → coloque aqui as imagens reais
preview-vikings-night.html → versão única (CSS+JS embutidos) só para visualizar
```

Para publicar, suba `index.html`, `style.css`, `script.js` e a pasta `assets/`.
O arquivo de preview não é necessário no servidor.

## Imagens a substituir

Todos os locais já funcionam sem imagem (há textura procedural + marca d'água de runa).
Basta colocar o arquivo com o nome abaixo dentro de `assets/img/`:

| Arquivo | Dimensão | Conteúdo ideal |
|---|---|---|
| `hero-longhouse.jpg` | 2560×1440 | Longhouse Viking à noite, tochas acesas, escudos, névoa baixa |
| `celebracao-viking.jpg` | 1000×1250 | Interior: mesas longas, chifres de hidromel, público celebrando |
| `pub-panoramica.jpg` | 2560×1400 | Foto panorâmica real do St. John's com palcos e público |
| `sobre-stjohns.jpg` | 1200×900 | Fachada ou salão principal em noite de show |
| `chamado-final.jpg` | 2560×1600 | Cena épica: drakkar, fogueira, névoa sobre o fiorde |
| `og-vikings-night.jpg` | 1200×630 | Banner de compartilhamento (WhatsApp / Facebook / Instagram) |
| `favicon.png` | 64×64 | Ícone da aba |
| `logo-stjohns.svg` | altura 48px | Logo oficial (opcional — hoje há logo tipográfico + runa) |

Dica de performance: exporte em **WebP** a 75–80% de qualidade e troque a extensão
no `index.html` (`.jpg` → `.webp`).

## Dados a preencher (busque por `[` no index.html)

- `[LINK-DA-PLATAFORMA-DE-INGRESSOS]` — checkout do botão final "Vamos Explorar"
- `[HORÁRIO]` — horário de abertura das portas (FAQ)
- `[TELEFONE]`, `[E-MAIL]`, `[NUMERO]` do WhatsApp — rodapé
- `[RUA E NÚMERO]`, `[BAIRRO]`, `[CIDADE]`, `[UF]`, `[CEP]` — rodapé e Schema.org
- `[LINK-INSTAGRAM]`, `[LINK-FACEBOOK]`, `[LINK-YOUTUBE]` — redes sociais
- No bloco `application/ld+json`: endereço, horário de início/fim e o `price` do lote

Os demais botões (`#ingressos`) levam à Dobra 8. Se quiser que todos apontem
direto para o checkout, troque `href="#ingressos"` pela URL da plataforma.

## O que já está pronto

**Cinematografia** — loader com runa Algiz → logo → "Os Portões de Kattegat Estão se
Abrindo..."; cursor de machado com onda metálica no clique; granulação de filme;
vignette global; neblina animada; brasas em canvas (3 densidades); luz volumétrica
que acompanha a rolagem; parallax multicamada; animação de câmera lenta no Hero.

**Conversão** — CTA em todas as dobras, header fixo com botão dourado, barra fixa de
compra no mobile (aparece após o Hero e some na dobra final).

**Performance** — canvas pausa fora da viewport e quando a aba perde o foco; um único
loop de `requestAnimationFrame` para todo o scroll; `IntersectionObserver` para
reveals, contadores e timeline; `loading="lazy"` nas imagens; zero bibliotecas.

**Acessibilidade** — navegação por teclado (inclusive setas ↑↓ no FAQ), `aria-expanded`,
`role="region"`, skip link, foco visível, contraste AA, `prefers-reduced-motion`
desliga todas as animações.

**Responsivo** — ultrawide (≥1800px), desktop, notebook (≤1180px), tablet (≤900px,
menu hambúrguer em tela cheia) e celular (≤640px, timeline vertical, cards em coluna).

## Copy

Os textos do Hero, os títulos das dobras, os nomes dos 7 cards, as 5 etapas da timeline
e todos os textos de botão foram usados exatamente como no briefing. Os textos de apoio
das Dobras 2, 5, 6, 8 e as 7 perguntas do FAQ foram redigidos no mesmo tom — troque à
vontade, estão todos em blocos comentados no `index.html`.
