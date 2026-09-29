import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(){
  try {
    await requireAdmin();
    const [content,collections,socials]=await Promise.all([
      prisma.siteContent.findMany({orderBy:{sortOrder:"asc"}}),
      prisma.collection.findMany({orderBy:{sortOrder:"asc"}}),
      prisma.socialLink.findMany({orderBy:{sortOrder:"asc"}}),
    ]);
    return NextResponse.json({content,collections,socials});
  } catch { return NextResponse.json({error:"Unauthorized"},{status:401}); }
}

export async function PUT(request:Request){
  try {
    await requireAdmin();
    const body=await request.json();
    const {kind,id}=body;
    let result;
    if(kind==="content"){
      const allowed=["title","eyebrow","body","imageUrl","imageAlt","buttonText","buttonUrl","sortOrder","isActive"];
      const data=Object.fromEntries(allowed.filter(k=>k in body).map(k=>[k,body[k]]));
      result=await prisma.siteContent.update({where:{id},data});
    } else if(kind==="collection"){
      const allowed=["slug","title","subtitle","imageUrl","imageAlt","mood","sortOrder","isActive"];
      const data=Object.fromEntries(allowed.filter(k=>k in body).map(k=>[k,body[k]]));
      result=await prisma.collection.update({where:{id},data});
    } else if(kind==="social"){
      const allowed=["platform","label","url","isActive","sortOrder"];
      const data=Object.fromEntries(allowed.filter(k=>k in body).map(k=>[k,body[k]]));
      result=await prisma.socialLink.update({where:{id},data});
    } else {
      return NextResponse.json({error:"Unknown content type"},{status:400});
    }
    return NextResponse.json({result});
  } catch { return NextResponse.json({error:"Unable to save content."},{status:500}); }
}
