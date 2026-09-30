import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetail from "@/components/shop/ProductDetail";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!product || product.status !== "ACTIVE") notFound();

  return (
    <ProductDetail
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        mood: product.mood,
        description: product.description,
        shortDescription: product.shortDescription,
        category: product.category,
        priceUSD: Number(product.priceUSD),
        stock: product.stock,
        sizeLabel: product.sizeLabel,
        waxType: product.waxType,
        wickType: product.wickType,
        burnTimeHours: product.burnTimeHours ? Number(product.burnTimeHours) : null,
        scentFamily: product.scentFamily,
        scentIntensity: product.scentIntensity,
        topNotes: product.topNotes,
        middleNotes: product.middleNotes,
        baseNotes: product.baseNotes,
        ingredients: product.ingredients,
        allergens: product.allergens,
        careInstructions: product.careInstructions,
        vesselMaterial: product.vesselMaterial,
        vesselColor: product.vesselColor,
        dimensions: product.dimensions,
        netWeight: product.netWeight,
        featured: product.featured,
        images: product.images.map((image) => ({ id: image.id, url: image.url, alt: image.alt })),
      }}
    />
  );
}
