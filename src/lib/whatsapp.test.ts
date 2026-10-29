import { describe, expect, it } from "vitest";
import { buildOrderMessage, buildOrderWaLink } from "./whatsapp";
import { formatBRL, getOpenStatus, STORE } from "./config";

const pedido = {
  number: "42",
  createdAt: new Date("2026-03-10T23:30:00Z"), // 20:30 em São Paulo
  customerName: "Maria",
  phone: "(18) 99999-0108",
  orderType: "entrega",
  addressLine: "Rua das Hortênsias, 75",
  items: [
    {
      quantity: 2,
      name: "X-Possatão",
      unitPriceCents: 2990,
      addons: [{ name: "Bacon extra", priceCents: 500 }],
      notes: "Sem cebola",
    },
    {
      quantity: 1,
      name: "Batata frita",
      unitPriceCents: 2490,
      addons: [],
      notes: null,
    },
  ],
  subtotalCents: 9470,
  deliveryFeeCents: 0,
  totalCents: 9470,
  paymentMethod: "dinheiro",
  changeForCents: 10000,
  notes: "Entregar no portão",
};

const plain = (value: string) => value.replace(/\u00a0/g, " ");

describe("buildOrderMessage", () => {
  const message = plain(buildOrderMessage(pedido));

  it("identifica o pedido e o horário de São Paulo", () => {
    expect(message).toContain("🍔 *NOVO PEDIDO #42* — 20:30");
    expect(message).toContain("👤 Maria · (18) 99999-0108");
  });

  it("lista itens, adicionais e observações", () => {
    expect(message).toContain("2x X-Possatão — R$ 59,80");
    expect(message).toContain("+ Bacon extra (R$ 5,00)");
    expect(message).toContain("_Obs: Sem cebola_");
    expect(message).toContain("1x Batata frita — R$ 24,90");
  });

  it("mostra entrega grátis, total, pagamento e troco", () => {
    expect(message).toContain("Entrega: GRÁTIS 🛵");
    expect(message).toContain("*TOTAL: R$ 94,70* (Dinheiro)");
    expect(message).toContain("💵 Troco para: R$ 100,00");
    expect(message).toContain("📝 Entregar no portão");
  });

  it("usa o endereço da loja na retirada", () => {
    const retirada = plain(
      buildOrderMessage({
        ...pedido,
        orderType: "retirada",
        addressLine: null,
        paymentMethod: "pix",
        changeForCents: null,
      }),
    );
    expect(retirada).toContain(`Retirada no balcão — ${STORE.street}`);
    expect(retirada).toContain("Me envia a chave Pix");
    expect(retirada).not.toContain("Troco para");
  });

  it("gera link wa.me com a mensagem codificada", () => {
    const link = buildOrderWaLink(pedido);
    expect(link.startsWith(`https://wa.me/${STORE.whatsappNumber}?text=`)).toBe(true);
    expect(plain(decodeURIComponent(link.split("text=")[1]))).toBe(message);
  });
});

describe("getOpenStatus", () => {
  it("abre às 17h", () => {
    expect(getOpenStatus(new Date("2026-03-10T20:00:00Z"))).toMatchObject({
      open: true,
      title: "Aberto agora",
      detail: "Fecha às 00h20",
    });
  });

  it("continua aberto depois da meia-noite até 00h20", () => {
    expect(getOpenStatus(new Date("2026-03-11T03:00:00Z")).open).toBe(true); // 00:00
    expect(getOpenStatus(new Date("2026-03-11T03:30:00Z"))).toMatchObject({
      open: false,
      detail: "Abre hoje às 17h",
    });
  });

  it("fecha durante a manhã e informa a abertura", () => {
    expect(getOpenStatus(new Date("2026-03-10T12:00:00Z"))).toMatchObject({
      open: false,
      title: "Fechado agora",
      detail: "Abre hoje às 17h",
    });
  });
});

describe("formatBRL", () => {
  it("formata centavos em reais", () => {
    expect(plain(formatBRL(2990))).toBe("R$ 29,90");
    expect(plain(formatBRL(0))).toBe("R$ 0,00");
  });
});
