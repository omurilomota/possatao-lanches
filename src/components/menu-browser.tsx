"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Search, ShoppingBag, X } from "lucide-react";
import { formatBRL } from "@/lib/config";
import type { AddonDTO, MenuCategory, MenuItemDTO, MenuPayload } from "@/lib/types";
import { useCart } from "./cart-context";
import { CategoryIcon } from "./ui";

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** Botão de adicionar rápido (sem adicionais) — usado nos destaques da home. */
export function QuickAdd({ item, className = "" }: { item: MenuItemDTO; className?: string }) {
  const { add } = useCart();
  return (
    <button
      disabled={!item.available}
      onClick={() =>
        add({
          itemId: item.id,
          name: item.name,
          priceCents: item.priceCents,
          imageUrl: item.imageUrl,
          quantity: 1,
          addons: [],
          notes: "",
        })
      }
      className={
        className ||
        "inline-flex items-center gap-1.5 rounded-full bg-ember px-4 py-2 font-display text-sm uppercase tracking-wide text-coal transition-all hover:-translate-y-0.5 hover:bg-mustard disabled:cursor-not-allowed disabled:opacity-40"
      }
    >
      <Plus className="size-4" strokeWidth={3} aria-hidden />
      Adicionar
    </button>
  );
}

function ItemImage({
  item,
  icon,
  className = "",
}: {
  item: MenuItemDTO;
  icon: string;
  className?: string;
}) {
  if (item.imageUrl) {
    return (
      <Image
        src={item.imageUrl}
        alt={item.name}
        fill
        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 340px"
        className={`object-cover transition-transform duration-500 group-hover:scale-105 ${className}`}
      />
    );
  }
  return (
    <div className={`bg-dots grid h-full w-full place-items-center bg-bark/60 ${className}`}>
      <CategoryIcon icon={icon} className="size-10 text-ember/50" />
    </div>
  );
}

function ItemModal({
  item,
  category,
  addons,
  onClose,
}: {
  item: MenuItemDTO;
  category: MenuCategory;
  addons: AddonDTO[];
  onClose: () => void;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [notes, setNotes] = useState("");
  const allowAddons = !["bebidas", "sobremesas"].includes(category.slug);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const chosen = addons.filter((a) => selected.has(a.id));
  const total = (item.priceCents + chosen.reduce((s, a) => s + a.priceCents, 0)) * qty;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={item.name}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-bark bg-soot shadow-2xl">
        <div className="group relative h-44 shrink-0 sm:h-52">
          <ItemImage item={item} icon={category.icon} />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-coal/80 text-cream backdrop-blur transition-colors hover:bg-ember hover:text-coal"
            aria-label="Fechar"
          >
            <X className="size-5" aria-hidden />
          </button>
          {item.tag && (
            <span className="absolute left-3 top-3 -rotate-2 rounded-full bg-mustard px-3 py-1 text-xs font-black uppercase tracking-wide text-coal">
              {item.tag}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <h3 className="font-display text-3xl tracking-wide text-cream">{item.name}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-latte">{item.description}</p>

          {allowAddons && addons.length > 0 && (
            <fieldset className="mt-5">
              <legend className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-mustard">
                Turbinar com adicionais
              </legend>
              <div className="space-y-2">
                {addons.map((a) => (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors ${
                      selected.has(a.id)
                        ? "border-ember bg-ember/10 text-cream"
                        : "border-bark bg-coal/50 text-cream/80 hover:border-ember/50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="size-4 accent-[#ff5a1f]"
                        checked={selected.has(a.id)}
                        onChange={(e) => {
                          const next = new Set(selected);
                          if (e.target.checked) next.add(a.id);
                          else next.delete(a.id);
                          setSelected(next);
                        }}
                      />
                      {a.name}
                    </span>
                    <span className="text-mustard">+ {formatBRL(a.priceCents)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-mustard">
              Alguma observação?
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={200}
              placeholder="Ex.: sem cebola, ponto da carne, capricha no molho…"
              className="w-full resize-none rounded-xl border border-bark bg-coal/60 px-4 py-3 text-sm text-cream placeholder:text-latte/50 focus:border-ember focus:outline-none"
            />
          </label>
        </div>

        <div className="flex items-center gap-3 border-t border-bark p-4">
          <div className="flex items-center gap-1 rounded-full border border-bark">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="grid size-11 place-items-center rounded-full text-cream hover:text-ember"
              aria-label="Diminuir"
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <span className="w-7 text-center font-black">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(20, q + 1))}
              className="grid size-11 place-items-center rounded-full text-cream hover:text-ember"
              aria-label="Aumentar"
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
          <button
            onClick={() => {
              add({
                itemId: item.id,
                name: item.name,
                priceCents: item.priceCents,
                imageUrl: item.imageUrl,
                quantity: qty,
                addons: chosen.map((a) => ({ id: a.id, name: a.name, priceCents: a.priceCents })),
                notes: notes.trim(),
              });
              onClose();
            }}
            className="btn-ember flex-1 !py-3 text-base"
          >
            <ShoppingBag className="size-5" aria-hidden />
            Adicionar · {formatBRL(total)}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MenuBrowser({ payload }: { payload: MenuPayload }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(payload.categories[0]?.slug ?? "");
  const [modal, setModal] = useState<{ item: MenuItemDTO; cat: MenuCategory } | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return payload.categories.filter((c) => c.items.length > 0);
    return payload.categories
      .map((c) => ({
        ...c,
        items: c.items.filter(
          (i) => normalize(i.name).includes(q) || normalize(i.description).includes(q)
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [payload, query]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const slug = (e.target as HTMLElement).dataset.slug;
            if (slug) setActive(slug);
          }
        }
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    for (const el of Object.values(sectionRefs.current)) {
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [visible]);

  const searching = query.trim().length > 0;

  return (
    <div>
      {/* busca + categorias fixas */}
      <div className="sticky top-[68px] z-30 border-b border-bark/70 bg-coal/95 py-3 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <label className="relative mb-3 block">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-latte/60" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar no cardápio… ex.: bacon, porção, acerola"
              className="w-full rounded-full border border-bark bg-soot py-3 pl-12 pr-11 text-sm font-semibold text-cream placeholder:text-latte/50 focus:border-ember focus:outline-none"
              aria-label="Buscar item no cardápio"
            />
            {searching && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-bark text-cream hover:bg-ember hover:text-coal"
                aria-label="Limpar busca"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </label>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {payload.categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => {
                  setQuery("");
                  setActive(c.slug);
                  setTimeout(() => {
                    sectionRefs.current[c.slug]?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 30);
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-extrabold transition-all ${
                  active === c.slug && !searching
                    ? "bg-ember text-coal shadow-[0_6px_20px_-6px_rgba(255,90,31,0.7)]"
                    : "border border-bark bg-soot text-cream/80 hover:border-ember/60 hover:text-mustard"
                }`}
              >
                <CategoryIcon icon={c.icon} className="size-4" />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {visible.length === 0 && (
          <div className="py-20 text-center">
            
            <p className="mt-4 font-display text-2xl tracking-wide text-cream">
              Nada encontrado para “{query}”
            </p>
            <p className="mt-2 text-sm text-latte">
              Tente outro termo, como “bacon”, “porção” ou “suco”.
            </p>
            <button onClick={() => setQuery("")} className="btn-ghost mt-6">
              Limpar busca
            </button>
          </div>
        )}

        {visible.map((cat) => (
          <section
            key={cat.slug}
            id={cat.slug}
            data-slug={cat.slug}
            ref={(el) => {
              sectionRefs.current[cat.slug] = el;
            }}
            className="mb-14 scroll-mt-44"
            aria-label={cat.name}
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-ember/15 text-ember">
                <CategoryIcon icon={cat.icon} className="size-6" />
              </span>
              <h2 className="font-display text-3xl uppercase tracking-wide text-cream sm:text-4xl">
                {cat.name}
              </h2>
              <span className="mt-1 hidden h-px flex-1 bg-bark sm:block" aria-hidden />
              <span className="mt-1 text-xs font-bold text-latte/60">
                {cat.items.length} {cat.items.length === 1 ? "item" : "itens"}
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cat.items.map((item) => (
                <article
                  key={item.id}
                  className={`card-lift group overflow-hidden rounded-xl border border-bark bg-soot ${
                    !item.available ? "opacity-70" : ""
                  }`}
                >
                  <button
                    onClick={() => item.available && setModal({ item, cat })}
                    className="relative block aspect-[4/3] w-full overflow-hidden text-left"
                    aria-label={`Ver ${item.name}`}
                    disabled={!item.available}
                  >
                    <div className={item.available ? "h-full w-full" : "h-full w-full grayscale"}>
                      <ItemImage item={item} icon={cat.icon} />
                    </div>
                    {item.tag && item.available && (
                      <span className="absolute left-3 top-3 -rotate-2 rounded-full bg-mustard px-3 py-1 text-[11px] font-black uppercase tracking-wide text-coal shadow-lg">
                        {item.tag}
                      </span>
                    )}
                    {!item.available && (
                      <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-cream">
                        Esgotado hoje
                      </span>
                    )}
                  </button>
                  <div className="p-4">
                    <h3 className="font-display text-xl leading-tight tracking-wide text-cream">
                      {item.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-snug text-latte">
                      {item.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-display text-2xl tracking-wide text-mustard">
                        {formatBRL(item.priceCents)}
                      </span>
                      <button
                        onClick={() => item.available && setModal({ item, cat })}
                        disabled={!item.available}
                        className="inline-flex items-center gap-1.5 rounded-full bg-ember px-4 py-2 font-display text-sm uppercase tracking-wide text-coal transition-all hover:-translate-y-0.5 hover:bg-mustard disabled:cursor-not-allowed disabled:bg-bark disabled:text-latte"
                      >
                        <Plus className="size-4" strokeWidth={3} aria-hidden />
                        {item.available ? "Adicionar" : "Esgotado"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {modal && (
        <ItemModal
          key={modal.item.id}
          item={modal.item}
          category={modal.cat}
          addons={payload.addons}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}