import type { Metadata } from "next";
import Link from "next/link";
import { Phone } from "lucide-react";
import { formatBRL, NEIGHBORHOODS, RULES, STORE, WA_DEFAULT_LINK } from "@/lib/config";
import { OpenBadge, Reveal, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Delivery em Junqueirópolis — Taxas por Bairro e Prazos",
  description:
    "Delivery de lanches em Junqueirópolis/SP com o Possatão: entrega própria em 25–45 min, grátis a partir de R$ 60. Veja a taxa do seu bairro.",
  alternates: { canonical: "/delivery-junqueiropolis" },
};

const FAQ = [
  {
    q: "Quanto tempo demora a entrega?",
    a: "De 25 a 45 minutos, dependendo do bairro. A entrega é própria, sem intermediários.",
  },
  {
    q: "Qual é a taxa do meu bairro?",
    a: "De R$ 0 a R$ 8. No Residicial das Américas é grátis sempre; em qualquer bairro, pedidos acima de R$ 60 têm entrega grátis.",
  },
  {
    q: "Existe pedido mínimo?",
    a: "R$ 20 para entrega. Para retirada no balcão não há mínimo.",
  },
  {
    q: "Quais formas de pagamento?",
    a: "Pix, cartão de crédito e débito na entrega, e dinheiro com troco.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function DeliveryPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="border-b border-bark bg-soot/40">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <Reveal>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-ember">
              Delivery próprio · sem app de terceiros
            </p>
            <h1 className="mt-3 font-display text-4xl leading-[1] tracking-wide text-cream sm:text-6xl">
              DELIVERY EM <span className="text-ember">JUNQUEIRÓPOLIS</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-snug text-latte">
              Toda a área urbana em 25 a 45 minutos. Grátis acima de {formatBRL(RULES.freeDeliveryFromCents)}.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/cardapio" className="btn-ember">
                Pedir agora
              </Link>
              <OpenBadge />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionHeading kicker="Sem surpresa na entrega" title={<>TAXAS POR <span className="text-ember">BAIRRO</span></>} />
        <Reveal>
          <div className="overflow-x-auto border border-bark">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="bg-ember font-display text-base uppercase tracking-wide text-coal">
                  <th className="px-4 py-3">Bairro</th>
                  <th className="px-4 py-3">Taxa</th>
                  <th className="px-4 py-3">Tempo</th>
                </tr>
              </thead>
              <tbody>
                {NEIGHBORHOODS.map((n, i) => (
                  <tr
                    key={n.name}
                    className={`border-t border-bark ${i % 2 ? "bg-soot" : "bg-coal/40"}`}
                  >
                    <td className="px-4 py-3 font-bold text-cream">{n.name}</td>
                    <td className={`px-4 py-3 font-display text-lg tracking-wide ${n.feeCents === 0 ? "text-leaf" : "text-mustard"}`}>
                      {n.feeCents === 0 ? "GRÁTIS" : formatBRL(n.feeCents)}
                    </td>
                    <td className="px-4 py-3 text-latte">~{n.etaMin} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <p className="mt-3 text-xs text-latte/60">
          Pedido mínimo para entrega: {formatBRL(RULES.minOrderCents)}. Valores ilustrativos —
          confirme no WhatsApp.
        </p>

        <div className="mt-12 border-t border-bark pt-10">
          <SectionHeading kicker="Dúvidas rápidas" title={<>PERGUNTAS <span className="text-ember">FREQUENTES</span></>} />
          <div className="grid gap-3 md:grid-cols-2">
            {FAQ.map((f) => (
              <details key={f.q} className="group border border-bark bg-soot px-5 py-4 open:border-ember/50">
                <summary className="cursor-pointer list-none font-display text-base tracking-wide text-cream group-open:text-mustard">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-latte">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <Reveal delay={120}>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border border-bark bg-coal px-5 py-5 sm:flex-row">
            <p className="text-sm font-bold text-latte">
              Aberto todos os dias · 17h—00h20 · Pix, cartão e dinheiro
            </p>
            <a
              href={WA_DEFAULT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-whats px-5 py-3 font-display text-lg uppercase tracking-wide text-coal transition-colors hover:bg-leaf"
            >
              <Phone className="size-5" aria-hidden /> {STORE.whatsappDisplay}
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}