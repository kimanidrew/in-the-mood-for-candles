import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(){try{await requireAdmin(); return NextResponse.json({content:await prisma.siteContent.findMany({orderBy:{sortOrder:"asc"}}),collections:await prisma.collection.findMany({orderBy:{sortOrder:"asc"}}),socials:await prisma.socialLink.findMany({orderBy:{sortOrder:"asc"}})});}catch{return NextResponse.json({error:"Unauthorized"},{status:401});}}

export async function PUT(request:Request){try{await requireAdmin(); const body=await request.json(); const {kind,id,...data}=body; let result;
 if(kind==="content") result=await prisma.siteContent.update({where:{id},data});
 else if(kind==="collection") result=await prisma.collection.update({where:{id},data});
 else if(kind==="social") result=await prisma.socialLink.update({where:{id},data});
 else return NextResponse.json({error:"Unknown content type"},{status:400});
 return NextResponse.json({result});}catch{return NextResponse.json({error:"Unable to save content."},{status:500});}}
