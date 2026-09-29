import { notFound } from "next/navigation";
import AdminPage, { type Tab } from "../page";

const sections = ["content", "collections", "collection", "products", "moods", "social"] as const;

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!sections.includes(section as (typeof sections)[number])) notFound();
  return <AdminPage initialTab={(section === "collection" ? "collections" : section) as Tab} />;
}
