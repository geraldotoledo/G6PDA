# Registro de decisões

Somente escolhas com autorização identificável. Registrar uma proposta não a aprova; aprovação de produto não comprova validade clínica. Processo em [CONTRIBUTING](../../CONTRIBUTING.md).

## D-001 — Estrutura documental simplificada

- Estado: aprovada para implementação documental.
- Data e responsável: 30/10/2026, responsável pelo produto, nesta conversa.
- Evidência: após solicitar estrutura profissional simplificada e plano, o usuário instruiu “implementar”; pausou para trazer contexto e solicitou usar a conversa de origem na contextualização.
- Escolha: índice, contexto, estado atual, propostas, decisões e revisão local com critérios de aceite e evidências; reaproveitar o acervo sem mover ou duplicar transcrições.
- Motivo: permitir continuidade entre conversas, distinguir intenção de aprovação e evitar documentação concorrente.
- Consequências: atualizar documentos responsáveis a cada mudança; manter histórico identificável; registrar aprovação e execução separadamente.
- Implementação: [RL-001](../revisoes/001-estrutura-documental.md). Revisão humana do resultado permanece pendente.
- Limites: não aprova reclassificações, propostas funcionais, instalações, commits, operações remotas ou publicação.

## D-002 — Organizar documentos ativos por assunto

- Estado: aprovada para organização documental.
- Data e responsável: 30/10/2026, responsável pelo produto, nesta conversa.
- Evidência: após discutir a inconsistência dos nomes, o usuário pediu uniformizar e evitar arquivos na raiz de `docs/` sem necessidade.
- Escolha: manter `docs/index.md` como entrada; agrupar documentos ativos em `produto/`, `clinica/`, `planejamento/` e `governanca/`, com nomes descritivos. Preservar `init/` e IDs estáveis de propostas, decisões e revisões.
- Motivo: facilitar a navegação sem confundir números antigos de arquivo com ordem de execução.
- Implementação e mapa dos nomes anteriores: [RL-003](../revisoes/003-organizacao-documentacao.md).
- Limites: não aprova mudanças funcionais, reclassificações clínicas ou publicação.

## D-003 — Implementar o redesign em branch isolada

- Estado: aprovada na revisão humana e autorizada para publicação no GitHub Pages (github.io) em 31/10/2026.
- Data e responsável: 31/10/2026, responsável pelo produto, nesta conversa.
- Evidência: pedido explícito para implementar agora o design baixado, com PR ou proposta estruturada e reversível usando Git.
- Escopo autorizado: [P-009](propostas.md#p-009--aplicar-o-design-clinical-reassurance-às-funções-existentes), preservando funcionalidades e classificações existentes.
- Escolha técnica: branch `feat/stitch-clinical-reassurance`, baseada em `418fd95`, em worktree separado. CSS existente com tokens do Stitch, fontes locais, sem nova dependência. Checkout original preservado.
- Motivo: permitir avaliação visual e reversão operacional sem sobrescrever o trabalho anterior nem misturar código demonstrativo com a lógica real.
- Implementação e verificação: [RL-006](../revisoes/006-redesign-clinical-reassurance.md).
- Ajuste explícito autorizado posteriormente: substituir o ícone pela imagem de coração/escudo enviada pelo usuário, unificar o nome do aplicativo, APK e endereço `github.io` como **G6PDA**, compactar a barra superior alinhando `"Perfil e base de regras"` à direita sem ícone duplicado, e permitir ampliar o ícone em alta resolução (`512×512px`) ao tocar nele para visualizar a dedicatória `LHPT`. As chaves internas de armazenamento local permanecem preservadas.
- Limites: commit e publicação em github.io autorizados em 31/10/2026; não autoriza instalações locais ou reclassificação clínica (revisão clínica não realizada). Offline integral continua adiado.

## Decisões anteriores com referência existente

O adiamento do offline integral e o plano conectado estão registrados em [docs/planejamento/plano-correcao.md](../planejamento/plano-correcao.md) e [docs/planejamento/checklist-correcao.md](../planejamento/checklist-correcao.md). São decisões herdadas, não novas aprovações nesta entrega. A motivação original está no [contexto](../produto/contexto.md); os detalhes ainda abertos estão em [propostas](propostas.md).
