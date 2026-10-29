"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BadgeDollarSign,
  Bike,
  ChefHat,
  ClipboardList,
  Flame,
  Loader2,
  LogOut,
  MessageCircle,
  RefreshCw,
  Store,
  Ticket,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { formatBRL, PAYMENT_LABELS, STATUS_LABELS } from "@/lib/config";
import type { MenuPayload } from "@/lib/types";

type AdminItem = {
  name: string;
  quantity: number;
  unitPriceCents: number;
  addons: { name: string; priceCents: number }[];
  notes: string | null;
};

type AdminOrder = {
  token: string;
  number: string;
  customerName: string;
  phone: string;
  orderType: string;
  street: string | null;
  streetNumber: string | null;
  district: string | null;
  complement: string | null;
  paymentMethod: string;
  changeForCents: number | null;
  notes: string | null;
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  status: string;
  createdAt: string;
  items: AdminItem[];
};

type Stats = {
  todayCount: number;
  todayRevenueCents: number;
  avgTicketCents: number;
  activeCount: number;
  customersCount: number;
  stampsTotal: number;
  topItems: { name: string; qty: number }[];
};

const STATUS_STYLE: Record<string, string> = {
  novo: "bg-mustard text-coal",
  preparo: "bg-ember text-coal",
  rota: "bg-sky-400 text-coal",
  concluido: "bg-leaf text-coal",
  cancelado: "bg-red-500 text-cream",
};

const PIN_KEY = "possatao:adminpin";

export default function AdminPage() {
  const [pin, setPin] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [logging, setLogging] = useState(false);
  const [tab, setTab] = useState<"pedidos" | "cardapio" | "resumo">("pedidos");
  const [ordersList, setOrdersList] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [menu, setMenu] = useState<MenuPayload | null>(null);
  const [filter, setFilter] = useState<"fila" | "todos" | "concluidos">("fila");
  const [priceDraft, setPriceDraft] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const load = useCallback(
    async (p: string) => {
      const res = await fetch("/api/orders", {
        headers: { "x-admin-pin": p },
        cache: "no-store",
      });
      if (res.status === 401) throw new Error("unauthorized");
      const data = await res.json();
      setOrdersList(data.orders as AdminOrder[]);
      setStats(data.stats as Stats);
      setLoadedOnce(true);
    },
    []
  );

  const loadMenu = useCallback(async () => {
    const res = await fetch("/api/menu", { cache: "no-store" });
    if (res.ok) setMenu((await res.json()) as MenuPayload);
  }, []);

  // restaura sessão
  useEffect(() => {
    const saved = sessionStorage.getItem(PIN_KEY);
    if (saved) {
      load(saved)
        .then(() => {
          setPin(saved);
          loadMenu();
        })
        .catch(() => sessionStorage.removeItem(PIN_KEY));
    }
  }, [load, loadMenu]);

  // auto-refresh da fila
  useEffect(() => {
    if (!pin) return;
    const id = setInterval(() => load(pin).catch(() => undefined), 15000);
    return () => clearInterval(id);
  }, [pin, load]);

  async function login() {
    setLogging(true);
    setLoginError(false);
    try {
      await load(pinInput);
      sessionStorage.setItem(PIN_KEY, pinInput);
      setPin(pinInput);
      loadMenu();
    } catch {
      setLoginError(true);
    } finally {
      setLogging(false);
    }
  }

  async function setStatus(token: string, status: string) {
    if (!pin) return;
    if (status === "cancelado" && !window.confirm("Cancelar este pedido?")) return;
    setBusy(token);
    try {
      await fetch(`/api/orders/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify({ status }),
      });
      await load(pin);
    } finally {
      setBusy(null);
    }
  }

  async function patchItem(id: number, body: Record<string, unknown>) {
    if (!pin) return;
    setBusy(`item-${id}`);
    try {
      await fetch(`/api/menu-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify(body),
      });
      await loadMenu();
      setPriceDraft((d) => {
        const next = { ...d };
        delete next[id];
        return next;
      });
    } finally {
      setBusy(null);
    }
  }

  // ── LOGIN ─────────────────────────────────────────
  if (!pin) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-4 py-16">
        <div className="w-full max-w-sm rounded-2xl border border-bark bg-soot p-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-ember text-coal">
            <Flame className="size-8" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-3xl uppercase tracking-wide text-cream">
            Painel da Loja
          </h1>
          <p className="mt-2 text-sm text-latte">Área restrita da família Possato</p>
          <input
            type="password"
            inputMode="numeric"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="PIN de acesso"
            className="mt-6 w-full rounded-xl border border-bark bg-coal px-4 py-3 text-center text-lg font-black tracking-[0.4em] text-cream placeholder:tracking-normal placeholder:font-semibold focus:border-ember focus:outline-none"
            aria-label="PIN de acesso"
          />
          {loginError && (
            <p className="mt-3 text-sm font-bold text-red-400">PIN incorreto. Tente de novo.</p>
          )}
          <button onClick={login} disabled={logging || !pinInput} className="btn-ember mt-4 w-full disabled:opacity-50">
            {logging ? <Loader2 className="size-5 animate-spin" aria-hidden /> : "Entrar"}
          </button>
          <p className="mt-4 text-[11px] leading-relaxed text-latte/50">
            Demonstração: PIN <strong>2018</strong> (ano de fundação). Em produção, configure a
            variável <code>ADMIN_PIN</code> no servidor.
          </p>
        </div>
      </div>
    );
  }

  const filtered = ordersList.filter((o) => {
    if (filter === "fila") return ["novo", "preparo", "rota"].includes(o.status);
    if (filter === "concluidos") return ["concluido", "cancelado"].includes(o.status);
    return true;
  });

  const timeFmt = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-wide text-cream">
            PAINEL <span className="text-ember">POSSATÃO</span>
          </h1>
          <p className="mt-1 flex items-center gap-2 text-xs font-bold text-latte">
            <RefreshCw className="size-3.5 animate-spin" style={{ animationDuration: "4s" }} aria-hidden />
            Fila atualiza a cada 15s · {stats?.activeCount ?? 0} pedido(s) ativo(s)
          </p>
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem(PIN_KEY);
            setPin(null);
          }}
          className="flex items-center gap-2 rounded-full border border-bark px-4 py-2 text-sm font-bold text-latte hover:border-red-400 hover:text-red-300"
        >
          <LogOut className="size-4" aria-hidden /> Sair
        </button>
      </div>

      {/* tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            { v: "pedidos", label: "Pedidos", icon: ClipboardList },
            { v: "cardapio", label: "Cardápio", icon: UtensilsCrossed },
            { v: "resumo", label: "Resumo do dia", icon: TrendingUp },
          ] as const
        ).map((t) => (
          <button
            key={t.v}
            onClick={() => setTab(t.v)}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-display text-base uppercase tracking-wide transition-all ${
              tab === t.v ? "bg-ember text-coal" : "border border-bark bg-soot text-cream/70 hover:text-mustard"
            }`}
          >
            <t.icon className="size-4" aria-hidden /> {t.label}
          </button>
        ))}
      </div>

      {/* ── PEDIDOS ── */}
      {tab === "pedidos" && (
        <div className="mt-6">
          <div className="mb-4 flex gap-2">
            {(
              [
                { v: "fila", label: "Na fila" },
                { v: "todos", label: "Todos (48h)" },
                { v: "concluidos", label: "Finalizados" },
              ] as const
            ).map((f) => (
              <button
                key={f.v}
                onClick={() => setFilter(f.v)}
                className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider ${
                  filter === f.v ? "bg-mustard text-coal" : "border border-bark text-latte hover:text-cream"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {!loadedOnce ? (
            <div className="grid place-items-center py-20">
              <Loader2 className="size-8 animate-spin text-ember" aria-hidden />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-bark bg-soot py-16 text-center">
              
              <p className="mt-3 font-display text-2xl tracking-wide text-cream">Nenhum pedido aqui</p>
              <p className="mt-1 text-sm text-latte">Quando chegar pedido novo, ele aparece na hora.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filtered.map((o) => {
                const isDelivery = o.orderType === "entrega";
                return (
                  <article key={o.token} className="rounded-2xl border border-bark bg-soot p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-2xl tracking-wide text-cream">
                          #{o.number}
                          <span className="ml-2 text-sm text-latte">{timeFmt.format(new Date(o.createdAt))}</span>
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-cream/90">
                          {o.customerName} ·{" "}
                          <a
                            href={`https://wa.me/55${o.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-whats hover:underline"
                          >
                            <MessageCircle className="size-3.5" aria-hidden /> {o.phone}
                          </a>
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${STATUS_STYLE[o.status]}`}>
                        {STATUS_LABELS[o.status]}
                      </span>
                    </div>

                    <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-latte">
                      {isDelivery ? <Bike className="size-4 text-ember" aria-hidden /> : <Store className="size-4 text-ember" aria-hidden />}
                      {isDelivery
                        ? `${o.street ?? ""}, ${o.streetNumber ?? ""}${o.complement ? ` (${o.complement})` : ""} — ${o.district ?? ""}`
                        : "Retirada no balcão"}
                    </p>

                    <ul className="mt-3 space-y-1.5 rounded-xl bg-coal/60 p-3 text-sm">
                      {o.items.map((it, i) => (
                        <li key={i}>
                          <span className="font-bold text-cream">
                            <span className="text-mustard">{it.quantity}x</span> {it.name}
                          </span>
                          {it.addons.length > 0 && (
                            <span className="block pl-5 text-xs text-mustard/80">+ {it.addons.map((a) => a.name).join(", ")}</span>
                          )}
                          {it.notes && <span className="block pl-5 text-xs italic text-latte">obs: {it.notes}</span>}
                        </li>
                      ))}
                    </ul>
                    {o.notes && <p className="mt-2 text-xs italic text-latte">Obs.: {o.notes}</p>}

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="text-xs font-bold text-latte">
                        {PAYMENT_LABELS[o.paymentMethod]}
                        {o.changeForCents ? ` · troco p/ ${formatBRL(o.changeForCents)}` : ""}
                        {isDelivery && o.deliveryFeeCents > 0 ? ` · frete ${formatBRL(o.deliveryFeeCents)}` : ""}
                      </span>
                      <strong className="font-display text-2xl text-mustard">{formatBRL(o.totalCents)}</strong>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {busy === o.token && <Loader2 className="size-5 animate-spin text-ember" aria-hidden />}
                      {o.status === "novo" && (
                        <>
                          <button onClick={() => setStatus(o.token, "preparo")} className="flex items-center gap-1.5 rounded-full bg-ember px-4 py-2 text-xs font-black uppercase tracking-wide text-coal hover:bg-mustard">
                            <ChefHat className="size-4" aria-hidden /> Aceitar · pôr na chapa
                          </button>
                          <button onClick={() => setStatus(o.token, "cancelado")} className="rounded-full border border-red-400/40 px-4 py-2 text-xs font-black uppercase tracking-wide text-red-300 hover:bg-red-400/10">
                            Recusar
                          </button>
                        </>
                      )}
                      {o.status === "preparo" && (
                        <button onClick={() => setStatus(o.token, "rota")} className="flex items-center gap-1.5 rounded-full bg-sky-400 px-4 py-2 text-xs font-black uppercase tracking-wide text-coal hover:bg-sky-300">
                          <Bike className="size-4" aria-hidden /> {isDelivery ? "Saiu p/ entrega" : "Pronto p/ retirada"}
                        </button>
                      )}
                      {o.status === "rota" && (
                        <button onClick={() => setStatus(o.token, "concluido")} className="rounded-full bg-leaf px-4 py-2 text-xs font-black uppercase tracking-wide text-coal hover:brightness-110">
                          Concluir pedido
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── CARDÁPIO ── */}
      {tab === "cardapio" && (
        <div className="mt-6 space-y-8">
          <p className="rounded-xl border border-bark bg-soot px-4 py-3 text-sm text-latte">
            Marque um item como <strong className="text-red-300">esgotado</strong> e ele some do pedido
            online na hora. Ajuste preços direto por aqui.
          </p>
          {!menu ? (
            <div className="grid place-items-center py-16">
              <Loader2 className="size-8 animate-spin text-ember" aria-hidden />
            </div>
          ) : (
            menu.categories.map((c) => (
              <section key={c.id}>
                <h2 className="mb-3 font-display text-2xl uppercase tracking-wide text-mustard">{c.name}</h2>
                <div className="overflow-hidden rounded-xl border border-bark">
                  {c.items.map((it, i) => {
                    const draft = priceDraft[it.id];
                    return (
                      <div
                        key={it.id}
                        className={`flex flex-wrap items-center gap-3 px-4 py-3 ${i % 2 ? "bg-soot" : "bg-coal/40"} ${!it.available ? "opacity-60" : ""}`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-bold text-cream">
                            {it.name} {it.featured && <span title="Destaque na home">⭐</span>}
                          </span>
                          <span className="block truncate text-xs text-latte/60">{it.description}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <input
                            value={draft ?? (it.priceCents / 100).toFixed(2).replace(".", ",")}
                            onChange={(e) => setPriceDraft((d) => ({ ...d, [it.id]: e.target.value }))}
                            className="w-20 rounded-lg border border-bark bg-coal px-2 py-1.5 text-right text-sm font-bold text-mustard focus:border-ember focus:outline-none"
                            aria-label={`Preço de ${it.name}`}
                          />
                          {draft !== undefined && (
                            <button
                              onClick={() => {
                                const cents = Math.round(
                                  parseFloat(draft.replace(",", ".")) * 100
                                );
                                if (!Number.isFinite(cents) || cents < 100) return;
                                patchItem(it.id, { priceCents: cents });
                              }}
                              className="rounded-lg bg-ember px-2.5 py-1.5 text-xs font-black text-coal hover:bg-mustard"
                            >
                              Salvar
                            </button>
                          )}
                        </span>
                        <button
                          onClick={() => patchItem(it.id, { available: !it.available })}
                          disabled={busy === `item-${it.id}`}
                          className={`w-28 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide transition-colors ${
                            it.available ? "bg-leaf/15 text-leaf hover:bg-leaf/25" : "bg-red-400/15 text-red-300 hover:bg-red-400/25"
                          }`}
                        >
                          {busy === `item-${it.id}` ? "…" : it.available ? "Disponível" : "Esgotado"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {/* ── RESUMO ── */}
      {tab === "resumo" && stats && (
        <div className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: BadgeDollarSign, label: "Faturamento hoje", value: formatBRL(stats.todayRevenueCents), accent: "text-leaf" },
              { icon: ClipboardList, label: "Pedidos hoje", value: String(stats.todayCount), accent: "text-mustard" },
              { icon: TrendingUp, label: "Ticket médio hoje", value: formatBRL(stats.avgTicketCents), accent: "text-ember" },
              { icon: ChefHat, label: "Na fila agora", value: String(stats.activeCount), accent: "text-sky-300" },
              { icon: Users, label: "Clientes na base", value: String(stats.customersCount), accent: "text-mustard" },
              { icon: Ticket, label: "Cupons acumulados", value: String(stats.stampsTotal), accent: "text-ember" },
            ].map((s) => (
              <div key={s.label} className="card-lift rounded-2xl border border-bark bg-soot p-5">
                <s.icon className={`size-7 ${s.accent}`} aria-hidden />
                <p className={`mt-3 font-display text-4xl tracking-wide ${s.accent}`}>{s.value}</p>
                <p className="mt-1 text-xs font-black uppercase tracking-wider text-latte">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-bark bg-soot p-6">
            <h2 className="font-display text-2xl uppercase tracking-wide text-cream">Mais vendidos</h2>
            {stats.topItems.length === 0 ? (
              <p className="mt-3 text-sm text-latte">Ainda sem vendas registradas.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {stats.topItems.map((t, i) => {
                  const max = stats.topItems[0]?.qty || 1;
                  return (
                    <li key={t.name}>
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-cream">{i + 1}. {t.name}</span>
                        <span className="text-mustard">{t.qty} un.</span>
                      </div>
                      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-coal">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-ember to-mustard"
                          style={{ width: `${(t.qty / max) * 100}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}