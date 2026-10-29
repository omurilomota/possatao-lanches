import Link from "next/link";
import { STORE, WA_DEFAULT_LINK } from "@/lib/config";

export const metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="font-display text-7xl leading-none tracking-wide text-ember">404</p>
      <h1 className="mt-4 font-display text-3xl tracking-wide text-cream sm:text-4xl">
        ESSA PÁGINA NÃO EXISTE
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-latte">
        O link pode ter mudado. O lanche, não: a chapa segue quente todos os dias, das 17h às
        00h20.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/cardapio" className="btn-ember">
          Ver cardápio
        </Link>
        <a
          href={WA_DEFAULT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
        >
          {STORE.whatsappDisplay}
        </a>
      </div>
    </div>
  );
}