import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductItem from "@/components/shop/ProductItem";
import { dbText } from "@/lib/db-text";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();

  const products = q
    ? await prisma.product.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { mood: { contains: q, mode: "insensitive" } },
            { shortDescription: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        include: { images: { where: { isPrimary: true }, take: 1, orderBy: { sortOrder: "asc" } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <main className="min-h-screen bg-[#f6f1e9] text-[#211d19]">
      <section className="mx-auto max-w-[1200px] px-5 py-14 md:px-12 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[.34em] text-[#9c5638]">Find your mood</p>
          <h1 className="serif mt-3 text-5xl leading-none md:text-7xl">Search the collection.</h1>
          <form action="/search" className="mx-auto mt-9 flex max-w-2xl items-center border-b border-[#211d19]/25 pb-3">
            <Search size={20} strokeWidth={1.4} className="mr-3 shrink-0 text-[#9c5638]" />
            <input name="q" defaultValue={q} autoFocus placeholder="Search candles, moods, scents..." className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#776f67]/60 md:text-lg" />
            <button type="submit" className="ml-3 text-[10px] font-bold uppercase tracking-[.2em] hover:text-[#9c5638]">Search</button>
          </form>
        </div>

        {q ? (
          <div className="mt-16">
            <div className="flex items-end justify-between border-b border-[#211d19]/10 pb-4">
              <h2 className="serif text-3xl md:text-4xl">Results for “{dbText(q)}”</h2>
              <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#776f67]">{products.length} found</span>
            </div>
            {products.length ? (
              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {products.map(product => (
                  <ProductItem
                    key={product.id}
                    product={{
                      id: product.id,
                      name: dbText(product.name),
                      slug: product.slug,
                      mood: dbText(product.mood),
                      shortDescription: dbText(product.shortDescription),
                      description: dbText(product.description),
                      img: product.images[0]?.url || "/hero.jpg",
                      priceUSD: Number(product.priceUSD),
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="serif text-3xl">Nothing found yet.</p>
                <Link href="/collections/candles" className="mt-5 inline-block border-b border-[#211d19] pb-1 text-[10px] font-bold uppercase tracking-[.2em]">Browse all candles</Link>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center text-[#776f67]">
            <p className="serif text-3xl text-[#211d19]">What are you in the mood for?</p>
            <p className="mt-3 text-sm">Search by candle name, mood, or scent description.</p>
          </div>
        )}
      </section>
    </main>
  );
}
