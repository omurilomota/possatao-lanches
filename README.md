# Possatão Lanches

Cardápio digital e delivery para lanchonete.

> **Demonstração pública.** Telefones, WhatsApp, e-mail, endereço, CNPJ, redes sociais e dados de clientes são fictícios. Nenhum pedido, mensagem ou formulário é enviado a um canal real.

[**Ver demonstração**](https://possatao-lanches.vercel.app) · Next.js 16 (App Router) · React 19 · TypeScript · PostgreSQL + Drizzle ORM · Tailwind CSS 4

## O que tem

- Cardápio com categorias e adicionais
- Checkout com retirada ou entrega
- Acompanhamento do pedido por token
- Painel administrativo com PIN
- Página local de delivery

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- PostgreSQL + Drizzle ORM
- Tailwind CSS 4

## Rodando localmente

```bash
npm ci
cp .env.example .env.local
# edite .env.local com a sua connection string
npm run dev
```

Acesse `http://localhost:3000`.

## Variáveis de ambiente

| Variável | Obrigatória | Para que serve |
| --- | --- | --- |
| `DATABASE_URL` | Sim | Connection string PostgreSQL/Neon |
| `ADMIN_PIN` | Sim | PIN do painel administrativo |

## Banco de dados

PostgreSQL no Neon (banco `possato`). O schema fica em `src/db/schema.ts` e é aplicado com `npx drizzle-kit push`. Em produção, use uma connection string Neon com `sslmode=require`.

## Rotas

| Rota | Descrição |
| --- | --- |
| `/` | Home e destaques |
| `/cardapio` | Cardápio completo |
| `/checkout` | Fechamento do pedido |
| `/pedido/[token]` | Acompanhamento |
| `/admin` | Painel |
| `/delivery-junqueiropolis` | Página local de delivery |

## Testes e qualidade

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Deploy

O deploy é feito na Vercel. Configure as variáveis acima no painel do projeto, conecte o repositório e use `npm run build`.

## Estrutura

| Caminho | Responsabilidade |
| --- | --- |
| `src/app/` | Rotas e API |
| `src/components/` | Cardápio, checkout e painel |
| `src/db/` | Schema Drizzle |
| `src/lib/` | Configuração, WhatsApp e tipos |

## Licença

MIT — veja [LICENSE](LICENSE).
