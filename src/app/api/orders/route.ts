import { db } from "@/db";
import { orders, orderItems, menuItems, addons, customers } from "@/db/schema";
import { and, desc, eq, gte, inArray, ne, sql } from "drizzle-orm";
import { NEIGHBORHOODS, RULES } from "@/lib/config";
import { buildOrderWaLink } from "@/lib/whatsapp";
import { isAdmin, normalizePhone, orderNumber } from "@/lib/server";
import type { CheckoutPayload } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: CheckoutPayload;
  try {
    body = (await req.json()) as CheckoutPayload;
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const name = (body.customerName ?? "").trim();
  const phone = normalizePhone(body.phone ?? "");
  if (name.length < 2) {
    return Response.json({ error: "Informe seu nome." }, { status: 422 });
  }
  if (phone.length < 10 || phone.length > 13) {
    return Response.json({ error: "Informe um WhatsApp válido com DDD." }, { status: 422 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return Response.json({ error: "Sua sacola está vazia." }, { status: 422 });
  }
  if (!["pix", "credito", "debito", "dinheiro"].includes(body.paymentMethod)) {
    return Response.json({ error: "Forma de pagamento inválida." }, { status: 422 });
  }

  const orderType = body.orderType === "retirada" ? "retirada" : "entrega";
  let district: string | null = null;
  let feeCents = 0;

  if (orderType === "entrega") {
    if (!(body.street ?? "").trim() || !(body.number ?? "").trim()) {
      return Response.json({ error: "Informe rua e número para entrega." }, { status: 422 });
    }
    const hood = NEIGHBORHOODS.find((n) => n.name === body.district);
    if (!hood) {
      return Response.json({ error: "Selecione o bairro de entrega." }, { status: 422 });
    }
    district = hood.name;
  }

  // Recalcula preços no servidor — nunca confia no cliente
  const ids = [...new Set(body.items.map((i) => Number(i.itemId)))];
  const dbItems = await db.select().from(menuItems).where(inArray(menuItems.id, ids));
  const dbAddons = await db.select().from(addons).where(eq(addons.active, true));

  const lines: {
    menuItemId: number;
    name: string;
    quantity: number;
    unitPriceCents: number;
    addonsJson: { name: string; priceCents: number }[];
    notes: string | null;
  }[] = [];

  for (const it of body.items) {
    const item = dbItems.find((d) => d.id === Number(it.itemId));
    if (!item) return Response.json({ error: "Item não encontrado no cardápio." }, { status: 422 });
    if (!item.available) {
      return Response.json({ error: `"${item.name}" está esgotado no momento.` }, { status: 422 });
    }
    const qty = Math.max(1, Math.min(20, Math.floor(Number(it.quantity) || 1)));
    const chosen = (it.addonIds ?? [])
      .map((aid) => dbAddons.find((a) => a.id === Number(aid)))
      .filter((a): a is NonNullable<typeof a> => Boolean(a));
    const unit = item.priceCents + chosen.reduce((s, a) => s + a.priceCents, 0);
    lines.push({
      menuItemId: item.id,
      name: item.name,
      quantity: qty,
      unitPriceCents: unit,
      addonsJson: chosen.map((a) => ({ name: a.name, priceCents: a.priceCents })),
      notes: (it.notes ?? "").trim().slice(0, 200) || null,
    });
  }

  const subtotalCents = lines.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);

  if (orderType === "entrega") {
    if (subtotalCents < RULES.minOrderCents) {
      return Response.json(
        { error: `Pedido mínimo para entrega: R$ ${(RULES.minOrderCents / 100).toFixed(2).replace(".", ",")}.` },
        { status: 422 }
      );
    }
    const hood = NEIGHBORHOODS.find((n) => n.name === district)!;
    feeCents = subtotalCents >= RULES.freeDeliveryFromCents ? 0 : hood.feeCents;
  }

  const totalCents = subtotalCents + feeCents;
  const changeForCents =
    body.paymentMethod === "dinheiro" && body.changeForCents && body.changeForCents > 0
      ? Math.floor(body.changeForCents)
      : null;

  if (changeForCents !== null && changeForCents < totalCents) {
    return Response.json(
      { error: "O troco informado é menor que o total do pedido." },
      { status: 422 }
    );
  }

  const [order] = await db
    .insert(orders)
    .values({
      customerName: name,
      phone,
      orderType,
      street: orderType === "entrega" ? (body.street ?? "").trim() : null,
      number: orderType === "entrega" ? (body.number ?? "").trim() : null,
      district,
      complement: (body.complement ?? "").trim().slice(0, 120) || null,
      paymentMethod: body.paymentMethod,
      changeForCents,
      notes: (body.notes ?? "").trim().slice(0, 300) || null,
      subtotalCents,
      deliveryFeeCents: feeCents,
      totalCents,
    })
    .returning();

  await db.insert(orderItems).values(lines.map((l) => ({ ...l, orderId: order.id })));

  // Fidelidade: acumula gasto por telefone (1 cupom a cada R$ 60)
  const [cust] = await db
    .insert(customers)
    .values({ phone, name, totalSpentCents: totalCents, ordersCount: 1 })
    .onConflictDoUpdate({
      target: customers.phone,
      set: {
        name,
        totalSpentCents: sql`${customers.totalSpentCents} + ${totalCents}`,
        ordersCount: sql`${customers.ordersCount} + 1`,
      },
    })
    .returning();

  const addressLine =
    orderType === "entrega"
      ? `${order.street}, ${order.number}${order.complement ? ` (${order.complement})` : ""} — ${order.district}`
      : null;

  const waUrl = buildOrderWaLink({
    number: orderNumber(order.id),
    createdAt: order.createdAt,
    customerName: name,
    phone: body.phone,
    orderType,
    addressLine,
    items: lines.map((l) => ({
      quantity: l.quantity,
      name: l.name,
      unitPriceCents: l.unitPriceCents,
      addons: l.addonsJson,
      notes: l.notes,
    })),
    subtotalCents,
    deliveryFeeCents: feeCents,
    totalCents,
    paymentMethod: order.paymentMethod,
    changeForCents,
    notes: order.notes,
  });

  return Response.json({
    token: order.token,
    number: orderNumber(order.id),
    status: order.status,
    orderType,
    customerName: name,
    subtotalCents,
    deliveryFeeCents: feeCents,
    totalCents,
    paymentMethod: order.paymentMethod,
    changeForCents,
    createdAt: order.createdAt.toISOString(),
    waLink: waUrl,
    stampsEarned: Math.floor(cust.totalSpentCents / RULES.stampValueCents),
    centsToNextStamp: RULES.stampValueCents - (cust.totalSpentCents % RULES.stampValueCents),
    items: lines.map((l) => ({
      name: l.name,
      quantity: l.quantity,
      unitPriceCents: l.unitPriceCents,
      addons: l.addonsJson,
      notes: l.notes,
    })),
  });
}

// ── Painel admin: fila de pedidos + estatísticas ──────────────
export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return Response.json({ error: "PIN inválido" }, { status: 401 });
  }
  const since = new Date(Date.now() - 48 * 3600 * 1000);
  const list = await db
    .select()
    .from(orders)
    .where(gte(orders.createdAt, since))
    .orderBy(desc(orders.createdAt))
    .limit(100);

  const ids = list.map((o) => o.id);
  const items = ids.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids))
    : [];

  const todayStart = sql`(date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo')`;
  const [today] = await db
    .select({
      count: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(${orders.totalCents}), 0)::int`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, todayStart), ne(orders.status, "cancelado")));

  const active = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(inArray(orders.status, ["novo", "preparo", "rota"]));

  const top = await db
    .select({
      name: orderItems.name,
      qty: sql<number>`sum(${orderItems.quantity})::int`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(ne(orders.status, "cancelado"))
    .groupBy(orderItems.name)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(5);

  const [cust] = await db
    .select({
      count: sql<number>`count(*)::int`,
      stamps: sql<number>`coalesce(sum(floor(${customers.totalSpentCents} / ${RULES.stampValueCents})), 0)::int`,
    })
    .from(customers);

  return Response.json({
    orders: list.map((o) => ({
      ...o,
      number: orderNumber(o.id),
      streetNumber: o.number,
      items: items
        .filter((i) => i.orderId === o.id)
        .map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unitPriceCents: i.unitPriceCents,
          addons: i.addonsJson,
          notes: i.notes,
        })),
    })),
    stats: {
      todayCount: today?.count ?? 0,
      todayRevenueCents: today?.revenue ?? 0,
      avgTicketCents: today?.count ? Math.round((today?.revenue ?? 0) / today.count) : 0,
      activeCount: active[0]?.count ?? 0,
      customersCount: cust?.count ?? 0,
      stampsTotal: cust?.stamps ?? 0,
      topItems: top,
    },
  });
}
