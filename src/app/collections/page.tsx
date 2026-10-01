export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { dbText } from "@/lib/db-text";

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: { status: "ACTIVE" },
        select: { id: true },
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#f6f1e9] text-[#211d19]">
      <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-14 md:px-14 md:pb-28 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[.36em] text-[#9c5638]">
            Explore the collection
          </p>
          <h1 className="serif mt-5 text-6xl leading-[.92] tracking-[-.03em] md:text-8xl">
            Everything made to <span className="italic">set the mood.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[#776f67] md:text-base">
            Discover our curated collections, from everyday candlelight to thoughtful gifts and new scents.
          </p>
        </div>

        {collections.length === 0 ? (
          <div className="mx-auto mt-20 max-w-xl border border-black/10 bg-white/30 px-8 py-16 text-center">
            <p className="serif text-3xl">Collections are coming soon.</p>
            <Link
              href="/"
              className="mt-7 inline-flex items-center gap-3 border-b border-[#211d19] pb-2 text-[10px] font-bold uppercase tracking-[.2em]"
            >
              return home <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection, index) => {
              const imageUrl = collection.imageUrl || "/hero.jpg";
              const isDataImage = imageUrl.startsWith("data:image/");

              return (
                <Link
                  key={collection.id}
                  href={"/collections/" + collection.slug}
                  className={
                    "group block " +
                    (index === 0 ? "md:col-span-2 lg:col-span-2" : "")
                  }
                >
                  <article className="relative overflow-hidden bg-[#2a180f]">
                    <div className={"relative " + (index === 0 ? "aspect-[1.7] md:aspect-[1.9]" : "aspect-[1.05]")}>
                      <Image
                        src={imageUrl}
                        alt={dbText(collection.imageAlt || collection.title)}
                        fill
                        unoptimized={isDataImage}
                        sizes={index === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                        className="object-cover transition duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                        <div className="flex items-end justify-between gap-5">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[.3em] text-white/65">
                              Collection
                            </p>
                            <h2 className="serif mt-2 text-3xl leading-none md:text-4xl">
                              {dbText(collection.title)}
                            </h2>
                            {collection.subtitle && (
                              <p className="mt-3 max-w-lg text-xs leading-5 text-white/75">
                                {dbText(collection.subtitle)}
                              </p>
                            )}
                            <p className="mt-3 text-[9px] font-bold uppercase tracking-[.2em] text-white/60">
                              {collection.products.length} {collection.products.length === 1 ? "piece" : "pieces"}
                            </p>
                          </div>
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 transition duration-300 group-hover:bg-white group-hover:text-[#211d19]">
                            <ArrowRight size={17} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
