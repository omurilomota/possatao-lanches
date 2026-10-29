"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bike,
  CheckCircle2,
  ChefHat,
  Clock,
  Loader2,
  MapPin,
  MessageCircle,
  PackageCheck,
  RefreshCw,
  Ticket,
  XCircle,
} from "lucide-react";
import { formatBRL, PAYMENT_LABELS, RULES, STORE } from "@/lib/config";
import type { PublicOrder } from "@/lib/types";

const FLOW = ["novo", "preparo", "rota", "concluido"];

export default function PedidoPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stop = false;
    async function load() {
      try {
        const res = await fetch(`/api/orders/${token}`, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) setFailed(true);
          return;
        }
        const data = (await res.json()) as PublicOrder;
        if (!stop) setOrder(data);
        if (data.status === "concluido" || data.status === "cancelado") stop = true;
      } catch { /* tenta de novo no próximo ciclo */ }
    }
    load();
    const id = setInterval(() => {
      if (!stop) load();
    }, 12000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [token]);

  if (failed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-28 text-center">
        
        <h1 className="mt-4 font-display text-3xl tracking-wide text-cream">Pedido não encontrado</h1>
        <p className="mt-3 text-latte">Confira o link ou chame a gente no WhatsApp.</p>
        <Link href="/cardapio" className="btn-ember mt-8">Voltar ao cardápio</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="grid place-items-center px-4 py-32">
        <Loader2 className="size-10 animate-spin text-ember" aria-hidden />
        <p className="mt-4 font-display text-xl tracking-wide text-latte">Buscando seu pedido…</p>
      </div>
    );
  }

  const cancelled = order.status === "cancelado";
  const stepIdx = FLOW.indexOf(order.status);
  const isDelivery = order.orderType === "entrega";
  const steps = [
    { icon: CheckCircle2, label: "Recebido" },
    { icon: ChefHat, label: "Na chapa" },
    { icon: isDelivery ? Bike : PackageCheck, label: isDelivery ? "Na rua" : "No balcão" },
    { icon: PackageCheck, label: isDelivery ? "Entregue" : "Retirado" },
  ];
  const stampProgress = ((RULES.stampValueCents - order.centsToNextStamp) / RULES.stampValueCents) * 100;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-leaf/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-leaf">
          <CheckCircle2 className="size-4" aria-hidden /> Pedido registrado
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-wide text-cream sm:text-6xl">
          PEDIDO <span className="text-ember">#{order.number}</span>
        </h1>
        <p className="mt-2 text-sm text-latte">
          {cancelled ? (
            "Este pedido foi cancelado."
          ) : (
            <>
              Valeu, <strong className="text-cream">{order.customerName.split(" ")[0]}</strong>!
              Confirme pelo WhatsApp abaixo.
            </>
          )}
        </p>
      </div>

      {/* CTA WhatsApp */}
      {!cancelled && (
        <a
          href={order.waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-8 flex items-center justify-between gap-4 rounded-2xl border-2 border-whats/50 bg-whats/10 px-6 py-5 transition-all hover:-translate-y-0.5 hover:bg-whats/20"
        >
          <span>
            <span className="block font-display text-xl uppercase tracking-wide text-whats sm:text-2xl">
              Enviar no WhatsApp
            </span>
            <span className="text-xs font-bold text-cream/75 sm:text-sm">
              O pedido já vai pronto — é só enviar. A confirmação é por lá.
            </span>
          </span>
          <span className="relative grid size-14 shrink-0 place-items-center rounded-full bg-whats text-coal transition-transform group-hover:scale-110">
            <span className="animate-ring absolute inset-0 rounded-full bg-whats" aria-hidden />
            <MessageCircle className="relative size-7" aria-hidden />
          </span>
        </a>
      )}

      {/* status */}
      <div className="mt-8 rounded-2xl border border-bark bg-soot p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl uppercase tracking-wide text-cream">Acompanhe o status</h2>
          {!cancelled && order.status !== "concluido" && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-latte/60">
              <RefreshCw className="size-3 animate-spin" style={{ animationDuration: "3s" }} aria-hidden />
              atualiza sozinho
            </span>
          )}
        </div>
        {cancelled ? (
          <p className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 font-bold text-red-300">
            <XCircle className="size-5" aria-hidden /> Pedido cancelado. Qualquer dúvida, chame no WhatsApp.
          </p>
        ) : (
          <ol className="mt-5 grid grid-cols-4 gap-2">
            {steps.map((s, i) => {
              const doneStep = i <= stepIdx;
              const current = i === stepIdx;
              return (
                <li key={s.label} className="flex flex-col items-center gap-2 text-center">
                  <span
                    className={`grid size-10 place-items-center border-2 transition-colors sm:size-12 ${
                      doneStep ? "border-ember bg-ember text-coal" : "border-bark bg-coal text-latte/40"
                    } ${current ? "shadow-[0_0_24px_-4px_rgba(255,90,31,0.8)]" : ""}`}
                  >
                    <s.icon className="size-4 sm:size-5" aria-hidden />
                  </span>
                  <span className={`text-[10px] font-black uppercase leading-tight tracking-wide sm:text-[11px] ${doneStep ? "text-cream" : "text-latte/40"}`}>
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
        {!isDelivery && !cancelled && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-coal/60 px-4 py-3 text-sm text-latte">
            <MapPin className="mt-0.5 size-4 shrink-0 text-ember" aria-hidden />
            Retirada em <strong className="text-cream">{STORE.street}</strong> — {STORE.district}. Pronto em ~{RULES.pickupEtaMin} min.
          </p>
        )}
      </div>

      {/* clube do cupom */}
      <div className="mt-6 rounded-2xl border border-mustard/30 bg-mustard/10 p-6">
        <p className="flex items-center gap-2 font-display text-xl uppercase tracking-wide text-mustard">
          <Ticket className="size-6" aria-hidden /> Clube do Cupom
        </p>
        <p className="mt-2 text-sm font-bold text-cream/90">
          {order.stampsEarned} {order.stampsEarned === 1 ? "cupom" : "cupons"} acumulado
          {order.stampsEarned === 1 ? "" : "s"} para os sorteios.
        </p>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-coal/60">
          <div className="h-full rounded-full bg-mustard transition-all duration-700" style={{ width: `${stampProgress}%` }} />
        </div>
        <p className="mt-2 text-xs font-bold text-latte">
          Faltam {formatBRL(order.centsToNextStamp)} para o próximo cupom.
        </p>
      </div>

      {/* resumo */}
      <div className="mt-6 rounded-2xl border border-bark bg-soot p-6">
        <h2 className="font-display text-xl uppercase tracking-wide text-cream">Seu pedido</h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((it, i) => (
            <li key={i} className="flex justify-between gap-3 text-sm">
              <span className="text-cream/90">
                <strong className="text-mustard">{it.quantity}x</strong> {it.name}
                {it.addons.length > 0 && (
                  <span className="block text-xs text-latte">+ {it.addons.map((a) => a.name).join(", ")}</span>
                )}
                {it.notes && <span className="block text-xs italic text-latte/70">“{it.notes}”</span>}
              </span>
              <span className="shrink-0 font-bold text-cream">{formatBRL(it.unitPriceCents * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-bark pt-4 text-sm">
          <div className="flex justify-between text-latte">
            <dt>Subtotal</dt>
            <dd className="font-bold text-cream">{formatBRL(order.subtotalCents)}</dd>
          </div>
          {isDelivery && (
            <div className="flex justify-between text-latte">
              <dt>Entrega</dt>
              <dd className={`font-bold ${order.deliveryFeeCents === 0 ? "text-leaf" : "text-cream"}`}>
                {order.deliveryFeeCents === 0 ? "GRÁTIS" : formatBRL(order.deliveryFeeCents)}
              </dd>
            </div>
          )}
          <div className="flex justify-between text-latte">
            <dt>Pagamento</dt>
            <dd className="font-bold text-cream">{PAYMENT_LABELS[order.paymentMethod]}</dd>
          </div>
          {order.paymentMethod === "dinheiro" && order.changeForCents && (
            <div className="flex justify-between text-latte">
              <dt>Troco para</dt>
              <dd className="font-bold text-cream">{formatBRL(order.changeForCents)}</dd>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-bark pt-3">
            <dt className="font-display text-xl uppercase tracking-wide text-cream">Total</dt>
            <dd className="font-display text-3xl text-mustard">{formatBRL(order.totalCents)}</dd>
          </div>
        </dl>
        <p className="mt-4 flex items-center gap-2 text-xs text-latte/60">
          <Clock className="size-3.5" aria-hidden />
          Feito às {new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date(order.createdAt))} · horário de Junqueirópolis
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link href="/cardapio" className="btn-ghost">Fazer outro pedido</Link>
      </div>
    </div>
  );
}