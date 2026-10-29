import "dotenv/config";
import { db, pool } from "../src/db";
import {
  categories,
  addons,
  menuItems,
  customers,
  orders,
  orderItems,
} from "../src/db/schema";
import { sql } from "drizzle-orm";

/**
 * Seed do cardápio de exemplo (baseado no dossiê público do Possatão).
 * Preços ilustrativos — substituir pelo cardápio oficial do Willian.
 * Rode: npx tsx scripts/seed.ts  (use --force para recriar tudo)
 */
async function main() {
  const force = process.argv.includes("--force");
  const existing = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(menuItems);
  if ((existing[0]?.n ?? 0) > 0 && !force) {
    console.log("Cardápio já existe — seed ignorado (use --force).");
    return;
  }

  console.log("Limpando tabelas…");
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(customers);
  await db.delete(menuItems);
  await db.delete(addons);
  await db.delete(categories);

  console.log("Criando categorias…");
  const cats = await db
    .insert(categories)
    .values([
      { name: "Lanches", slug: "lanches", icon: "beef", sortOrder: 1 },
      { name: "No Pão Francês", slug: "pao-frances", icon: "sandwich", sortOrder: 2 },
      { name: "Hot Dogs", slug: "hot-dogs", icon: "utensils-crossed", sortOrder: 3 },
      { name: "Porções", slug: "porcoes", icon: "utensils", sortOrder: 4 },
      { name: "Combos", slug: "combos", icon: "package", sortOrder: 5 },
      { name: "Bebidas", slug: "bebidas", icon: "cup-soda", sortOrder: 6 },
      { name: "Sobremesas", slug: "sobremesas", icon: "cake", sortOrder: 7 },
    ])
    .returning();
  const cat = (slug: string) => cats.find((c) => c.slug === slug)!.id;

  console.log("Criando itens…");
  await db.insert(menuItems).values([
    // Lanches
    { categoryId: cat("lanches"), slug: "mc-passatao", name: "MC Passatão", priceCents: 2800, featured: true, tag: "O mais pedido", imageUrl: "/images/mc-passatao.jpg", sortOrder: 1, description: "O queridinho da casa: dois hambúrgueres caseiros, queijo, alface, picles e o molho especial do Possatão no pão de três andares." },
    { categoryId: cat("lanches"), slug: "megatron", name: "Megatron", priceCents: 3800, featured: true, tag: "Tamanho lenda", imageUrl: "/images/megatron.jpg", sortOrder: 2, description: "O lanche grande que virou lenda: 2 carnes, ovo, bacon, presunto, queijo, salada completa e batata palha. Segura com as duas mãos." },
    { categoryId: cat("lanches"), slug: "x-bacon", name: "X-Bacon", priceCents: 2400, imageUrl: "/images/x-bacon.jpg", sortOrder: 3, description: "Pão macio, hambúrguer caseiro de 150 g, muito bacon crocante e queijo derretido escorrendo." },
    { categoryId: cat("lanches"), slug: "x-salada", name: "X-Salada", priceCents: 1900, sortOrder: 4, description: "O clássico que nunca falha: hambúrguer caseiro, queijo, alface, tomate e maionese da casa." },
    { categoryId: cat("lanches"), slug: "x-tudo", name: "X-Tudo", priceCents: 3200, tag: "Completo", sortOrder: 5, description: "Tudo o que você tem direito: carne, ovo, bacon, presunto, queijo, milho, salada e batata palha." },
    { categoryId: cat("lanches"), slug: "x-frango", name: "X-Frango c/ Catupiry", priceCents: 2200, sortOrder: 6, description: "Frango grelhado e desfiado, catupiry cremoso, queijo e milho verde." },
    { categoryId: cat("lanches"), slug: "x-calabresa", name: "X-Calabresa", priceCents: 2300, sortOrder: 7, description: "Calabresa acebolada na chapa, queijo derretido e vinagrete fresquinho." },
    // Pão francês
    { categoryId: cat("pao-frances"), slug: "carne-pao-frances", name: "Carne no Pão Francês", priceCents: 2100, tag: "Tem no Possatão!", sortOrder: 1, description: "Hambúrguer caseiro no pão francês crocante com queijo e maionese temperada. Lanche no pão francês? Tem no Possatão!" },
    { categoryId: cat("pao-frances"), slug: "frango-pao-frances", name: "Frango c/ Catupiry no Pão Francês", priceCents: 2300, sortOrder: 2, description: "Frango desfiado com catupiry no pão francês quentinho, direto da chapa." },
    // Hot dogs
    { categoryId: cat("hot-dogs"), slug: "hot-dog-completo", name: "Hot Dog Completo", priceCents: 1600, imageUrl: "/images/hot-dog.jpg", tag: "Do jeito brasileiro", sortOrder: 1, description: "Pão, salsicha ao molho, purê, milho, ervilha, batata palha, ketchup e mostarda." },
    { categoryId: cat("hot-dogs"), slug: "hot-dog-simples", name: "Hot Dog Simples", priceCents: 1200, sortOrder: 2, description: "Pão, salsicha ao molho, batata palha, ketchup e mostarda." },
    // Porções
    { categoryId: cat("porcoes"), slug: "porcao-mista", name: "Porção Mista da Casa", priceCents: 4500, featured: true, tag: "Serve 2–3", imageUrl: "/images/porcao-mista.jpg", sortOrder: 1, description: "Batata frita, calabresa acebolada e frango a passarinho na mesma bandeja. A pedida certa pra dividir (ou não)." },
    { categoryId: cat("porcoes"), slug: "batata-cheddar-bacon", name: "Batata c/ Cheddar e Bacon", priceCents: 2800, imageUrl: "/images/batata-cheddar.jpg", tag: "Queridinha", sortOrder: 2, description: "Porção generosa de batata frita coberta com cheddar cremoso e bacon crocante." },
    { categoryId: cat("porcoes"), slug: "batata-frita", name: "Batata Frita", priceCents: 1800, sortOrder: 3, description: "Crocante por fora, macia por dentro. Porção generosa pra acompanhar qualquer lanche." },
    { categoryId: cat("porcoes"), slug: "calabresa-acebolada", name: "Calabresa Acebolada", priceCents: 2600, sortOrder: 4, description: "Calabresa fatiada na chapa com cebola dourada e limão." },
    { categoryId: cat("porcoes"), slug: "frango-passarinho", name: "Frango a Passarinho", priceCents: 3200, sortOrder: 5, description: "Pedaços de frango fritos no ponto, temperados com alho e limão." },
    { categoryId: cat("porcoes"), slug: "iscas-frango", name: "Iscas de Frango Empanadas", priceCents: 2900, sortOrder: 6, description: "Iscas empanadas super crocantes com molho da casa." },
    // Combos
    { categoryId: cat("combos"), slug: "combo-burguer", name: "Combo Burguer", priceCents: 3500, featured: true, tag: "Economize", imageUrl: "/images/combo.jpg", sortOrder: 1, description: "X-Salada + batata frita + Coca 1L. O trio campeão que mata qualquer fome." },
    { categoryId: cat("combos"), slug: "combo-megatron", name: "Combo Megatron", priceCents: 4800, sortOrder: 2, description: "Megatron + batata frita + refrigerante 1L. Só pra quem tem fome de verdade." },
    { categoryId: cat("combos"), slug: "combo-casal", name: "Combo Casal", priceCents: 6900, tag: "Entrega grátis", sortOrder: 3, description: "2 X-Bacon + batata com cheddar e bacon + 2 refris lata. Noite garantida." },
    // Bebidas
    { categoryId: cat("bebidas"), slug: "suco-acerola", name: "Suco Natural de Acerola", priceCents: 900, imageUrl: "/images/sucos.jpg", tag: "Fruta da terra", sortOrder: 1, description: "Feito na hora com a fruta da nossa terra — Junqueirópolis, capital nacional da acerola." },
    { categoryId: cat("bebidas"), slug: "suco-laranja", name: "Suco Natural de Laranja", priceCents: 900, sortOrder: 2, description: "Laranja espremida na hora, geladinha, 400 ml." },
    { categoryId: cat("bebidas"), slug: "coca-2l", name: "Coca-Cola 2L", priceCents: 1200, sortOrder: 3, description: "Garrafa 2 litros, gelada." },
    { categoryId: cat("bebidas"), slug: "coca-1l", name: "Coca-Cola 1L", priceCents: 900, sortOrder: 4, description: "Garrafa 1 litro, gelada." },
    { categoryId: cat("bebidas"), slug: "refri-lata", name: "Refrigerante Lata", priceCents: 600, sortOrder: 5, description: "Coca, Guaraná ou Fanta — 350 ml, estupidamente gelado." },
    { categoryId: cat("bebidas"), slug: "cerveja-long-neck", name: "Cerveja Long Neck", priceCents: 900, tag: "+18", sortOrder: 6, description: "Estupidamente gelada, do jeito que o Possatão promete. Venda proibida para menores de 18 anos." },
    { categoryId: cat("bebidas"), slug: "agua", name: "Água Mineral", priceCents: 400, sortOrder: 7, description: "Com ou sem gás, 500 ml." },
    // Sobremesas
    { categoryId: cat("sobremesas"), slug: "pudim", name: "Pudim da Casa", priceCents: 800, sortOrder: 1, description: "Fatia generosa de pudim de leite com calda de caramelo." },
    { categoryId: cat("sobremesas"), slug: "milkshake", name: "Milkshake 400ml", priceCents: 1400, sortOrder: 2, description: "Chocolate, morango ou ovomaltine, cremoso de verdade." },
  ]);

  console.log("Criando adicionais…");
  await db.insert(addons).values([
    { name: "Bacon extra", priceCents: 400 },
    { name: "Cheddar extra", priceCents: 350 },
    { name: "Catupiry", priceCents: 400 },
    { name: "Ovo", priceCents: 250 },
    { name: "Hambúrguer extra 150 g", priceCents: 700 },
    { name: "Queijo extra", priceCents: 250 },
  ]);

  console.log("Criando pedidos de demonstração…");
  const now = Date.now();
  const demo = [
    {
      customerName: "João Marques", phone: "18997112233", orderType: "entrega",
      street: "Rua Rui Barbosa", number: "450", district: "Centro",
      paymentMethod: "pix", status: "novo", subtotalCents: 5000, deliveryFeeCents: 600,
      totalCents: 5600, createdAt: new Date(now - 6 * 60000),
      items: [
        { name: "MC Passatão", quantity: 1, unitPriceCents: 2800, addonsJson: [{ name: "Bacon extra", priceCents: 400 }], notes: "sem cebola" },
        { name: "Batata Frita", quantity: 1, unitPriceCents: 1800, addonsJson: [], notes: null },
      ],
    },
    {
      customerName: "Noemí Bonfim", phone: "18998445566", orderType: "entrega",
      street: "Av. Sete de Setembro", number: "1237", district: "Centro",
      paymentMethod: "credito", status: "preparo", subtotalCents: 6900, deliveryFeeCents: 0,
      totalCents: 6900, createdAt: new Date(now - 22 * 60000),
      items: [
        { name: "Combo Casal", quantity: 1, unitPriceCents: 6900, addonsJson: [], notes: null },
      ],
    },
    {
      customerName: "Carlos Eduardo", phone: "18996778899", orderType: "retirada",
      street: null, number: null, district: null,
      paymentMethod: "dinheiro", status: "concluido", subtotalCents: 3800, deliveryFeeCents: 0,
      totalCents: 3800, createdAt: new Date(now - 70 * 60000),
      items: [
        { name: "Megatron", quantity: 1, unitPriceCents: 3800, addonsJson: [], notes: "capricha no molho" },
      ],
    },
  ];
  for (const d of demo) {
    const [o] = await db
      .insert(orders)
      .values({
        customerName: d.customerName, phone: d.phone, orderType: d.orderType,
        street: d.street, number: d.number, district: d.district,
        paymentMethod: d.paymentMethod, status: d.status,
        subtotalCents: d.subtotalCents, deliveryFeeCents: d.deliveryFeeCents,
        totalCents: d.totalCents, createdAt: d.createdAt,
        changeForCents: d.paymentMethod === "dinheiro" ? 5000 : null,
      })
      .returning();
    await db.insert(orderItems).values(d.items.map((it) => ({ ...it, orderId: o.id })));
    await db
      .insert(customers)
      .values({ phone: d.phone, name: d.customerName, totalSpentCents: d.totalCents, ordersCount: 1 })
      .onConflictDoNothing();
  }

  console.log("✅ Seed concluído: cardápio, adicionais e pedidos demo criados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => pool.end());