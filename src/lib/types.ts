export type MenuCategory = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  items: MenuItemDTO[];
};

export type MenuItemDTO = {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
  featured: boolean;
  available: boolean;
  tag: string | null;
};

export type AddonDTO = { id: number; name: string; priceCents: number };

export type MenuPayload = { categories: MenuCategory[]; addons: AddonDTO[] };

export type CartAddon = { id: number; name: string; priceCents: number };

export type CartLine = {
  key: string;
  itemId: number;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  quantity: number;
  addons: CartAddon[];
  notes: string;
};

export type CheckoutItem = {
  itemId: number;
  quantity: number;
  addonIds: number[];
  notes?: string;
};

export type CheckoutPayload = {
  customerName: string;
  phone: string;
  orderType: "entrega" | "retirada";
  street?: string;
  number?: string;
  district?: string;
  complement?: string;
  paymentMethod: "pix" | "credito" | "debito" | "dinheiro";
  changeForCents?: number | null;
  notes?: string;
  items: CheckoutItem[];
};

export type PublicOrder = {
  token: string;
  number: string;
  status: string;
  orderType: string;
  customerName: string;
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  paymentMethod: string;
  changeForCents: number | null;
  createdAt: string;
  waLink: string;
  stampsEarned: number;
  centsToNextStamp: number;
  items: {
    name: string;
    quantity: number;
    unitPriceCents: number;
    addons: { name: string; priceCents: number }[];
    notes: string | null;
  }[];
};