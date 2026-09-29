import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getSessionUser, verifyPassword, hashPassword, COOKIE, createSessionValue } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });

    const body = await request.json();
    const name = String(body.name ?? "").trim() || null;
    const email = String(body.email ?? "").trim().toLowerCase();
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const emailChanged = email !== user.email;
    const passwordChanged = Boolean(newPassword);

    if (emailChanged || passwordChanged) {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser || !verifyPassword(currentPassword, dbUser.passwordHash)) {
        return NextResponse.json({ error: "Enter your current password to change your email or password." }, { status: 400 });
      }
    }

    if (newPassword && newPassword.length < 8) {
      return NextResponse.json({ error: "Your new password must be at least 8 characters." }, { status: 400 });
    }

    if (emailChanged) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: "That email address is already in use." }, { status: 409 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
        ...(passwordChanged ? { passwordHash: hashPassword(newPassword, randomBytes(16).toString("hex")) } : {}),
      },
      select: { id:true,name:true,email:true,role:true },
    });

    const response = NextResponse.json({ user: updated });
    response.cookies.set(COOKIE, createSessionValue(updated.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
    return response;
  } catch (error:any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "That email address is already in use." }, { status: 409 });
    return NextResponse.json({ error: "Unable to save your account." }, { status: 500 });
  }
}
