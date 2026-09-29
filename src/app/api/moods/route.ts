import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(){
  const moods=await prisma.mood.findMany({where:{isActive:true},orderBy:[{sortOrder:"asc"},{name:"asc"}]});
  return NextResponse.json({moods});
}
