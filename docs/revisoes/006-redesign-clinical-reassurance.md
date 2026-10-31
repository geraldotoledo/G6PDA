# RL-006 — Redesign Clinical Reassurance

Data: 31/10/2026
Categoria: cross_cutting_or_critical_runtime_change
Estado de execução: validada tecnicamente nos cenários abaixo; aprovada na revisão humana
Revisão humana: aprovada (Geraldo Toledo, 31/10/2026 — escopo visual/UX Clinical Reassurance e identidade G6PDA)
Revisão clínica: não realizada; nenhuma reclassificação autorizada
Publicação: autorizada para GitHub Pages (github.io) em 31/10/2026

## Problema, autorização e vínculos

O responsável pelo produto pediu aplicar agora o design baixado do Stitch e organizar a implementação de forma estruturada e reversível com Git. Isso autoriza a interface descrita em P-009/D-003, não as demais propostas funcionais ou a publicação.

Base observada: `docs/organizacao-documentacao`, HEAD `418fd95`, dois commits à frente da referência remota. Duas pastas não rastreadas preexistentes foram preservadas no checkout original. Foi criada a branch `feat/stitch-clinical-reassurance` em worktree independente, partindo desse HEAD. Não foram feitos commit, push ou PR remoto.

## Antes e depois

Antes: interface escura, com estilos CSS comuns e estilos inline; cinco abas ligadas ao estado de App. Depois: tema claro Clinical Reassurance, teal, superfícies suaves, tipografia local, cabeçalho e navegação consistentes, scanner com área de captura e resultados hierárquicos. Os fluxos atuais continuam funcionando; os exemplos de paciente, fotos de pessoas, QR ilustrativo e alegações clínicas do Stitch não são importados.

Fonte visual: cinco HTML/capturas exportadas de App Redesign Concept (Stitch, projeto 6108085510871621456), DESIGN.md e guia modular. Os arquivos originais permanecem fora do repositório; somente recursos necessários, não pessoais, entram no app.

## Escopo e critérios de aceite

1. Isolar o trabalho em branch/worktree; manter o checkout original intacto.
2. Reutilizar a arquitetura CSS existente, sem Tailwind CDN nem instalação de dependências. Incorporar a fonte Plus Jakarta Sans localmente e os tokens do design.
3. Aplicar o tema às cinco abas e aos modais existentes. Preservar eventos, persistência, filtros, estados de risco e completude.
4. Conectar o atalho SOS do cabeçalho à aba existente; manter sincronização e troca de perfil acessíveis.
5. Não alterar engine, regras, serviços de análise/OCR, chaves de armazenamento, payloads de compartilhamento ou critérios clínicos.
6. Verificar mobile e desktop, navegação, foco, impressão e fluxo de texto nos estados existentes; controles principais com alvo mínimo de 44px.
7. Evidenciar comportamento em navegador e verificar TypeScript e regressões existentes pertinentes. Não declarar OCR/câmera reais, offline integral, aprovação clínica ou publicação sem evidência.

Plano: tokens/recursos locais; shell e navegação; adaptação de apresentação das telas/modais; smoke interativo e verificações; atualização dos registros.

## Execução e evidências

- Tema aplicado em `src/index.css`; fonte variável Plus Jakarta Sans (Latin/Latin Extended, pesos 200–800) local, com licença SIL OFL em `src/assets/fonts/OFL.txt`. O logo provisório do Stitch foi substituído pela arte fornecida pelo usuário, descrita abaixo. Não há Tailwind CDN nem importação de fotos de pessoas.
- `App.tsx`, `Header.tsx` e `Navigation.tsx`: shell, configurações de proteção, atalho SOS, navegação com estado acessível e link para o conteúdo.
- Scanner: captura ligada ao handler existente, formulário rotulado, exemplos recolhíveis, apresentação de resultados, destaques e cards de regras. Consulta, despensa, SOS, Sobre e modais receberam os tokens claros; campos antes brancos sobre fundo claro foram corrigidos.
- `index.html` e manifesto: cor de tema clara e remoção da fonte remota. O identificador do cache foi atualizado para o redesign e, depois, para `g6pd-app-cache-v4-g6pda-icon`; a lista de pré-cache agora inclui os ícones novos. A estratégia de cache não foi redesenhada.
- Dependências locais existentes reutilizadas por junction ignorada; nenhuma instalação executada.
- Conteúdo de 19 arquivos protegidos (engine, serviços, dados, testes, manifests npm e base pública) comparado ao checkout original sem divergências após normalizar LF/CRLF. A criação do worktree no Windows produziu CRLF; não foi mudança de lógica.
- TypeScript: `node node_modules/typescript/bin/tsc --noEmit` aprovado.
- Suíte existente: `node --import tsx --test tests/*.test.ts`, **160/160 testes aprovados**, nenhuma falha. Justificativa: estilos e shell compartilhados afetam todas as abas; preservação dos contratos existentes é um risco transversal. Nenhum teste de wording ou cópia foi acrescentado.
- Produção: `node node_modules/vite/bin/vite.js build` aprovado. Foi usado o build Vite direto, sem o prebuild que sincroniza/escreve a base.
- Navegador Chromium: cinco abas em larguras **320, 390 e 1280px**, 15 combinações sem overflow horizontal nem botões visíveis menores que 44×44px. O primeiro smoke encontrou dois botões estreitos na despensa; a regra mínima foi corrigida e o conjunto final verificado.
- Scanner interativo: leitura incompleta → amarelo sem salvar; metabissulfito identificado → vermelho sem salvar; corante genérico → atenção sem salvar; lista completa sem alerta → verde com ação de salvar. Textos/vereditos herdados foram preservados, não validados clinicamente.
- Fluxos: salvar produto sintético na despensa, buscar e reanalisar o mesmo texto; consulta de tartrazina; mudança de perfil persistida com reflexo no badge; edição e persistência de dados sintéticos do cartão ao alternar abas.
- Acesso: atalho SOS acionado com Enter, outline de foco presente; botões/inputs principais dimensionados. Inspeção dos modais de EAN, IA, cadastro e importação da despensa. Upload de imagem inválida exerceu o erro existente e reabilitou o controle; câmera/OCR real não foi exercitado.
- Impressão: mídia print verificada e PDF local gerado; cabeçalho e navegação ocultos, cartão visível.
- Offline limitado: após carregar a produção e seu cache, rede desligada, página recarregada e análise de texto com restrição executada; fonte e logo permaneceram disponíveis. A versão nova do cache estava ativa. Isso **não comprova offline integral**, OCR, voz, EAN ou integrações externas.
- Recursos visuais observados na produção: fonte local carregada, logo íntegro e nenhuma requisição externa de renderização.

### Ajuste autorizado de identidade visual

O usuário rejeitou a troca anterior do ícone, forneceu uma nova imagem de coração/escudo e pediu o texto **G6PDA somente no topo**. Após o ajuste de hierarquia solicitado, o cabeçalho compartilhado usa a imagem em 48px e o nome em 22px (com tamanho-base de fonte 16px), iguais nas cinco abas; o título da aba, os demais textos, o nome instalado e o identificador técnico não foram renomeados.

- Imagem quadrada fornecida pelo usuário, redimensionada sem recorte. `public/icons/`: PNG 192/512px, variante maskable 512px com margem de proteção, Apple Touch 180px, favicon PNG 32px e ICO 16/32/48px. SVG e logo provisório sem chamadas foram removidos; o gerador manual das propostas SVG antigas também foi removido.
- Manifesto, favicon, Apple Touch e pré-cache apontam para os novos arquivos. Nome técnico e armazenamento preservados.
- Android: 14 recursos em `resources/android/res/`, com ícones convencionais e redondos em cinco densidades e ícones adaptativos com área segura. O workflow copia esses recursos após `cap sync` e antes do Gradle. Nenhuma instalação ou execução remota foi feita.
- Verificação focal: TypeScript e build aprovados; navegador mostrou G6PDA, imagem carregada e três ícones do manifesto retornando HTTP 200 com dimensões corretas. Capturas atualizadas. A suíte de 160 testes acima pertence ao redesign anterior; não foi repetida por trocar a marca.
- Smoke do empacotamento: comando de cópia executado em diretório temporário, 14 arquivos copiados sem divergência, três XMLs parseados e dimensões/área segura verificadas. **APK não compilado nem testado em launcher Android** nesta alteração.
- Ajuste visual solicitado posteriormente: título de boas-vindas do scanner de 25,6 para 20,8px e título do card de captura de 22,4 para 18px; nome do cabeçalho de 16 para 22px e ícone de 36 para 48px. A redução de boas-vindas usa classe específica, sem alterar o título dos resultados ou das outras telas.
- Verificação focal do ajuste: TypeScript/build aprovados; medidas reais em navegador nas cinco abas, com larguras 320, 390, 503 e 1280px (20 combinações), sempre ícone 48×48px e nome 22px, sem overflow horizontal ou ações fora do cabeçalho. Capturas da revisão atualizadas; testes clínicos não repetidos por ajuste de apresentação.

### Evidências visuais

Capturas do aplicativo real, com dados sintéticos quando necessários:

| Cenário | Captura |
| --- | --- |
| Scanner anterior | [Antes — mobile](evidencias/006/antes-scanner-mobile.png) |
| Scanner redesenhado | [Mobile](evidencias/006/scanner-mobile.png) e [desktop](evidencias/006/scanner-desktop.png) |
| Resultado com alerta | [Resultado](evidencias/006/resultado-mobile.png) |
| Consulta filtrada | [Consulta](evidencias/006/consulta-mobile.png) |
| Cartão sem dados pessoais | [SOS](evidencias/006/sos-mobile.png) |

### Proposta de PR e reversibilidade

- Título sugerido: `feat(ui): aplicar Clinical Reassurance aos fluxos existentes`.
- Ordem de revisão: tokens/recursos locais; shell/navegação; apresentação das telas/modais; manifesto/cache; documentação/evidências.
- Mudanças preparadas no index local para permitir `git diff --cached --stat` e `git diff --cached`; preparação não equivale a commit.
- Não executar os scripts exportados do Stitch. Não remover o worktree nem descartar arquivos para comparar versões: usar o checkout original.
- Após autorização específica, produzir commit(s) com esse escopo e escolher a base remota. A base local é `418fd95`, não presumidamente `main` ou `master`.
- Se futuramente integrado, desfazer a mudança por commit de reversão, sem reset destrutivo. A reversão visual não requer apagar dados do navegador.

## Avaliação

Aprovada na revisão humana por Geraldo Toledo em 31/10/2026 para o escopo de design e UX (`Clinical Reassurance` + identidade `G6PDA`), com autorização explícita para commit e publicação da nova versão em `github.io` (GitHub Pages). Revisão clínica permanece não realizada. A fidelidade buscada é a linguagem visual do Stitch sobre as funções reais, não equivalência pixel a pixel com os mockups que incluem outras funções. Permanecem os textos/limitações clínicas herdados, inclusive alegações de segurança já existentes, fora do escopo desta alteração visual.

## Passagem de contexto

Após a aprovação humana de 31/10/2026, o commit do redesign foi autorizado para integração e publicação no GitHub Pages (`github.io`). Para reverter futuramente sem perda de histórico, utilizar `git revert` sobre o commit do redesign.
