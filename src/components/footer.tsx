import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { STORE, WA_DEFAULT_LINK } from "@/lib/config";
import { FacebookIcon, InstagramIcon } from "./brand-icons";
import { Logo } from "./ui";

export function Footer() {
  return (
    <footer className="border-t border-bark bg-[#0e0b09]" id="contato">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 font-display text-lg tracking-wide text-mustard">
            “{STORE.slogan}”
          </p>
          <p className="mt-2 text-xs text-latte/60">CNPJ {STORE.cnpj} · desde {STORE.foundedYear}</p>
          <div className="mt-5 flex gap-3">
            <a
              href={STORE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="grid size-10 place-items-center border border-bark text-cream transition-colors hover:border-ember hover:text-ember"
              aria-label={`Instagram ${STORE.instagramHandle}`}
            >
              <InstagramIcon className="size-5" />
            </a>
            <a
              href={STORE.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="grid size-10 place-items-center border border-bark text-cream transition-colors hover:border-ember hover:text-ember"
              aria-label={`Facebook ${STORE.facebookHandle}`}
            >
              <FacebookIcon className="size-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 font-display text-base uppercase tracking-wide text-cream">
            <MapPin className="size-4 text-ember" aria-hidden /> Rua das Hortênsias, 75
          </h3>
          <address className="mt-3 text-sm not-italic leading-relaxed text-latte">
            {STORE.district}
            <br />
            {STORE.city}/{STORE.state} · CEP {STORE.zip}
          </address>
          <div className="mt-3 text-sm text-latte">
            <p className="flex items-center gap-2">
              <Clock className="size-4 text-ember" aria-hidden /> Todos os dias · 17h—00h20
            </p>
            <a
              href={WA_DEFAULT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-2 font-bold text-whats hover:underline"
            >
              <Phone className="size-4" aria-hidden /> {STORE.whatsappDisplay}
            </a>
          </div>
        </div>

        <div className="text-sm">
          <h3 className="font-display text-base uppercase tracking-wide text-cream">Atalhos</h3>
          <ul className="mt-3 space-y-2 font-bold">
            <li><Link href="/cardapio" className="text-latte hover:text-mustard">Cardápio digital</Link></li>
            <li><Link href="/delivery-junqueiropolis" className="text-latte hover:text-mustard">Taxas de entrega</Link></li>
            <li><Link href="/#historia" className="text-latte hover:text-mustard">A loja</Link></li>
            <li><Link href="/admin" className="text-latte/40 hover:text-latte">Área da loja</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-bark/60 py-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 px-4 text-[11px] text-latte/50 sm:flex-row sm:px-6">
          <p>© 2026 {STORE.name}</p>
          <p>Cardápio e taxas ilustrativos · valores a confirmar com a loja</p>
        </div>
      </div>
    </footer>
  );
}
