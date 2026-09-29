import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const editable=["sku","slug","name","shortName","shortDescription","description","mood","category","status","priceUSD","currency","sizeLabel","waxType","wickType","burnTimeHours","scentFamily","scentIntensity","topNotes","middleNotes","baseNotes","ingredients","allergens","careInstructions","vesselMaterial","vesselColor","dimensions","netWeight","stock","featured","seoTitle","seoDescription"];

function productData(body:any){
  const data:any=Object.fromEntries(editable.filter(k=>k in body).map(k=>[k,body[k]]));
  if("priceUSD" in data) data.priceUSD=Number(data.priceUSD||0);
  if("burnTimeHours" in data) data.burnTimeHours=data.burnTimeHours?Number(data.burnTimeHours):null;
  if("stock" in data) data.stock=Number(data.stock||0);
  if("featured" in data) data.featured=Boolean(data.featured);
  return data;
}

export async function GET(){
  try { await requireAdmin(); return NextResponse.json({products:await prisma.product.findMany({include:{images:true,variants:true},orderBy:{updatedAt:"desc"}})}); }
  catch { return NextResponse.json({error:"Unauthorized"},{status:401}); }
}

export async function POST(request:Request){
  try {
    await requireAdmin();
    const b=await request.json();
    if(!b.name||!b.sku||!b.slug||!b.description||!b.mood) return NextResponse.json({error:"Name, SKU, slug, description and mood are required."},{status:400});
    const product=await prisma.product.create({
      data:{
        ...productData(b),
        images:{create:(b.images||[]).filter(Boolean).map((url:string,i:number)=>({url,alt:b.name,sortOrder:i,isPrimary:i===0}))}
      },
      include:{images:true,variants:true}
    });
    return NextResponse.json({product});
  } catch { return NextResponse.json({error:"Unable to create product."},{status:500}); }
}

export async function PUT(request:Request){
  try {
    await requireAdmin();
    const b=await request.json();
    const product=await prisma.product.update({where:{id:b.id},data:productData(b)});
    if(Array.isArray(b.images)){
      await prisma.productImage.deleteMany({where:{productId:b.id}});
      await prisma.productImage.createMany({data:b.images.filter(Boolean).map((url:string,i:number)=>({productId:b.id,url,alt:product.name,sortOrder:i,isPrimary:i===0}))});
    }
    return NextResponse.json({product});
  } catch { return NextResponse.json({error:"Unable to update product."},{status:500}); }
}

export async function DELETE(request:Request){
  try { await requireAdmin(); const {id}=await request.json(); await prisma.product.delete({where:{id}}); return NextResponse.json({ok:true}); }
  catch { return NextResponse.json({error:"Unable to delete product."},{status:500}); }
}
