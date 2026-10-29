// ─────────────────────────────────────────────────────────────
// Dados oficiais do Possatão Lanches e Porções — Junqueirópolis/SP
// Endereço e horário unificados conforme Google/CNPJ (NAP correto).
// Valores de cardápio/taxas são ilustrativos até confirmação do dono.
// ─────────────────────────────────────────────────────────────

export const STORE = {
  name: "Possatão Lanches e Porções",
  shortName: "Possatão",
  slogan: "Uma Família Atendendo a Sua",
  foundedYear: 2018,
  cnpj: "00.000.000/0001-00",
  whatsappDisplay: "(18) 99999-0108",
  whatsappNumber: "5518999990108",
  street: "Rua das Hortênsias, 75",
  district: "Centro",
  city: "Junqueirópolis",
  state: "SP",
  zip: "00000-000",
  addressFull:
    "Rua das Hortênsias, 75 — Centro, Junqueirópolis/SP, CEP 00000-000",
  reference: "Próximo ao centro de Junqueirópolis",
  lat: -21.5100,
  lng: -51.4300,
  instagram: "https://www.instagram.com/",
  instagramHandle: "@demonstracao",
  facebook: "https://www.facebook.com/Deliverypossatao",
  facebookHandle: "/Deliverypossatao",
  siteUrl: "https://possatao-lanches.vercel.app",
  googleRating: 4.5,
  googleReviews: 82,
  mapsEmbed:
    "https://maps.google.com/maps?q=-21.5100,-51.4300&z=16&hl=pt-BR&output=embed",
  mapsDirections:
    "https://www.google.com/maps/dir/?api=1&destination=-21.5100,-51.4300",
} as const;

export const WA_DEFAULT_LINK = `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(
  "Olá! Quero fazer um pedido 🍔"
)}`;

export function waLink(text: string) {
  return `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

// Regras de pedido
export const RULES = {
  minOrderCents: 2000, // pedido mínimo p/ entrega
  freeDeliveryFromCents: 6000, // entrega grátis a partir de R$ 60
  stampValueCents: 6000, // a cada R$ 60 acumulados = 1 cupom do sorteio
  pickupEtaMin: 20,
};

// Horário oficial (Google): todos os dias, 17h00 → 00h20
// índice 0 = domingo … 6 = sábado
export const HOURS: { label: string; open: string; close: string }[] = [
  { label: "Domingo", open: "17:00", close: "00:20" },
  { label: "Segunda-feira", open: "17:00", close: "00:20" },
  { label: "Terça-feira", open: "17:00", close: "00:20" },
  { label: "Quarta-feira", open: "17:00", close: "00:20" },
  { label: "Quinta-feira", open: "17:00", close: "00:20" },
  { label: "Sexta-feira", open: "17:00", close: "00:20" },
  { label: "Sábado", open: "17:00", close: "00:20" },
];

export type Neighborhood = { name: string; feeCents: number; etaMin: number };

// Taxas por bairro (tabela simples — cidade de ~5 km² urbanos)
export const NEIGHBORHOODS: Neighborhood[] = [
  { name: "Centro", feeCents: 0, etaMin: 25 },
  { name: "Jardim das Américas", feeCents: 0, etaMin: 25 },
  { name: "Centro", feeCents: 600, etaMin: 35 },
  { name: "Jardim Bela Vista", feeCents: 600, etaMin: 35 },
  { name: "Vila Santa Isabel", feeCents: 700, etaMin: 40 },
  { name: "Cohab / São Judas", feeCents: 700, etaMin: 40 },
  { name: "Jardim Primavera", feeCents: 800, etaMin: 45 },
  { name: "Outro bairro (combinar no WhatsApp)", feeCents: 800, etaMin: 45 },
];

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function prettyTime(hhmm: string) {
  const [h, m] = hhmm.split(":");
  return m === "00" ? `${h}h` : `${h}h${m}`;
}

export type OpenStatus = { open: boolean; title: string; detail: string };

/** Status AO VIVO no fuso de São Paulo (funciona após a meia-noite). */
export function getOpenStatus(now: Date = new Date()): OpenStatus {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const wdMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  const wd = wdMap[parts.find((p) => p.type === "weekday")?.value ?? "Sun"] ?? 0;
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const t = hour * 60 + minute;

  const today = HOURS[wd];
  const yesterday = HOURS[(wd + 6) % 7];
  const openT = toMinutes(today.open);
  const closeT = toMinutes(today.close);
  const yCloseT = toMinutes(yesterday.close);
  const yOvernight = toMinutes(yesterday.close) < toMinutes(yesterday.open);

  // madrugada: ainda dentro do expediente de ontem
  if (yOvernight && t < yCloseT) {
    return {
      open: true,
      title: "Aberto agora",
      detail: `Fecha às ${prettyTime(yesterday.close)}`,
    };
  }
  if (t >= openT) {
    return {
      open: true,
      title: "Aberto agora",
      detail: `Fecha às ${prettyTime(today.close)}`,
    };
  }
  return {
    open: false,
    title: "Fechado agora",
    detail: `Abre hoje às ${prettyTime(today.open)}`,
  };
}

export const PAYMENT_LABELS: Record<string, string> = {
  pix: "Pix",
  credito: "Cartão de crédito (na entrega)",
  debito: "Cartão de débito (na entrega)",
  dinheiro: "Dinheiro",
};

export const STATUS_LABELS: Record<string, string> = {
  novo: "Novo",
  preparo: "Em preparo",
  rota: "Saiu p/ entrega",
  concluido: "Concluído",
  cancelado: "Cancelado",
};