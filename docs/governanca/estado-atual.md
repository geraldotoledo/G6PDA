# Estado atual e próxima ação

Referência: 31/10/2026. Atualizar ao encerrar cada bloco; detalhes de execução permanecem nos registros vinculados.

## Observado nesta estruturação

- Checkout com alterações preexistentes em código, testes, base e documentação. Foram preservadas; não atribuir esse trabalho à estruturação documental.
- Na organização documental de 30/10/2026, o `master` remoto apontava para `406ec3e`, cuja base era 2026.10.1 com 62 regras; a base 2026.10.3 com 71 regras e as correções técnicas estavam apenas no diretório local. A branch criada apenas para a documentação não incluiu essas alterações.
- Base `src/data/rules.json`: `rulesVersion` 2026.10.3; 71 regras, sendo 7 `DOCUMENTED` e 64 `PENDING_REVIEW`, contagens conferidas por leitura do JSON.
- O significado e as lacunas desses estados estão em [docs/clinica/base-clinica.md](../clinica/base-clinica.md). Cadastro documentado não certifica toda dose, sinônimo ou formulação.
- Documentação organizada nesta entrega; implementação das novas propostas de produto não iniciada por esta tarefa. Evidências da organização: [RL-001](../revisoes/001-estrutura-documental.md).
- A arquitetura corrente tem um [mapa próprio](../produto/arquitetura.md). Documentos iniciais e handoff antigo foram arquivados em [docs/init](../init/README.md); a consolidação e seus limites constam de [RL-002](../revisoes/002-consolidacao-acervo.md).
- Documentos ativos agrupados por assunto e nomes uniformizados em [RL-003](../revisoes/003-organizacao-documentacao.md); `docs/index.md` permanece a entrada da documentação.

## Estado técnico herdado, sem reexecução nesta entrega

O [plano de correção](../planejamento/plano-correcao.md) e o [registro da fase 1](../planejamento/correcao-fase-1.md) relatam correções C1–C4, 160 testes, auditoria, TypeScript, build e verificações de scanner/sincronização. Esses resultados são históricos; não foram reexecutados para editar Markdown.

A [RL-004](../revisoes/004-verificacao-candidata.md) registra a verificação da candidata para revisão pessoal em 30/10/2026, separando testes técnicos, conteúdo clínico pendente e limitações do teste visual. Consulte o Git e o pipeline para saber se houve integração e publicação após essa verificação.

Em 30/10/2026, o commit `fc5cafc6f0a1a6944eff8a59c5b870c930b7206f` foi publicado no Pages após conclusão bem-sucedida do pipeline; a base servida retornou 2026.10.3 com 71 regras. A [RL-005](../revisoes/005-revalidacao-visual-interface.md) registra inspeção complementar por SSR, reproduzida pelo Codex nos oito cenários, com dois achados de interface; interação visual em navegador, câmera/OCR real e aparelho físico continuam sem evidência independente nessa inspeção.

A fase 1 continua com conclusão clínica pendente. Fases 2 e 3 do plano conectado não são declaradas concluídas. Offline integral permanece adiado. Não foram verificados instaladores Android ou integração real com aplicativos externos de IA nesta inspeção.

## Redesign local — 31/10/2026

[P-009](propostas.md#p-009--aplicar-o-design-clinical-reassurance-às-funções-existentes) e [D-003](decisoes.md#d-003--implementar-o-redesign-em-branch-isolada) autorizam aplicar Clinical Reassurance às funções existentes. A implementação está na branch `feat/stitch-clinical-reassurance`, em worktree isolado baseado em `418fd95`. Checkout original preservado; mudanças preparadas no index local, sem commit, push ou PR remoto.

A [RL-006](../revisoes/006-redesign-clinical-reassurance.md) registra TypeScript e build aprovados, 160 testes existentes aprovados, smoke interativo das cinco abas e capturas antes/depois. Foram verificados três tamanhos de tela, persistência, teclado, impressão e análise textual após recarga sem rede com cache previamente carregado. Offline integral, câmera/OCR real, voz e integração externa não foram comprovados por esse smoke.

Próxima ação para o redesign: aprovado na revisão humana por Geraldo Toledo em 31/10/2026 e autorizado para commit e publicação no GitHub Pages (github.io). Revisão clínica não realizada; nenhuma reclassificação clínica ocorreu; P-001 a P-008 e as pendências do plano conectado continuam abertas.

## Próximas escolhas

1. Revisar a contextualização e as propostas registradas, corrigindo qualquer interpretação de intenção.
2. Priorizar P-001: definir representação da evidência e síntese em um piloto pequeno, antes de reclassificar toda a base.
3. Em conjunto, decidir P-002/P-003: comportamento por fluxo e comunicação de risco versus falta de informação.
4. Transformar cada decisão aprovada em revisão local com critérios de aceite. Conciliar seu escopo com o plano de correção, sem marcar etapas anteriores como concluídas por associação.

Pendência principal: critérios clínicos e resolução das divergências. A organização documental permite continuar a pesquisa e a revisão, mas não elimina essa dependência.
