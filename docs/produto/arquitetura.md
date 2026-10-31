# Arquitetura e limites atuais

Mapa técnico iniciado por leitura estática em 30/10/2026, atualizado para a interface local em 31/10/2026. A [RL-006](../revisoes/006-redesign-clinical-reassurance.md) distingue verificações interativas do redesign, escopo clínico e limitações. Para decisões em discussão, leia [propostas](../governanca/propostas.md); para estado e evidências, [estado atual](../governanca/estado-atual.md).

## Superfícies

`src/App.tsx` e `src/components/Navigation.tsx` conectam scanner, despensa, consulta de remédios, cartão de emergência e tela Sobre. O aplicativo registra preferências de perfil e aceite no armazenamento do navegador. O desenho original também previa compartilhamento com cuidadores, leitura por voz e encaminhamento opcional à IA; a disponibilidade efetiva varia por recurso e plataforma.

A interface usa tokens Clinical Reassurance em `src/index.css`, sobre os componentes React existentes, sem dependência de Tailwind. Fonte Plus Jakarta Sans e logo são recursos locais empacotados pelo Vite. O cabeçalho expõe perfil/sincronização em seção expansível e atalho para o SOS existente; a navegação mantém as cinco abas. O redesign não cria perfil de paciente fictício, novas regras ou funções demonstrativas do Stitch.

## Leitura e análise

- `ScannerScreen.tsx` conecta entrada textual, leitura de imagem, código de barras, despensa e encaminhamento à IA. `imageOcr.ts` contém pré-processamento e extração de texto; a leitura depende de recursos e APIs disponíveis.
- `normalizer.ts`, `completenessGate.ts` e `ruleEngine.ts` normalizam texto, avaliam completude e aplicam regras. Detecção e completude não provam leitura fiel de toda a embalagem; informação insuficiente e alerta detectado são condições distintas.
- `openFoodFacts.ts` consulta dados colaborativos por EAN. Composição online pode diferir do pacote em mãos. A coerência entre resultados e conferência está prevista na [fase 2 do plano de correção](../planejamento/plano-correcao.md).
- `aiHandoff.ts` prepara contexto e usa compartilhamento quando disponível; destinos externos, contas e transferência de dados exigem verificação. `voiceAssistant.ts` utiliza recursos de voz do navegador quando disponíveis. Nenhuma integração universal ou funcionamento offline de voz foi comprovado nesta revisão.

## Base e persistência

`src/data/rules.json` é a base fonte; `src/data/defaultRules.ts` a carrega. `rulesSync.ts` implementa validação e seleção da base armazenada. `public/g6pd_rules.json` é cópia de distribuição gerada por `npm run rules:sync` e pelo prebuild. Despensa usa `pantryStorage.ts` e armazenamento do navegador. Revisar o código e o plano antes de presumir sincronização reativa, autenticação ou aprovação de itens.

A proveniência e as lacunas clínicas são responsabilidade de [docs/clinica/base-clinica.md](../clinica/base-clinica.md). Nomes legados de perfis e categorias no código não demonstram endosso institucional ou segurança clínica. Não se deve alterar classificações por inferência documental.

## Limites e evolução

O [plano de correção](../planejamento/plano-correcao.md) governa as correções conectadas e o [checklist](../planejamento/checklist-correcao.md) acompanha a execução; a [segunda correção](../planejamento/correcao-fase-1.md) documenta o bloco técnico anterior. Offline integral, empacotamento Android e publicação não são declarados concluídos por este mapa. Uma leitura estática não prova comportamento em dispositivo real.

O histórico original detalha intenções como transparência do texto lido, atenção a excipientes, acesso para cuidadores e atualização da base. As propostas atuais precisam de decisões específicas; o mapa não aprova um novo fluxo, nível de risco ou tecnologia de IA.
