import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ authenticated: false, favoriteProductIds: [], favoriteMoodIds: [] });

  const data = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      favoriteProducts: {
        select: { id: true, name: true, slug: true, mood: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } },
      },
      favoriteMoods: { select: { id: true, name: true, slug: true } },
    },
  });

  return NextResponse.json({
    authenticated: true,
    favoriteProductIds: data?.favoriteProducts.map((item) => item.id) || [],
    favoriteMoodIds: data?.favoriteMoods.map((item) => item.id) || [],
    products: data?.favoriteProducts || [],
    moods: data?.favoriteMoods || [],
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in to save favourites." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const type = body?.type;
  const id = typeof body?.id === "string" ? body.id : "";

  if (!id || (type !== "product" && type !== "mood")) {
    return NextResponse.json({ error: "A valid favourite type and id are required." }, { status: 400 });
  }

  if (type === "product") {
    const product = await prisma.product.findFirst({ where: { id, status: "ACTIVE" }, select: { id: true } });
    if (!product) return NextResponse.json({ error: "Candle not found." }, { status: 404 });

    await prisma.user.update({
      where: { id: user.id },
      data: { favoriteProducts: { connect: { id } } },
    });
  } else {
    const mood = await prisma.mood.findFirst({ where: { id, isActive: true }, select: { id: true } });
    if (!mood) return NextResponse.json({ error: "Mood not found." }, { status: 404 });

    await prisma.user.update({
      where: { id: user.id },
      data: { favoriteMoods: { connect: { id } } },
    });
  }

  return NextResponse.json({ saved: true, type, id });
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in to manage favourites." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const type = body?.type;
  const id = typeof body?.id === "string" ? body.id : "";

  if (!id || (type !== "product" && type !== "mood")) {
    return NextResponse.json({ error: "A valid favourite type and id are required." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: type === "product"
      ? { favoriteProducts: { disconnect: { id } } }
      : { favoriteMoods: { disconnect: { id } } },
  });

  return NextResponse.json({ saved: false, type, id });
}
