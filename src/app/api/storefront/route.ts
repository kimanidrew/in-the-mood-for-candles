import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [products,collections,content,socials]=await Promise.all([
    prisma.product.findMany({where:{status:"ACTIVE"},include:{images:{orderBy:{sortOrder:"asc"}}},orderBy:{createdAt:"desc"}}),
    prisma.collection.findMany({where:{isActive:true},orderBy:{sortOrder:"asc"}}),
    prisma.siteContent.findMany({where:{isActive:true},orderBy:{sortOrder:"asc"}}),
    prisma.socialLink.findMany({where:{isActive:true},orderBy:{sortOrder:"asc"}}),
  ]);
  return NextResponse.json({products,collections,content,socials});
}
