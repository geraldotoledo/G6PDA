# Propostas de evolução

Consolidação iniciada em 30/10/2026. P-001 a P-008 permanecem **em discussão**, sem autorização de implementação funcional por este registro. P-009 foi autorizada em 31/10/2026 no escopo visual indicado abaixo. Pedidos de direção do usuário são distinguidos de soluções sugeridas pelo assistente. Aprovações identificáveis geram decisões D-xxx e revisões locais RL-xxx.

## P-001 — Matriz de evidências e síntese reproduzível

**Origem:** o usuário propôs tabela por componente/categoria com posição e data por fonte, ausência nula e atualização determinística. A divergência entre recomendações é a questão central ainda aberta.

**Proposta a revisar:** manter uma visão tabular com posição + data adjacentes para cada fonte. Cada posição precisa apontar para documento/edição, trecho, data de consulta e condições aplicáveis. Separar posição clínica, identidade regulatória, precaução familiar e lacuna de pesquisa. Não reduzir tudo prematuramente a liberado/cautela/proibido.

CPIC, documentos da OMS, EFSA, Codex e documentos brasileiros individuais têm escopos diferentes; programas conjuntos FAO/OMS e Codex não devem virar votos independentes por duplicação. Nulo não significa seguro. Distinguir não pesquisado, não avaliado e ausência de recomendação específica. Não aplicar votação, média, “mais novo vence” ou “mais restritivo vence” sem política explícita e compatibilidade de dose, via, população e formulação.

**Alternativas:** tabela manual inicial ou modelo estruturado com múltiplas afirmações por substância. `evidenceClaims` foi discutido, não aprovado nem implementado por esta tarefa. Separar versão das evidências da versão da política de síntese.

**Piloto sugerido:** fava; medicamento com condição de dose; medicamento com divergência documental; corante com lacuna; aditivo cuja fonte apenas identifica o código. Escolher os itens e documentos na revisão; não aplicar automaticamente às 71 regras.

**Aceite para futura implementação:** entradas e versões iguais produzem o mesmo resultado; cada alerta é rastreável; ausência e divergência permanecem visíveis; nova publicação só substitui as afirmações afetadas; revisão de dados separada de revisão do algoritmo.

**Pendente:** vocabulário, política de síntese, papel da precaução familiar, responsáveis pela pesquisa/reconciliação e periodicidade. Registro clínico existente: [docs/clinica/base-clinica.md](../clinica/base-clinica.md).

## P-002 — Análise de produto e consulta de componente

**Origem:** usuário pediu não multiplicar alertas genéricos no scanner e permitir investigação mais detalhada na aba de consulta.

**Proposta:** no produto, considerar lista lida, alertas relevantes e lacunas concretas. Ingrediente comum não cadastrado não gera amarelo automaticamente. Texto candidato: “Nenhum componente de alerta identificado na lista analisada”, condicionado à leitura e às regras aplicadas. Na consulta, apresentar evidência, lacunas e perguntas específicas.

Para medicamento, separar princípio ativo e formulação, com campo para excipientes/corante. Aparência incolor não prova adequação. Para corante indefinido, pedir nome/INS/E; exemplos de naturais dependem de suporte documental. Relação com fava ou outros nomes exige correspondência curada; semelhança não autoriza estender restrição a toda categoria.

**Aceite:** lista completa sem alerta, leitura parcial sem alerta, leitura parcial com alerta conhecido, corante não especificado e medicamento sem excipientes produzem explicações distintas. Informação ausente não apaga risco conhecido.

**Pendente:** condições exatas, textos e aprovação clínica dos exemplos. Dependência: P-001.

## P-003 — Comunicação visual e explicação

**Origem:** usuário pediu barra de risco logo abaixo dos botões, espaço para explicar o resultado e considerou faixa fina de quatro cores destacando a posição. A imagem apresentada era estudo visual no Google AI Studio, não tela implementada.

**Proposta:** resultado perceptível no topo, motivo e próxima ação visíveis, detalhes de evidência expansíveis. Não depender apenas de cor.

**Sugestão do assistente, ainda não aprovada:** vermelho para risco documentado aplicável; laranja para precaução de perfil/divergência relevante; amarelo para condição ou informação pendente; verde para ausência de alerta nas condições verificadas. Esta associação exige revisão: incerteza de leitura e risco clínico são dimensões diferentes, não uma escala quantitativa contínua.

**Aceite:** o usuário distingue risco identificado, incompletude e precaução; alerta importante permanece destacado mesmo com leitura incompleta; texto não promete segurança absoluta. Avaliar se a faixa em transição confunde severidade com confiança antes de adotá-la.

**Pendente:** significados e precedência dos estados, texto, acessibilidade e mockup. Dependências: P-001/P-002.

## P-004 — Identificar produto e conferir composição

**Origem:** usuário propôs obter nome/descrição por código de barras, frente da embalagem ou informação falada, inclusive para rótulos prateados com reflexo.

**Proposta:** buscar nome, marca e variante; permitir foto frontal, texto ou áudio como alternativas. Não bloquear análise da lista só porque o produto não foi identificado. Manter separadas identidade, composição online e composição lida no lote em mãos.

Resultado online sem alerta pode pedir conferência da embalagem, com fonte e data quando disponíveis; não equivale a aprovação do lote. Restrição conhecida continua visível. Conferência manual deve orientar termos concretos a procurar, sem presumir texto encoberto pelo reflexo.

**Aceite:** produto desconhecido, variante ambígua, composição online divergente e rótulo parcial têm caminhos de continuação; não inventar dados ausentes. Dependências: P-002/P-003.

**Pendente:** regra exata do amarelo de conferência, identificação mínima e tratamento de divergências.

## P-005 — Investigar com a IA do usuário

**Origem:** intenção original de “abrir com minha IA”, retomada para dúvidas, embalagens difíceis e pesquisa contextualizada.

**Proposta:** ação explícita prepara identidade do produto, texto/fotos disponíveis, origem dos dados, resultado do motor, dúvida concreta e fontes pertinentes. Usuário pode revisar o conteúdo antes de compartilhar; não enviar dados pessoais de saúde desnecessários. A IA auxilia extração e investigação, sem alterar silenciosamente regras ou aprovar consumo.

**Aceite:** funcionar com copiar/colar quando compartilhamento ou link não forem suportados; esclarecer necessidade de internet/conta conforme destino; consulta manual continua disponível. Texto parcialmente lido não é completado como fato sem confirmação.

**Pendente:** payload mínimo, destinos efetivamente suportados, tratamento de retorno e privacidade. Não autoriza API paga, backend ou instalação de modelos. Dependência: P-004.

## P-006 — Voz como alternativa de entrada

**Origem:** usuário sugeriu falar nome/marca ou ler a composição em voz alta.

**Proposta:** mostrar transcrição para confirmação, especialmente nomes químicos/códigos; distinguir fala sobre identidade de leitura dos ingredientes. Recursos dependem de plataforma e podem exigir rede; não prometer voz offline universal.

**Aceite:** transcrição incerta, permissão negada e ausência de serviço oferecem correção por texto/foto; entrada de áudio não é tratada como composição completa automaticamente.

**Pendente:** viabilidade por plataforma, privacidade do áudio e escopo mínimo. Dependências: P-004/P-005.

## P-007 — Particularidades individuais da deficiência

**Origem:** usuário perguntou sobre variantes mediterrânea/africana, como conhecer a própria variante e quando alertar.

**Proposta de pesquisa:** permitir “desconhecida” e avaliar se atividade enzimática confirmada, histórico e condições da recomendação justificam campos/avisos específicos. Não inferir variante por origem geográfica nem usar rótulo de variante como autorização genérica.

**Aceite:** documentar a fonte clínica e o propósito de cada dado antes de criar perfil; pedir dados somente quando necessários; ausência de variante não torna todo resultado vermelho.

**Pendente:** revisão clínica, dados mínimos e avisos contextuais. A pesquisa da conversa não foi convertida em regra aprovada. Dependência: P-001.

## P-008 — Revisão periódica e distribuição acessível

**Origem:** intenção inicial de base atualizável, gratuidade, uso por cuidadores, revisão aproximadamente trimestral e possível distribuição em loja.

**Proposta:** definir revisão periódica com detecção de mudanças, decisão humana e histórico de versões; separar atualização clínica de entrega do software. Preservar uso simples e minimizar custos recorrentes.

**Aceite:** responsável, fontes, data da última revisão, pendências, política de atualização e mecanismo de recuperação verificáveis. Prazo periódico não significa revisão feita. Limites de hospedagem e recursos por aparelho devem ser demonstrados.

**Pendente:** prioridade e frequência, manutenção, Android e offline. Não reabre automaticamente o offline adiado, nem autoriza publicação. Referência: [plano de correção](../planejamento/plano-correcao.md).

## P-009 — Aplicar o design Clinical Reassurance às funções existentes

**Estado:** aprovada na revisão humana e autorizada para publicação no GitHub Pages em 31/10/2026; revisão clínica não realizada.

**Origem:** o usuário forneceu o projeto Stitch, pediu reunir design e código e, após avaliar a suficiência dos arquivos, solicitou implementar agora com Git de forma estruturada e reversível.

**Escolha de implementação:** adaptar os componentes atuais ao tema claro do HTML aprovado, com tokens CSS, Plus Jakarta Sans local e recursos não pessoais. Reutilizar os fluxos existentes em vez de importar views demonstrativas ou instalar Tailwind. Preservar scanner, despensa, consulta, SOS, Sobre e modais.

**Alternativas consideradas:** copiar os TSX do Stitch exigiria Tailwind e traria dados de demonstração e ações sem integração; executar os scripts sobrescreveria caminhos existentes. Uma segunda árvore de views deixaria duas interfaces concorrentes. O corte visual foi aplicado aos componentes atuais em worktree isolado.

**Aceite:** aparência Clinical Reassurance, navegação e controles acessíveis em mobile/desktop, dados persistidos e estados do motor preservados, recursos visuais locais, sem reclassificação clínica ou promessa nova de offline integral.

**Limites:** não implementa P-001 a P-008, novos cadastros clínicos, QR ilustrativo, backend, contas, OCR remoto, commits ou publicação. Decisão: [D-003](decisoes.md#d-003--implementar-o-redesign-em-branch-isolada). Execução e evidências: [RL-006](../revisoes/006-redesign-clinical-reassurance.md).
