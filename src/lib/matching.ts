import { sql } from "./db";

type Item = { id: string; title: string; description: string; location: string; category: string; report_type: "lost" | "found" };

const words = (s: string) => new Set(s.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []);

function similarity(a: Item, b: Item) {
  const A = words(`${a.title} ${a.description}`);
  const B = words(`${b.title} ${b.description}`);
  const shared = [...A].filter((w) => B.has(w)).length;
  const total = new Set([...A, ...B]).size || 1;
  let s = (shared / total) * 70 + 15;
  if (a.location.trim().toLowerCase() === b.location.trim().toLowerCase()) s += 15;
  return Math.min(100, Math.round(s * 100) / 100);
}

export async function findAndSaveMatches(item: Item) {
  const opposite = item.report_type === "lost" ? "found" : "lost";
  const candidates = await sql<Item[]>`
    select id, title, description, location, category, report_type from items
    where status = 'active' and report_type = ${opposite} and category = ${item.category} and id <> ${item.id}
    order by created_at desc limit 200`;

  const top = candidates
    .map((c) => ({ c, confidence: similarity(item, c) }))
    .filter((x) => x.confidence >= 35)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  for (const { c, confidence } of top) {
    const lostId = item.report_type === "lost" ? item.id : c.id;
    const foundId = item.report_type === "found" ? item.id : c.id;
    await sql`
      insert into ai_matches (lost_item_id, found_item_id, confidence_score)
      values (${lostId}, ${foundId}, ${confidence})
      on conflict (lost_item_id, found_item_id) do nothing`;
  }
  return top.map(({ c, confidence }) => ({ item_id: c.id, title: c.title, location: c.location, report_type: c.report_type, confidence }));
}
