# Documentação do G6PDApp

Atualizado em 31/10/2026. Este índice orienta leitura e autoridade; não substitui os documentos responsáveis.

## Rotas atuais

| Pergunta | Referência responsável |
| --- | --- |
| Por que existe, para quem e com quais objetivos? | [Contexto do produto](produto/contexto.md) |
| Como o aplicativo está organizado tecnicamente? | [Arquitetura e limites](produto/arquitetura.md) |
| Onde estamos e o que falta? | [Estado atual](governanca/estado-atual.md) |
| Como registrar, revisar e executar mudanças? | [CONTRIBUTING](../CONTRIBUTING.md) |
| O que está em discussão? | [Propostas](governanca/propostas.md) |
| O que foi aprovado e por quê? | [Decisões](governanca/decisoes.md) |
| Quais evidências e lacunas clínicas existem? | [Base clínica](clinica/base-clinica.md) |
| Qual é o plano técnico vigente de correção? | [Plano de correção](planejamento/plano-correcao.md), acompanhado pelo [checklist](planejamento/checklist-correcao.md) |
| Qual foi a última correção técnica registrada? | [Segunda correção da fase 1](planejamento/correcao-fase-1.md) |
| Como foi feita esta organização? | [RL-001 — Estruturação documental](revisoes/001-estrutura-documental.md) |
| Como foi consolidado o histórico? | [RL-002 — Consolidação do acervo](revisoes/002-consolidacao-acervo.md) |
| Como foram organizados os nomes e pastas? | [RL-003 — Organização da documentação](revisoes/003-organizacao-documentacao.md) |
| Que verificações foram feitas na candidata e no HTML? | [RL-004 — Candidata](revisoes/004-verificacao-candidata.md) e [RL-005 — Inspeção de interface](revisoes/005-revalidacao-visual-interface.md) |
| Como foi aplicado o design do Stitch, com isolamento Git e evidências visuais? | [RL-006 — Clinical Reassurance](revisoes/006-redesign-clinical-reassurance.md) |

Os documentos ativos estão agrupados em `produto/`, `clinica/`, `planejamento/` e `governanca/`. `init/` conserva o histórico; `revisoes/` contém as avaliações locais. Números presentes no histórico identificam os antigos arquivos, não uma ordem de leitura; `P`, `D` e `RL` identificam propostas, decisões e revisões.

## Acervo e conflitos conhecidos

| Documento preservado | Alcance e orientação de uso |
| --- | --- |
| [01 — Arquitetura e contrato inicial](init/01-arquitetura-e-contrato-seguranca.md) | Desenho histórico; contém promessas de offline, linguagem de segurança absoluta e atribuições clínicas a revisar. Consulte a arquitetura atual, o plano de correção e a base clínica. |
| [Base clínica](clinica/base-clinica.md) | Registro atual de documentação e pendências; classificações legadas não equivalem a consenso validado. |
| [03 — Plano inicial de cinco fases](init/03-plano-implementacao-fases.md) | Histórico da implementação inicial. O plano de correção não é uma repetição destas fases. |
| [04 — Pontos de controle iniciais](init/04-pontos-de-controle-execucao.md) | Evidência histórica relatada; conclusões não substituem achados posteriores. |
| [Plano de correção](planejamento/plano-correcao.md) | Plano técnico vigente de escopo conectado, com pendência clínica explícita. |
| [Checklist de correção](planejamento/checklist-correcao.md) | Execução do plano de correção; não constitui aprovação clínica. |
| [07 — Retomada anterior](init/07-retomada-chat-avaliacao-e-plano.md) | Handoff histórico anterior à segunda correção; preserva detalhes da avaliação e não é instrução atual. |
| [Segunda correção](planejamento/correcao-fase-1.md) | Registro de correções e verificações anteriores, com limites clínicos. |

A conversa de origem descreve intenção e propostas. Código mostra comportamento implementado, mas não prova adequação clínica. Resultados de testes demonstram somente os cenários exercitados. Em conflito documental, consultar o responsável pelo assunto e registrar a resolução; nem o texto mais recente nem o mais restritivo vence automaticamente.

Os registros arquivados ficam em [docs/init](init/README.md); preservam a origem, não definem políticas vigentes. A estruturação documental não reclassifica a base nem encerra o plano conectado. P-001 a P-008 continuam sem autorização funcional; P-009 tem autorização visual limitada registrada em D-003/RL-006.
