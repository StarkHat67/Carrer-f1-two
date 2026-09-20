# APEX Career

Simulador web de carreira em monopostos. O jogador começa aos 16 anos na Fórmula 4 Brasil e constrói um universo próprio a partir do estado inicial de 2026.

## O que já funciona

- Conta e sessão persistente.
- Vários saves independentes por usuário.
- Catálogo-base 2026 com nomes de F1, F2, F3 e F4 Brasil.
- 89 pilotos e 35 equipes no catálogo inicial.
- Sem fotos, logos oficiais ou geração de imagens.
- Criação transacional da carreira.
- Cinco estilos de pilotagem com atributos iniciais diferentes.
- F4 Brasil com calendário de 7 etapas.
- Qualificação + três corridas por etapa.
- Grid invertido na corrida curta.
- Pontos, melhor volta, vitórias, pódios e poles persistidos.
- Resultados de etapas concluídas podem ser reabertos na tela da temporada.
- Confiança, experiência e reputação recebem evolução básica após cada etapa.
- RLS protegendo os dados de cada save.

Os ratings de pilotos e equipes são valores de balanceamento do jogo, não classificações oficiais.

As fontes usadas para o catálogo estão em `docs/DATA_SOURCES.md`.

## Banco

Use um projeto Supabase separado e vazio. Aplique, nesta ordem:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_game_functions.sql`
4. `supabase/seed/001_initial_seed.sql`

Depois copie `.env.example` para `.env` e preencha apenas a URL do projeto e a chave pública/publishable (ou anon legada). Nunca use `service_role` no frontend.

## Rodar

```bash
npm install
npm run dev
```

Verificação:

```bash
npm run lint
npm run build
```

A versão atual não depende de Gemini, geração de imagens ou qualquer API paga. Ela foi desenhada para funcionar usando apenas os planos gratuitos das ferramentas escolhidas. Se um limite gratuito for atingido, a solução esperada é otimizar/pausar — não ativar cobrança automaticamente.
