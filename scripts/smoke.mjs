import { execSync } from "node:child_process";

const BASE = process.env.SMOKE_BASE ?? "http://127.0.0.1:3000";
const DB = "postgresql://postgres:postgres@127.0.0.1:5432/app_db";
const psql = (q) => execSync(`psql "${DB}" -t -A -c "${q}"`).toString().trim();

const fails = [];
const ok = (cond, label) => {
  console.log(`${cond ? "PASS " : "FALHA"} ${label}`);
  if (!cond) fails.push(label);
};

const pages = [
  ["/", "FOME DE"],
  ["/cardapio", "CARD"],
  ["/delivery-junqueiropolis", "DELIVERY EM"],
  ["/checkout", "Abrindo sua sacola"],
  ["/admin", "Painel da Loja"],
  ["/pagina-que-nao-existe", "ESSA PÁGINA NÃO EXISTE"],
];

for (const [path, marker] of pages) {
  const res = await fetch(BASE + path);
  const text = await res.text();
  const expected = path.startsWith("/pagina") ? 404 : 200;
  ok(res.status === expected && text.includes(marker), `página ${path} (${res.status})`);
}

const home = await (await fetch(BASE + "/")).text();
ok(home.includes("lanches a partir de") && /R\$\s?19/.test(home), "hero com preço vindo do cardápio");
ok(!home.includes("Fecha às 0h20") || home.includes("00h20"), "horário 00h20 formatado");
ok(home.includes("marquee-track") && home.includes("não somos mais próximo à Santa Casa"), "marquee + aviso de endereço");

const menu = await (await fetch(BASE + "/api/menu")).json();
ok(menu.categories.length === 7 && menu.addons.length === 6, "cardápio (7 categorias / 6 adicionais)");
const item = menu.categories.flatMap((c) => c.items)[0];
const addon = menu.addons[0];

const post = (body) =>
  fetch(BASE + "/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const r1 = await post({
  customerName: "Revisão Final",
  phone: "(18) 99999-1111",
  orderType: "retirada",
  paymentMethod: "pix",
  items: [{ itemId: item.id, quantity: 1, addonIds: [addon.id] }],
});
const o1 = await r1.json();
ok(
  r1.status === 200 && o1.totalCents === item.priceCents + addon.priceCents,
  "retirada: adicional somado no servidor (cliente não define preço)"
);

const r2 = await post({
  customerName: "Revisão Final",
  phone: "18999992222",
  orderType: "entrega",
  street: "Rua A",
  number: "1",
  district: "Centro",
  paymentMethod: "pix",
  items: [{ itemId: item.id, quantity: 3, addonIds: [] }],
});
const o2 = await r2.json();
ok(r2.status === 200 && o2.deliveryFeeCents === 0, "entrega grátis acima de R$ 60");

const r3 = await post({
  customerName: "Revisão Final",
  phone: "18999993333",
  orderType: "retirada",
  paymentMethod: "dinheiro",
  changeForCents: 100,
  items: [{ itemId: item.id, quantity: 1, addonIds: [] }],
});
ok(r3.status === 422, "troco menor que o total é recusado");

const r4 = await post({
  customerName: "Revisão Final",
  phone: "18999995555",
  orderType: "entrega",
  street: "Rua A",
  number: "1",
  district: "Centro",
  paymentMethod: "pix",
  items: [{ itemId: menu.categories.flatMap((c) => c.items).find((i) => i.priceCents <= 600).id, quantity: 1, addonIds: [] }],
});
ok(r4.status === 422, "pedido abaixo do mínimo de entrega é recusado");

const adm = await (await fetch(BASE + "/api/orders", { headers: { "x-admin-pin": "2018" } })).json();
ok(adm.orders.length >= 2 && adm.stats.todayCount >= 2, "painel: fila + estatísticas do dia");

const unauth = await fetch(BASE + "/api/orders", { headers: { "x-admin-pin": "0000" } });
ok(unauth.status === 401, "painel protegido por PIN");

const pub = await (await fetch(`${BASE}/api/orders/${o2.token}`)).json();
ok(
  pub.status === "novo" && pub.waLink.startsWith("https://wa.me/5518999990108"),
  "acompanhamento público + link wa.me canônico"
);

const patch = (available) =>
  fetch(`${BASE}/api/menu-items/${item.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-admin-pin": "2018" },
    body: JSON.stringify({ available }),
  });
await patch(false);
const r5 = await post({
  customerName: "Revisão Final",
  phone: "18999994444",
  orderType: "retirada",
  paymentMethod: "pix",
  items: [{ itemId: item.id, quantity: 1, addonIds: [] }],
});
ok(r5.status === 422, "item esgotado bloqueado no pedido");
await patch(true);

ok((await (await fetch(BASE + "/sitemap.xml")).text()).includes("/cardapio"), "sitemap.xml");
ok((await (await fetch(BASE + "/robots.txt")).text()).includes("Disallow: /admin"), "robots.txt");
ok((await (await fetch(BASE + "/api/health")).json()).ok, "healthcheck");

psql(
  "DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_name = 'Revisão Final'); DELETE FROM orders WHERE customer_name = 'Revisão Final'; DELETE FROM customers WHERE name = 'Revisão Final';"
);
ok(psql("SELECT count(*) FROM orders").trim() === "3", "base limpa (3 pedidos de demonstração)");

console.log(fails.length ? `\n${fails.length} FALHA(S)` : "\nTUDO OK");
process.exit(fails.length ? 1 : 0);
