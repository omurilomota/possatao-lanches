import { db } from "@/db";
import { orders, orderItems, customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { RULES } from "@/lib/config";
import { buildOrderWaLink } from "@/lib/whatsapp";
import { isAdmin, orderNumber } from "@/lib/server";

export const dynamic = "force-dynamic";

const VALID_STATUS = ["novo", "preparo", "rota", "concluido", "cancelado"];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.token, token));
  if (!order) return Response.json({ error: "Pedido não encontrado" }, { status: 404 });

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const [cust] = await db.select().from(customers).where(eq(customers.phone, order.phone));

  const addressLine =
    order.orderType === "entrega"
      ? `${order.street}, ${order.number}${order.complement ? ` (${order.complement})` : ""} — ${order.district}`
      : null;

  const waUrl = buildOrderWaLink({
    number: orderNumber(order.id),
    createdAt: order.createdAt,
    customerName: order.customerName,
    phone: order.phone,
    orderType: order.orderType,
    addressLine,
    items: items.map((l) => ({
      quantity: l.quantity,
      name: l.name,
      unitPriceCents: l.unitPriceCents,
      addons: l.addonsJson,
      notes: l.notes,
    })),
    subtotalCents: order.subtotalCents,
    deliveryFeeCents: order.deliveryFeeCents,
    totalCents: order.totalCents,
    paymentMethod: order.paymentMethod,
    changeForCents: order.changeForCents,
    notes: order.notes,
  });

  const spent = cust?.totalSpentCents ?? order.totalCents;

  return Response.json({
    token: order.token,
    number: orderNumber(order.id),
    status: order.status,
    orderType: order.orderType,
    customerName: order.customerName,
    subtotalCents: order.subtotalCents,
    deliveryFeeCents: order.deliveryFeeCents,
    totalCents: order.totalCents,
    paymentMethod: order.paymentMethod,
    changeForCents: order.changeForCents,
    createdAt: order.createdAt.toISOString(),
    waLink: waUrl,
    stampsEarned: Math.floor(spent / RULES.stampValueCents),
    centsToNextStamp: RULES.stampValueCents - (spent % RULES.stampValueCents),
    items: items.map((l) => ({
      name: l.name,
      quantity: l.quantity,
      unitPriceCents: l.unitPriceCents,
      addons: l.addonsJson,
      notes: l.notes,
    })),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  if (!isAdmin(req)) return Response.json({ error: "PIN inválido" }, { status: 401 });
  const { token } = await params;
  const body = (await req.json()) as { status?: string };
  if (!body.status || !VALID_STATUS.includes(body.status)) {
    return Response.json({ error: "Status inválido" }, { status: 422 });
  }
  const [updated] = await db
    .update(orders)
    .set({ status: body.status })
    .where(eq(orders.token, token))
    .returning();
  if (!updated) return Response.json({ error: "Pedido não encontrado" }, { status: 404 });
  return Response.json({ ok: true, status: updated.status });
}