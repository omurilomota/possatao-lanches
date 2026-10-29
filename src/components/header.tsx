"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "./cart-context";
import { Logo, OpenBadge } from "./ui";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/cardapio", label: "Cardápio" },
  { href: "/delivery-junqueiropolis", label: "Delivery" },
  { href: "/#historia", label: "A loja" },
  { href: "/#contato", label: "Contato" },
];

export function Header() {
  const { count, open } = useCart();
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-bark bg-coal/95 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" aria-label="Possatão — página inicial" onClick={() => setMobile(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3.5 py-2 text-sm font-bold transition-colors ${
                  active ? "text-ember" : "text-cream/80 hover:text-mustard"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden md:block">
            <OpenBadge compact />
          </span>
          <button
            onClick={open}
            className="relative flex items-center gap-2 bg-ember px-4 py-2.5 font-display text-base uppercase tracking-wide text-coal transition-colors hover:bg-mustard"
            aria-label={`Abrir sacola com ${count} itens`}
          >
            <ShoppingBag className="size-5" strokeWidth={2.5} aria-hidden />
            <span className="hidden sm:inline">Sacola</span>
            {count > 0 && (
              <span
                key={count}
                className="animate-pop absolute -right-2 -top-2 grid size-6 place-items-center rounded-full border-2 border-coal bg-mustard text-xs font-black text-coal"
              >
                {count}
              </span>
            )}
          </button>
          <button
            className="grid size-11 shrink-0 place-items-center border border-bark text-cream lg:hidden"
            onClick={() => setMobile((m) => !m)}
            aria-label={mobile ? "Fechar menu" : "Abrir menu"}
          >
            {mobile ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {mobile && (
        <nav className="border-t border-bark bg-soot px-4 py-2 lg:hidden" aria-label="Menu do celular">
          <div className="py-2 md:hidden">
            <OpenBadge />
          </div>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMobile(false)}
              className="block border-b border-bark/50 py-3.5 text-base font-bold text-cream/90 last:border-0"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}