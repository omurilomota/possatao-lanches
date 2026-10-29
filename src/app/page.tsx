import Link from "next/link";
import Image from "next/image";
import { Bike, BookOpenText, MapPin, Navigation, Phone } from "lucide-react";
import { formatBRL, RULES, STORE, WA_DEFAULT_LINK } from "@/lib/config";
import { getMenuPayload } from "@/lib/server";
import type { MenuItemDTO } from "@/lib/types";
import { OpenBadge, Reveal, SectionHeading, Stars } from "@/components/ui";
import { QuickAdd } from "@/components/menu-browser";

export const dynamic = "force-dynamic";

const MARQUEE = [
  "MC Passatão",
  "Megatron",
  "Pão francês na chapa",
  "Porção mista",
  "Suco de acerola",
  "Entrega grátis acima de R$ 60",
];

const REVIEWS = [
  { name: "João Marques", text: "Lanche muito bom, recomendo." },
  {
    name: "Enginstrel",
    text: "Melhor é o MC Passatão. Atendimento muito bom. Os combos são bons.",
  },
  { name: "Noemí Bonfim", text: "Os lanches e porções são deliciosos." },
];

function FeaturedCard({ item, first }: { item: MenuItemDTO; first: boolean }) {
  return (
    <article
      className={`group overflow-hidden border bg-soot ${
        first ? "border-ember/70" : "border-bark"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 280px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-bark" />
        )}
        {first && (
          <span className="absolute left-0 top-3 bg-ember px-3 py-1 text-[11px] font-black uppercase tracking-wider text-coal">
            O mais pedido
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-xl tracking-wide text-cream">{item.name}</h3>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="font-display text-2xl text-mustard">
            {formatBRL(item.priceCents)}
          </span>
          <QuickAdd item={item} />
        </div>
      </div>
    </article>
  );
}

export default async function Home() {
  const payload = await getMenuPayload().catch(() => null);
  const allItems = payload?.categories.flatMap((c) => c.items) ?? [];
  const featured = allItems.filter((i) => i.featured).slice(0, 4);
  const lanches = payload?.categories.find((c) => c.slug === "lanches")?.items ?? [];
  const fromCents = Math.min(
    ...(lanches.length ? lanches : allItems)
      .filter((i) => i.available)
      .map((i) => i.priceCents)
  );

  return (
    <>
      {/* ── HERO ────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-bark">
        <div className="bg-dots pointer-events-none absolute inset-x-0 h-[640px] opacity-50" aria-hidden />
        <span
          className="text-outline pointer-events-none absolute -bottom-6 left-0 z-0 select-none whitespace-nowrap font-display text-[22vw] leading-none"
          aria-hidden
        >
          POSSATÃO
        </span>

        <div className="relative z-[1] mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1fr_1fr] lg:pb-24 lg:pt-14">
          <div>
            <Reveal>
              <div className="flex flex-col items-start gap-3">
                <OpenBadge />
                <p className="bg-mustard px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-coal">
                  Desde {STORE.foundedYear} · Junqueirópolis/SP
                </p>
              </div>
              <h1 className="mt-8 font-display text-5xl leading-[0.95] tracking-wide text-cream sm:text-6xl lg:text-7xl">
                FOME DE
                <br />
                <span className="text-ember">LANCHÃO?</span>
              </h1>
              <p className="mt-5 max-w-md text-lg leading-snug text-latte">
                Hambúrguer caseiro na chapa, porções pra dividir e o MC Passatão.{" "}
                <span className="text-mustard">“{STORE.slogan}”</span>
              </p>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/cardapio" className="btn-ember">
                  <BookOpenText className="size-5" aria-hidden />
                  Cardápio
                </Link>
                <a
                  href={WA_DEFAULT_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-whats/50 px-6 py-3 font-display text-lg uppercase tracking-wide text-whats transition-colors hover:bg-whats hover:text-coal"
                >
                  {STORE.whatsappDisplay}
                </a>
              </div>
              <p className="mt-7 text-sm font-semibold text-latte">
                Entrega grátis acima de {formatBRL(RULES.freeDeliveryFromCents)} · Pix, cartão
                e dinheiro · Todos os dias 17h—00h20
              </p>
            </Reveal>
          </div>

          <Reveal delay={100}>
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="overflow-hidden border-4 border-bark shadow-[0_40px_90px_-30px_rgba(255,90,31,0.35)]">
                <Image
                  src="/images/hero-burger.jpg"
                  alt="Hambúrguer duplo do Possatão com queijo derretido e bacon"
                  width={1024}
                  height={1024}
                  priority
                  sizes="(max-width: 1024px) 92vw, 520px"
                  className="aspect-square w-full object-cover"
                />
              </div>
              <span className="animate-floaty absolute -left-2 top-5 bg-mustard px-4 py-2 font-display text-lg uppercase tracking-wide text-coal shadow-lg sm:-left-5">
                MC Passatão
              </span>
              {Number.isFinite(fromCents) && (
                <span
                  className="animate-floaty absolute -bottom-3 right-4 bg-ember px-4 py-2 font-display text-xl uppercase tracking-wide text-coal shadow-lg"
                  style={{ animationDelay: "1.4s" }}
                >
                  lanches a partir de {formatBRL(fromCents)}
                </span>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────── */}
      <div className="marquee-hover relative z-10 overflow-hidden bg-ember py-3" aria-hidden>
        <div className="marquee-track items-center gap-8">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center gap-8 pr-8">
              {MARQUEE.map((m, i) => (
                <span
                  key={`${copy}-${i}`}
                  className="shrink-0 font-display text-lg uppercase tracking-wider text-coal"
                >
                  {m}
                  <span className="ml-8 text-coal/40">/</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── DESTAQUES ────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading kicker="Da chapa" title={<>OS CAMPEÕES <span className="text-ember">DA CASA</span></>} />
          <Reveal className="mb-8 hidden sm:block">
            <Link href="/cardapio" className="border-b-2 border-mustard pb-1 font-display text-lg uppercase tracking-wide text-mustard hover:text-ember">
              Ver cardápio completo →
            </Link>
          </Reveal>
        </div>

        {featured.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item, i) => (
              <Reveal key={item.id} delay={i * 80}>
                <FeaturedCard item={item} first={i === 0} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="border border-bark bg-soot p-8 text-center text-latte">
            Cardápio em atualização — peça pelo WhatsApp {STORE.whatsappDisplay}.
          </p>
        )}
      </section>

      {/* ── COMO PEDIR ───────────────────────────────── */}
      <section className="border-y border-bark bg-soot/60 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading kicker="Como pedir" title={<>PEDIU, <span className="text-ember">CHEGOU.</span></>} />
          <ol className="grid gap-8 sm:grid-cols-3">
            {[
              { n: "1", t: "Monte a sacola", d: "Escolha no cardápio e deixe suas observações." },
              { n: "2", t: "Confirme no WhatsApp", d: "O pedido chega pronto pra gente — sem erro de comanda." },
              { n: "3", t: "Receba em casa", d: "Entrega própria em 25 a 45 minutos." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <li className="flex gap-4 border-t-2 border-ember pt-4 sm:border-t-0 sm:border-l-2 sm:pl-5 sm:pt-0">
                  <span className="font-display text-5xl leading-none text-ember/40">{s.n}</span>
                  <span>
                    <span className="block font-display text-xl uppercase tracking-wide text-cream">
                      {s.t}
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-latte">{s.d}</span>
                  </span>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={150}>
            <p className="mt-8 border border-dashed border-bark px-5 py-4 text-sm text-latte">
              <strong className="text-mustard">Clube do Cupom:</strong> a cada {formatBRL(RULES.stampValueCents)} em pedidos você ganha
              1 cupom pros nossos sorteios. Automático, sem papelzinho.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── HISTÓRIA ─────────────────────────────────── */}
      <section id="historia" className="bg-paper scroll-mt-24 py-16 text-coal">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading dark kicker="Nossa história" title={<>UMA FAMÍLIA <span className="text-ember-deep">ATENDENDO A SUA</span></>} />

          <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <Reveal>
              <div className="mx-auto max-w-md lg:mx-0">
                <div className="-rotate-2 overflow-hidden border-8 border-coal shadow-xl transition-transform duration-300 hover:rotate-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/chapa.jpg"
                    alt="Hambúrgueres e bacon na chapa da cozinha do Possatão"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal delay={80}>
                <h3 className="text-[11px] font-black uppercase tracking-[0.22em] text-coal/45">
                  Como começou
                </h3>
                <p className="mt-2.5 max-w-xl text-base leading-relaxed text-coal/75">
                  O Possatão nasceu em <strong>2018</strong>, em família, com a chapa sempre
                  quente. Virou parada obrigatória da noite em Junqueirópolis — do plantonista da
                  Santa Casa à turma que sai da rodoviária.
                </p>
              </Reveal>

              <Reveal delay={140}>
                <h3 className="mt-8 text-[11px] font-black uppercase tracking-[0.22em] text-coal/45">
                  O que sai da chapa
                </h3>
                <dl className="mt-3 grid gap-x-10 gap-y-3.5 sm:grid-cols-2">
                  {[
                    ["Hambúrguer caseiro", "Moldado na casa, 150 g"],
                    ["Pão francês", "Na chapa, com manteiga"],
                    ["Porções", "Batata, calabresa, frango"],
                    ["Sucos naturais", "Acerola da terra, na hora"],
                    ["Combos", "Lanche + batata + refri"],
                    ["Cerveja", "Estupidamente gelada"],
                  ].map(([t, d]) => (
                    <div key={t} className="border-l-2 border-ember-deep/40 pl-3.5">
                      <dt className="text-sm font-extrabold text-coal">{t}</dt>
                      <dd className="text-xs leading-snug text-coal/60">{d}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>

              <Reveal delay={200}>
                <dl className="mt-9 flex gap-8 border-t border-coal/15 pt-6">
                  {[
                    { v: "8 anos", l: "de chapa" },
                    { v: "4,5★", l: "no Google" },
                    { v: "82", l: "avaliações" },
                  ].map((s) => (
                    <div key={s.l}>
                      <dd className="font-display text-3xl leading-none text-ember-deep">{s.v}</dd>
                      <dd className="mt-1 text-xs font-bold uppercase tracking-wider text-coal/50">{s.l}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── AVALIAÇÕES ───────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading kicker="No Google" title={<>A CIDADE <span className="text-ember">RECOMENDA</span></>}>
          <span className="inline-flex items-center gap-2">
            <Stars value={4.5} className="size-5" />
            <strong className="text-cream">4,5 no Google</strong> · 82 avaliações
          </span>
        </SectionHeading>
        <div className="grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 80}>
              <figure className="h-full border-l-4 border-ember bg-soot px-5 py-5">
                <blockquote className="text-[15px] leading-snug text-cream/90">
                  “{r.text}”
                </blockquote>
                <figcaption className="mt-3 text-xs font-black uppercase tracking-wider text-latte/70">
                  {r.name} · Google
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── LOCALIZAÇÃO ──────────────────────────────── */}
      <section id="local" className="border-t border-bark bg-soot/50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading kicker="Onde estamos" title={<>HONDURAS, <span className="text-ember">49</span></>} />
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="overflow-hidden border border-bark">
                <iframe
                  src={STORE.mapsEmbed}
                  title="Mapa — Possatão Lanches, Rua Honduras 49, Junqueirópolis"
                  className="h-[340px] w-full border-0 grayscale-[0.3]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="flex h-full flex-col justify-between gap-5">
                <div>
                  <p className="flex items-start gap-2 text-sm font-bold text-mustard">
                    <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {STORE.street} — {STORE.district}
                  </p>
                  <p className="mt-1 text-sm text-latte">
                    {STORE.city}/{STORE.state} · CEP {STORE.zip}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-latte/60">
                    {STORE.reference}. Agora na Rua Honduras — não somos mais próximo à Santa Casa.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href={STORE.mapsDirections} target="_blank" rel="noopener noreferrer" className="btn-ember !px-5 !py-2.5">
                    <Navigation className="size-4" aria-hidden /> Como chegar
                  </a>
                  <Link href="/delivery-junqueiropolis" className="btn-ghost !px-5 !py-2.5">
                    <Bike className="size-4" aria-hidden /> Taxas de entrega
                  </Link>
                </div>
                <p className="border-t border-bark pt-4 text-sm text-latte">
                  Aberto todos os dias · <strong className="text-cream">17h — 00h20</strong> ·{" "}
                  <a href={`tel:+55${STORE.whatsappNumber}`} className="inline-flex items-center gap-1 text-mustard hover:text-ember">
                    <Phone className="size-3.5" aria-hidden /> {STORE.whatsappDisplay}
                  </a>
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────── */}
      <section className="bg-ember py-14 text-coal">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:px-6 lg:flex-row">
          <h2 className="text-center font-display text-4xl leading-none tracking-wide sm:text-5xl lg:text-left">
            BATEU A FOME?
            <span className="block text-xl text-coal/60 sm:text-2xl">a chapa tá quente.</span>
          </h2>
          <Link
            href="/cardapio"
            className="border-2 border-coal px-8 py-4 font-display text-xl uppercase tracking-wide transition-colors hover:bg-coal hover:text-mustard"
          >
            Pedir agora
          </Link>
        </div>
      </section>
    </>
  );
}