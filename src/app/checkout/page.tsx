"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Bike,
  CreditCard,
  Loader2,
  MapPin,
  MessageCircle,
  QrCode,
  ShoppingBag,
  Store,
  Wallet,
} from "lucide-react";
import { formatBRL, getOpenStatus, NEIGHBORHOODS, RULES, STORE } from "@/lib/config";
import type { CheckoutPayload } from "@/lib/types";
import { lineTotal, useCart } from "@/components/cart-context";

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const inputCls =
  "w-full rounded-xl border border-bark bg-coal/60 px-4 py-3 text-sm font-semibold text-cream placeholder:text-latte/40 focus:border-ember focus:outline-none";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotalCents, clear, open, hydrated } = useCart();

  const [orderType, setOrderType] = useState<"entrega" | "retirada">("entrega");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [complement, setComplement] = useState("");
  const [payment, setPayment] = useState<"pix" | "credito" | "debito" | "dinheiro">("pix");
  const [changeFor, setChangeFor] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [closedNotice, setClosedNotice] = useState(false);

  useEffect(() => {
    const update = () => setClosedNotice(!getOpenStatus().open);
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  const hood = NEIGHBORHOODS.find((n) => n.name === district);
  const feeCents = useMemo(() => {
    if (orderType === "retirada") return 0;
    if (!hood) return null;
    return subtotalCents >= RULES.freeDeliveryFromCents ? 0 : hood.feeCents;
  }, [orderType, hood, subtotalCents]);

  const totalCents = subtotalCents + (feeCents ?? 0);
  const missingForMin = RULES.minOrderCents - subtotalCents;

  async function submit() {
    setError(null);
    if (name.trim().length < 2) return setError("Informe seu nome.");
    if (phone.replace(/\D/g, "").length < 10) return setError("Informe um WhatsApp válido com DDD.");
    if (orderType === "entrega") {
      if (!street.trim() || !number.trim()) return setError("Informe rua e número para a entrega.");
      if (!hood) return setError("Escolha o bairro de entrega.");
      if (missingForMin > 0)
        return setError(`Pedido mínimo para entrega: ${formatBRL(RULES.minOrderCents)}. Faltam ${formatBRL(missingForMin)}.`);
    }
    const changeNum = changeFor.trim()
      ? Math.round(parseFloat(changeFor.replace(",", ".")) * 100)
      : null;
    if (payment === "dinheiro" && changeNum !== null) {
      if (!Number.isFinite(changeNum) || changeNum <= 0) {
        return setError("Informe um valor de troco válido ou deixe em branco.");
      }
      if (changeNum < totalCents) {
        return setError(`O troco precisa ser de pelo menos ${formatBRL(totalCents)} (total do pedido).`);
      }
    }

    const payload: CheckoutPayload = {
      customerName: name.trim(),
      phone,
      orderType,
      street,
      number,
      district,
      complement,
      paymentMethod: payment,
      changeForCents: payment === "dinheiro" ? changeNum : null,
      notes,
      items: lines.map((l) => ({
        itemId: l.itemId,
        quantity: l.quantity,
        addonIds: l.addons.map((a) => a.id),
        notes: l.notes,
      })),
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar o pedido. Tente de novo.");
        setSubmitting(false);
        return;
      }
      setDone(true);
      clear();
      router.push(`/pedido/${data.token}`);
    } catch {
      setError("Falha de conexão. Verifique a internet e tente novamente.");
      setSubmitting(false);
    }
  }

  if (!hydrated && !done) {
    return (
      <div className="grid place-items-center px-4 py-32">
        <Loader2 className="size-9 animate-spin text-ember" aria-hidden />
        <p className="mt-4 font-display text-lg uppercase tracking-wide text-latte">Abrindo sua sacola…</p>
      </div>
    );
  }

  if (lines.length === 0 && !done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-28 text-center">
        <h1 className="font-display text-4xl tracking-wide text-cream">Sacola vazia</h1>
        <p className="mt-3 text-latte">Você ainda não escolheu nada. O MC Passatão espera por você.</p>
        <Link href="/cardapio" className="btn-ember mt-8">
          <ShoppingBag className="size-5" aria-hidden /> Ver cardápio
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="grid place-items-center px-4 py-32 text-center">
        <Loader2 className="size-10 animate-spin text-ember" aria-hidden />
        <p className="mt-4 font-display text-2xl tracking-wide text-cream">Preparando seu pedido…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl uppercase tracking-wide text-cream sm:text-5xl">
        FINALIZAR <span className="text-ember">PEDIDO</span>
      </h1>
      <p className="mt-2 text-sm text-latte">Últimos dados e pagamento.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          {/* 1 — tipo */}
          <section>
            <h2 className="mb-3 font-display text-2xl uppercase tracking-wide text-mustard">
              1 · Como quer receber?
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { v: "entrega", icon: Bike, title: "Entrega", desc: "25–45 min · grátis acima de R$ 60" },
                  { v: "retirada", icon: Store, title: "Retirar no balcão", desc: `Pronto em ~${RULES.pickupEtaMin} min · sem taxa` },
                ] as const
              ).map((o) => (
                <button
                  key={o.v}
                  onClick={() => setOrderType(o.v)}
                  className={`flex items-center gap-3 rounded-xl border-2 px-5 py-4 text-left transition-all ${
                    orderType === o.v
                      ? "border-ember bg-ember/10"
                      : "border-bark bg-soot hover:border-ember/50"
                  }`}
                >
                  <o.icon className={`size-7 ${orderType === o.v ? "text-ember" : "text-latte"}`} aria-hidden />
                  <span>
                    <span className="block font-display text-lg uppercase tracking-wide text-cream">{o.title}</span>
                    <span className="text-xs font-bold text-latte">{o.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* 2 — dados */}
          <section>
            <h2 className="mb-3 font-display text-2xl uppercase tracking-wide text-mustard">
              2 · Seus dados
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-latte">Seu nome *</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: João Silva" className={inputCls} autoComplete="name" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-latte">WhatsApp (com DDD) *</span>
                <input value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="(18) 99999-9999" inputMode="tel" className={inputCls} autoComplete="tel" />
              </label>
            </div>

            {orderType === "entrega" ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-latte">Rua *</span>
                  <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Ex.: Rua Rui Barbosa" className={inputCls} autoComplete="address-line1" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-latte">Número *</span>
                  <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="450" className={inputCls} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-latte">Bairro (taxa de entrega) *</span>
                  <select value={district} onChange={(e) => setDistrict(e.target.value)} className={inputCls}>
                    <option value="">Selecione o bairro…</option>
                    {NEIGHBORHOODS.map((n) => (
                      <option key={n.name} value={n.name}>
                        {n.name} — {n.feeCents === 0 ? "grátis" : formatBRL(n.feeCents)} · ~{n.etaMin} min
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-latte">Complemento / referência</span>
                  <input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, portão, ponto de referência…" className={inputCls} />
                </label>
              </div>
            ) : (
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-bark bg-soot px-5 py-4">
                <MapPin className="mt-0.5 size-5 shrink-0 text-ember" aria-hidden />
                <p className="text-sm text-latte">
                  Retire em <strong className="text-cream">{STORE.street}</strong> — {STORE.district},{" "}
                  {STORE.city}/{STORE.state}. {STORE.reference}.
                </p>
              </div>
            )}
          </section>

          {/* 3 — pagamento */}
          <section>
            <h2 className="mb-3 font-display text-2xl uppercase tracking-wide text-mustard">
              3 · Pagamento
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  { v: "pix", icon: QrCode, label: "Pix" },
                  { v: "credito", icon: CreditCard, label: "Crédito" },
                  { v: "debito", icon: Wallet, label: "Débito" },
                  { v: "dinheiro", icon: Banknote, label: "Dinheiro" },
                ] as const
              ).map((p) => (
                <button
                  key={p.v}
                  onClick={() => setPayment(p.v)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 transition-all ${
                    payment === p.v ? "border-ember bg-ember/10 text-ember" : "border-bark bg-soot text-latte hover:border-ember/50"
                  }`}
                >
                  <p.icon className="size-6" aria-hidden />
                  <span className="text-sm font-black text-cream">{p.label}</span>
                </button>
              ))}
            </div>
            {payment === "pix" && (
              <p className="mt-3 border border-leaf/25 bg-leaf/10 px-4 py-3 text-sm font-bold text-leaf">
                A chave Pix chega na confirmação do WhatsApp.
              </p>
            )}
            {(payment === "credito" || payment === "debito") && (
              <p className="mt-3 text-xs font-bold text-latte">
                A maquininha vai com o entregador{orderType === "retirada" ? " (ou pague no balcão)." : "."}
              </p>
            )}
            {payment === "dinheiro" && (
              <label className="mt-3 block max-w-xs">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-latte">Troco para quanto? (opcional)</span>
                <input value={changeFor} onChange={(e) => setChangeFor(e.target.value.replace(/[^\d.,]/g, ""))} placeholder="Ex.: 100,00" inputMode="decimal" className={inputCls} />
              </label>
            )}
            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-latte">Observações gerais do pedido</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={300} placeholder="Ex.: ligar ao chegar, embalar separado…" className={`${inputCls} resize-none`} />
            </label>
          </section>
        </div>

        {/* resumo */}
        <aside className="h-fit rounded-2xl border border-bark bg-soot p-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl uppercase tracking-wide text-cream">Resumo</h2>
            <button onClick={open} className="text-xs font-black uppercase tracking-wider text-mustard hover:text-ember">
              Editar sacola
            </button>
          </div>
          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-3 text-sm">
                <span className="text-cream/90">
                  <strong className="text-mustard">{l.quantity}x</strong> {l.name}
                  {l.addons.length > 0 && (
                    <span className="block text-xs text-latte">+ {l.addons.map((a) => a.name).join(", ")}</span>
                  )}
                  {l.notes && <span className="block text-xs italic text-latte/70">“{l.notes}”</span>}
                </span>
                <span className="shrink-0 font-bold text-cream">{formatBRL(lineTotal(l))}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-bark pt-4 text-sm">
            <div className="flex justify-between text-latte">
              <dt>Subtotal</dt>
              <dd className="font-bold text-cream">{formatBRL(subtotalCents)}</dd>
            </div>
            <div className="flex justify-between text-latte">
              <dt>Entrega {orderType === "retirada" && "(retirada)"}</dt>
              <dd className={`font-bold ${feeCents === 0 ? "text-leaf" : "text-cream"}`}>
                {orderType === "retirada" ? "—" : feeCents === null ? "escolha o bairro" : feeCents === 0 ? "GRÁTIS" : formatBRL(feeCents)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-bark pt-3">
              <dt className="font-display text-xl uppercase tracking-wide text-cream">Total</dt>
              <dd className="font-display text-3xl text-mustard">{formatBRL(totalCents)}</dd>
            </div>
          </dl>

          {orderType === "entrega" && missingForMin > 0 && (
            <p className="mt-3 flex items-start gap-2 border border-mustard/30 bg-mustard/10 px-3 py-2.5 text-xs font-bold leading-relaxed text-mustard">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              Faltam {formatBRL(missingForMin)} para o pedido mínimo de entrega.
            </p>
          )}

          {orderType === "entrega" &&
            hood &&
            feeCents !== null &&
            feeCents > 0 &&
            subtotalCents < RULES.freeDeliveryFromCents && (
              <p className="mt-3 border border-leaf/25 bg-leaf/10 px-3 py-2.5 text-xs font-bold leading-relaxed text-leaf">
                Faltam {formatBRL(RULES.freeDeliveryFromCents - subtotalCents)} para a entrega sair
                grátis.
              </p>
            )}

          {closedNotice && (
            <p className="mt-3 border border-mustard/30 bg-mustard/10 px-3 py-2.5 text-xs font-bold leading-relaxed text-mustard">
              Estamos fechados agora — envie o pedido assim mesmo e confirmamos o horário de
              entrega no WhatsApp.
            </p>
          )}

          {error && (
            <p className="mt-3 flex items-start gap-2 rounded-xl border border-red-400/40 bg-red-400/10 px-3 py-2.5 text-sm font-bold text-red-300" role="alert">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {error}
            </p>
          )}

          <button onClick={submit} disabled={submitting} className="btn-ember mt-4 w-full disabled:opacity-60">
            {submitting ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden /> Enviando…
              </>
            ) : (
              <>
                <MessageCircle className="size-5" aria-hidden /> Enviar pedido <ArrowRight className="size-5" aria-hidden />
              </>
            )}
          </button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-latte/60">
            Seus dados são usados apenas para este pedido.
          </p>
        </aside>
      </div>
    </div>
  );
}