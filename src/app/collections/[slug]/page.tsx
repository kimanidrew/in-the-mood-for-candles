import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await prisma.collection.findUnique({
    where: { slug },
    include: { products: { where: { status: "ACTIVE" }, include: { images: { orderBy: { sortOrder: "asc" } } }, orderBy: { createdAt: "desc" } } },
  });
  if (!collection || !collection.isActive) notFound();

  return (
    <main className="min-h-screen bg-[#f6f1e9] text-[#211d19]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f1e9]/90 px-5 backdrop-blur-xl md:px-12">
        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between"><Link href="/" className="flex items-center gap-3"><Image src="/tm-logo.svg" alt="In The Mood For Candles" width={48} height={48} unoptimized/><span className="serif text-[17px] tracking-[.1em]">IN THE MOOD</span></Link><Link href="/#products" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em]"><ArrowLeft size={14}/> Back to collection</Link></div>
      </header>
      <section className="mx-auto max-w-[1400px] px-5 py-12 md:px-12 md:py-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#2a180f]"><div className="relative h-[330px] md:h-[500px]"><Image src={collection.imageUrl || "/hero.jpg"} alt={collection.imageAlt || collection.title} fill unoptimized={collection.imageUrl?.startsWith("data:image/")} className="object-cover"/></div><div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"/><div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-14"><p className="text-[10px] font-bold uppercase tracking-[.34em] text-white/70">The collection</p><h1 className="serif mt-3 text-6xl leading-none md:text-8xl">{collection.title}</h1>{collection.subtitle && <p className="mt-4 max-w-xl text-sm text-white/75">{collection.subtitle}</p>}</div></div>
        <div className="mt-14 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9c5638]">Curated candles</p><h2 className="serif mt-2 text-5xl md:text-6xl">{collection.products.length} pieces to explore.</h2></div></div>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">{collection.products.map(product=>{const image=product.images[0]?.url||"/hero.jpg";return <article key={product.id} className="group"><div className="relative aspect-[.82] overflow-hidden bg-[#e2d8cb]"><Image src={image} alt={product.name} fill unoptimized={image.startsWith("data:image/")} sizes="(max-width:640px) 100vw,(max-width:1024px)50vw,25vw" className="object-cover transition duration-700 group-hover:scale-[1.04]"/></div><div className="pt-4"><h3 className="serif text-2xl">{product.name}</h3><p className="mt-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#9c5638]">{product.mood}</p><p className="mt-3 text-xs leading-5 text-[#776f67]">{product.shortDescription||product.description}</p></div></article>})}</div>
      </section>
    </main>
  );
}
