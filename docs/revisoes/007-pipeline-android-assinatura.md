# RL-007 — Correção do pipeline Android e assinatura de APK/AAB

Data: 31/10/2026
Categoria: support_tooling_only
Estado de execução: implementada e autorizada para cadastro de Secrets e push
Revisão humana: aprovada (Geraldo Toledo, 31/10/2026)
Revisão clínica: não se aplica (infraestrutura de CI/empacotamento Android)
Publicação: execução do workflow CI autorizada em 31/10/2026

## Problema, autorização e vínculos

O responsável pelo produto solicitou preparar a correção do pipeline Android e gerar a chave de assinatura para viabilizar o download de APK válido no GitHub Actions, em alinhamento aos itens `3.2.2` (Achado `#16`) e `3.2.3` (Achado `#17`) de `docs/planejamento/checklist-correcao.md` e `docs/planejamento/plano-correcao.md`.

Base observada: branch `feat/stitch-clinical-reassurance` / `origin/master` em `064682f`.

## Antes e depois

Antes:
- Não existia `capacitor.config.json` versionado no repositório (`npx cap add android || true` falhava silenciosamente).
- `.github/workflows/build-android-and-pages.yml` suprimia falhas com `|| true` e `|| echo "Gradle build step complete"`, empacotava a pasta web `dist/` dentro do artefato Android com `if-no-files-found: warn` e não assinava os binários de release.
- O job `build-android` dependia de `deploy-pages` e só executava em `workflow_dispatch`.

Depois:
- `capacitor.config.json` versionado com `appId: "br.com.g6pda.app"`, `appName: "G6PDApp"` e `webDir: "dist"`.
- `.github/workflows/build-android-and-pages.yml` com jobs `deploy-pages` e `build-android` independentes, versões fixadas do Capacitor (`@capacitor/*@6.2.0` compatíveis com JDK 17), sem supressão de erros (`|| true` removido), validação e decodificação de `ANDROID_KEYSTORE_BASE64`, compilação `assembleRelease bundleRelease`, alinhamento e assinatura (`zipalign` + `apksigner sign` v1/v2/v3 + `apksigner verify` para APK; `jarsigner` + `jarsigner -verify` para AAB) e upload separado de `G6PDApp-Android-APK` e `G6PDApp-Android-AAB` com `if-no-files-found: error` e sem `dist/`.
- Chave criptográfica PKCS#12 (`2048-bit RSA`, validade de 10.000 dias) gerada localmente fora do repositório Git, validada com `openssl pkcs12 -info`.

## Escopo e critérios de aceite

1. Versionar `capacitor.config.json` sem incluir credenciais ou caminhos locais.
2. Remover supressões de erro e `dist/` do artefato Android em `.github/workflows/build-android-and-pages.yml` (item `3.2.2` / Achado `#16`).
3. Condicionar a geração de APK e AAB release aos segredos `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` e `ANDROID_KEY_PASSWORD`, mantendo `deploy-pages` independente (item `3.2.3` / Achado `#17`).
4. Não incluir chaves privadas ou senhas no repositório Git.

## Execução e evidências

- Arquivos alterados/criados no worktree:
  - `capacitor.config.json`
  - `.github/workflows/build-android-and-pages.yml`
  - `docs/revisoes/007-pipeline-android-assinatura.md`
  - `docs/index.md`
  - `docs/governanca/estado-atual.md`
- Verificações executadas:
  - Validação de sintaxe JSON de `capacitor.config.json`.
  - Validação estrutural do keystore PKCS#12 gerado fora do repositório via `openssl pkcs12 -info -noout` (`MAC: sha1`, `pbeWithSHA1And3-KeyTripleDES-CBC`).
  - `git status` e `git diff --check` confirmando zero arquivos de chave privada no repositório e zero erros de formatação.
- Verificações omitidas e motivo:
  - Suíte de testes unitários e build Vite não reexecutados por se tratar de alteração `support_tooling_only` (pipeline CI e configuração Capacitor), conforme seção 4 de `CONTRIBUTING.md`.
  - Execução remota do job `build-android` no GitHub Actions depende do cadastro prévio dos 4 Secrets no GitHub e do push deste ajuste.
  - Item `3.2.1` (Achado `#15` — integração de plugins nativos ML Kit para câmera/OCR no Android) ainda não faz parte deste corte focado em empacotamento e assinatura (`3.2.2` e `3.2.3`).

## Avaliação

Aprovada por Geraldo Toledo em 31/10/2026, com autorização explícita para cadastrar os 4 Secrets no GitHub Actions e fazer push do pipeline.

## Passagem de contexto

Próxima ação concreta: cadastrar os 4 Secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`) no GitHub e autorizar o commit/push de `capacitor.config.json` e `.github/workflows/build-android-and-pages.yml` para disparar a compilação do APK assinado.
