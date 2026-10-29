# Como contribuir

Este é um projeto de portfólio. Contribuições são bem-vindas desde que preservem a proposta visual e a natureza demonstrativa do site.

## Fluxo

1. Crie uma branch a partir de `develop`: `feature/minha-melhoria`.
2. Rode `npm ci` e faça as alterações.
3. Antes de abrir o pull request, rode:

```bash
npm run typecheck
npm test
npm run build
```

4. Use commits no padrão Gitmoji: `<emoji> <tipo>: <descrição>`.
5. Abra o pull request para `develop` explicando o problema e a solução.

## Regras

- Não inclua dados reais de clientes, telefones, endereços, CNPJs ou credenciais.
- Não commite `.env.local`, `.next`, `dist`, `node_modules` ou arquivos de ferramentas locais.
- Preserve acessibilidade e responsividade.
- Mudanças visuais devem vir com uma breve justificativa.

## Licença

Ao contribuir, você concorda que a contribuição será licenciada sob a MIT.
