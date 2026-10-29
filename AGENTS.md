# AGENTS.md — Possatão Lanches

## Contexto

Cardápio digital com checkout, delivery, acompanhamento de pedido por token e painel administrativo com PIN. Este repositório é uma **demonstração pública**: contatos, documentos e dados de clientes são fictícios. Não trate este projeto como sistema de produção sem antes revisar autenticação, permissões, backups e LGPD.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- PostgreSQL + Drizzle ORM
- Tailwind CSS 4

## Comandos

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
```

Rode typecheck, testes e build antes de concluir qualquer alteração.

## Arquitetura

| Caminho | Responsabilidade |
| --- | --- |
| `src/app/` | Rotas e API |
| `src/components/` | Cardápio, checkout e painel |
| `src/db/` | Schema Drizzle |
| `src/lib/` | Configuração, WhatsApp e tipos |

## Regras de dados

1. Nunca insira telefone, WhatsApp, e-mail, endereço, CNPJ, redes sociais ou documentos reais de clientes.
2. Os contatos fictícios ficam em `src/lib/config.ts`. Centralize novas alterações lá.
3. Não remova avisos de demonstração sem substituir os dados por dados reais autorizados.
4. Senhas e PINs de demonstração são públicos por definição. Nunca os trate como segurança real.
5. Dados de seed devem ser idempotentes e claramente fictícios.

## Convenções

- TypeScript estrito; evite `any` gratuito.
- Componentes em PascalCase; funções utilitárias em camelCase.
- Preserve a identidade visual existente.
- Imagens com `alt` descritivo e `loading="lazy"` quando abaixo da dobra.
- Um único `h1` por página; navegação por teclado e foco visível.
- Não adicione dependência sem justificar.

## Git

Gitflow + Gitmoji:

- `main`: produção, tag `vX.Y.Z`.
- `develop`: integração.
- `feature/*`: funcionalidades.
- `hotfix/*`: correções urgentes.

Formato de commit: `<emoji> <tipo>: <descrição no imperativo>`.

## Deploy

Vercel, framework Next.js, build `npm run build`. Configure as variáveis de ambiente no painel; nunca commite `.env.local`.
