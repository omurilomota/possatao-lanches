import { db } from "@/db";
import { categories, menuItems, addons } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import type { MenuPayload } from "./types";

export function adminPin() {
  return process.env.ADMIN_PIN ?? "2018";
}

export function isAdmin(req: Request) {
  return req.headers.get("x-admin-pin") === adminPin();
}

export async function getMenuPayload(): Promise<MenuPayload> {
  const [cats, items, adds] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select().from(menuItems).orderBy(asc(menuItems.sortOrder)),
    db.select().from(addons).where(eq(addons.active, true)).orderBy(asc(addons.id)),
  ]);
  return {
    categories: cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      items: items
        .filter((i) => i.categoryId === c.id)
        .map((i) => ({
          id: i.id,
          categoryId: i.categoryId,
          name: i.name,
          slug: i.slug,
          description: i.description,
          priceCents: i.priceCents,
          imageUrl: i.imageUrl,
          featured: i.featured,
          available: i.available,
          tag: i.tag,
        })),
    })),
    addons: adds.map((a) => ({ id: a.id, name: a.name, priceCents: a.priceCents })),
  };
}

export function orderNumber(id: number) {
  return String(id).padStart(4, "0");
}

export function normalizePhone(raw: string) {
  return raw.replace(/\D/g, "");
}