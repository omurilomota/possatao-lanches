import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Lilita_One, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { STORE } from "@/lib/config";
import { CartProvider } from "@/components/cart-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { CartDrawer, CartToast } from "@/components/cart-drawer";

const lilita = Lilita_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lilita",
  display: "swap",
});

const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(STORE.siteUrl),
  title: {
    default: "Possatão Lanches e Porções — Delivery de Lanches em Junqueirópolis/SP",
    template: "%s · Possatão Lanches",
  },
  description:
    "Possatão Lanches e Porções — o lanchão de Junqueirópolis desde 2018. Cardápio digital, pedido pelo WhatsApp e entrega grátis acima de R$ 60. Rua das Hortênsias, 75. Aberto todo dia, 17h—00h20.",
  keywords: [
    "lanches Junqueirópolis",
    "delivery Junqueirópolis",
    "hamburgueria Junqueirópolis",
    "Possatão",
    "porções Junqueirópolis",
    "lanche delivery",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Possatão Lanches e Porções — Delivery em Junqueirópolis/SP",
    description:
      "Uma Família Atendendo a Sua. Cardápio digital, pedido pelo WhatsApp e entrega grátis a partir de R$ 60.",
    url: "/",
    siteName: STORE.name,
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/images/hero-burger.jpg", width: 1536, height: 1024, alt: "Hambúrguer artesanal do Possatão" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Possatão Lanches — Junqueirópolis/SP",
    description: "O lanchão da cidade. Peça pelo cardápio digital, receba em casa.",
    images: ["/images/hero-burger.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#14100d",
};

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": `${STORE.siteUrl}/#restaurant`,
  name: STORE.name,
  alternateName: "Possatão Lanches Delivery",
  slogan: STORE.slogan,
  description:
    "Lanchonete familiar em Junqueirópolis/SP desde 2018. Hambúrgueres caseiros, lanches no pão francês, porções, sucos naturais e delivery próprio.",
  url: STORE.siteUrl,
  telephone: "+5518999990108",
  image: `${STORE.siteUrl}/images/hero-burger.jpg`,
  servesCuisine: ["Lanches", "Hambúrgueres", "Porções", "Brasileira"],
  priceRange: "R$ 20–40",
  currenciesAccepted: "BRL",
  paymentAccepted: "Pix, Cartão de crédito, Cartão de débito, Dinheiro",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua das Hortênsias, 75",
    addressLocality: "Junqueirópolis",
    addressRegion: "SP",
    postalCode: "00000-000",
    addressCountry: "BR",
  },
  geo: { "@type": "GeoCoordinates", latitude: STORE.lat, longitude: STORE.lng },
  hasMap: STORE.mapsDirections,
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "17:00",
      closes: "00:20",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: STORE.googleRating,
    reviewCount: STORE.googleReviews,
  },
  hasMenu: `${STORE.siteUrl}/cardapio`,
  acceptsReservations: false,
  foundingDate: "2018-06-04",
  sameAs: [STORE.instagram, STORE.facebook],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${lilita.variable} ${nunito.variable}`}>
      <body className="bg-coal font-sans text-cream antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
        />
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppFloat />
          <CartDrawer />
          <CartToast />
          <div className="bg-noise pointer-events-none fixed inset-0 z-[100] opacity-[0.035] mix-blend-overlay" aria-hidden />
        </CartProvider>
      </body>
    </html>
  );
}