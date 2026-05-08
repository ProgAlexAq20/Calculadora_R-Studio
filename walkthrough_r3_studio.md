# Guia de Uso: R³ Studio 🌌

Bem-vindo ao **R³ Studio**, o seu laboratório visual de matemática. Este guia explicará as três principais funcionalidades do aplicativo e como usá-las para visualizar conceitos matemáticos de forma interativa e esteticamente agradável.

## 1. Modo R² (Gráficos 2D) 📈

Nesta aba, você pode explorar funções de uma única variável: $y = f(x)$.

*   **Função $f(x)$:** No painel lateral esquerdo, insira a expressão matemática desejada (ex: `sin(x) * x`, `x^2`, `exp(x)`). A curva será renderizada no centro.
    *   **Dica:** Use a seção "Exemplos" logo abaixo da entrada para testar funções predefinidas rapidamente.
*   **Interação com o Gráfico:**
    *   **Pan:** Clique e arraste o mouse no gráfico para navegar pelo plano.
    *   **Zoom:** Use a roda do mouse (scroll) para aproximar ou afastar a visão.
    *   **Controles:** No canto inferior direito do gráfico, botões rápidos para Zoom In (+), Zoom Out (-) e Resetar a visão original.
*   **Derivada:** Ative o botão "Mostrar f'(x)" para plotar instantaneamente a derivada da sua função em ciano. Uma legenda será exibida para diferenciá-la da função original.
*   **Integral Definida:** Ative "Calcular integral" para calcular a área sob a curva. Defina os limites inferior ($a$) e superior ($b$). A área será preenchida visualmente e o valor numérico exato calculado pelo método de Simpson aparecerá em um cartão.
*   **Reta Tangente:** Ative "Mostrar tangente" e digite um ponto $x_0$. O R³ Studio calculará a derivada nesse ponto, plotará o ponto na curva e desenhará a reta tangente correspondente, exibindo sua equação e inclinação (derivada) no painel.

## 2. Modo R³ (Gráficos 3D) 🧊

Mude para a aba "R³" no topo para visualizar superfícies no espaço tridimensional: $z = f(x, y)$.

*   **Superfície $z = f(x, y)$:** Insira sua equação de duas variáveis no painel esquerdo. Tente algo como `x^2 - y^2` (Sela) ou `sin(x)*cos(y)` (Ondas). O motor Three.js renderizará a superfície com materiais phong e mapeamento de cores dinâmico.
*   **Controles de Câmera (Orbit Controls):**
    *   **Rotacionar:** Clique com o botão esquerdo e arraste.
    *   **Zoom:** Use o scroll do mouse.
    *   **Mover (Pan):** Clique com o botão direito e arraste.
*   **Domínio e Resolução:** Use os controles para ajustar os valores mínimos e máximos de $x$ e $y$ do domínio plotado. Você pode também usar o slider de "Resolução" para definir o nível de detalhe da malha 3D (valores mais altos podem exigir mais performance da sua máquina).

## 3. Modo Extrusão (Experimental) 🧪

A aba "Extrusão" combina 2D e 3D. Ela permite que você pegue o comportamento de uma função 2D em um intervalo e gere um objeto 3D a partir dela.

*   **Funcionamento:** Defina uma função $f(x)$, um intervalo inicial ($a$) e final ($b$), e uma altura desejada ($h$).
*   **Visualização:** O R³ Studio pega a área sob essa curva no intervalo $[a, b]$ e realiza uma "extrusão" geométrica ao longo do eixo Z na altura $h$, gerando uma malha tridimensional fechada. Você pode rotacionar e interagir com ela da mesma forma que no Modo R³.

---
> **Aviso de Erros (Math.js):** Se a expressão digitada estiver inválida ou contiver funções desconhecidas, um alerta amigável aparecerá abaixo do campo de entrada e a interface manterá o último gráfico válido sem travar. Aproveite a matemática sem medo de errar!
