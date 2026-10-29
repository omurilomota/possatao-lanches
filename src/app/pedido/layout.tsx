import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Seu pedido",
  robots: { index: false, follow: false },
};

export default function PedidoLayout({ children }: { children: ReactNode }) {
  return children;
}