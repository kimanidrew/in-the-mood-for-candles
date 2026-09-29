import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const user=await prisma.user.findUnique({where:{email:String(email||"").trim().toLowerCase()}});
    if(!user || user.passwordHash!==hashPassword(String(password||""))) return NextResponse.json({error:"Invalid email or password."},{status:401});
    const response=NextResponse.json({user:{id:user.id,name:user.name,email:user.email,role:user.role}});
    response.cookies.set(COOKIE,user.id,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*30});
    return response;
  } catch { return NextResponse.json({error:"Unable to sign in."},{status:500}); }
}
