import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const contentLayouts = ["AUTO","CINEMATIC","SPLIT_LEFT","SPLIT_RIGHT","STATEMENT","COLLAGE","FULL_BLEED","PRODUCT_SHOWCASE","QUOTE","FLOATING_CARD","MINIMAL"];
const contentFields = ["title","eyebrow","body","imageUrl","imageAlt","buttonText","buttonUrl","sortOrder","isActive","layout"];
const collectionFields = ["slug","title","subtitle","imageUrl","imageAlt","mood","sortOrder","isActive"];
const socialFields = ["platform","label","url","isActive","sortOrder"];

function pick(body:any, fields:string[]) {
  return Object.fromEntries(fields.filter((key) => key in body).map((key) => [key, body[key]]));
}

export async function GET() {
  try {
    await requireAdmin();
    const [content, collections, socials] = await Promise.all([
      prisma.siteContent.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.collection.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);
    return NextResponse.json({ content, collections, socials });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request:Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { kind } = body;

    if (kind === "content") {
      if (!body.key || !body.type) return NextResponse.json({ error: "Content key and type are required." }, { status: 400 });
      if (body.layout && !contentLayouts.includes(body.layout)) return NextResponse.json({ error: "Invalid section style." }, { status: 400 });
      const result = await prisma.siteContent.create({
        data: { key: body.key, type: body.type, ...pick(body, contentFields) },
      });
      return NextResponse.json({ result });
    }

    if (kind === "collection") {
      if (!body.slug || !body.title) return NextResponse.json({ error: "Collection slug and title are required." }, { status: 400 });
      const result = await prisma.collection.create({
        data: {
          slug: body.slug,
          title: body.title,
          imageUrl: body.imageUrl || "/hero.jpg",
          ...pick(body, collectionFields.filter((key) => !["slug","title","imageUrl"].includes(key))),
        },
      });
      return NextResponse.json({ result });
    }

    if (kind === "social") {
      if (!body.platform || !body.url) return NextResponse.json({ error: "Platform and URL are required." }, { status: 400 });
      const result = await prisma.socialLink.create({
        data: { platform: body.platform, url: body.url, ...pick(body, socialFields.filter((key) => !["platform","url"].includes(key))) },
      });
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: "Unknown content type" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Unable to create item. Check that unique fields are not already in use." }, { status: 500 });
  }
}

export async function PUT(request:Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { kind, id } = body;
    if (!id) return NextResponse.json({ error: "Missing item id." }, { status: 400 });
    if (kind === "content" && body.layout && !contentLayouts.includes(body.layout)) return NextResponse.json({ error: "Invalid section style." }, { status: 400 });

    let result;
    if (kind === "content") result = await prisma.siteContent.update({ where: { id }, data: pick(body, contentFields) });
    else if (kind === "collection") result = await prisma.collection.update({ where: { id }, data: pick(body, collectionFields) });
    else if (kind === "social") result = await prisma.socialLink.update({ where: { id }, data: pick(body, socialFields) });
    else return NextResponse.json({ error: "Unknown content type" }, { status: 400 });

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: "Unable to save item." }, { status: 500 });
  }
}

export async function DELETE(request:Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    if (!body.id || !body.kind) return NextResponse.json({ error: "Missing item id or type." }, { status: 400 });

    if (body.kind === "content") await prisma.siteContent.delete({ where: { id: body.id } });
    else if (body.kind === "collection") await prisma.collection.delete({ where: { id: body.id } });
    else if (body.kind === "social") await prisma.socialLink.delete({ where: { id: body.id } });
    else return NextResponse.json({ error: "Unknown content type" }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete item." }, { status: 500 });
  }
}
