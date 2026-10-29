import { getMenuPayload } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getMenuPayload();
    return Response.json(payload);
  } catch {
    return Response.json({ error: "Falha ao carregar o cardápio" }, { status: 500 });
  }
}