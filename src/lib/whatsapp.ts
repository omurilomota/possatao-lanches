import { formatBRL, PAYMENT_LABELS, STORE, waLink } from "./config";

export type WaOrderInput = {
  number: string;
  createdAt: Date;
  customerName: string;
  phone: string;
  orderType: string;
  addressLine: string | null;
  items: {
    quantity: number;
    name: string;
    unitPriceCents: number;
    addons: { name: string; priceCents: number }[];
    notes: string | null;
  }[];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  paymentMethod: string;
  changeForCents: number | null;
  notes: string | null;
};

const LINE = "──────────────────";

/** Mensagem de pedido formatada, no padrão combinado com a loja. */
export function buildOrderMessage(o: WaOrderInput): string {
  const time = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(o.createdAt);

  const rows: string[] = [];
  rows.push(`🍔 *NOVO PEDIDO #${o.number}* — ${time}`);
  rows.push(`👤 ${o.customerName} · ${o.phone}`);
  rows.push(
    o.orderType === "entrega"
      ? `📍 ${o.addressLine ?? "Endereço a combinar"}`
      : `🏪 Retirada no balcão — ${STORE.street}`
  );
  rows.push(LINE);

  for (const it of o.items) {
    rows.push(
      `${it.quantity}x ${it.name} — ${formatBRL(it.unitPriceCents * it.quantity)}`
    );
    for (const ad of it.addons) {
      rows.push(`   + ${ad.name} (${formatBRL(ad.priceCents)})`);
    }
    if (it.notes) rows.push(`   _Obs: ${it.notes}_`);
  }

  rows.push(LINE);
  rows.push(`Subtotal: ${formatBRL(o.subtotalCents)}`);
  if (o.orderType === "entrega") {
    rows.push(
      `Entrega: ${o.deliveryFeeCents === 0 ? "GRÁTIS 🛵" : formatBRL(o.deliveryFeeCents)}`
    );
  }
  const pay = PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod;
  rows.push(`*TOTAL: ${formatBRL(o.totalCents)}* (${pay})`);
  if (o.paymentMethod === "dinheiro" && o.changeForCents) {
    rows.push(`💵 Troco para: ${formatBRL(o.changeForCents)}`);
  }
  if (o.paymentMethod === "pix") {
    rows.push("🔑 Me envia a chave Pix, por favor!");
  }
  if (o.notes) rows.push(`📝 ${o.notes}`);
  rows.push("");
  rows.push("_Pedido gerado pelo site do Possatão_ ✅");
  return rows.join("\n");
}

export function buildOrderWaLink(o: WaOrderInput): string {
  return waLink(buildOrderMessage(o));
}