import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) return Response.json({ error: "PIN inválido" }, { status: 401 });
  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId)) {
    return Response.json({ error: "ID inválido" }, { status: 422 });
  }
  const body = (await req.json()) as {
    available?: boolean;
    priceCents?: number;
    featured?: boolean;
  };
  const set: Record<string, unknown> = {};
  if (typeof body.available === "boolean") set.available = body.available;
  if (typeof body.featured === "boolean") set.featured = body.featured;
  if (typeof body.priceCents === "number" && body.priceCents >= 100 && body.priceCents <= 50000) {
    set.priceCents = Math.floor(body.priceCents);
  }
  if (Object.keys(set).length === 0) {
    return Response.json({ error: "Nada para atualizar" }, { status: 422 });
  }
  const [updated] = await db.update(menuItems).set(set).where(eq(menuItems.id, itemId)).returning();
  if (!updated) return Response.json({ error: "Item não encontrado" }, { status: 404 });
  return Response.json({ ok: true, item: updated });
}