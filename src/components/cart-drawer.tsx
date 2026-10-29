"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Bike, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatBRL, RULES } from "@/lib/config";
import { lineTotal, useCart } from "./cart-context";

export function CartDrawer() {
  const { lines, count, subtotalCents, isOpen, close, setQty, remove } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const missing = RULES.freeDeliveryFromCents - subtotalCents;
  const progress = Math.min(100, (subtotalCents / RULES.freeDeliveryFromCents) * 100);

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
        aria-hidden
      />
      <aside
        className={`fixed right-0 top-0 z-[80] flex h-full w-full max-w-md flex-col border-l border-bark bg-soot transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Sacola de pedidos"
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-bark px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-2xl uppercase tracking-wide text-cream">
            <ShoppingBag className="size-6 text-ember" aria-hidden />
            Sua sacola
            {count > 0 && <span className="text-base text-latte">({count})</span>}
          </h2>
          <button
            onClick={close}
            className="grid size-10 place-items-center rounded-full border border-bark text-cream hover:border-ember hover:text-ember"
            aria-label="Fechar sacola"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="font-display text-2xl tracking-wide text-cream">Sacola vazia</p>
            <p className="text-sm text-latte">
              Bateu a fome? O MC Passatão está te esperando no cardápio.
            </p>
            <Link href="/cardapio" onClick={close} className="btn-ember mt-2">
              Ver cardápio <ArrowRight className="size-5" aria-hidden />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {lines.map((l) => (
                  <li key={l.key} className="rounded-2xl border border-bark bg-coal/60 p-3">
                    <div className="flex gap-3">
                      {l.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={l.imageUrl}
                          alt=""
                          className="size-16 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-bark">
                          <span className="font-display text-lg text-latte/60">
                            {l.name.slice(0, 2).toUpperCase()}
                          </span>
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-display text-lg leading-tight tracking-wide text-cream">
                            {l.name}
                          </p>
                          <button
                            onClick={() => remove(l.key)}
                            className="text-latte/60 transition-colors hover:text-red-400"
                            aria-label={`Remover ${l.name}`}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                        </div>
                        {l.addons.length > 0 && (
                          <p className="mt-0.5 text-xs text-mustard">
                            + {l.addons.map((a) => a.name).join(", ")}
                          </p>
                        )}
                        {l.notes && <p className="mt-0.5 text-xs italic text-latte">“{l.notes}”</p>}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-full border border-bark">
                            <button
                              onClick={() => setQty(l.key, l.quantity - 1)}
                              className="grid size-8 place-items-center rounded-full text-cream hover:text-ember"
                              aria-label="Diminuir quantidade"
                            >
                              <Minus className="size-4" aria-hidden />
                            </button>
                            <span className="w-6 text-center text-sm font-black">{l.quantity}</span>
                            <button
                              onClick={() => setQty(l.key, l.quantity + 1)}
                              className="grid size-8 place-items-center rounded-full text-cream hover:text-ember"
                              aria-label="Aumentar quantidade"
                            >
                              <Plus className="size-4" aria-hidden />
                            </button>
                          </div>
                          <strong className="text-mustard">{formatBRL(lineTotal(l))}</strong>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-bark px-5 py-4">
              <div className="mb-3 rounded-xl bg-coal/70 p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-cream/90">
                  <Bike className="size-4 text-mustard" aria-hidden />
                  {missing > 0 ? (
                    <>Faltam {formatBRL(missing)} para&nbsp;<span className="text-leaf">ENTREGA GRÁTIS</span></>
                  ) : (
                    <span className="text-leaf">Entrega grátis liberada.</span>
                  )}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-bark">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${missing > 0 ? "bg-ember" : "bg-leaf"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="mb-3 flex items-center justify-between text-sm text-latte">
                <span>Subtotal</span>
                <strong className="font-display text-2xl tracking-wide text-cream">
                  {formatBRL(subtotalCents)}
                </strong>
              </div>
              <p className="mb-3 text-[11px] text-latte/70">
                Taxa de entrega calculada no próximo passo · Pedido mínimo p/ entrega:{" "}
                {formatBRL(RULES.minOrderCents)}
              </p>
              <Link href="/checkout" onClick={close} className="btn-ember w-full">
                Finalizar pedido <ArrowRight className="size-5" aria-hidden />
              </Link>
              <Link
                href="/cardapio"
                onClick={close}
                className="mt-2 block text-center text-sm font-bold text-latte hover:text-mustard"
              >
                Continuar pedindo
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export function CartToast() {
  const { toast, open } = useCart();
  if (!toast) return null;
  return (
    <div className="animate-slide-up fixed bottom-40 left-1/2 z-[60] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 border border-mustard/40 bg-soot py-2 pl-4 pr-2 shadow-2xl md:bottom-8">
      <span className="text-sm font-bold text-cream">{toast}</span>
      <button
        onClick={open}
        className="rounded-full bg-mustard px-3 py-1.5 text-xs font-black uppercase text-coal hover:bg-ember"
      >
        Ver sacola
      </button>
    </div>
  );
}