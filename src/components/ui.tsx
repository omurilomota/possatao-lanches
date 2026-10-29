"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Beef,
  CakeSlice,
  CupSoda,
  Package,
  Sandwich,
  Star,
  StarHalf,
  Utensils,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { getOpenStatus, type OpenStatus } from "@/lib/config";

const ICONS: Record<string, LucideIcon> = {
  beef: Beef,
  sandwich: Sandwich,
  "utensils-crossed": UtensilsCrossed,
  utensils: Utensils,
  package: Package,
  "cup-soda": CupSoda,
  cake: CakeSlice,
};

export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = ICONS[icon] ?? UtensilsCrossed;
  return <Icon className={className} aria-hidden />;
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center bg-ember text-coal">
        <span className="font-display text-xl leading-none">P</span>
      </span>
      <span className="leading-none">
        <span className="block font-display text-xl tracking-wide text-cream sm:text-2xl">
          POSSAT<span className="text-ember">ÃO</span>
        </span>
        {!compact && (
          <span className="mt-0.5 block text-[9px] font-extrabold uppercase tracking-[0.2em] text-latte">
            Lanches &amp; Porções
          </span>
        )}
      </span>
    </span>
  );
}

/** Status AO VIVO — recalcula a cada 30s no fuso de São Paulo. */
export function OpenBadge({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<OpenStatus | null>(null);
  useEffect(() => {
    const update = () => setStatus(getOpenStatus());
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  if (!status) {
    return (
      <span className="inline-flex items-center gap-2 border border-bark bg-soot px-3 py-1.5 text-xs font-bold text-latte">
        Horário…
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 border px-3 py-1.5 text-xs font-extrabold ${
        status.open
          ? "border-leaf/30 bg-leaf/10 text-leaf"
          : "border-red-400/30 bg-red-400/10 text-red-300"
      }`}
      title="Horário de Junqueirópolis/SP"
    >
      <span className="relative flex size-2">
        {status.open && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-leaf opacity-70" />
        )}
        <span
          className={`relative inline-flex size-2 rounded-full ${status.open ? "bg-leaf" : "bg-red-400"}`}
        />
      </span>
      {status.title}
      {!compact && <span className="font-semibold opacity-80">· {status.detail}</span>}
    </span>
  );
}

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Stars({ value, className = "size-4" }: { value: number; className?: string }) {
  const full = Math.floor(value);
  const half = value - full >= 0.25 && value - full < 0.85;
  const extra = value - full >= 0.85 ? 1 : 0;
  return (
    <span className="inline-flex items-center gap-0.5 text-mustard" aria-label={`${value} de 5 estrelas`}>
      {Array.from({ length: full + extra }).map((_, i) => (
        <Star key={i} className={`${className} fill-current`} aria-hidden />
      ))}
      {half && <StarHalf className={`${className} fill-current`} aria-hidden />}
      {Array.from({ length: 5 - full - extra - (half ? 1 : 0) }).map((_, i) => (
        <Star key={`e${i}`} className={`${className} opacity-25`} aria-hidden />
      ))}
    </span>
  );
}

export function SectionHeading({
  kicker,
  title,
  dark = false,
  children,
}: {
  kicker: string;
  title: ReactNode;
  dark?: boolean;
  children?: ReactNode;
}) {
  return (
    <Reveal className="mb-8">
      <p
        className={`mb-2 text-[11px] font-black uppercase tracking-[0.24em] ${
          dark ? "text-coal/45" : "text-ember"
        }`}
      >
        {kicker}
      </p>
      <h2
        className={`font-display text-3xl leading-[1.05] tracking-wide sm:text-4xl ${
          dark ? "text-coal" : "text-cream"
        }`}
      >
        {title}
      </h2>
      {children && (
        <div className={`mt-3 max-w-2xl text-sm ${dark ? "text-coal/70" : "text-latte"}`}>
          {children}
        </div>
      )}
    </Reveal>
  );
}