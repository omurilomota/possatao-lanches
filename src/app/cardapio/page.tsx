import type { Metadata } from "next";
import { formatBRL, RULES, STORE, WA_DEFAULT_LINK } from "@/lib/config";
import { getMenuPayload } from "@/lib/server";
import { MenuBrowser } from "@/components/menu-browser";
import { OpenBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cardápio Digital — Lanches, Porções e Combos",
  description:
    "Cardápio do Possatão Lanches em Junqueirópolis: MC Passatão, Megatron, X-Bacon, porções e combos. Monte a sacola e peça pelo WhatsApp.",
  alternates: { canonical: "/cardapio" },
};

export default async function CardapioPage() {
  const payload = await getMenuPayload().catch(() => null);

  const menuJsonLd = payload
    ? {
        "@context": "https://schema.org",
        "@type": "Menu",
        name: "Cardápio — Possatão Lanches e Porções",
        url: `${STORE.siteUrl}/cardapio`,
        hasMenuSection: payload.categories.map((c) => ({
          "@type": "MenuSection",
          name: c.name,
          hasMenuItem: c.items.map((i) => ({
            "@type": "MenuItem",
            name: i.name,
            description: i.description,
            offers: {
              "@type": "Offer",
              price: (i.priceCents / 100).toFixed(2),
              priceCurrency: "BRL",
              availability: i.available
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
          })),
        })),
      }
    : null;

  return (
    <>
      {menuJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(menuJsonLd) }}
        />
      )}

      <section className="border-b border-bark bg-soot/40">
        <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <h1 className="font-display text-4xl uppercase tracking-wide text-cream sm:text-5xl">
              CARD<span className="text-ember">ÁPIO</span>
            </h1>
            <OpenBadge />
          </div>
          <p className="mt-2 text-sm text-latte">
            Entrega grátis acima de {formatBRL(RULES.freeDeliveryFromCents)} · pedido mínimo{" "}
            {formatBRL(RULES.minOrderCents)} para entrega.
          </p>
        </div>
      </section>

      {payload && payload.categories.some((c) => c.items.length > 0) ? (
        <MenuBrowser payload={payload} />
      ) : (
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h2 className="font-display text-3xl tracking-wide text-cream">
            Cardápio sendo atualizado…
          </h2>
          <p className="mt-3 text-latte">Enquanto isso, peça pelo WhatsApp que mandamos o do dia.</p>
          <a
            href={WA_DEFAULT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ember mt-6"
          >
            Pedir pelo WhatsApp
          </a>
        </div>
      )}
    </>
  );
}