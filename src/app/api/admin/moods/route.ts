import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function slugify(value:string){return value.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}

export async function GET(){
  try { await requireAdmin(); return NextResponse.json({moods:await prisma.mood.findMany({orderBy:[{sortOrder:"asc"},{name:"asc"}],include:{_count:{select:{products:true}}})}); }
  catch { return NextResponse.json({error:"Unauthorized"},{status:401}); }
}
export async function POST(request:Request){
  try{
    await requireAdmin(); const b=await request.json(); const name=String(b.name||"").trim();
    if(!name) return NextResponse.json({error:"Mood name is required."},{status:400});
    const mood=await prisma.mood.create({data:{name,slug:slugify(name),sortOrder:Number(b.sortOrder||0),isActive:b.isActive!==false}});
    return NextResponse.json({mood});
  }catch{ return NextResponse.json({error:"Unable to create mood."},{status:500});}
}
export async function PUT(request:Request){
  try{
    await requireAdmin(); const b=await request.json(); const name=String(b.name||"").trim();
    if(!b.id||!name) return NextResponse.json({error:"Mood id and name are required."},{status:400});
    const mood=await prisma.mood.update({where:{id:b.id},data:{name,slug:slugify(name),sortOrder:Number(b.sortOrder||0),isActive:b.isActive!==false}});
    await prisma.product.updateMany({where:{moodId:mood.id},data:{mood:name}});
    return NextResponse.json({mood});
  }catch{ return NextResponse.json({error:"Unable to update mood."},{status:500});}
}
export async function DELETE(request:Request){
  try{ await requireAdmin(); const {id}=await request.json(); if(!id) return NextResponse.json({error:"Mood id is required."},{status:400}); await prisma.mood.delete({where:{id}}); return NextResponse.json({ok:true});}
  catch{return NextResponse.json({error:"Unable to delete mood."},{status:500});}
}
